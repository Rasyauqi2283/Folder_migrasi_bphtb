package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"ebphtb/backend/internal/repository"
)

func bankUseridFromCookie(r *http.Request) string {
	c, err := r.Cookie("ebphtb_userid")
	if err != nil || c == nil || strings.TrimSpace(c.Value) == "" {
		return ""
	}
	return strings.TrimSpace(c.Value)
}

// BankHandler handles /api/bank/* (Go-native, no legacy proxy).
type BankHandler struct {
	repo    *repository.BankRepo
	userRepo *repository.UserRepo
}

// NewBankHandler creates a BankHandler.
func NewBankHandler(repo *repository.BankRepo, userRepo *repository.UserRepo) *BankHandler {
	return &BankHandler{repo: repo, userRepo: userRepo}
}

// requireBankUser returns 401/403 if not BANK or Administrator.
func (h *BankHandler) requireBankUser(r *http.Request) (userid string, ok bool) {
	userid = bankUseridFromCookie(r)
	if userid == "" {
		return "", false
	}
	u, err := h.userRepo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || u == nil {
		return "", false
	}
	d := strings.TrimSpace(u.Divisi)
	if d != "BANK" && d != "Administrator" {
		return "", false
	}
	return userid, true
}

func bankJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// ListTransaksi handles GET /api/bank/transaksi.
func (h *BankHandler) ListTransaksi(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		bankJSON(w, http.StatusMethodNotAllowed, map[string]string{"success": "false", "message": "Method Not Allowed"})
		return
	}
	if _, ok := h.requireBankUser(r); !ok {
		bankJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Unauthorized or Forbidden"})
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
	tab := q.Get("tab")
	if tab == "" {
		tab = "pending"
	}
	statusFilter := strings.TrimSpace(q.Get("status"))
	search := strings.TrimSpace(q.Get("q"))

	rows, total, totalPages, err := h.repo.BankTransaksiList(r.Context(), tab, statusFilter, search, page, limit)
	if err != nil {
		log.Printf("[BANK] ListTransaksi: %v", err)
		bankJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Internal server error"})
		return
	}
	bankJSON(w, http.StatusOK, map[string]interface{}{
		"success": true, "page": page, "limit": limit, "total": total, "totalPages": totalPages, "rows": rows,
	})
}

// Approve handles POST /api/bank/transaksi/{nobooking}/approve.
func (h *BankHandler) Approve(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		bankJSON(w, http.StatusMethodNotAllowed, map[string]string{"success": "false", "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requireBankUser(r)
	if !ok {
		bankJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Unauthorized or Forbidden"})
		return
	}
	nobooking := strings.TrimSpace(r.PathValue("nobooking"))
	if nobooking == "" {
		bankJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking wajib"})
		return
	}
	var body struct {
		Catatan string `json:"catatan"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)

	if err := h.repo.UpsertBankVerification(r.Context(), nobooking, "Disetujui", body.Catatan, userid, ""); err != nil {
		log.Printf("[BANK] Approve: %v", err)
		bankJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Internal server error"})
		return
	}
	bankJSON(w, http.StatusOK, map[string]interface{}{"success": true})
}

// Reject handles POST /api/bank/transaksi/{nobooking}/reject.
func (h *BankHandler) Reject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		bankJSON(w, http.StatusMethodNotAllowed, map[string]string{"success": "false", "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requireBankUser(r)
	if !ok {
		bankJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Unauthorized or Forbidden"})
		return
	}
	nobooking := strings.TrimSpace(r.PathValue("nobooking"))
	if nobooking == "" {
		bankJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking wajib"})
		return
	}
	var body struct {
		Catatan string `json:"catatan"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if strings.TrimSpace(body.Catatan) == "" {
		bankJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "catatan wajib untuk penolakan"})
		return
	}
	if err := h.repo.UpsertBankVerification(r.Context(), nobooking, "Ditolak", body.Catatan, userid, ""); err != nil {
		log.Printf("[BANK] Reject: %v", err)
		bankJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Internal server error"})
		return
	}
	bankJSON(w, http.StatusOK, map[string]interface{}{"success": true})
}
