package handler

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	mathrand "math/rand"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
	"sync"

	"ebphtb/backend/internal/config"
	"ebphtb/backend/internal/idgen"
	"ebphtb/backend/internal/ktpocr"
	"ebphtb/backend/internal/repository"
	"ebphtb/backend/internal/service"

	mail "ebphtb/backend/internal/email"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

const maxUploadSize = 5 * 1024 * 1024
const allowedMimes = "image/jpeg,image/jpg,image/png"
const maxNIBDocSize = 10 * 1024 * 1024 // 10MB for NIB PDF

var allowedExtensions = map[string]bool{".jpg": true, ".jpeg": true, ".png": true}

const pendingOTPTTL = 10 * time.Minute

type pendingOTPEntry struct {
	OTP       string
	ExpiresAt time.Time
}

var (
	pendingOTPMu sync.Mutex
	pendingOTP   = map[string]pendingOTPEntry{}
)

// sanitizeNIKForFilename mengembalikan hanya digit dari NIK untuk nama file (aman, unik per KTP).
func sanitizeNIKForFilename(nik string) string {
	var b strings.Builder
	for _, r := range nik {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

// removeKTPTempFiles menghapus file JSON KTP di temp_uploads (uploadId = nama file tanpa .json).
func removeKTPTempFiles(dir, uploadId string) {
	if dir == "" || uploadId == "" {
		return
	}
	p := filepath.Join(dir, uploadId+".json")
	if err := os.Remove(p); err != nil && !os.IsNotExist(err) {
		log.Printf("[REGISTER] cleanup KTP json %s: %v", p, err)
	}
}

func setPendingOTP(email, otp string) {
	pendingOTPMu.Lock()
	defer pendingOTPMu.Unlock()
	pendingOTP[email] = pendingOTPEntry{OTP: otp, ExpiresAt: time.Now().Add(pendingOTPTTL)}
}

func getPendingOTP(email string) (pendingOTPEntry, bool) {
	pendingOTPMu.Lock()
	defer pendingOTPMu.Unlock()
	entry, ok := pendingOTP[email]
	if !ok {
		return pendingOTPEntry{}, false
	}
	if time.Now().After(entry.ExpiresAt) {
		delete(pendingOTP, email)
		return pendingOTPEntry{}, false
	}
	return entry, true
}

func deletePendingOTP(email string) {
	pendingOTPMu.Lock()
	defer pendingOTPMu.Unlock()
	delete(pendingOTP, email)
}

// --- Reset password (in-memory only, TTL 10 menit) ---
const resetPasswordOTPTTL = 10 * time.Minute

type resetOTPEntry struct {
	OTP       string
	NIK       string
	ExpiresAt time.Time
}

type resetTokenEntry struct {
	Email     string
	ExpiresAt time.Time
}

var (
	resetOTPMu   sync.Mutex
	resetOTPMap  = map[string]resetOTPEntry{}   // key = email
	resetTokenMu sync.Mutex
	resetTokenMap = map[string]resetTokenEntry{} // key = token
)

func setResetOTP(email, nik, otp string) {
	resetOTPMu.Lock()
	defer resetOTPMu.Unlock()
	resetOTPMap[email] = resetOTPEntry{OTP: otp, NIK: nik, ExpiresAt: time.Now().Add(resetPasswordOTPTTL)}
}

func getAndConsumeResetOTP(email, otp string) (ok bool) {
	resetOTPMu.Lock()
	defer resetOTPMu.Unlock()
	entry, ok := resetOTPMap[email]
	if !ok || time.Now().After(entry.ExpiresAt) {
		return false
	}
	if entry.OTP != otp {
		return false
	}
	delete(resetOTPMap, email)
	return true
}

func setResetToken(token, email string) {
	resetTokenMu.Lock()
	defer resetTokenMu.Unlock()
	resetTokenMap[token] = resetTokenEntry{Email: email, ExpiresAt: time.Now().Add(resetPasswordOTPTTL)}
}

func getAndConsumeResetToken(token string) (email string, ok bool) {
	resetTokenMu.Lock()
	defer resetTokenMu.Unlock()
	entry, ok := resetTokenMap[token]
	if !ok || time.Now().After(entry.ExpiresAt) {
		return "", false
	}
	delete(resetTokenMap, token)
	return entry.Email, true
}

func getResetTokenEmail(token string) (email string, ok bool) {
	resetTokenMu.Lock()
	defer resetTokenMu.Unlock()
	entry, ok := resetTokenMap[token]
	if !ok || time.Now().After(entry.ExpiresAt) {
		return "", false
	}
	return entry.Email, true
}

func newResetToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func sha256Hex(s string) string {
	sum := sha256.Sum256([]byte(s))
	return hex.EncodeToString(sum[:])
}

func isSecureRequest(r *http.Request) bool {
	if r.TLS != nil {
		return true
	}
	// Behind reverse proxy (Koyeb/Vercel/etc)
	if strings.EqualFold(strings.TrimSpace(r.Header.Get("X-Forwarded-Proto")), "https") {
		return true
	}
	return false
}

func buildKtpExtractPayload(result *ktpocr.Result, createdAt int64) (ktpExtractJSON, string) {
	payload := ktpExtractJSON{
		NIK: result.NIK, Nama: result.Nama,
		Alamat: result.Alamat,
		IsReadable: result.IsReadable,
		CreatedAt: createdAt,
	}
	rawForDB := result.RawText
	if len(rawForDB) > 2000 {
		rawForDB = rawForDB[:2000]
	}
	ktpOcrBytes, _ := json.Marshal(map[string]interface{}{
		"nik": result.NIK,
		"nama": result.Nama,
		"alamat": result.Alamat,
		"is_readable": result.IsReadable,
		"rawText": rawForDB,
	})
	payload.KtpOcrJson = string(ktpOcrBytes)
	return payload, payload.KtpOcrJson
}

// AuthHandler handles auth-related HTTP handlers.
type AuthHandler struct {
	cfg  *config.Config
	repo *repository.UserRepo
}

// NewAuthHandler creates AuthHandler.
func NewAuthHandler(cfg *config.Config, pool *pgxpool.Pool) *AuthHandler {
	return &AuthHandler{cfg: cfg, repo: repository.NewUserRepo(pool)}
}

// ktpExtractJSON is the structure saved in temp_uploads (hanya data JSON, bukan gambar).
type ktpExtractJSON struct {
	NIK              *string  `json:"nik"`
	Nama             *string  `json:"nama"`
	Alamat           *string  `json:"alamat"`
	IsReadable       bool     `json:"is_readable"`
	KtpOcrJson       string   `json:"ktpOcrJson"` // stringified untuk kolom DB
	CreatedAt        int64    `json:"createdAt"`
}

func ptrTrim(s *string) string {
	if s == nil {
		return ""
	}
	return strings.TrimSpace(*s)
}

const ktpRawTextAPIMaxRunes = 8000

func clipKtpRawTextForAPI(s string) string {
	if len(s) <= ktpRawTextAPIMaxRunes {
		return s
	}
	return s[:ktpRawTextAPIMaxRunes] + "\n…"
}

// sniffKTPImageKind returns "jpeg", "png", or "" from file magic bytes (lebih andal daripada Content-Type browser).
func sniffKTPImageKind(path string) string {
	f, err := os.Open(path)
	if err != nil {
		return ""
	}
	defer f.Close()
	var buf [12]byte
	n, err := f.Read(buf[:])
	if err != nil || n < 3 {
		return ""
	}
	if buf[0] == 0xFF && buf[1] == 0xD8 && buf[2] == 0xFF {
		return "jpeg"
	}
	if n >= 8 && buf[0] == 0x89 && buf[1] == 0x50 && buf[2] == 0x4E && buf[3] == 0x47 && buf[4] == 0x0D && buf[5] == 0x0A && buf[6] == 0x1A && buf[7] == 0x0A {
		return "png"
	}
	return ""
}

func indorobertaToResult(r *service.KtpIndorobertaResponse) *ktpocr.Result {
	if r == nil {
		return nil
	}
	nf := 0
	if r.NIK != nil && strings.TrimSpace(*r.NIK) != "" {
		nf++
	}
	if r.Nama != nil && strings.TrimSpace(*r.Nama) != "" {
		nf++
	}
	if r.Alamat != nil && strings.TrimSpace(*r.Alamat) != "" {
		nf++
	}
	valid := r.NIK != nil && ktpocr.ValidNIK(*r.NIK)
	acc := 75.0
	if nf >= 3 {
		acc = 85
	}
	out := &ktpocr.Result{
		NIK:        r.NIK,
		Nama:       r.Nama,
		Alamat:     r.Alamat,
		IsReadable: true,
		RawText:    r.RawText,
		Confidence: 0.85,
		Stats: &ktpocr.Stats{
			TotalFields:     3,
			ExtractedFields: nf,
			Confidence:      0.85,
			Accuracy:        acc,
			IsValidNIK:      valid,
			Completeness:    float64(nf) / 3.0 * 100,
		},
	}
	ktpocr.EnrichExtendedFields(out, r.RawText)
	ktpocr.RefreshResultStats(out)
	return out
}

// runKtpOCR: IndoROBERTa (opsional) + Tesseract paralel, gabungan hasil; batas waktu total ctx (~15s di handler).
// manualVerificationRequested true jika setelah gabungan tidak ada NIK valid (perlu verifikasi manual).
func (h *AuthHandler) runKtpOCR(ctx context.Context, tmpPath string) (*ktpocr.Result, bool, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()
	easyTO := time.Duration(h.cfg.EasyOCRTimeout) * time.Millisecond
	var (
		indo         *service.KtpIndorobertaResponse
		hy           *ktpocr.Result
		indoErr, hyErr error
	)
	var wg sync.WaitGroup
	u := strings.TrimSpace(h.cfg.KtpIndorobertaURL)
	if u != "" {
		wg.Add(1)
		go func() {
			defer wg.Done()
			indo, indoErr = service.ExtractKtpIndoroberta(ctx, u, tmpPath, 14*time.Second)
		}()
	}
	wg.Add(1)
	go func() {
		defer wg.Done()
		hy, hyErr = ktpocr.ExtractHybrid(ctx, tmpPath, h.cfg.EasyOCREnabled, h.cfg.EasyOCRURL, easyTO)
	}()
	wg.Wait()

	if u != "" && indoErr != nil {
		log.Printf("[KTP_INDOROBERTA] %v", indoErr)
	}
	if hyErr != nil {
		log.Printf("[KTP_OCR] ExtractHybrid: %v", hyErr)
	}

	if hyErr != nil {
		if indo != nil {
			return indorobertaToResult(indo), indo.ManualVerificationRequired, nil
		}
		return nil, false, hyErr
	}
	if hy == nil {
		if indo != nil {
			return indorobertaToResult(indo), indo.ManualVerificationRequired, nil
		}
		return nil, false, fmt.Errorf("tidak ada hasil OCR")
	}

	if indo != nil && indo.NIK != nil && ktpocr.ValidNIK(*indo.NIK) {
		r := indorobertaToResult(indo)
		if ptrTrim(r.Nama) == "" && hy.Nama != nil {
			r.Nama = hy.Nama
		}
		if ptrTrim(r.Alamat) == "" && hy.Alamat != nil {
			r.Alamat = hy.Alamat
		}
		ktpocr.MergeExtendedFieldsFromTesseract(r, hy)
		ktpocr.RefreshResultStats(r)
		return r, false, nil
	}
	if hy.NIK != nil && ktpocr.ValidNIK(*hy.NIK) {
		return hy, false, nil
	}
	if indo != nil {
		r := indorobertaToResult(indo)
		ktpocr.MergeExtendedFieldsFromTesseract(r, hy)
		ktpocr.RefreshResultStats(r)
		return r, true, nil
	}
	return hy, true, nil
}

// UploadKTP handles POST /api/v1/auth/upload-ktp.
// Tidak menulis file ke temp_uploads sebelum OTP; hanya return OCR JSON. Client kirim ktpOcrJson di register/verify-otp-finalize.
func (h *AuthHandler) UploadKTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		jsonError(w, http.StatusBadRequest, "File KTP tidak terdeteksi. Pastikan file dipilih dan formatnya JPEG/PNG.")
		return
	}
	file, header, err := r.FormFile("fotoktp")
	if err != nil {
		jsonError(w, http.StatusBadRequest, "File KTP tidak terdeteksi. Pastikan file dipilih dan formatnya JPEG/PNG.")
		return
	}
	defer file.Close()

	mimeRaw := strings.ToLower(strings.TrimSpace(header.Header.Get("Content-Type")))
	mimeBase := strings.TrimSpace(strings.Split(mimeRaw, ";")[0])
	// Banyak klien mengirim kosong / octet-stream meski file JPG asli — verifikasi setelah simpan dengan magic bytes.
	if mimeBase != "" && mimeBase != "application/octet-stream" &&
		mimeBase != "image/jpeg" && mimeBase != "image/jpg" && mimeBase != "image/png" &&
		mimeBase != "image/pjpeg" && mimeBase != "image/x-png" {
		jsonError(w, http.StatusBadRequest, "Format tidak didukung. Gunakan JPG atau PNG.")
		return
	}
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExtensions[ext] {
		ext = ".jpg"
	}
	if header.Size > maxUploadSize {
		jsonError(w, http.StatusBadRequest, "File terlalu besar (maks 5MB).")
		return
	}

	tmpFile, err := os.CreateTemp("", "ktp_upload_*"+ext)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal memproses file")
		return
	}
	tmpPath := tmpFile.Name()
	_, err = io.Copy(tmpFile, file)
	tmpFile.Close()
	if err != nil {
		os.Remove(tmpPath)
		jsonError(w, http.StatusInternalServerError, "Gagal memproses file")
		return
	}
	defer os.Remove(tmpPath)

	if sniffKTPImageKind(tmpPath) == "" {
		jsonError(w, http.StatusBadRequest, "File bukan gambar JPG/PNG yang valid (header file tidak dikenali).")
		return
	}

	result, _, err := h.runKtpOCR(r.Context(), tmpPath)
	if err != nil {
		log.Printf("[UPLOAD_KTP] OCR error: %v", err)
		jsonError(w, http.StatusInternalServerError, "OCR gagal: "+err.Error())
		return
	}
	if result == nil {
		jsonError(w, http.StatusBadRequest, "Tidak dapat membaca teks dari gambar KTP")
		return
	}
	if result.NIK == nil || !ktpocr.ValidNIK(*result.NIK) {
		jsonErrorExtra(w, http.StatusBadRequest, "NIK tidak terbaca. Pastikan gambar KTP jelas, tidak blur, dan posisi tidak terlalu miring. Coba foto ulang atau perbaiki pencahayaan.", map[string]interface{}{
			"manual_verification_required": true,
		})
		return
	}
	if result.Nama == nil || strings.TrimSpace(*result.Nama) == "" {
		jsonError(w, http.StatusBadRequest, "Nama tidak terbaca. Pastikan foto KTP tidak blur dan bagian nama terlihat jelas.")
		return
	}

	createdAt := time.Now().UnixMilli()
	payload, ktpOcrJsonStr := buildKtpExtractPayload(result, createdAt)
	uploadId := fmt.Sprintf("%s_%d", sanitizeNIKForFilename(*result.NIK), createdAt)

	responseData := map[string]interface{}{
		"nik":                          payload.NIK,
		"nama":                         payload.Nama,
		"alamat":                       payload.Alamat,
		"is_readable":                  payload.IsReadable,
		"manual_verification_required": false,
		"provinsi":                     result.Provinsi,
		"kabupatenKota":                result.KabupatenKota,
		"rtRw":                         result.RtRw,
		"kelurahan":                    result.Kelurahan,
		"kecamatan":                    result.Kecamatan,
		"rawText":                      clipKtpRawTextForAPI(result.RawText),
	}

	decision := "success"
	message := "Data KTP berhasil dipindai."
	if result.Stats != nil {
		if !result.Stats.IsValidNIK || result.Stats.Accuracy < 50 || result.Stats.ExtractedFields < 2 {
			decision = "needs_review"
		}
	}
	// Best effort: allow progress if NIK + Nama are readable even when alamat is missing/unclear.
	if payload.IsReadable && (payload.Alamat == nil || len(strings.TrimSpace(*payload.Alamat)) < 5) {
		decision = "needs_review"
		message = "NIK dan Nama terbaca. Alamat belum terbaca jelas — silakan lanjut dan isi alamat secara manual."
	}
	addrParts := 0
	if result.RtRw != nil && strings.TrimSpace(*result.RtRw) != "" {
		addrParts++
	}
	if result.Kelurahan != nil && strings.TrimSpace(*result.Kelurahan) != "" {
		addrParts++
	}
	if result.Kecamatan != nil && strings.TrimSpace(*result.Kecamatan) != "" {
		addrParts++
	}
	if payload.IsReadable && payload.Alamat != nil && len(strings.TrimSpace(*payload.Alamat)) >= 5 && addrParts < 2 {
		decision = "needs_review"
		message = "NIK, Nama, dan alamat utama terbaca. RT/RW, Kel/Desa, atau Kecamatan belum lengkap dari OCR — mohon cek manual."
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"message":    message,
		"decision":   decision,
		"uploadId":   uploadId,
		"timestamp":  createdAt,
		"ktpOcrJson": ktpOcrJsonStr,
		"data":       responseData,
		"stats":      result.Stats,
	})
}

// RealKTPVerification handles POST /api/v1/auth/real-ktp-verification.
func (h *AuthHandler) RealKTPVerification(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		jsonError(w, http.StatusBadRequest, "File KTP tidak ditemukan")
		return
	}
	file, header, err := r.FormFile("fotoktp")
	if err != nil {
		jsonError(w, http.StatusBadRequest, "File KTP tidak ditemukan")
		return
	}
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExtensions[ext] {
		ext = ".jpg"
	}
	tmpFile, err := os.CreateTemp("", "ktp_ocr_*"+ext)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal memproses file")
		return
	}
	tmpPath := tmpFile.Name()
	_, err = io.Copy(tmpFile, file)
	tmpFile.Close()
	file.Close()
	if err != nil {
		os.Remove(tmpPath)
		jsonError(w, http.StatusInternalServerError, "Gagal memproses file")
		return
	}
	defer os.Remove(tmpPath)

	result, manualKTP, err := h.runKtpOCR(r.Context(), tmpPath)
	if err != nil {
		log.Printf("[OCR REAL] Extract error: %v", err)
		jsonError(w, http.StatusInternalServerError, "OCR gagal: "+err.Error())
		return
	}
	if result == nil {
		jsonError(w, http.StatusBadRequest, "Tidak dapat membaca teks dari gambar KTP")
		return
	}

	rawText := result.RawText
	if len(rawText) > 500 {
		rawText = rawText[:500]
	}

	data := map[string]interface{}{
		"nik":                          result.NIK,
		"nama":                         result.Nama,
		"alamat":                       result.Alamat,
		"is_readable":                  result.IsReadable,
		"status":                       "VERIFIED_BY_OCR",
		"manual_verification_required": manualKTP,
	}

	// Decision policy OCR: success / needs_review / reject.
	// Disesuaikan agar ktp3/ktp4 dan gambar sulit tetap lolos (prefer needs_review daripada reject).
	const (
		ocrMinAccuracy       = 50
		ocrRejectMinAccuracy = 20
	)
	extractedFields := 0
	isValidNIK := false
	accuracy := 0.0
	if result.Stats != nil {
		extractedFields = result.Stats.ExtractedFields
		isValidNIK = result.Stats.IsValidNIK
		accuracy = result.Stats.Accuracy
	}
	// Jangan pernah reject jika minimal NIK+Nama terbaca (best effort; user bisa isi manual).
	isHardReject := !result.IsReadable && !isValidNIK && (accuracy < ocrRejectMinAccuracy || extractedFields < 1)
	needsReview := accuracy < ocrMinAccuracy || !result.IsReadable || !isValidNIK || extractedFields < 2

	if isHardReject {
		log.Printf("[OCR REAL] reject acc=%.1f isValidNIK=%t fields=%d", accuracy, isValidNIK, extractedFields)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":  false,
			"decision": "reject",
			"message":  "OCR gagal membaca field penting. Coba foto ulang dengan pencahayaan cukup, posisi tegak lurus, dan fokus tajam.",
			"data":     data,
			"stats":    result.Stats,
			"rawText":  rawText,
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	decision := "success"
	message := "KTP berhasil dipindai secara otomatis"
	if needsReview {
		decision = "needs_review"
		message = "OCR berhasil diproses, namun beberapa field perlu Anda cek dan koreksi manual."
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"decision": decision,
		"message":  message,
		"data":     data,
		"stats":    result.Stats,
		"rawText":  rawText,
	})
}

// UploadNIBDoc handles POST /api/v1/auth/upload-nib-doc (Sertifikat NIB PDF untuk WP Badan Usaha).
func (h *AuthHandler) UploadNIBDoc(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	if err := r.ParseMultipartForm(maxNIBDocSize); err != nil {
		jsonError(w, http.StatusBadRequest, "File tidak terdeteksi atau terlalu besar (maks 10MB).")
		return
	}
	file, header, err := r.FormFile("nib_doc")
	if err != nil {
		jsonError(w, http.StatusBadRequest, "Pilih file Sertifikat NIB (PDF).")
		return
	}
	defer file.Close()
	ct := header.Header.Get("Content-Type")
	if ct != "application/pdf" && !strings.HasSuffix(strings.ToLower(header.Filename), ".pdf") {
		jsonError(w, http.StatusBadRequest, "Format harus PDF.")
		return
	}
	if header.Size > maxNIBDocSize {
		jsonError(w, http.StatusBadRequest, "File terlalu besar (maks 10MB).")
		return
	}
	nibDir := filepath.Join(h.cfg.TempUploadsDir, "nib_docs")
	if err := os.MkdirAll(nibDir, 0755); err != nil {
		log.Printf("[UPLOAD_NIB_DOC] MkdirAll: %v", err)
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan file.")
		return
	}
	uploadID := "nib_" + uuid.New().String()
	destPath := filepath.Join(nibDir, uploadID+".pdf")
	dest, err := os.Create(destPath)
	if err != nil {
		log.Printf("[UPLOAD_NIB_DOC] Create: %v", err)
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan file.")
		return
	}
	_, err = io.Copy(dest, file)
	dest.Close()
	if err != nil {
		os.Remove(destPath)
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan file.")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"uploadId":  uploadID,
		"message":   "Sertifikat NIB berhasil diupload.",
	})
}

// Register handles POST /api/v1/auth/register.
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	if err := r.ParseForm(); err != nil {
		log.Printf("[REGISTER] ParseForm err: %v, Content-Type: %s", err, r.Header.Get("Content-Type"))
		if err := r.ParseMultipartForm(10 << 20); err != nil {
			log.Printf("[REGISTER] ParseMultipartForm err: %v", err)
			jsonError(w, http.StatusBadRequest, "Gagal memproses data form")
			return
		}
	}

	nama := strings.TrimSpace(r.FormValue("nama"))
	nik := strings.TrimSpace(r.FormValue("nik"))
	telepon := strings.TrimSpace(r.FormValue("telepon"))
	email := strings.TrimSpace(r.FormValue("email"))
	password := r.FormValue("password")
	gender := strings.TrimSpace(r.FormValue("gender"))
	ktpUploadId := strings.TrimSpace(r.FormValue("ktpUploadId"))
	ktpOcrJson := strings.TrimSpace(r.FormValue("ktpOcrJson"))
	verse := strings.TrimSpace(r.FormValue("verse"))
	nip := strings.TrimSpace(r.FormValue("nip"))
	specialField := strings.TrimSpace(r.FormValue("special_field"))
	pejabatUmum := strings.TrimSpace(r.FormValue("pejabat_umum"))
	divisi := strings.TrimSpace(r.FormValue("divisi"))

	if verse == "" {
		verse = "WP"
	}
	verseValue := "WP"
	if verse == "pu" || verse == "PU" {
		verseValue = "PU"
	} else if verse == "karyawan" || verse == "Karyawan" {
		verseValue = "Karyawan"
	}

	// Log received values (mask password) for debug
	emptyFields := []string{}
	if nama == "" {
		emptyFields = append(emptyFields, "nama")
	}
	if nik == "" {
		emptyFields = append(emptyFields, "nik")
	}
	if telepon == "" {
		emptyFields = append(emptyFields, "telepon")
	}
	if email == "" {
		emptyFields = append(emptyFields, "email")
	}
	if password == "" {
		emptyFields = append(emptyFields, "password")
	}
	if gender == "" {
		emptyFields = append(emptyFields, "gender")
	}
	if ktpUploadId == "" {
		emptyFields = append(emptyFields, "ktpUploadId")
	}
	if len(emptyFields) > 0 {
		log.Printf("[REGISTER] Field kosong diterima: %v | nama=%q nik=%q telepon=%q email=%q gender=%q ktpUploadId=%q passwordLen=%d",
			emptyFields, nama, nik, telepon, email, gender, ktpUploadId, len(password))
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Semua field wajib diisi dan KTP harus diupload",
			"debug":   "Field kosong: " + strings.Join(emptyFields, ", "),
		})
		return
	}
	if len(nama) < 2 {
		jsonError(w, http.StatusBadRequest, "Nama minimal 2 karakter")
		return
	}
	if len(nik) != 16 || !isDigits(nik) {
		jsonError(w, http.StatusBadRequest, "NIK harus 16 digit")
		return
	}
	if !strings.HasPrefix(telepon, "08") || len(telepon) < 11 || len(telepon) > 13 {
		jsonError(w, http.StatusBadRequest, "Nomor telepon harus dimulai 08, 11–13 digit")
		return
	}
	if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		jsonError(w, http.StatusBadRequest, "Format email tidak valid")
		return
	}
	if len(password) < 6 {
		jsonError(w, http.StatusBadRequest, "Password minimal 6 karakter")
		return
	}
	if gender != "Perempuan" && gender != "Laki-laki" {
		jsonError(w, http.StatusBadRequest, "Pilih jenis kelamin")
		return
	}
	if verseValue == "Karyawan" && nip == "" {
		jsonError(w, http.StatusBadRequest, "NIP wajib untuk pendaftaran Karyawan")
		return
	}
	if verseValue == "PU" {
		if specialField == "" {
			log.Printf("[REGISTER] PU: special_field kosong | special_field=%q pejabat_umum=%q divisi=%q", specialField, pejabatUmum, divisi)
			jsonError(w, http.StatusBadRequest, "Nama PPAT/Gelar wajib untuk pendaftaran PPAT/PPATS")
			return
		}
		if pejabatUmum == "" {
			log.Printf("[REGISTER] PU: pejabat_umum kosong | special_field=%q pejabat_umum=%q divisi=%q", specialField, pejabatUmum, divisi)
			jsonError(w, http.StatusBadRequest, "Pejabat Umum wajib untuk pendaftaran PPAT/PPATS")
			return
		}
		divUpper := strings.ToUpper(divisi)
		if divUpper != "PPAT" && divUpper != "PPATS" && divUpper != "NOTARIS" {
			log.Printf("[REGISTER] PU: divisi invalid | special_field=%q pejabat_umum=%q divisi=%q", specialField, pejabatUmum, divisi)
			jsonError(w, http.StatusBadRequest, "Pilih divisi PPAT, PPATS, atau Notaris")
			return
		}
	}

	// Data KTP: dari form (ktpOcrJson) atau dari file temp (backward compat). Upload KTP tidak lagi menulis file; client kirim ktpOcrJson dari response upload-ktp.
	if ktpOcrJson == "" && !strings.HasPrefix(ktpUploadId, "SIMULATION_ID_") {
		jsonPath := filepath.Join(h.cfg.TempUploadsDir, ktpUploadId+".json")
		if _, err := os.Stat(jsonPath); err != nil {
			if os.IsNotExist(err) {
				jsonError(w, http.StatusBadRequest, "Data KTP tidak ditemukan. Kirim ktpOcrJson dari hasil upload KTP atau upload ulang KTP.")
			} else {
				log.Printf("[REGISTER] temp json read error: %v", err)
				jsonError(w, http.StatusInternalServerError, "Data KTP tidak ditemukan. Silakan upload ulang KTP.")
			}
			return
		}
		body, err := os.ReadFile(jsonPath)
		if err == nil {
			var extracted ktpExtractJSON
			if json.Unmarshal(body, &extracted) == nil && extracted.KtpOcrJson != "" {
				ktpOcrJson = extracted.KtpOcrJson
			}
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal melakukan registrasi.")
		return
	}

	otp := generateOTP()

	args := &repository.InsertUnverifiedArgs{
		Nama:     nama,
		NIK:      nik,
		Telepon:  telepon,
		Email:    email,
		Password: string(hashedPassword),
		Foto:     ktpUploadId,
		OTP:      otp,
		Gender:   gender,
		Verse:    verseValue,
	}
	if ktpOcrJson != "" {
		args.KtpOcrJson = &ktpOcrJson
	}
	if verseValue == "Karyawan" {
		args.NIP = &nip
	}
	if verseValue == "PU" {
		args.SpecialField = &specialField
		args.PejabatUmum = &pejabatUmum
		du := strings.ToUpper(divisi)
		args.Divisi = &du
	}

	if h.repo == nil || h.repo.Pool() == nil {
		log.Printf("[REGISTER] DB not available")
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia.")
		return
	}
	ctx := r.Context()
	// Invariant sistem satu pintu: hapus baris a_1 jika email ini sudah ada di a_2 (verified_pending/complete), agar tidak ada data ganda.
	_ = h.repo.DeleteUnverifiedWhereEmailInVerified(ctx, email)

	// Blokir hanya jika email/NIK sudah di a_2 (verified_pending atau complete). 'unverified' di a_1 = ruang lobi tunggu, boleh overwrite/daftar ulang.
	existsVerified, err := h.repo.GetByEmailVerified(ctx, email)
	if err != nil {
		log.Printf("[REGISTER] GetByEmailVerified error: %v", err)
		jsonError(w, http.StatusInternalServerError, "Gagal melakukan registrasi.")
		return
	}
	if existsVerified {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Email sudah ada dan digunakan pengguna di layanan ini. Gunakan email lain atau silahkan masuk untuk memulai.",
			"code":    "EMAIL_ALREADY_REGISTERED",
		})
		return
	}

	// Blokir jika NIK sudah di a_2 (verified_pending atau complete) — tidak boleh daftar ulang.
	nikInA2, err := h.repo.NIKExistsInA2Verified(ctx, nik)
	if err != nil {
		log.Printf("[REGISTER] NIKExistsInA2Verified error: %v", err)
		jsonError(w, http.StatusInternalServerError, "Gagal melakukan registrasi.")
		return
	}
	if nikInA2 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "NIK sudah ada dan terpakai. Silahkan masuk untuk memulai.",
			"code":    "NIK_ALREADY_USED",
		})
		return
	}

	// Email/NIK di a_1 (unverified) = lobi tunggu, boleh update (overwrite). Insert atau Update.
	existsUnverified, err := h.repo.GetByEmailUnverified(ctx, email)
	if err != nil {
		log.Printf("[REGISTER] GetByEmailUnverified error: %v", err)
		jsonError(w, http.StatusInternalServerError, "Gagal melakukan registrasi.")
		return
	}
	if existsUnverified {
		if err := h.repo.UpdateUnverified(ctx, args, email); err != nil {
			log.Printf("[REGISTER] UpdateUnverified error: %v", err)
			jsonError(w, http.StatusInternalServerError, "Gagal melakukan registrasi.")
			return
		}
	} else {
		if err := h.repo.InsertUnverified(ctx, args); err != nil {
			log.Printf("[REGISTER] InsertUnverified error: %v", err)
			jsonError(w, http.StatusInternalServerError, "Gagal melakukan registrasi.")
			return
		}
	}

	// Hapus file KTP dari temp_uploads setelah data (hanya JSON) tersimpan di DB; gambar tidak boleh persisten.
	if !strings.HasPrefix(ktpUploadId, "SIMULATION_ID_") {
		removeKTPTempFiles(h.cfg.TempUploadsDir, ktpUploadId)
	}

	if err := mail.SendOTP(email, otp); err != nil {
		log.Printf("[REGISTER] Email gagal ke %s: %v. OTP: %s (cek log untuk verifikasi manual)", email, err, otp)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    true,
			"message":    "Registrasi berhasil, tetapi pengiriman OTP ke email gagal: " + err.Error() + ". Silakan gunakan fitur Kirim Ulang OTP atau cek log server untuk OTP.",
			"redirectTo": "/verifikasi-otp",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"message":    "Registrasi berhasil! Silakan cek email Anda untuk kode OTP dan masukkan di halaman verifikasi.",
		"redirectTo": "/verifikasi-otp",
	})
}

// loginReq is the JSON body for login.
type loginReq struct {
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
}

// Login handles POST /api/v1/auth/login.
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	var req loginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data login tidak valid.")
		return
	}
	identifier := strings.TrimSpace(req.Identifier)
	password := req.Password
	if identifier == "" || password == "" {
		jsonError(w, http.StatusBadRequest, "UserID/Username dan kata sandi wajib diisi.")
		return
	}

	if h.repo == nil || h.repo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia.")
		return
	}

	ctx := r.Context()
	user, err := h.repo.GetByIdentifierForLogin(ctx, identifier)
	if err != nil {
		log.Printf("[LOGIN] GetByIdentifierForLogin error: %v", err)
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan server.")
		return
	}
	if user == nil {
		jsonError(w, http.StatusUnauthorized, "UserID/Username tidak ditemukan atau belum terverifikasi.")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		jsonError(w, http.StatusUnauthorized, "Password salah.")
		return
	}

	// Compute is_profile_complete with role-based requirements.
	// Do not force optional fields for roles that do not own those fields.
	hasText := func(s *string) bool { return s != nil && strings.TrimSpace(*s) != "" }
	var isProfileComplete bool
	switch user.Divisi {
	case "Wajib Pajak", "Wajib Pajak P":
		isProfileComplete = hasText(user.Username)
	case "Wajib Pajak B":
		isProfileComplete = hasText(user.Username) &&
			hasText(user.NpwpBadan) &&
			hasText(user.Nib) &&
			hasText(user.NibDocPath)
	case "PPAT", "PPATS":
		isProfileComplete = hasText(user.Username) &&
			hasText(user.SpecialField) &&
			hasText(user.PejabatUmum)
	case "Peneliti Validasi":
		// NIP is optional for some employee records.
		isProfileComplete = hasText(user.Username) &&
			hasText(user.SpecialParafv)
	default:
		// LTB/LSB/Peneliti/BANK/CS: do not block login by optional profile fields.
		isProfileComplete = true
	}

	if err := h.repo.UpdateLoginStatus(ctx, user.Userid); err != nil {
		log.Printf("[LOGIN] UpdateLoginStatus error: %v", err)
	}

	foto := user.Fotoprofil
	if foto == "" {
		foto = ""
	}
	username := ""
	if user.Username != nil {
		username = *user.Username
	}
	nip := ""
	if user.NIP != nil {
		nip = *user.NIP
	}
	specialField := ""
	if user.SpecialField != nil {
		specialField = *user.SpecialField
	}
	specialParafv := ""
	if user.SpecialParafv != nil {
		specialParafv = *user.SpecialParafv
	}
	pejabatUmum := ""
	if user.PejabatUmum != nil {
		pejabatUmum = *user.PejabatUmum
	}
	telepon := ""
	if user.Telepon != nil {
		telepon = *user.Telepon
	}
	gender := ""
	if user.Gender != nil {
		gender = *user.Gender
	}
	ppatKhusus := ""
	if user.PpatKhusus != nil {
		ppatKhusus = *user.PpatKhusus
	}
	alamatPU := ""
	if user.AlamatPu != nil {
		alamatPU = *user.AlamatPu
	}
	npwpBadan := ""
	if user.NpwpBadan != nil {
		npwpBadan = *user.NpwpBadan
	}
	nib := ""
	if user.Nib != nil {
		nib = *user.Nib
	}
	nibDocPath := ""
	if user.NibDocPath != nil {
		nibDocPath = *user.NibDocPath
	}
	tandaTanganMime := ""
	if user.TandaTanganMime != nil {
		tandaTanganMime = *user.TandaTanganMime
	}
	tandaTanganPath := ""
	if user.TandaTanganPath != nil {
		tandaTanganPath = *user.TandaTanganPath
	}
	statusPpat := ""
	if user.StatusPpat != nil {
		statusPpat = strings.TrimSpace(*user.StatusPpat)
	}

	msg := "Login berhasil"
	if username != "" {
		msg = "Login berhasil, " + username + "!"
	} else {
		msg = "Login berhasil, " + user.Userid + "!"
	}

	// Cookie agar GET /api/v1/auth/profile dan upload/update bisa identifikasi user
	http.SetCookie(w, &http.Cookie{
		Name:     "ebphtb_userid",
		Value:    user.Userid,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   isSecureRequest(r),
		MaxAge:   86400 * 7, // 7 hari
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":             true,
		"message":             msg,
		"userid":              user.Userid,
		"divisi":              user.Divisi,
		"nama":                user.Nama,
		"email":               user.Email,
		"telepon":             telepon,
		"foto":                foto,
		"username":            username,
		"nip":                 nip,
		"special_field":       specialField,
		"special_parafv":      specialParafv,
		"pejabat_umum":        pejabatUmum,
		"ppat_khusus":         ppatKhusus,
		"is_profile_complete": isProfileComplete,
		"statuspengguna":      "online",
		"tanda_tangan_mime":   tandaTanganMime,
		"tanda_tangan_path":   tandaTanganPath,
		"gender":              gender,
		"alamat_pu":           alamatPU,
		"npwp_badan":          npwpBadan,
		"nib":                 nib,
		"nib_doc_path":        nibDocPath,
		"status_ppat":         statusPpat,
	})
}

type requestOTPReq struct {
	Email string `json:"email"`
}

type verifyOTPFinalizeReq struct {
	Email               string                 `json:"email"`
	OTP                 string                 `json:"otp"`
	PendingRegistration map[string]interface{} `json:"pendingRegistration"`
}

func getStringField(m map[string]interface{}, key string) string {
	if v, ok := m[key]; ok && v != nil {
		s := strings.TrimSpace(fmt.Sprintf("%v", v))
		return s
	}
	return ""
}

// RequestOTP handles POST /api/v1/auth/request-otp.
// OTP berbasis memory map + TTL (pendingOTPTTL); tidak ada write DB.
func (h *AuthHandler) RequestOTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	var req requestOTPReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data tidak valid.")
		return
	}
	email := strings.TrimSpace(req.Email)
	if email == "" {
		jsonError(w, http.StatusBadRequest, "Email harus diisi.")
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia.")
		return
	}

	existsVerified, err := h.repo.GetByEmailVerified(r.Context(), email)
	if err != nil {
		log.Printf("[REQUEST_OTP] GetByEmailVerified error: %v", err)
		jsonError(w, http.StatusInternalServerError, "Gagal memproses OTP.")
		return
	}
	if existsVerified {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Email yang Anda input sudah terdaftar. Jika ini akun Anda, silakan masuk.",
			"code":    "EMAIL_ALREADY_REGISTERED",
		})
		return
	}

	otp := generateOTP()
	setPendingOTP(email, otp)
	if err := mail.SendOTP(email, otp); err != nil {
		log.Printf("[REQUEST_OTP] Email gagal ke %s: %v. OTP: %s", email, err, otp)
		jsonError(w, http.StatusInternalServerError, "Gagal mengirim OTP ke email.")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "OTP berhasil dikirim ke email Anda.",
	})
}

// VerifyOTPFinalize handles POST /api/v1/auth/verify-otp-finalize.
// Insert DB + simpan JSON temp_uploads dilakukan hanya setelah OTP valid.
func (h *AuthHandler) VerifyOTPFinalize(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	var req verifyOTPFinalizeReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data verifikasi tidak valid.")
		return
	}
	email := strings.TrimSpace(req.Email)
	otp := strings.TrimSpace(req.OTP)
	if email == "" || otp == "" {
		jsonError(w, http.StatusBadRequest, "Email dan OTP harus diisi.")
		return
	}
	entry, ok := getPendingOTP(email)
	if !ok {
		jsonError(w, http.StatusBadRequest, "OTP tidak ditemukan atau sudah kedaluwarsa.")
		return
	}
	if entry.OTP != otp {
		jsonError(w, http.StatusBadRequest, "Kode OTP salah.")
		return
	}

	p := req.PendingRegistration
	if p == nil {
		jsonError(w, http.StatusBadRequest, "Data pendaftaran tidak ditemukan.")
		return
	}

	nama := getStringField(p, "nama")
	nik := getStringField(p, "nik")
	telepon := getStringField(p, "telepon")
	password := getStringField(p, "password")
	gender := getStringField(p, "gender")
	verseValue := getStringField(p, "verse")
	ktpUploadID := getStringField(p, "ktpUploadId")
	ktpOcrJson := getStringField(p, "ktpOcrJson")
	nip := getStringField(p, "nip")
	specialField := getStringField(p, "special_field")
	pejabatUmum := getStringField(p, "pejabat_umum")
	divisi := strings.ToUpper(getStringField(p, "divisi"))
	wpSubtype := getStringField(p, "wp_subtype")
	npwpBadan := getStringField(p, "npwp_badan")
	nib := getStringField(p, "nib")
	nibDocUploadID := getStringField(p, "nib_doc_upload_id")

	isWPBadan := verseValue == "WP" && (wpSubtype == "Badan Usaha" || wpSubtype == "Badan")

	if nama == "" || nik == "" || telepon == "" || password == "" || gender == "" {
		jsonError(w, http.StatusBadRequest, "Data pendaftaran tidak lengkap.")
		return
	}
	if !isWPBadan && ktpOcrJson == "" {
		jsonError(w, http.StatusBadRequest, "Data pendaftaran tidak lengkap (KTP/OCR wajib untuk WP Perorangan).")
		return
	}
	if isWPBadan {
		if npwpBadan == "" || nib == "" || nibDocUploadID == "" {
			jsonError(w, http.StatusBadRequest, "NPWP Badan, NIB, dan upload Sertifikat NIB (PDF) wajib untuk WP Badan Usaha.")
			return
		}
		nibFile := filepath.Join(h.cfg.TempUploadsDir, "nib_docs", nibDocUploadID+".pdf")
		if _, statErr := os.Stat(nibFile); statErr != nil {
			log.Printf("[VERIFY_OTP_FINALIZE][WP_BADAN] NIB doc missing email=%s uploadID=%s path=%s err=%v", email, nibDocUploadID, nibFile, statErr)
			jsonError(w, http.StatusBadRequest, "Dokumen NIB tidak ditemukan. Silakan upload ulang Sertifikat NIB (PDF) sebelum verifikasi OTP.")
			return
		}
		if len(nik) != 16 || !isDigits(nik) {
			jsonError(w, http.StatusBadRequest, "NIK Penanggung Jawab harus 16 digit.")
			return
		}
	} else {
		if len(nik) != 16 || !isDigits(nik) || !ktpocr.ValidNIK(nik) {
			jsonError(w, http.StatusBadRequest, "NIK tidak valid.")
			return
		}
	}
	if verseValue == "" {
		verseValue = "WP"
	}
	if verseValue == "Karyawan" && nip == "" {
		jsonError(w, http.StatusBadRequest, "NIP wajib untuk Karyawan.")
		return
	}
	if verseValue == "PU" {
		if divisi != "PPAT" && divisi != "PPATS" && divisi != "Notaris" {
			jsonError(w, http.StatusBadRequest, "Pilih divisi PPAT, PPATS, atau Notaris")
			return
		}
		if specialField == "" || pejabatUmum == "" {
			jsonError(w, http.StatusBadRequest, "Data PPAT/PPATS/Notaris belum lengkap.")
			return
		}
	}

	if h.repo == nil || h.repo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia.")
		return
	}

	existsVerified, err := h.repo.GetByEmailVerified(r.Context(), email)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
		return
	}
	if existsVerified {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Akun sudah aktif. Silakan masuk ke akun Anda.",
			"code":    "ALREADY_VERIFIED",
		})
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal memproses registrasi.")
		return
	}

	verseOut := "WP"
	if verseValue == "PU" || verseValue == "Karyawan" {
		verseOut = verseValue
	}
	divisiOut := "Wajib Pajak"
	useridOut := ""
	ppatKhususOut := ""
	verifiedStatus := "verified_pending"
	if verseOut == "WP" {
		if isWPBadan {
			divisiOut = "Wajib Pajak B"
		} else {
			divisiOut = "Wajib Pajak P"
		}
		if isWPBadan {
			verifiedStatus = "pending"
		} else {
			verifiedStatus = "complete"
		}
	}

	pool := h.repo.Pool()
	tx, err := pool.Begin(r.Context())
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
		return
	}
	defer tx.Rollback(r.Context())

	if verseOut == "WP" {
		if isWPBadan {
			divisiOut = "Wajib Pajak B"
		} else {
			divisiOut = "Wajib Pajak P"
		}
		useridOut, err = idgen.GenerateUserID(r.Context(), tx, "Wajib Pajak")
		if err != nil {
			jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
			return
		}
	} else if verseOut == "PU" {
		divisiOut = divisi
		useridOut, err = idgen.GenerateUserID(r.Context(), tx, divisiOut)
		if err != nil {
			jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
			return
		}
	} else {
		divisiOut = ""
	}

	var nipPtr, specialFieldPtr, pejabatUmumPtr *string
	var npwpBadanPtr, nibPtr, nibDocPathPtr *string
	if nip != "" {
		nipPtr = &nip
	}
	if specialField != "" {
		specialFieldPtr = &specialField
	}
	if pejabatUmum != "" {
		pejabatUmumPtr = &pejabatUmum
	}
	if isWPBadan && npwpBadan != "" {
		npwpBadanPtr = &npwpBadan
	}
	if isWPBadan && nib != "" {
		nibPtr = &nib
	}
	if isWPBadan && nibDocUploadID != "" {
		nibDocPath := filepath.Join("nib_docs", nibDocUploadID+".pdf")
		nibDocPathPtr = &nibDocPath
	}
	genderPtr := &gender
	log.Printf("[VERIFY_OTP_FINALIZE] preparing insert email=%s verse=%s is_wp_badan=%t divisi=%s npwp_set=%t nib_set=%t nib_doc_set=%t",
		email, verseOut, isWPBadan, divisiOut, npwpBadanPtr != nil, nibPtr != nil, nibDocPathPtr != nil)

	_, err = tx.Exec(r.Context(),
		`INSERT INTO a_2_verified_users (
			nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi,
			statuspengguna, ppat_khusus, gender, verse, nip, special_field, pejabat_umum, npwp_badan, nib, nib_doc_path
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $16, '', $8, $9, 'offline', $10, $11, $12, $13, $14, $15, $17, $18, $19)`,
		nama, nik, telepon, email, string(hashedPassword), ktpUploadID, otp,
		useridOut, divisiOut, ppatKhususOut, genderPtr, verseOut,
		nipPtr, specialFieldPtr, pejabatUmumPtr, verifiedStatus,
		npwpBadanPtr, nibPtr, nibDocPathPtr,
	)
	if err != nil {
		if isDuplicateKey(err) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": false,
				"message": "Akun sudah aktif. Silakan masuk ke akun Anda.",
				"code":    "ALREADY_VERIFIED",
			})
			return
		}
		log.Printf("[VERIFY_OTP_FINALIZE] INSERT a_2_failed email=%s verse=%s is_wp_badan=%t err=%v", email, verseOut, isWPBadan, err)
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		log.Printf("[VERIFY_OTP_FINALIZE] COMMIT failed email=%s verse=%s is_wp_badan=%t err=%v", email, verseOut, isWPBadan, err)
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
		return
	}
	log.Printf("[VERIFY_OTP_FINALIZE] success email=%s verse=%s is_wp_badan=%t verified_status=%s userid=%s",
		email, verseOut, isWPBadan, verifiedStatus, useridOut)

	// Simpan ktp_ocr_json ke cek_ktp_ocr (terikat NIK) untuk preview admin
	if h.repo != nil && ktpOcrJson != "" && nik != "" {
		if insErr := h.repo.InsertCekKtpOcr(r.Context(), nik, ktpOcrJson); insErr != nil {
			log.Printf("[VERIFY_OTP_FINALIZE] InsertCekKtpOcr error: %v", insErr)
		}
	}

	createdAt := time.Now().UnixMilli()
	if !isWPBadan && ktpOcrJson != "" {
		jsonBaseName := fmt.Sprintf("%s_%d", sanitizeNIKForFilename(nik), createdAt)
		if err := os.MkdirAll(h.cfg.TempUploadsDir, 0755); err == nil {
			payload := ktpExtractJSON{NIK: &nik, Nama: &nama, Alamat: nil, IsReadable: true, CreatedAt: createdAt, KtpOcrJson: ktpOcrJson}
			if body, err := json.Marshal(payload); err == nil {
				_ = os.WriteFile(filepath.Join(h.cfg.TempUploadsDir, jsonBaseName+".json"), body, 0644)
			}
		}
	}

	deletePendingOTP(email)

	if verseOut == "WP" && !isWPBadan {
		if err := mail.SendUserIDNotification(email, nama, useridOut); err != nil {
			log.Printf("[VERIFY_OTP_FINALIZE] SendUserIDNotification error: %v", err)
		}
	}

	msg := "Verifikasi Berhasil! Silakan masuk ke akun Anda."
	if verseOut == "WP" && isWPBadan {
		msg = "Pendaftaran berhasil. Akun Anda menunggu verifikasi admin. Anda dapat login setelah disetujui."
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": msg,
		"data": map[string]interface{}{
			"email":  email,
			"status": verifiedStatus,
			"userid": useridOut,
			"divisi": divisiOut,
		},
	})
}
// verifyOtpReq is the JSON body for verify-otp.
type verifyOtpReq struct {
	Email string `json:"email"`
	OTP   string `json:"otp"`
}

// VerifyOTP handles POST /api/v1/auth/verify-otp.
func (h *AuthHandler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	var req verifyOtpReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data verifikasi tidak valid.")
		return
	}
	email := strings.TrimSpace(req.Email)
	otp := strings.TrimSpace(req.OTP)
	if email == "" || otp == "" {
		jsonError(w, http.StatusBadRequest, "Email dan OTP harus diisi.")
		return
	}

	if h.repo == nil || h.repo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia.")
		return
	}

	ctx := r.Context()
	user, err := h.repo.GetUnverifiedByEmail(ctx, email)
	if err != nil {
		log.Printf("[VERIFY_OTP] GetUnverifiedByEmail error: %v", err)
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
		return
	}
	if user == nil {
		jsonError(w, http.StatusNotFound, "Email tidak ditemukan.")
		return
	}
	if user.OTP != otp {
		jsonError(w, http.StatusBadRequest, "Kode OTP salah.")
		return
	}

	existsVerified, err := h.repo.GetByEmailVerified(ctx, email)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
		return
	}
	if existsVerified {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Akun sudah aktif. Silakan masuk ke akun Anda.",
			"code":    "ALREADY_VERIFIED",
		})
		return
	}

	verseOut := "WP"
	if user.Verse != nil && *user.Verse != "" {
		v := *user.Verse
		if v == "PU" || v == "Karyawan" {
			verseOut = v
		}
	}
	divisiOut := "Wajib Pajak"
	useridOut := ""
	ppatKhususOut := ""

	pool := h.repo.Pool()
	tx, err := pool.Begin(ctx)
	if err != nil {
		log.Printf("[VERIFY_OTP] Begin error: %v", err)
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
		return
	}
	defer tx.Rollback(ctx)

	if verseOut == "WP" {
		divisiOut = "Wajib Pajak"
		useridOut, err = idgen.GenerateUserID(ctx, tx, "Wajib Pajak")
		if err != nil {
			log.Printf("[VERIFY_OTP] GenerateUserID error: %v", err)
			jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
			return
		}
	} else if verseOut == "PU" {
		divisiVal := "PPAT"
		if user.Divisi != nil {
			switch *user.Divisi {
			case "PPATS":
				divisiVal = "PPATS"
			case "Notaris":
				divisiVal = "Notaris"
			default:
				divisiVal = "PPAT"
			}
		}
		divisiOut = divisiVal
		useridOut, err = idgen.GenerateUserID(ctx, tx, divisiVal)
		if err != nil {
			log.Printf("[VERIFY_OTP] GenerateUserID error: %v", err)
			jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
			return
		}
		// ppat_khusus diisi admin saat validasi, bukan saat verify-otp
		ppatKhususOut = ""
	}
	// Karyawan: useridOut and divisiOut stay empty, admin will assign later

	nip := (*string)(nil)
	specialField := (*string)(nil)
	pejabatUmum := (*string)(nil)
	if user.NIP != nil {
		nip = user.NIP
	}
	if user.SpecialField != nil {
		specialField = user.SpecialField
	}
	if user.PejabatUmum != nil {
		pejabatUmum = user.PejabatUmum
	}

	insertArgs := &repository.InsertVerifiedArgs{
		Nama:         user.Nama,
		NIK:          user.NIK,
		Telepon:      user.Telepon,
		Email:        user.Email,
		Password:     user.Password,
		Foto:         user.Foto,
		OTP:          otp,
		Userid:       useridOut,
		Divisi:       divisiOut,
		PpatKhusus:   ppatKhususOut,
		Verse:        verseOut,
		NIP:          nip,
		SpecialField: specialField,
		PejabatUmum:  pejabatUmum,
	}
	if user.Gender != nil {
		insertArgs.Gender = user.Gender
	}

	// Single atomic transaction: GenerateUserID (tx) + INSERT a_2 + DELETE a_1. No pool insert.
	verifiedStatus := "verified_pending"
	if verseOut == "WP" {
		verifiedStatus = "complete"
	}
	_, err = tx.Exec(ctx,
		`INSERT INTO a_2_verified_users (
			nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi,
			statuspengguna, ppat_khusus, gender, verse, nip, special_field, pejabat_umum
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $16, '', $8, $9, 'offline', $10, $11, $12, $13, $14, $15)`,
		insertArgs.Nama, insertArgs.NIK, insertArgs.Telepon, insertArgs.Email, insertArgs.Password, insertArgs.Foto, insertArgs.OTP,
		insertArgs.Userid, insertArgs.Divisi, insertArgs.PpatKhusus, insertArgs.Gender, insertArgs.Verse,
		insertArgs.NIP, insertArgs.SpecialField, insertArgs.PejabatUmum, verifiedStatus,
	)
	if err != nil {
		if isDuplicateKey(err) {
			// Race: email sudah di-verify oleh request lain (klik ganda / submit bersamaan)
			_, _ = tx.Exec(ctx, `DELETE FROM a_1_unverified_users WHERE email = $1`, email)
			tx.Commit(ctx)
			log.Printf("[VERIFY_OTP] Duplicate key (race) for %s - akun sudah terverifikasi", email)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": false,
				"message": "Akun sudah aktif. Silakan masuk ke akun Anda.",
				"code":    "ALREADY_VERIFIED",
			})
			return
		}
		log.Printf("[VERIFY_OTP] Insert error: %v", err)
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
		return
	}
	_, err = tx.Exec(ctx, `DELETE FROM a_1_unverified_users WHERE email = $1`, email)
	if err != nil {
		log.Printf("[VERIFY_OTP] Delete error: %v", err)
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
		return
	}
	if err := tx.Commit(ctx); err != nil {
		log.Printf("[VERIFY_OTP] Commit error: %v", err)
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan saat verifikasi.")
		return
	}

	// Simpan ktp_ocr_json ke cek_ktp_ocr (terikat NIK) untuk preview admin
	if user.KtpOcrJson != nil && *user.KtpOcrJson != "" && user.NIK != "" {
		if insErr := h.repo.InsertCekKtpOcr(ctx, user.NIK, *user.KtpOcrJson); insErr != nil {
			log.Printf("[VERIFY_OTP] InsertCekKtpOcr error: %v", insErr)
		}
	}

	// WP: kirim email notifikasi userid agar user tahu dapat masuk
	if verseOut == "WP" {
		if err := mail.SendUserIDNotification(email, insertArgs.Nama, useridOut); err != nil {
			log.Printf("[VERIFY_OTP] SendUserIDNotification error: %v", err)
			// tetap sukses; user bisa lihat userid di response
		}
	}

	log.Printf("[VERIFY_OTP] Success for %s (verse: %s, userid: %s, status: %s)", email, verseOut, useridOut, verifiedStatus)

	w.Header().Set("Content-Type", "application/json")
	msg := "Verifikasi berhasil! Akun Anda sedang diproses."
	if verseOut == "WP" {
		msg = "Verifikasi berhasil! Silakan periksa email untuk User ID, lalu masuk ke dashboard."
	}
	resp := map[string]interface{}{
		"success": true,
		"message": msg,
		"data": map[string]interface{}{
			"email":  email,
			"status": verifiedStatus,
			"userid": useridOut,
			"divisi": divisiOut,
		},
	}
	json.NewEncoder(w).Encode(resp)
}

// resendOtpReq is the JSON body for resend-otp.
type resendOtpReq struct {
	Email string `json:"email"`
}

// --- Reset password (in-memory OTP + token) ---
type resetPasswordRequestReq struct {
	Email string `json:"email"`
	NIK   string `json:"nik"`
}

type verifyResetOtpReq struct {
	Email string `json:"email"`
	OTP   string `json:"otp"`
}

type verifyResetTokenReq struct {
	Token string `json:"token"`
}

type resetPasswordReq struct {
	Token    string `json:"token"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// ResetPasswordRequest handles POST /api/v1/auth/reset-password-request
// Body: email, nik. Cek user di a_2, kirim OTP ke email (in-memory, TTL 10 menit).
func (h *AuthHandler) ResetPasswordRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	var req resetPasswordRequestReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data tidak valid.")
		return
	}
	email := strings.TrimSpace(req.Email)
	nik := strings.TrimSpace(req.NIK)
	if email == "" || !strings.Contains(email, "@") || nik == "" {
		jsonError(w, http.StatusBadRequest, "Email dan NIK wajib diisi.")
		return
	}
	if len(nik) != 16 || !isDigits(nik) || !ktpocr.ValidNIK(nik) {
		jsonError(w, http.StatusBadRequest, "NIK tidak valid.")
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia.")
		return
	}
	exists, err := h.repo.VerifiedEmailNikExists(r.Context(), email, nik)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan.")
		return
	}
	if !exists {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Jika data cocok, OTP telah dikirim ke email Anda.",
		})
		return
	}
	otp := generateOTP()
	setResetOTP(email, nik, otp)
	go func() {
		if sendErr := mail.SendPasswordResetOTP(email, otp); sendErr != nil {
			log.Printf("[RESET_PASSWORD_REQUEST] SendPasswordResetOTP to %s: %v", email, sendErr)
		}
	}()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Jika data cocok, OTP telah dikirim ke email Anda.",
	})
}

// VerifyResetOTP handles POST /api/v1/auth/verify-reset-otp
// Body: email, otp. Returns token untuk halaman ubah kata sandi (in-memory, TTL 10 menit).
func (h *AuthHandler) VerifyResetOTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	var req verifyResetOtpReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data tidak valid.")
		return
	}
	email := strings.TrimSpace(req.Email)
	otp := strings.TrimSpace(req.OTP)
	if email == "" || otp == "" {
		jsonError(w, http.StatusBadRequest, "Email dan OTP wajib diisi.")
		return
	}
	if !getAndConsumeResetOTP(email, otp) {
		jsonError(w, http.StatusBadRequest, "OTP tidak valid atau sudah kadaluarsa.")
		return
	}
	token, err := newResetToken()
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan.")
		return
	}
	setResetToken(token, email)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"token":   token,
		"message": "OTP valid.",
	})
}

// VerifyResetToken handles POST /api/v1/auth/verify-reset-token
// Body: token. Returns email untuk tampil di halaman ubah kata sandi (token tidak dikonsumsi).
func (h *AuthHandler) VerifyResetToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	var req verifyResetTokenReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data tidak valid.")
		return
	}
	token := strings.TrimSpace(req.Token)
	if token == "" {
		jsonError(w, http.StatusBadRequest, "Token tidak valid.")
		return
	}
	email, ok := getResetTokenEmail(token)
	if !ok {
		jsonError(w, http.StatusBadRequest, "Token tidak valid atau kadaluarsa.")
		return
	}
	user, err := h.repo.GetResetUserByEmail(r.Context(), email)
	if err != nil || user == nil {
		jsonError(w, http.StatusInternalServerError, "Gagal memuat data akun.")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"email":   user.Email,
		"nama":    user.Nama,
		"divisi":  user.Divisi,
		"userid":  user.Userid,
	})
}

// ResetPassword handles POST /api/v1/auth/reset-password
// Body: token, email, password. Update password di a_2, token sekali pakai (dikonsumsi).
func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	var req resetPasswordReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data tidak valid.")
		return
	}
	token := strings.TrimSpace(req.Token)
	emailIn := strings.TrimSpace(req.Email)
	password := strings.TrimSpace(req.Password)
	if token == "" || emailIn == "" || password == "" {
		jsonError(w, http.StatusBadRequest, "Data tidak lengkap.")
		return
	}
	if len(password) < 8 {
		jsonError(w, http.StatusBadRequest, "Password minimal 8 karakter.")
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia.")
		return
	}
	email, ok := getAndConsumeResetToken(token)
	if !ok || !strings.EqualFold(email, emailIn) {
		jsonError(w, http.StatusBadRequest, "Token tidak valid atau kadaluarsa.")
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Terjadi kesalahan.")
		return
	}
	_, err = h.repo.Pool().Exec(r.Context(),
		`UPDATE a_2_verified_users SET password = $1 WHERE email = $2`,
		string(hashedPassword), email)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan password.")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Password berhasil direset.",
	})
}

// getProfileUserid returns userid from cookie ebphtb_userid or header X-User-Id (untuk profile endpoints).
func getProfileUserid(r *http.Request) string {
	if c, err := r.Cookie("ebphtb_userid"); err == nil && c != nil && strings.TrimSpace(c.Value) != "" {
		return strings.TrimSpace(c.Value)
	}
	return strings.TrimSpace(r.Header.Get("X-User-Id"))
}

// GetProfile handles GET /api/v1/auth/profile. Mengembalikan data profil user (cookie atau X-User-Id).
func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getProfileUserid(r)
	if userid == "" {
		jsonError(w, http.StatusUnauthorized, "Sesi tidak valid. Silakan login kembali.")
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia.")
		return
	}
	user, err := h.repo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || user == nil {
		jsonError(w, http.StatusNotFound, "Profil tidak ditemukan.")
		return
	}
	foto := user.Fotoprofil
	username, nip, specialField, specialParafv, pejabatUmum, telepon, gender, tandaTanganMime, tandaTanganPath, alamatPu := "", "", "", "", "", "", "", "", "", ""
	if user.Username != nil {
		username = *user.Username
	}
	if user.NIP != nil {
		nip = *user.NIP
	}
	if user.SpecialField != nil {
		specialField = *user.SpecialField
	}
	if user.SpecialParafv != nil {
		specialParafv = *user.SpecialParafv
	}
	if user.PejabatUmum != nil {
		pejabatUmum = *user.PejabatUmum
	}
	if user.Telepon != nil {
		telepon = *user.Telepon
	}
	if user.Gender != nil {
		gender = *user.Gender
	}
	if user.TandaTanganMime != nil {
		tandaTanganMime = *user.TandaTanganMime
	}
	if user.TandaTanganPath != nil {
		tandaTanganPath = *user.TandaTanganPath
	}
	if user.AlamatPu != nil {
		alamatPu = *user.AlamatPu
	}
	ppatKhusus := ""
	if user.PpatKhusus != nil {
		ppatKhusus = *user.PpatKhusus
	}
	statusPpat := ""
	if user.StatusPpat != nil {
		statusPpat = strings.TrimSpace(*user.StatusPpat)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user": map[string]interface{}{
			"userid":              user.Userid,
			"nama":                user.Nama,
			"email":               user.Email,
			"divisi":              user.Divisi,
			"fotoprofil":          foto,
			"username":            username,
			"nip":                 nip,
			"special_field":       specialField,
			"special_parafv":      specialParafv,
			"pejabat_umum":        pejabatUmum,
			"telepon":             telepon,
			"gender":              gender,
			"alamat_pu":           alamatPu,
			"ppat_khusus":         ppatKhusus,
			"tanda_tangan_mime":   tandaTanganMime,
			"tanda_tangan_path":   tandaTanganPath,
			"statuspengguna":      user.Statuspengguna,
			"status_ppat":         statusPpat,
		},
	})
}

// UploadProfilePhoto handles POST /api/v1/auth/profile/upload. Form: fotoprofil (file).
func (h *AuthHandler) UploadProfilePhoto(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getProfileUserid(r)
	if userid == "" {
		jsonError(w, http.StatusUnauthorized, "Sesi tidak valid. Silakan login kembali.")
		return
	}
	if err := r.ParseMultipartForm(5 << 20); err != nil {
		jsonError(w, http.StatusBadRequest, "File tidak valid.")
		return
	}
	file, header, err := r.FormFile("fotoprofil")
	if err != nil {
		jsonError(w, http.StatusBadRequest, "Field fotoprofil wajib (file gambar).")
		return
	}
	defer file.Close()
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExtensions[ext] {
		ext = ".jpg"
	}
	dir := h.cfg.ProfilePhotoDir
	if err := os.MkdirAll(dir, 0755); err != nil {
		log.Printf("[PROFILE] mkdir %s: %v", dir, err)
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan foto.")
		return
	}
	safeName := userid + ext
	fpath := filepath.Join(dir, safeName)
	dst, err := os.Create(fpath)
	if err != nil {
		log.Printf("[PROFILE] create %s: %v", fpath, err)
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan foto.")
		return
	}
	_, err = io.Copy(dst, file)
	dst.Close()
	if err != nil {
		os.Remove(fpath)
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan foto.")
		return
	}
	// Path untuk client: prefix yang di-rewrite ke backend (Next.js proxy /api -> Go)
	pathInDB := "/api/profile-photo/" + userid
	if h.repo != nil {
		if err := h.repo.UpdateFotoprofil(r.Context(), userid, pathInDB); err != nil {
			log.Printf("[PROFILE] UpdateFotoprofil: %v", err)
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Foto profil berhasil diupdate",
		"foto":    pathInDB,
	})
}

type updatePasswordReq struct {
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

type updateProfileReq struct {
	Username     string  `json:"username"`
	Nip          string  `json:"nip"`
	Email        string  `json:"email"`
	Telepon      string  `json:"telepon"`
	AlamatPu     *string `json:"alamat_pu,omitempty"`
	Gender       *string `json:"gender,omitempty"`
	SpecialField *string `json:"special_field,omitempty"`
	PejabatUmum  *string `json:"pejabat_umum,omitempty"`
}

// UpdateProfile handles PUT /api/v1/auth/profile. Body: username, nip, email, telepon (field yang boleh diedit).
func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getProfileUserid(r)
	if userid == "" {
		jsonError(w, http.StatusUnauthorized, "Sesi tidak valid. Silakan login kembali.")
		return
	}
	var req updateProfileReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data tidak valid.")
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia.")
		return
	}
	err := h.repo.UpdateProfileEditable(r.Context(), userid,
		strings.TrimSpace(req.Username), strings.TrimSpace(req.Nip),
		strings.TrimSpace(req.Email), strings.TrimSpace(req.Telepon),
		req.AlamatPu, req.Gender, req.SpecialField, req.PejabatUmum)
	if err != nil {
		log.Printf("[PROFILE] UpdateProfileEditable: %v", err)
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan perubahan profil.")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Profil berhasil diperbarui.",
	})
}

// UpdatePassword handles POST /api/v1/auth/update-password. Body: oldPassword, newPassword.
func (h *AuthHandler) UpdatePassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getProfileUserid(r)
	if userid == "" {
		jsonError(w, http.StatusUnauthorized, "Sesi tidak valid. Silakan login kembali.")
		return
	}
	var req updatePasswordReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data tidak valid.")
		return
	}
	if strings.TrimSpace(req.NewPassword) == "" || len(req.NewPassword) < 8 {
		jsonError(w, http.StatusBadRequest, "Password baru minimal 8 karakter.")
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia.")
		return
	}
	user, err := h.repo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || user == nil {
		jsonError(w, http.StatusUnauthorized, "Profil tidak ditemukan.")
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		jsonError(w, http.StatusUnauthorized, "Kata sandi lama salah.")
		return
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 10)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal memperbarui password.")
		return
	}
	_, err = h.repo.Pool().Exec(r.Context(), `UPDATE a_2_verified_users SET password = $1 WHERE userid = $2`, string(hashed), userid)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal memperbarui password.")
		return
	}
	// Kirim notifikasi ke email (non-blocking)
	go func() {
		if err := mail.SendPasswordChangeNotification(user.Email, user.Userid, user.Nama); err != nil {
			log.Printf("[UPDATE_PASSWORD] Email notifikasi gagal: %v", err)
		}
	}()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Password berhasil diperbarui.",
	})
}

// UpdateProfileParaf handles POST /api/v1/auth/update-profile-paraf. Form: signature (file).
func (h *AuthHandler) UpdateProfileParaf(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getProfileUserid(r)
	if userid == "" {
		jsonError(w, http.StatusUnauthorized, "Sesi tidak valid. Silakan login kembali.")
		return
	}
	if err := r.ParseMultipartForm(5 << 20); err != nil {
		jsonError(w, http.StatusBadRequest, "File tidak valid.")
		return
	}
	file, header, err := r.FormFile("signature")
	if err != nil {
		jsonError(w, http.StatusBadRequest, "Field signature wajib (file gambar).")
		return
	}
	defer file.Close()
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".png" && ext != ".jpg" && ext != ".jpeg" && ext != ".webp" {
		ext = ".png"
	}
	mime := "image/png"
	switch ext {
	case ".jpg", ".jpeg":
		mime = "image/jpeg"
	case ".webp":
		mime = "image/webp"
	}
	dir := h.cfg.ProfileSignatureDir
	if err := os.MkdirAll(dir, 0755); err != nil {
		log.Printf("[PROFILE] mkdir signature %s: %v", dir, err)
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan paraf.")
		return
	}
	safeName := userid + ext
	fpath := filepath.Join(dir, safeName)
	dst, err := os.Create(fpath)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan paraf.")
		return
	}
	_, err = io.Copy(dst, file)
	dst.Close()
	if err != nil {
		os.Remove(fpath)
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan paraf.")
		return
	}
	pathInDB := "/api/profile-signature/" + userid
	if h.repo != nil {
		if err := h.repo.UpdateTandaTangan(r.Context(), userid, mime, pathInDB); err != nil {
			log.Printf("[PROFILE] UpdateTandaTangan: %v", err)
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Paraf berhasil disimpan.",
	})
}

type completeProfileReq struct {
	Userid       string `json:"userid"`
	Nip          string `json:"nip"`
	Username     string `json:"username"`
	SpecialField string `json:"special_field"`
	SpecialParafv string `json:"special_parafv"`
	PejabatUmum  string `json:"pejabat_umum"`
}

// CompleteProfile handles POST /api/v1/auth/complete-profile. Body: userid, nip, username, special_field, special_parafv, pejabat_umum.
func (h *AuthHandler) CompleteProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	var req completeProfileReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data tidak valid.")
		return
	}
	userid := strings.TrimSpace(req.Userid)
	if userid == "" {
		jsonError(w, http.StatusBadRequest, "userid wajib.")
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia.")
		return
	}
	user, err := h.repo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || user == nil {
		jsonError(w, http.StatusNotFound, "User tidak ditemukan.")
		return
	}
	nama, telepon := user.Nama, ""
	if user.Telepon != nil {
		telepon = *user.Telepon
	}
	err = h.repo.UpdateCompleteUser(r.Context(), userid, nama, telepon,
		strings.TrimSpace(req.Username), strings.TrimSpace(req.Nip),
		strings.TrimSpace(req.SpecialParafv), strings.TrimSpace(req.SpecialField),
		strings.TrimSpace(req.PejabatUmum), "")
	if err != nil {
		log.Printf("[PROFILE] CompleteProfile UpdateCompleteUser: %v", err)
		jsonError(w, http.StatusInternalServerError, "Gagal menyimpan profil.")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Profil berhasil dilengkapi.",
	})
}

// ServeProfilePhoto handles GET /api/profile-photo/{userid}. Menyajikan file foto profil.
func (h *AuthHandler) ServeProfilePhoto(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	userid := strings.TrimSpace(r.PathValue("userid"))
	if userid == "" {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}
	dir := h.cfg.ProfilePhotoDir
	for _, ext := range []string{".jpg", ".jpeg", ".png"} {
		fpath := filepath.Join(dir, userid+ext)
		if f, err := os.Open(fpath); err == nil {
			defer f.Close()
			if stat, err := f.Stat(); err == nil && !stat.IsDir() {
				w.Header().Set("Content-Type", "image/jpeg")
				if ext == ".png" {
					w.Header().Set("Content-Type", "image/png")
				}
				http.ServeContent(w, r, stat.Name(), stat.ModTime(), f)
				return
			}
		}
	}
	http.Error(w, "Not Found", http.StatusNotFound)
}

// ServeProfileSignature handles GET /api/profile-signature/{userid}. Menyajikan file paraf/tanda tangan.
func (h *AuthHandler) ServeProfileSignature(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	userid := strings.TrimSpace(r.PathValue("userid"))
	if userid == "" {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}
	dir := h.cfg.ProfileSignatureDir
	for _, ext := range []string{".png", ".jpg", ".jpeg", ".webp"} {
		fpath := filepath.Join(dir, userid+ext)
		if f, err := os.Open(fpath); err == nil {
			defer f.Close()
			if stat, err := f.Stat(); err == nil && !stat.IsDir() {
				ct := "image/png"
				switch ext {
				case ".jpg", ".jpeg":
					ct = "image/jpeg"
				case ".webp":
					ct = "image/webp"
				}
				w.Header().Set("Content-Type", ct)
				http.ServeContent(w, r, stat.Name(), stat.ModTime(), f)
				return
			}
		}
	}
	http.Error(w, "Not Found", http.StatusNotFound)
}

// Logout handles POST /api/v1/auth/logout. Menghapus cookie sesi.
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "ebphtb_userid",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   isSecureRequest(r),
		MaxAge:   -1,
	})
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "message": "Berhasil keluar."})
}

// ResendOTP handles POST /api/v1/auth/resend-otp.
// Mendukung: (1) sesi in-memory (request-otp flow), (2) sesi DB (setelah register, OTP di a_1).
func (h *AuthHandler) ResendOTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	var req resendOtpReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "Data tidak valid.")
		return
	}
	email := strings.TrimSpace(req.Email)
	if email == "" {
		jsonError(w, http.StatusBadRequest, "Email harus diisi.")
		return
	}

	otp := generateOTP()
	ctx := r.Context()

	// 1) Sesi in-memory (request-otp): cukup perbarui memory dan kirim email
	entry, ok := getPendingOTP(email)
	if ok && entry.OTP != "" {
		setPendingOTP(email, otp)
		if err := mail.SendOTP(email, otp); err != nil {
			log.Printf("[RESEND_OTP] Email gagal ke %s: %v. OTP: %s", email, err, otp)
			jsonError(w, http.StatusInternalServerError, "Gagal mengirim OTP ke email: "+err.Error())
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "OTP baru telah dikirim ke email Anda.",
		})
		return
	}

	// 2) Sesi DB: setelah register, OTP ada di a_1_unverified_users
	if h.repo != nil && h.repo.Pool() != nil {
		existsVerified, err := h.repo.GetByEmailVerified(ctx, email)
		if err != nil {
			log.Printf("[RESEND_OTP] GetByEmailVerified error: %v", err)
			jsonError(w, http.StatusInternalServerError, "Gagal memproses.")
			return
		}
		if existsVerified {
			jsonError(w, http.StatusBadRequest, "Email sudah terdaftar. Silakan masuk.")
			return
		}
		existsUnverified, err := h.repo.GetByEmailUnverified(ctx, email)
		if err != nil || !existsUnverified {
			jsonError(w, http.StatusNotFound, "Sesi OTP tidak ditemukan. Silakan daftar ulang.")
			return
		}
		if err := h.repo.UpdateOTPByEmail(ctx, email, otp); err != nil {
			log.Printf("[RESEND_OTP] UpdateOTPByEmail %s: %v", email, err)
			jsonError(w, http.StatusInternalServerError, "Gagal memperbarui OTP.")
			return
		}
		if err := mail.SendOTP(email, otp); err != nil {
			log.Printf("[RESEND_OTP] Email gagal ke %s: %v. OTP: %s", email, err, otp)
			jsonError(w, http.StatusInternalServerError, "Gagal mengirim OTP ke email: "+err.Error())
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "OTP baru telah dikirim ke email Anda.",
		})
		return
	}

	jsonError(w, http.StatusNotFound, "Sesi OTP tidak ditemukan. Silakan daftar ulang.")
}

func jsonError(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": msg})
}

func jsonErrorExtra(w http.ResponseWriter, code int, msg string, extra map[string]interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	m := map[string]interface{}{"success": false, "message": msg}
	for k, v := range extra {
		m[k] = v
	}
	json.NewEncoder(w).Encode(m)
}

func generateOTP() string {
	return fmt.Sprintf("%06d", mathrand.Intn(1000000))
}

// isDuplicateKey returns true if err is PostgreSQL unique_violation (23505)
func isDuplicateKey(err error) bool {
	if err == nil {
		return false
	}
	// pgx v5: use pgconn.PgError
	if e, ok := err.(interface{ SQLState() string }); ok {
		return e.SQLState() == "23505"
	}
	return strings.Contains(err.Error(), "23505") || strings.Contains(err.Error(), "duplicate key")
}

func isDigits(s string) bool {
	for _, r := range s {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}










