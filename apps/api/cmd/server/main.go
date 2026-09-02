package main

import (
	"log"
	"net/http"
	"os"

	"github.com/olaysco/akitekt/apps/api/internal/ai"
)

func main() {
	address := os.Getenv("AKITEKT_API_ADDR")
	if address == "" {
		address = ":8080"
	}

	provider, err := ai.NewOpenAIProviderFromEnv()
	if err != nil {
		log.Fatal(err)
	}

	server := &http.Server{
		Addr:    address,
		Handler: ai.NewHandler(provider),
	}

	log.Printf("Akitekt API listening on %s", address)
	log.Fatal(server.ListenAndServe())
}
