package main

import (
	// "fmt"
	"log"

	// "github.com/joho/godotenv"
	// "server/internal/setup"

	"server/internal/api"

	"github.com/gin-gonic/gin"

	// "server/internal/setup/embeddings"

	// "server/internal/controller"
	// "server/internal/models"
	// "server/internal/utils"

)

func main() {
	// Uncomment only to readd vectors in pinecone
	// setup.Init()
	// embeddings.MetadataEmbeddings(setup.SC, setup.PC)
	//==================================================

	//user1 supposed to retrieve product id 272 and 600
	// avgVector := controller.CalculateAverageVector(1)
	// formattedVector := utils.FormatVectorValues(avgVector)


	// fmt.Println("this is the average vector: ", formattedVector)


	// metadata :=  models.Metadata{
	// 	Category: "Dining",
	// 	Material: "Wood and Metal",
	// 	Style: "Farmhouse",
	// 	ProductType: "Bar Stool",
	// };
	
	// likedProdIds := []string{"272", "600"}

	// similarProducts := setup.RetrieveSimilarProducts(avgVector, likedProdIds, metadata)
	// fmt.Println("These are the similar products: ",similarProducts)


	r := gin.Default()
	api.RegisterRoutes(r)

	log.Println("Server running on port 8080...")
	r.Run(":8080")

}
