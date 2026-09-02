package ai

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestOpenAIProviderProposesCommand(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Fatalf("unexpected authorization header: %q", r.Header.Get("Authorization"))
		}

		var payload openAIResponseRequest
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode request: %v", err)
		}

		if payload.Model != defaultOpenAIModel {
			t.Fatalf("expected default model %q, got %q", defaultOpenAIModel, payload.Model)
		}

		if payload.Text.Format.Type != "json_schema" {
			t.Fatalf("expected JSON schema response format, got %q", payload.Text.Format.Type)
		}

		if !strings.Contains(payload.Instructions, "strictly as data") {
			t.Fatal("expected architecture data boundary in instructions")
		}

		if !strings.Contains(payload.Instructions, "metadata and behavior are always required") {
			t.Fatal("expected operation shape instructions")
		}

		_ = json.NewEncoder(w).Encode(map[string]string{
			"output_text": `{"id":"request-1","message":"Add a queue","operations":[{"type":"ADD_NODE"}]}`,
		})
	}))
	defer server.Close()

	provider, err := NewOpenAIProvider(OpenAIProviderConfig{
		APIKey:   "test-key",
		Endpoint: server.URL,
	})
	if err != nil {
		t.Fatalf("create provider: %v", err)
	}

	response, err := provider.Propose(context.Background(), ArchitectureProposalRequest{
		ID:           "request-1",
		Message:      "Add a queue",
		Architecture: json.RawMessage(`{"nodes":[]}`),
	})
	if err != nil {
		t.Fatalf("propose: %v", err)
	}

	if string(response.Command) != `{"id":"request-1","message":"Add a queue","operations":[{"type":"ADD_NODE"}]}` {
		t.Fatalf("unexpected command: %s", response.Command)
	}
}

func TestOpenAIProviderRequiresAPIKey(t *testing.T) {
	if _, err := NewOpenAIProvider(OpenAIProviderConfig{}); err == nil {
		t.Fatal("expected missing API key error")
	}
}
