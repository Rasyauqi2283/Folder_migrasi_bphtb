package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"ebphtb/backend/internal/repository"
)

// SystemGateMiddleware blocks requests when:
// - DB maintenance_mode is OFFLINE, or
// - outside operational hours (08:00–18:00 WIB)
//
// It always allows:
// - GET /health
// - GET /api/health
// - GET /api/system/status
//
// Note: keep CORS middleware OUTERMOST so OPTIONS preflight is handled before this gate.
func SystemGateMiddleware(repo *repository.SystemStatusRepo, next http.Handler) http.Handler {
	allowPath := func(r *http.Request) bool {
		// ServeMux patterns use r.URL.Path here.
		p := r.URL.Path
		if p == "/health" || p == "/api/health" {
			return true
		}
		if p == "/api/system/status" && r.Method == http.MethodGet {
			return true
		}
		return false
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if allowPath(r) {
			next.ServeHTTP(w, r)
			return
		}

		// If DB not configured, repo returns online=true (see repo implementation).
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()

		st, err := repo.GetMaintenanceMode(ctx)
		if err != nil {
			jsonError(w, http.StatusInternalServerError, "Gagal membaca status sistem")
			return
		}

		now := jakartaNow()
		if isOutsideOperationalHours(now) {
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
			attachStatusFields(payload, st)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			_ = json.NewEncoder(w).Encode(payload)
			return
		}

		if !st.Online {
			msg := "Sistem sedang dalam pemeliharaan. Mohon coba lagi nanti."
			if st.Message != nil && strings.TrimSpace(*st.Message) != "" {
				msg = strings.TrimSpace(*st.Message)
			}
			payload := map[string]interface{}{
				"success": false,
				"online":  false,
				"reason":  "maintenance",
				"message": msg,
			}
			attachStatusFields(payload, st)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			_ = json.NewEncoder(w).Encode(payload)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func attachStatusFields(payload map[string]interface{}, st *repository.MaintenanceStatus) {
	if st == nil {
		return
	}
	if st.ScheduledAt != nil {
		payload["scheduled_at"] = st.ScheduledAt.Format(time.RFC3339)
	}
	if st.EtaDoneAt != nil {
		payload["eta_done_at"] = st.EtaDoneAt.Format(time.RFC3339)
	}
}

