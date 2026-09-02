package ai

import (
	"context"
	"encoding/json"
	"errors"
)

var ErrProviderNotConfigured = errors.New("AI provider is not configured")

type ArchitectureProposalRequest struct {
	ID           string          `json:"id"`
	Message      string          `json:"message"`
	Architecture json.RawMessage `json:"architecture"`
}

type ArchitectureProposalResponse struct {
	Command json.RawMessage `json:"command"`
}

type ArchitectureProposalProvider interface {
	Propose(
		context.Context,
		ArchitectureProposalRequest,
	) (ArchitectureProposalResponse, error)
}

type ProviderStatus interface {
	IsConfigured() bool
}

type UnconfiguredProvider struct{}

func (UnconfiguredProvider) IsConfigured() bool {
	return false
}

func (UnconfiguredProvider) Propose(
	context.Context,
	ArchitectureProposalRequest,
) (ArchitectureProposalResponse, error) {
	return ArchitectureProposalResponse{}, ErrProviderNotConfigured
}
