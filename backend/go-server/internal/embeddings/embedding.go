package embeddings

import (
    // "context"
    "log"
	"fmt"
    "github.com/pinecone-io/go-pinecone/v2/pinecone"
	"os"
)

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