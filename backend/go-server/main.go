package main

import(
	"fmt"
    "log"
	// "github.com/joho/godotenv"
	// "server/internal/setup"

	"server/internal/api"
	"github.com/gin-gonic/gin"
	// "server/internal/setup"
	"server/internal/controller"
)

func main() {

	// setup.Init()
	// Uncomment only to reinitialize the databases 

	//user1 supposed to retrieve product id 272 and 600
	avgVector := controller.CalculateAverageVector(1)
	fmt.Println("this is the average vector: ", avgVector)

	r := gin.Default()
	api.RegisterRoutes(r)

	log.Println("Server running on port 8080...")
	r.Run(":8080") 



}