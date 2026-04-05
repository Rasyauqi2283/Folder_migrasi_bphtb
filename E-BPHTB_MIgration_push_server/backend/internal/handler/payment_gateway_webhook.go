package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"ebphtb/backend/internal/config"
	"ebphtb/backend/internal/repository"
)

// PaymentGatewayWebhookHandler handles POST /api/webhooks/payment-gateway (callback PAID).
type PaymentGatewayWebhookHandler struct {
	cfg  *config.Config
	bank *repository.BankRepo
}

// NewPaymentGatewayWebhookHandler constructs handler.
func NewPaymentGatewayWebhookHandler(cfg *config.Config, bank *repository.BankRepo) *PaymentGatewayWebhookHandler {
	return &PaymentGatewayWebhookHandler{cfg: cfg, bank: bank}
}

func (h *PaymentGatewayWebhookHandler) Handle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	if h.bank == nil {
		http.Error(w, `{"success":false,"message":"database unavailable"}`, http.StatusServiceUnavailable)
		return
	}
	secret := strings.TrimSpace(r.Header.Get("X-Webhook-Secret"))
	if secret == "" {
		secret = strings.TrimSpace(r.URL.Query().Get("secret"))
	}
	if h.cfg != nil && strings.TrimSpace(h.cfg.PaymentGatewayWebhookSecret) != "" {
		if secret != strings.TrimSpace(h.cfg.PaymentGatewayWebhookSecret) {
			http.Error(w, `{"success":false,"message":"invalid secret"}`, http.StatusUnauthorized)
			return
		}
	}

	dec := json.NewDecoder(r.Body)
	dec.UseNumber()
	var raw map[string]interface{}
	if err := dec.Decode(&raw); err != nil {
		http.Error(w, `{"success":false,"message":"invalid json"}`, http.StatusBadRequest)
		return
	}

	nobooking := firstString(raw, "nobooking", "nobooking_id", "booking_id")
	status := strings.ToUpper(firstString(raw, "status", "payment_status", "state"))
	if nobooking == "" {
		http.Error(w, `{"success":false,"message":"nobooking wajib"}`, http.StatusBadRequest)
		return
	}
	if status != "PAID" && status != "SETTLED" && status != "SUCCESS" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "ignored": true, "status": status})
		return
	}

	amount := firstInt64(raw, "amount", "nominal", "paid_amount", "total")
	if amount <= 0 {
		http.Error(w, `{"success":false,"message":"amount wajib > 0 untuk PAID"}`, http.StatusBadRequest)
		return
	}

	ref := firstString(raw, "reference", "gateway_reference", "trx_id", "transaction_id")
	ch := firstString(raw, "channel", "payment_channel", "method")

	paidAt := time.Now()
	if s := firstString(raw, "paid_at", "settlement_time", "timestamp"); s != "" {
		if t, err := time.Parse(time.RFC3339, s); err == nil {
			paidAt = t
		} else if t, err := time.Parse("2006-01-02 15:04:05", s); err == nil {
			paidAt = t
		}
	}

	if err := h.bank.ApplyGatewayPaid(r.Context(), nobooking, amount, ref, ch, paidAt); err != nil {
		log.Printf("[WEBHOOK] ApplyGatewayPaid %s: %v", nobooking, err)
		http.Error(w, `{"success":false,"message":"gagal menyimpan"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "nobooking": nobooking})
}

func firstString(m map[string]interface{}, keys ...string) string {
	for _, k := range keys {
		if v, ok := m[k]; ok && v != nil {
			s := strings.TrimSpace(valueToString(v))
			if s != "" {
				return s
			}
		}
	}
	return ""
}

func valueToString(v interface{}) string {
	switch t := v.(type) {
	case string:
		return t
	case json.Number:
		return t.String()
	case float64:
		return strconv.FormatInt(int64(t), 10)
	default:
		return strings.TrimSpace(fmt.Sprint(t))
	}
}

func firstInt64(m map[string]interface{}, keys ...string) int64 {
	for _, k := range keys {
		if v, ok := m[k]; ok && v != nil {
			return valueToInt64(v)
		}
	}
	return 0
}

func valueToInt64(v interface{}) int64 {
	switch t := v.(type) {
	case int64:
		return t
	case int:
		return int64(t)
	case float64:
		return int64(t)
	case json.Number:
		i, _ := t.Int64()
		return i
	case string:
		s := strings.TrimSpace(t)
		s = strings.ReplaceAll(s, ".", "")
		s = strings.ReplaceAll(s, ",", "")
		n, _ := strconv.ParseInt(s, 10, 64)
		return n
	default:
		return 0
	}
}
