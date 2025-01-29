package setup


import (
	"os"
	"context"
	"github.com/jackc/pgx/v5"
	"log"
	"fmt"
	"github.com/joho/godotenv"
)	



func ConnectDB() (*pgx.Conn, error) {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ Warning: Could not load .env file (might be using cloud env variables)")
	}

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
