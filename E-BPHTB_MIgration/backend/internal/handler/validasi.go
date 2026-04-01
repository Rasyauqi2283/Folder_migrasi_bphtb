package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"ebphtb/backend/internal/pdf"
	"ebphtb/backend/internal/repository"
	"github.com/jackc/pgx/v5"
)

// ValidasiHandler handles PV approval + PDF viewing for Peneliti Validasi.
type ValidasiHandler struct {
	userRepo *repository.UserRepo
	valRepo  *repository.ValidationRepo
}

func NewValidasiHandler(userRepo *repository.UserRepo, valRepo *repository.ValidationRepo) *ValidasiHandler {
	return &ValidasiHandler{userRepo: userRepo, valRepo: valRepo}
}

func (h *ValidasiHandler) requirePenelitiValidasi(w http.ResponseWriter, r *http.Request) (userid string, ok bool) {
	c, err := r.Cookie("ebphtb_userid")
	if err != nil || c == nil || strings.TrimSpace(c.Value) == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return "", false
	}
	userid = strings.TrimSpace(c.Value)
	if h.userRepo == nil || h.userRepo.Pool() == nil {
		http.Error(w, "Service unavailable", http.StatusServiceUnavailable)
		return "", false
	}
	u, err := h.userRepo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || u == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return "", false
	}
	div := strings.ToLower(strings.TrimSpace(u.Divisi))
	if div != strings.ToLower("Peneliti Validasi") {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return "", false
	}
	return userid, true
}

func validasiJSON(w http.ResponseWriter, code int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

// Approve handles POST /api/validasi/approve/{no_validasi}.
// It sets pv_1_paraf_validate.status/status_tertampil to validated and generates signed_pdf_path via Go generator.
// Uses DB transaction: if PDF generation/storage fails, status update is rolled back.
func (h *ValidasiHandler) Approve(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		validasiJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requirePenelitiValidasi(w, r)
	if !ok {
		return
	}
	noValidasi := strings.TrimSpace(r.PathValue("no_validasi"))
	if noValidasi == "" {
		validasiJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "no_validasi wajib"})
		return
	}
	if h.valRepo == nil || h.valRepo.Pool() == nil {
		validasiJSON(w, http.StatusServiceUnavailable, map[string]interface{}{"success": false, "message": "Database tidak tersedia"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 25*time.Second)
	defer cancel()

	tx, err := h.valRepo.Pool().Begin(ctx)
	if err != nil {
		validasiJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Gagal memulai transaksi"})
		return
	}
	defer tx.Rollback(ctx)

	// Lock PV row, ensure still "Menunggu".
	var nobooking string
	var noRegistrasi string
	var statusTertampil string
	err = tx.QueryRow(ctx, `
		SELECT COALESCE(nobooking,''), COALESCE(no_registrasi,''), COALESCE(status_tertampil,'')
		FROM pv_1_paraf_validate
		WHERE no_validasi = $1
		FOR UPDATE
	`, noValidasi).Scan(&nobooking, &noRegistrasi, &statusTertampil)
	if err != nil {
		validasiJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "Dokumen validasi tidak ditemukan"})
		return
	}
	if strings.TrimSpace(statusTertampil) != "" && !strings.EqualFold(strings.TrimSpace(statusTertampil), "Menunggu") {
		validasiJSON(w, http.StatusConflict, map[string]interface{}{"success": false, "message": "Dokumen sudah diproses"})
		return
	}
	noRegistrasi = strings.TrimSpace(noRegistrasi)
	if noRegistrasi != "" {
		var earlierNoReg, earlierNoValidasi string
		eErr := tx.QueryRow(ctx, `
			SELECT COALESCE(NULLIF(TRIM(no_registrasi), ''), ''), COALESCE(no_validasi, '')
			FROM pv_1_paraf_validate
			WHERE COALESCE(NULLIF(TRIM(no_registrasi), ''), '') <> ''
			  AND no_registrasi < $1
			  AND COALESCE(status_tertampil, 'Menunggu') = 'Menunggu'
			ORDER BY no_registrasi ASC
			LIMIT 1
		`, noRegistrasi).Scan(&earlierNoReg, &earlierNoValidasi)
		if eErr == nil {
			validasiJSON(w, http.StatusConflict, map[string]interface{}{
				"success": false,
				"message": fmt.Sprintf("FIFO aktif: selesaikan no registrasi %s (no validasi %s) terlebih dahulu", strings.TrimSpace(earlierNoReg), strings.TrimSpace(earlierNoValidasi)),
			})
			return
		}
		if !errors.Is(eErr, pgx.ErrNoRows) {
			validasiJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Gagal memeriksa antrean FIFO"})
			return
		}
	}

	// Update status first inside transaction (will rollback if PDF fails).
	if _, err := tx.Exec(ctx, `
		UPDATE pv_1_paraf_validate
		SET status = 'VALIDATED',
		    status_tertampil = 'Sudah Divalidasi',
		    pemverifikasi = $2,
		    updated_at = now()
		WHERE no_validasi = $1
	`, noValidasi, userid); err != nil {
		log.Printf("[VALIDASI] approve update pv_1: %v", err)
		validasiJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Gagal update status"})
		return
	}

	// Fetch data for PDF (outside repo to ensure it sees consistent DB state).
	data, err := h.valRepo.GetValidasiPDFData(ctx, noValidasi)
	if err != nil || data == nil {
		log.Printf("[VALIDASI] GetValidasiPDFData: %v", err)
		validasiJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Gagal memuat data untuk PDF"})
		return
	}

	// Generate PDF to memory.
	var buf bytes.Buffer
	logoPath := ""
	if fallback, err := filepath.Abs("frontend-next/asset/Logobappenda_pdf.png"); err == nil {
		if _, err := os.Stat(fallback); err == nil {
			logoPath = fallback
		}
	}
	if err := pdf.GenerateValidasiPDF(&buf, data, logoPath); err != nil {
		log.Printf("[VALIDASI] GenerateValidasiPDF: %v", err)
		validasiJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Gagal generate PDF"})
		return
	}

	// Persist PDF to storage.
	baseDir := "./storage/validasi"
	if err := os.MkdirAll(baseDir, 0755); err != nil {
		validasiJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Gagal menyiapkan storage"})
		return
	}
	filename := fmt.Sprintf("validasi_%s.pdf", noValidasi)
	fullPath := filepath.Join(baseDir, filename)
	if err := os.WriteFile(fullPath, buf.Bytes(), 0644); err != nil {
		log.Printf("[VALIDASI] write pdf: %v", err)
		validasiJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Gagal menyimpan PDF"})
		return
	}
	rel := "validasi/" + filename

	// Save signed_pdf_path in latest signing request if exists (best-effort).
	_, _ = tx.Exec(ctx, `
		UPDATE pv_2_signing_requests
		SET signed_pdf_path = $2,
		    status = 'Signed',
		    approved_by = $3,
		    approved_at = now(),
		    updated_at = now()
		WHERE no_validasi = $1
	`, noValidasi, rel, userid)

	if err := tx.Commit(ctx); err != nil {
		_ = os.Remove(fullPath)
		validasiJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Gagal menyimpan approval"})
		return
	}

	validasiJSON(w, http.StatusOK, map[string]interface{}{
		"success":     true,
		"message":     "Dokumen divalidasi dan ditandatangani secara digital.",
		"no_validasi": noValidasi,
		"nobooking":   nobooking,
		"pdf_url":     "/api/validasi/pdf/" + noValidasi,
	})
}

// ViewPDF handles GET /api/validasi/pdf/{no_validasi}.
// For now: only Peneliti Validasi can view via this endpoint.
func (h *ValidasiHandler) ViewPDF(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	_, ok := h.requirePenelitiValidasi(w, r)
	if !ok {
		return
	}
	noValidasi := strings.TrimSpace(r.PathValue("no_validasi"))
	if noValidasi == "" {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}
	if h.valRepo == nil || h.valRepo.Pool() == nil {
		http.Error(w, "Service unavailable", http.StatusServiceUnavailable)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()

	var rel string
	_ = h.valRepo.Pool().QueryRow(ctx, `
		SELECT COALESCE(signed_pdf_path,'')
		FROM pv_2_signing_requests
		WHERE no_validasi = $1
		ORDER BY id DESC
		LIMIT 1
	`, noValidasi).Scan(&rel)
	rel = strings.TrimSpace(rel)
	if rel == "" {
		http.Error(w, "PDF belum tersedia", http.StatusNotFound)
		return
	}
	// Security: enforce base dir.
	base := "./storage"
	clean := strings.TrimPrefix(strings.TrimPrefix(rel, "/storage/"), "storage/")
	if strings.Contains(clean, "..") {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}
	full := filepath.Join(base, clean)
	absFull, err := filepath.Abs(full)
	if err != nil {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}
	absBase, err := filepath.Abs(base)
	if err != nil || !strings.HasPrefix(absFull, absBase) {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}
	if _, err := os.Stat(absFull); err != nil {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", `inline; filename="Bukti_Validasi_`+noValidasi+`.pdf"`)
	http.ServeFile(w, r, absFull)
}
