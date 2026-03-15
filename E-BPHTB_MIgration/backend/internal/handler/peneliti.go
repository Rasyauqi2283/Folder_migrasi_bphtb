package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"ebphtb/backend/internal/repository"
)

func penelitiUseridFromCookie(r *http.Request) string {
	c, err := r.Cookie("ebphtb_userid")
	if err != nil || c == nil || strings.TrimSpace(c.Value) == "" {
		return ""
	}
	return strings.TrimSpace(c.Value)
}

// PenelitiHandler handles /api/peneliti_get-berkas-fromltb and /api/peneliti/get-berkas-till-verif (Go-native).
type PenelitiHandler struct {
	repo     *repository.PenelitiRepo
	userRepo *repository.UserRepo
}

// NewPenelitiHandler creates a PenelitiHandler.
func NewPenelitiHandler(repo *repository.PenelitiRepo, userRepo *repository.UserRepo) *PenelitiHandler {
	return &PenelitiHandler{repo: repo, userRepo: userRepo}
}

func (h *PenelitiHandler) requirePeneliti(r *http.Request) (userid string, ok bool) {
	userid = penelitiUseridFromCookie(r)
	if userid == "" {
		return "", false
	}
	u, err := h.userRepo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || u == nil {
		return "", false
	}
	if strings.TrimSpace(u.Divisi) != "Peneliti" {
		return "", false
	}
	return userid, true
}

func penelitiJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// GetBerkasFromLtb handles GET /api/peneliti_get-berkas-fromltb.
func (h *PenelitiHandler) GetBerkasFromLtb(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		penelitiJSON(w, http.StatusMethodNotAllowed, map[string]string{"success": "false", "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requirePeneliti(r)
	if !ok {
		penelitiJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Akses ditolak. Silakan login dengan user divisi Peneliti."})
		return
	}
	data, err := h.repo.GetBerkasFromLtb(r.Context(), userid)
	if err != nil {
		log.Printf("[PENELITI] GetBerkasFromLtb: %v", err)
		penelitiJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "An error occurred while fetching data."})
		return
	}
	if data == nil {
		data = []repository.PenelitiBerkasFromLtbRow{}
	}
	penelitiJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": data})
}

// GetBerkasTillVerif handles GET /api/peneliti/get-berkas-till-verif.
func (h *PenelitiHandler) GetBerkasTillVerif(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		penelitiJSON(w, http.StatusMethodNotAllowed, map[string]string{"success": "false", "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requirePeneliti(r)
	if !ok {
		penelitiJSON(w, http.StatusUnauthorized, map[string]interface{}{"success": false, "code": "UNAUTHENTICATED", "message": "Authentication required"})
		return
	}
	data, err := h.repo.GetBerkasTillVerif(r.Context(), userid)
	if err != nil {
		log.Printf("[PENELITI] GetBerkasTillVerif: %v", err)
		penelitiJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "code": "SERVER_ERROR", "message": "Internal server error"})
		return
	}
	if data == nil {
		data = []repository.PenelitiBerkasTillVerifRow{}
	}
	penelitiJSON(w, http.StatusOK, map[string]interface{}{
		"success": true, "data": data,
		"metadata": map[string]interface{}{"count": len(data), "generatedAt": ""},
	})
}
