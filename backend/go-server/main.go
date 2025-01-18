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


	//initialize pinecone client 
    pc, err := embeddings.PineconeClient()
    if err != nil {
        log.Fatalf("Error initializing Pinecone client: %v", err)
    }

    fmt.Println("Pinecone client initialized successfully:", pc)

	//access supabase 
	sc, err := embeddings.DBClient()
	if err != nil {		
		log.Fatalf("Error initializing Supabase client: %v", err)
	}

	fmt.Println("Supabase client initialized successfully")

	embeddings, err := embeddings.DescriptionEmbedding(sc, pc)

	fmt.Println("Embeddings:", embeddings)


}