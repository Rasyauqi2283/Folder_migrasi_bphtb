package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"ebphtb/backend/internal/email"
	"ebphtb/backend/internal/idgen"
	"ebphtb/backend/internal/repository"
)

const defaultFotoprofil = "/penting_F_simpan/profile-photo/default-foto-profile.png"

// UsersHandler handles /api/users/* for admin data user (pending, complete, generate-userid, assign).
type UsersHandler struct {
	repo           *repository.UserRepo
	tempUploadsDir string
}

// NewUsersHandler creates a UsersHandler.
func NewUsersHandler(repo *repository.UserRepo, tempUploadsDir string) *UsersHandler {
	return &UsersHandler{repo: repo, tempUploadsDir: tempUploadsDir}
}

// GetPending returns list of users with verifiedstatus IN ('verified_pending','pending').
func (h *UsersHandler) GetPending(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonResponse(w, http.StatusOK, []interface{}{})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	list, err := h.repo.ListPendingUsers(ctx)
	if err != nil {
		log.Printf("[USERS] ListPendingUsers: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Gagal memuat data pengguna"})
		return
	}
	// Marshal as array of objects for frontend (id, nama, email, nik, telepon, userid, divisi, ppat_khusus, gender, verse, special_field, pejabat_umum).
	out := make([]map[string]interface{}, 0, len(list))
	for _, u := range list {
		o := map[string]interface{}{
			"id": u.ID, "nama": u.Nama, "email": u.Email, "nik": u.NIK, "telepon": u.Telepon,
			"userid": nil, "divisi": nil, "ppat_khusus": nil,
			"gender": nil, "verse": nil, "special_field": nil, "pejabat_umum": nil,
			"npwp_badan": nil, "nib": nil, "nib_doc_path": nil,
		}
		if u.Userid != nil {
			o["userid"] = *u.Userid
		}
		if u.Divisi != nil {
			o["divisi"] = *u.Divisi
		}
		if u.PpatKhusus != nil {
			o["ppat_khusus"] = *u.PpatKhusus
		}
		if u.Gender != nil {
			o["gender"] = *u.Gender
		}
		if u.Verse != nil {
			o["verse"] = *u.Verse
		}
		if u.SpecialField != nil {
			o["special_field"] = *u.SpecialField
		}
		if u.PejabatUmum != nil {
			o["pejabat_umum"] = *u.PejabatUmum
		}
		if u.NpwpBadan != nil {
			o["npwp_badan"] = *u.NpwpBadan
		}
		if u.Nib != nil {
			o["nib"] = *u.Nib
		}
		if u.NibDocPath != nil {
			o["nib_doc_path"] = *u.NibDocPath
		}
		out = append(out, o)
	}
	jsonResponse(w, http.StatusOK, out)
}

// GetComplete returns list of users with verifiedstatus = 'complete'.
func (h *UsersHandler) GetComplete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonResponse(w, http.StatusOK, []interface{}{})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	list, err := h.repo.ListCompleteUsers(ctx)
	if err != nil {
		log.Printf("[USERS] ListCompleteUsers: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Gagal memuat data pengguna"})
		return
	}
	out := make([]map[string]interface{}, 0, len(list))
	for _, u := range list {
		o := map[string]interface{}{
			"id": u.ID, "userid": u.Userid, "divisi": u.Divisi, "nama": u.Nama, "email": u.Email,
			"nik": u.NIK, "telepon": u.Telepon, "username": u.Username, "nip": u.NIP,
			"special_parafv": u.SpecialParafv, "special_field": u.SpecialField,
			"ppat_khusus": u.PpatKhusus, "pejabat_umum": u.PejabatUmum,
			"status_ppat": u.StatusPpat, "verse": u.Verse,
			"verifiedstatus": u.Verifiedstatus, "statuspengguna": u.Statuspengguna,
		}
		out = append(out, o)
	}
	jsonResponse(w, http.StatusOK, out)
}

// GenerateUserIDRequest is the JSON body for POST /api/users/generate-userid.
type GenerateUserIDRequest struct {
	Divisi string `json:"divisi"` // code: PAT, A, CS, ...
}

// GenerateUserIDResponse is the JSON response.
type GenerateUserIDResponse struct {
	Success    bool   `json:"success"`
	NewUserID  string `json:"newUserID,omitempty"`
	PpatKhusus string `json:"ppat_khusus,omitempty"`
	Divisi     string `json:"divisi,omitempty"`
	Message    string `json:"message,omitempty"`
}

// GenerateUserID generates next userid (and optionally ppat_khusus) for the given divisi code.
func (h *UsersHandler) GenerateUserID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonResponse(w, http.StatusServiceUnavailable, GenerateUserIDResponse{Success: false, Message: "Database tidak tersedia"})
		return
	}
	var req GenerateUserIDRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, http.StatusBadRequest, GenerateUserIDResponse{Success: false, Message: "Body tidak valid"})
		return
	}
	divisiCode := strings.TrimSpace(req.Divisi)
	divisiName := idgen.DivisiCodeToName[divisiCode]
	if divisiName == "" {
		jsonResponse(w, http.StatusBadRequest, GenerateUserIDResponse{
			Success: false,
			Message: "Divisi tidak valid. Pilihan: PAT, PATS, A, CS, LTB, LSB, P, PV, BANK, WP",
		})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	pool := h.repo.Pool()
	tx, err := pool.Begin(ctx)
	if err != nil {
		log.Printf("[USERS] Begin tx: %v", err)
		jsonResponse(w, http.StatusInternalServerError, GenerateUserIDResponse{Success: false, Message: "Gagal generate ID"})
		return
	}
	defer tx.Rollback(ctx)
	newUserID, err := idgen.GenerateUserID(ctx, tx, divisiName)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, GenerateUserIDResponse{Success: false, Message: err.Error()})
		return
	}
	var ppatKhusus string
	if divisiName == "PPAT" || divisiName == "PPATS" {
		ppatKhusus, err = idgen.GeneratePPATNumber(ctx, tx)
		if err != nil {
			jsonResponse(w, http.StatusBadRequest, GenerateUserIDResponse{Success: false, Message: err.Error()})
			return
		}
	}
	if err := tx.Commit(ctx); err != nil {
		log.Printf("[USERS] Commit: %v", err)
		jsonResponse(w, http.StatusInternalServerError, GenerateUserIDResponse{Success: false, Message: "Gagal generate ID"})
		return
	}
	jsonResponse(w, http.StatusOK, GenerateUserIDResponse{
		Success:    true,
		NewUserID:  newUserID,
		PpatKhusus: ppatKhusus,
		Divisi:     divisiName,
	})
}

// AssignUserIDRequest is the JSON body for POST /api/users/assign-userid-and-divisi.
type AssignUserIDRequest struct {
	Email     string `json:"email"`
	Nama      string `json:"nama"`
	UserEmail string `json:"user_email"`
	Divisi    string `json:"divisi"` // code: PAT, A, CS, ...
}

// AssignUserIDResponse is the JSON response.
type AssignUserIDResponse struct {
	Status  string                 `json:"status"`
	Message string                 `json:"message"`
	User    map[string]interface{} `json:"user,omitempty"`
}

// AssignUserIDAndDivisi assigns userid and divisi to a pending user, sets status complete, sends email.
func (h *UsersHandler) AssignUserIDAndDivisi(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonResponse(w, http.StatusServiceUnavailable, AssignUserIDResponse{Status: "error", Message: "Database tidak tersedia"})
		return
	}
	var req AssignUserIDRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, http.StatusBadRequest, AssignUserIDResponse{Status: "error", Message: "Body tidak valid"})
		return
	}
	email := strings.TrimSpace(req.Email)
	if email == "" {
		email = strings.TrimSpace(req.UserEmail)
	}
	if email == "" || !strings.Contains(email, "@") {
		jsonResponse(w, http.StatusBadRequest, AssignUserIDResponse{Status: "error", Message: "Email harus valid"})
		return
	}
	divisiCode := strings.TrimSpace(req.Divisi)
	divisiName := idgen.DivisiCodeToName[divisiCode]
	if divisiName == "" {
		jsonResponse(w, http.StatusBadRequest, AssignUserIDResponse{
			Status:  "error",
			Message: "Divisi tidak valid. Pilihan: PAT, PATS, A, CS, LTB, LSB, P, PV, BANK, WP",
		})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	pool := h.repo.Pool()
	tx, err := pool.Begin(ctx)
	if err != nil {
		log.Printf("[USERS] Assign Begin: %v", err)
		jsonResponse(w, http.StatusInternalServerError, AssignUserIDResponse{Status: "error", Message: "Terjadi kesalahan sistem"})
		return
	}
	defer tx.Rollback(ctx)
	pending, err := h.repo.GetPendingByEmail(ctx, email)
	if err != nil || pending == nil {
		jsonResponse(w, http.StatusNotFound, AssignUserIDResponse{Status: "error", Message: "User tidak ditemukan atau sudah memiliki UserID"})
		return
	}
	// WP Badan pending harus tetap memakai divisi "Wajib Pajak B" saat di-complete.
	if pending.Verse != nil && strings.EqualFold(strings.TrimSpace(*pending.Verse), "WP") &&
		pending.Divisi != nil && strings.Contains(strings.ToLower(strings.TrimSpace(*pending.Divisi)), "wajib pajak b") {
		divisiName = "Wajib Pajak B"
	}
	newUserID := ""
	if pending.Userid != nil && strings.TrimSpace(*pending.Userid) != "" {
		newUserID = strings.TrimSpace(*pending.Userid)
	} else {
		idSeedDivisi := divisiName
		if divisiName == "Wajib Pajak B" {
			idSeedDivisi = "Wajib Pajak"
		}
		newUserID, err = idgen.GenerateUserID(ctx, tx, idSeedDivisi)
		if err != nil {
			jsonResponse(w, http.StatusBadRequest, AssignUserIDResponse{Status: "error", Message: err.Error()})
			return
		}
	}
	var ppatKhusus string
	if divisiName == "PPAT" || divisiName == "PPATS" {
		ppatKhusus, err = idgen.GeneratePPATNumber(ctx, tx)
		if err != nil {
			jsonResponse(w, http.StatusBadRequest, AssignUserIDResponse{Status: "error", Message: err.Error()})
			return
		}
	}
	err = h.repo.UpdateToCompleteTx(ctx, tx, email, newUserID, divisiName, defaultFotoprofil, ppatKhusus)
	if err != nil {
		log.Printf("[USERS] UpdateToCompleteTx: %v", err)
		jsonResponse(w, http.StatusInternalServerError, AssignUserIDResponse{Status: "error", Message: "Terjadi kesalahan sistem"})
		return
	}
	if err := tx.Commit(ctx); err != nil {
		log.Printf("[USERS] Assign Commit: %v", err)
		jsonResponse(w, http.StatusInternalServerError, AssignUserIDResponse{Status: "error", Message: "Terjadi kesalahan sistem"})
		return
	}
	// Hapus permanen data KTP dari tabel OCR untuk mengurangi kepenuhan data (user sudah complete)
	if delErr := h.repo.DeleteCekKtpOcrByIdentity(ctx, pending.NIK, pending.Email); delErr != nil {
		log.Printf("[USERS] DeleteCekKtpOcrByIdentity(%s,%s): %v", pending.NIK, pending.Email, delErr)
	}
	// Send email notification (non-blocking)
	go func() {
		if sendErr := sendUserIDNotification(email, pending.Nama, newUserID); sendErr != nil {
			log.Printf("[USERS] Email notification to %s: %v", email, sendErr)
		} else {
			log.Printf("[USERS] Email notification sent to %s", email)
		}
	}()
	userMap := map[string]interface{}{
		"id": pending.ID, "userid": newUserID, "divisi": divisiName, "nama": pending.Nama, "email": pending.Email,
		"nik": pending.NIK, "telepon": pending.Telepon, "ppat_khusus": ppatKhusus, "verifiedstatus": "complete",
	}
	jsonResponse(w, http.StatusOK, AssignUserIDResponse{
		Status:  "success",
		Message: "UserID berhasil diassign",
		User:    userMap,
	})
}

func jsonResponse(w http.ResponseWriter, status int, body interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

// sendUserIDNotification sends "akun aktif" email.
func sendUserIDNotification(to, nama, userid string) error {
	return email.SendUserIDNotification(to, nama, userid)
}

// KTPPreviewResponse is the JSON response for KTP preview (data ekstraksi OCR, bukan gambar).
type KTPPreviewResponse struct {
	Success    bool        `json:"success"`
	KtpOcrJson string      `json:"ktpOcrJson,omitempty"`
	Data       interface{} `json:"data,omitempty"` // parsed JSON untuk tampilan UI
	Message    string      `json:"message,omitempty"`
}

// KTPPreview returns KTP OCR JSON untuk user pending by id. Data diambil dari tabel OCR by NIK/email.
// Pengecekan NIK: NIK di JSON harus sama dengan NIK di database agar data tidak tertukar.
func (h *UsersHandler) KTPPreview(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	idStr := r.PathValue("id")
	if idStr == "" {
		jsonResponse(w, http.StatusBadRequest, KTPPreviewResponse{
			Success: false, Message: "ID user wajib",
		})
		return
	}
	var id int
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil {
		jsonResponse(w, http.StatusBadRequest, KTPPreviewResponse{
			Success: false, Message: "ID user tidak valid",
		})
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonResponse(w, http.StatusServiceUnavailable, KTPPreviewResponse{
			Success: false, Message: "Database tidak tersedia",
		})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	u, err := h.repo.GetPendingByID(ctx, id)
	if err != nil {
		log.Printf("[KTPPreview] GetPendingByID: %v", err)
		jsonResponse(w, http.StatusInternalServerError, KTPPreviewResponse{
			Success: false, Message: "Gagal memuat data user",
		})
		return
	}
	if u == nil {
		jsonResponse(w, http.StatusNotFound, KTPPreviewResponse{
			Success: false, Message: "User tidak ditemukan atau bukan status pending",
		})
		return
	}
	// Ambil ktp_ocr_json dari tabel OCR by NIK/email
	ktpJson, err := h.repo.GetCekKtpOcrByIdentity(ctx, u.NIK, u.Email)
	if err != nil {
		log.Printf("[KTPPreview] GetCekKtpOcrByIdentity: %v", err)
		jsonResponse(w, http.StatusInternalServerError, KTPPreviewResponse{
			Success: false, Message: "Gagal memuat data KTP",
		})
		return
	}
	if ktpJson == "" {
		jsonResponse(w, http.StatusOK, KTPPreviewResponse{
			Success: false, Data: map[string]string{"message": "Data KTP tidak tersedia untuk user ini."},
		})
		return
	}
	// Validasi NIK: NIK di JSON harus sama dengan NIK di database
	var parsed map[string]interface{}
	_ = json.Unmarshal([]byte(ktpJson), &parsed)
	jsonNIK, _ := parsed["nik"].(string)
	if jsonNIK != "" && u.NIK != "" && jsonNIK != u.NIK {
		jsonResponse(w, http.StatusBadRequest, KTPPreviewResponse{
			Success: false, Message: "NIK di data KTP tidak sesuai dengan NIK user. Data tidak boleh tertukar.",
		})
		return
	}
	jsonResponse(w, http.StatusOK, KTPPreviewResponse{
		Success: true, KtpOcrJson: ktpJson, Data: parsed,
	})
}

func (h *UsersHandler) requireAdmin(w http.ResponseWriter, r *http.Request) bool {
	userid := getUseridFromCookieOrHeader(r)
	if userid == "" {
		jsonResponse(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return false
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonResponse(w, http.StatusServiceUnavailable, map[string]string{"error": "Database tidak tersedia"})
		return false
	}
	u, err := h.repo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || u == nil {
		jsonResponse(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return false
	}
	d := strings.ToLower(strings.TrimSpace(u.Divisi))
	if d != "admin" && d != "administrator" {
		jsonResponse(w, http.StatusForbidden, map[string]string{"error": "Admin access required"})
		return false
	}
	return true
}

// ApproveWPBadan approves WP Badan Usaha registration (verifiedstatus pending -> complete).
func (h *UsersHandler) ApproveWPBadan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	idStr := strings.TrimSpace(r.PathValue("id"))
	var id int
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil || id <= 0 {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "id tidak valid"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	u, err := h.repo.GetPendingByID(ctx, id)
	if err != nil || u == nil {
		jsonResponse(w, http.StatusNotFound, map[string]string{"error": "Data tidak ditemukan"})
		return
	}
	if u.Verse == nil || strings.ToUpper(strings.TrimSpace(*u.Verse)) != "WP" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Bukan pending WP"})
		return
	}
	if u.Divisi == nil || strings.TrimSpace(*u.Divisi) != "Wajib Pajak B" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Bukan pending WP Badan Usaha"})
		return
	}
	if u.Userid == nil || strings.TrimSpace(*u.Userid) == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "UserID belum tersedia"})
		return
	}

	cmd, err := h.repo.Pool().Exec(ctx, `
		UPDATE a_2_verified_users
		SET verifiedstatus='complete', updated_at=now()
		WHERE id=$1 AND verifiedstatus='pending' AND verse='WP' AND divisi='Wajib Pajak B'
	`, id)
	if err != nil {
		log.Printf("[WP_BADAN] approve update: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Gagal menyetujui"})
		return
	}
	if cmd.RowsAffected() == 0 {
		jsonResponse(w, http.StatusNotFound, map[string]string{"error": "Data tidak ditemukan atau sudah diproses"})
		return
	}

	go func(emailAddr, nama, userid string) {
		if sendErr := email.SendUserIDNotification(emailAddr, nama, userid); sendErr != nil {
			log.Printf("[WP_BADAN] email notification to %s: %v", emailAddr, sendErr)
		}
	}(u.Email, u.Nama, strings.TrimSpace(*u.Userid))

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "WP Badan Usaha disetujui",
	})
}

// RejectWPBadan rejects pending account and deletes its pending record.
// Endpoint path dipertahankan untuk kompatibilitas frontend lama.
func (h *UsersHandler) RejectWPBadan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	idStr := strings.TrimSpace(r.PathValue("id"))
	var id int
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil || id <= 0 {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "id tidak valid"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	u, err := h.repo.GetPendingByID(ctx, id)
	if err != nil || u == nil {
		jsonResponse(w, http.StatusNotFound, map[string]string{"error": "Data tidak ditemukan"})
		return
	}
	isWPBadan := u.Verse != nil && strings.EqualFold(strings.TrimSpace(*u.Verse), "WP") &&
		u.Divisi != nil && strings.Contains(strings.ToLower(strings.TrimSpace(*u.Divisi)), "wajib pajak b")
	// Best-effort delete NIB doc file (privacy) hanya untuk WP Badan.
	if isWPBadan && h.tempUploadsDir != "" && u.NibDocPath != nil && strings.TrimSpace(*u.NibDocPath) != "" {
		p := strings.TrimSpace(*u.NibDocPath)
		// allow both "nib_docs/<id>.pdf" and "/api/uploads/nib/<id>.pdf"
		base := filepath.Base(p)
		if strings.HasSuffix(strings.ToLower(base), ".pdf") {
			fpath := filepath.Join(h.tempUploadsDir, "nib_docs", base)
			_ = os.Remove(fpath)
		}
	}

	cmd, err := h.repo.Pool().Exec(ctx, `
		DELETE FROM a_2_verified_users
		WHERE id=$1 AND verifiedstatus IN ('pending','verified_pending')
	`, id)
	if err != nil {
		log.Printf("[WP_BADAN] reject delete: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Gagal menolak"})
		return
	}
	if cmd.RowsAffected() == 0 {
		jsonResponse(w, http.StatusNotFound, map[string]string{"error": "Data tidak ditemukan atau sudah diproses"})
		return
	}
	if delErr := h.repo.DeleteCekKtpOcrByIdentity(ctx, u.NIK, u.Email); delErr != nil {
		log.Printf("[PENDING_REJECT] DeleteCekKtpOcrByIdentity(%s,%s): %v", u.NIK, u.Email, delErr)
	}
	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Data pending ditolak dan dihapus",
	})
}

// PutUserRequest is the JSON body for PUT /api/users/{userid}.
type PutUserRequest struct {
	Userid        string `json:"userid"`
	Divisi        string `json:"divisi"`
	Nama          string `json:"nama"`
	Email         string `json:"email"`
	Telepon       string `json:"telepon"`
	Username      string `json:"username"`
	NIP           string `json:"nip"`
	SpecialParafv string `json:"special_parafv"`
	SpecialField  string `json:"special_field"`
	PejabatUmum   string `json:"pejabat_umum"`
	PpatKhusus    string `json:"ppat_khusus"`
}

// PutUser updates complete user (nama, telepon, username, nip).
func (h *UsersHandler) PutUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	userid := strings.TrimSpace(r.PathValue("userid"))
	if userid == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "userid wajib"})
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonResponse(w, http.StatusServiceUnavailable, map[string]string{"error": "Database tidak tersedia"})
		return
	}
	var req PutUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Body tidak valid"})
		return
	}
	req.Userid = userid
	if req.Nama == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Nama wajib"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	err := h.repo.UpdateCompleteUser(ctx, userid, req.Nama, req.Telepon, req.Username, req.NIP,
		req.SpecialParafv, req.SpecialField, req.PejabatUmum, req.PpatKhusus)
	if err != nil {
		log.Printf("[USERS] UpdateCompleteUser: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Gagal mengupdate data"})
		return
	}
	jsonResponse(w, http.StatusOK, map[string]string{"status": "success", "message": "Data berhasil diupdate"})
}

// PutStatusPpatRequest is the JSON body for PUT /api/users/{userid}/status-ppat.
type PutStatusPpatRequest struct {
	StatusPpat string `json:"status_ppat"`
}

// PutStatusPpat updates status_ppat for PPAT/PPATS user.
func (h *UsersHandler) PutStatusPpat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	userid := strings.TrimSpace(r.PathValue("userid"))
	if userid == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "userid wajib"})
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonResponse(w, http.StatusServiceUnavailable, map[string]string{"error": "Database tidak tersedia"})
		return
	}
	var req PutStatusPpatRequest
	_ = json.NewDecoder(r.Body).Decode(&req)
	statusPpat := strings.TrimSpace(req.StatusPpat)
	if statusPpat == "" {
		statusPpat = "-"
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	err := h.repo.UpdateStatusPpat(ctx, userid, statusPpat)
	if err != nil {
		log.Printf("[USERS] UpdateStatusPpat: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Gagal mengupdate status PPAT"})
		return
	}
	jsonResponse(w, http.StatusOK, map[string]string{"status": "success", "message": "Status PPAT berhasil diupdate"})
}

// DeleteUser deletes complete user (non-Administrator only).
func (h *UsersHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	userid := strings.TrimSpace(r.PathValue("userid"))
	if userid == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "userid wajib"})
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonResponse(w, http.StatusServiceUnavailable, map[string]string{"error": "Database tidak tersedia"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	err := h.repo.DeleteCompleteByUserid(ctx, userid)
	if err != nil {
		log.Printf("[USERS] DeleteCompleteByUserid: %v", err)
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Gagal menghapus data"})
		return
	}
	jsonResponse(w, http.StatusOK, map[string]string{"status": "success", "message": "Data berhasil dihapus"})
}
