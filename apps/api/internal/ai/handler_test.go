package ai

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

type providerStub struct {
	response ArchitectureProposalResponse
	err      error
}

func (stub providerStub) Propose(
	context.Context,
	ArchitectureProposalRequest,
) (ArchitectureProposalResponse, error) {
	return stub.response, stub.err
}

func TestProposalReturnsProviderResponse(t *testing.T) {
	handler := NewHandler(providerStub{
		response: ArchitectureProposalResponse{
			Command: json.RawMessage(`{"id":"command-1","message":"Add a queue","operations":[]}`),
		},
	}, "")

	request := httptest.NewRequest(
		http.MethodPost,
		"/api/ai/architecture/proposals",
		strings.NewReader(`{"id":"request-1","message":"Add a queue","architecture":{}}`),
	)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	var response ArchitectureProposalResponse
	if err := json.NewDecoder(recorder.Body).Decode(&response); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if string(response.Command) != `{"id":"command-1","message":"Add a queue","operations":[]}` {
		t.Fatalf("unexpected command: %s", response.Command)
	}
}

func TestProposalRejectsInvalidRequest(t *testing.T) {
	handler := NewHandler(UnconfiguredProvider{}, "")
	request := httptest.NewRequest(
		http.MethodPost,
		"/api/ai/architecture/proposals",
		strings.NewReader(`{"id":"request-1","message":"","architecture":{}}`),
	)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

func TestProposalReportsUnconfiguredProvider(t *testing.T) {
	handler := NewHandler(UnconfiguredProvider{}, "")
	request := httptest.NewRequest(
		http.MethodPost,
		"/api/ai/architecture/proposals",
		strings.NewReader(`{"id":"request-1","message":"Add a queue","architecture":{}}`),
	)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected status %d, got %d", http.StatusServiceUnavailable, recorder.Code)
	}
}

func TestProposalRejectsLargeRequest(t *testing.T) {
	handler := NewHandler(UnconfiguredProvider{}, "")
	request := httptest.NewRequest(
		http.MethodPost,
		"/api/ai/architecture/proposals",
		strings.NewReader(
			`{"id":"request-1","message":"`+
				strings.Repeat("x", maxProposalRequestBytes)+
				`","architecture":{}}`,
		),
	)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected status %d, got %d", http.StatusRequestEntityTooLarge, recorder.Code)
	}
}

func TestReadyReportsUnconfiguredProvider(t *testing.T) {
	handler := NewHandler(UnconfiguredProvider{}, "")
	request := httptest.NewRequest(http.MethodGet, "/ready", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected status %d, got %d", http.StatusServiceUnavailable, recorder.Code)
	}
}

func TestReadyReportsConfiguredProvider(t *testing.T) {
	handler := NewHandler(configuredProvider{}, "")
	request := httptest.NewRequest(http.MethodGet, "/ready", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
}

type configuredProvider struct {
	providerStub
}

func (configuredProvider) IsConfigured() bool {
	return true
}
