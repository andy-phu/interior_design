package utils

import (
	"strings"
	"strconv"
)

// FormatVectorValues formats a slice of float64 values as a comma-separated string.
func FormatVectorValues(values []float32) string {
	var strValues []string
	for _, value := range values {
		strValues = append(strValues, strconv.FormatFloat(float64(value), 'f', -1, 32))
	}
	return strings.Join(strValues, ", ")
}