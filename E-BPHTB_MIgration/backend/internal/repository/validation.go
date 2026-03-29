package repository

import (
	"context"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ValidationRepo handles pv_1_paraf_validate for QR validation.
type ValidationRepo struct {
	pool *pgxpool.Pool
}

// NewValidationRepo creates a ValidationRepo.
func NewValidationRepo(pool *pgxpool.Pool) *ValidationRepo {
	return &ValidationRepo{pool: pool}
}

// Pool returns the underlying pool.
func (r *ValidationRepo) Pool() *pgxpool.Pool { return r.pool }

// ValidateQRResult holds full validation data for single no_validasi.
type ValidateQRResult struct {
	NoValidasi   string
	Status       *string
	Trackstatus  *string
	StatusTertampil *string
	Keterangan   *string
	CreatedAt    interface{}
	UpdatedAt    interface{}
	BphtbYangtelahDibayar *float64
	// document_info
	Nobooking     *string
	NoRegistrasi  *string
	Noppbb        *string
	Tanggal       *string
	Tahunajb      *string
	Namawajibpajak *string
	Namapemilikobjekpajak *string
	Npwpwp        *string
	BookingTrackstatus *string
	// ppat_info
	PpatNama     *string
	PpatSpecialField *string
	PpatDivisi   *string
	// peneliti_info
	PenelitiNama *string
	PenelitiSpecialParafv *string
	PenelitiNip  *string
}

// GetByNoValidasi returns validation data for no_validasi.
func (r *ValidationRepo) GetByNoValidasi(ctx context.Context, noValidasi string) (*ValidateQRResult, error) {
	if r.pool == nil || noValidasi == "" {
		return nil, nil
	}
	q := `
		SELECT 
			pv.no_validasi, pv.status, pv.trackstatus, pv.status_tertampil, pv.keterangan,
			pv.created_at, pv.updated_at, p2.bphtb_yangtelah_dibayar,
			pb.nobooking, pv.no_registrasi, pb.noppbb, pb.tanggal::text, pb.tahunajb,
			pv.namawajibpajak, pv.namapemilikobjekpajak, pb.npwpwp, pb.trackstatus,
			vu.nama, vu.special_field, vu.divisi,
			avpv.nama, avpv.special_parafv, avpv.nip
		FROM pv_1_paraf_validate pv
		LEFT JOIN pat_1_bookingsspd pb ON pv.nobooking = pb.nobooking
		LEFT JOIN a_2_verified_users vu ON pb.userid = vu.userid
		LEFT JOIN a_2_verified_users avpv ON avpv.tanda_tangan_path = pv.tanda_tangan_validasi_path
		LEFT JOIN pat_2_bphtb_perhitungan p2 ON pv.nobooking = p2.nobooking
		WHERE pv.no_validasi = $1 LIMIT 1
	`
	var v ValidateQRResult
	err := r.pool.QueryRow(ctx, q, noValidasi).Scan(
		&v.NoValidasi, &v.Status, &v.Trackstatus, &v.StatusTertampil, &v.Keterangan,
		&v.CreatedAt, &v.UpdatedAt, &v.BphtbYangtelahDibayar,
		&v.Nobooking, &v.NoRegistrasi, &v.Noppbb, &v.Tanggal, &v.Tahunajb,
		&v.Namawajibpajak, &v.Namapemilikobjekpajak, &v.Npwpwp, &v.BookingTrackstatus,
		&v.PpatNama, &v.PpatSpecialField, &v.PpatDivisi,
		&v.PenelitiNama, &v.PenelitiSpecialParafv, &v.PenelitiNip,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &v, nil
}

// ValidateQRSearchRow holds one row for search results.
type ValidateQRSearchRow struct {
	NoValidasi    string
	Nobooking     *string
	Namawajibpajak *string
	Namapemilikobjekpajak *string
	Status        *string
	Trackstatus   *string
	StatusTertampil *string
	CreatedAt     interface{}
	UpdatedAt     interface{}
	Noppbb        *string
	Tanggal       *string
	Tahunajb      *string
	PpatNama      *string
	PpatSpecialField *string
}

// SearchResult holds search results and pagination.
type SearchResult struct {
	Rows []ValidateQRSearchRow
	Total int
}

// SearchValidations returns paginated search results.
func (r *ValidationRepo) SearchValidations(ctx context.Context, search, status string, page, limit int) (*SearchResult, error) {
	if r.pool == nil {
		return &SearchResult{Rows: []ValidateQRSearchRow{}, Total: 0}, nil
	}
	offset := (page - 1) * limit
	if offset < 0 {
		offset = 0
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	where := "1=1"
	params := []interface{}{}
	idx := 1

	if search != "" {
		where += ` AND (pv.no_validasi ILIKE $` + strconv.Itoa(idx) + ` OR pv.nobooking ILIKE $` + strconv.Itoa(idx) + ` OR pv.namawajibpajak ILIKE $` + strconv.Itoa(idx) + ` OR pv.namapemilikobjekpajak ILIKE $` + strconv.Itoa(idx) + ` OR pb.noppbb ILIKE $` + strconv.Itoa(idx) + `)`
		params = append(params, "%"+search+"%")
		idx++
	}
	if status != "" {
		where += ` AND pv.status = $` + strconv.Itoa(idx)
		params = append(params, status)
		idx++
	}

	var total int
	countQ := `SELECT COUNT(*)::int FROM pv_1_paraf_validate pv LEFT JOIN pat_1_bookingsspd pb ON pv.nobooking = pb.nobooking WHERE ` + where
	if err := r.pool.QueryRow(ctx, countQ, params...).Scan(&total); err != nil {
		return &SearchResult{Rows: []ValidateQRSearchRow{}, Total: 0}, nil
	}

	selectQ := `
		SELECT pv.no_validasi, pv.nobooking, pv.namawajibpajak, pv.namapemilikobjekpajak,
			pv.status, pv.trackstatus, pv.status_tertampil, pv.created_at, pv.updated_at,
			pb.noppbb, pb.tanggal::text, pb.tahunajb, vu.nama, vu.special_field
		FROM pv_1_paraf_validate pv
		LEFT JOIN pat_1_bookingsspd pb ON pv.nobooking = pb.nobooking
		LEFT JOIN a_2_verified_users vu ON pb.userid = vu.userid
		WHERE ` + where + ` ORDER BY pv.created_at DESC NULLS LAST LIMIT $` + strconv.Itoa(idx) + ` OFFSET $` + strconv.Itoa(idx+1)
	params = append(params, limit, offset)

	rows, qErr := r.pool.Query(ctx, selectQ, params...)
	if qErr != nil {
		return &SearchResult{Rows: []ValidateQRSearchRow{}, Total: total}, nil
	}
	defer rows.Close()

	var list []ValidateQRSearchRow
	for rows.Next() {
		var row ValidateQRSearchRow
		err := rows.Scan(
			&row.NoValidasi, &row.Nobooking, &row.Namawajibpajak, &row.Namapemilikobjekpajak,
			&row.Status, &row.Trackstatus, &row.StatusTertampil, &row.CreatedAt, &row.UpdatedAt,
			&row.Noppbb, &row.Tanggal, &row.Tahunajb, &row.PpatNama, &row.PpatSpecialField,
		)
		if err != nil {
			continue
		}
		list = append(list, row)
	}
	return &SearchResult{Rows: list, Total: total}, nil
}

// ValidasiPDFData holds all fields needed to generate the final "BUKTI VALIDASI" PDF.
// Coordinates/layout are defined in internal/pdf/generate_validasi.go.
type ValidasiPDFData struct {
	NoValidasi   string
	NoRegistrasi string

	// Booking (pat_1_bookingsspd)
	Nobooking       string
	Noppbb          string
	Namawajibpajak  string
	Npwpwp          string
	Alamatwajibpajak string
	Kodeposwp       string
	Rtrwwp          string
	Kelurahandesawp string
	Kecamatanwp     string
	Kabupatenkotawp string

	Kodeposop        string
	Trackstatus      string
	JenisPerolehan   string
	NeedsSTPD        bool

	// Objek pajak (pat_4_objek_pajak)
	Letaktanahdanbangunan string
	RtRwobjekpajak        string
	NomorSertifikat       string
	TanggalPembayaran     string
	HargaTransaksi        string
	Kelurahandesalp       string
	Kecamatanlp           string

	// NJOP (pat_5_penghitungan_njop)
	LuasTanah, NjopTanah, LuasBangunan, NjopBangunan float64

	// BPHTB (pat_2_bphtb_perhitungan)
	BphtbYangtelahDibayar float64

	// PPAT (a_2_verified_users via booking userid)
	PpatPejabatUmum string

	// Peneliti Validasi / PV
	PvNip            string
	PvSpecialParafv  string
	PvSubjectCn      string
	PvCertCreatedAtISO string
	QrPayload        string
}

// GetValidasiPDFData returns joined fields for "BUKTI VALIDASI" PDF by no_validasi.
func (r *ValidationRepo) GetValidasiPDFData(ctx context.Context, noValidasi string) (*ValidasiPDFData, error) {
	if r.pool == nil || strings.TrimSpace(noValidasi) == "" {
		return nil, nil
	}
	nv := strings.TrimSpace(noValidasi)

	q := `
		SELECT
			COALESCE(pv.no_validasi,''), COALESCE(pv.no_registrasi,''),
			COALESCE(pb.nobooking,''), COALESCE(pb.noppbb,''), COALESCE(pb.namawajibpajak,''), COALESCE(pb.npwpwp,''),
			COALESCE(pb.alamatwajibpajak,''), COALESCE(pb.kodeposwp,''), COALESCE(pb.rtrwwp,''), COALESCE(pb.kelurahandesawp,''),
			COALESCE(pb.kecamatanwp,''), COALESCE(pb.kabupatenkotawp,''),
			COALESCE(pb.kodeposop,''),
			COALESCE(pb.trackstatus,''),
			COALESCE(pb.jenisperolehan, COALESCE(o.jenis_perolehan::text,'')),
			COALESCE(pb.needs_stpd,false),
			COALESCE(o.letaktanahdanbangunan,''), COALESCE(o.rt_rwobjekpajak,''), COALESCE(o.nomor_sertifikat,''), COALESCE(o.tanggal_pembayaran::text,''),
			COALESCE(o.harga_transaksi::text,''), COALESCE(o.kelurahandesalp,''), COALESCE(o.kecamatanlp,''),
			COALESCE(pp.luas_tanah,0), COALESCE(pp.njop_tanah,0), COALESCE(pp.luas_bangunan,0), COALESCE(pp.njop_bangunan,0),
			COALESCE(bp.bphtb_yangtelah_dibayar,0),
			COALESCE(vu.pejabat_umum,''),
			COALESCE(pvu.nip,''), COALESCE(pvu.special_parafv,''), COALESCE(pc.subject_cn,''), COALESCE(pc.created_at::text,''),
			COALESCE(sr.qr_payload,'')
		FROM pv_1_paraf_validate pv
		LEFT JOIN pat_1_bookingsspd pb ON pb.nobooking = pv.nobooking
		LEFT JOIN pat_2_bphtb_perhitungan bp ON bp.nobooking = pb.nobooking
		LEFT JOIN pat_4_objek_pajak o ON o.nobooking = pb.nobooking
		LEFT JOIN pat_5_penghitungan_njop pp ON pp.nobooking = pb.nobooking
		LEFT JOIN a_2_verified_users vu ON vu.userid = pb.userid
		LEFT JOIN LATERAL (
			SELECT signer_userid, qr_payload
			FROM pv_2_signing_requests
			WHERE (no_validasi = pv.no_validasi OR nobooking = pv.nobooking)
			ORDER BY id DESC
			LIMIT 1
		) sr ON true
		LEFT JOIN a_2_verified_users pvu ON pvu.userid = sr.signer_userid
		LEFT JOIN LATERAL (
			SELECT subject_cn, created_at
			FROM pv_local_certs
			WHERE userid = sr.signer_userid AND status = 'active'
			ORDER BY valid_to DESC NULLS LAST
			LIMIT 1
		) pc ON true
		WHERE pv.no_validasi = $1
		LIMIT 1
	`

	var d ValidasiPDFData
	err := r.pool.QueryRow(ctx, q, nv).Scan(
		&d.NoValidasi, &d.NoRegistrasi,
		&d.Nobooking, &d.Noppbb, &d.Namawajibpajak, &d.Npwpwp,
		&d.Alamatwajibpajak, &d.Kodeposwp, &d.Rtrwwp, &d.Kelurahandesawp,
		&d.Kecamatanwp, &d.Kabupatenkotawp,
		&d.Kodeposop,
		&d.Trackstatus,
		&d.JenisPerolehan,
		&d.NeedsSTPD,
		&d.Letaktanahdanbangunan, &d.RtRwobjekpajak, &d.NomorSertifikat, &d.TanggalPembayaran,
		&d.HargaTransaksi, &d.Kelurahandesalp, &d.Kecamatanlp,
		&d.LuasTanah, &d.NjopTanah, &d.LuasBangunan, &d.NjopBangunan,
		&d.BphtbYangtelahDibayar,
		&d.PpatPejabatUmum,
		&d.PvNip, &d.PvSpecialParafv, &d.PvSubjectCn, &d.PvCertCreatedAtISO,
		&d.QrPayload,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	if strings.TrimSpace(d.QrPayload) != "" && !strings.Contains(d.QrPayload, "|") {
		d.QrPayload = strings.TrimSpace(d.QrPayload) + "|" + strings.TrimSpace(d.NoValidasi)
	}
	return &d, nil
}
