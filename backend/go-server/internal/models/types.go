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

