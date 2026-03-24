package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

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
	ID                     int64   `json:"id"`
	Nobooking              string  `json:"nobooking"`
	Namawajibpajak         string  `json:"namawajibpajak"`
	NomorBuktiPembayaran   *string `json:"nomor_bukti_pembayaran"`
	Nominal                *float64 `json:"nominal"`
	TanggalPembayaran      *string `json:"tanggal_pembayaran"`
	StatusVerifikasi       string  `json:"status_verifikasi"`
	StatusDibank           string  `json:"status_dibank"`
	CatatanBank            *string `json:"catatan_bank"`
	NoRegistrasi           *string `json:"no_registrasi"`
}

// BankTransaksiList returns paginated list with tab (pending/reviewed), status filter, search.
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

	if tab == "pending" {
		where = append(where, "COALESCE(bk.status_verifikasi, 'Pending') = 'Pending'")
		where = append(where, "COALESCE(bk.status_dibank, 'Dicheck') = 'Dicheck'")
	} else if tab == "reviewed" {
		where = append(where, "COALESCE(bk.status_verifikasi, 'Pending') IN ('Disetujui', 'Ditolak')")
		where = append(where, "COALESCE(bk.status_dibank, 'Dicheck') = 'Tercheck'")
	}
	if statusFilter != "" {
		where = append(where, fmt.Sprintf("COALESCE(bk.status_verifikasi, 'Pending') = $%d", argIdx))
		args = append(args, statusFilter)
		argIdx++
	}
	if search != "" {
		where = append(where, fmt.Sprintf(`(lower(bk.nobooking) LIKE $%d OR lower(p.namawajibpajak) LIKE $%d OR lower(COALESCE(bk.nomor_bukti_pembayaran, p4.nomor_bukti_pembayaran)::text) LIKE $%d OR lower(l.no_registrasi) LIKE $%d)`, argIdx, argIdx, argIdx, argIdx))
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
		SELECT DISTINCT ON (bk.id) bk.id, bk.nobooking, COALESCE(p.namawajibpajak, '') AS namawajibpajak,
			COALESCE(bk.nomor_bukti_pembayaran, p4.nomor_bukti_pembayaran) AS nomor_bukti_pembayaran,
			COALESCE(bk.bphtb_yangtelah_dibayar, p2.bphtb_yangtelah_dibayar)::float8 AS nominal,
			COALESCE(bk.tanggal_pembayaran, p4.tanggal_pembayaran) AS tanggal_pembayaran,
			COALESCE(bk.status_verifikasi, 'Pending') AS status_verifikasi,
			COALESCE(bk.status_dibank, 'Dicheck') AS status_dibank,
			bk.catatan_bank, l.no_registrasi
		FROM bank_1_cek_hasil_transaksi bk
		LEFT JOIN pat_1_bookingsspd p ON p.nobooking = bk.nobooking
		LEFT JOIN pat_2_bphtb_perhitungan p2 ON p2.nobooking = bk.nobooking
		LEFT JOIN pat_4_objek_pajak p4 ON p4.nobooking = bk.nobooking
		LEFT JOIN ltb_1_terima_berkas_sspd l ON l.nobooking = bk.nobooking
		%s
		ORDER BY bk.id DESC, p2.calculationid DESC NULLS LAST
		LIMIT %d OFFSET %d`, whereClause, limit, offset)
	rowsResult, err := r.pool.Query(ctx, listSQL, args...)
	if err != nil {
		return nil, 0, 0, err
	}
	defer rowsResult.Close()

	for rowsResult.Next() {
		var row BankTransaksiRow
		if err := rowsResult.Scan(&row.ID, &row.Nobooking, &row.Namawajibpajak,
			&row.NomorBuktiPembayaran, &row.Nominal, &row.TanggalPembayaran,
			&row.StatusVerifikasi, &row.StatusDibank, &row.CatatanBank, &row.NoRegistrasi); err != nil {
			continue
		}
		rows = append(rows, row)
	}
	return rows, total, totalPages, nil
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
