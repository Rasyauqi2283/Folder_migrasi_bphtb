package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"ebphtb/backend/internal/config"
	"ebphtb/backend/internal/pdf"
	"ebphtb/backend/internal/repository"

	"github.com/jackc/pgx/v5"
)

// getPpatUserid returns userid from cookie ebphtb_userid or header X-User-Id (for PPAT endpoints).
func getPpatUserid(r *http.Request) string {
	if c, err := r.Cookie("ebphtb_userid"); err == nil && c != nil && strings.TrimSpace(c.Value) != "" {
		return strings.TrimSpace(c.Value)
	}
	return strings.TrimSpace(r.Header.Get("X-User-Id"))
}

// PpatHandler handles /api/ppat/* and /api/ppat_* endpoints (Go-native).
type PpatHandler struct {
	repo         *repository.PpatRepo
	bookingRepo  *repository.BookingRepo
	cfg          *config.Config
}

// NewPpatHandler creates a PpatHandler.
func NewPpatHandler(cfg *config.Config, repo *repository.PpatRepo, bookingRepo *repository.BookingRepo) *PpatHandler {
	return &PpatHandler{repo: repo, bookingRepo: bookingRepo, cfg: cfg}
}

// LoadAllBooking handles GET /api/ppat/load-all-booking.
func (h *PpatHandler) LoadAllBooking(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 {
		limit = 10
	}
	search := r.URL.Query().Get("search")
	if search == "" {
		search = r.URL.Query().Get("q")
	}
	status := r.URL.Query().Get("status")
	jenisWajibPajak := r.URL.Query().Get("jenis_wajib_pajak")

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	result, err := h.repo.LoadAllBooking(ctx, userid, page, limit, search, status, jenisWajibPajak)
	if err != nil {
		log.Printf("[PPAT] LoadAllBooking: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Failed to load booking data")
		return
	}
	// Response shape compatible with frontend: success, data, pagination
	data := make([]map[string]interface{}, 0, len(result.Data))
	for _, row := range result.Data {
		o := map[string]interface{}{
			"nobooking":             row.Nobooking,
			"noppbb":                nil,
			"namawajibpajak":        nil,
			"namapemilikobjekpajak": nil,
			"npwpwp":                nil,
			"tahunajb":              nil,
			"trackstatus":           nil,
			"jenis_wajib_pajak":     nil,
			"created_at":            nil,
			"updated_at":            nil,
			"akta_tanah_path":       nil,
			"sertifikat_tanah_path": nil,
			"pelengkap_path":        nil,
			"pdf_dokumen_path":      nil,
			"file_withstempel_path": nil,
		}
		if row.Noppbb != nil {
			o["noppbb"] = *row.Noppbb
		}
		if row.Namawajibpajak != nil {
			o["namawajibpajak"] = *row.Namawajibpajak
		}
		if row.Namapemilikobjekpajak != nil {
			o["namapemilikobjekpajak"] = *row.Namapemilikobjekpajak
		}
		if row.Npwpwp != nil {
			o["npwpwp"] = *row.Npwpwp
		}
		if row.Tahunajb != nil {
			o["tahunajb"] = *row.Tahunajb
		}
		if row.Trackstatus != nil {
			o["trackstatus"] = *row.Trackstatus
		}
		if row.JenisWajibPajak != nil {
			o["jenis_wajib_pajak"] = *row.JenisWajibPajak
		}
		if row.CreatedAt != nil {
			o["created_at"] = row.CreatedAt
		}
		if row.UpdatedAt != nil {
			o["updated_at"] = row.UpdatedAt
		}
		if row.AktaTanahPath != nil {
			o["akta_tanah_path"] = *row.AktaTanahPath
		}
		if row.SertifikatTanahPath != nil {
			o["sertifikat_tanah_path"] = *row.SertifikatTanahPath
		}
		if row.PelengkapPath != nil {
			o["pelengkap_path"] = *row.PelengkapPath
		}
		if row.PdfDokumenPath != nil {
			o["pdf_dokumen_path"] = *row.PdfDokumenPath
		}
		if row.FileWithstempelPath != nil {
			o["file_withstempel_path"] = *row.FileWithstempelPath
		}
		data = append(data, o)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    data,
		"pagination": map[string]interface{}{
			"page":  result.Page,
			"limit": result.Limit,
			"total": result.Total,
			"pages": result.Pages,
		},
	})
}

// RekapDiserahkan handles GET /api/ppat/rekap/diserahkan.
func (h *PpatHandler) RekapDiserahkan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	// Consider PPAT if divisi is PPAT or userid starts with PAT (we don't have divisi here, so use userid prefix)
	isPPAT := strings.HasPrefix(userid, "PAT") || strings.HasPrefix(userid, "NOTA") || strings.Contains(strings.ToUpper(userid), "PPAT")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 {
		limit = 100
	}
	search := r.URL.Query().Get("q")

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	result, err := h.repo.RekapDiserahkan(ctx, userid, isPPAT, page, limit, search)
	if err != nil {
		log.Printf("[PPAT] RekapDiserahkan: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Gagal mengambil data rekap diserahkan")
		return
	}
	rows := make([]map[string]interface{}, 0, len(result.Rows))
	for _, row := range result.Rows {
		o := map[string]interface{}{
			"nobooking":             row.Nobooking,
			"noppbb":                row.Noppbb,
			"tanggal":               row.Tanggal,
			"tahunajb":              row.Tahunajb,
			"namawajibpajak":        row.Namawajibpajak,
			"namapemilikobjekpajak": row.Namapemilikobjekpajak,
			"npwpwajibpajak":        row.Npwpwajibpajak,
			"trackstatus":           row.Trackstatus,
			"tanggal_formatted":     row.TanggalFormatted,
			"bphtb_yangtelah_dibayar": row.BphtbYangtelahDibayar,
		}
		rows = append(rows, o)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"rows":          rows,
		"totalNominal":  result.TotalNominal,
		"pagination": map[string]interface{}{
			"page":       result.Page,
			"limit":     result.Limit,
			"total":     result.Total,
			"totalPages": result.TotalPages,
		},
		"search": search,
	})
}

// SendNow handles POST /api/ppat/send-now.
func (h *PpatHandler) SendNow(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	var body struct {
		Nobooking string `json:"nobooking"`
	}
	nobooking := r.URL.Query().Get("nobooking")
	if nobooking == "" {
		_ = json.NewDecoder(r.Body).Decode(&body)
		nobooking = body.Nobooking
	}
	if nobooking == "" {
		ppatJSONError(w, http.StatusBadRequest, "nobooking required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	err := h.repo.SendNow(ctx, userid, nobooking)
	if err != nil {
		if errors.Is(err, repository.ErrPpatQuotaFull) {
			ppatJSONError(w, http.StatusConflict, "Kuota hari ini penuh")
			return
		}
		if errors.Is(err, repository.ErrPpatBookingNotSendable) {
			ppatJSONError(w, http.StatusConflict, "Booking tidak dapat dikirim")
			return
		}
		log.Printf("[PPAT] SendNow: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "message": "OK"})
}

// CreateBookingBadan handles POST /api/ppat_create-booking-and-bphtb.
func (h *PpatHandler) CreateBookingBadan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	var params repository.CreateBookingParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		ppatJSONError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	if params.Trackstatus == "" {
		params.Trackstatus = "Draft"
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	nobooking, err := h.repo.CreateBookingBadan(ctx, userid, &params)
	if err != nil {
		log.Printf("[PPAT] CreateBookingBadan: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"nobooking": nobooking,
		"message":  "Booking created",
	})
}

// CreateBookingPerorangan handles POST /api/ppat_create-booking-and-bphtb-perorangan.
func (h *PpatHandler) CreateBookingPerorangan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	var params repository.CreateBookingParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		ppatJSONError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	if params.Trackstatus == "" {
		params.Trackstatus = "Draft"
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	nobooking, err := h.repo.CreateBookingPerorangan(ctx, userid, &params)
	if err != nil {
		log.Printf("[PPAT] CreateBookingPerorangan: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"nobooking": nobooking,
		"message":  "Booking created",
	})
}

// GetBooking handles GET /api/ppat/booking/{nobooking}.
func (h *PpatHandler) GetBooking(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	nobooking := r.PathValue("nobooking")
	if nobooking == "" {
		ppatJSONError(w, http.StatusBadRequest, "nobooking required")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	data, err := h.repo.GetBookingByNobooking(ctx, userid, nobooking)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(err.Error(), "not found") {
			ppatJSONError(w, http.StatusNotFound, "Booking not found")
			return
		}
		log.Printf("[PPAT] GetBooking: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Failed to get booking")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": data, "jenis_wajib_pajak": data["jenis_wajib_pajak"]})
}

// UpdateTrackstatus handles PUT /api/ppat/update-trackstatus/{nobooking}.
func (h *PpatHandler) UpdateTrackstatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	nobooking := r.PathValue("nobooking")
	if nobooking == "" {
		ppatJSONError(w, http.StatusBadRequest, "nobooking required")
		return
	}
	var body struct {
		Trackstatus string `json:"trackstatus"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		ppatJSONError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	if body.Trackstatus == "" {
		ppatJSONError(w, http.StatusBadRequest, "trackstatus required")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	err := h.repo.UpdateTrackstatus(ctx, userid, nobooking, body.Trackstatus)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			ppatJSONError(w, http.StatusNotFound, "Booking not found")
			return
		}
		log.Printf("[PPAT] UpdateTrackstatus: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "message": "Status updated successfully"})
}

// DeleteBooking handles DELETE /api/ppat/booking/{nobooking}.
func (h *PpatHandler) DeleteBooking(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	nobooking := r.PathValue("nobooking")
	if nobooking == "" {
		ppatJSONError(w, http.StatusBadRequest, "nobooking required")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	err := h.repo.DeleteBooking(ctx, userid, nobooking)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			ppatJSONError(w, http.StatusNotFound, "Booking not found")
			return
		}
		log.Printf("[PPAT] DeleteBooking: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "message": "Booking deleted successfully"})
}

// GetQuota handles GET /api/ppat/quota.
func (h *PpatHandler) GetQuota(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	date := r.URL.Query().Get("date")
	if date != "" {
		// normalize to YYYY-MM-DD
		if t, err := time.Parse("2006-01-02", date); err == nil {
			date = t.Format("2006-01-02")
		}
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	q, err := h.repo.GetQuota(ctx, date)
	if err != nil {
		log.Printf("[PPAT] GetQuota: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Get quota failed")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    map[string]interface{}{"date": q.Date, "used": q.Used, "limit": q.Limit, "remaining": q.Remaining},
	})
}

// CheckMySignature handles GET /api/check-my-signature.
func (h *PpatHandler) CheckMySignature(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	sig, err := h.repo.GetUserSignature(ctx, userid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(err.Error(), "no rows") {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success":       false,
				"message":       "User not found",
				"has_signature": false,
			})
			return
		}
		log.Printf("[PPAT] CheckMySignature: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Failed to check signature")
		return
	}
	hasSig := sig.Path != nil && strings.TrimSpace(*sig.Path) != ""
	w.Header().Set("Content-Type", "application/json")
	out := map[string]interface{}{"success": true, "has_signature": hasSig}
	if sig.Path != nil {
		out["signature_path"] = *sig.Path
	}
	if sig.Mime != nil {
		out["signature_mime"] = *sig.Mime
	}
	json.NewEncoder(w).Encode(out)
}

// GetDocuments handles GET /api/ppat/get-documents.
func (h *PpatHandler) GetDocuments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	nobooking := r.URL.Query().Get("nobooking")
	if nobooking == "" {
		nobooking = r.URL.Query().Get("booking_id")
	}
	if nobooking == "" {
		ppatJSONError(w, http.StatusBadRequest, "nobooking required")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	row, err := h.repo.GetDocuments(ctx, userid, nobooking)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(err.Error(), "no rows") {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": nil, "documents": []interface{}{}})
			return
		}
		log.Printf("[PPAT] GetDocuments: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Failed to get documents")
		return
	}
	data := make(map[string]interface{})
	documents := make([]map[string]interface{}, 0, 3)
	docFor := func(p *string, label string) {
		if p == nil || strings.TrimSpace(*p) == "" {
			return
		}
		rel := strings.TrimPrefix(strings.TrimPrefix(*p, "/storage/ppat/"), "storage/ppat/")
		name := path.Base(rel)
		data[label] = map[string]interface{}{"fileUrl": *p, "fileName": name}
		documents = append(documents, map[string]interface{}{"url": rel, "name": name})
	}
	docFor(row.AktaTanahPath, "aktaTanah")
	docFor(row.SertifikatTanahPath, "sertifikatTanah")
	docFor(row.PelengkapPath, "pelengkap")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"data":      data,
		"documents": documents,
	})
}

// FileProxy handles GET /api/ppat/file-proxy.
func (h *PpatHandler) FileProxy(w http.ResponseWriter, r *http.Request) {
	relativePath := r.URL.Query().Get("relativePath")
	if relativePath == "" {
		http.Error(w, "relativePath required", http.StatusBadRequest)
		return
	}
	relativePath = strings.TrimPrefix(relativePath, "/")
	base := h.cfg.PpatStorageBaseDir
	if base == "" {
		base = "./storage/ppat"
	}
	// http.Dir.Open sanitizes path and prevents traversal
	f, err := http.Dir(base).Open(filepath.FromSlash(relativePath))
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer f.Close()
	info, err := f.Stat()
	if err != nil || info.IsDir() {
		http.NotFound(w, r)
		return
	}
	ext := strings.ToLower(filepath.Ext(relativePath))
	ct := mime.TypeByExtension(ext)
	if ct == "" {
		ct = "application/octet-stream"
	}
	w.Header().Set("Content-Type", ct)
	w.Header().Set("Content-Disposition", "inline; filename=\""+filepath.Base(relativePath)+"\"")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	if info.Size() > 0 {
		w.Header().Set("Content-Length", strconv.FormatInt(info.Size(), 10))
	}
	io.Copy(w, f)
}

// ScheduleSend handles POST /api/ppat/schedule-send.
func (h *PpatHandler) ScheduleSend(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	var body struct {
		Nobooking   string `json:"nobooking"`
		ScheduledFor string `json:"scheduled_for"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	nobooking := body.Nobooking
	if nobooking == "" {
		nobooking = r.URL.Query().Get("nobooking")
	}
	scheduledFor := body.ScheduledFor
	if scheduledFor == "" {
		scheduledFor = r.URL.Query().Get("scheduled_for")
	}
	if nobooking == "" || scheduledFor == "" {
		ppatJSONError(w, http.StatusBadRequest, "nobooking and scheduled_for required")
		return
	}
	if t, err := time.Parse("2006-01-02", scheduledFor); err == nil {
		scheduledFor = t.Format("2006-01-02")
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	res, err := h.repo.ScheduleSend(ctx, userid, nobooking, scheduledFor)
	if err != nil {
		if errors.Is(err, repository.ErrPpatQuotaFull) {
			ppatJSONError(w, http.StatusConflict, "Kuota penuh untuk tanggal tersebut")
			return
		}
		if errors.Is(err, repository.ErrPpatBookingNotSendable) {
			ppatJSONError(w, http.StatusConflict, "Booking tidak dapat dijadwalkan")
			return
		}
		log.Printf("[PPAT] ScheduleSend: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Scheduled",
		"data": map[string]interface{}{
			"scheduled_for": res.ScheduledFor,
			"used":          res.Used,
			"limit":         res.Limit,
			"remaining":     res.Remaining,
		},
	})
}

const maxSignatureSize = 2 * 1024 * 1024  // 2MB
const maxDocumentSize = 50 * 1024 * 1024  // 50MB

// UploadSignatures handles POST /api/ppat/upload-signatures.
func (h *PpatHandler) UploadSignatures(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if err := r.ParseMultipartForm(maxSignatureSize); err != nil {
		ppatJSONError(w, http.StatusBadRequest, "Failed to parse form")
		return
	}
	nobooking := strings.TrimSpace(r.FormValue("nobooking"))
	if nobooking == "" {
		ppatJSONError(w, http.StatusBadRequest, "nobooking required")
		return
	}
	file, hdr, err := r.FormFile("signature1")
	if err != nil {
		ppatJSONError(w, http.StatusBadRequest, "No signature file uploaded")
		return
	}
	defer file.Close()
	data, err := io.ReadAll(file)
	if err != nil {
		ppatJSONError(w, http.StatusInternalServerError, "Failed to read file")
		return
	}
	if len(data) > maxSignatureSize {
		ppatJSONError(w, http.StatusBadRequest, "File too large (max 2MB)")
		return
	}
	baseDir := h.cfg.TandaTanganBaseDir
	if baseDir == "" {
		baseDir = "./storage/ppat/ttd"
	}
	if err := ensureDir(baseDir); err != nil {
		log.Printf("[PPAT] UploadSignatures mkdir: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Failed to create directory")
		return
	}
	ext := ".png"
	if hdr != nil && filepath.Ext(hdr.Filename) != "" {
		e := strings.ToLower(filepath.Ext(hdr.Filename))
		if e == ".jpg" || e == ".jpeg" || e == ".png" || e == ".gif" || e == ".webp" {
			ext = e
		}
	}
	filename := fmt.Sprintf("%s_%d_sigwp%s", nobooking, time.Now().UnixMilli(), ext)
	fullPath := filepath.Join(baseDir, filename)
	if err := os.WriteFile(fullPath, data, 0644); err != nil {
		log.Printf("[PPAT] UploadSignatures write: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Failed to save file")
		return
	}
	// Store relative path for file-proxy (base = PpatStorageBaseDir; ttd is under it)
	dbPath := "ttd/" + filename
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := h.repo.UpdateSignaturePath(ctx, nobooking, dbPath); err != nil {
		_ = os.Remove(fullPath)
		log.Printf("[PPAT] UploadSignatures db: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Failed to update database")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"message":   "Signature uploaded successfully",
		"nobooking": nobooking,
		"path":      dbPath,
	})
}

// UploadDocuments handles POST /api/ppat/upload-documents.
func (h *PpatHandler) UploadDocuments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if err := r.ParseMultipartForm(maxDocumentSize * 3); err != nil {
		ppatJSONError(w, http.StatusBadRequest, "Failed to parse form")
		return
	}
	nobooking := strings.TrimSpace(r.FormValue("nobooking"))
	if nobooking == "" {
		nobooking = strings.TrimSpace(r.FormValue("booking_id"))
	}
	if nobooking == "" {
		ppatJSONError(w, http.StatusBadRequest, "nobooking required")
		return
	}
	baseDir := h.cfg.PpatStorageBaseDir
	if baseDir == "" {
		baseDir = "./storage/ppat"
	}
	year := strconv.Itoa(time.Now().Year())
	folderBase := filepath.Join(baseDir, "ppat", year, userid, nobooking)
	if err := ensureDir(folderBase); err != nil {
		log.Printf("[PPAT] UploadDocuments mkdir: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Failed to create directory")
		return
	}
	fieldMap := map[string]string{
		"aktaTanah":       "akta_tanah_path",
		"sertifikatTanah": "sertifikat_tanah_path",
		"pelengkap":       "pelengkap_path",
	}
	allowedMime := map[string]bool{
		"image/jpeg": true, "image/jpg": true, "image/png": true,
		"image/gif": true, "image/webp": true, "application/pdf": true,
	}
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()
	for fieldName, dbCol := range fieldMap {
		file, hdr, err := r.FormFile(fieldName)
		if err != nil {
			continue
		}
		data, err := io.ReadAll(file)
		file.Close()
		if err != nil || len(data) > maxDocumentSize {
			continue
		}
		if !allowedMime[hdr.Header.Get("Content-Type")] {
			continue
		}
		ext := ".pdf"
		if e := strings.ToLower(filepath.Ext(hdr.Filename)); e != "" {
			ext = e
		}
		filename := fmt.Sprintf("%s_%s_1_%s_%d%s", userid, strings.TrimSuffix(dbCol, "_path"), nobooking, time.Now().UnixMilli(), ext)
		docDir := filepath.Join(folderBase, strings.TrimSuffix(dbCol, "_path"))
		if err := ensureDir(docDir); err != nil {
			continue
		}
		fullPath := filepath.Join(docDir, filename)
		if err := os.WriteFile(fullPath, data, 0644); err != nil {
			log.Printf("[PPAT] UploadDocuments write: %v", err)
			continue
		}
		relPath := filepath.ToSlash(filepath.Join("ppat", year, userid, nobooking, strings.TrimSuffix(dbCol, "_path"), filename))
		if err := h.repo.UpdateDocumentPath(ctx, userid, nobooking, dbCol, relPath); err != nil {
			_ = os.Remove(fullPath)
			log.Printf("[PPAT] UploadDocuments db: %v", err)
			ppatJSONError(w, http.StatusInternalServerError, "Failed to update database")
			return
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "message": "Documents uploaded"})
}

// GeneratePdfBadan handles GET /api/ppat_generate-pdf-badan/{nobooking}.
func (h *PpatHandler) GeneratePdfBadan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	nobooking := r.PathValue("nobooking")
	if nobooking == "" {
		ppatJSONError(w, http.StatusBadRequest, "nobooking required")
		return
	}
	if h.bookingRepo == nil {
		ppatJSONError(w, http.StatusServiceUnavailable, "Service unavailable")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	data, err := h.bookingRepo.GetBookingForSSPDPDF(ctx, userid, nobooking)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(err.Error(), "no rows") {
			ppatJSONError(w, http.StatusNotFound, "Data untuk nobooking ini tidak ditemukan")
			return
		}
		log.Printf("[PPAT] GeneratePdfBadan: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Gagal menghasilkan dokumen PDF")
		return
	}
	w.Header().Set("Content-Type", "application/pdf")
	disposition := "inline"
	if r.URL.Query().Get("download") != "" {
		disposition = "attachment"
	}
	w.Header().Set("Content-Disposition", disposition+`; filename="`+nobooking+`_document.pdf"`)
	logoPath := h.cfg.PDFLogoPath
	if logoPath != "" {
		if abs, err := filepath.Abs(logoPath); err == nil {
			logoPath = abs
		}
		if _, err := os.Stat(logoPath); err != nil {
			logoPath = ""
			if fallback, err := filepath.Abs("frontend-next/asset/Logobappenda_pdf.png"); err == nil {
				if _, err := os.Stat(fallback); err == nil {
					logoPath = fallback
				}
			}
		}
	}
	if err := pdf.GenerateSSPD(w, data, logoPath); err != nil {
		log.Printf("[PPAT] GeneratePdfBadan PDF write: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Gagal menghasilkan dokumen PDF")
		return
	}
}

// GeneratePdfMohonValidasi handles GET /api/ppat/generate-pdf-mohon-validasi/{nobooking}.
func (h *PpatHandler) GeneratePdfMohonValidasi(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	nobooking := r.PathValue("nobooking")
	if nobooking == "" {
		ppatJSONError(w, http.StatusBadRequest, "nobooking required")
		return
	}
	if h.bookingRepo == nil {
		ppatJSONError(w, http.StatusServiceUnavailable, "Service unavailable")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	data, err := h.bookingRepo.GetBookingForMohonValidasiPDF(ctx, userid, nobooking)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) || strings.Contains(err.Error(), "no rows") {
			ppatJSONError(w, http.StatusNotFound, "Data tidak ditemukan")
			return
		}
		log.Printf("[PPAT] GeneratePdfMohonValidasi: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Gagal menghasilkan dokumen PDF")
		return
	}
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", `inline; filename="Permohonan_Validasi_`+nobooking+`.pdf"`)
	if err := pdf.GenerateMohonValidasi(w, data); err != nil {
		log.Printf("[PPAT] GeneratePdfMohonValidasi PDF write: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Gagal menghasilkan dokumen PDF")
		return
	}
}

func ensureDir(dir string) error {
	return os.MkdirAll(dir, 0755)
}

func ppatJSONError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": message})
}
