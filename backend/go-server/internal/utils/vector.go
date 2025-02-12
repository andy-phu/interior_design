package utils

import (
	"strings"
	"strconv"
	"sync"
)

// FormatVectorValues formats a slice of float64 values as a comma-separated string.
func FormatVectorValues(values []float32) string {
	var strValues []string
	for _, value := range values {
		strValues = append(strValues, strconv.FormatFloat(float64(value), 'f', -1, 32))
	}
	return strings.Join(strValues, ", ")
}

func SumVectors(vectorArray [][]float32) []float32 {
	//sum up the vectors using goroutines 

	//this vector is an array that contains the final floats to be the sum 
	sumVector := make([]float32, len(vectorArray[0]))

	//wait group determines that we should wait for all go routines to finish before returning
	var wg sync.WaitGroup
	//mutex lock/unlock
	var mu sync.Mutex


	for _, vector := range vectorArray{
		//keeps track of how many goroutines we have to wait for 
		wg.Add(1)

		//create a go routine to add one vector into the sumVector
		go func(vector []float32) {

			defer wg.Done()
			//lock the sumVector adding while a go routine is adding so that others' aren't adding a the same time 
			mu.Lock()
			for i, v := range vector {
				sumVector[i] += float32(v) 
			}

			mu.Unlock()

		}(vector)//immediately invokes the go routine and passes the vector in

		wg.Wait()
		
	}
	return sumVector
}