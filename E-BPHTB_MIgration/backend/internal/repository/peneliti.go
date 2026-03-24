package repository

import (
	"crypto/rand"
	"context"
	"fmt"
	"math/big"
	"strings"
	"time"

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
	Pemverifikasi    *string `json:"pemverifikasi"`
	PemverifikasiNama *string `json:"pemverifikasi_nama"`
	Pemparaf         *string `json:"pemparaf"`
	PemparafNama     *string `json:"pemparaf_nama"`
	Pemilihan        *string `json:"pemilihan"`
	NomorStpd        *string `json:"nomorstpd"`
	TanggalStpd      *string `json:"tanggalstpd"`
	AngkaPersen      *string `json:"angkapersen"`
	KeteranganSendiri *string `json:"keterangandihitungsendiri"`
	KeteranganLainnya *string `json:"isiketeranganlainnya"`
	Persetujuan      *string `json:"persetujuan"`
	LockedByUserID   *string `json:"locked_by_user_id"`
	LockedByNama     *string `json:"locked_by_nama"`
	LockedAt         *string `json:"locked_at"`
	VerifiedAt       *string `json:"verified_at"`
	VerifiedBy       *string `json:"verified_by"`
	VerifiedByNama   *string `json:"verified_by_nama"`
}

type RejectionEmailInfo struct {
	Nobooking   string
	ToEmail     string
	ToName      string
	CreatorName string
}

func jakartaNow() time.Time {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return time.Now().UTC().Add(7 * time.Hour)
	}
	return time.Now().In(loc)
}

func randomAlphaNum(n int) (string, error) {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var b strings.Builder
	b.Grow(n)
	max := big.NewInt(int64(len(chars)))
	for i := 0; i < n; i++ {
		v, err := rand.Int(rand.Reader, max)
		if err != nil {
			return "", err
		}
		b.WriteByte(chars[v.Int64()])
	}
	return b.String(), nil
}

func suffixFromUser(userid string) string {
	up := strings.ToUpper(strings.TrimSpace(userid))
	var out strings.Builder
	for _, r := range up {
		if (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
			out.WriteRune(r)
		}
		if out.Len() >= 3 {
			break
		}
	}
	for out.Len() < 3 {
		out.WriteByte('X')
	}
	return out.String()
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
			pc.pemverifikasi,
			pemverif_user.nama AS pemverifikasi_nama,
			pv1.pemparaf,
			pemparaf_user.nama AS pemparaf_nama,
			p.pemilihan, p.nomorstpd, p.tanggalstpd::text, p.angkapersen::text, p.keterangandihitungsendiri, p.isiketeranganlainnya, p.persetujuan,
			p.locked_by_user_id, p.locked_by_nama,
			CASE WHEN p.locked_at IS NULL THEN NULL ELSE to_char((p.locked_at AT TIME ZONE 'Asia/Jakarta'), 'YYYY-MM-DD HH24:MI:SS') || ' WIB' END AS locked_at_wib,
			CASE WHEN p.verified_at IS NULL THEN NULL ELSE to_char((p.verified_at AT TIME ZONE 'Asia/Jakarta'), 'YYYY-MM-DD HH24:MI:SS') || ' WIB' END AS verified_at_wib,
			p.verified_by, p.verified_by_nama
		FROM p_1_verifikasi p
		LEFT JOIN pat_1_bookingsspd b ON p.nobooking = b.nobooking
		LEFT JOIN a_2_verified_users v ON v.userid = $1
		LEFT JOIN a_2_verified_users creator ON creator.userid = b.userid
		LEFT JOIN bank_1_cek_hasil_transaksi bk ON bk.nobooking = p.nobooking
		LEFT JOIN ltb_1_terima_berkas_sspd ltb ON ltb.nobooking = p.nobooking
		LEFT JOIN p_3_clear_to_paraf pc ON pc.nobooking = p.nobooking
		LEFT JOIN a_2_verified_users au ON au.tanda_tangan_path = pc.tanda_paraf_path
		LEFT JOIN a_2_verified_users pemverif_user ON pemverif_user.userid = pc.pemverifikasi
		LEFT JOIN pv_1_paraf_validate pv1 ON pv1.nobooking = p.nobooking
		LEFT JOIN a_2_verified_users pemparaf_user ON pemparaf_user.userid = pv1.pemparaf
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
			&row.Userid, &row.PenelitiTandaTanganPath, &row.CreatorUserid, &row.TandaParafPath, &row.SignerUserid, &row.Pemverifikasi, &row.PemverifikasiNama, &row.Pemparaf, &row.PemparafNama,
			&row.Pemilihan, &row.NomorStpd, &row.TanggalStpd, &row.AngkaPersen, &row.KeteranganSendiri, &row.KeteranganLainnya, &row.Persetujuan,
			&row.LockedByUserID, &row.LockedByNama, &row.LockedAt, &row.VerifiedAt, &row.VerifiedBy, &row.VerifiedByNama); err != nil {
			continue
		}
		out = append(out, row)
	}
	return out, nil
}

func (r *PenelitiRepo) LockDocument(ctx context.Context, nobooking, userid, nama string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	var currentLock *string
	err := r.pool.QueryRow(ctx, `SELECT locked_by_user_id FROM p_1_verifikasi WHERE nobooking = $1`, nobooking).Scan(&currentLock)
	if err != nil {
		return err
	}
	if currentLock != nil && strings.TrimSpace(*currentLock) != "" && strings.TrimSpace(*currentLock) != strings.TrimSpace(userid) {
		return fmt.Errorf("dokumen sedang diperiksa oleh user lain")
	}
	tag, err := r.pool.Exec(ctx, `
		UPDATE p_1_verifikasi
		SET locked_by_user_id = $2, locked_by_nama = $3, locked_at = $4
		WHERE nobooking = $1
	`, nobooking, userid, nama, jakartaNow())
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("data tidak ditemukan")
	}
	return nil
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
	penelitiNama := penelitiUserid
	_ = r.pool.QueryRow(ctx, `SELECT COALESCE(nama,'') FROM a_2_verified_users WHERE userid = $1`, penelitiUserid).Scan(&penelitiNama)
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
			ttd_peneliti_mime = COALESCE($10, ttd_peneliti_mime),
			verified_at = $12,
			verified_by = $8,
			verified_by_nama = $13,
			locked_at = $12
		WHERE nobooking = $11
		  AND (COALESCE(locked_by_user_id, '') = '' OR locked_by_user_id = $8)
	`, in.Pemilihan, in.NomorSTPD, in.TanggalSTPD, in.AngkaPersen, in.KeteranganDihitungSendiri, in.IsiKeteranganLainnya, persetujuanText, penelitiUserid, ttdPath, ttdMime, in.Nobooking, jakartaNow(), penelitiNama)
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

	var pemilihan, persetujuan, lockedBy *string
	var noReg *string
	var creatorUserid, namaWP, namaOP, pengirimLTB string
	err = tx.QueryRow(ctx, `
		SELECT
			p.pemilihan, p.persetujuan, p.no_registrasi, p.locked_by_user_id,
			COALESCE(b.userid, ''),
			COALESCE(p.namawajibpajak, ''),
			COALESCE(p.namapemilikobjekpajak, ''),
			COALESCE(p.pengirim_ltb, '')
		FROM p_1_verifikasi p
		LEFT JOIN pat_1_bookingsspd b ON b.nobooking = p.nobooking
		WHERE p.nobooking = $1
		FOR UPDATE OF p
	`, nobooking).Scan(&pemilihan, &persetujuan, &noReg, &lockedBy, &creatorUserid, &namaWP, &namaOP, &pengirimLTB)
	if err != nil {
		return err
	}
	if pemilihan == nil || strings.TrimSpace(*pemilihan) == "" {
		return fmt.Errorf("data verifikasi belum lengkap: pemilihan wajib diisi")
	}
	if persetujuan == nil || strings.ToLower(strings.TrimSpace(*persetujuan)) != "true" {
		return fmt.Errorf("data verifikasi belum lengkap: persetujuan wajib")
	}
	if lockedBy != nil && strings.TrimSpace(*lockedBy) != "" && strings.TrimSpace(*lockedBy) != strings.TrimSpace(penelitiUserid) {
		return fmt.Errorf("dokumen ini dikunci oleh peneliti lain")
	}

	if _, err = tx.Exec(ctx, `UPDATE p_1_verifikasi SET trackstatus='Diverifikasi', status='Dikerjakan', locked_by_user_id = NULL, locked_by_nama = NULL, locked_at = NULL WHERE nobooking = $1`, nobooking); err != nil {
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

func (r *PenelitiRepo) RejectWithReason(ctx context.Context, nobooking, reason string) (*RejectionEmailInfo, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("database not configured")
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)
	var info RejectionEmailInfo
	if err = tx.QueryRow(ctx, `
		SELECT p.nobooking, COALESCE(u.email,''), COALESCE(u.nama,''), COALESCE(c.nama,'')
		FROM p_1_verifikasi p
		LEFT JOIN pat_1_bookingsspd b ON b.nobooking = p.nobooking
		LEFT JOIN a_2_verified_users u ON u.userid = b.userid
		LEFT JOIN a_2_verified_users c ON c.userid = p.nama_pengirim
		WHERE p.nobooking = $1
	`, nobooking).Scan(&info.Nobooking, &info.ToEmail, &info.ToName, &info.CreatorName); err != nil {
		return nil, err
	}
	if _, err = tx.Exec(ctx, `UPDATE p_1_verifikasi SET status='Ditolak', trackstatus='Ditolak', isiketeranganlainnya = COALESCE($2, isiketeranganlainnya), locked_by_user_id = NULL, locked_by_nama = NULL, locked_at = NULL WHERE nobooking = $1`, nobooking, reason); err != nil {
		return nil, err
	}
	if _, err = tx.Exec(ctx, `UPDATE ltb_1_terima_berkas_sspd SET status='Ditolak', trackstatus='Ditolak', updated_at=$2 WHERE nobooking = $1`, nobooking, jakartaNow()); err != nil {
		return nil, err
	}
	if _, err = tx.Exec(ctx, `UPDATE pat_1_bookingsspd SET trackstatus='Ditolak', updated_at=$2 WHERE nobooking = $1`, nobooking, jakartaNow()); err != nil {
		return nil, err
	}
	return &info, tx.Commit(ctx)
}

func (r *PenelitiRepo) BerikanParafKasie(ctx context.Context, kasieUserid, nobooking string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	var path *string
	err := r.pool.QueryRow(ctx, `SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1`, kasieUserid).Scan(&path)
	if err != nil {
		return err
	}
	if path == nil || strings.TrimSpace(*path) == "" {
		return fmt.Errorf("anda belum mendaftarkan tanda tangan/paraf di profil. akses ditolak")
	}
	var (
		noReg, noppbb, namaWP, namaOP, akta, sertif, pelengkap, pemilihan, persetujuan *string
	)
	if err = r.pool.QueryRow(ctx, `
		SELECT p.no_registrasi, b.noppbb::text, p.namawajibpajak, p.namapemilikobjekpajak,
			b.akta_tanah_path, b.sertifikat_tanah_path, b.pelengkap_path, p.pemilihan, p.persetujuan
		FROM p_1_verifikasi p
		LEFT JOIN pat_1_bookingsspd b ON b.nobooking = p.nobooking
		WHERE p.nobooking = $1
	`, nobooking).Scan(&noReg, &noppbb, &namaWP, &namaOP, &akta, &sertif, &pelengkap, &pemilihan, &persetujuan); err != nil {
		return err
	}
	missing := make([]string, 0, 10)
	req := map[string]*string{
		"no_registrasi": noReg,
		"noppbb": noppbb,
		"namawajibpajak": namaWP,
		"namapemilikobjekpajak": namaOP,
		"akta_tanah_path": akta,
		"sertifikat_tanah_path": sertif,
		"pelengkap_path": pelengkap,
		"pemilihan": pemilihan,
	}
	for k, v := range req {
		if v == nil || strings.TrimSpace(*v) == "" {
			missing = append(missing, k)
		}
	}
	if persetujuan == nil || strings.ToLower(strings.TrimSpace(*persetujuan)) != "true" {
		missing = append(missing, "persetujuan")
	}
	if len(missing) > 0 {
		return fmt.Errorf("data belum lengkap untuk paraf: %s", strings.Join(missing, ", "))
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	now := jakartaNow()
	tag, err := tx.Exec(ctx, `
		UPDATE p_3_clear_to_paraf
		SET tanda_paraf_path = $2, persetujuan = 'true', pemverifikasi = COALESCE($3, pemverifikasi), trackstatus='Terverifikasi'
		WHERE nobooking = $1
	`, nobooking, path, kasieUserid)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("data tidak ditemukan")
	}
	var (
		p3Userid, p3NoReg, p3Ket *string
		existingNoValidasi       *string
	)
	if err = tx.QueryRow(ctx, `
		SELECT pc.userid, pc.no_registrasi, pc.keterangan
		FROM p_3_clear_to_paraf pc WHERE pc.nobooking = $1
	`, nobooking).Scan(&p3Userid, &p3NoReg, &p3Ket); err != nil {
		return err
	}
	_ = tx.QueryRow(ctx, `SELECT no_validasi FROM pv_1_paraf_validate WHERE nobooking = $1`, nobooking).Scan(&existingNoValidasi)
	noValidasi := ""
	if existingNoValidasi != nil && strings.TrimSpace(*existingNoValidasi) != "" {
		noValidasi = strings.TrimSpace(*existingNoValidasi)
	} else {
		suffix := suffixFromUser(kasieUserid)
		for i := 0; i < 8; i++ {
			prefix, gErr := randomAlphaNum(8)
			if gErr != nil {
				return gErr
			}
			candidate := prefix + "-" + suffix
			var exists int
			eErr := tx.QueryRow(ctx, `SELECT 1 FROM pv_1_paraf_validate WHERE no_validasi = $1 LIMIT 1`, candidate).Scan(&exists)
			if eErr != nil {
				noValidasi = candidate
				break
			}
		}
		if noValidasi == "" {
			return fmt.Errorf("gagal membuat no_validasi unik")
		}
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO pv_1_paraf_validate
			(nobooking, userid, namawajibpajak, namapemilikobjekpajak, status, trackstatus, keterangan, no_validasi, pemverifikasi, pemparaf, status_tertampil, no_registrasi, updated_at)
		VALUES
			($1,$2,$3,$4,'Menunggu','Terverifikasi',$5,$6,$7,$8,'Menunggu',$9,$10)
		ON CONFLICT (nobooking) DO UPDATE
		SET userid = EXCLUDED.userid,
			namawajibpajak = EXCLUDED.namawajibpajak,
			namapemilikobjekpajak = EXCLUDED.namapemilikobjekpajak,
			status = EXCLUDED.status,
			trackstatus = EXCLUDED.trackstatus,
			keterangan = EXCLUDED.keterangan,
			no_validasi = COALESCE(NULLIF(pv_1_paraf_validate.no_validasi, ''), EXCLUDED.no_validasi),
			pemverifikasi = EXCLUDED.pemverifikasi,
			pemparaf = EXCLUDED.pemparaf,
			status_tertampil = EXCLUDED.status_tertampil,
			no_registrasi = EXCLUDED.no_registrasi,
			updated_at = EXCLUDED.updated_at
	`, nobooking, p3Userid, namaWP, namaOP, p3Ket, noValidasi, kasieUserid, kasieUserid, p3NoReg, now)
	if err != nil {
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
	AktaTanahPath    *string `json:"akta_tanah_path"`
	SertifikatTanahPath *string `json:"sertifikat_tanah_path"`
	PelengkapPath    *string `json:"pelengkap_path"`
	Status           string  `json:"status"`
	Persetujuan      *string `json:"persetujuan"`
	TandaParafPath   *string `json:"tanda_paraf_path"`
	TanggalMasuk     *string `json:"tanggal_masuk"`
	TandaTanganPath  *string `json:"tanda_tangan_path"`
	StempelBookingPath *string `json:"stempel_booking_path"`
	SignerUserid     *string `json:"signer_userid"`
	PemverifikasiNama *string `json:"pemverifikasi_nama"`
	LockedByUserID   *string `json:"locked_by_user_id"`
	LockedByNama     *string `json:"locked_by_nama"`
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
			b.akta_tanah_path, b.sertifikat_tanah_path, b.pelengkap_path,
			COALESCE(pc.status,'') AS status,
			CASE
				WHEN LOWER(TRIM(COALESCE(pc.persetujuan::text, ''))) IN ('true','t','1','yes','y') THEN 'true'
				WHEN LOWER(TRIM(COALESCE(pc.persetujuan::text, ''))) IN ('false','f','0','no','n') THEN 'false'
				ELSE COALESCE(pc.persetujuan::text,'')
			END AS persetujuan,
			pc.tanda_paraf_path,
			CASE WHEN pc.created_at IS NULL THEN NULL ELSE to_char((pc.created_at AT TIME ZONE 'Asia/Jakarta'), 'YYYY-MM-DD HH24:MI:SS') || ' WIB' END AS tanggal_masuk_wib,
			v.tanda_tangan_path, pvs.stempel_booking_path, au.nama AS signer_userid,
			pemverifikasi_user.nama AS pemverifikasi_nama,
			pv.locked_by_user_id, pv.locked_by_nama
		FROM p_3_clear_to_paraf pc
		LEFT JOIN pat_1_bookingsspd b ON pc.nobooking = b.nobooking
		LEFT JOIN a_2_verified_users v ON v.userid = $1
		LEFT JOIN p_2_verif_sign pvs ON pvs.nobooking = pc.nobooking
		LEFT JOIN a_2_verified_users au ON au.tanda_tangan_path = pc.tanda_paraf_path
		LEFT JOIN a_2_verified_users pemverifikasi_user ON pc.pemverifikasi = pemverifikasi_user.userid
		LEFT JOIN p_1_verifikasi pv ON pv.nobooking = pc.nobooking
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
			&row.Noppbb, &row.Tahunajb, &row.Namawajibpajak, &row.Namapemilikobjekpajak, &row.AktaTanahPath, &row.SertifikatTanahPath, &row.PelengkapPath, &row.Status,
			&row.Persetujuan, &row.TandaParafPath, &row.TanggalMasuk, &row.TandaTanganPath, &row.StempelBookingPath, &row.SignerUserid, &row.PemverifikasiNama, &row.LockedByUserID, &row.LockedByNama); err != nil {
			continue
		}
		out = append(out, row)
	}
	return out, nil
}
