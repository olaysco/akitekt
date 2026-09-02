package ai

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

const maxProposalRequestBytes = 1 << 20

func NewHandler(provider ArchitectureProposalProvider) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", handleHealth)
	mux.HandleFunc("POST /api/ai/architecture/proposals", handleProposal(provider))

	return mux
}

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func handleProposal(provider ArchitectureProposalProvider) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request ArchitectureProposalRequest
		r.Body = http.MaxBytesReader(w, r.Body, maxProposalRequestBytes)

		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			var maxBytesError *http.MaxBytesError
			if errors.As(err, &maxBytesError) {
				http.Error(w, "AI architecture request is too large.", http.StatusRequestEntityTooLarge)
				return
			}

			http.Error(w, "Invalid AI architecture request.", http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(request.ID) == "" ||
			strings.TrimSpace(request.Message) == "" ||
			len(request.Architecture) == 0 {
			http.Error(w, "Invalid AI architecture request.", http.StatusBadRequest)
			return
		}

		response, err := provider.Propose(r.Context(), request)
		if err != nil {
			if errors.Is(err, ErrProviderNotConfigured) {
				http.Error(w, "AI provider is not configured.", http.StatusServiceUnavailable)
				return
			}

			http.Error(w, "Unable to generate an architecture proposal.", http.StatusBadGateway)
			return
		}

		writeJSON(w, http.StatusOK, response)
	}
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
