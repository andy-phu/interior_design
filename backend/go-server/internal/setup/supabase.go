package setup

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

// ConnectSupabase establishes a connection to the Supabase database
func ConnectSupabase() (*pgx.Conn, error) {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ Warning: Could not load .env file (might be using cloud env variables)")
	}

	dbURL := os.Getenv("SUPABASE")
	if dbURL == "" {
		log.Fatal("❌ SUPABASE_DB_URL is not set in environment variables")
	}

	// Connect to Supabase
	conn, err := pgx.Connect(context.Background(), dbURL)
	if err != nil {
		return nil, fmt.Errorf("❌ Unable to connect to Supabase: %v", err)
	}

	return conn, nil
}

// RetrieveUserProducts fetches product IDs associated with a user from Supabase
func RetrieveUserProducts(userID int) ([]string, error) {
	sc, err := ConnectSupabase()
	if err != nil {
		fmt.Println("❌ Failed to connect to Supabase:", err)
		return nil, err
	}
	defer sc.Close(context.Background()) // Always close DB connection

	var productIdArray []string

	rows, err := sc.Query(context.Background(), `SELECT product_id FROM "User" WHERE user_id = $1`, userID)
	if err != nil {
		fmt.Println("❌ Error querying database:", err)
		return nil, err
	}
	defer rows.Close() // Always close rows

	for rows.Next() {
		var productID int
		err := rows.Scan(&productID)
		if err != nil {
			fmt.Println("❌ Error scanning row:", err)
			continue
		}
		productIdArray = append(productIdArray, strconv.Itoa(productID))
	}

	return productIdArray, nil
}