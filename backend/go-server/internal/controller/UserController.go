package controller

import (
	"net/http"
	"server/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetAllUsers retrieves all users from the database
func GetAllUsers(c *gin.Context) {
	users, err := services.GetAllUsersService()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Retrieved all users",
		"users":   users,
	})
}

// StoreLike stores a user's liked product in the database
func StoreLike(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	productID, err := strconv.Atoi(c.Param("product_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID format"})
		return
	}

	message, err := services.StoreLikeService(userID, productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": message})
}