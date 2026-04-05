package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

const msgPpatSuspendBooking = "Akses diblokir karena keterlambatan laporan periode bulanan. Silakan unggah dokumen laporan pada menu Laporan PU untuk membuka akses."

func (h *PpatHandler) ppatSuspended(ctx context.Context, userid string) bool {
	if h.userRepo == nil || userid == "" {
		return false
	}
	return h.userRepo.GetStatusPpat(ctx, userid) == "suspend"
}

// requirePpatBookingAllowed mengembalikan false dan menulis 403 jika status_ppat = suspend.
func (h *PpatHandler) requirePpatBookingAllowed(w http.ResponseWriter, r *http.Request, userid string) bool {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	if !h.ppatSuspended(ctx, userid) {
		return true
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusForbidden)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": false,
		"code":    "PPAT_SUSPEND",
		"message": msgPpatSuspendBooking,
	})
	return false
}
