package controller

import (
	"net/http"
	"github.com/gin-gonic/gin"
)



// Get all furniture
func Startup(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Welcome to the Interior Design API!"})
}

