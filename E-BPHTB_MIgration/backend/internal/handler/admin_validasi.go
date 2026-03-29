package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"ebphtb/backend/internal/pdf"
	"ebphtb/backend/internal/repository"
)

// AdminValidasiHandler handles /api/admin/validate-qr/* for QR validation.
type AdminValidasiHandler struct {
	userRepo *repository.UserRepo
	valRepo  *repository.ValidationRepo
}

// NewAdminValidasiHandler creates a handler.
func NewAdminValidasiHandler(userRepo *repository.UserRepo, valRepo *repository.ValidationRepo) *AdminValidasiHandler {
	return &AdminValidasiHandler{userRepo: userRepo, valRepo: valRepo}
}

func (h *AdminValidasiHandler) requireAdmin(w http.ResponseWriter, r *http.Request) bool {
	userid := adminUseridFromCookie(r)
	if userid == "" {
		adminJSON(w, http.StatusUnauthorized, map[string]interface{}{
			"success": false,
			"message": "Unauthorized",
		})
		return false
	}
	if h.userRepo == nil || h.userRepo.Pool() == nil {
		adminJSON(w, http.StatusServiceUnavailable, map[string]interface{}{
			"success": false,
			"message": "Database tidak tersedia",
		})
		return false
	}
	user, err := h.userRepo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || user == nil {
		adminJSON(w, http.StatusUnauthorized, map[string]interface{}{
			"success": false,
			"message": "Unauthorized",
		})
		return false
	}
	div := strings.ToLower(strings.TrimSpace(user.Divisi))
	if div != "administrator" && div != "admin" && div != "a" {
		adminJSON(w, http.StatusForbidden, map[string]interface{}{
			"success": false,
			"message": "Admin access required",
		})
		return false
	}
	return true
}

// GetValidationStatistics handles GET /api/admin/validation-statistics.
// Mirrors legacy Node endpoint used by Admin dashboard pie chart.
func (h *AdminValidasiHandler) GetValidationStatistics(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	if h.userRepo == nil || h.userRepo.Pool() == nil {
		adminJSON(w, http.StatusServiceUnavailable, map[string]interface{}{
			"success": false,
			"message": "Database tidak tersedia",
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	var sudahValidasi, tinggalVerifikasi, belumTerurus int

	// 1) Sudah di Validasi: LSB sudah menyerahkan (lsb.trackstatus = 'Diserahkan')
	if err := h.userRepo.Pool().QueryRow(ctx, `
		SELECT COUNT(DISTINCT lsb.nobooking)::int AS count
		FROM lsb_1_serah_berkas lsb
		WHERE UPPER(TRIM(COALESCE(lsb.trackstatus, ''))) = 'DISERAHKAN'
	`).Scan(&sudahValidasi); err != nil {
		log.Printf("[ADMIN] validation-statistics sudahValidasi: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil statistik validasi",
		})
		return
	}

	// 2) Tinggal Verifikasi: PV menunggu (pv.status_tertampil = 'Menunggu')
	if err := h.userRepo.Pool().QueryRow(ctx, `
		SELECT COUNT(DISTINCT pv.nobooking)::int AS count
		FROM pv_1_paraf_validate pv
		WHERE UPPER(TRIM(COALESCE(pv.status_tertampil, ''))) = 'MENUNGGU'
	`).Scan(&tinggalVerifikasi); err != nil {
		log.Printf("[ADMIN] validation-statistics tinggalVerifikasi: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil statistik validasi",
		})
		return
	}

	// 3) Belum Terurus: masih di LTB (ltb.trackstatus = 'Diolah' atau ltb.status = 'Diterima')
	if err := h.userRepo.Pool().QueryRow(ctx, `
		SELECT COUNT(DISTINCT ltb.nobooking)::int AS count
		FROM ltb_1_terima_berkas_sspd ltb
		WHERE (UPPER(TRIM(COALESCE(ltb.trackstatus, ''))) = 'DIOLAH'
			OR UPPER(TRIM(COALESCE(ltb.status, ''))) = 'DITERIMA')
	`).Scan(&belumTerurus); err != nil {
		log.Printf("[ADMIN] validation-statistics belumTerurus: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil statistik validasi",
		})
		return
	}

	total := sudahValidasi + tinggalVerifikasi + belumTerurus
	pct := func(v int) int {
		if total <= 0 {
			return 0
		}
		return int((float64(v) / float64(total)) * 100.0 + 0.5) // round
	}

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"total": total,
			"sudahValidasi": map[string]interface{}{
				"count":       sudahValidasi,
				"label":       "Sudah di Validasi",
				"description": "LSB sudah memberikan dokumen terverifikasi ke PPAT",
				"percentage":  pct(sudahValidasi),
			},
			"tinggalVerifikasi": map[string]interface{}{
				"count":       tinggalVerifikasi,
				"label":       "Tinggal Verifikasi",
				"description": "Dokumen sudah masuk ke role atau layanan pejabat (peneliti validasi)",
				"percentage":  pct(tinggalVerifikasi),
			},
			"belumTerurus": map[string]interface{}{
				"count":       belumTerurus,
				"label":       "Belum Terurus",
				"description": "Masih di dalam layanan LTB",
				"percentage":  pct(belumTerurus),
			},
		},
	})
}

// GetValidateQR handles GET /api/admin/validate-qr/{no_validasi}.
func (h *AdminValidasiHandler) GetValidateQR(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	noValidasi := strings.TrimSpace(r.PathValue("no_validasi"))
	if noValidasi == "" {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Nomor validasi tidak valid",
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	v, err := h.valRepo.GetByNoValidasi(ctx, noValidasi)
	if err != nil {
		log.Printf("[ADMIN] GetByNoValidasi: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Terjadi kesalahan saat memvalidasi nomor validasi",
		})
		return
	}
	if v == nil {
		adminJSON(w, http.StatusNotFound, map[string]interface{}{
			"success":    false,
			"message":    "Nomor validasi tidak ditemukan dalam sistem",
			"no_validasi": noValidasi,
		})
		return
	}

	ptr := func(s *string) interface{} {
		if s == nil {
			return nil
		}
		return *s
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Nomor validasi ini asli sesuai ketentuan BAPPENDA Kabupaten Bogor",
		"validation_info": map[string]interface{}{
			"no_validasi":              v.NoValidasi,
			"status":                   ptr(v.Status),
			"trackstatus":              ptr(v.Trackstatus),
			"status_tertampil":         ptr(v.StatusTertampil),
			"keterangan":               ptr(v.Keterangan),
			"created_at":               v.CreatedAt,
			"updated_at":               v.UpdatedAt,
			"bphtb_yangtelah_dibayar":  v.BphtbYangtelahDibayar,
		},
		"document_info": map[string]interface{}{
			"nobooking":              ptr(v.Nobooking),
			"no_registrasi":          ptr(v.NoRegistrasi),
			"noppbb":                 ptr(v.Noppbb),
			"tanggal":                ptr(v.Tanggal),
			"tahunajb":               ptr(v.Tahunajb),
			"namawajibpajak":         ptr(v.Namawajibpajak),
			"namapemilikobjekpajak":  ptr(v.Namapemilikobjekpajak),
			"npwpwp":                 ptr(v.Npwpwp),
			"booking_trackstatus":    ptr(v.BookingTrackstatus),
		},
		"ppat_info": map[string]interface{}{
			"nama":          ptr(v.PpatNama),
			"special_field": ptr(v.PpatSpecialField),
			"divisi":        ptr(v.PpatDivisi),
		},
		"peneliti_info": map[string]interface{}{
			"nama":          ptr(v.PenelitiNama),
			"special_parafv": ptr(v.PenelitiSpecialParafv),
			"nip":           ptr(v.PenelitiNip),
		},
		"authenticity": map[string]interface{}{
			"verified":            true,
			"verification_method": "QR_CODE_VALIDATION",
			"institution":         "BAPPENDA Kabupaten Bogor",
		},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GeneratePdfValidasi handles GET /api/admin/generate-pdf-validasi/{no_validasi}.
// It generates the final "BUKTI VALIDASI" PDF using Go (pixel-perfect port of legacy Node generator).
func (h *AdminValidasiHandler) GeneratePdfValidasi(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	noValidasi := strings.TrimSpace(r.PathValue("no_validasi"))
	if noValidasi == "" {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "Nomor validasi tidak valid"})
		return
	}
	if h.valRepo == nil || h.valRepo.Pool() == nil {
		adminJSON(w, http.StatusServiceUnavailable, map[string]interface{}{"success": false, "message": "Database tidak tersedia"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	data, err := h.valRepo.GetValidasiPDFData(ctx, noValidasi)
	if err != nil {
		log.Printf("[ADMIN] GetValidasiPDFData: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Gagal memuat data PDF"})
		return
	}
	if data == nil {
		adminJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "Nomor validasi tidak ditemukan"})
		return
	}

	// Resolve logo path (prefer configured asset if exists).
	logoPath := ""
	if fallback, err := filepath.Abs("frontend-next/asset/Logobappenda_pdf.png"); err == nil {
		if _, err := os.Stat(fallback); err == nil {
			logoPath = fallback
		}
	}

	w.Header().Set("Content-Type", "application/pdf")
	disposition := "inline"
	if r.URL.Query().Get("download") != "" {
		disposition = "attachment"
	}
	w.Header().Set("Content-Disposition", disposition+`; filename="Bukti_Validasi_`+noValidasi+`.pdf"`)
	if err := pdf.GenerateValidasiPDF(w, data, logoPath); err != nil {
		log.Printf("[ADMIN] GeneratePdfValidasi PDF write: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "Gagal menghasilkan dokumen PDF"})
		return
	}
}

// GetValidateQRSearch handles GET /api/admin/validate-qr-search.
func (h *AdminValidasiHandler) GetValidateQRSearch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	search := strings.TrimSpace(r.URL.Query().Get("q"))
	status := strings.TrimSpace(r.URL.Query().Get("status"))

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	res, err := h.valRepo.SearchValidations(ctx, search, status, page, limit)
	if err != nil {
		log.Printf("[ADMIN] SearchValidations: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Terjadi kesalahan saat mencari data validasi",
		})
		return
	}

	formatted := make([]map[string]interface{}, 0, len(res.Rows))
	for _, row := range res.Rows {
		ptr := func(s *string) interface{} {
			if s == nil {
				return nil
			}
			return *s
		}
		formatted = append(formatted, map[string]interface{}{
			"no_validasi":      row.NoValidasi,
			"nobooking":        ptr(row.Nobooking),
			"namawajibpajak":   ptr(row.Namawajibpajak),
			"namapemilikobjekpajak": ptr(row.Namapemilikobjekpajak),
			"status":           ptr(row.Status),
			"trackstatus":      ptr(row.Trackstatus),
			"status_tertampil": ptr(row.StatusTertampil),
			"created_at":       row.CreatedAt,
			"updated_at":       row.UpdatedAt,
			"noppbb":           ptr(row.Noppbb),
			"tanggal":          ptr(row.Tanggal),
			"tahunajb":         ptr(row.Tahunajb),
			"ppat_nama":        ptr(row.PpatNama),
			"ppat_special_field": ptr(row.PpatSpecialField),
		})
	}

	totalPages := 1
	if limit > 0 {
		totalPages = (res.Total + limit - 1) / limit
	}

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    formatted,
		"pagination": map[string]interface{}{
			"page":       page,
			"limit":      limit,
			"total":      res.Total,
			"total_pages": totalPages,
		},
		"search_params": map[string]interface{}{
			"search": search,
			"status": status,
		},
	})
}
