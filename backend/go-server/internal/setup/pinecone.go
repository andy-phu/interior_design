package setup

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"github.com/joho/godotenv"
	"github.com/pinecone-io/go-pinecone/v2/pinecone"
	"server/internal/models"
)

// PineconeResponse holds the response structure from Pinecone


// ConnectPinecone establishes a connection to Pinecone
func ConnectPinecone() (*pinecone.Client, error) {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ Warning: Could not load .env file (might be using cloud env variables)")
	}

	apiKey := os.Getenv("PINECONE")
	if apiKey == "" {
		log.Fatal("❌ PINECONE API key is not set in environment variables")
	}

	pc, err := pinecone.NewClient(pinecone.NewClientParams{ApiKey: apiKey})
	if err != nil {
		return nil, fmt.Errorf("❌ Failed to create Pinecone Client: %v", err)
	}

	return pc, nil
}

// RetrieveVectors fetches vectors for given product IDs from Pinecone
func RetrieveVectors(prodIdArray []string) ([][]float32, error) {
	ctx := context.Background()

	// Connect to Pinecone
	pc, err := ConnectPinecone()
	if err != nil {
		fmt.Println("❌ Failed to connect to Pinecone", err)
		return nil, err
	}

	// Describe index to get connection details
	idxModel, err := pc.DescribeIndex(ctx, "interior-design")
	if err != nil {
		return nil, fmt.Errorf("❌ Failed to describe index: %v", err)
	}

	idxConnection, err := pc.Index(pinecone.NewIndexConnParams{Host: idxModel.Host, Namespace: "ns1"})
	if err != nil {
		return nil, fmt.Errorf("❌ Failed to connect to Pinecone index: %v", err)
	}

	// Fetch vectors from Pinecone
	res, err := idxConnection.FetchVectors(ctx, prodIdArray)
	if err != nil {
		return nil, fmt.Errorf("❌ Failed to fetch vectors: %v", err)
	}

	// Parse JSON response
	jsonRes, err := json.Marshal(res)
	if err != nil {
		return nil, fmt.Errorf("❌ Failed to marshal response: %v", err)
	}

	var parsedResponse models.PineconeResponse
	err = json.Unmarshal(jsonRes, &parsedResponse)
	if err != nil {
		return nil, fmt.Errorf("❌ Failed to parse JSON: %v", err)
	}

	// Extract vectors from response
	var vectorArray [][]float32
	for _, vector := range parsedResponse.Vectors {
		vectorArray = append(vectorArray, vector.Values)
	}

	return vectorArray, nil
}