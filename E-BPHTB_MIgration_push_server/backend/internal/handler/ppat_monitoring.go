package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

var jakartaTZ *time.Location

func init() {
	jakartaTZ, _ = time.LoadLocation("Asia/Jakarta")
	if jakartaTZ == nil {
		jakartaTZ = time.Local
	}
}

var namaBulanID = []string{
	"", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
	"Juli", "Agustus", "September", "Oktober", "November", "Desember",
}

// dueDateForActivityMonth: aktivitas bulan (year, month) → jatuh tempo tgl 10 bulan berikutnya.
func dueDateForActivityMonth(year, month int) time.Time {
	return time.Date(year, time.Month(month), 1, 0, 0, 0, 0, jakartaTZ).AddDate(0, 1, 9)
}

func formatPeriodeLabel(year, month int) string {
	if month < 1 || month > 12 {
		return fmt.Sprintf("%d", year)
	}
	return fmt.Sprintf("%s %d", namaBulanID[month], year)
}

func computeStatusAkun(stPpat string, sudahLapor bool, now, due time.Time) string {
	if strings.EqualFold(stPpat, "suspend") {
		return "terblokir"
	}
	if sudahLapor {
		return "aktif"
	}
	endDue := time.Date(due.Year(), due.Month(), due.Day(), 23, 59, 59, 0, jakartaTZ)
	if now.After(endDue) {
		return "peringatan"
	}
	// Belum lewat jatuh tempo: bisa peringatan jika dalam 10 hari sebelum tgl 10
	if now.Year() == due.Year() && now.Month() == due.Month() && now.Day() >= 1 && now.Day() <= 9 {
		return "peringatan"
	}
	return "aktif"
}

func daysLate(now, due time.Time) int {
	if now.Before(due) {
		return 0
	}
	d0 := time.Date(due.Year(), due.Month(), due.Day(), 0, 0, 0, 0, jakartaTZ)
	d1 := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, jakartaTZ)
	if d1.Before(d0) {
		return 0
	}
	return int(d1.Sub(d0).Hours() / 24)
}

// MonitoringKeterlambatan handles GET /api/ppat/monitoring-keterlambatan
func (h *PpatHandler) MonitoringKeterlambatan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if h.userRepo == nil || h.laporanRepo == nil || h.laporanRepo.Pool() == nil {
		ppatJSONError(w, http.StatusServiceUnavailable, "Database not configured")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 25*time.Second)
	defer cancel()

	divisi := h.userRepo.GetDivisi(ctx, userid)
	isAdmin := strings.EqualFold(divisi, "Administrator")
	onlyUserid := ""
	if !isAdmin {
		onlyUserid = userid
	}

	yStr := strings.TrimSpace(r.URL.Query().Get("tahun"))
	mStr := strings.TrimSpace(r.URL.Query().Get("bulan"))
	q := strings.TrimSpace(r.URL.Query().Get("q"))

	now := time.Now().In(jakartaTZ)
	ay, am := now.Year(), int(now.Month())
	if ayStr, err := strconv.Atoi(yStr); err == nil && yStr != "" {
		ay = ayStr
	}
	if mStr != "" {
		if mi, err := strconv.Atoi(mStr); err == nil && mi >= 1 && mi <= 12 {
			am = mi
		}
	} else {
		// Default: periode aktivitas = bulan kalender sebelumnya
		prev := now.AddDate(0, -1, 0)
		ay, am = prev.Year(), int(prev.Month())
	}

	raw, err := h.laporanRepo.ListMonitoringCompliance(ctx, ay, am, q, onlyUserid)
	if err != nil {
		ppatJSONError(w, http.StatusInternalServerError, "Gagal memuat data")
		return
	}

	type rowOut struct {
		NamaPejabat       string `json:"nama_pejabat"`
		NIP               string `json:"nip"`
		Userid            string `json:"userid"`
		Periode           string `json:"periode"`
		PeriodeTahun      int    `json:"periode_tahun"`
		PeriodeBulan      int    `json:"periode_bulan"`
		JatuhTempo        string `json:"jatuh_tempo"`
		HariTerlambat     int    `json:"hari_terlambat"`
		StatusAkun        string `json:"status_akun"`
		StatusPpat        string `json:"status_ppat"`
		SudahLapor        bool   `json:"sudah_lapor"`
		Nobooking         string `json:"nobooking,omitempty"`
		NoRegistrasi      string `json:"no_registrasi,omitempty"`
		Noppbb            string `json:"noppbb,omitempty"`
		Namawajibpajak    string `json:"namawajibpajak,omitempty"`
		TanggalTerima     string `json:"tanggal_terima,omitempty"`
		BatasWaktu        string `json:"batas_waktu,omitempty"`
		Status            string `json:"status,omitempty"`
		Keterangan        string `json:"keterangan,omitempty"`
	}

	rowsOut := make([]rowOut, 0, len(raw))
	due := dueDateForActivityMonth(ay, am)
	total := len(raw)
	sudah := 0
	terlambatBlokir := 0

	for _, row := range raw {
		st := row.StatusPpat
		sa := computeStatusAkun(st, row.SudahLapor, now, due)
		hl := 0
		if !row.SudahLapor && strings.ToLower(st) != "suspend" {
			hl = daysLate(now, due)
		}
		if strings.ToLower(st) == "suspend" {
			hl = daysLate(now, due)
		}
		jt := due.Format("2006-01-02")
		if row.SudahLapor {
			sudah++
		}
		endDue := time.Date(due.Year(), due.Month(), due.Day(), 23, 59, 59, 0, jakartaTZ)
		if !row.SudahLapor && (st == "suspend" || now.After(endDue)) {
			terlambatBlokir++
		}
		ket := ""
		if st == "suspend" {
			ket = "Akun ditangguhkan karena laporan tidak diserahkan tepat waktu."
		} else if !row.SudahLapor && now.After(due) {
			ket = "Belum melaporkan periode ini."
		}
		rowsOut = append(rowsOut, rowOut{
			NamaPejabat:   row.NamaPejabat,
			NIP:           row.NIP,
			Userid:        row.Userid,
			Periode:       formatPeriodeLabel(ay, am),
			PeriodeTahun:  ay,
			PeriodeBulan:  am,
			JatuhTempo:    jt,
			HariTerlambat: hl,
			StatusAkun:    sa,
			StatusPpat:    st,
			SudahLapor:    row.SudahLapor,
			BatasWaktu:    jt,
			Status:        formatStatusKolom(sa, row.SudahLapor, st),
			Keterangan:    ket,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"rows":    rowsOut,
		"summary": map[string]interface{}{
			"total_pejabat":            total,
			"sudah_lapor":              sudah,
			"terlambat_atau_terblokir": terlambatBlokir,
			"periode_label":            formatPeriodeLabel(ay, am),
			"periode_tahun":            ay,
			"periode_bulan":            am,
		},
	})
}

func formatStatusKolom(sa string, sudahLapor bool, stPpat string) string {
	if strings.EqualFold(stPpat, "suspend") {
		return "Terblokir"
	}
	if sudahLapor {
		return "Sudah lapor"
	}
	switch sa {
	case "terblokir":
		return "Terblokir"
	case "peringatan":
		return "Peringatan"
	default:
		return "Aktif"
	}
}

// SubmitLaporanBulanan handles POST /api/ppat/laporan-bulanan/submit
func (h *PpatHandler) SubmitLaporanBulanan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if h.laporanRepo == nil || h.laporanRepo.Pool() == nil || h.userRepo == nil {
		ppatJSONError(w, http.StatusServiceUnavailable, "Database not configured")
		return
	}
	if err := r.ParseMultipartForm(maxDocumentSize); err != nil {
		ppatJSONError(w, http.StatusBadRequest, "Gagal membaca form")
		return
	}
	tahun, _ := strconv.Atoi(strings.TrimSpace(r.FormValue("tahun")))
	bulan, _ := strconv.Atoi(strings.TrimSpace(r.FormValue("bulan")))
	if tahun < 2000 || tahun > 2100 || bulan < 1 || bulan > 12 {
		ppatJSONError(w, http.StatusBadRequest, "tahun dan bulan tidak valid")
		return
	}
	var filePath *string
	if f, hdr, err := r.FormFile("dokumen"); err == nil && hdr != nil {
		defer f.Close()
		data, err := io.ReadAll(io.LimitReader(f, maxDocumentSize))
		if err != nil || len(data) == 0 {
			ppatJSONError(w, http.StatusBadRequest, "File tidak valid")
			return
		}
		baseDir := h.cfg.PpatStorageBaseDir
		if baseDir == "" {
			baseDir = "./storage/ppat"
		}
		sub := filepath.Join("laporan_bulanan", strconv.Itoa(tahun), fmt.Sprintf("%02d", bulan), userid)
		dir := filepath.Join(baseDir, sub)
		if err := ensureDir(dir); err != nil {
			fallbackRoot := filepath.Join(os.TempDir(), "ppat_storage")
			dir = filepath.Join(fallbackRoot, sub)
			if err2 := ensureDir(dir); err2 != nil {
				log.Printf("[PPAT] laporan ensureDir: %v; fallback: %v", err, err2)
				ppatJSONError(w, http.StatusInternalServerError, "Gagal menyimpan file")
				return
			}
		}
		ext := strings.ToLower(filepath.Ext(hdr.Filename))
		if ext == "" {
			ext = ".pdf"
		}
		fn := fmt.Sprintf("laporan_%s_%d%s", userid, time.Now().UnixMilli(), ext)
		full := filepath.Join(dir, fn)
		if err := os.WriteFile(full, data, 0644); err != nil {
			fallbackRoot := filepath.Join(os.TempDir(), "ppat_storage")
			dir = filepath.Join(fallbackRoot, sub)
			if err2 := ensureDir(dir); err2 != nil {
				log.Printf("[PPAT] laporan WriteFile: %v; fallback mkdir: %v", err, err2)
				ppatJSONError(w, http.StatusInternalServerError, "Gagal menulis file")
				return
			}
			full = filepath.Join(dir, fn)
			if err := os.WriteFile(full, data, 0644); err != nil {
				log.Printf("[PPAT] laporan WriteFile fallback: %v", err)
				ppatJSONError(w, http.StatusInternalServerError, "Gagal menulis file")
				return
			}
		}
		rel := filepath.ToSlash(filepath.Join(sub, fn))
		filePath = &rel
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	if err := h.laporanRepo.UpsertSubmission(ctx, userid, tahun, bulan, filePath); err != nil {
		log.Printf("[PPAT] SubmitLaporanBulanan UpsertSubmission: %v", err)
		ppatJSONError(w, http.StatusInternalServerError, "Gagal menyimpan laporan")
		return
	}
	_ = h.userRepo.UpdateStatusPpat(ctx, userid, "aktif")
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Laporan tersimpan. Akses pembuatan SSPD diaktifkan kembali.",
	})
}

// PostMonitoringUnblock handles POST /api/ppat/monitoring-keterlambatan/unblock (admin manual).
func (h *PpatHandler) PostMonitoringUnblock(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	caller := getPpatUserid(r)
	if caller == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if h.userRepo == nil {
		ppatJSONError(w, http.StatusServiceUnavailable, "Database not configured")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()
	if !strings.EqualFold(h.userRepo.GetDivisi(ctx, caller), "Administrator") {
		ppatJSONError(w, http.StatusForbidden, "Hanya administrator")
		return
	}
	var body struct {
		Userid string `json:"userid"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	target := strings.TrimSpace(body.Userid)
	if target == "" {
		ppatJSONError(w, http.StatusBadRequest, "userid wajib")
		return
	}
	if err := h.userRepo.UpdateStatusPpat(ctx, target, "aktif"); err != nil {
		ppatJSONError(w, http.StatusInternalServerError, "Gagal membuka blokir")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Akses dibuka manual.",
	})
}

// PostMonitoringNotify handles POST /api/ppat/monitoring-keterlambatan/notify (stub untuk kanal notifikasi).
func (h *PpatHandler) PostMonitoringNotify(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if h.userRepo == nil {
		ppatJSONError(w, http.StatusServiceUnavailable, "Database not configured")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if !strings.EqualFold(h.userRepo.GetDivisi(ctx, userid), "Administrator") {
		ppatJSONError(w, http.StatusForbidden, "Hanya administrator")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Permintaan notifikasi dicatat (integrasi email/WA dapat ditambahkan kemudian).",
	})
}
