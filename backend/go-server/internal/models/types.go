package models

// Define shared data structures
type Embedding struct {
    ID   string `json:"id"`
    Description string `json:"description"`
	Category string `json:"category"`
	Material string `json:"material"`
	Style string `json:"style"`
	ProductType string `json:"productType"`
}

type EmbeddingRequest struct {
	Inputs []string `json:"inputs"`
}

type Metadata struct{
	Category string
	Material string
	Style string
	ProductType string
}

type Vector struct {
	Id string `json:"id"`
}

type Match struct {
	Vector Vector  `json:"vector"`
	Score  float32 `json:"score"`
}

type Response struct {
	Matches []Match `json:"matches"`
	Usage   struct {
		ReadUnits int `json:"read_units"`
	} `json:"usage"`
}

type PineconeResponse struct {
	Vectors map[string]PineconeVector `json:"vectors"`
}

// PineconeVector represents a vector object from Pinecone
type PineconeVector struct {
	ID     string    `json:"id"`
	Values []float32 `json:"values"`
}

type LikeRequest struct {
	UserID    int `json:"userId"`
	ProductID int `json:"productId"`
}

type Product struct{
	ID string 
	Name string
	Image string
	Price string
	Category string 
	Brand string
	Material string 
	ProductLink string
	ProductType string
	Style string 
	Description string
}