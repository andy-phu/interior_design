package api

import (
	"github.com/gin-gonic/gin"
	"server/internal/controller"
)

// RegisterRoutes sets up API routes
func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		startup := api.Group("/")
		{
			startup.GET("/", controller.Startup)
		}

		furniture := api.Group("/furniture")
		{
			furniture.GET("/", controller.GetAllFurniture)
		}

		users := api.Group("/users")
		{
			users.GET("/all", controller.GetAllUsers)
		}
		

	}
}