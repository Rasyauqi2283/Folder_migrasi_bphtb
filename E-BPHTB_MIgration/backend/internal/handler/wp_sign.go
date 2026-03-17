package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	mail "ebphtb/backend/internal/email"
	"ebphtb/backend/internal/repository"
)

// WpSignHandler handles WP validation + sign invitation flow.
type WpSignHandler struct {
	userRepo *repository.UserRepo
	ppatRepo *repository.PpatRepo
}

func NewWpSignHandler(userRepo *repository.UserRepo, ppatRepo *repository.PpatRepo) *WpSignHandler {
	return &WpSignHandler{userRepo: userRepo, ppatRepo: ppatRepo}
}

func getUseridFromCookieOrHeader(r *http.Request) string {
	if c, err := r.Cookie("ebphtb_userid"); err == nil && c != nil && strings.TrimSpace(c.Value) != "" {
		return strings.TrimSpace(c.Value)
	}
	return strings.TrimSpace(r.Header.Get("X-User-Id"))
}

func (h *WpSignHandler) requireWP(w http.ResponseWriter, r *http.Request) (userid string, ok bool) {
	userid = getUseridFromCookieOrHeader(r)
	if userid == "" {
		jsonError(w, http.StatusUnauthorized, "Unauthorized")
		return "", false
	}
	if h.userRepo == nil || h.userRepo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia")
		return "", false
	}
	u, err := h.userRepo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || u == nil {
		jsonError(w, http.StatusUnauthorized, "Unauthorized")
		return "", false
	}
	if strings.TrimSpace(u.Divisi) != "Wajib Pajak" {
		jsonError(w, http.StatusForbidden, "WP access required")
		return "", false
	}
	return userid, true
}

func (h *WpSignHandler) requireAuthenticated(w http.ResponseWriter, r *http.Request) (userid string, ok bool) {
	userid = getUseridFromCookieOrHeader(r)
	if userid == "" {
		jsonError(w, http.StatusUnauthorized, "Unauthorized")
		return "", false
	}
	if h.userRepo == nil || h.userRepo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia")
		return "", false
	}
	u, err := h.userRepo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || u == nil {
		jsonError(w, http.StatusUnauthorized, "Unauthorized")
		return "", false
	}
	return userid, true
}

type validateWpReq struct {
	NikNpwp string `json:"nik_npwp"`
	Email   string `json:"email"`
}

// ValidateWP handles POST /api/wp/validate.
// Validates that nik/npwp + email match a verified user with divisi "Wajib Pajak".
func (h *WpSignHandler) ValidateWP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	if h.userRepo == nil || h.userRepo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia")
		return
	}
	var req validateWpReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data tidak valid")
		return
	}
	niknpwp := strings.TrimSpace(req.NikNpwp)
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if niknpwp == "" || email == "" {
		jsonError(w, http.StatusBadRequest, "nik_npwp dan email wajib diisi")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()

	var wpUserid, wpNama, wpEmail string
	err := h.userRepo.Pool().QueryRow(ctx, `
		SELECT userid, COALESCE(nama,''), COALESCE(email,'')
		FROM a_2_verified_users
		WHERE divisi = 'Wajib Pajak'
		  AND (nik = $1 OR npwp_badan = $1)
		  AND LOWER(email) = $2
		LIMIT 1
	`, niknpwp, email).Scan(&wpUserid, &wpNama, &wpEmail)
	if err != nil {
		jsonError(w, http.StatusBadRequest, "Data WP tidak valid")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"userid": wpUserid,
			"nama":   wpNama,
			"email":  wpEmail,
		},
	})
}

type inviteSignReq struct {
	Nobooking string `json:"nobooking"`
	NikNpwp   string `json:"nik_npwp"`
	Email     string `json:"email"`
}

// InviteSign handles POST /api/wp/invite-sign.
// Called by PU/PPAT side: validates WP data, inserts pending sign request, and sends email.
func (h *WpSignHandler) InviteSign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	puUserid, ok := h.requireAuthenticated(w, r)
	if !ok {
		return
	}
	if h.userRepo == nil || h.userRepo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia")
		return
	}

	var req inviteSignReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data tidak valid")
		return
	}
	nb := strings.TrimSpace(req.Nobooking)
	niknpwp := strings.TrimSpace(req.NikNpwp)
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if nb == "" || niknpwp == "" || email == "" {
		jsonError(w, http.StatusBadRequest, "nobooking, nik_npwp, dan email wajib diisi")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 12*time.Second)
	defer cancel()

	// Validate booking ownership
	var exists int
	if err := h.userRepo.Pool().QueryRow(ctx, `SELECT 1 FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2`, nb, puUserid).Scan(&exists); err != nil {
		jsonError(w, http.StatusBadRequest, "Booking tidak ditemukan atau bukan milik Anda")
		return
	}

	// Validate WP
	var wpUserid, wpNama, wpEmail string
	err := h.userRepo.Pool().QueryRow(ctx, `
		SELECT userid, COALESCE(nama,''), COALESCE(email,'')
		FROM a_2_verified_users
		WHERE divisi = 'Wajib Pajak'
		  AND (nik = $1 OR npwp_badan = $1)
		  AND LOWER(email) = $2
		LIMIT 1
	`, niknpwp, email).Scan(&wpUserid, &wpNama, &wpEmail)
	if err != nil {
		jsonError(w, http.StatusBadRequest, "Data WP tidak valid")
		return
	}

	// PU display name for email
	var puName string
	_ = h.userRepo.Pool().QueryRow(ctx, `SELECT COALESCE(special_field, nama, userid) FROM a_2_verified_users WHERE userid = $1`, puUserid).Scan(&puName)
	if strings.TrimSpace(puName) == "" {
		puName = puUserid
	}

	// Insert request
	var requestID int64
	err = h.userRepo.Pool().QueryRow(ctx, `
		INSERT INTO wp_sign_requests (nobooking, wp_userid, wp_email, pu_userid, status)
		VALUES ($1,$2,$3,$4,'pending')
		ON CONFLICT (nobooking, wp_userid)
		DO UPDATE SET wp_email=EXCLUDED.wp_email, pu_userid=EXCLUDED.pu_userid, status='pending', updated_at=now()
		RETURNING id
	`, nb, wpUserid, wpEmail, puUserid).Scan(&requestID)
	if err != nil {
		log.Printf("[WP] invite-sign insert: %v", err)
		jsonError(w, http.StatusInternalServerError, "Gagal membuat permintaan tanda tangan")
		return
	}

	// Best-effort email
	emailErr := mail.SendWpSignInvitation(wpEmail, wpNama, puName, nb)
	if emailErr != nil {
		log.Printf("[WP] invite-sign email warning: %v", emailErr)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Permintaan berhasil dibuat",
		"data": map[string]interface{}{
			"id":         requestID,
			"nobooking":  nb,
			"wp_userid":  wpUserid,
			"wp_email":   wpEmail,
			"pu_userid":  puUserid,
			"email_sent": emailErr == nil,
		},
	})
}

// ListSignRequests handles GET /api/wp/sign-requests (WP only).
func (h *WpSignHandler) ListSignRequests(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	wpUserid, ok := h.requireWP(w, r)
	if !ok {
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	rows, err := h.userRepo.Pool().Query(ctx, `
		SELECT id, nobooking, pu_userid, status, created_at, updated_at
		FROM wp_sign_requests
		WHERE wp_userid = $1
		ORDER BY updated_at DESC, created_at DESC
		LIMIT 200
	`, wpUserid)
	if err != nil {
		log.Printf("[WP] sign-requests list: %v", err)
		jsonError(w, http.StatusInternalServerError, "Gagal memuat data")
		return
	}
	defer rows.Close()

	out := []map[string]interface{}{}
	for rows.Next() {
		var id int64
		var nobooking, puUserid, status string
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &nobooking, &puUserid, &status, &createdAt, &updatedAt); err != nil {
			continue
		}
		out = append(out, map[string]interface{}{
			"id":         id,
			"nobooking":  nobooking,
			"pu_userid":  puUserid,
			"status":     status,
			"created_at": createdAt,
			"updated_at": updatedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    out,
	})
}

// ApproveSignRequest handles POST /api/wp/sign-requests/{id}/approve (WP only).
func (h *WpSignHandler) ApproveSignRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	wpUserid, ok := h.requireWP(w, r)
	if !ok {
		return
	}
	idStr := strings.TrimSpace(r.PathValue("id"))
	id, _ := strconv.ParseInt(idStr, 10, 64)
	if id <= 0 {
		jsonError(w, http.StatusBadRequest, "id tidak valid")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	cmd, err := h.userRepo.Pool().Exec(ctx, `
		UPDATE wp_sign_requests
		SET status='approved', updated_at=now()
		WHERE id=$1 AND wp_userid=$2
	`, id, wpUserid)
	if err != nil {
		log.Printf("[WP] approve: %v", err)
		jsonError(w, http.StatusInternalServerError, "Gagal menyetujui")
		return
	}
	if cmd.RowsAffected() == 0 {
		jsonError(w, http.StatusNotFound, "Permintaan tidak ditemukan")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Disetujui",
	})
}

