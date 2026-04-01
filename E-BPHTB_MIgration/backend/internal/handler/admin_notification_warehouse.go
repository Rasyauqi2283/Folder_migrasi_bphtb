package handler

import (
	"context"
	"encoding/json"
	"errors"
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

// GetPpatLtb handles GET /api/admin/notification-warehouse/ppat-ltb.
// Legacy behavior: list LTB rows where trackstatus='Diolah' and status='Diterima', joined with booking + user.
func (h *AdminNotificationWarehouseHandler) GetPpatLtb(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		adminJSON(w, http.StatusServiceUnavailable, map[string]interface{}{
			"success": false,
			"message": "Database tidak tersedia",
		})
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
	offset := (page - 1) * limit

	ctx, cancel := context.WithTimeout(r.Context(), 12*time.Second)
	defer cancel()

	where := `
		WHERE t.trackstatus = 'Diolah' AND t.status = 'Diterima'
	`
	args := []interface{}{}
	idx := 1
	if search != "" {
		where += ` AND (
			t.no_registrasi ILIKE $` + strconv.Itoa(idx) + ` OR
			t.nobooking ILIKE $` + strconv.Itoa(idx) + ` OR
			vu.userid ILIKE $` + strconv.Itoa(idx) + ` OR
			vu.nama ILIKE $` + strconv.Itoa(idx) + ` OR
			b.noppbb ILIKE $` + strconv.Itoa(idx) + ` OR
			b.jenis_wajib_pajak ILIKE $` + strconv.Itoa(idx) + `
		)`
		args = append(args, "%"+search+"%")
		idx++
	}
	// limit/offset
	args = append(args, limit, offset)
	limitParam := idx
	offsetParam := idx + 1

	q := `
		SELECT DISTINCT ON (t.no_registrasi)
			t.no_registrasi,
			t.nobooking,
			t.updated_at,
			vu.special_field,
			vu.ppat_khusus,
			b.noppbb,
			b.jenis_wajib_pajak,
			vu.userid,
			vu.nama as ppat_nama,
			vu.divisi as ppat_divisi,
			t.status as ltb_status,
			t.trackstatus as ltb_trackstatus
		FROM ltb_1_terima_berkas_sspd t
		LEFT JOIN pat_1_bookingsspd b ON t.nobooking = b.nobooking
		LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
	` + where + `
		ORDER BY t.no_registrasi ASC, t.updated_at DESC
		LIMIT $` + strconv.Itoa(limitParam) + ` OFFSET $` + strconv.Itoa(offsetParam) + `
	`

	rows, err := h.repo.Pool().Query(ctx, q, args...)
	if err != nil {
		log.Printf("[ADMIN] ppat-ltb query: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil data notifikasi PPAT → LTB",
		})
		return
	}
	defer rows.Close()

	type rowT struct {
		noReg        string
		nobooking    string
		updatedAt    interface{}
		specialField *string
		ppatKhusus   *string
		noppbb       *string
		jenisWp      *string
		userid       *string
		ppatNama     *string
		ppatDivisi   *string
		ltbStatus    *string
		ltbTrack     *string
	}
	var out []map[string]interface{}
	for rows.Next() {
		var rr rowT
		if err := rows.Scan(&rr.noReg, &rr.nobooking, &rr.updatedAt, &rr.specialField, &rr.ppatKhusus, &rr.noppbb, &rr.jenisWp, &rr.userid, &rr.ppatNama, &rr.ppatDivisi, &rr.ltbStatus, &rr.ltbTrack); err != nil {
			continue
		}
		out = append(out, map[string]interface{}{
			"no_registrasi":     rr.noReg,
			"nobooking":         rr.nobooking,
			"userid":            valPtr(rr.userid),
			"ppat_nama":         valPtr(rr.ppatNama),
			"ppat_divisi":       valPtr(rr.ppatDivisi),
			"ppat_khusus":       valPtr(rr.ppatKhusus),
			"special_field":     valPtrOr(rr.specialField, "-"),
			"jenis_wajib_pajak": valPtr(rr.jenisWp),
			"noppbb":            valPtr(rr.noppbb),
			"ltb_status":        valPtr(rr.ltbStatus),
			"ltb_trackstatus":   valPtr(rr.ltbTrack),
			"updated_at":        rr.updatedAt,
		})
	}

	// total
	countArgs := []interface{}{}
	countIdx := 1
	countWhere := `WHERE t.trackstatus = 'Diolah' AND t.status = 'Diterima'`
	if search != "" {
		countWhere += ` AND (
			t.no_registrasi ILIKE $` + strconv.Itoa(countIdx) + ` OR
			t.nobooking ILIKE $` + strconv.Itoa(countIdx) + ` OR
			vu.userid ILIKE $` + strconv.Itoa(countIdx) + ` OR
			vu.nama ILIKE $` + strconv.Itoa(countIdx) + ` OR
			b.noppbb ILIKE $` + strconv.Itoa(countIdx) + ` OR
			b.jenis_wajib_pajak ILIKE $` + strconv.Itoa(countIdx) + `
		)`
		countArgs = append(countArgs, "%"+search+"%")
	}
	var total int
	err = h.repo.Pool().QueryRow(ctx, `
		SELECT COUNT(DISTINCT t.no_registrasi)::int AS total
		FROM ltb_1_terima_berkas_sspd t
		LEFT JOIN pat_1_bookingsspd b ON t.nobooking = b.nobooking
		LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
		`+countWhere, countArgs...).Scan(&total)
	if err != nil {
		total = 0
	}

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    out,
		"pagination": map[string]interface{}{
			"page":  page,
			"limit": limit,
			"total": total,
			"totalPages": func() int {
				if limit <= 0 {
					return 1
				}
				return (total + limit - 1) / limit
			}(),
		},
		"search": search,
	})
}

// GetPpatLtbDetail handles GET /api/admin/notification-warehouse/ppat-ltb/{bookingId}.
func (h *AdminNotificationWarehouseHandler) GetPpatLtbDetail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		adminJSON(w, http.StatusServiceUnavailable, map[string]interface{}{
			"success": false,
			"message": "Database tidak tersedia",
		})
		return
	}
	bookingId := strings.TrimSpace(r.PathValue("bookingId"))
	if bookingId == "" {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "bookingId wajib",
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 12*time.Second)
	defer cancel()

	// NOTE: legacy uses :bookingId; it is used as t.nobooking or t.no_registrasi depending on caller.
	// We'll accept either.
	var noReg, nobooking string
	var updatedAt interface{}
	var specialField, ppatKhusus, noppbb, jenisWp, userid, ppatNama, ppatDivisi, ltbStatus, ltbTrack, ltbPengirim, ltbCatatan *string

	err := h.repo.Pool().QueryRow(ctx, `
		SELECT
			t.no_registrasi,
			t.nobooking,
			t.updated_at,
			vu.special_field,
			vu.ppat_khusus,
			b.noppbb,
			b.jenis_wajib_pajak,
			vu.userid,
			vu.nama as ppat_nama,
			vu.divisi as ppat_divisi,
			t.status as ltb_status,
			t.trackstatus as ltb_trackstatus,
			t.pengirim as ltb_pengirim,
			t.catatan as ltb_catatan
		FROM ltb_1_terima_berkas_sspd t
		LEFT JOIN pat_1_bookingsspd b ON t.nobooking = b.nobooking
		LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
		WHERE (t.nobooking = $1 OR t.no_registrasi = $1)
		ORDER BY t.updated_at DESC
		LIMIT 1
	`, bookingId).Scan(
		&noReg, &nobooking, &updatedAt, &specialField, &ppatKhusus, &noppbb, &jenisWp,
		&userid, &ppatNama, &ppatDivisi, &ltbStatus, &ltbTrack, &ltbPengirim, &ltbCatatan,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		adminJSON(w, http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "Notifikasi tidak ditemukan",
		})
		return
	}
	if err != nil {
		log.Printf("[ADMIN] ppat-ltb detail query: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil detail notifikasi",
		})
		return
	}

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"no_registrasi":     noReg,
			"nobooking":         nobooking,
			"userid":            valPtr(userid),
			"ppat_nama":         valPtr(ppatNama),
			"ppat_divisi":       valPtr(ppatDivisi),
			"ppat_khusus":       valPtr(ppatKhusus),
			"special_field":     valPtrOr(specialField, "-"),
			"jenis_wajib_pajak": valPtr(jenisWp),
			"noppbb":            valPtr(noppbb),
			"ltb_status":        valPtr(ltbStatus),
			"ltb_trackstatus":   valPtr(ltbTrack),
			"ltb_pengirim":      valPtr(ltbPengirim),
			"ltb_catatan":       valPtr(ltbCatatan),
			"updated_at":        updatedAt,
		},
	})
}

// GetPenelitiLsb handles GET /api/admin/notification-warehouse/peneliti-lsb.
func (h *AdminNotificationWarehouseHandler) GetPenelitiLsb(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		adminJSON(w, http.StatusServiceUnavailable, map[string]interface{}{
			"success": false,
			"message": "Database tidak tersedia",
		})
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
	offset := (page - 1) * limit

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	where := `WHERE pv1.status IS NOT NULL`
	args := []interface{}{}
	idx := 1
	if search != "" {
		where += ` AND (
			pv1.no_registrasi ILIKE $` + strconv.Itoa(idx) + ` OR
			pv1.nobooking ILIKE $` + strconv.Itoa(idx) + ` OR
			vu.userid ILIKE $` + strconv.Itoa(idx) + ` OR
			vu.nama ILIKE $` + strconv.Itoa(idx) + ` OR
			b.noppbb ILIKE $` + strconv.Itoa(idx) + ` OR
			b.jenis_wajib_pajak ILIKE $` + strconv.Itoa(idx) + `
		)`
		args = append(args, "%"+search+"%")
		idx++
	}
	args = append(args, limit, offset)
	limitParam := idx
	offsetParam := idx + 1

	q := `
		SELECT DISTINCT ON (pv1.nobooking)
			pv1.nobooking,
			pv1.no_registrasi,
			vu.special_field,
			vu.ppat_khusus,
			b.noppbb,
			b.jenis_wajib_pajak,
			vu.userid,
			vu.nama as ppat_nama,
			vu.divisi as ppat_divisi,
			pv1.status as p_verifikasi_status,
			pv1.trackstatus as p_verifikasi_trackstatus,
			pv1.pemberi_persetujuan as p_verifikasi_pemberi,
			COALESCE(pv1.updated_at, pv1.created_at) as p_verifikasi_updated,
			p3.status as p_clear_status,
			p3.trackstatus as p_clear_trackstatus,
			p3.pemverifikasi as p_clear_pemverifikasi,
			p3.updated_at as p_clear_updated,
			pv1_val.status as pv_validasi_status,
			pv1_val.trackstatus as pv_validasi_trackstatus,
			pv1_val.pemverifikasi as pv_validasi_pemverifikasi,
			pv1_val.pemparaf as pv_validasi_pemparaf,
			pv1_val.updated_at as pv_validasi_updated
		FROM p_1_verifikasi pv1
		LEFT JOIN pat_1_bookingsspd b ON pv1.nobooking = b.nobooking
		LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
		LEFT JOIN p_3_clear_to_paraf p3 ON pv1.nobooking = p3.nobooking
		LEFT JOIN pv_1_paraf_validate pv1_val ON pv1.nobooking = pv1_val.nobooking
	` + where + `
		ORDER BY pv1.nobooking ASC, COALESCE(pv1.updated_at, pv1.created_at) DESC
		LIMIT $` + strconv.Itoa(limitParam) + ` OFFSET $` + strconv.Itoa(offsetParam) + `
	`

	rows, err := h.repo.Pool().Query(ctx, q, args...)
	if err != nil {
		log.Printf("[ADMIN] peneliti-lsb query: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil data notifikasi Peneliti → LSB",
		})
		return
	}
	defer rows.Close()

	var out []map[string]interface{}
	for rows.Next() {
		var nobooking, noReg string
		var specialField, ppatKhusus, noppbb, jenisWp, userid, ppatNama, ppatDivisi interface{}
		var pStatus, pTrack, pPemberi, pUpdated interface{}
		var cStatus, cTrack, cPemv, cUpdated interface{}
		var vStatus, vTrack, vPemv, vPemparaf, vUpdated interface{}
		if err := rows.Scan(
			&nobooking, &noReg, &specialField, &ppatKhusus, &noppbb, &jenisWp, &userid, &ppatNama, &ppatDivisi,
			&pStatus, &pTrack, &pPemberi, &pUpdated,
			&cStatus, &cTrack, &cPemv, &cUpdated,
			&vStatus, &vTrack, &vPemv, &vPemparaf, &vUpdated,
		); err != nil {
			continue
		}
		out = append(out, map[string]interface{}{
			"no_registrasi":             noReg,
			"nobooking":                 nobooking,
			"userid":                    userid,
			"ppat_nama":                 ppatNama,
			"ppat_divisi":               ppatDivisi,
			"ppat_khusus":               ppatKhusus,
			"jenis_wajib_pajak":         jenisWp,
			"noppbb":                    noppbb,
			"p_verifikasi_status":       pStatus,
			"p_verifikasi_trackstatus":  pTrack,
			"p_verifikasi_pemberi":      pPemberi,
			"p_verifikasi_updated":      pUpdated,
			"p_clear_status":            cStatus,
			"p_clear_trackstatus":       cTrack,
			"p_clear_pemverifikasi":     cPemv,
			"p_clear_updated":           cUpdated,
			"pv_validasi_status":        vStatus,
			"pv_validasi_trackstatus":   vTrack,
			"pv_validasi_pemverifikasi": vPemv,
			"pv_validasi_pemparaf":      vPemparaf,
			"pv_validasi_updated":       vUpdated,
			"special_field":             specialField,
		})
	}

	// total
	countWhere := `WHERE pv1.status IS NOT NULL`
	countArgs := []interface{}{}
	if search != "" {
		countWhere += ` AND (
			pv1.no_registrasi ILIKE $1 OR
			pv1.nobooking ILIKE $1 OR
			vu.userid ILIKE $1 OR
			vu.nama ILIKE $1 OR
			b.noppbb ILIKE $1 OR
			b.jenis_wajib_pajak ILIKE $1
		)`
		countArgs = append(countArgs, "%"+search+"%")
	}
	var total int
	_ = h.repo.Pool().QueryRow(ctx, `
		SELECT COUNT(DISTINCT pv1.nobooking)::int AS total
		FROM p_1_verifikasi pv1
		LEFT JOIN pat_1_bookingsspd b ON pv1.nobooking = b.nobooking
		LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
		LEFT JOIN p_3_clear_to_paraf p3 ON pv1.nobooking = p3.nobooking
		LEFT JOIN pv_1_paraf_validate pv1_val ON pv1.nobooking = pv1_val.nobooking
		`+countWhere, countArgs...).Scan(&total)

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    out,
		"pagination": map[string]interface{}{
			"page":  page,
			"limit": limit,
			"total": total,
			"totalPages": func() int {
				if limit <= 0 {
					return 1
				}
				return (total + limit - 1) / limit
			}(),
		},
		"search": search,
	})
}

// GetLsbPpat handles GET /api/admin/notification-warehouse/lsb-ppat.
func (h *AdminNotificationWarehouseHandler) GetLsbPpat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		adminJSON(w, http.StatusServiceUnavailable, map[string]interface{}{
			"success": false,
			"message": "Database tidak tersedia",
		})
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
	offset := (page - 1) * limit

	ctx, cancel := context.WithTimeout(r.Context(), 12*time.Second)
	defer cancel()

	where := `WHERE lsb.status = 'Terselesaikan'`
	args := []interface{}{}
	idx := 1
	if search != "" {
		where += ` AND (
			lsb.no_registrasi ILIKE $` + strconv.Itoa(idx) + ` OR
			lsb.nobooking ILIKE $` + strconv.Itoa(idx) + ` OR
			vu.userid ILIKE $` + strconv.Itoa(idx) + ` OR
			vu.nama ILIKE $` + strconv.Itoa(idx) + ` OR
			b.noppbb ILIKE $` + strconv.Itoa(idx) + ` OR
			b.jenis_wajib_pajak ILIKE $` + strconv.Itoa(idx) + `
		)`
		args = append(args, "%"+search+"%")
		idx++
	}
	args = append(args, limit, offset)
	limitParam := idx
	offsetParam := idx + 1

	q := `
		SELECT DISTINCT ON (lsb.no_registrasi)
			lsb.no_registrasi,
			lsb.nobooking,
			lsb.updated_at,
			vu.special_field,
			vu.ppat_khusus,
			b.noppbb,
			b.jenis_wajib_pajak,
			vu.userid,
			vu.nama as ppat_nama,
			vu.divisi as ppat_divisi,
			lsb.status as lsb_status,
			lsb.trackstatus as lsb_trackstatus
		FROM lsb_1_serah_berkas lsb
		LEFT JOIN pat_1_bookingsspd b ON lsb.nobooking = b.nobooking
		LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
	` + where + `
		ORDER BY lsb.no_registrasi ASC, lsb.updated_at DESC
		LIMIT $` + strconv.Itoa(limitParam) + ` OFFSET $` + strconv.Itoa(offsetParam) + `
	`

	rows, err := h.repo.Pool().Query(ctx, q, args...)
	if err != nil {
		log.Printf("[ADMIN] lsb-ppat query: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil data notifikasi LSB → PPAT",
		})
		return
	}
	defer rows.Close()

	var out []map[string]interface{}
	for rows.Next() {
		var noReg, nobooking string
		var updatedAt interface{}
		var specialField, ppatKhusus, noppbb, jenisWp, userid, ppatNama, ppatDivisi, lsbStatus, lsbTrack interface{}
		if err := rows.Scan(&noReg, &nobooking, &updatedAt, &specialField, &ppatKhusus, &noppbb, &jenisWp, &userid, &ppatNama, &ppatDivisi, &lsbStatus, &lsbTrack); err != nil {
			continue
		}
		out = append(out, map[string]interface{}{
			"no_registrasi":     noReg,
			"nobooking":         nobooking,
			"userid":            userid,
			"ppat_nama":         ppatNama,
			"ppat_divisi":       ppatDivisi,
			"ppat_khusus":       ppatKhusus,
			"jenis_wajib_pajak": jenisWp,
			"noppbb":            noppbb,
			"lsb_status":        lsbStatus,
			"lsb_trackstatus":   lsbTrack,
			"updated_at":        updatedAt,
			"special_field":     specialField,
		})
	}

	// total
	countWhere := `WHERE lsb.status = 'Terselesaikan'`
	countArgs := []interface{}{}
	if search != "" {
		countWhere += ` AND (
			lsb.no_registrasi ILIKE $1 OR
			lsb.nobooking ILIKE $1 OR
			vu.userid ILIKE $1 OR
			vu.nama ILIKE $1 OR
			b.noppbb ILIKE $1 OR
			b.jenis_wajib_pajak ILIKE $1
		)`
		countArgs = append(countArgs, "%"+search+"%")
	}
	var total int
	_ = h.repo.Pool().QueryRow(ctx, `
		SELECT COUNT(DISTINCT lsb.no_registrasi)::int AS total
		FROM lsb_1_serah_berkas lsb
		LEFT JOIN pat_1_bookingsspd b ON lsb.nobooking = b.nobooking
		LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
		`+countWhere, countArgs...).Scan(&total)

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    out,
		"pagination": map[string]interface{}{
			"page":  page,
			"limit": limit,
			"total": total,
			"totalPages": func() int {
				if limit <= 0 {
					return 1
				}
				return (total + limit - 1) / limit
			}(),
		},
		"search": search,
	})
}

// GetStats handles GET /api/admin/notification-warehouse/stats.
func (h *AdminNotificationWarehouseHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		adminJSON(w, http.StatusServiceUnavailable, map[string]interface{}{
			"success": false,
			"message": "Database tidak tersedia",
		})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	type qDef struct {
		key string
		sql string
	}
	qs := []qDef{
		{
			key: "ppat_ltb",
			sql: `
				SELECT COUNT(*)::int as count
				FROM pat_1_bookingsspd b
				JOIN a_2_verified_users u ON b.userid = u.userid
				LEFT JOIN ltb_1_terima_berkas_sspd ltb ON b.nobooking = ltb.nobooking
				WHERE ltb.trackstatus = 'Diolah'
			`,
		},
		{
			key: "ltb_lsb",
			sql: `
				SELECT COUNT(*)::int as count
				FROM pat_1_bookingsspd b
				JOIN a_2_verified_users u ON b.userid = u.userid
				LEFT JOIN ltb_1_terima_berkas_sspd ltb ON b.nobooking = ltb.nobooking
				WHERE ltb.trackstatus = 'Diterima' AND ltb.status = 'Dilanjutkan'
			`,
		},
		{
			key: "lsb_ppat",
			sql: `
				SELECT COUNT(*)::int as count
				FROM pat_1_bookingsspd b
				JOIN a_2_verified_users u ON b.userid = u.userid
				LEFT JOIN lsb_1_serah_berkas lsb ON b.nobooking = lsb.nobooking
				WHERE lsb.status = 'Terselesaikan'
			`,
		},
	}
	stats := map[string]int{}
	for _, q := range qs {
		var c int
		if err := h.repo.Pool().QueryRow(ctx, q.sql).Scan(&c); err != nil {
			c = 0
		}
		stats[q.key] = c
	}
	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    stats,
	})
}

type sendPingReq struct {
	Nobooking       string   `json:"nobooking"`
	NoRegistrasi    string   `json:"no_registrasi"`
	TargetDivisions []string `json:"target_divisions"`
}

// SendPing handles POST /api/admin/notification-warehouse/send-ping.
func (h *AdminNotificationWarehouseHandler) SendPing(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	var req sendPingReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Body tidak valid",
		})
		return
	}
	req.Nobooking = strings.TrimSpace(req.Nobooking)
	req.NoRegistrasi = strings.TrimSpace(req.NoRegistrasi)
	if req.Nobooking == "" || req.NoRegistrasi == "" || len(req.TargetDivisions) == 0 {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Data tidak lengkap. Diperlukan: nobooking, no_registrasi, target_divisions",
		})
		return
	}

	valid := map[string]bool{"ltb": true, "bank": true, "peneliti": true, "lsb": true}
	for _, d := range req.TargetDivisions {
		if !valid[strings.ToLower(strings.TrimSpace(d))] {
			adminJSON(w, http.StatusBadRequest, map[string]interface{}{
				"success": false,
				"message": "Divisi tidak valid",
			})
			return
		}
	}

	sentBy := adminUseridFromCookie(r)
	now := time.Now().UTC().Format(time.RFC3339)

	// Best-effort insert into ping_notifications; if table doesn't exist, continue.
	if h.repo != nil && h.repo.Pool() != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()
		_, err := h.repo.Pool().Exec(ctx, `
			INSERT INTO ping_notifications (nobooking, no_registrasi, target_divisions, created_at, status)
			VALUES ($1, $2, $3, NOW(), 'sent')
		`, req.Nobooking, req.NoRegistrasi, string(mustJSON(req.TargetDivisions)))
		if err != nil {
			// Ignore missing table error
			log.Printf("[PING] insert warning: %v", err)
		}
	}

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Ping berhasil dikirim",
		"data": map[string]interface{}{
			"nobooking":        req.Nobooking,
			"no_registrasi":    req.NoRegistrasi,
			"target_divisions": req.TargetDivisions,
			"sent_at":          now,
			"sent_by":          sentBy,
		},
	})
}

// PollPing handles GET /api/admin/notification-warehouse/poll-ping.
// Legacy behavior: no auth required; returns empty list if table missing.
func (h *AdminNotificationWarehouseHandler) PollPing(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	division := strings.TrimSpace(r.URL.Query().Get("division"))
	lastCheck := strings.TrimSpace(r.URL.Query().Get("last_check"))
	if division == "" {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Division parameter required",
		})
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		adminJSON(w, http.StatusOK, map[string]interface{}{
			"success":       true,
			"notifications": []interface{}{},
			"count":         0,
			"last_check":    time.Now().UTC().Format(time.RFC3339),
			"message":       "Database tidak tersedia",
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	q := `
		SELECT id, nobooking, no_registrasi, target_divisions, created_at, status
		FROM ping_notifications
		WHERE target_divisions::text ILIKE $1
	`
	args := []interface{}{"%" + division + "%"}
	if lastCheck != "" {
		q += ` AND created_at > $2`
		args = append(args, lastCheck)
	}
	q += ` ORDER BY created_at DESC LIMIT 10`

	rows, err := h.repo.Pool().Query(ctx, q, args...)
	if err != nil {
		log.Printf("[POLL-PING] query warning: %v", err)
		adminJSON(w, http.StatusOK, map[string]interface{}{
			"success":       true,
			"notifications": []interface{}{},
			"count":         0,
			"last_check":    time.Now().UTC().Format(time.RFC3339),
			"message":       "Database table not available, using fallback",
		})
		return
	}
	defer rows.Close()

	type nRow struct {
		id        int
		nobooking string
		noReg     string
		createdAt interface{}
		status    *string
	}
	var notifs []map[string]interface{}
	for rows.Next() {
		var id int
		var nob, nr string
		var td interface{}
		var created interface{}
		var st *string
		if err := rows.Scan(&id, &nob, &nr, &td, &created, &st); err != nil {
			continue
		}
		notifs = append(notifs, map[string]interface{}{
			"ping_id":       id,
			"nobooking":     nob,
			"no_registrasi": nr,
			"division":      division,
			"message":       "Ping dari Admin untuk No. Booking: " + nob,
			"timestamp":     created,
			"status":        valPtr(st),
		})
	}

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success":       true,
		"notifications": notifs,
		"count":         len(notifs),
		"last_check":    time.Now().UTC().Format(time.RFC3339),
	})
}

// GetPpatUsersStats handles GET /api/admin/notification-warehouse/ppat-users-stats.
// Mirrors legacy Node endpoint used by Admin dashboard cards.
func (h *AdminNotificationWarehouseHandler) GetPpatUsersStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		adminJSON(w, http.StatusServiceUnavailable, map[string]interface{}{
			"success": false,
			"message": "Database tidak tersedia",
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// by_status
	statusStats := map[string]int{}
	rows, err := h.repo.Pool().Query(ctx, `
		SELECT COALESCE(status_ppat,'') AS status_ppat, COUNT(*)::int AS count
		FROM a_2_verified_users
		WHERE divisi IN ('PPAT','PPATS')
		GROUP BY status_ppat
	`)
	if err != nil {
		log.Printf("[ADMIN] ppat-users-stats status query: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil statistik PPAT/PPATS",
		})
		return
	}
	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err == nil {
			statusStats[status] = count
		}
	}
	rows.Close()

	// by_divisi
	divisiStats := map[string]int{}
	rows2, err := h.repo.Pool().Query(ctx, `
		SELECT divisi, COUNT(*)::int AS count
		FROM a_2_verified_users
		WHERE divisi IN ('PPAT','PPATS')
		GROUP BY divisi
	`)
	if err != nil {
		log.Printf("[ADMIN] ppat-users-stats divisi query: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil statistik PPAT/PPATS",
		})
		return
	}
	for rows2.Next() {
		var divisi string
		var count int
		if err := rows2.Scan(&divisi, &count); err == nil {
			divisiStats[divisi] = count
		}
	}
	rows2.Close()

	// total
	var total int
	if err := h.repo.Pool().QueryRow(ctx, `
		SELECT COUNT(*)::int AS total
		FROM a_2_verified_users
		WHERE divisi IN ('PPAT','PPATS')
	`).Scan(&total); err != nil {
		log.Printf("[ADMIN] ppat-users-stats total query: %v", err)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Gagal mengambil statistik PPAT/PPATS",
		})
		return
	}

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"total":     total,
			"by_status": statusStats,
			"by_divisi": divisiStats,
		},
	})
}

func mustJSON(v interface{}) []byte {
	b, _ := json.Marshal(v)
	return b
}

func valPtr(p *string) interface{} {
	if p == nil {
		return nil
	}
	return *p
}

func valPtrOr(p *string, fallback string) interface{} {
	if p == nil || strings.TrimSpace(*p) == "" {
		return fallback
	}
	return *p
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
		"success": true,
		"data":    formatted,
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
			"month":            m.Month,
			"monthName":        m.MonthName,
			"jumlah_transaksi": m.JumlahTransaksi,
			"total_bphtb":      m.TotalBphtb,
		})
	}

	adminJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    monthlyMaps,
		"tahun":   tahun,
		"summary": map[string]interface{}{
			"total_transaksi":       totalTransaksi,
			"total_bphtb":           totalBphtb,
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
			"nobooking":         row.Nobooking,
			"no_registrasi":     row.NoRegistrasi,
			"userid":            row.Userid,
			"user_nama":         row.UserNama,
			"divisi":            row.Divisi,
			"ppat_khusus":       row.PpatKhusus,
			"special_field":     row.SpecialField,
			"total_nilai_bphtb": row.TotalNilaiBphtb,
			"payment_status":    row.PaymentStatus,
			"status_verifikasi": row.StatusVerifikasi,
			"status_dibank":     row.StatusDibank,
			"paid_at":           row.PaidAt,
			"nilai_formatted":   "Rp " + formatNumberID(int64(row.TotalNilaiBphtb)),
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
			"total_bphtb":           res.SumBphtb,
			"total_bphtb_formatted": "Rp " + formatNumberID(int64(res.SumBphtb)),
			"jangka_waktu":          jangkaWaktu,
			"tahun":                 tahun,
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
