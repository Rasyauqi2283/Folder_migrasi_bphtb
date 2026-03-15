package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"ebphtb/backend/internal/repository"
)

func lsbUseridFromCookie(r *http.Request) string {
	c, err := r.Cookie("ebphtb_userid")
	if err != nil || c == nil || strings.TrimSpace(c.Value) == "" {
		return ""
	}
	return strings.TrimSpace(c.Value)
}

// LSBHandler handles /api/LSB_berkas-complete and /api/LSB_monitoring-penyerahan (Go-native).
type LSBHandler struct {
	repo     *repository.LSBRepo
	userRepo *repository.UserRepo
}

// NewLSBHandler creates a LSBHandler.
func NewLSBHandler(repo *repository.LSBRepo, userRepo *repository.UserRepo) *LSBHandler {
	return &LSBHandler{repo: repo, userRepo: userRepo}
}

func (h *LSBHandler) requireLSB(r *http.Request) bool {
	userid := lsbUseridFromCookie(r)
	if userid == "" {
		return false
	}
	u, err := h.userRepo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || u == nil {
		return false
	}
	return strings.TrimSpace(u.Divisi) == "LSB"
}

func lsbJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// BerkasComplete handles GET /api/LSB_berkas-complete.
func (h *LSBHandler) BerkasComplete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		lsbJSON(w, http.StatusMethodNotAllowed, map[string]string{"success": "false", "message": "Method Not Allowed"})
		return
	}
	if !h.requireLSB(r) {
		lsbJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Akses ditolak. Hanya pengguna dengan divisi Loket Serah Berkas yang dapat mengakses data ini."})
		return
	}
	data, err := h.repo.BerkasComplete(r.Context())
	if err != nil {
		log.Printf("[LSB] BerkasComplete: %v", err)
		lsbJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "An error occurred while fetching data."})
		return
	}
	if data == nil {
		data = []repository.LSBBerkasCompleteRow{}
	}
	lsbJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": data})
}

// MonitoringPenyerahan handles GET /api/LSB_monitoring-penyerahan.
func (h *LSBHandler) MonitoringPenyerahan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		lsbJSON(w, http.StatusMethodNotAllowed, map[string]string{"success": "false", "message": "Method Not Allowed"})
		return
	}
	if !h.requireLSB(r) {
		lsbJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Akses ditolak. Hanya pengguna dengan divisi Loket Serah Berkas yang dapat mengakses data ini."})
		return
	}
	months, total, err := h.repo.MonitoringPenyerahan(r.Context())
	if err != nil {
		log.Printf("[LSB] MonitoringPenyerahan: %v", err)
		lsbJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "An error occurred while fetching monitoring data."})
		return
	}
	if months == nil {
		months = []repository.LSBMonitoringMonth{}
	}
	lsbJSON(w, http.StatusOK, map[string]interface{}{"success": true, "months": months, "total": total})
}
