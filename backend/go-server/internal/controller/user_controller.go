package controller 


import (
	"net/http"
	"github.com/gin-gonic/gin"
	"server/internal/setup"
	"context"
	"fmt"
	"log"
)




func GetAllUsers(c *gin.Context) {
	sc, err := setup.ConnectDB()

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

	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Error: %v", err.Error()),
		})
		return
	}else{
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
// func StoreLike(c *gin.Context) {
// 	user_id := c.Param("user_id")



// 	c.JSON(http.StatusOK, gin.H{"message": "Welcome to the Interior Design API!"})
// }




