package main

import (
	"log"
	"net/http"
	"os"
	"time"

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

	webOrigin := os.Getenv("AKITEKT_WEB_ORIGIN")
	if webOrigin == "" {
		webOrigin = "http://localhost:5173"
	}

	server := &http.Server{
		Addr:              address,
		Handler:           ai.WithCORS(ai.NewHandler(provider), webOrigin),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	log.Printf("Akitekt API listening on %s", address)
	log.Fatal(server.ListenAndServe())
}
