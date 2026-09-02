package ai

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCORSAllowsConfiguredOrigin(t *testing.T) {
	handler := WithCORS(http.NotFoundHandler(), "http://localhost:5173")
	request := httptest.NewRequest(http.MethodOptions, "/api/ai/architecture/proposals", nil)
	request.Header.Set("Origin", "http://localhost:5173")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected status %d, got %d", http.StatusNoContent, recorder.Code)
	}

	if got := recorder.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:5173" {
		t.Fatalf("unexpected allowed origin: %q", got)
	}
}

func TestCORSRejectsOtherOrigins(t *testing.T) {
	handler := WithCORS(http.NotFoundHandler(), "http://localhost:5173")
	request := httptest.NewRequest(http.MethodOptions, "/api/ai/architecture/proposals", nil)
	request.Header.Set("Origin", "http://example.com")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected status %d, got %d", http.StatusForbidden, recorder.Code)
	}
}
