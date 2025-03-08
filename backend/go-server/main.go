package main

import (
	"fmt"
	"log"

	// "github.com/joho/godotenv"
	// "server/internal/setup"

	"server/internal/api"
	// "server/internal/services"
	"github.com/gin-gonic/gin"

	// "server/internal/setup/embeddings"
	// "server/internal/setup"
	// "server/internal/setup/embeddings"
	"server/internal/services"
	// "server/internal/models"
	"server/internal/utils"

)

func main() {
	// Reinitialize pinecone from the new supabase addons
	// SC, PC := setup.Init()
	// embeddings.MetadataEmbeddings(SC, PC)
	//==================================================

	// user1 supposed to retrieve product id 272 and 600
	avgVector := services.CalculateAverageVector("ef411a37-803c-4002-92e9-c880904f35af")
	formattedVector := utils.FormatVectorValues(avgVector)


	fmt.Println("this is the average vector: ", formattedVector)


	filter := []string{"none", "Fabric", "none", "none"}
	
	likedProdIds := []string{"1", "2"}

	similarProducts := services.RetrieveSimiliarProductIds(avgVector, likedProdIds, filter)
	fmt.Println("These are the similar products: ",similarProducts)



	r := gin.Default()
	api.RegisterRoutes(r)

	log.Println("Server running on port 8080...")
	r.Run(":8080")

}
