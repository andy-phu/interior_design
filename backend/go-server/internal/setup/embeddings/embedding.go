package embeddings

import (
    "context"
	"io/ioutil"
    "log"
	"fmt"
    "github.com/pinecone-io/go-pinecone/v2/pinecone"
	"os"
	"github.com/jackc/pgx/v5"
	"server/internal/models"
	"encoding/json"
	"net/http"
	"bytes"
	"google.golang.org/protobuf/types/known/structpb"
)

type Data struct {
    ID   string
    Text string
	Category string 
	Material string
	Style string 
	ProductType string 
}

func PineconeClient()(*pinecone.Client, error) {
    // ctx := context.Background()

	pincecone := os.Getenv("PINECONE")
	fmt.Println(pincecone)

    pc, err := pinecone.NewClient(pinecone.NewClientParams{
        ApiKey: pincecone,
    })


    if err != nil {
        log.Fatalf("Failed to create Client: %v", err)
		return nil, err
	}else{
		return pc, nil
	}
}



func DBClient()(*pgx.Conn, error) {
	db_url := os.Getenv("SUPABASE")
	if db_url == "" {
        log.Fatal("SUPABASE_DB_URL is not set in environment variables")
    }

	//connectsto supabase
	conn, err := pgx.Connect(context.Background(), db_url)
    if err != nil {
        return nil, fmt.Errorf("unable to connect to Supabase: %v", err)
    }

    return conn, nil
}


//uses hugging face model to embed text string 
func GenerateEmbeddings(texts []string) ([][]float64, error) {
	api_url := "https://api-inference.huggingface.co/models/BAAI/bge-large-en-v1.5"
	api_key := os.Getenv("HUGGINGFACE")
	// Convert input into JSON format required by Hugging Face
	payload := models.EmbeddingRequest{Inputs: texts}
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %v", err)
	}


	// Create HTTP request
	req, err := http.NewRequest("POST", api_url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Set API Key and Headers
	req.Header.Set("Authorization", "Bearer "+api_key)
	req.Header.Set("Content-Type", "application/json")

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}


	// Parse JSON response
	var embeddingResp[][]float64

	err = json.Unmarshal(body, &embeddingResp)
	if err != nil {
		return nil, fmt.Errorf("failed to parse response: %v", err)
	}

	fmt.Println("embedding response: ", embeddingResp)
	return embeddingResp, nil
}

func convertToFloat32(arr []float64) []float32 {
	float32Arr := make([]float32, len(arr)) // Create a slice of float32 with the same length
	for i, val := range arr {
		float32Arr[i] = float32(val) // Convert each value from float64 to float32
	}
	return float32Arr
}

func MetadataEmbeddings(sc *pgx.Conn, pc *pinecone.Client)(string, error) {
	ctx := context.Background()

	idx_model, err := pc.DescribeIndex(ctx, "interior-design")
	
	idx_connection, err := pc.Index(pinecone.NewIndexConnParams{Host: idx_model.Host, Namespace: "ns1"})

	if err != nil {
		log.Fatalf("Failed to create IndexConnection1 for Host %v: %v", idx_model.Host, err)
	}

	rows, err := sc.Query(context.Background(), `SELECT id, description, category, material, style, product_type FROM "Product"`)
	data := []models.Embedding{}

	var texts []string

	if err != nil {
        log.Fatalf("Query failed: %v", err)
    }
    defer rows.Close() // Close rows iterator

    for rows.Next() {
        var id string
        var description string
		var category string 
		var material string 
		var style string 
		var productType string 

        err := rows.Scan(&id, &description, &category, &material, &style, &productType)
        if err != nil {
            log.Fatalf("Error scanning row: %v", err)
        }
		data = append(data, models.Embedding{
			ID:          id,
			Description: description,
			Category: category,
			Material: material,
			Style: style,
			ProductType: productType,
		})

		//only need to embed the description to create the vector value 
		texts = append(texts, description) // Collect text for embedding

    }

	embeddings, err := GenerateEmbeddings(texts)
	if err != nil {
		log.Fatalf("Failed to embed documents: %v", err)
	}
	
	vectors := []*pinecone.Vector{}



	for i, emb := range embeddings {
		metadata_map := map[string]interface{}{
			"id": data[i].ID,
			"description": data[i].Description,
			"category": data[i].Category,
			"material": data[i].Material,
			"style": data[i].Style,
			"productType": data[i].ProductType,
		}
	
		metadata_struct, err := structpb.NewStruct(metadata_map)

		if err != nil {
			log.Fatalf("Failed to convert metadata: %v", err)
		}

		vectorData := pinecone.Vector{
			Id:       data[i].ID, 
			Values:   convertToFloat32(emb), 
			Metadata: metadata_struct,
		}

		vectors = append(vectors, &vectorData)
	}

	count, err := idx_connection.UpsertVectors(ctx, vectors)

	if err != nil {
		log.Fatalf("Failed to upsert vectors: %v", err)
	} else {
		fmt.Printf("Successfully upserted %d vector(s)!\n", count)
	}

	return "done", nil
}
