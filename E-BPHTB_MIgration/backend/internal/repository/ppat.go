package repository

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// PpatRepo handles PPAT-specific booking operations (pat_1_bookingsspd, pat_2_bphtb_perhitungan, etc.).
type PpatRepo struct {
	pool *pgxpool.Pool
}

// NewPpatRepo creates a PpatRepo.
func NewPpatRepo(pool *pgxpool.Pool) *PpatRepo {
	return &PpatRepo{pool: pool}
}

// Pool returns the underlying pool.
func (r *PpatRepo) Pool() *pgxpool.Pool { return r.pool }

// LoadAllBookingRow represents one row for load-all-booking response.
type LoadAllBookingRow struct {
	Nobooking             string     `json:"nobooking"`
	Noppbb                *string    `json:"noppbb"`
	Namawajibpajak        *string    `json:"namawajibpajak"`
	Namapemilikobjekpajak *string    `json:"namapemilikobjekpajak"`
	Npwpwp                *string    `json:"npwpwp"`
	Tahunajb              *string    `json:"tahunajb"`
	Trackstatus           *string    `json:"trackstatus"`
	JenisWajibPajak       *string    `json:"jenis_wajib_pajak"`
	CreatedAt             *time.Time `json:"created_at"`
	UpdatedAt             *time.Time `json:"updated_at"`
	AktaTanahPath         *string    `json:"akta_tanah_path"`
	SertifikatTanahPath   *string    `json:"sertifikat_tanah_path"`
	PelengkapPath         *string    `json:"pelengkap_path"`
	PdfDokumenPath        *string    `json:"pdf_dokumen_path"`
	FileWithstempelPath   *string    `json:"file_withstempel_path"`
}

// PendingCorrectionRow represents one correction item for PU (PPAT/PPATS/Notaris).
type PendingCorrectionRow struct {
	Nobooking        string  `json:"nobooking"`
	NoRegistrasi     *string `json:"no_registrasi"`
	StpdCode         *string `json:"stpd_code"`
	CatatanPeneliti  *string `json:"catatan_peneliti"`
	CatatanPu        *string `json:"catatan_pu"`
	BuktiPelunasanPath *string `json:"bukti_pelunasan_path"`
	CorrectionUpdatedAt *time.Time `json:"correction_updated_at"`
}

// ListPendingCorrections returns correction items with verification_state = 'PENDING_CORRECTION'
// for bookings owned by userid. Does not create new rows.
func (r *PpatRepo) ListPendingCorrections(ctx context.Context, userid string, limit int) ([]PendingCorrectionRow, error) {
	if r.pool == nil {
		return []PendingCorrectionRow{}, nil
	}
	if limit < 1 {
		limit = 50
	}
	if limit > 200 {
		limit = 200
	}
	var hasStpdCode bool
	if err := r.pool.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.columns
			WHERE table_schema = 'public'
			  AND table_name = 'p_1_verifikasi'
			  AND column_name = 'stpd_code'
		)
	`).Scan(&hasStpdCode); err != nil {
		return nil, err
	}
	stpdSelect := "NULL::varchar(50)"
	if hasStpdCode {
		stpdSelect = "p.stpd_code"
	}

	q := `
		SELECT
			p.nobooking,
			p.no_registrasi,
			` + stpdSelect + `,
			p.catatan_peneliti,
			p.catatan_pu,
			p.bukti_pelunasan_path,
			p.correction_updated_at
		FROM p_1_verifikasi p
		INNER JOIN pat_1_bookingsspd b ON b.nobooking = p.nobooking
		WHERE b.userid = $1
		  AND COALESCE(p.verification_state,'') = 'PENDING_CORRECTION'
		ORDER BY p.correction_updated_at DESC NULLS LAST, p.no_registrasi ASC NULLS LAST, p.nobooking ASC
		LIMIT $2
	`
	rows, err := r.pool.Query(ctx, q, userid, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]PendingCorrectionRow, 0, 16)
	for rows.Next() {
		var row PendingCorrectionRow
		if err := rows.Scan(&row.Nobooking, &row.NoRegistrasi, &row.StpdCode, &row.CatatanPeneliti, &row.CatatanPu, &row.BuktiPelunasanPath, &row.CorrectionUpdatedAt); err != nil {
			continue
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

// UpdateCorrectionNoteAndProof updates catatan_pu and/or bukti_pelunasan_path for a correction item
// owned by userid.
func (r *PpatRepo) UpdateCorrectionNoteAndProof(ctx context.Context, userid, nobooking string, note *string, buktiPath *string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	cmd, err := r.pool.Exec(ctx, `
		UPDATE p_1_verifikasi p
		SET
			catatan_pu = COALESCE($3, catatan_pu),
			bukti_pelunasan_path = COALESCE($4, bukti_pelunasan_path),
			correction_updated_at = now()
		FROM pat_1_bookingsspd b
		WHERE p.nobooking = b.nobooking
		  AND b.userid = $1
		  AND p.nobooking = $2
		  AND COALESCE(p.verification_state,'') = 'PENDING_CORRECTION'
	`, userid, nobooking, note, buktiPath)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("data koreksi tidak ditemukan")
	}
	return nil
}

// ResubmitCorrection sends the same no_registrasi back to Peneliti queue.
// It does not create new rows (UPDATE only).
func (r *PpatRepo) ResubmitCorrection(ctx context.Context, userid, nobooking string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	cmd, err := r.pool.Exec(ctx, `
		UPDATE p_1_verifikasi p
		SET
			trackstatus = 'Dilanjutkan',
			status = 'Diajukan',
			locked_by_user_id = NULL,
			locked_by_nama = NULL,
			locked_at = NULL,
			verification_state = 'RESUBMITTED',
			correction_updated_at = now()
		FROM pat_1_bookingsspd b
		WHERE p.nobooking = b.nobooking
		  AND b.userid = $1
		  AND p.nobooking = $2
		  AND COALESCE(p.verification_state,'') = 'PENDING_CORRECTION'
	`, userid, nobooking)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("data koreksi tidak ditemukan")
	}
	return nil
}

// LoadAllBookingResult holds data and pagination for load-all-booking.
type LoadAllBookingResult struct {
	Data       []LoadAllBookingRow
	Total      int
	Page       int
	Limit      int
	Pages      int
}

// LoadAllBooking returns bookings for the given user (excludes Dihapus, Diserahkan).
func (r *PpatRepo) LoadAllBooking(ctx context.Context, userid string, page, limit int, search, status, jenisWajibPajak string) (*LoadAllBookingResult, error) {
	if r.pool == nil {
		return &LoadAllBookingResult{Data: []LoadAllBookingRow{}, Page: page, Limit: limit, Pages: 0, Total: 0}, nil
	}
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	offset := (page - 1) * limit

	where := `WHERE userid = $1 AND trackstatus != 'Dihapus' AND trackstatus != 'Diserahkan'`
	args := []interface{}{userid}
	idx := 2
	if jenisWajibPajak != "" {
		where += ` AND jenis_wajib_pajak = $` + strconv.Itoa(idx)
		args = append(args, jenisWajibPajak)
		idx++
	}
	if search != "" {
		where += ` AND (nobooking ILIKE $` + strconv.Itoa(idx) + ` OR namawajibpajak ILIKE $` + strconv.Itoa(idx) + ` OR namapemilikobjekpajak ILIKE $` + strconv.Itoa(idx) + `)`
		args = append(args, "%"+search+"%")
		idx++
	}
	if status != "" {
		where += ` AND trackstatus = $` + strconv.Itoa(idx)
		args = append(args, status)
		idx++
	}

	var total int
	err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM pat_1_bookingsspd `+where, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	args = append(args, limit, offset)
	rows, err := r.pool.Query(ctx, `
		SELECT nobooking, noppbb, namawajibpajak, namapemilikobjekpajak, npwpwp, tahunajb, trackstatus, jenis_wajib_pajak, created_at, updated_at,
			akta_tanah_path, sertifikat_tanah_path, pelengkap_path, pdf_dokumen_path, file_withstempel_path
		FROM pat_1_bookingsspd `+where+`
		ORDER BY created_at DESC
		LIMIT $`+strconv.Itoa(idx)+` OFFSET $`+strconv.Itoa(idx+1),
		args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var data []LoadAllBookingRow
	for rows.Next() {
		var row LoadAllBookingRow
		err := rows.Scan(&row.Nobooking, &row.Noppbb, &row.Namawajibpajak, &row.Namapemilikobjekpajak, &row.Npwpwp, &row.Tahunajb, &row.Trackstatus, &row.JenisWajibPajak, &row.CreatedAt, &row.UpdatedAt,
			&row.AktaTanahPath, &row.SertifikatTanahPath, &row.PelengkapPath, &row.PdfDokumenPath, &row.FileWithstempelPath)
		if err != nil {
			continue
		}
		data = append(data, row)
	}

	pages := (total + limit - 1) / limit
	if pages < 1 {
		pages = 1
	}
	return &LoadAllBookingResult{Data: data, Total: total, Page: page, Limit: limit, Pages: pages}, nil
}

// RekapDiserahkanRow holds one row for rekap/diserahkan.
type RekapDiserahkanRow struct {
	Nobooking           string   `json:"nobooking"`
	Noppbb              *string  `json:"noppbb"`
	Tanggal             *string  `json:"tanggal"`
	Tahunajb            *string  `json:"tahunajb"`
	Namawajibpajak      *string  `json:"namawajibpajak"`
	Namapemilikobjekpajak *string `json:"namapemilikobjekpajak"`
	Npwpwajibpajak      *string  `json:"npwpwajibpajak"`
	Trackstatus         *string  `json:"trackstatus"`
	TanggalFormatted    *string  `json:"tanggal_formatted"`
	BphtbYangtelahDibayar *float64 `json:"bphtb_yangtelah_dibayar"`
}

// RekapDiserahkanResult holds rows, total and totalNominal.
type RekapDiserahkanResult struct {
	Rows         []RekapDiserahkanRow
	Total        int
	TotalNominal float64
	Page         int
	Limit        int
	TotalPages   int
}

// RekapDiserahkan returns bookings with trackstatus = 'Diserahkan' (optionally filtered by userid for PPAT).
func (r *PpatRepo) RekapDiserahkan(ctx context.Context, userid string, isPPAT bool, page, limit int, search string) (*RekapDiserahkanResult, error) {
	if r.pool == nil {
		return &RekapDiserahkanResult{Rows: []RekapDiserahkanRow{}, Total: 0, TotalNominal: 0, Page: page, Limit: limit, TotalPages: 0}, nil
	}
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 100
	}
	offset := (page - 1) * limit

	where := `WHERE b.trackstatus = 'Diserahkan'`
	args := []interface{}{}
	idx := 1
	if isPPAT && userid != "" {
		where += ` AND b.userid = $` + strconv.Itoa(idx)
		args = append(args, userid)
		idx++
	}
	if search != "" {
		where += ` AND (b.nobooking ILIKE $` + strconv.Itoa(idx) + ` OR b.noppbb ILIKE $` + strconv.Itoa(idx) + ` OR b.namawajibpajak ILIKE $` + strconv.Itoa(idx) + ` OR b.namapemilikobjekpajak ILIKE $` + strconv.Itoa(idx) + ` OR b.npwpwp ILIKE $` + strconv.Itoa(idx) + ` OR vu.nama ILIKE $` + strconv.Itoa(idx) + `)`
		args = append(args, "%"+search+"%")
		idx++
	}

	var total int
	var totalNominal float64
	countQ := `
		SELECT COUNT(b.nobooking)::int, COALESCE(SUM(bp.bphtb_yangtelah_dibayar), 0)::float
		FROM pat_1_bookingsspd b
		LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
		LEFT JOIN pat_2_bphtb_perhitungan bp ON b.nobooking = bp.nobooking
		` + where
	err := r.pool.QueryRow(ctx, countQ, args...).Scan(&total, &totalNominal)
	if err != nil {
		return nil, err
	}

	args = append(args, limit, offset)
	rows, err := r.pool.Query(ctx, `
		SELECT b.nobooking, b.noppbb, b.tanggal::text, b.tahunajb, b.namawajibpajak, b.namapemilikobjekpajak, b.npwpwp as npwpwajibpajak, b.trackstatus,
			CASE WHEN lsb.updated_at IS NOT NULL THEN to_char(lsb.updated_at, 'DD/MM/YYYY') WHEN b.updated_at IS NOT NULL THEN to_char(b.updated_at, 'DD/MM/YYYY') WHEN b.created_at IS NOT NULL THEN to_char(b.created_at, 'DD/MM/YYYY') ELSE '-' END,
			bp.bphtb_yangtelah_dibayar
		FROM pat_1_bookingsspd b
		LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
		LEFT JOIN pat_2_bphtb_perhitungan bp ON b.nobooking = bp.nobooking
		LEFT JOIN lsb_1_serah_berkas lsb ON b.nobooking = lsb.nobooking
		`+where+`
		ORDER BY lsb.updated_at DESC NULLS LAST, b.created_at DESC
		LIMIT $`+strconv.Itoa(idx)+` OFFSET $`+strconv.Itoa(idx+1),
		args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []RekapDiserahkanRow
	for rows.Next() {
		var row RekapDiserahkanRow
		var tg, tf *string
		err := rows.Scan(&row.Nobooking, &row.Noppbb, &row.Tanggal, &row.Tahunajb, &row.Namawajibpajak, &row.Namapemilikobjekpajak, &row.Npwpwajibpajak, &row.Trackstatus, &tf, &row.BphtbYangtelahDibayar)
		if err != nil {
			continue
		}
		row.TanggalFormatted = tf
		if tg != nil {
			row.Tanggal = tg
		}
		list = append(list, row)
	}

	totalPages := (total + limit - 1) / limit
	if totalPages < 1 {
		totalPages = 1
	}
	return &RekapDiserahkanResult{Rows: list, Total: total, TotalNominal: totalNominal, Page: page, Limit: limit, TotalPages: totalPages}, nil
}

// SendNowResult holds atomic write results after send-now.
type SendNowResult struct {
	Nobooking   string                 `json:"nobooking"`
	Trackstatus string                 `json:"trackstatus"`
	NoRegistrasi string                `json:"no_registrasi"`
	LTB         map[string]interface{} `json:"ltb"`
	Bank        map[string]interface{} `json:"bank"`
}

// SendNow moves a booking to "Diolah": updates trackstatus, quota and queue. Optionally inserts into ltb_1 and bank_1 if tables exist.
func (r *PpatRepo) SendNow(ctx context.Context, userid, nobooking string) (*SendNowResult, error) {
	if r.pool == nil {
		return nil, nil
	}
	today := time.Now().Format("2006-01-02")
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	// Ensure quota row exists (check error so transaction is not left aborted)
	_, err = tx.Exec(ctx, `INSERT INTO ppat_daily_quota (quota_date, used_count, limit_count) VALUES ($1, 0, 80) ON CONFLICT (quota_date) DO NOTHING`, today)
	if err != nil {
		return nil, err
	}
	var usedCount, limitCount int
	err = tx.QueryRow(ctx, `SELECT used_count, limit_count FROM ppat_daily_quota WHERE quota_date = $1 FOR UPDATE`, today).Scan(&usedCount, &limitCount)
	if err != nil {
		return nil, err
	}
	if usedCount >= limitCount {
		return nil, ErrPpatQuotaFull
	}

	var currentStatus string
	err = tx.QueryRow(ctx, `SELECT trackstatus FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2`, nobooking, userid).Scan(&currentStatus)
	if err != nil {
		return nil, err
	}
	if currentStatus != "Draft" && currentStatus != "Pending" {
		return nil, ErrPpatBookingNotSendable
	}

	_, err = tx.Exec(ctx, `INSERT INTO ppat_send_queue (nobooking, userid, scheduled_for, status, sent_at) VALUES ($1,$2,$3,'sent', now()) ON CONFLICT (nobooking) DO UPDATE SET status='sent', sent_at=now(), scheduled_for=$3`, nobooking, userid, today)
	if err != nil {
		return nil, err
	}
	_, err = tx.Exec(ctx, `UPDATE ppat_daily_quota SET used_count = used_count + 1, updated_at = now() WHERE quota_date = $1`, today)
	if err != nil {
		return nil, err
	}
	_, err = tx.Exec(ctx, `UPDATE pat_1_bookingsspd SET trackstatus='Diolah', updated_at=now() WHERE nobooking = $1 AND userid = $2`, nobooking, userid)
	if err != nil {
		return nil, err
	}

	// Fetch booking snapshot used for relation tables.
	var namaWP, namaOP *string
	var jenisWP *string
	var bphtbDibayar *float64
	var noBukti, tglPerolehan, tglPembayaran *string
	err = tx.QueryRow(ctx, `
		SELECT
			p.namawajibpajak,
			p.namapemilikobjekpajak,
			p.jenis_wajib_pajak::text,
			bp.bphtb_yangtelah_dibayar::float8,
			o.nomor_bukti_pembayaran,
			o.tanggal_perolehan::text,
			o.tanggal_pembayaran::text
		FROM pat_1_bookingsspd p
		LEFT JOIN pat_2_bphtb_perhitungan bp ON bp.nobooking = p.nobooking
		LEFT JOIN pat_4_objek_pajak o ON o.nobooking = p.nobooking
		WHERE p.nobooking = $1 AND p.userid = $2
	`, nobooking, userid).Scan(&namaWP, &namaOP, &jenisWP, &bphtbDibayar, &noBukti, &tglPerolehan, &tglPembayaran)
	if err != nil {
		return nil, err
	}

	year := time.Now().Year()
	prefix := fmt.Sprintf("%dO", year)
	likePattern := prefix + "%"
	var nextSeq int
	err = tx.QueryRow(ctx, `
		SELECT COALESCE(MAX(CAST(right(no_registrasi, 6) AS integer)), 0) + 1
		FROM ltb_1_terima_berkas_sspd
		WHERE no_registrasi LIKE $1
	`, likePattern).Scan(&nextSeq)
	if err != nil {
		return nil, err
	}
	noRegistrasi := fmt.Sprintf("%s%06d", prefix, nextSeq)

	// Upsert LTB relation row.
	cmd, err := tx.Exec(ctx, `
		UPDATE ltb_1_terima_berkas_sspd
		SET
			userid = $2,
			namawajibpajak = COALESCE($3, namawajibpajak),
			namapemilikobjekpajak = COALESCE($4, namapemilikobjekpajak),
			status = 'Diterima',
			trackstatus = 'Diolah',
			jenis_wajib_pajak = COALESCE($5::jenis_wajib_pajak, jenis_wajib_pajak),
			no_registrasi = COALESCE(NULLIF(no_registrasi, ''), $6),
			updated_at = now()
		WHERE nobooking = $1
	`, nobooking, userid, namaWP, namaOP, jenisWP, noRegistrasi)
	if err != nil {
		return nil, err
	}
	if cmd.RowsAffected() == 0 {
		_, err = tx.Exec(ctx, `
			INSERT INTO ltb_1_terima_berkas_sspd (
				nobooking, userid, namawajibpajak, namapemilikobjekpajak, status, trackstatus, jenis_wajib_pajak, no_registrasi, updated_at
			) VALUES (
				$1, $2, COALESCE($3, ''), COALESCE($4, ''), 'Diterima', 'Diolah', $5::jenis_wajib_pajak, $6, now()
			)
		`, nobooking, userid, namaWP, namaOP, jenisWP, noRegistrasi)
		if err != nil {
			return nil, err
		}
	}

	// Upsert Bank relation row.
	cmd, err = tx.Exec(ctx, `
		UPDATE bank_1_cek_hasil_transaksi
		SET
			userid = $2,
			bphtb_yangtelah_dibayar = COALESCE($3::int, bphtb_yangtelah_dibayar),
			nomor_bukti_pembayaran = COALESCE($4, nomor_bukti_pembayaran),
			tanggal_perolehan = COALESCE($5, tanggal_perolehan),
			tanggal_pembayaran = COALESCE($6, tanggal_pembayaran),
			status_verifikasi = COALESCE(NULLIF(status_verifikasi, ''), 'Pending'),
			status_dibank = COALESCE(NULLIF(status_dibank, ''), 'Dicheck'),
			no_registrasi = COALESCE(NULLIF(no_registrasi, ''), $7)
		WHERE nobooking = $1
	`, nobooking, userid, bphtbDibayar, noBukti, tglPerolehan, tglPembayaran, noRegistrasi)
	if err != nil {
		return nil, err
	}
	if cmd.RowsAffected() == 0 {
		_, err = tx.Exec(ctx, `
			INSERT INTO bank_1_cek_hasil_transaksi (
				nobooking, userid, bphtb_yangtelah_dibayar, nomor_bukti_pembayaran, tanggal_perolehan, tanggal_pembayaran, status_verifikasi, status_dibank, no_registrasi
			) VALUES (
				$1, $2, $3::int, $4, $5, $6, 'Pending', 'Dicheck', $7
			)
		`, nobooking, userid, bphtbDibayar, noBukti, tglPerolehan, tglPembayaran, noRegistrasi)
		if err != nil {
			return nil, err
		}
	}

	if err = tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &SendNowResult{
		Nobooking:   nobooking,
		Trackstatus: "Diolah",
		NoRegistrasi: noRegistrasi,
		LTB: map[string]interface{}{
			"nobooking":             nobooking,
			"userid":                userid,
			"namawajibpajak":        namaWP,
			"namapemilikobjekpajak": namaOP,
			"status":                "Diterima",
			"trackstatus":           "Diolah",
			"no_registrasi":         noRegistrasi,
		},
		Bank: map[string]interface{}{
			"nobooking":              nobooking,
			"userid":                 userid,
			"bphtb_yangtelah_dibayar": bphtbDibayar,
			"nomor_bukti_pembayaran": noBukti,
			"tanggal_perolehan":      tglPerolehan,
			"tanggal_pembayaran":     tglPembayaran,
			"status_verifikasi":      "Pending",
			"status_dibank":          "Dicheck",
			"no_registrasi":          noRegistrasi,
		},
	}, nil
}

// ErrPpatQuotaFull is returned when daily quota is exceeded.
var ErrPpatQuotaFull = errors.New("Kuota hari ini penuh")

// ErrPpatBookingNotSendable is returned when booking status is not Draft or Pending.
var ErrPpatBookingNotSendable = errors.New("Booking tidak dapat dikirim")

// CreateBookingBadan inserts pat_1_bookingsspd (Badan Usaha); kolom nobooking diisi oleh trigger generate_nobooking (BEFORE INSERT).
// Setelah pat_1 tersimpan dengan nobooking, data terkait dimasukkan ke pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop.
func (r *PpatRepo) CreateBookingBadan(ctx context.Context, userid string, params *CreateBookingParams) (nobooking string, err error) {
	if r.pool == nil {
		return "", fmt.Errorf("database not configured")
	}
	jwp := "Badan Usaha"
	if params.JenisWajibPajak != "" {
		jwp = params.JenisWajibPajak
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx)

	// 1. Insert pat_1; trigger generate_nobooking mengisi nobooking (dari ppat_khusus + tahun + urutan), RETURNING nobooking
	err = tx.QueryRow(ctx, `
		INSERT INTO pat_1_bookingsspd (
			jenis_wajib_pajak, userid, noppbb, namawajibpajak, alamatwajibpajak, namapemilikobjekpajak, alamatpemilikobjekpajak,
			tanggal, tahunajb, kabupatenkotawp, kecamatanwp, kelurahandesawp, rtrwwp, npwpwp, kodeposwp,
			kabupatenkotaop, kecamatanop, kelurahandesaop, rtrwop, npwpop, kodeposop, trackstatus
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
		RETURNING nobooking
	`, jwp, userid, params.Noppbb, params.Namawajibpajak, params.Alamatwajibpajak, params.Namapemilikobjekpajak, params.Alamatpemilikobjekpajak,
		params.Tanggal, params.Tahunajb, params.Kabupatenkotawp, params.Kecamatanwp, params.Kelurahandesawp, params.Rtrwwp, params.Npwpwp, params.Kodeposwp,
		params.Kabupatenkotaop, params.Kecamatanop, params.Kelurahandesaop, params.Rtrwop, params.Npwpop, params.Kodeposop, params.Trackstatus).Scan(&nobooking)
	if err != nil {
		return "", err
	}
	// 2. Setelah nobooking tersedia, insert pat_2, pat_4, pat_5
	if params.NilaiPerolehanObjekPajakTidakKenaPajak != nil || params.BphtbYangtelahDibayar != nil {
		np := 0.0
		bp := 0.0
		if params.NilaiPerolehanObjekPajakTidakKenaPajak != nil {
			np = *params.NilaiPerolehanObjekPajakTidakKenaPajak
		}
		if params.BphtbYangtelahDibayar != nil {
			bp = *params.BphtbYangtelahDibayar
		}
		_, _ = tx.Exec(ctx, `INSERT INTO pat_2_bphtb_perhitungan (nilaiperolehanobjekpajaktidakkenapajak, bphtb_yangtelah_dibayar, nobooking) VALUES ($1,$2,$3)`, np, bp, nobooking)
	}
	if params.Letaktanahdanbangunan != "" || params.Hargatransaksi != "" {
		_, _ = tx.Exec(ctx, `
			INSERT INTO pat_4_objek_pajak (letaktanahdanbangunan, rt_rwobjekpajak, status_kepemilikan, keterangan, nomor_sertifikat, tanggal_perolehan, tanggal_pembayaran, nomor_bukti_pembayaran, nobooking, harga_transaksi, kelurahandesalp, kecamatanlp, jenis_perolehan)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
			params.Letaktanahdanbangunan, params.RtRwobjekpajak, normStatusKepemilikan(params.StatusKepemilikan), params.Keterangan, params.NomorSertifikat, params.TanggalPerolehan, params.TanggalPembayaran, params.NomorBuktiPembayaran, nobooking, params.Hargatransaksi, params.Kelurahandesalp, params.Kecamatanlp, params.JenisPerolehan)
	}
	if params.LuasTanah != nil || params.NjopTanah != nil || params.LuasBangunan != nil || params.NjopBangunan != nil || params.TotalNjoppbb != nil {
		lt, nt, lb, nb, tot := 0.0, 0.0, 0.0, 0.0, 0.0
		if params.LuasTanah != nil {
			lt = *params.LuasTanah
		}
		if params.NjopTanah != nil {
			nt = *params.NjopTanah
		}
		if params.LuasBangunan != nil {
			lb = *params.LuasBangunan
		}
		if params.NjopBangunan != nil {
			nb = *params.NjopBangunan
		}
		if params.TotalNjoppbb != nil {
			tot = *params.TotalNjoppbb
		}
		_, _ = tx.Exec(ctx, `INSERT INTO pat_5_penghitungan_njop (luas_tanah, njop_tanah, luas_bangunan, njop_bangunan, total_njoppbb, nobooking) VALUES ($1,$2,$3,$4,$5,$6)`, lt, nt, lb, nb, tot, nobooking)
	}
	return nobooking, tx.Commit(ctx)
}

// CreateBookingPerorangan inserts pat_1 with jenis_wajib_pajak = 'Perorangan'.
func (r *PpatRepo) CreateBookingPerorangan(ctx context.Context, userid string, params *CreateBookingParams) (nobooking string, err error) {
	if r.pool == nil {
		return "", fmt.Errorf("database not configured")
	}
	params.JenisWajibPajak = "Perorangan"
	return r.CreateBookingBadan(ctx, userid, params)
}

func normStatusKepemilikan(s string) string {
	switch s {
	case "milik_pribadi", "Milik Pribadi":
		return "Milik Pribadi"
	case "milik_bersama", "Milik Bersama":
		return "Milik Bersama"
	case "sewa", "Sewa":
		return "Sewa"
	case "hak_guna_bangunan", "Hak Guna Bangunan":
		return "Hak Guna Bangunan"
	}
	return "Milik Pribadi"
}

// GetBookingByNobooking returns one booking detail by nobooking for the given user.
func (r *PpatRepo) GetBookingByNobooking(ctx context.Context, userid, nobooking string) (map[string]interface{}, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("database not configured")
	}
	row := r.pool.QueryRow(ctx, `
		SELECT 
			p.nobooking,
			p.noppbb AS nop,
			p.namawajibpajak AS nama_wajib_pajak,
			p.alamatwajibpajak AS alamat_wajib_pajak,
			p.namapemilikobjekpajak AS atas_nama,
			p.npwpwp,
			p.npwpop,
			p.tahunajb,
			p.kelurahandesawp AS kelurahan,
			p.kecamatanwp AS kecamatan,
			p.kabupatenkotawp AS kabupaten_kota,
			p.kodeposwp,
			p.kelurahandesaop AS kelurahanop,
			p.kecamatanop AS kecamatanopj,
			p.kabupatenkotaop,
			p.trackstatus,
			p.jenis_wajib_pajak,
			p.created_at,
			p.updated_at,
			o.letaktanahdanbangunan AS "Alamatop",
			o.keterangan,
			pp.luas_tanah,
			pp.luas_bangunan,
			u.nama AS nama_pemohon,
			u.telepon::text AS no_telepon,
			u.alamat_pu AS alamat_pemohon,
			bp.bphtb_yangtelah_dibayar
		FROM pat_1_bookingsspd p
		LEFT JOIN a_2_verified_users u ON u.userid = p.userid
		LEFT JOIN pat_4_objek_pajak o ON o.nobooking = p.nobooking
		LEFT JOIN pat_5_penghitungan_njop pp ON pp.nobooking = p.nobooking
		LEFT JOIN pat_2_bphtb_perhitungan bp ON bp.nobooking = p.nobooking
		WHERE p.nobooking = $1 AND p.userid = $2
	`, nobooking, userid)
	var nobookingOut, nop, namaWp, alamatWp, atasNama, npwpwp, npwpop, kelurahan, kecamatan, kabupatenKota, kodeposwp, kelurahanop, kecamatanopj, kabupatenkotaop, trackstatus, jenisWp, alamatop, keterangan, namaPemohon, noTelepon, alamatPemohon *string
	var tahunajb *string
	var createdAt, updatedAt *time.Time
	var luasTanah, luasBangunan, bphtbDibayar *float64
	err := row.Scan(&nobookingOut, &nop, &namaWp, &alamatWp, &atasNama, &npwpwp, &npwpop, &tahunajb, &kelurahan, &kecamatan, &kabupatenKota, &kodeposwp, &kelurahanop, &kecamatanopj, &kabupatenkotaop, &trackstatus, &jenisWp, &createdAt, &updatedAt, &alamatop, &keterangan, &luasTanah, &luasBangunan, &namaPemohon, &noTelepon, &alamatPemohon, &bphtbDibayar)
	if err != nil {
		return nil, err
	}
	val := func(s *string) interface{} { if s != nil { return *s }; return nil }
	valTime := func(t *time.Time) interface{} { if t != nil { return *t }; return nil }
	valFloat := func(f *float64) interface{} { if f != nil { return *f }; return nil }
	out := map[string]interface{}{
		"nobooking": val(nobookingOut), "nop": val(nop), "nama_wajib_pajak": val(namaWp), "alamat_wajib_pajak": val(alamatWp),
		"atas_nama": val(atasNama), "npwpwp": val(npwpwp), "npwpop": val(npwpop), "tahunajb": val(tahunajb),
		"kelurahan": val(kelurahan), "kecamatan": val(kecamatan), "kabupaten_kota": val(kabupatenKota), "kodeposwp": val(kodeposwp),
		"kelurahanop": val(kelurahanop), "kecamatanopj": val(kecamatanopj), "kabupatenkotaop": val(kabupatenkotaop),
		"trackstatus": val(trackstatus), "jenis_wajib_pajak": val(jenisWp), "created_at": valTime(createdAt), "updated_at": valTime(updatedAt),
		"Alamatop": val(alamatop), "keterangan": val(keterangan), "luas_tanah": valFloat(luasTanah), "luas_bangunan": valFloat(luasBangunan),
		"nama_pemohon": val(namaPemohon), "no_telepon": val(noTelepon), "alamat_pemohon": val(alamatPemohon),
		"bphtb_yangtelah_dibayar": valFloat(bphtbDibayar),
	}
	return out, nil
}

// ListBookingHistoryBadan returns recent Badan Usaha bookings for callback dropdown (NOP + nama search).
func (r *PpatRepo) ListBookingHistoryBadan(ctx context.Context, userid string, q string, limit int) ([]map[string]interface{}, error) {
	if r.pool == nil {
		return []map[string]interface{}{}, nil
	}
	if limit < 1 {
		limit = 30
	}
	if limit > 50 {
		limit = 50
	}
	search := strings.TrimSpace(q)
	pattern := "%" + search + "%"
	rows, err := r.pool.Query(ctx, `
		SELECT p.nobooking, p.noppbb, p.namawajibpajak
		FROM pat_1_bookingsspd p
		WHERE p.userid = $1
		  AND p.jenis_wajib_pajak::text = 'Badan Usaha'
		  AND COALESCE(p.trackstatus, '') NOT IN ('Dihapus', 'Diserahkan')
		  AND ($2::text = '' OR p.noppbb ILIKE $3 OR p.namawajibpajak ILIKE $3 OR p.nobooking ILIKE $3)
		ORDER BY p.created_at DESC
		LIMIT $4
	`, userid, search, pattern, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []map[string]interface{}
	for rows.Next() {
		var nobooking, noppbb, nama string
		if err := rows.Scan(&nobooking, &noppbb, &nama); err != nil {
			continue
		}
		label := strings.TrimSpace(noppbb) + " - " + strings.TrimSpace(nama)
		out = append(out, map[string]interface{}{
			"id":               nobooking,
			"nobooking":        nobooking,
			"noppbb":           noppbb,
			"namawajibpajak":   nama,
			"label":            label,
		})
	}
	return out, rows.Err()
}

// GetBookingBadanCallbackData returns joined pat_1 + pat_2 + pat_4 + pat_5 fields for PU callback autofill (Badan only).
func (r *PpatRepo) GetBookingBadanCallbackData(ctx context.Context, userid, nobooking string) (map[string]interface{}, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("database not configured")
	}
	row := r.pool.QueryRow(ctx, `
		SELECT
			p.noppbb,
			p.namawajibpajak, p.alamatwajibpajak, p.namapemilikobjekpajak, p.alamatpemilikobjekpajak,
			p.tahunajb::text,
			p.kabupatenkotawp, p.kecamatanwp, p.kelurahandesawp, p.rtrwwp, p.kodeposwp,
			p.kabupatenkotaop, p.kecamatanop, p.kelurahandesaop, p.rtrwop, p.kodeposop,
			p.npwpwp, p.npwpop,
			bp.nilaiperolehanobjekpajaktidakkenapajak, bp.bphtb_yangtelah_dibayar,
			o.harga_transaksi, o.letaktanahdanbangunan, o.rt_rwobjekpajak, o.status_kepemilikan, o.keterangan, o.nomor_sertifikat,
			o.tanggal_perolehan, o.tanggal_pembayaran, o.nomor_bukti_pembayaran, o.jenis_perolehan, o.kelurahandesalp, o.kecamatanlp,
			pp.luas_tanah, pp.njop_tanah, pp.luas_bangunan, pp.njop_bangunan
		FROM pat_1_bookingsspd p
		LEFT JOIN pat_2_bphtb_perhitungan bp ON bp.nobooking = p.nobooking
		LEFT JOIN pat_4_objek_pajak o ON o.nobooking = p.nobooking
		LEFT JOIN pat_5_penghitungan_njop pp ON pp.nobooking = p.nobooking
		WHERE p.nobooking = $1 AND p.userid = $2 AND p.jenis_wajib_pajak::text = 'Badan Usaha'
	`, nobooking, userid)

	var (
		noppbb, namawp, alamatwp, namaop, alamatop, tahunajb *string
		kabwp, kecwp, kelwp, rtrwwp, kodeposwp *string
		kabop, kecop, kelop, rtrwop, kodeposop *string
		npwpwp, npwpop *string
		npoptkp *float64
		bphtb   *int32
		harga, letak, rtop, statusKm, ket, nomorSert *string
		tglPeroleh, tglBayar, nomorBukti, jenisPerolehan, kelLp, kecLp *string
		luasT, njopT, luasB, njopB *float64
	)
	err := row.Scan(
		&noppbb,
		&namawp, &alamatwp, &namaop, &alamatop,
		&tahunajb,
		&kabwp, &kecwp, &kelwp, &rtrwwp, &kodeposwp,
		&kabop, &kecop, &kelop, &rtrwop, &kodeposop,
		&npwpwp, &npwpop,
		&npoptkp, &bphtb,
		&harga, &letak, &rtop, &statusKm, &ket, &nomorSert,
		&tglPeroleh, &tglBayar, &nomorBukti, &jenisPerolehan, &kelLp, &kecLp,
		&luasT, &njopT, &luasB, &njopB,
	)
	if err != nil {
		return nil, err
	}

	val := func(s *string) interface{} {
		if s == nil {
			return nil
		}
		return *s
	}
	valF := func(f *float64) interface{} {
		if f == nil {
			return nil
		}
		return *f
	}
	out := map[string]interface{}{
		"noppbb": val(noppbb),
		"namawajibpajak": val(namawp), "alamatwajibpajak": val(alamatwp),
		"namapemilikobjekpajak": val(namaop), "alamatpemilikobjekpajak": val(alamatop),
		"tahunajb": val(tahunajb),
		"kabupatenkotawp": val(kabwp), "kecamatanwp": val(kecwp), "kelurahandesawp": val(kelwp),
		"rtrwwp": val(rtrwwp), "kodeposwp": val(kodeposwp),
		"kabupatenkotaop": val(kabop), "kecamatanop": val(kecop), "kelurahandesaop": val(kelop),
		"rtrwop": val(rtrwop), "kodeposop": val(kodeposop),
		"npwpwp": val(npwpwp), "npwpop": val(npwpop),
		"nilaiPerolehanObjekPajakTidakKenaPajak": valF(npoptkp),
		"hargatransaksi": val(harga), "letaktanahdanbangunan": val(letak),
		"rt_rwobjekpajak": val(rtop), "status_kepemilikan": val(statusKm),
		"keterangan": val(ket), "nomor_sertifikat": val(nomorSert),
		"tanggal_perolehan": val(tglPeroleh), "tanggal_pembayaran": val(tglBayar),
		"nomor_bukti_pembayaran": val(nomorBukti), "jenisPerolehan": val(jenisPerolehan),
		"kelurahandesalp": val(kelLp), "kecamatanlp": val(kecLp),
		"luas_tanah": valF(luasT), "njop_tanah": valF(njopT), "luas_bangunan": valF(luasB), "njop_bangunan": valF(njopB),
	}
	if bphtb != nil {
		out["bphtb_yangtelah_dibayar"] = int(*bphtb)
	}
	return out, nil
}

// UpdateTrackstatus sets trackstatus for a booking owned by userid.
func (r *PpatRepo) UpdateTrackstatus(ctx context.Context, userid, nobooking, trackstatus string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	cmd, err := r.pool.Exec(ctx, `UPDATE pat_1_bookingsspd SET trackstatus = $1, updated_at = CURRENT_TIMESTAMP WHERE nobooking = $2 AND userid = $3`, trackstatus, nobooking, userid)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("booking not found")
	}
	return nil
}

// DeleteBooking deletes a booking owned by userid.
func (r *PpatRepo) DeleteBooking(ctx context.Context, userid, nobooking string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	cmd, err := r.pool.Exec(ctx, `DELETE FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2`, nobooking, userid)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("booking not found")
	}
	return nil
}

// QuotaRow holds daily quota info.
type QuotaRow struct {
	Date      string `json:"date"`
	Used      int    `json:"used"`
	Limit     int    `json:"limit"`
	Remaining int    `json:"remaining"`
}

// GetUserSignatureResult holds tanda_tangan info from a_2_verified_users.
type GetUserSignatureResult struct {
	Path *string
	Mime *string
}

// GetUserSignature returns tanda_tangan_path and tanda_tangan_mime for userid from a_2_verified_users.
func (r *PpatRepo) GetUserSignature(ctx context.Context, userid string) (*GetUserSignatureResult, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("database not configured")
	}
	var path, mime *string
	err := r.pool.QueryRow(ctx, `SELECT tanda_tangan_path, tanda_tangan_mime FROM a_2_verified_users WHERE userid = $1`, userid).Scan(&path, &mime)
	if err != nil {
		return nil, err
	}
	return &GetUserSignatureResult{Path: path, Mime: mime}, nil
}

// GetDocumentsRow holds document paths for a booking.
type GetDocumentsRow struct {
	AktaTanahPath       *string
	SertifikatTanahPath *string
	PelengkapPath       *string
}

// GetDocuments returns document paths for a booking owned by userid.
func (r *PpatRepo) GetDocuments(ctx context.Context, userid, nobooking string) (*GetDocumentsRow, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("database not configured")
	}
	var row GetDocumentsRow
	err := r.pool.QueryRow(ctx,
		`SELECT akta_tanah_path, sertifikat_tanah_path, pelengkap_path
		 FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2`,
		nobooking, userid).Scan(&row.AktaTanahPath, &row.SertifikatTanahPath, &row.PelengkapPath)
	if err != nil {
		return nil, err
	}
	return &row, nil
}

// ScheduleSendResult holds result of ScheduleSend.
type ScheduleSendResult struct {
	ScheduledFor string
	Used         int
	Limit        int
	Remaining    int
}

// ScheduleSend schedules a booking for future send (status Pending, queued).
func (r *PpatRepo) ScheduleSend(ctx context.Context, userid, nobooking, scheduledFor string) (*ScheduleSendResult, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("database not configured")
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	// Validate booking ownership & status
	var currentStatus string
	err = tx.QueryRow(ctx, `SELECT trackstatus FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2`, nobooking, userid).Scan(&currentStatus)
	if err != nil {
		return nil, err
	}
	if currentStatus != "Draft" && currentStatus != "Pending" {
		return nil, ErrPpatBookingNotSendable
	}

	// Upsert quota row
	_, _ = tx.Exec(ctx, `INSERT INTO ppat_daily_quota (quota_date, used_count, limit_count) VALUES ($1, 0, 80) ON CONFLICT (quota_date) DO NOTHING`, scheduledFor)

	// Check quota
	var usedCount, limitCount int
	err = tx.QueryRow(ctx, `SELECT used_count, limit_count FROM ppat_daily_quota WHERE quota_date = $1 FOR UPDATE`, scheduledFor).Scan(&usedCount, &limitCount)
	if err != nil {
		return nil, err
	}
	if usedCount >= limitCount {
		return nil, ErrPpatQuotaFull
	}

	// Insert/update queue
	_, err = tx.Exec(ctx, `INSERT INTO ppat_send_queue (nobooking, userid, scheduled_for) VALUES ($1,$2,$3)
		ON CONFLICT (nobooking) DO UPDATE SET scheduled_for=$3, status='queued'`, nobooking, userid, scheduledFor)
	if err != nil {
		return nil, err
	}

	// Update booking status to Pending
	_, err = tx.Exec(ctx, `UPDATE pat_1_bookingsspd SET trackstatus='Pending', updated_at=now() WHERE nobooking = $1 AND userid = $2`, nobooking, userid)
	if err != nil {
		return nil, err
	}

	// Increment quota
	_, err = tx.Exec(ctx, `UPDATE ppat_daily_quota SET used_count = used_count + 1, updated_at = now() WHERE quota_date = $1`, scheduledFor)
	if err != nil {
		return nil, err
	}

	if err = tx.Commit(ctx); err != nil {
		return nil, err
	}
	usedCount++
	remaining := limitCount - usedCount
	if remaining < 0 {
		remaining = 0
	}
	return &ScheduleSendResult{ScheduledFor: scheduledFor, Used: usedCount, Limit: limitCount, Remaining: remaining}, nil
}

// UpdateSignaturePath updates path_ttd_wp in pat_6_sign for the given nobooking. Inserts if row does not exist.
func (r *PpatRepo) UpdateSignaturePath(ctx context.Context, nobooking, path string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	cmd, err := r.pool.Exec(ctx, `UPDATE pat_6_sign SET path_ttd_wp = $1 WHERE nobooking = $2`, path, nobooking)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		// pat_6_sign has NOT NULL columns (userid, nama). Insert from booking + verified user.
		// No ON CONFLICT: pat_6_sign has no UNIQUE(nobooking), only PRIMARY KEY(id).
		cmd2, err := r.pool.Exec(ctx, `
			INSERT INTO pat_6_sign (nobooking, userid, nama, path_ttd_wp, ppat_khusus)
			SELECT
				b.nobooking,
				b.userid,
				COALESCE(NULLIF(TRIM(b.namawajibpajak), ''), b.userid) AS nama,
				$2 AS path_ttd_wp,
				vu.ppat_khusus
			FROM pat_1_bookingsspd b
			LEFT JOIN a_2_verified_users vu ON vu.userid = b.userid
			WHERE b.nobooking = $1
		`, nobooking, path)
		if err != nil {
			return err
		}
		if cmd2.RowsAffected() == 0 {
			return fmt.Errorf("booking not found")
		}
		return nil
	}
	return nil
}

// UpdateDocumentPath updates a single document path column in pat_1_bookingsspd.
// col is one of: akta_tanah_path, sertifikat_tanah_path, pelengkap_path
func (r *PpatRepo) UpdateDocumentPath(ctx context.Context, userid, nobooking, col, path string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	validCols := map[string]bool{"akta_tanah_path": true, "sertifikat_tanah_path": true, "pelengkap_path": true}
	if !validCols[col] {
		return fmt.Errorf("invalid column: %s", col)
	}
	query := fmt.Sprintf("UPDATE pat_1_bookingsspd SET %s = $1, updated_at = now() WHERE nobooking = $2 AND userid = $3", col)
	cmd, err := r.pool.Exec(ctx, query, path, nobooking, userid)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("booking not found")
	}
	return nil
}

// GetQuota returns quota for the given date (YYYY-MM-DD).
func (r *PpatRepo) GetQuota(ctx context.Context, date string) (*QuotaRow, error) {
	if r.pool == nil {
		return &QuotaRow{Date: date, Used: 0, Limit: 80, Remaining: 80}, nil
	}
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	var usedCount, limitCount int
	err := r.pool.QueryRow(ctx, `SELECT COALESCE(used_count, 0), COALESCE(limit_count, 80) FROM ppat_daily_quota WHERE quota_date = $1`, date).Scan(&usedCount, &limitCount)
	if err != nil {
		return &QuotaRow{Date: date, Used: 0, Limit: 80, Remaining: 80}, nil
	}
	remaining := limitCount - usedCount
	if remaining < 0 {
		remaining = 0
	}
	return &QuotaRow{Date: date, Used: usedCount, Limit: limitCount, Remaining: remaining}, nil
}

// CreateBookingParams holds common fields for create booking (Badan/Perorangan).
type CreateBookingParams struct {
	JenisWajibPajak     string   `json:"jenis_wajib_pajak"`
	Noppbb              string   `json:"noppbb"`
	Namawajibpajak      string   `json:"namawajibpajak"`
	Alamatwajibpajak    string   `json:"alamatwajibpajak"`
	Namapemilikobjekpajak string `json:"namapemilikobjekpajak"`
	Alamatpemilikobjekpajak string `json:"alamatpemilikobjekpajak"`
	Tanggal             string   `json:"tanggal"`
	Tahunajb            string   `json:"tahunajb"`
	Kabupatenkotawp     string   `json:"kabupatenkotawp"`
	Kecamatanwp         string   `json:"kecamatanwp"`
	Kelurahandesawp     string   `json:"kelurahandesawp"`
	Rtrwwp              string   `json:"rtrwwp"`
	Npwpwp              string   `json:"npwpwp"`
	Kodeposwp           string   `json:"kodeposwp"`
	Kabupatenkotaop     string   `json:"kabupatenkotaop"`
	Kecamatanop         string   `json:"kecamatanop"`
	Kelurahandesaop     string   `json:"kelurahandesaop"`
	Rtrwop              string   `json:"rtrwop"`
	Npwpop              string   `json:"npwpop"`
	Kodeposop           string   `json:"kodeposop"`
	Trackstatus         string   `json:"trackstatus"`
	// BPHTB
	NilaiPerolehanObjekPajakTidakKenaPajak *float64 `json:"nilaiPerolehanObjekPajakTidakKenaPajak"`
	BphtbYangtelahDibayar                  *float64 `json:"bphtb_yangtelah_dibayar"`
	// Objek
	Hargatransaksi       string `json:"hargatransaksi"`
	Letaktanahdanbangunan string `json:"letaktanahdanbangunan"`
	RtRwobjekpajak       string `json:"rt_rwobjekpajak"`
	Kecamatanlp          string `json:"kecamatanlp"`
	Kelurahandesalp      string `json:"kelurahandesalp"`
	StatusKepemilikan    string `json:"status_kepemilikan"`
	JenisPerolehan       string `json:"jenisPerolehan"`
	Keterangan           string `json:"keterangan"`
	NomorSertifikat      string `json:"nomor_sertifikat"`
	TanggalPerolehan     string `json:"tanggal_perolehan"`
	TanggalPembayaran    string `json:"tanggal_pembayaran"`
	NomorBuktiPembayaran string `json:"nomor_bukti_pembayaran"`
	// NJOP
	LuasTanah     *float64 `json:"luas_tanah"`
	NjopTanah      *float64 `json:"njop_tanah"`
	LuasBangunan   *float64 `json:"luas_bangunan"`
	NjopBangunan   *float64 `json:"njop_bangunan"`
	TotalNjoppbb   *float64 `json:"total_njoppbb"`
}
