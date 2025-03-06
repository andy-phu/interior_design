package controller

import (
	"fmt"
	"net/http"
	"server/internal/services"
	"server/internal/setup"

	"github.com/gin-gonic/gin"
)

// takes in user id and their filters that they chose
func GetSimilarFurniture(c *gin.Context) {
	userId := c.Param("id")
	
	filters := c.QueryArray("filter")
	fmt.Println("these are the filters selected:", filters)
	
	//check if the user has liked any products or if they are new
	//if they are then just give them the same liked products as someone in the db to match the trend 
	newFlag := services.CheckIfUserLikedAnything(userId)
	if newFlag != "0" {
		userId = newFlag
	}



	likedProducts, err := setup.RetrieveUserProducts(userId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user products"})
		return
	}

	//get the average for the user
	avgVector := services.CalculateAverageVector(userId)
	// fmt.Println("this is the average vector: ", avgVector)

	//get the similar products based on the filters and the average vector
	//the filters will be passed into the function as an array but gets converted to the metadata model struct
	similarProductIds := services.RetrieveSimiliarProductIds(avgVector, likedProducts, filters)
	fmt.Println("these are the similar product ids: ", similarProductIds)

	similarProductInfo := setup.RetrieveMultipleProductInfo(similarProductIds)
	// fmt.Println("products", similarProductInfo)
	c.JSON(http.StatusOK, gin.H{"message": "Retrieved similar products", "products": similarProductInfo})

}
