package ai

import "net/http"

func WithCORS(next http.Handler, allowedOrigin string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Origin") == allowedOrigin {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.Header().Set("Vary", "Origin")
		}

		if r.Method == http.MethodOptions {
			if r.Header.Get("Origin") == allowedOrigin {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			http.Error(w, "Origin is not allowed.", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
