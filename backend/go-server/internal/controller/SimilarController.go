package controller

import (
	"fmt"
	"log"
	"net/http"
	"server/internal/setup"
	"strconv"
	"sync"

	"github.com/gin-gonic/gin"
)



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


//takes in user id and their filters that they chose 
func GetSimilarFurniture(c *gin.Context) {
	userId, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Was not able to convert user id to an int"})
		return
	}
	filters := c.QueryArray("filter")
	fmt.Println("these are the filters selected:", filters)
	likedProducts, err := setup.RetrieveUserProducts(userId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user products"})
		return 
	}


	//get the average for the user 
	avgVector := CalculateAverageVector(userId)
	fmt.Println("this is the average vector: ", avgVector)

	//get the similar products based on the filters and the average vector 
	//the filters will be passed into the function as an array but gets converted to the metadata model struct
	similarProducts := setup.RetrieveSimilarProducts(avgVector, likedProducts, filters)
	c.JSON(http.StatusOK, gin.H{"message": "Retrieved similar products", "products": similarProducts})

}
