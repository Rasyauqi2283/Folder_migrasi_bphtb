package repository

import (
	"context"
	"fmt"
	"strings"

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
	Pemilihan        *string `json:"pemilihan"`
	NomorStpd        *string `json:"nomorstpd"`
	TanggalStpd      *string `json:"tanggalstpd"`
	AngkaPersen      *string `json:"angkapersen"`
	KeteranganSendiri *string `json:"keterangandihitungsendiri"`
	KeteranganLainnya *string `json:"isiketeranganlainnya"`
	Persetujuan      *string `json:"persetujuan"`
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
			au.nama AS signer_userid,
			p.pemilihan, p.nomorstpd, p.tanggalstpd::text, p.angkapersen::text, p.keterangandihitungsendiri, p.isiketeranganlainnya, p.persetujuan
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
			&row.Userid, &row.PenelitiTandaTanganPath, &row.CreatorUserid, &row.TandaParafPath, &row.SignerUserid,
			&row.Pemilihan, &row.NomorStpd, &row.TanggalStpd, &row.AngkaPersen, &row.KeteranganSendiri, &row.KeteranganLainnya, &row.Persetujuan); err != nil {
			continue
		}
		out = append(out, row)
	}
	return out, nil
}

type PenelitiVerificationUpdateInput struct {
	Nobooking                 string
	Pemilihan                 string
	NomorSTPD                 *string
	TanggalSTPD               *string
	AngkaPersen               *float64
	KeteranganDihitungSendiri *string
	IsiKeteranganLainnya      *string
	PersetujuanVerif          bool
}

func (r *PenelitiRepo) SaveVerificationByPemilihan(ctx context.Context, penelitiUserid string, in PenelitiVerificationUpdateInput) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	valid := map[string]bool{
		"penghitung_wajib_pajak": true,
		"stpd_kurangbayar":       true,
		"dihitungsendiri":        true,
		"lainnyapenghitungwp":    true,
	}
	if !valid[in.Pemilihan] {
		return fmt.Errorf("jenis pemilihan tidak valid")
	}
	if in.Pemilihan == "stpd_kurangbayar" && (in.NomorSTPD == nil || strings.TrimSpace(*in.NomorSTPD) == "" || in.TanggalSTPD == nil || strings.TrimSpace(*in.TanggalSTPD) == "") {
		return fmt.Errorf("nomor dan tanggal STPD wajib diisi")
	}
	if in.Pemilihan == "dihitungsendiri" && (in.AngkaPersen == nil || *in.AngkaPersen < 0 || *in.AngkaPersen > 100 || in.KeteranganDihitungSendiri == nil || strings.TrimSpace(*in.KeteranganDihitungSendiri) == "") {
		return fmt.Errorf("persentase 0-100 dan keterangan wajib diisi")
	}
	if in.Pemilihan == "lainnyapenghitungwp" && (in.IsiKeteranganLainnya == nil || strings.TrimSpace(*in.IsiKeteranganLainnya) == "") {
		return fmt.Errorf("keterangan lainnya wajib diisi")
	}

	var ttdPath, ttdMime *string
	_ = r.pool.QueryRow(ctx, `SELECT tanda_tangan_path, tanda_tangan_mime FROM a_2_verified_users WHERE userid = $1`, penelitiUserid).Scan(&ttdPath, &ttdMime)
	persetujuanText := "false"
	if in.PersetujuanVerif {
		persetujuanText = "true"
	}

	tag, err := r.pool.Exec(ctx, `
		UPDATE p_1_verifikasi
		SET
			pemilihan = $1,
			nomorstpd = $2,
			tanggalstpd = $3::date,
			angkapersen = $4,
			keterangandihitungsendiri = $5,
			isiketeranganlainnya = $6,
			persetujuan = $7,
			nama_pengirim = $8,
			tanda_tangan_path = COALESCE($9, tanda_tangan_path),
			ttd_peneliti_mime = COALESCE($10, ttd_peneliti_mime)
		WHERE nobooking = $11
	`, in.Pemilihan, in.NomorSTPD, in.TanggalSTPD, in.AngkaPersen, in.KeteranganDihitungSendiri, in.IsiKeteranganLainnya, persetujuanText, penelitiUserid, ttdPath, ttdMime, in.Nobooking)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("data tidak ditemukan")
	}
	return nil
}

func (r *PenelitiRepo) SendToParaf(ctx context.Context, penelitiUserid, nobooking string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var pemilihan, persetujuan *string
	var noReg *string
	var creatorUserid, namaWP, namaOP, pengirimLTB string
	err = tx.QueryRow(ctx, `
		SELECT
			p.pemilihan, p.persetujuan, p.no_registrasi,
			COALESCE(b.userid, ''),
			COALESCE(p.namawajibpajak, ''),
			COALESCE(p.namapemilikobjekpajak, ''),
			COALESCE(p.pengirim_ltb, '')
		FROM p_1_verifikasi p
		LEFT JOIN pat_1_bookingsspd b ON b.nobooking = p.nobooking
		WHERE p.nobooking = $1
		FOR UPDATE OF p
	`, nobooking).Scan(&pemilihan, &persetujuan, &noReg, &creatorUserid, &namaWP, &namaOP, &pengirimLTB)
	if err != nil {
		return err
	}
	if pemilihan == nil || strings.TrimSpace(*pemilihan) == "" {
		return fmt.Errorf("data verifikasi belum lengkap: pemilihan wajib diisi")
	}
	if persetujuan == nil || strings.ToLower(strings.TrimSpace(*persetujuan)) != "true" {
		return fmt.Errorf("data verifikasi belum lengkap: persetujuan wajib")
	}

	if _, err = tx.Exec(ctx, `UPDATE p_1_verifikasi SET trackstatus='Diverifikasi', status='Dikerjakan' WHERE nobooking = $1`, nobooking); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `UPDATE pat_1_bookingsspd SET trackstatus='Diverifikasi', updated_at=NOW() WHERE nobooking = $1`, nobooking); err != nil {
		return err
	}

	tag, err := tx.Exec(ctx, `
		UPDATE p_3_clear_to_paraf
		SET userid = $2, namawajibpajak = $3, namapemilikobjekpajak = $4, status = 'Dikerjakan', trackstatus = 'Diverifikasi', keterangan = $5, no_registrasi = $6, pemverifikasi = $7
		WHERE nobooking = $1
	`, nobooking, creatorUserid, namaWP, namaOP, pengirimLTB, noReg, penelitiUserid)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		_, err = tx.Exec(ctx, `
			INSERT INTO p_3_clear_to_paraf (nobooking, userid, namawajibpajak, namapemilikobjekpajak, status, trackstatus, keterangan, no_registrasi, pemverifikasi)
			VALUES ($1,$2,$3,$4,'Dikerjakan','Diverifikasi',$5,$6,$7)
		`, nobooking, creatorUserid, namaWP, namaOP, pengirimLTB, noReg, penelitiUserid)
		if err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}

func (r *PenelitiRepo) RejectWithReason(ctx context.Context, nobooking, reason string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	if _, err = tx.Exec(ctx, `UPDATE p_1_verifikasi SET status='Ditolak', trackstatus='Ditolak', isiketeranganlainnya = COALESCE($2, isiketeranganlainnya) WHERE nobooking = $1`, nobooking, reason); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `UPDATE ltb_1_terima_berkas_sspd SET status='Ditolak', trackstatus='Ditolak', updated_at=NOW() WHERE nobooking = $1`, nobooking); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `UPDATE pat_1_bookingsspd SET trackstatus='Ditolak', updated_at=NOW() WHERE nobooking = $1`, nobooking); err != nil {
		return err
	}
	return tx.Commit(ctx)
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
