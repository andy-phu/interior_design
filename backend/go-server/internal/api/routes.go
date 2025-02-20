package api

import (
	"github.com/gin-gonic/gin"
	"server/internal/controller"
)


// RegisterRoutes sets up API routes
func RegisterRoutes(r *gin.Engine) {
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*") // Or set to your frontend domain
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	  
		if c.Request.Method == "OPTIONS" {
		  c.AbortWithStatus(204) // Handle preflight requests
		  return
		}
	  
		c.Next()
	})


	api := r.Group("/api")
	{
		startup := api.Group("/")
		{
			startup.GET("/", controller.Startup)
		}

		// furniture := api.Group("/furniture")
		// {
		// 	furniture.GET("/", controller.GetAllFurniture)
		// }

		users := api.Group("/users")
		{
			users.GET("/", controller.GetAllUsers)
			users.POST("/",controller.StoreLike)
		}

		similar := api.Group("/similar")
		{
			similar.GET("/:id", controller.GetSimilarFurniture)
		}



		

	}
}