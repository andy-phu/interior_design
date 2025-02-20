package controller

import (
	"fmt"
	"net/http"
	"server/internal/services"
	"server/internal/setup"
	"strconv"

	"github.com/gin-gonic/gin"
)

// takes in user id and their filters that they chose
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
	avgVector := services.CalculateAverageVector(userId)
	// fmt.Println("this is the average vector: ", avgVector)

	//get the similar products based on the filters and the average vector
	//the filters will be passed into the function as an array but gets converted to the metadata model struct
	similarProductIds := services.RetrieveSimiliarProductIds(avgVector, likedProducts, filters)

	similarProductInfo := services.RetrieveSimilarProductInfo(similarProductIds)
	
	c.JSON(http.StatusOK, gin.H{"message": "Retrieved similar products", "products": similarProductInfo})

}
