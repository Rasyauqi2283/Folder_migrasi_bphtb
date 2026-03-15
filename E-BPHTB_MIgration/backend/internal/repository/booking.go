package repository

import (
	"context"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// BookingRepo handles pat_1_bookingsspd and pat_2_bphtb_perhitungan operations.
type BookingRepo struct {
	pool *pgxpool.Pool
}

// NewBookingRepo creates a BookingRepo.
func NewBookingRepo(pool *pgxpool.Pool) *BookingRepo {
	return &BookingRepo{pool: pool}
}

// Pool returns the underlying pool.
func (r *BookingRepo) Pool() *pgxpool.Pool { return r.pool }

// PpatChartMonth holds monthly chart data.
type PpatChartMonth struct {
	Month           int     `json:"month"`
	MonthName       string  `json:"month_name"`
	JumlahTransaksi int     `json:"jumlah_transaksi"`
	TotalBphtb      float64 `json:"total_bphtb"`
}

// PpatChartData returns monthly data for year (12 months).
func (r *BookingRepo) PpatChartData(ctx context.Context, tahun int) ([]PpatChartMonth, float64, int, error) {
	if r.pool == nil {
		return EmptyChartData(tahun), 0, 0, nil
	}
	q := `
		SELECT 
			EXTRACT(MONTH FROM b.created_at)::int as bulan,
			COUNT(b.nobooking)::int as jumlah_transaksi,
			COALESCE(SUM(bp.bphtb_yangtelah_dibayar), 0)::float as total_bphtb
		FROM pat_1_bookingsspd b
		LEFT JOIN pat_2_bphtb_perhitungan bp ON b.nobooking = bp.nobooking
		WHERE b.trackstatus = 'Diserahkan'
		AND EXTRACT(YEAR FROM b.created_at) = $1
		GROUP BY EXTRACT(MONTH FROM b.created_at)
		ORDER BY bulan ASC
	`
	rows, err := r.pool.Query(ctx, q, tahun)
	if err != nil {
		return EmptyChartData(tahun), 0, 0, nil
	}
	defer rows.Close()

	data := EmptyChartData(tahun)
	var totalTransaksi int
	var totalBphtb float64

	for rows.Next() {
		var bulan int
		var jml int
		var bphtb float64
		if err := rows.Scan(&bulan, &jml, &bphtb); err != nil {
			continue
		}
		idx := bulan - 1
		if idx >= 0 && idx < 12 {
			data[idx].JumlahTransaksi = jml
			data[idx].TotalBphtb = bphtb
			totalTransaksi += jml
			totalBphtb += bphtb
		}
	}
	return data, totalBphtb, totalTransaksi, nil
}

// EmptyChartData returns empty 12-month chart data for a year.
func EmptyChartData(tahun int) []PpatChartMonth {
	months := []string{"Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"}
	out := make([]PpatChartMonth, 12)
	for i := 0; i < 12; i++ {
		out[i] = PpatChartMonth{
			Month:           i + 1,
			MonthName:       months[i],
			JumlahTransaksi: 0,
			TotalBphtb:      0,
		}
	}
	return out
}

// PpatRenewalRow holds PPAT renewal summary per user.
type PpatRenewalRow struct {
	Userid         string  `json:"userid"`
	UserNama       string  `json:"user_nama"`
	Divisi         string  `json:"divisi"`
	PpatKhusus     string  `json:"ppat_khusus"`
	SpecialField   string  `json:"special_field"`
	TotalNilaiBphtb float64 `json:"total_nilai_bphtb"`
	TotalBooking   int     `json:"total_booking"`
}

// PpatRenewalResult holds paginated renewal data and total.
type PpatRenewalResult struct {
	Rows    []PpatRenewalRow
	Total   int
	SumBphtb float64
}

// ListPpatRenewal returns PPAT renewal users with pagination.
func (r *BookingRepo) ListPpatRenewal(ctx context.Context, page, limit int, search string, tahun int, jangkaWaktu string, startDate, endDate time.Time) (*PpatRenewalResult, error) {
	if r.pool == nil {
		return &PpatRenewalResult{Rows: []PpatRenewalRow{}, Total: 0, SumBphtb: 0}, nil
	}
	offset := (page - 1) * limit
	if offset < 0 {
		offset = 0
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 200 {
		limit = 200
	}
	_ = jangkaWaktu
	_ = tahun

	where := `b.trackstatus = 'Diserahkan' AND b.created_at >= $1 AND b.created_at <= $2`
	params := []interface{}{startDate, endDate}
	idx := 3
	if search != "" {
		where += ` AND (b.userid ILIKE $` + strconv.Itoa(idx) + ` OR vu.ppat_khusus::text ILIKE $` + strconv.Itoa(idx) + ` OR vu.nama ILIKE $` + strconv.Itoa(idx) + ` OR vu.special_field ILIKE $` + strconv.Itoa(idx) + `)`
		params = append(params, "%"+search+"%")
		idx++
	}

	countQ := `
		SELECT COUNT(DISTINCT b.userid)::int FROM pat_1_bookingsspd b
		LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
		WHERE ` + where
	var total int
	err := r.pool.QueryRow(ctx, countQ, params...).Scan(&total)
	if err != nil {
		return &PpatRenewalResult{Rows: []PpatRenewalRow{}, Total: 0, SumBphtb: 0}, nil
	}

	sumQ := `
		SELECT COALESCE(SUM(bp.bphtb_yangtelah_dibayar), 0)::float FROM pat_1_bookingsspd b
		LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
		LEFT JOIN pat_2_bphtb_perhitungan bp ON b.nobooking = bp.nobooking
		WHERE ` + where
	var sumBphtb float64
	_ = r.pool.QueryRow(ctx, sumQ, params...).Scan(&sumBphtb)

	selectQ := `
		SELECT b.userid, vu.nama, vu.divisi, COALESCE(vu.ppat_khusus::text,'-'), COALESCE(vu.special_field,'-'),
			COALESCE(SUM(bp.bphtb_yangtelah_dibayar), 0)::float, COUNT(b.nobooking)::int
		FROM pat_1_bookingsspd b
		LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
		LEFT JOIN pat_2_bphtb_perhitungan bp ON b.nobooking = bp.nobooking
		WHERE ` + where + `
		GROUP BY b.userid, vu.nama, vu.divisi, vu.ppat_khusus, vu.special_field
		ORDER BY 6 DESC, vu.nama ASC
		LIMIT $` + strconv.Itoa(idx) + ` OFFSET $` + strconv.Itoa(idx+1)
	params = append(params, limit, offset)
	rows, err := r.pool.Query(ctx, selectQ, params...)
	if err != nil {
		return &PpatRenewalResult{Rows: []PpatRenewalRow{}, Total: total, SumBphtb: sumBphtb}, nil
	}
	defer rows.Close()

	var list []PpatRenewalRow
	for rows.Next() {
		var row PpatRenewalRow
		var pk, sf *string
		if err := rows.Scan(&row.Userid, &row.UserNama, &row.Divisi, &pk, &sf, &row.TotalNilaiBphtb, &row.TotalBooking); err != nil {
			continue
		}
		if pk != nil {
			row.PpatKhusus = *pk
		} else {
			row.PpatKhusus = "-"
		}
		if sf != nil {
			row.SpecialField = *sf
		} else {
			row.SpecialField = "-"
		}
		list = append(list, row)
	}
	return &PpatRenewalResult{Rows: list, Total: total, SumBphtb: sumBphtb}, nil
}

// DiserahkanUser holds user info for diserahkan response.
type DiserahkanUser struct {
	ID          int     `json:"id"`
	Userid      string  `json:"userid"`
	Nama        string  `json:"nama"`
	Divisi      string  `json:"divisi"`
	PpatKhusus  *string `json:"ppat_khusus"`
	SpecialField *string `json:"special_field"`
	PejabatUmum *string `json:"pejabat_umum"`
	Fotoprofil  *string `json:"fotoprofil"`
}

// DiserahkanRow holds one booking row.
type DiserahkanRow struct {
	Nobooking           string   `json:"nobooking"`
	Tanggal             *string  `json:"tanggal"`
	Noppbb              *string  `json:"noppbb"`
	JenisWajibPajak     *string  `json:"jenis_wajib_pajak"`
	BphtbYangtelahDibayar *float64 `json:"bphtb_yangtelah_dibayar"`
	Namawajibpajak      *string  `json:"namawajibpajak"`
}

// GetDiserahkan returns user + rows + summary for /api/admin/ppat/user/{userid}/diserahkan.
func (r *BookingRepo) GetDiserahkan(ctx context.Context, userid string) (user *DiserahkanUser, rows []DiserahkanRow, totalBooking int, totalNilai float64, err error) {
	if r.pool == nil || userid == "" {
		return nil, nil, 0, 0, nil
	}
	var totalNilaiSum float64
	// Get user
	var u DiserahkanUser
	err = r.pool.QueryRow(ctx,
		`SELECT id, userid, nama, divisi, ppat_khusus, special_field, pejabat_umum, fotoprofil
		 FROM a_2_verified_users WHERE userid = $1 LIMIT 1`, userid,
	).Scan(&u.ID, &u.Userid, &u.Nama, &u.Divisi, &u.PpatKhusus, &u.SpecialField, &u.PejabatUmum, &u.Fotoprofil)
	if err != nil {
		return nil, nil, 0, 0, err
	}
	user = &u

	// Get bookings
	q := `
		SELECT b.nobooking, b.tanggal::text, b.noppbb, b.jenis_wajib_pajak, p2.bphtb_yangtelah_dibayar, b.namawajibpajak
		FROM pat_1_bookingsspd b
		LEFT JOIN pat_2_bphtb_perhitungan p2 ON b.nobooking = p2.nobooking
		WHERE b.userid = $1 AND b.trackstatus = 'Diserahkan'
		ORDER BY b.tanggal DESC NULLS LAST, b.nobooking
	`
	bookRows, err := r.pool.Query(ctx, q, userid)
	if err != nil {
		return user, nil, 0, 0, nil
	}
	defer bookRows.Close()

	for bookRows.Next() {
		var row DiserahkanRow
		var tanggal, noppbb, jwp, nama *string
		var bphtb *float64
		if err := bookRows.Scan(&row.Nobooking, &tanggal, &noppbb, &jwp, &bphtb, &nama); err != nil {
			continue
		}
		row.Tanggal = tanggal
		row.Noppbb = noppbb
		row.JenisWajibPajak = jwp
		row.BphtbYangtelahDibayar = bphtb
		row.Namawajibpajak = nama
		rows = append(rows, row)
		totalBooking++
		if bphtb != nil {
			totalNilaiSum += *bphtb
		}
	}
	return user, rows, totalBooking, totalNilaiSum, nil
}

// SSPDPDFData holds all data needed to generate SSPD BPHTB PDF (booking badan).
type SSPDPDFData struct {
	Nobooking, Noppbb, Userid, JenisWajibPajak, Namawajibpajak, Alamatwajibpajak string
	Namapemilikobjekpajak, Alamatpemilikobjekpajak, Tanggal, Tahunajb             string
	Kabupatenkotawp, Kecamatanwp, Kelurahandesawp, Rtrwwp, Npwpwp, Kodeposwp    string
	Kabupatenkotaop, Kecamatanop, Kelurahandesaop, Rtrwop, Npwpop, Kodeposop      string
	Trackstatus                                                                   string
	Nilaiperolehanobjekpajaktidakkenapajak, BphtbYangtelahDibayar                float64
	HargaTransaksi, Letaktanahdanbangunan, RtRwobjekpajak, StatusKepemilikan     string
	Keterangan, NomorSertifikat, TanggalPerolehan, TanggalPembayaran             string
	NomorBuktiPembayaran                                                          string
	NamaPembuat, SpecialField, TandaTanganPath                                    string
	LuasTanah, NjopTanah, LuasBangunan, NjopBangunan                              float64
	LuasxnjopTanah, LuasxnjopBangunan, TotalNjoppbb                               float64
	PathTtdWp                                                                     string
}

// GetBookingForSSPDPDF returns data for generating SSPD PDF (Badan) by userid and nobooking.
func (r *BookingRepo) GetBookingForSSPDPDF(ctx context.Context, userid, nobooking string) (*SSPDPDFData, error) {
	if r.pool == nil {
		return nil, nil
	}
	q := `
		SELECT pb.nobooking, pb.noppbb, pb.userid, COALESCE(pb.jenis_wajib_pajak::text, 'Badan Usaha'), pb.namawajibpajak, COALESCE(pb.alamatwajibpajak,''),
			COALESCE(pb.namapemilikobjekpajak,''), COALESCE(pb.alamatpemilikobjekpajak,''), COALESCE(pb.tanggal::text,''), COALESCE(pb.tahunajb::text,''),
			COALESCE(pb.kabupatenkotawp,''), COALESCE(pb.kecamatanwp,''), COALESCE(pb.kelurahandesawp,''), COALESCE(pb.rtrwwp,''),
			COALESCE(pb.npwpwp,''), COALESCE(pb.kodeposwp,''), COALESCE(pb.kabupatenkotaop,''), COALESCE(pb.kecamatanop,''),
			COALESCE(pb.kelurahandesaop,''), COALESCE(pb.rtrwop,''), COALESCE(pb.npwpop,''), COALESCE(pb.kodeposop,''),
			COALESCE(pb.trackstatus,''),
			COALESCE(bp.nilaiperolehanobjekpajaktidakkenapajak,0), COALESCE(bp.bphtb_yangtelah_dibayar,0),
			COALESCE(o.harga_transaksi::text,''), COALESCE(o.letaktanahdanbangunan,''), COALESCE(o.rt_rwobjekpajak,''), COALESCE(o.status_kepemilikan,''),
			COALESCE(o.keterangan,''), COALESCE(o.nomor_sertifikat,''), COALESCE(o.tanggal_perolehan::text,''), COALESCE(o.tanggal_pembayaran::text,''),
			COALESCE(o.nomor_bukti_pembayaran,''),
			COALESCE(vb.nama,''), COALESCE(vb.special_field,''), COALESCE(vb.tanda_tangan_path,''),
			COALESCE(pp.luas_tanah,0), COALESCE(pp.njop_tanah,0), COALESCE(pp.luas_bangunan,0), COALESCE(pp.njop_bangunan,0),
			COALESCE(pp.luasxnjop_tanah,0), COALESCE(pp.luasxnjop_bangunan,0), COALESCE(pp.total_njoppbb,0),
			COALESCE(ps.path_ttd_wp,'')
		FROM pat_1_bookingsspd pb
		LEFT JOIN pat_2_bphtb_perhitungan bp ON pb.nobooking = bp.nobooking
		LEFT JOIN pat_4_objek_pajak o ON pb.nobooking = o.nobooking
		LEFT JOIN a_2_verified_users vb ON pb.userid = vb.userid
		LEFT JOIN pat_5_penghitungan_njop pp ON pb.nobooking = pp.nobooking
		LEFT JOIN pat_6_sign ps ON pb.nobooking = ps.nobooking
		WHERE pb.userid = $1 AND pb.nobooking = $2
	`
	var d SSPDPDFData
	err := r.pool.QueryRow(ctx, q, userid, nobooking).Scan(
		&d.Nobooking, &d.Noppbb, &d.Userid, &d.JenisWajibPajak, &d.Namawajibpajak, &d.Alamatwajibpajak,
		&d.Namapemilikobjekpajak, &d.Alamatpemilikobjekpajak, &d.Tanggal, &d.Tahunajb,
		&d.Kabupatenkotawp, &d.Kecamatanwp, &d.Kelurahandesawp, &d.Rtrwwp, &d.Npwpwp, &d.Kodeposwp,
		&d.Kabupatenkotaop, &d.Kecamatanop, &d.Kelurahandesaop, &d.Rtrwop, &d.Npwpop, &d.Kodeposop,
		&d.Trackstatus,
		&d.Nilaiperolehanobjekpajaktidakkenapajak, &d.BphtbYangtelahDibayar,
		&d.HargaTransaksi, &d.Letaktanahdanbangunan, &d.RtRwobjekpajak, &d.StatusKepemilikan,
		&d.Keterangan, &d.NomorSertifikat, &d.TanggalPerolehan, &d.TanggalPembayaran,
		&d.NomorBuktiPembayaran,
		&d.NamaPembuat, &d.SpecialField, &d.TandaTanganPath,
		&d.LuasTanah, &d.NjopTanah, &d.LuasBangunan, &d.NjopBangunan,
		&d.LuasxnjopTanah, &d.LuasxnjopBangunan, &d.TotalNjoppbb,
		&d.PathTtdWp,
	)
	if err != nil {
		return nil, err
	}
	return &d, nil
}

// MohonValidasiPDFData holds data for Permohonan Validasi PDF.
type MohonValidasiPDFData struct {
	Nobooking, Tanggal, Namawajibpajak, Alamatwajibpajak, Kelurahandesawp, Kecamatanwp, Kabupatenkotawp string
	Noppbb, Namapemilikobjekpajak                                                                        string
	NamaPembuat, Telepon, SpecialField                                                                   string
	Letaktanahdanbangunan, Keterangan                                                                      string
	LuasTanah, LuasBangunan                                                                               float64
	AlamatPemohon, Kampungop, Kelurahanop, Kecamatanopj                                                    string
	NamaPengirim                                                                                          string
	TandaTanganPath                                                                                       string
}

// GetBookingForMohonValidasiPDF returns data for Permohonan Validasi PDF.
func (r *BookingRepo) GetBookingForMohonValidasiPDF(ctx context.Context, userid, nobooking string) (*MohonValidasiPDFData, error) {
	if r.pool == nil {
		return nil, nil
	}
	q := `
		SELECT COALESCE(pb.nobooking,''), COALESCE(pb.tanggal::text,''), COALESCE(pb.namawajibpajak,''), COALESCE(pb.alamatwajibpajak,''),
			COALESCE(pb.kelurahandesawp,''), COALESCE(pb.kecamatanwp,''), COALESCE(pb.kabupatenkotawp,''),
			COALESCE(pb.noppbb,''), COALESCE(pb.namapemilikobjekpajak,''),
			COALESCE(vu.nama,''), COALESCE(vu.telepon::text,''), COALESCE(vu.special_field,''),
			COALESCE(po.letaktanahdanbangunan,''), COALESCE(po.keterangan,''),
			COALESCE(pp.luas_tanah,0), COALESCE(pp.luas_bangunan,0),
			COALESCE(vt.alamat_pemohon,''), COALESCE(vt.kampungop,''), COALESCE(vt.kelurahanop,''), COALESCE(vt.kecamatanopj,''),
			COALESCE(pv.nama_pengirim,''), COALESCE(vu.tanda_tangan_path,'')
		FROM pat_1_bookingsspd pb
		LEFT JOIN a_2_verified_users vu ON vu.userid = pb.userid
		LEFT JOIN pat_4_objek_pajak po ON pb.nobooking = po.nobooking
		LEFT JOIN pat_5_penghitungan_njop pp ON pb.nobooking = pp.nobooking
		LEFT JOIN pat_8_validasi_tambahan vt ON pb.nobooking = vt.nobooking
		LEFT JOIN p_1_verifikasi pv ON pb.nobooking = pv.nobooking
		LEFT JOIN pat_6_sign ps ON pb.nobooking = ps.nobooking
		WHERE pb.userid = $1 AND pb.nobooking = $2
	`
	var d MohonValidasiPDFData
	err := r.pool.QueryRow(ctx, q, userid, nobooking).Scan(
		&d.Nobooking, &d.Tanggal, &d.Namawajibpajak, &d.Alamatwajibpajak, &d.Kelurahandesawp, &d.Kecamatanwp, &d.Kabupatenkotawp,
		&d.Noppbb, &d.Namapemilikobjekpajak,
		&d.NamaPembuat, &d.Telepon, &d.SpecialField,
		&d.Letaktanahdanbangunan, &d.Keterangan,
		&d.LuasTanah, &d.LuasBangunan,
		&d.AlamatPemohon, &d.Kampungop, &d.Kelurahanop, &d.Kecamatanopj,
		&d.NamaPengirim, &d.TandaTanganPath,
	)
	if err != nil {
		return nil, err
	}
	return &d, nil
}
