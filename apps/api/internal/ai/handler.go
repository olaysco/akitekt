package ai

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
)

const maxProposalRequestBytes = 1 << 20

func NewHandler(provider ArchitectureProposalProvider, staticDir string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", handleHealth)
	mux.HandleFunc("GET /ready", handleReady(provider))
	mux.HandleFunc("POST /api/ai/architecture/proposals", handleProposal(provider))
	mux.Handle("/", spaHandler(staticDir))

	return mux
}

func spaHandler(staticDir string) http.HandlerFunc {
	fs := http.FileServer(http.Dir(staticDir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/assets/") {
			fs.ServeHTTP(w, r)
			return
		}

		name := filepath.Join(staticDir, filepath.FromSlash(path.Clean("/"+r.URL.Path)))
		if info, err := os.Stat(name); err == nil && !info.IsDir() {
			fs.ServeHTTP(w, r)
			return
		}

		http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
	})
}

func handleReady(provider ArchitectureProposalProvider) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		status, ok := provider.(ProviderStatus)
		if !ok || !status.IsConfigured() {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "unconfigured"})
			return
		}

		writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
	}
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
