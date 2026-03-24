package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"ebphtb/backend/internal/repository"
)

func ltbUseridFromCookie(r *http.Request) string {
	c, err := r.Cookie("ebphtb_userid")
	if err != nil || c == nil || strings.TrimSpace(c.Value) == "" {
		return ""
	}
	return strings.TrimSpace(c.Value)
}

// LtbHandler handles /api/ltb/* for LTB role.
type LtbHandler struct {
	repo     *repository.LtbRepo
	userRepo *repository.UserRepo
}

// NewLtbHandler creates an LtbHandler.
func NewLtbHandler(repo *repository.LtbRepo, userRepo *repository.UserRepo) *LtbHandler {
	return &LtbHandler{repo: repo, userRepo: userRepo}
}

func (h *LtbHandler) requireLTBUser(r *http.Request) (userid string, ok bool) {
	userid = ltbUseridFromCookie(r)
	if userid == "" {
		return "", false
	}
	u, err := h.userRepo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || u == nil {
		return "", false
	}
	d := strings.TrimSpace(u.Divisi)
	if !strings.EqualFold(d, "LTB") && !strings.EqualFold(d, "Administrator") {
		return "", false
	}
	return userid, true
}

func ltbJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// ListTerimaBerkas handles GET /api/ltb/terima-berkas-sspd.
func (h *LtbHandler) ListTerimaBerkas(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ltbJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	if _, ok := h.requireLTBUser(r); !ok {
		ltbJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Unauthorized or Forbidden"})
		return
	}
	q := r.URL.Query()
	page, _ := strconv.Atoi(q.Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(q.Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 20
	}
	search := strings.TrimSpace(q.Get("q"))

	rows, total, totalPages, err := h.repo.TerimaBerkasList(r.Context(), search, page, limit)
	if err != nil {
		log.Printf("[LTB] ListTerimaBerkas: %v", err)
		ltbJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Internal server error"})
		return
	}
	ltbJSON(w, http.StatusOK, map[string]interface{}{
		"success": true, "page": page, "limit": limit, "total": total, "totalPages": totalPages, "rows": rows,
	})
}
