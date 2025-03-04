package services

import (
	"context"
	"errors"
	"fmt"
	"server/internal/setup"
	"strings"
)

// GetAllUsersService retrieves all users and their liked products
func GetAllUsersService() ([]map[string]int, error) {
	sc, err := setup.ConnectSupabase()
	if err != nil {
		return nil, errors.New("failed to connect to Supabase")
	}

	rows, err := sc.Query(context.Background(), `SELECT user_id, product_id FROM "User"`)
	if err != nil {
		return nil, fmt.Errorf("query error: %v", err)
	}
	defer rows.Close()

	var users []map[string]int
	for rows.Next() {
		var userID, productID int
		if err := rows.Scan(&userID, &productID); err != nil {
			return nil, fmt.Errorf("error scanning row: %v", err)
		}

		users = append(users, map[string]int{
			"user_id":    userID,
			"product_id": productID,
		})
	}

	return users, nil
}

// StoreLikeService inserts a like entry into the database
func StoreLikeService(userID, productID int) (string, error) {
	sc, err := setup.ConnectSupabase()
	if err != nil {
		return "", errors.New("failed to connect to Supabase")
	}

	// Check if the user already exists
	rows, err := sc.Query(context.Background(), `SELECT user_id FROM "User" WHERE user_id = $1`, userID)
	if err != nil {
		return "", fmt.Errorf("query error: %v", err)
	}
	defer rows.Close()

	if rows.Next() {
		return fmt.Sprintf("User %d already exists", userID), nil
	}

	// Insert user like
	var retUserID, retProductID int
	insertQuery := `INSERT INTO "User" ("user_id", "product_id") VALUES ($1, $2) RETURNING "user_id", "product_id"`
	err = sc.QueryRow(context.Background(), insertQuery, userID, productID).Scan(&retUserID, &retProductID)
	if err != nil {
		return "", fmt.Errorf("insertion error: %v", err)
	}

	return fmt.Sprintf("User %d liked product %d", retUserID, retProductID), nil
}


func StoreMultipleLikesService(userID int, productIDs []int) (string, error) {
	sc, err := setup.ConnectSupabase()
	if err != nil {
		return "", errors.New("failed to connect to Supabase")
	}

	//create the format for a bulk insert 
	//tuple ('user_id', 'product_id')
	tupleArray := make([]string, len(productIDs))
	for i := 0; i < len(productIDs); i++{
		tupleArray[i] = fmt.Sprintf("(%d, %d)", userID, productIDs[i])
	}


	query := fmt.Sprintf(`INSERT INTO "User" (user_id, product_id) VALUES %s`, strings.Join(tupleArray, ","))

	_, err = sc.Exec(context.Background(), query)
	if err != nil {
		fmt.Println("❌ Error querying database:", query)
		return "", fmt.Errorf("insertion error: %v", err)
	}

	return fmt.Sprintf("User %d liked product %d", userID, productIDs), nil
}