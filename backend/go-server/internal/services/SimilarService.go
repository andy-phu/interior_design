package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"server/internal/models"
	"server/internal/setup"
	"server/internal/utils"
	"github.com/pinecone-io/go-pinecone/v2/pinecone"
	"google.golang.org/protobuf/types/known/structpb"
	"strconv"
)

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
func RetrieveSimiliarProductIds(queryVector []float32, likedProducts []string, filter []string) []int {
	// Convert `[]string` to `[]interface{}` for Protobuf compatibility
	likedProductsInterface := make([]interface{}, len(likedProducts))
	for i, v := range likedProducts {
		likedProductsInterface[i] = v
	}

	//convert the filter into a metadata model struct but some of the fields can be empty
	metadata := models.Metadata{
		Category:    filter[0],
		Material:    filter[1],
		Style:       filter[2],
		ProductType: filter[3],
	}

	//
	metadataMap := DynamicMetadataMap(likedProductsInterface, metadata)

	fmt.Println("metadata", metadataMap)

	//have to figure out a way to make this dynamic based on what filter the user chooses

	// }

	metadataFilter, err := structpb.NewStruct(metadataMap)

	if err != nil {
		log.Fatalf("Failed to create metadata map: %v", err)
	}

	ctx := context.Background()

	//query pinecone to get the vectors for the product id from supabase
	pc, err := setup.ConnectPinecone()
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
	fmt.Println("this is the meta data filter: ",	metadataFilter)
	res, err := idxConnection.QueryByVectorValues(ctx, &pinecone.QueryByVectorValuesRequest{
		Vector:         queryVector,
		TopK:           30,
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
	var response models.Response
	err = json.Unmarshal(jsonRes, &response)

	if err != nil {
		log.Fatalf("Failed to unmarshal response: %v", err)
	}

	var productIdArray []int

	for _, match := range response.Matches {

		vector := match.Vector
		// fmt.Println("this is the vector struct", match)
		intId, _ := strconv.Atoi(vector.Id)
		productIdArray = append(productIdArray, intId)
	}

	// fmt.Println("These are the similar products: ", productIdArray)

	return productIdArray
}

// retrive all the user's like furnitures and return the average vector
// have to query the user table for all product ids that are associated with user
// grab their vectors from pinecone based on prod id
func CalculateAverageVector(user_id string) []float32 {

	productArray, err := setup.RetrieveUserProducts(user_id)
	if err != nil {
		log.Fatalf("Failed to retrieve user products: %v", err)
	}
	
	//2d array containing arrays of float32, 
	//will get the vectors from pinecone based on the product ids that the user likes 
	vectorArray, err := setup.RetrieveVectors(productArray)
	if err != nil {
		log.Fatalf("Failed to retrieve vectors")
	}
	// fmt.Println(vectorArray)

	//sum up the vectors using goroutines

	sumVector := utils.SumVectors(vectorArray)

	//get the average vector
	averageVector := make([]float32, len(sumVector))

	//iterate through each index and divide by the number of vectors
	for i, v := range sumVector {
		averageVector[i] = v / float32(len(vectorArray))
	}

	return averageVector
}
