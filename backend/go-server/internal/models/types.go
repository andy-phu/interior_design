package models

// Define shared data structures
type Embedding struct {
    ID   string `json:"id"`
    Description string `json:"description"`
}

type EmbeddingRequest struct {
	Inputs []string `json:"inputs"`
}

