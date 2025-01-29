package main

import(
	// "fmt"
    "log"
	// "github.com/joho/godotenv"
	// "server/internal/setup"
	"server/internal/api"
	"github.com/gin-gonic/gin"
)

func main() {

	// setup.Init()
	// Uncomment only to reinitialize the databases 


	r := gin.Default()
	api.RegisterRoutes(r)

	log.Println("Server running on port 8080...")
	r.Run(":8080") 

}