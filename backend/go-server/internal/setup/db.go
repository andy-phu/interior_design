package setup

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
	"github.com/pinecone-io/go-pinecone/v2/pinecone"
	// "server/internal/utils"
)

// pinecone respoonse structs


type PineconeResponse struct {
	Vectors map[string]PineconeVector `json:"vectors"`
}

type PineconeVector struct {
	ID     string    `json:"id"`
	Values []float32 `json:"values"`
}

func ConnectSupabase() (*pgx.Conn, error) {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ Warning: Could not load .env file (might be using cloud env variables)")
	}

	db_url := os.Getenv("SUPABASE")
	if db_url == "" {
		log.Fatal("SUPABASE_DB_URL is not set in environment variables")
	}

	//connects to supabase
	conn, err := pgx.Connect(context.Background(), db_url)
	if err != nil {
		return nil, fmt.Errorf("unable to connect to Supabase: %v", err)
	}

	return conn, nil
}

func ConnectPinecone() (*pinecone.Client, error) {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ Warning: Could not load .env file (might be using cloud env variables)")
	}

	pincecone := os.Getenv("PINECONE")
	fmt.Println(pincecone)

	pc, err := pinecone.NewClient(pinecone.NewClientParams{
		ApiKey: pincecone,
	})

	if err != nil {
		log.Fatalf("Failed to create Client: %v", err)
		return nil, err
	} else {
		return pc, nil
	}
}

func RetrieveUserProducts(userId int) ([]string, error) {
	sc, err := ConnectSupabase()
	if err != nil {
		fmt.Println("Failed to connect to Supabase:", err)
		return nil, err
	}

	var productIdArray []string

	rows, err := sc.Query(context.Background(), `SELECT product_id FROM "User" WHERE user_id = $1`, userId)

	if err != nil {
		fmt.Println("Error querying database:", err)
	}

	for rows.Next() {
		var productId int
		err := rows.Scan(&productId)
		if err != nil {
			fmt.Println("Error scanning row:", err)
		}
		productIdStr := strconv.Itoa(productId)
		productIdArray = append(productIdArray, productIdStr)
	}

	defer rows.Close()

	return productIdArray, nil
}

func RetrieveVectors(prodIdArray []string) [][]float32 {
	ctx := context.Background()

	//query pinecone to get the vectors for the product id from supabase
	pc, err := ConnectPinecone()
	if err != nil {
		fmt.Println("Failed to connect to Pinecone", err)
		return nil
	}

	idxModel, err := pc.DescribeIndex(ctx, "interior-design")

	if err != nil {
		log.Fatalf("Failed to describe index: %v", err)
	}
	idxConnection, err := pc.Index(pinecone.NewIndexConnParams{Host: idxModel.Host, Namespace: "ns1"})

	if err != nil {
		log.Fatalf("Failed to describe index: %v", err)
	}

	res, err := idxConnection.FetchVectors(ctx, prodIdArray)

	if err != nil {
		log.Fatalf("Failed to fetch vectors: %v", err)
	}

	// query the json in res and put the values into a vector array and return
	jsonRes, err := json.Marshal(res)

	if err != nil {
		log.Fatalf("Failed to marshal response: %v", err)
	}

	// fmt.Println("✅ JSON Response:", string(jsonRes))

	// vectorArray := resArray[0].Values
	var parsedResponse PineconeResponse
	err = json.Unmarshal(jsonRes, &parsedResponse)
	if err != nil {
		log.Fatalf("❌ Failed to parse JSON: %v", err)
	}

	var vectorArray [][]float32

	//the parsed response will now be a a map called vectors where the map contains a key for each product id
	//each product id points to a PineconeVector object containing the same key and its value
	for _, vector := range parsedResponse.Vectors {
		// fmt.Println("Product ID:", productID)    // ✅ Extracted from the map key
		// var newVector = utils.FormatVectorValues(vector.Values)
		// fmt.Println("Vector Values:", newVector)
		vectorArray = append(vectorArray, vector.Values)
	}

	return vectorArray

}
