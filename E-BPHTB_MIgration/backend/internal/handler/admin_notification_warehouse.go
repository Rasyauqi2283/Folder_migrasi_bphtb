package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"

	"ebphtb/backend/internal/repository"
)

// AdminNotificationWarehouseHandler handles /api/admin/notification-warehouse/* for PPAT users and pemutakhiran.
type AdminNotificationWarehouseHandler struct {
	repo   *repository.UserRepo
	booker *repository.BookingRepo
}

// NewAdminNotificationWarehouseHandler creates a handler.
func NewAdminNotificationWarehouseHandler(repo *repository.UserRepo, booker *repository.BookingRepo) *AdminNotificationWarehouseHandler {
	return &AdminNotificationWarehouseHandler{repo: repo, booker: booker}
}

// adminUseridFromCookie returns userid from ebphtb_userid cookie.
func adminUseridFromCookie(r *http.Request) string {
	c, err := r.Cookie("ebphtb_userid")
	if err != nil || c == nil || strings.TrimSpace(c.Value) == "" {
		return ""
	}
	return strings.TrimSpace(c.Value)
}

// requireAdmin checks cookie ebphtb_userid and divisi; returns 401/403 if not admin.
func (h *AdminNotificationWarehouseHandler) requireAdmin(w http.ResponseWriter, r *http.Request) bool {
	userid := adminUseridFromCookie(r)
	if userid == "" {
		adminJSON(w, http.StatusUnauthorized, map[string]interface{}{
			"success": false,
			"message": "Unauthorized",
		})
		return false
	}
	if h.repo == nil || h.repo.Pool() == nil {
		adminJSON(w, http.StatusServiceUnavailable, map[string]interface{}{
			"success": false,
			"message": "Database tidak tersedia",
		})
		return false
	}
	user, err := h.repo.GetByIdentifierForLogin(r.Context(), userid)
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

func adminJSON(w http.ResponseWriter, status int, body interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func statusLabel(s *string) string {
	if s == nil {
		return "Unknown"
	}
	switch strings.ToLower(*s) {
	case "aktif":
		return "Aktif"
	case "non-aktif", "nonaktif":
		return "Nonaktif"
	default:
		return *s
	}
}

func ppatUserToMap(u *repository.PpatUserRow) map[string]interface{} {
	sf := "-"
	if u.SpecialField != nil && *u.SpecialField != "" {
		sf = *u.SpecialField
	}
	m := map[string]interface{}{
		"id":            u.ID,
		"nama":          u.Nama,
		"special_field": sf,
		"userid":        u.Userid,
		"divisi":        u.Divisi,
		"status_ppat":   u.StatusPpat,
		"ppat_khusus":   u.PpatKhusus,
		"email":         u.Email,
		"created_at":    u.CreatedAt,
		"updated_at":    u.UpdatedAt,
		"status":        statusLabel(u.StatusPpat),
	}
	return m
}

// GetPpatUsers handles GET /api/admin/notification-warehouse/ppat-users.
func (h *AdminNotificationWarehouseHandler) GetPpatUsers(w http.ResponseWriter, r *http.Request) {
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
		limit = 50
	}
	search := strings.TrimSpace(r.URL.Query().Get("search"))
	status := strings.TrimSpace(r.URL.Query().Get("status"))

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	list, total, err := h.repo.ListPpatUsers(ctx, page, limit, search, status)
	if err != nil {
		log.Printf("[ADMIN] ListPpatUsers: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil data pengguna PPAT/PPATS",
		})
		return
	}

	formatted := make([]map[string]interface{}, 0, len(list))
	for _, u := range list {
		formatted = append(formatted, ppatUserToMap(&u))
	}

	totalPages := 1
	if limit > 0 {
		totalPages = (total + limit - 1) / limit
	}
	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success":    true,
		"data":       formatted,
		"pagination": map[string]interface{}{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": totalPages,
		},
		"search": search,
		"status": status,
	})
}

// GetPpatUserByID handles GET /api/admin/notification-warehouse/ppat-users/{userid}.
func (h *AdminNotificationWarehouseHandler) GetPpatUserByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	userid := strings.TrimSpace(r.PathValue("userid"))
	if userid == "" {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "userid wajib",
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	u, err := h.repo.GetPpatUserByUserid(ctx, userid)
	if err != nil {
		log.Printf("[ADMIN] GetPpatUserByUserid: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil detail pengguna PPAT/PPATS",
		})
		return
	}
	if u == nil {
		adminJSON(w, http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "Pengguna PPAT/PPATS tidak ditemukan",
		})
		return
	}

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    ppatUserToMap(u),
	})
}

// GetPpatChartData handles GET /api/admin/notification-warehouse/ppat-chart-data.
func (h *AdminNotificationWarehouseHandler) GetPpatChartData(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	tahun, _ := strconv.Atoi(r.URL.Query().Get("tahun"))
	if tahun < 2000 || tahun > 2100 {
		tahun = time.Now().Year()
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	data, totalBphtb, totalTransaksi, err := h.booker.PpatChartData(ctx, tahun)
	if err != nil {
		log.Printf("[ADMIN] PpatChartData: %v", err)
		data = emptyChartMonths(tahun)
		totalBphtb = 0
		totalTransaksi = 0
	}

	monthlyMaps := make([]map[string]interface{}, 0, len(data))
	for _, m := range data {
		monthlyMaps = append(monthlyMaps, map[string]interface{}{
			"month":             m.Month,
			"monthName":         m.MonthName,
			"jumlah_transaksi":  m.JumlahTransaksi,
			"total_bphtb":       m.TotalBphtb,
		})
	}

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    monthlyMaps,
		"tahun":   tahun,
		"summary": map[string]interface{}{
			"total_transaksi":      totalTransaksi,
			"total_bphtb":          totalBphtb,
			"total_bphtb_formatted": "Rp " + formatNumberID(int64(totalBphtb)),
		},
	})
}

func emptyChartMonths(tahun int) []repository.PpatChartMonth {
	return repository.EmptyChartData(tahun)
}

func formatNumberID(n int64) string {
	s := strconv.FormatInt(n, 10)
	if n < 0 {
		s = s[1:]
	}
	var out []rune
	for i, c := range s {
		if i > 0 && (len(s)-i)%3 == 0 {
			out = append(out, '.')
		}
		out = append(out, c)
	}
	result := string(out)
	if n < 0 {
		return "-" + result
	}
	return result
}

// GetPpatRenewal handles GET /api/admin/notification-warehouse/ppat-renewal.
func (h *AdminNotificationWarehouseHandler) GetPpatRenewal(w http.ResponseWriter, r *http.Request) {
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
		limit = 10
	}
	search := strings.TrimSpace(r.URL.Query().Get("search"))
	tahun, _ := strconv.Atoi(r.URL.Query().Get("tahun"))
	if tahun < 2000 || tahun > 2100 {
		tahun = time.Now().Year()
	}
	jangkaWaktu := r.URL.Query().Get("jangka_waktu")
	if jangkaWaktu != "6" && jangkaWaktu != "12" {
		jangkaWaktu = "6"
	}

	startDate := time.Date(tahun, 1, 1, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(tahun, 12, 31, 23, 59, 59, 0, time.UTC)
	if jangkaWaktu == "6" && tahun == time.Now().Year() {
		now := time.Now()
		startDate = time.Date(tahun, now.Month()-5, 1, 0, 0, 0, 0, time.UTC)
		if now.Month() <= 5 {
			startDate = time.Date(tahun, 1, 1, 0, 0, 0, 0, time.UTC)
		}
	} else if jangkaWaktu == "6" {
		startDate = time.Date(tahun, 7, 1, 0, 0, 0, 0, time.UTC)
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	res, err := h.booker.ListPpatRenewal(ctx, page, limit, search, tahun, jangkaWaktu, startDate, endDate)
	if err != nil {
		log.Printf("[ADMIN] ListPpatRenewal: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil data pemutakhiran PPAT",
		})
		return
	}

	formatted := make([]map[string]interface{}, 0, len(res.Rows))
	for _, row := range res.Rows {
		formatted = append(formatted, map[string]interface{}{
			"userid":          row.Userid,
			"user_nama":       row.UserNama,
			"divisi":          row.Divisi,
			"ppat_khusus":     row.PpatKhusus,
			"special_field":   row.SpecialField,
			"total_nilai_bphtb": row.TotalNilaiBphtb,
			"total_booking":   row.TotalBooking,
			"nilai_formatted": "Rp " + formatNumberID(int64(row.TotalNilaiBphtb)),
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
			"totalPages": totalPages,
		},
		"summary": map[string]interface{}{
			"total_bphtb":          res.SumBphtb,
			"total_bphtb_formatted": "Rp " + formatNumberID(int64(res.SumBphtb)),
			"jangka_waktu":         jangkaWaktu,
			"tahun":                tahun,
			"date_range": map[string]interface{}{
				"start": startDate.Format(time.RFC3339),
				"end":   endDate.Format(time.RFC3339),
			},
		},
		"search": search,
	})
}

// GetDiserahkan handles GET /api/admin/ppat/user/{userid}/diserahkan.
func (h *AdminNotificationWarehouseHandler) GetDiserahkan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	userid := strings.TrimSpace(r.PathValue("userid"))
	if userid == "" {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "userid wajib",
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	user, rows, totalBooking, totalNilai, err := h.booker.GetDiserahkan(ctx, userid)
	if err != nil {
		if err == pgx.ErrNoRows {
			adminJSON(w, http.StatusNotFound, map[string]interface{}{
				"success": false,
				"message": "User tidak ditemukan",
			})
			return
		}
		log.Printf("[ADMIN] GetDiserahkan: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil data",
		})
		return
	}
	if user == nil {
		adminJSON(w, http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "User tidak ditemukan",
		})
		return
	}

	userMap := map[string]interface{}{
		"id":            user.ID,
		"userid":        user.Userid,
		"nama":          user.Nama,
		"divisi":        user.Divisi,
		"ppat_khusus":   user.PpatKhusus,
		"special_field": user.SpecialField,
		"pejabat_umum":  user.PejabatUmum,
		"fotoprofil":    user.Fotoprofil,
	}

	rowsMap := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		rowsMap = append(rowsMap, map[string]interface{}{
			"nobooking":               row.Nobooking,
			"tanggal":                 row.Tanggal,
			"noppbb":                  row.Noppbb,
			"jenis_wajib_pajak":       row.JenisWajibPajak,
			"bphtb_yangtelah_dibayar": row.BphtbYangtelahDibayar,
			"namawajibpajak":          row.Namawajibpajak,
		})
	}

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"user":    userMap,
		"rows":    rowsMap,
		"summary": map[string]interface{}{
			"total_booking": totalBooking,
			"total_nilai":   totalNilai,
		},
	})
}
