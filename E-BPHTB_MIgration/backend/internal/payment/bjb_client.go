package payment

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"
)

// BillingRequest is the minimal payload needed to register a BPHTB bill.
// NOTE: In production this should mirror Bank BJB API contract; for now we mock.
type BillingRequest struct {
	Nobooking string
	// AmountRequested is the amount that MUST be paid (in IDR, integer).
	AmountRequested int64
	// Description is a human readable label for the bill (no PII).
	Description string
}

type BillingResponse struct {
	BillingID  string
	Amount     int64
	ExpiresAt  time.Time
	Provider   string // "BJB"
	Mocked     bool
}

// BJBClient abstracts Billing ID registration.
type BJBClient interface {
	RequestBillingID(ctx context.Context, req BillingRequest) (BillingResponse, error)
}

// MockBJBClient returns deterministic-ish Billing IDs for integration testing.
// It never contacts external systems.
type MockBJBClient struct {
	TTL time.Duration
}

func (c *MockBJBClient) RequestBillingID(ctx context.Context, req BillingRequest) (BillingResponse, error) {
	_ = ctx
	nb := strings.TrimSpace(req.Nobooking)
	if nb == "" {
		return BillingResponse{}, fmt.Errorf("nobooking wajib")
	}
	if req.AmountRequested < 0 {
		return BillingResponse{}, fmt.Errorf("amount_requested tidak boleh negatif")
	}
	ttl := c.TTL
	if ttl <= 0 {
		ttl = 2 * time.Hour
	}
	buf := make([]byte, 5)
	_, _ = rand.Read(buf)
	sfx := strings.ToUpper(hex.EncodeToString(buf))
	billingID := fmt.Sprintf("BJB-%s-%s", nb, sfx)
	return BillingResponse{
		BillingID: billingID,
		Amount:    req.AmountRequested,
		ExpiresAt: time.Now().Add(ttl).UTC(),
		Provider:  "BJB",
		Mocked:    true,
	}, nil
}

