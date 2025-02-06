package main

import (
	"fmt"
	"log"

	// "github.com/joho/godotenv"
	"server/internal/setup"

	"server/internal/api"

	"github.com/gin-gonic/gin"

	// "server/internal/setup/embeddings"

	"server/internal/models"
	"server/internal/controller"
)

func main() {
	// Uncomment only to readd vectors in pinecone
	// setup.Init()
	// embeddings.MetadataEmbeddings(setup.SC, setup.PC)
	//==================================================

	//user1 supposed to retrieve product id 272 and 600
	avgVector := controller.CalculateAverageVector(1)
	// fmt.Println("this is the average vector: ", avgVector)
	metadata :=  models.Metadata{
		Category: "Dining",
		Material: "Wood and Metal",
		Style: "Farmhouse",
		ProductType: "Bar Stool",
	};
	
	likedProdIds := []string{"272", "600"}

	similarProducts := setup.RetrieveSimilarProducts(avgVector, likedProdIds, metadata)
	fmt.Println(similarProducts)

	r := gin.Default()
	api.RegisterRoutes(r)

	log.Println("Server running on port 8080...")
	r.Run(":8080")

}
