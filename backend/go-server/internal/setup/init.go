package setup

import (
	"fmt"
	"log"
	"server/internal/setup/embeddings"
	"github.com/joho/godotenv"
	"github.com/jackc/pgx/v5"
	"github.com/pinecone-io/go-pinecone/v2/pinecone"
)

var PC *pinecone.Client
var SC *pgx.Conn

func Init() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Initialize Pinecone Client
	PC, err = embeddings.PineconeClient()
	if err != nil {
		log.Fatalf("Error initializing Pinecone client: %v", err)
	}
	fmt.Println("Pinecone client initialized successfully:", PC)

	// Initialize Supabase Client
	SC, err = embeddings.DBClient()
	if err != nil {
		log.Fatalf("Error initializing Supabase client: %v", err)
	}
	fmt.Println("Supabase client initialized successfully")
}