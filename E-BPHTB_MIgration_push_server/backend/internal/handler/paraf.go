package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"ebphtb/backend/internal/repository"
)

func parafUseridFromCookie(r *http.Request) string {
	c, err := r.Cookie("ebphtb_userid")
	if err != nil || c == nil || strings.TrimSpace(c.Value) == "" {
		return ""
	}
	return strings.TrimSpace(c.Value)
}

// ParafHandler handles /api/paraf/get-berkas-pending and /api/paraf/get-monitoring-documents (Go-native, Peneliti Validasi).
type ParafHandler struct {
	repo     *repository.ParafRepo
	userRepo *repository.UserRepo
}

// NewParafHandler creates a ParafHandler.
func NewParafHandler(repo *repository.ParafRepo, userRepo *repository.UserRepo) *ParafHandler {
	return &ParafHandler{repo: repo, userRepo: userRepo}
}

func (h *ParafHandler) requirePenelitiValidasi(r *http.Request) (userid string, ok bool) {
	userid = parafUseridFromCookie(r)
	if userid == "" {
		return "", false
	}
	u, err := h.userRepo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || u == nil {
		return "", false
	}
	if strings.TrimSpace(u.Divisi) != "Peneliti Validasi" {
		return "", false
	}
	return userid, true
}

func parafJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// GetBerkasPending handles GET /api/paraf/get-berkas-pending.
func (h *ParafHandler) GetBerkasPending(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		parafJSON(w, http.StatusMethodNotAllowed, map[string]string{"success": "false", "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requirePenelitiValidasi(r)
	if !ok {
		parafJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Akses ditolak. Hanya pengguna dengan divisi Paraf Validasi yang dapat mengakses data ini."})
		return
	}
	data, err := h.repo.GetBerkasPending(r.Context(), userid)
	if err != nil {
		log.Printf("[PARAF] GetBerkasPending: %v", err)
		parafJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Terjadi kesalahan server"})
		return
	}
	if data == nil {
		data = []repository.ParafBerkasRow{}
	}
	parafJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": data})
}

// GetMonitoringDocuments handles GET /api/paraf/get-monitoring-documents.
func (h *ParafHandler) GetMonitoringDocuments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		parafJSON(w, http.StatusMethodNotAllowed, map[string]string{"success": "false", "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requirePenelitiValidasi(r)
	if !ok {
		parafJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Akses ditolak. Hanya pengguna dengan divisi Paraf Validasi yang dapat mengakses data ini."})
		return
	}
	data, err := h.repo.GetMonitoringDocuments(r.Context(), userid)
	if err != nil {
		log.Printf("[PARAF] GetMonitoringDocuments: %v", err)
		parafJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Terjadi kesalahan server"})
		return
	}
	if data == nil {
		parafJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": []repository.ParafBerkasRow{}})
		return
	}
	parafJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": data})
}
