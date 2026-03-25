package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"ebphtb/backend/internal/repository"
)

type AdminSystemStatusHandler struct {
	userRepo   *repository.UserRepo
	statusRepo *repository.SystemStatusRepo
}

func NewAdminSystemStatusHandler(userRepo *repository.UserRepo, statusRepo *repository.SystemStatusRepo) *AdminSystemStatusHandler {
	return &AdminSystemStatusHandler{userRepo: userRepo, statusRepo: statusRepo}
}

func adminUserid(r *http.Request) string {
	if c, err := r.Cookie("ebphtb_userid"); err == nil && c != nil && strings.TrimSpace(c.Value) != "" {
		return strings.TrimSpace(c.Value)
	}
	return strings.TrimSpace(r.Header.Get("X-User-Id"))
}

func isAdminDivisi(divisi string) bool {
	d := strings.ToLower(strings.TrimSpace(divisi))
	// Accept current naming conventions in the system.
	return d == "administrator" || d == "admin" || strings.Contains(d, "admin")
}

type maintenanceToggleRequest struct {
	Online      *bool   `json:"online"`
	Message     *string `json:"message"`
	ScheduledAt *string `json:"scheduled_at"` // RFC3339
	EtaDoneAt   *string `json:"eta_done_at"`  // RFC3339
}

// PutMaintenanceMode handles PUT /api/admin/system/maintenance-mode
// Admin-only: divisi contains "admin".
func (h *AdminSystemStatusHandler) PutMaintenanceMode(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	userid := adminUserid(r)
	if userid == "" {
		jsonError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if h.userRepo == nil || h.userRepo.Pool() == nil || h.statusRepo == nil || h.statusRepo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia.")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	u, err := h.userRepo.GetByIdentifierForLogin(ctx, userid)
	if err != nil || u == nil {
		jsonError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if !isAdminDivisi(u.Divisi) {
		jsonError(w, http.StatusForbidden, "Forbidden")
		return
	}

	var req maintenanceToggleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}
	if req.Online == nil {
		jsonError(w, http.StatusBadRequest, "Field online wajib (true/false)")
		return
	}

	var scheduledAt *time.Time
	if req.ScheduledAt != nil && strings.TrimSpace(*req.ScheduledAt) != "" {
		t, err := time.Parse(time.RFC3339, strings.TrimSpace(*req.ScheduledAt))
		if err != nil {
			jsonError(w, http.StatusBadRequest, "scheduled_at harus RFC3339")
			return
		}
		scheduledAt = &t
	}
	var etaDoneAt *time.Time
	if req.EtaDoneAt != nil && strings.TrimSpace(*req.EtaDoneAt) != "" {
		t, err := time.Parse(time.RFC3339, strings.TrimSpace(*req.EtaDoneAt))
		if err != nil {
			jsonError(w, http.StatusBadRequest, "eta_done_at harus RFC3339")
			return
		}
		etaDoneAt = &t
	}

	msg := req.Message
	if msg != nil {
		m := strings.TrimSpace(*msg)
		msg = &m
	}

	if err := h.statusRepo.SetMaintenanceMode(ctx, &repository.SetMaintenanceModeArgs{
		Online:      *req.Online,
		Message:     msg,
		ScheduledAt: scheduledAt,
		EtaDoneAt:   etaDoneAt,
	}); err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan status maintenance")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"online":  *req.Online,
	})
}

