package controller

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"server/internal/setup"
	"github.com/gin-gonic/gin"
)

func GetAllUsers(c *gin.Context) {
	sc, err := setup.ConnectSupabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to Supabase"})
		return
	}

	if sc == nil {
		log.Fatalf("❌ Database connection is nil! Check `setup.ConnectDB()`")
	}
	rows, err := sc.Query(context.Background(), `SELECT user_id, product_id FROM "User"`)

	fmt.Println(err)

	defer rows.Close()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Error: %v", err.Error()),
		})
		return
	} else {
		fmt.Println("this is the rows:")
		for rows.Next() {
			var product_id int
			var user_id int
			err := rows.Scan(&user_id, &product_id)
			if err != nil {
				log.Fatalf("Error scanning row: %v", err)
			}
			fmt.Println("this is the user_id:", user_id)
			fmt.Println("this is the product_id:", product_id)

		}

		c.JSON(http.StatusOK, gin.H{"message": "Retrieved all the users"})
	}

}

func StoreLike(c *gin.Context) {
	user_id := c.Param("user_id")
	product_id := c.Param("product_id")

	sc, err := setup.ConnectSupabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to Supabase"})
		return
	}

	rows, err := sc.Query(context.Background(), `SELECT user_id FROM "User" WHERE user_id = $1`, user_id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Error: %v", err.Error()),
		})
		return
	}
	// Check if the user already exists
	if rows.Next() {
		c.JSON(http.StatusOK, gin.H{"message": "User already exists"})
		return
	}

	var ret_user_id int
	var ret_product_id int

	//inserts into supabase and returns the user id
	insert_query := `INSERT INTO "User" ("user_id", "product_id") VALUES ($1, $2) RETURNING "user_id", "product_id"`
	err = sc.QueryRow(context.Background(), insert_query, user_id, product_id).Scan(&ret_user_id, &ret_product_id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error: %v", err.Error())})
	}

	c.JSON(http.StatusOK, gin.H{"Success": fmt.Sprintf("User %d like %d", ret_user_id, ret_product_id)})
}
