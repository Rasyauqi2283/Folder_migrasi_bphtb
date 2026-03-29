package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func ptrString(s string) *string { if s == "" { return nil }; return &s }

// BankRepo handles bank_1_cek_hasil_transaksi and related queries for Bank role.
type BankRepo struct {
	pool *pgxpool.Pool
}

// NewBankRepo creates a BankRepo.
func NewBankRepo(pool *pgxpool.Pool) *BankRepo {
	return &BankRepo{pool: pool}
}

// BankTransaksiRow represents one row for GET /api/bank/transaksi.
type BankTransaksiRow struct {
	ID                     int64    `json:"id"`
	Nobooking              string   `json:"nobooking"`
	Noppbb                 string   `json:"noppbb"`
	Namawajibpajak         string   `json:"namawajibpajak"`
	NomorBuktiPembayaran   *string  `json:"nomor_bukti_pembayaran"`
	Nominal                *float64 `json:"nominal"` // tagihan di sistem (BPHTB yang telah dibayar / tercatat)
	TanggalPembayaran      *string  `json:"tanggal_pembayaran"`
	StatusVerifikasi       string   `json:"status_verifikasi"`
	StatusDibank           string   `json:"status_dibank"`
	CatatanBank            *string  `json:"catatan_bank"`
	NoRegistrasi           *string  `json:"no_registrasi"`
	GatewayNominalReceived *int64   `json:"gateway_nominal_received,omitempty"`
	GatewayStatus          *string  `json:"gateway_status,omitempty"`
	HasDiscrepancy         bool     `json:"has_discrepancy"`
	SspdPembayaranStatus   string   `json:"sspd_pembayaran_status,omitempty"`
	PaymentStatus          *string  `json:"payment_status,omitempty"`
}

// BankTransaksiDetail is returned for GET /api/bank/transaksi/{nobooking}/detail (modal Periksa).
type BankTransaksiDetail struct {
	Nobooking              string     `json:"nobooking"`
	NoRegistrasi           *string    `json:"no_registrasi"`
	Noppbb                 string     `json:"noppbb"`
	Namawajibpajak         string     `json:"namawajibpajak"`
	TagihanNominal         *int64     `json:"tagihan_nominal"`
	NomorBuktiPembayaran   *string    `json:"nomor_bukti_pembayaran"`
	TanggalPembayaran      *string    `json:"tanggal_pembayaran"`
	StatusVerifikasi       string     `json:"status_verifikasi"`
	StatusDibank           string     `json:"status_dibank"`
	CatatanBank            *string    `json:"catatan_bank"`
	GatewayNominalReceived *int64     `json:"gateway_nominal_received,omitempty"`
	GatewayStatus          *string    `json:"gateway_status,omitempty"`
	GatewayReference       *string    `json:"gateway_reference,omitempty"`
	GatewayPaidAt          *time.Time `json:"gateway_paid_at,omitempty"`
	GatewayChannel         *string    `json:"gateway_channel,omitempty"`
	HasDiscrepancy         bool       `json:"has_discrepancy"`
	SspdPembayaranStatus   string     `json:"sspd_pembayaran_status"`
	PaymentStatus          *string    `json:"payment_status,omitempty"`
}

// bankDiscrepancyExpr: gateway PAID vs tagihan sistem berbeda > Rp 100.
const bankDiscrepancyExpr = `(
	COALESCE(bk.gateway_status, '') = 'PAID'
	AND bk.gateway_nominal_received IS NOT NULL
	AND COALESCE(bk.bphtb_yangtelah_dibayar, p2.bphtb_yangtelah_dibayar, 0) > 0
	AND ABS(bk.gateway_nominal_received - COALESCE(bk.bphtb_yangtelah_dibayar, p2.bphtb_yangtelah_dibayar, 0)::bigint) > 100
)`

// BankTransaksiList returns paginated list with tab (all|discrepancy|matched|legacy pending/reviewed), status filter, search.
func (r *BankRepo) BankTransaksiList(ctx context.Context, tab, statusFilter, search string, page, limit int) (rows []BankTransaksiRow, total int, totalPages int, err error) {
	if r.pool == nil {
		return nil, 0, 0, nil
	}
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	var where []string
	var args []interface{}
	argIdx := 1

	switch tab {
	case "discrepancy":
		where = append(where, fmt.Sprintf(`(COALESCE(bk.status_verifikasi, '') = 'Selisih' OR %s)`, bankDiscrepancyExpr))
	case "matched", "reviewed":
		where = append(where, `COALESCE(bk.status_verifikasi, 'Pending') IN ('Sinkron Otomatis', 'Disetujui', 'Ditolak')`)
	case "pending", "all", "":
		// Semua transaksi (peran bank: pantau; tidak ada antrian approve manual)
	default:
		// unknown tab → behave as all
	}
	if statusFilter != "" {
		where = append(where, fmt.Sprintf("COALESCE(bk.status_verifikasi, 'Pending') = $%d", argIdx))
		args = append(args, statusFilter)
		argIdx++
	}
	if search != "" {
		where = append(where, fmt.Sprintf(`(lower(bk.nobooking) LIKE $%d OR lower(p.namawajibpajak) LIKE $%d OR lower(COALESCE(p.noppbb, '')::text) LIKE $%d OR lower(COALESCE(bk.nomor_bukti_pembayaran, p4.nomor_bukti_pembayaran)::text) LIKE $%d OR lower(l.no_registrasi) LIKE $%d)`, argIdx, argIdx, argIdx, argIdx, argIdx))
		args = append(args, "%"+strings.ToLower(search)+"%")
		argIdx++
	}

	whereClause := ""
	if len(where) > 0 {
		whereClause = "WHERE " + strings.Join(where, " AND ")
	}

	countSQL := `
		SELECT COUNT(DISTINCT bk.id) FROM bank_1_cek_hasil_transaksi bk
		LEFT JOIN pat_1_bookingsspd p ON p.nobooking = bk.nobooking
		LEFT JOIN pat_2_bphtb_perhitungan p2 ON p2.nobooking = bk.nobooking
		LEFT JOIN pat_4_objek_pajak p4 ON p4.nobooking = bk.nobooking
		LEFT JOIN ltb_1_terima_berkas_sspd l ON l.nobooking = bk.nobooking
		` + whereClause
	var totalCount int
	err = r.pool.QueryRow(ctx, countSQL, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, 0, err
	}
	total = totalCount
	if limit > 0 {
		totalPages = (total + limit - 1) / limit
	}
	if totalPages < 1 {
		totalPages = 1
	}

	// LIMIT/OFFSET disisipkan sebagai bilangan bulat (bukan placeholder) agar jumlah argumen
	// selalu sama dengan $1..$n di WHERE — menghindari SQLSTATE 42P18 di Postgres/pgx.
	listSQL := fmt.Sprintf(`
		SELECT DISTINCT ON (bk.id) bk.id, bk.nobooking, COALESCE(p.noppbb, '') AS noppbb,
			COALESCE(p.namawajibpajak, '') AS namawajibpajak,
			COALESCE(bk.nomor_bukti_pembayaran, p4.nomor_bukti_pembayaran) AS nomor_bukti_pembayaran,
			COALESCE(bk.bphtb_yangtelah_dibayar, p2.bphtb_yangtelah_dibayar)::float8 AS nominal,
			COALESCE(bk.tanggal_pembayaran, p4.tanggal_pembayaran) AS tanggal_pembayaran,
			COALESCE(bk.status_verifikasi, 'Pending') AS status_verifikasi,
			COALESCE(bk.status_dibank, 'Dicheck') AS status_dibank,
			bk.catatan_bank, l.no_registrasi,
			bk.gateway_nominal_received, bk.gateway_status,
			(COALESCE(bk.status_verifikasi, '') = 'Selisih' OR %s) AS has_discrepancy,
			COALESCE(p.sspd_pembayaran_status, 'BELUM_LUNAS') AS sspd_pembayaran_status,
			COALESCE(p.payment_status, 'WAITING_FOR_PAYMENT') AS payment_status
		FROM bank_1_cek_hasil_transaksi bk
		LEFT JOIN pat_1_bookingsspd p ON p.nobooking = bk.nobooking
		LEFT JOIN pat_2_bphtb_perhitungan p2 ON p2.nobooking = bk.nobooking
		LEFT JOIN pat_4_objek_pajak p4 ON p4.nobooking = bk.nobooking
		LEFT JOIN ltb_1_terima_berkas_sspd l ON l.nobooking = bk.nobooking
		%s
		ORDER BY bk.id DESC, p2.calculationid DESC NULLS LAST
		LIMIT %d OFFSET %d`, bankDiscrepancyExpr, whereClause, limit, offset)
	rowsResult, err := r.pool.Query(ctx, listSQL, args...)
	if err != nil {
		return nil, 0, 0, err
	}
	defer rowsResult.Close()

	for rowsResult.Next() {
		var row BankTransaksiRow
		var gwAmt sql.NullInt64
		var gwSt sql.NullString
		var paySt sql.NullString
		if err := rowsResult.Scan(&row.ID, &row.Nobooking, &row.Noppbb, &row.Namawajibpajak,
			&row.NomorBuktiPembayaran, &row.Nominal, &row.TanggalPembayaran,
			&row.StatusVerifikasi, &row.StatusDibank, &row.CatatanBank, &row.NoRegistrasi,
			&gwAmt, &gwSt, &row.HasDiscrepancy, &row.SspdPembayaranStatus, &paySt); err != nil {
			continue
		}
		if gwAmt.Valid {
			v := gwAmt.Int64
			row.GatewayNominalReceived = &v
		}
		if gwSt.Valid && strings.TrimSpace(gwSt.String) != "" {
			s := gwSt.String
			row.GatewayStatus = &s
		}
		if paySt.Valid && strings.TrimSpace(paySt.String) != "" {
			s := paySt.String
			row.PaymentStatus = &s
		}
		rows = append(rows, row)
	}
	return rows, total, totalPages, nil
}

// GetTransaksiDetail returns one row for bank “Periksa” modal.
func (r *BankRepo) GetTransaksiDetail(ctx context.Context, nobooking string) (*BankTransaksiDetail, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("database not configured")
	}
	nb := strings.TrimSpace(nobooking)
	if nb == "" {
		return nil, fmt.Errorf("nobooking wajib")
	}
	const q = `
		SELECT bk.nobooking, l.no_registrasi, COALESCE(p.noppbb, ''), COALESCE(p.namawajibpajak, ''),
			COALESCE(bk.bphtb_yangtelah_dibayar, p2.bphtb_yangtelah_dibayar),
			COALESCE(bk.nomor_bukti_pembayaran, p4.nomor_bukti_pembayaran),
			COALESCE(bk.tanggal_pembayaran, p4.tanggal_pembayaran),
			COALESCE(bk.status_verifikasi, 'Pending'), COALESCE(bk.status_dibank, 'Dicheck'),
			bk.catatan_bank,
			bk.gateway_nominal_received, bk.gateway_status, bk.gateway_reference, bk.gateway_paid_at, bk.gateway_channel,
			(COALESCE(bk.status_verifikasi, '') = 'Selisih' OR (
				COALESCE(bk.gateway_status, '') = 'PAID'
				AND bk.gateway_nominal_received IS NOT NULL
				AND COALESCE(bk.bphtb_yangtelah_dibayar, p2.bphtb_yangtelah_dibayar, 0) > 0
				AND ABS(bk.gateway_nominal_received - COALESCE(bk.bphtb_yangtelah_dibayar, p2.bphtb_yangtelah_dibayar, 0)::bigint) > 100
			)) AS has_disc,
			COALESCE(p.sspd_pembayaran_status, 'BELUM_LUNAS'),
			COALESCE(p.payment_status, 'WAITING_FOR_PAYMENT')
		FROM bank_1_cek_hasil_transaksi bk
		LEFT JOIN pat_1_bookingsspd p ON p.nobooking = bk.nobooking
		LEFT JOIN pat_2_bphtb_perhitungan p2 ON p2.nobooking = bk.nobooking
		LEFT JOIN pat_4_objek_pajak p4 ON p4.nobooking = bk.nobooking
		LEFT JOIN ltb_1_terima_berkas_sspd l ON l.nobooking = bk.nobooking
		WHERE bk.nobooking = $1
		LIMIT 1`
	var d BankTransaksiDetail
	var tag sql.NullInt64
	var gwAmt sql.NullInt64
	var gwSt, gwRef, gwCh sql.NullString
	var gwAt sql.NullTime
	var paySt sql.NullString
	err := r.pool.QueryRow(ctx, q, nb).Scan(
		&d.Nobooking, &d.NoRegistrasi, &d.Noppbb, &d.Namawajibpajak,
		&tag, &d.NomorBuktiPembayaran, &d.TanggalPembayaran,
		&d.StatusVerifikasi, &d.StatusDibank, &d.CatatanBank,
		&gwAmt, &gwSt, &gwRef, &gwAt, &gwCh,
		&d.HasDiscrepancy, &d.SspdPembayaranStatus, &paySt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if tag.Valid {
		v := tag.Int64
		d.TagihanNominal = &v
	}
	if gwAmt.Valid {
		v := gwAmt.Int64
		d.GatewayNominalReceived = &v
	}
	if gwSt.Valid && strings.TrimSpace(gwSt.String) != "" {
		s := gwSt.String
		d.GatewayStatus = &s
	}
	if gwRef.Valid && strings.TrimSpace(gwRef.String) != "" {
		s := gwRef.String
		d.GatewayReference = &s
	}
	if gwCh.Valid && strings.TrimSpace(gwCh.String) != "" {
		s := gwCh.String
		d.GatewayChannel = &s
	}
	if gwAt.Valid {
		t := gwAt.Time
		d.GatewayPaidAt = &t
	}
	if paySt.Valid && strings.TrimSpace(paySt.String) != "" {
		s := paySt.String
		d.PaymentStatus = &s
	}
	return &d, nil
}

// ApplyGatewayPaid updates bank gateway columns, sets verification status (sinkron vs selisih), SSPD LUNAS on pat_1.
func (r *BankRepo) ApplyGatewayPaid(ctx context.Context, nobooking string, amount int64, reference, channel string, paidAt time.Time) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	nb := strings.TrimSpace(nobooking)
	if nb == "" {
		return fmt.Errorf("nobooking wajib")
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var userid string
	var tagihan sql.NullInt64
	err = tx.QueryRow(ctx, `
		SELECT p.userid, p2.bphtb_yangtelah_dibayar
		FROM pat_1_bookingsspd p
		LEFT JOIN pat_2_bphtb_perhitungan p2 ON p2.nobooking = p.nobooking
		WHERE p.nobooking = $1
	`, nb).Scan(&userid, &tagihan)
	if err == pgx.ErrNoRows {
		return fmt.Errorf("booking tidak ditemukan")
	}
	if err != nil {
		return err
	}

	statusVer := "Sinkron Otomatis"
	if tagihan.Valid && tagihan.Int64 > 0 {
		diff := amount - tagihan.Int64
		if diff < -100 || diff > 100 {
			statusVer = "Selisih"
		}
	}

	ref := ptrString(strings.TrimSpace(reference))
	ch := ptrString(strings.TrimSpace(channel))
	if paidAt.IsZero() {
		paidAt = time.Now()
	}

	cmdTag, err := tx.Exec(ctx, `
		UPDATE bank_1_cek_hasil_transaksi SET
			gateway_nominal_received = $2,
			gateway_status = 'PAID',
			gateway_reference = COALESCE($3::varchar, gateway_reference),
			gateway_paid_at = $4,
			gateway_channel = COALESCE($5::varchar, gateway_channel),
			status_verifikasi = $6,
			status_dibank = 'Tercheck'
		WHERE nobooking = $1
	`, nb, amount, ref, paidAt, ch, statusVer)
	if err != nil {
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		var bphtb sql.NullInt64
		_ = tx.QueryRow(ctx, `SELECT bphtb_yangtelah_dibayar FROM pat_2_bphtb_perhitungan WHERE nobooking = $1 LIMIT 1`, nb).Scan(&bphtb)
		bphtbInt := 0
		if bphtb.Valid {
			bphtbInt = int(bphtb.Int64)
		}
		if strings.TrimSpace(userid) == "" {
			userid = "gateway"
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO bank_1_cek_hasil_transaksi (
				nobooking, userid, bphtb_yangtelah_dibayar, status_verifikasi, status_dibank,
				gateway_nominal_received, gateway_status, gateway_reference, gateway_paid_at, gateway_channel
			) VALUES ($1, $2, $3::int, $4, 'Tercheck', $5, 'PAID', $6::varchar, $7, $8::varchar)`,
			nb, userid, bphtbInt, statusVer, amount, ref, paidAt, ch)
		if err != nil {
			return err
		}
	}

	// Persist canonical payment state on booking.
	underpaid := false
	if tagihan.Valid && tagihan.Int64 > 0 && amount < tagihan.Int64-100 {
		underpaid = true
	}
	paymentStatus := "PAID"
	sspdStatus := "LUNAS"
	if underpaid {
		paymentStatus = "KURANG_BAYAR"
		sspdStatus = "KURANG_BAYAR"
	}
	_, err = tx.Exec(ctx, `
		UPDATE pat_1_bookingsspd SET
			payment_amount_paid = $2,
			payment_amount_requested = COALESCE(payment_amount_requested, $3),
			payment_status = $4,
			sspd_pembayaran_status = $5,
			trackstatus = CASE
				WHEN LOWER(COALESCE(trackstatus,'')) = 'awaiting_billing' THEN 'Draft'
				ELSE trackstatus
			END,
			updated_at = now()
		WHERE nobooking = $1
	`, nb, amount, tagihan.Int64, paymentStatus, sspdStatus)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

// BankSource holds data from pat_* for upsert.
type BankSource struct {
	Userid             *string
	BphtbYangtelah     *float64
	NomorBukti         *string
	TanggalPerolehan   *string
	TanggalPembayaran  *string
}

// UpsertBankVerification updates or inserts bank_1_cek_hasil_transaksi. Fetches source from pat_* and nama from a_2_verified_users.
func (r *BankRepo) UpsertBankVerification(ctx context.Context, nobooking, statusVerifikasi, catatan, verifiedByUserid, noRegistrasi string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	var src BankSource
	_ = r.pool.QueryRow(ctx, `
		SELECT p.userid, p2.bphtb_yangtelah_dibayar, p4.nomor_bukti_pembayaran, p4.tanggal_perolehan::text, p4.tanggal_pembayaran::text
		FROM pat_1_bookingsspd p
		LEFT JOIN pat_4_objek_pajak p4 ON p4.nobooking = p.nobooking
		LEFT JOIN pat_2_bphtb_perhitungan p2 ON p2.nobooking = p.nobooking
		WHERE p.nobooking = $1`, nobooking).Scan(&src.Userid, &src.BphtbYangtelah, &src.NomorBukti, &src.TanggalPerolehan, &src.TanggalPembayaran)

	cat := ptrString(catatan)
	noReg := ptrString(noRegistrasi)
	statusDibank := "Dicheck"
	if statusVerifikasi == "Disetujui" || statusVerifikasi == "Ditolak" {
		statusDibank = "Tercheck"
	}

	var exID int64
	err := r.pool.QueryRow(ctx, "SELECT id FROM bank_1_cek_hasil_transaksi WHERE nobooking = $1 LIMIT 1", nobooking).Scan(&exID)
	if err == nil && exID != 0 {
		_, err = r.pool.Exec(ctx, `
			UPDATE bank_1_cek_hasil_transaksi SET
				status_verifikasi = $1, catatan_bank = $2, verified_by = $3, verified_at = NOW(),
				bphtb_yangtelah_dibayar = COALESCE($4::int, bphtb_yangtelah_dibayar),
				nomor_bukti_pembayaran = COALESCE($5, nomor_bukti_pembayaran),
				tanggal_perolehan = COALESCE($6, tanggal_perolehan),
				tanggal_pembayaran = COALESCE($7, tanggal_pembayaran),
				no_registrasi = COALESCE($8, no_registrasi),
				status_dibank = $9
			WHERE nobooking = $10`,
			statusVerifikasi, cat, ptrString(verifiedByUserid),
			src.BphtbYangtelah, src.NomorBukti, src.TanggalPerolehan, src.TanggalPembayaran, noReg,
			statusDibank, nobooking)
		return err
	}
	var verifiedAt *time.Time
	if statusDibank == "Tercheck" {
		t := time.Now()
		verifiedAt = &t
	}
	_, err = r.pool.Exec(ctx, `
		INSERT INTO bank_1_cek_hasil_transaksi (nobooking, userid, bphtb_yangtelah_dibayar, nomor_bukti_pembayaran, tanggal_perolehan, tanggal_pembayaran, status_verifikasi, catatan_bank, verified_by, verified_at, no_registrasi, status_dibank)
		VALUES ($1,$2,$3::int,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
		nobooking, src.Userid, src.BphtbYangtelah, src.NomorBukti, src.TanggalPerolehan, src.TanggalPembayaran, statusVerifikasi, cat, ptrString(verifiedByUserid), verifiedAt, noReg, statusDibank)
	return err
}
