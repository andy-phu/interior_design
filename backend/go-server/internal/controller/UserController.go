package controller

import (
	"net/http"
	"server/internal/services"
	"server/internal/models"
	"github.com/gin-gonic/gin"
	"fmt"
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
	var req models.LikeRequest

	// Bind JSON body to struct
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}
	fmt.Println(req.UserID, req.ProductID)
	message, err := services.StoreLikeService(req.UserID, req.ProductID)


	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": message})
}