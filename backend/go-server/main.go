package main

import(
	"fmt"
    "log"
	"server/internal/embeddings"
	"github.com/joho/godotenv"

)

func main() {

	err := godotenv.Load()
    if err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }


    fmt.Println("Go!")


    pc, err := embeddings.PineconeClient()
    if err != nil {
        log.Fatalf("Error initializing Pinecone client: %v", err)
    }

    fmt.Println("Pinecone client initialized successfully:", pc)

}