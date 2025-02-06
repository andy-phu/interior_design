package controller

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"server/internal/setup"
	"github.com/gin-gonic/gin"
	"sync"
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

func SumVectors(vectorArray [][]float32) []float32 {
	//sum up the vectors using goroutines 

	//this vector is an array that contains the final floats to be the sum 
	sumVector := make([]float32, len(vectorArray[0]))

	//wait group determines that we should wait for all go routines to finish before returning
	var wg sync.WaitGroup
	//mutex lock/unlock
	var mu sync.Mutex


	for _, vector := range vectorArray{
		//keeps track of how many goroutines we have to wait for 
		wg.Add(1)

		//create a go routine to add one vector into the sumVector
		go func(vector []float32) {

			defer wg.Done()
			//lock the sumVector adding while a go routine is adding so that others' aren't adding a the same time 
			mu.Lock()
			for i, v := range vector {
				sumVector[i] += float32(v) 
			}

			mu.Unlock()

		}(vector)//immediately invokes the go routine and passes the vector in

		wg.Wait()
		
	}
	return sumVector
}







// retrive all the user's like furnitures and return the average vector
// have to query the user table for all product ids that are associated with user
// grab their vectors from pinecone based on prod id
func CalculateAverageVector(user_id int)([]float32) {

	productArray, err := setup.RetrieveUserProducts(user_id)
	if err != nil {
		log.Fatalf("Failed to retrieve user products: %v", err)
	}
	fmt.Println("These are the products that the user is interested in: ", productArray)


	//2d array containing arrays of float32
	vectorArray := setup.RetrieveVectors(productArray);
	// fmt.Println(vectorArray)

	//sum up the vectors using goroutines 
	sumVector := SumVectors(vectorArray)

	//get the average vector
	averageVector := make([]float32, len(sumVector))
	//iterate through each index and divide by the number of vectors 
	for i, v := range sumVector {
		averageVector[i] = v / float32(len(vectorArray))
	}

	return averageVector
}
