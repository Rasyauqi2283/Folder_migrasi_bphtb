package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"ebphtb/backend/internal/repository"
)

type SystemStatusHandler struct {
	repo *repository.SystemStatusRepo
}

func NewSystemStatusHandler(repo *repository.SystemStatusRepo) *SystemStatusHandler {
	return &SystemStatusHandler{repo: repo}
}

func jakartaNow() time.Time {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return time.Now()
	}
	return time.Now().In(loc)
}

func isOutsideOperationalHours(now time.Time) bool {
	// 08:00 - 18:00 WIB (inclusive start, exclusive end)
	h := now.Hour()
	if h < 8 {
		return true
	}
	if h >= 1 {
		return true
	}
	return false
}

func nextOperationalOpen(now time.Time) time.Time {
	y, m, d := now.Date()
	loc := now.Location()
	open := time.Date(y, m, d, 8, 0, 0, 0, loc)
	if now.Before(open) {
		return open
	}
	return open.Add(24 * time.Hour)
}

// GetSystemStatus handles GET /api/system/status.
// - 200 if ONLINE
// - 503 if OFFLINE or outside operational hours (08-18 WIB)
func (h *SystemStatusHandler) GetSystemStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 4*time.Second)
	defer cancel()

	st, err := h.repo.GetMaintenanceMode(ctx)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal membaca status sistem")
		return
	}

	now := jakartaNow()
	outsideHours := isOutsideOperationalHours(now)
	if outsideHours {
		openAt := nextOperationalOpen(now)
		msg := fmt.Sprintf("Di luar jam operasional (08:00–18:00 WIB). Sistem akan aktif kembali pada %s WIB.", openAt.Format("02/01/2006 15:04"))
		payload := map[string]interface{}{
			"success":     false,
			"online":      false,
			"reason":      "outside_hours",
			"message":     msg,
			"open_at":     openAt.Format(time.RFC3339),
			"server_time": now.Format(time.RFC3339),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(payload)
		return
	}

	payload := map[string]interface{}{
		"success": true,
		"online":  st.Online,
		"message": st.Message,
	}
	if st.ScheduledAt != nil {
		payload["scheduled_at"] = st.ScheduledAt.Format(time.RFC3339)
	}
	if st.EtaDoneAt != nil {
		payload["eta_done_at"] = st.EtaDoneAt.Format(time.RFC3339)
	}
	if st.UpdatedAt != nil {
		payload["updated_at"] = st.UpdatedAt.Format(time.RFC3339)
	}

	if !st.Online {
		// Offline: return 503 so frontend can redirect to /maintenance.
		if st.Message == nil || *st.Message == "" {
			msg := "Sistem sedang dalam pemeliharaan. Mohon coba lagi nanti."
			payload["message"] = msg
		}
		payload["success"] = false
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(payload)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(payload)
}

