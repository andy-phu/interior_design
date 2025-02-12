package setup

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"server/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
	"github.com/pinecone-io/go-pinecone/v2/pinecone"
	"google.golang.org/protobuf/types/known/structpb"
	// "server/internal/utils"
)

// pinecone respoonse structs
type Vector struct {
	Id string `json:"id"`
}

type Match struct {
	Vector Vector  `json:"vector"`
	Score  float32 `json:"score"`
}

type Response struct {
	Matches []Match `json:"matches"`
	Usage   struct {
		ReadUnits int `json:"read_units"`
	} `json:"usage"`
}

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

func DynamicMetadataMap(likedProducts []interface{}, metadata models.Metadata) map[string]interface{} {
	filter := make(map[string]interface{})

	//preadds the likedProducts to the filter
	filter["id"] = map[string]interface{}{
		"$nin": likedProducts, 
	}

	if metadata.Category != "none" {
		filter["category"] = map[string]interface{}{
			"$eq": metadata.Category,
		}
	}
	if metadata.Material != "none" {
		filter["material"] = map[string]interface{}{
			"$eq": metadata.Material,
		}
	}
	if metadata.Style != "none" {
		filter["style"] = map[string]interface{}{
			"$eq": metadata.Style,
		}
	}
	if metadata.ProductType != "none" {
		filter["product_type"] = map[string]interface{}{
			"$eq": metadata.ProductType,
		}
	}

	// Return nil if no filters were added
	if len(filter) == 0 {
		fmt.Println("No filters were chosen")
		return nil
	}


	return filter
}





// returns the productr id of the similar vectors
func RetrieveSimilarProducts(queryVector []float32, likedProducts []string, filter []string) []string {

	// Convert `[]string` to `[]interface{}` for Protobuf compatibility
	likedProductsInterface := make([]interface{}, len(likedProducts))
	for i, v := range likedProducts {
		likedProductsInterface[i] = v
	}

	//convert the filter into a metadata model struct but some of the fields can be empty 
	metadata := models.Metadata{
		Category: filter[0],
		Material: filter[1],
		Style: filter[2],
		ProductType: filter[3],
	}

	//
	metadataMap := DynamicMetadataMap(likedProductsInterface, metadata)

	fmt.Println("metadata", metadataMap)

	//have to figure out a way to make this dynamic based on what filter the user chooses
	// metadataMap := map[string]interface{}{
	// 	//exclude the liked products
	// 	"id": map[string]interface{}{
	// 		"$nin": likedProductsInterface, 
	// 	},
	// 	"category": map[string]interface{}{
	// 		"$eq": metadata.Category, 
	// 	},
	// 	"material": map[string]interface{}{
	// 		"$eq": metadata.Material, 
	// 	},
	// 	"productType": map[string]interface{}{
	// 		"$eq": metadata.ProductType, 
	// 	},
	// 	"style": map[string]interface{}{
	// 		"$eq": metadata.Style, 
	// 	},
	// }

	metadataFilter, err := structpb.NewStruct(metadataMap)

	if err != nil {
        log.Fatalf("Failed to create metadata map: %v", err)
    }

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

	res, err := idxConnection.QueryByVectorValues(ctx, &pinecone.QueryByVectorValuesRequest{
		Vector: queryVector,
		TopK:   20,
		MetadataFilter: metadataFilter,
	})

	if err != nil {
		log.Fatalf("Failed to query vectors: %v", err)
	}

	if err != nil {
		log.Fatalf("Failed to serialize response: %v", err)
	}

	//convert it to json first so that you can convert it to go object
	jsonRes, _ := json.Marshal(res)
	var response Response
	err = json.Unmarshal(jsonRes, &response)

	if err != nil {
		log.Fatalf("Failed to unmarshal response: %v", err)
	}

	var productIdArray []string

	for _, match := range response.Matches {

		vector := match.Vector
		// fmt.Println("this is the vector struct", match)
		productIdArray = append(productIdArray, vector.Id)
	}

	// fmt.Println("These are the similar products: ", productIdArray)
	return productIdArray

}
