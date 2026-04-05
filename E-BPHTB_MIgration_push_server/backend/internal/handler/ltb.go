package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

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
	ppatRepo *repository.PpatRepo
}

// NewLtbHandler creates an LtbHandler. ppatRepo may be nil (offline booking endpoints disabled).
func NewLtbHandler(repo *repository.LtbRepo, userRepo *repository.UserRepo, ppatRepo *repository.PpatRepo) *LtbHandler {
	return &LtbHandler{repo: repo, userRepo: userRepo, ppatRepo: ppatRepo}
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

// GetDocuments handles GET /api/ltb/terima-berkas-sspd/{nobooking}/documents.
func (h *LtbHandler) GetDocuments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ltbJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	if _, ok := h.requireLTBUser(r); !ok {
		ltbJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Unauthorized or Forbidden"})
		return
	}
	nobooking := strings.TrimSpace(r.PathValue("nobooking"))
	if nobooking == "" {
		ltbJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking wajib"})
		return
	}
	documents, err := h.repo.GetDocumentsByBooking(r.Context(), nobooking)
	if err != nil {
		log.Printf("[LTB] GetDocuments: %v", err)
		ltbJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Internal server error"})
		return
	}
	ltbJSON(w, http.StatusOK, map[string]interface{}{"success": true, "documents": documents})
}

// Reject handles POST /api/ltb/terima-berkas-sspd/{nobooking}/reject.
func (h *LtbHandler) Reject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ltbJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requireLTBUser(r)
	if !ok {
		ltbJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Unauthorized or Forbidden"})
		return
	}
	nobooking := strings.TrimSpace(r.PathValue("nobooking"))
	if nobooking == "" {
		ltbJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking wajib"})
		return
	}
	var body struct {
		Reason string `json:"reason"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if strings.TrimSpace(body.Reason) == "" {
		ltbJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "Alasan tolak wajib diisi"})
		return
	}
	err := h.repo.RejectBerkas(r.Context(), nobooking, userid, body.Reason)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "fifo") {
			ltbJSON(w, http.StatusConflict, map[string]interface{}{"success": false, "message": err.Error()})
			return
		}
		if strings.Contains(strings.ToLower(err.Error()), "not found") {
			ltbJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "Data tidak ditemukan"})
			return
		}
		log.Printf("[LTB] Reject: %v", err)
		ltbJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Internal server error"})
		return
	}
	ltbJSON(w, http.StatusOK, map[string]interface{}{"success": true})
}

// SendToVerifikasi handles POST /api/ltb/terima-berkas-sspd/{nobooking}/send.
func (h *LtbHandler) SendToVerifikasi(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ltbJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requireLTBUser(r)
	if !ok {
		ltbJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Unauthorized or Forbidden"})
		return
	}
	nobooking := strings.TrimSpace(r.PathValue("nobooking"))
	if nobooking == "" {
		ltbJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking wajib"})
		return
	}
	var body struct {
		PBBCheckNo string `json:"pbb_check_no"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if strings.TrimSpace(body.PBBCheckNo) == "" {
		ltbJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "No PBB pemeriksaan wajib diisi"})
		return
	}
	res, err := h.repo.SendToVerifikasi(r.Context(), nobooking, userid, body.PBBCheckNo)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "fifo") {
			ltbJSON(w, http.StatusConflict, map[string]interface{}{"success": false, "message": err.Error()})
			return
		}
		if strings.Contains(strings.ToLower(err.Error()), "not found") {
			ltbJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "Data tidak ditemukan"})
			return
		}
		log.Printf("[LTB] SendToVerifikasi: %v", err)
		ltbJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Internal server error"})
		return
	}
	out := map[string]interface{}{"success": true}
	if res != nil {
		out["no_registrasi"] = res.NoRegistrasi
		out["peneliti_userid"] = res.PenelitiUserid
		out["peneliti_nama"] = res.PenelitiNama
		out["assignment_status"] = res.AssignmentStatus
	}
	ltbJSON(w, http.StatusOK, out)
}

// ListOfflineDrafts handles GET /api/ltb/offline/drafts.
func (h *LtbHandler) ListOfflineDrafts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ltbJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requireLTBUser(r)
	if !ok {
		ltbJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Unauthorized or Forbidden"})
		return
	}
	rows, err := h.repo.ListOfflineDrafts(r.Context(), userid)
	if err != nil {
		log.Printf("[LTB] ListOfflineDrafts: %v", err)
		ltbJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Internal server error"})
		return
	}
	if rows == nil {
		rows = []repository.LtbOfflineDraftRow{}
	}
	ltbJSON(w, http.StatusOK, map[string]interface{}{"success": true, "rows": rows})
}

// GetOfflineDraft handles GET /api/ltb/offline/drafts/{nobooking}.
func (h *LtbHandler) GetOfflineDraft(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ltbJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requireLTBUser(r)
	if !ok {
		ltbJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Unauthorized or Forbidden"})
		return
	}
	if h.ppatRepo == nil {
		ltbJSON(w, http.StatusServiceUnavailable, map[string]interface{}{"success": false, "message": "Layanan tidak tersedia"})
		return
	}
	nobooking := strings.TrimSpace(r.PathValue("nobooking"))
	if nobooking == "" {
		ltbJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking wajib"})
		return
	}
	data, err := h.ppatRepo.GetOfflineDraftFormData(r.Context(), userid, nobooking)
	if err != nil {
		ltbJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "Draf tidak ditemukan"})
		return
	}
	ltbJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": data})
}

// CreateOfflineBooking handles POST /api/ltb/offline/booking — body: CreateBookingParams + optional jenis "badan"|"perorangan".
func (h *LtbHandler) CreateOfflineBooking(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ltbJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requireLTBUser(r)
	if !ok {
		ltbJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Unauthorized or Forbidden"})
		return
	}
	if h.ppatRepo == nil {
		ltbJSON(w, http.StatusServiceUnavailable, map[string]interface{}{"success": false, "message": "Layanan tidak tersedia"})
		return
	}
	var body struct {
		Jenis string `json:"jenis"` // "badan" | "perorangan" (default badan)
		repository.CreateBookingParams
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		ltbJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "Invalid JSON"})
		return
	}
	params := body.CreateBookingParams
	if params.Trackstatus == "" {
		params.Trackstatus = "Draft"
	}
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()
	j := strings.ToLower(strings.TrimSpace(body.Jenis))
	var nobooking string
	var err error
	if j == "perorangan" {
		nobooking, err = h.ppatRepo.CreateBookingPerorangan(ctx, userid, &params)
	} else {
		nobooking, err = h.ppatRepo.CreateBookingBadan(ctx, userid, &params)
	}
	if err != nil {
		log.Printf("[LTB] CreateOfflineBooking: %v", err)
		ltbJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	ltbJSON(w, http.StatusOK, map[string]interface{}{"success": true, "nobooking": nobooking})
}

// UpdateOfflineBooking handles PUT /api/ltb/offline/booking/{nobooking}.
func (h *LtbHandler) UpdateOfflineBooking(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPatch {
		ltbJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requireLTBUser(r)
	if !ok {
		ltbJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Unauthorized or Forbidden"})
		return
	}
	if h.ppatRepo == nil {
		ltbJSON(w, http.StatusServiceUnavailable, map[string]interface{}{"success": false, "message": "Layanan tidak tersedia"})
		return
	}
	nobooking := strings.TrimSpace(r.PathValue("nobooking"))
	if nobooking == "" {
		ltbJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking wajib"})
		return
	}
	var params repository.CreateBookingParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		ltbJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "Invalid JSON"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()
	if err := h.ppatRepo.UpdateBookingBadan(ctx, userid, nobooking, &params); err != nil {
		log.Printf("[LTB] UpdateOfflineBooking: %v", err)
		ltbJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	ltbJSON(w, http.StatusOK, map[string]interface{}{"success": true})
}

// GenerateOfflineRegistration handles POST /api/ltb/offline/booking/{nobooking}/generate-registrasi.
func (h *LtbHandler) GenerateOfflineRegistration(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ltbJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requireLTBUser(r)
	if !ok {
		ltbJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Unauthorized or Forbidden"})
		return
	}
	if h.ppatRepo == nil {
		ltbJSON(w, http.StatusServiceUnavailable, map[string]interface{}{"success": false, "message": "Layanan tidak tersedia"})
		return
	}
	nobooking := strings.TrimSpace(r.PathValue("nobooking"))
	if nobooking == "" {
		ltbJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking wajib"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()
	noReg, err := h.ppatRepo.GenerateOfflineRegistration(ctx, userid, nobooking)
	if err != nil {
		log.Printf("[LTB] GenerateOfflineRegistration: %v", err)
		ltbJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	ltbJSON(w, http.StatusOK, map[string]interface{}{"success": true, "no_registrasi": noReg, "nobooking": nobooking})
}
