package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// PenelitiRepo handles queries for Peneliti role (p_1_verifikasi, p_3_clear_to_paraf).
type PenelitiRepo struct {
	pool *pgxpool.Pool
}

// NewPenelitiRepo creates a PenelitiRepo.
func NewPenelitiRepo(pool *pgxpool.Pool) *PenelitiRepo {
	return &PenelitiRepo{pool: pool}
}

// PenelitiBerkasFromLtbRow one row for GET /api/peneliti_get-berkas-fromltb.
type PenelitiBerkasFromLtbRow struct {
	NoRegistrasi     string  `json:"no_registrasi"`
	Nobooking        string  `json:"nobooking"`
	Trackstatus      string  `json:"trackstatus"`
	Status           string  `json:"status"`
	Noppbb           *string `json:"noppbb"`
	Namawajibpajak   *string `json:"namawajibpajak"`
	Namapemilikobjekpajak *string `json:"namapemilikobjekpajak"`
	AktaTanahPath    *string `json:"akta_tanah_path"`
	SertifikatTanahPath *string `json:"sertifikat_tanah_path"`
	PelengkapPath    *string `json:"pelengkap_path"`
	Userid           *string `json:"userid"`
	PenelitiTandaTanganPath *string `json:"peneliti_tanda_tangan_path"`
	CreatorUserid    *string `json:"creator_userid"`
	TandaParafPath   *string `json:"tanda_paraf_path"`
	SignerUserid     *string `json:"signer_userid"`
}

// GetBerkasFromLtb returns data for Peneliti "berkas dari LTB" (p_1_verifikasi + pat + bank + ltb gates).
func (r *PenelitiRepo) GetBerkasFromLtb(ctx context.Context, penelitiUserid string) ([]PenelitiBerkasFromLtbRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	q := `
		SELECT DISTINCT ON (p.no_registrasi)
			p.no_registrasi, p.nobooking, COALESCE(p.trackstatus,'') AS trackstatus, COALESCE(p.status,'') AS status,
			b.noppbb::text, b.namawajibpajak, b.namapemilikobjekpajak, b.akta_tanah_path, b.sertifikat_tanah_path, b.pelengkap_path,
			b.userid::text AS userid,
			v.tanda_tangan_path AS peneliti_tanda_tangan_path,
			creator.userid::text AS creator_userid,
			pc.tanda_paraf_path,
			au.nama AS signer_userid
		FROM p_1_verifikasi p
		LEFT JOIN pat_1_bookingsspd b ON p.nobooking = b.nobooking
		LEFT JOIN a_2_verified_users v ON v.userid = $1
		LEFT JOIN a_2_verified_users creator ON creator.userid = b.userid
		LEFT JOIN bank_1_cek_hasil_transaksi bk ON bk.nobooking = p.nobooking
		LEFT JOIN ltb_1_terima_berkas_sspd ltb ON ltb.nobooking = p.nobooking
		LEFT JOIN p_3_clear_to_paraf pc ON pc.nobooking = p.nobooking
		LEFT JOIN a_2_verified_users au ON au.tanda_tangan_path = pc.tanda_paraf_path
		WHERE p.trackstatus IN ('Dilanjutkan') AND p.status = 'Diajukan'
		  AND p.no_registrasi IS NOT NULL AND p.no_registrasi <> ''
		  AND COALESCE(ltb.status, 'Diajukan') IN ('Diajukan','Dilanjutkan','Diterima')
		  AND COALESCE(bk.status_verifikasi, 'Pending') = 'Disetujui'
		  AND COALESCE(bk.status_dibank, 'Dicheck') = 'Tercheck'
		ORDER BY p.no_registrasi ASC
		LIMIT 1000
	`
	rows, err := r.pool.Query(ctx, q, penelitiUserid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []PenelitiBerkasFromLtbRow
	for rows.Next() {
		var row PenelitiBerkasFromLtbRow
		if err := rows.Scan(&row.NoRegistrasi, &row.Nobooking, &row.Trackstatus, &row.Status,
			&row.Noppbb, &row.Namawajibpajak, &row.Namapemilikobjekpajak, &row.AktaTanahPath, &row.SertifikatTanahPath, &row.PelengkapPath,
			&row.Userid, &row.PenelitiTandaTanganPath, &row.CreatorUserid, &row.TandaParafPath, &row.SignerUserid); err != nil {
			continue
		}
		out = append(out, row)
	}
	return out, nil
}

// PenelitiBerkasTillVerifRow one row for GET /api/peneliti/get-berkas-till-verif (paraf kasie).
type PenelitiBerkasTillVerifRow struct {
	NoRegistrasi     string  `json:"no_registrasi"`
	Nobooking        string  `json:"nobooking"`
	Userid           string  `json:"userid"`
	Trackstatus      string  `json:"trackstatus"`
	Noppbb           *string `json:"noppbb"`
	Tahunajb         *string `json:"tahunajb"`
	Namawajibpajak   *string `json:"namawajibpajak"`
	Namapemilikobjekpajak *string `json:"namapemilikobjekpajak"`
	Status           string  `json:"status"`
	Persetujuan      *string `json:"persetujuan"`
	TandaParafPath   *string `json:"tanda_paraf_path"`
	TanggalMasuk     *string `json:"tanggal_masuk"`
	TandaTanganPath  *string `json:"tanda_tangan_path"`
	StempelBookingPath *string `json:"stempel_booking_path"`
	SignerUserid     *string `json:"signer_userid"`
	PemverifikasiNama *string `json:"pemverifikasi_nama"`
}

// GetBerkasTillVerif returns data for Peneliti paraf kasie (p_3_clear_to_paraf).
func (r *PenelitiRepo) GetBerkasTillVerif(ctx context.Context, penelitiUserid string) ([]PenelitiBerkasTillVerifRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	q := `
		SELECT DISTINCT ON (pc.no_registrasi)
			pc.no_registrasi, pc.nobooking, COALESCE(pc.userid,'') AS userid, COALESCE(pc.trackstatus,'') AS trackstatus,
			b.noppbb::text, b.tahunajb::text, b.namawajibpajak, b.namapemilikobjekpajak,
			COALESCE(pc.status,'') AS status,
			CASE WHEN pc.persetujuan = true THEN 'true' WHEN pc.persetujuan = false THEN 'false' ELSE COALESCE(pc.persetujuan::text,'') END AS persetujuan,
			pc.tanda_paraf_path, pc.created_at::text AS tanggal_masuk,
			v.tanda_tangan_path, pvs.stempel_booking_path, au.nama AS signer_userid,
			pemverifikasi_user.nama AS pemverifikasi_nama
		FROM p_3_clear_to_paraf pc
		LEFT JOIN pat_1_bookingsspd b ON pc.nobooking = b.nobooking
		LEFT JOIN a_2_verified_users v ON v.userid = $1
		LEFT JOIN p_2_verif_sign pvs ON pvs.nobooking = pc.nobooking
		LEFT JOIN a_2_verified_users au ON au.tanda_tangan_path = pc.tanda_paraf_path
		LEFT JOIN a_2_verified_users pemverifikasi_user ON pc.pemverifikasi = pemverifikasi_user.userid
		WHERE pc.trackstatus IN ('Diverifikasi','Diverifikasi ') AND pc.status IN ('Dikerjakan')
		ORDER BY pc.no_registrasi ASC
		LIMIT 1000
	`
	rows, err := r.pool.Query(ctx, q, penelitiUserid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []PenelitiBerkasTillVerifRow
	for rows.Next() {
		var row PenelitiBerkasTillVerifRow
		if err := rows.Scan(&row.NoRegistrasi, &row.Nobooking, &row.Userid, &row.Trackstatus,
			&row.Noppbb, &row.Tahunajb, &row.Namawajibpajak, &row.Namapemilikobjekpajak, &row.Status,
			&row.Persetujuan, &row.TandaParafPath, &row.TanggalMasuk, &row.TandaTanganPath, &row.StempelBookingPath, &row.SignerUserid, &row.PemverifikasiNama); err != nil {
			continue
		}
		out = append(out, row)
	}
	return out, nil
}
