package repository

import (
	"context"
	"errors"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// UserRepo handles user DB operations.
type UserRepo struct {
	pool *pgxpool.Pool
}

// Pool returns the underlying pool (may be nil).
func (r *UserRepo) Pool() *pgxpool.Pool { return r.pool }

// NewUserRepo creates a UserRepo.
func NewUserRepo(pool *pgxpool.Pool) *UserRepo {
	return &UserRepo{pool: pool}
}

// GetByEmailUnverified returns true if email exists in a_1_unverified_users.
func (r *UserRepo) GetByEmailUnverified(ctx context.Context, email string) (exists bool, err error) {
	var n int
	err = r.pool.QueryRow(ctx,
		`SELECT 1 FROM a_1_unverified_users WHERE email = $1`, email,
	).Scan(&n)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	return err == nil, err
}

// GetByEmailVerified returns true if email exists in a_2_verified_users with verifiedstatus IN ('verified_pending','complete','pending').
// Termasuk 'pending' agar WP Badan yang menunggu verifikasi admin tidak bisa daftar ulang dengan email sama.
func (r *UserRepo) GetByEmailVerified(ctx context.Context, email string) (exists bool, err error) {
	var n int
	err = r.pool.QueryRow(ctx,
		`SELECT 1 FROM a_2_verified_users WHERE email = $1 AND verifiedstatus IN ('verified_pending','complete','pending')`, email,
	).Scan(&n)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	return err == nil, err
}

// NIKExistsInA2Verified returns true if NIK exists in a_2_verified_users with verifiedstatus IN ('verified_pending','complete').
// NIK di verified_pending atau complete harus diblokir — tidak boleh daftar ulang.
func (r *UserRepo) NIKExistsInA2Verified(ctx context.Context, nik string) (exists bool, err error) {
	var n int
	err = r.pool.QueryRow(ctx,
		`SELECT 1 FROM a_2_verified_users WHERE nik = $1 AND verifiedstatus IN ('verified_pending','complete')`, nik,
	).Scan(&n)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	return err == nil, err
}

// NIKExistsInA1Unverified returns true if NIK exists in a_1_unverified_users with verifiedstatus = 'unverified'.
func (r *UserRepo) NIKExistsInA1Unverified(ctx context.Context, nik string) (exists bool, err error) {
	var n int
	err = r.pool.QueryRow(ctx,
		`SELECT 1 FROM a_1_unverified_users WHERE nik = $1 AND COALESCE(verifiedstatus,'') = 'unverified'`, nik,
	).Scan(&n)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	return err == nil, err
}

// InsertUnverified inserts a new unverified user.
func (r *UserRepo) InsertUnverified(ctx context.Context, args *InsertUnverifiedArgs) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO a_1_unverified_users (nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, gender, verse, nip, special_field, pejabat_umum, divisi, ktp_ocr_json, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'unverified', '', $8, $9, $10, $11, $12, $13, $14, NOW())
	`,
		args.Nama, args.NIK, args.Telepon, args.Email, args.Password, args.Foto, args.OTP, args.Gender, args.Verse,
		args.NIP, args.SpecialField, args.PejabatUmum, args.Divisi, args.KtpOcrJson,
	)
	return err
}

// UpdateUnverified updates existing unverified user by email.
func (r *UserRepo) UpdateUnverified(ctx context.Context, args *InsertUnverifiedArgs, email string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE a_1_unverified_users
		SET nama=$1, nik=$2, telepon=$3, email=$4, password=$5, foto=$6, otp=$7, verifiedstatus='unverified', fotoprofil='', gender=$8, verse=$9, nip=$10, special_field=$11, pejabat_umum=$12, divisi=$13, ktp_ocr_json=$14
		WHERE email=$15
	`,
		args.Nama, args.NIK, args.Telepon, args.Email, args.Password, args.Foto, args.OTP, args.Gender, args.Verse,
		args.NIP, args.SpecialField, args.PejabatUmum, args.Divisi, args.KtpOcrJson, email,
	)
	return err
}

// InsertUnverifiedArgs holds fields for insert/update unverified user.
type InsertUnverifiedArgs struct {
	Nama         string
	NIK          string
	Telepon      string
	Email        string
	Password     string
	Foto         string
	OTP          string
	Gender       string
	Verse        string
	NIP          *string
	SpecialField *string
	PejabatUmum  *string
	Divisi       *string
	KtpOcrJson   *string // JSON string hasil OCR KTP
}

// LoginUser holds user data for login (a_2_verified_users).
// Kolom berikut boleh kosong (beragam role): NIP, SpecialField, PejabatUmum, PpatKhusus; StatusPpat juga boleh kosong di tabel.
type LoginUser struct {
	Userid           string
	Password         string
	Nama             string
	Email            string
	Divisi           string
	Fotoprofil       string
	Statuspengguna   string
	Username         *string
	NIP              *string
	SpecialField     *string
	SpecialParafv    *string
	PejabatUmum      *string
	TandaTanganMime  *string
	TandaTanganPath  *string
	Telepon          *string
	Gender           *string
	PpatKhusus       *string
	AlamatPu         *string
	NpwpBadan        *string
	Nib              *string
	NibDocPath       *string
}

// GetByIdentifierForLogin fetches user from a_2_verified_users by email, userid, or username.
func (r *UserRepo) GetByIdentifierForLogin(ctx context.Context, identifier string) (*LoginUser, error) {
	var u LoginUser
	err := r.pool.QueryRow(ctx,
		`SELECT userid, password, nama, email, divisi, COALESCE(fotoprofil, ''), COALESCE(statuspengguna, 'offline'),
			username, nip, special_field, special_parafv, pejabat_umum,
			tanda_tangan_mime, tanda_tangan_path, telepon, gender, ppat_khusus, alamat_pu, npwp_badan, nib, nib_doc_path
		 FROM a_2_verified_users
		 WHERE (email = $1 OR userid = $1 OR username = $1) AND verifiedstatus = 'complete'`,
		identifier,
	).Scan(
		&u.Userid, &u.Password, &u.Nama, &u.Email, &u.Divisi, &u.Fotoprofil, &u.Statuspengguna,
		&u.Username, &u.NIP, &u.SpecialField, &u.SpecialParafv, &u.PejabatUmum,
		&u.TandaTanganMime, &u.TandaTanganPath, &u.Telepon, &u.Gender, &u.PpatKhusus, &u.AlamatPu, &u.NpwpBadan, &u.Nib, &u.NibDocPath,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// UpdateLoginStatus sets statuspengguna and last_active for user.
func (r *UserRepo) UpdateLoginStatus(ctx context.Context, userid string) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE a_2_verified_users SET statuspengguna = 'online', last_active = NOW() WHERE userid = $1`,
		userid,
	)
	return err
}

// UnverifiedUser holds row from a_1_unverified_users.
type UnverifiedUser struct {
	Nama          string
	NIK           string
	Telepon       string
	Email         string
	Password      string
	Foto          string
	OTP           string
	Verifiedstatus string
	Gender        *string
	Verse         *string
	NIP           *string
	SpecialField  *string
	PejabatUmum   *string
	Divisi        *string
	KtpOcrJson    *string
}

// GetUnverifiedByEmail fetches unverified user by email.
func (r *UserRepo) GetUnverifiedByEmail(ctx context.Context, email string) (*UnverifiedUser, error) {
	var u UnverifiedUser
	err := r.pool.QueryRow(ctx,
		`SELECT nama, nik, telepon, email, password, foto, otp, COALESCE(verifiedstatus,''), gender, verse, nip, special_field, pejabat_umum, divisi, ktp_ocr_json
		 FROM a_1_unverified_users WHERE email = $1`,
		email,
	).Scan(
		&u.Nama, &u.NIK, &u.Telepon, &u.Email, &u.Password, &u.Foto, &u.OTP, &u.Verifiedstatus,
		&u.Gender, &u.Verse, &u.NIP, &u.SpecialField, &u.PejabatUmum, &u.Divisi, &u.KtpOcrJson,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// InsertVerifiedArgs holds fields for insert into a_2_verified_users.
type InsertVerifiedArgs struct {
	Nama         string
	NIK          string
	Telepon      string
	Email        string
	Password     string
	Foto         string
	OTP          string
	Userid       string
	Divisi       string
	PpatKhusus   string
	Gender       *string
	Verse        string
	NIP          *string
	SpecialField *string
	PejabatUmum  *string
}

// InsertVerified inserts row into a_2_verified_users.
func (r *UserRepo) InsertVerified(ctx context.Context, args *InsertVerifiedArgs) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO a_2_verified_users (
			nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi,
			statuspengguna, ppat_khusus, gender, verse, nip, special_field, pejabat_umum
		) VALUES ($1, $2, $3, $4, $5, $6, $7, 'verified_pending', '', $8, $9, 'offline', $10, $11, $12, $13, $14, $15)`,
		args.Nama, args.NIK, args.Telepon, args.Email, args.Password, args.Foto, args.OTP,
		args.Userid, args.Divisi, args.PpatKhusus, args.Gender, args.Verse,
		args.NIP, args.SpecialField, args.PejabatUmum,
	)
	return err
}

// DeleteUnverified removes unverified user by email.
func (r *UserRepo) DeleteUnverified(ctx context.Context, email string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM a_1_unverified_users WHERE email = $1`, email)
	return err
}

// UpdateOTPByEmail updates OTP for unverified user.
func (r *UserRepo) UpdateOTPByEmail(ctx context.Context, email, otp string) error {
	_, err := r.pool.Exec(ctx, `UPDATE a_1_unverified_users SET otp = $1 WHERE email = $2`, otp, email)
	return err
}

// DeleteUnverifiedWhereEmailInVerified menghapus baris di a_1_unverified_users jika email sudah ada di a_2_verified_users (verified_pending atau complete). Menjaga invariant sistem satu pintu: satu user tidak boleh ada di kedua tabel.
func (r *UserRepo) DeleteUnverifiedWhereEmailInVerified(ctx context.Context, email string) error {
	_, err := r.pool.Exec(ctx,
		`DELETE FROM a_1_unverified_users WHERE email = $1 AND EXISTS (SELECT 1 FROM a_2_verified_users WHERE email = $1 AND verifiedstatus IN ('verified_pending','complete'))`,
		email, email,
	)
	return err
}

// PendingUser holds row from a_2_verified_users for admin pending list (verified_pending).
type PendingUser struct {
	ID           int
	Nama         string
	Email        string
	NIK          string
	Telepon      string
	Userid       *string
	Divisi       *string
	PpatKhusus   *string
	Gender       *string
	Verse        *string
	SpecialField *string
	PejabatUmum  *string
}

// ListPendingUsers returns users with verifiedstatus IN ('verified_pending','pending').
func (r *UserRepo) ListPendingUsers(ctx context.Context) ([]PendingUser, error) {
	if r.pool == nil {
		return nil, nil
	}
	rows, err := r.pool.Query(ctx,
		`SELECT id, nama, email, nik, telepon, userid, divisi, ppat_khusus,
		 gender, verse, special_field, pejabat_umum
		 FROM a_2_verified_users
		 WHERE verifiedstatus IN ('verified_pending','pending')
		 ORDER BY id`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []PendingUser
	for rows.Next() {
		var u PendingUser
		err := rows.Scan(&u.ID, &u.Nama, &u.Email, &u.NIK, &u.Telepon, &u.Userid, &u.Divisi, &u.PpatKhusus,
			&u.Gender, &u.Verse, &u.SpecialField, &u.PejabatUmum)
		if err != nil {
			return nil, err
		}
		list = append(list, u)
	}
	return list, rows.Err()
}

// CompleteUser holds row from a_2_verified_users for admin complete list.
type CompleteUser struct {
	ID             int
	Userid         string
	Divisi         string
	Nama           string
	Email          string
	NIK            string
	Telepon        string
	Username       *string
	NIP            *string
	SpecialParafv  *string
	SpecialField   *string
	PpatKhusus     *string
	PejabatUmum    *string
	StatusPpat     *string
	Verse          *string
	Verifiedstatus string
	Statuspengguna string // online, offline
}

// ListCompleteUsers returns users with verifiedstatus = 'complete'.
func (r *UserRepo) ListCompleteUsers(ctx context.Context) ([]CompleteUser, error) {
	if r.pool == nil {
		return nil, nil
	}
	rows, err := r.pool.Query(ctx,
		`SELECT id, userid, divisi, nama, email, nik, telepon, username, nip, special_parafv, special_field, ppat_khusus, pejabat_umum, status_ppat, verse, verifiedstatus, COALESCE(statuspengguna,'offline')
		 FROM a_2_verified_users
		 WHERE verifiedstatus = 'complete'
		 ORDER BY id`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []CompleteUser
	for rows.Next() {
		var u CompleteUser
		err := rows.Scan(&u.ID, &u.Userid, &u.Divisi, &u.Nama, &u.Email, &u.NIK, &u.Telepon, &u.Username, &u.NIP,
			&u.SpecialParafv, &u.SpecialField, &u.PpatKhusus, &u.PejabatUmum, &u.StatusPpat, &u.Verse,
			&u.Verifiedstatus, &u.Statuspengguna)
		if err != nil {
			return nil, err
		}
		list = append(list, u)
	}
	return list, rows.Err()
}

// GetPendingByEmail returns one pending user by email, or nil if not found.
func (r *UserRepo) GetPendingByEmail(ctx context.Context, email string) (*PendingUser, error) {
	if r.pool == nil {
		return nil, nil
	}
	var u PendingUser
	err := r.pool.QueryRow(ctx,
		`SELECT id, nama, email, nik, telepon, userid, divisi, ppat_khusus,
		 gender, verse, special_field, pejabat_umum
		 FROM a_2_verified_users
		 WHERE email = $1 AND verifiedstatus = 'verified_pending'`,
		email,
	).Scan(&u.ID, &u.Nama, &u.Email, &u.NIK, &u.Telepon, &u.Userid, &u.Divisi, &u.PpatKhusus,
		&u.Gender, &u.Verse, &u.SpecialField, &u.PejabatUmum)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// GetPendingByID returns one pending user by id (verified_pending/pending). ktp_ocr_json diambil dari cek_ktp_ocr terpisah.
func (r *UserRepo) GetPendingByID(ctx context.Context, id int) (*PendingUser, error) {
	if r.pool == nil {
		return nil, nil
	}
	var u PendingUser
	err := r.pool.QueryRow(ctx,
		`SELECT id, nama, email, nik, telepon, userid, divisi, ppat_khusus,
		 gender, verse, special_field, pejabat_umum
		 FROM a_2_verified_users
		 WHERE id = $1 AND verifiedstatus IN ('verified_pending','pending')`,
		id,
	).Scan(&u.ID, &u.Nama, &u.Email, &u.NIK, &u.Telepon, &u.Userid, &u.Divisi, &u.PpatKhusus,
		&u.Gender, &u.Verse, &u.SpecialField, &u.PejabatUmum)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// InsertCekKtpOcr menyimpan ktp_ocr_json di cek_ktp_ocr (terikat NIK). Dipanggil saat verifikasi OTP.
// Jika NIK sudah ada (re-register), replace.
func (r *UserRepo) InsertCekKtpOcr(ctx context.Context, nik, ktpOcrJson string) error {
	if r.pool == nil || nik == "" || ktpOcrJson == "" {
		return nil
	}
	_, err := r.pool.Exec(ctx, `DELETE FROM cek_ktp_ocr WHERE nik = $1`, nik)
	if err != nil {
		return err
	}
	_, err = r.pool.Exec(ctx, `INSERT INTO cek_ktp_ocr (ktp_ocr_json, nik) VALUES ($1, $2)`, ktpOcrJson, nik)
	return err
}

// GetCekKtpOcrByNIK returns ktp_ocr_json dari cek_ktp_ocr untuk NIK tertentu.
func (r *UserRepo) GetCekKtpOcrByNIK(ctx context.Context, nik string) (string, error) {
	if r.pool == nil || nik == "" {
		return "", nil
	}
	var json string
	err := r.pool.QueryRow(ctx, `SELECT ktp_ocr_json FROM cek_ktp_ocr WHERE nik = $1 LIMIT 1`, nik).Scan(&json)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", nil
	}
	return json, err
}

// DeleteCekKtpOcrByNIK menghapus baris di cek_ktp_ocr untuk NIK (saat user complete/assign). Mengurangi kepenuhan data.
func (r *UserRepo) DeleteCekKtpOcrByNIK(ctx context.Context, nik string) error {
	if r.pool == nil || nik == "" {
		return nil
	}
	_, err := r.pool.Exec(ctx, `DELETE FROM cek_ktp_ocr WHERE nik = $1`, nik)
	return err
}

// UpdateToCompleteTx updates a_2_verified_users: set userid, divisi, verifiedstatus='complete', fotoprofil, ppat_khusus where email and verified_pending. tx must be from an active transaction.
func (r *UserRepo) UpdateToCompleteTx(ctx context.Context, tx pgx.Tx, email, userid, divisi, fotoprofil, ppatKhusus string) error {
	_, err := tx.Exec(ctx,
		`UPDATE a_2_verified_users
		 SET userid = $1, divisi = $2, verifiedstatus = 'complete', fotoprofil = $3, ppat_khusus = NULLIF($4,'')
		 WHERE email = $5 AND verifiedstatus = 'verified_pending'`,
		userid, divisi, fotoprofil, ppatKhusus, email,
	)
	return err
}

// UpdateCompleteUser updates nama, telepon, username, nip, special_parafv, special_field, pejabat_umum, ppat_khusus for complete user by userid.
func (r *UserRepo) UpdateCompleteUser(ctx context.Context, userid, nama, telepon, username, nip, specialParafv, specialField, pejabatUmum, ppatKhusus string) error {
	if r.pool == nil || userid == "" {
		return nil
	}
	_, err := r.pool.Exec(ctx,
		`UPDATE a_2_verified_users SET
			nama=$1, telepon=$2, username=NULLIF(TRIM($3),''), nip=NULLIF(TRIM($4),''),
			special_parafv=NULLIF(TRIM($5),''), special_field=NULLIF(TRIM($6),''),
			pejabat_umum=NULLIF(TRIM($7),''), ppat_khusus=NULLIF(TRIM($8),'')
		 WHERE userid=$9 AND verifiedstatus='complete'`,
		nama, telepon, username, nip, specialParafv, specialField, pejabatUmum, ppatKhusus, userid,
	)
	return err
}

// PpatUserRow holds PPAT/PPATS user row for admin notification-warehouse.
type PpatUserRow struct {
	ID          int
	Nama        string
	SpecialField *string
	Userid      string
	Divisi      string
	StatusPpat  *string
	PpatKhusus  *string
	Email       string
	CreatedAt   interface{}
	UpdatedAt   interface{}
}

// ListPpatUsers returns PPAT/PPATS users with pagination (matching Node notification_warehouse ppat-users).
func (r *UserRepo) ListPpatUsers(ctx context.Context, page, limit int, search, status string) ([]PpatUserRow, int, error) {
	if r.pool == nil {
		return nil, 0, nil
	}
	offset := (page - 1) * limit
	if offset < 0 {
		offset = 0
	}
	if limit < 1 {
		limit = 50
	}
	if limit > 200 {
		limit = 200
	}

	// Base where clause
	where := `divisi IN ('PPAT', 'PPATS')`
	params := []interface{}{}
	idx := 1

	if status != "" {
		where += ` AND status_ppat = $` + strconv.Itoa(idx)
		params = append(params, status)
		idx++
	}
	if search != "" {
		where += ` AND (nama ILIKE $` + strconv.Itoa(idx) + ` OR userid ILIKE $` + strconv.Itoa(idx) + ` OR special_field ILIKE $` + strconv.Itoa(idx) + ` OR email ILIKE $` + strconv.Itoa(idx) + ` OR ppat_khusus::text ILIKE $` + strconv.Itoa(idx) + `)`
		params = append(params, "%"+search+"%")
		idx++
	}

	// Count total
	var total int
	countQ := `SELECT COUNT(*) FROM a_2_verified_users WHERE ` + where
	err := r.pool.QueryRow(ctx, countQ, params...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Fetch page (params + limit + offset)
	limitParam := idx
	offsetParam := idx + 1
	order := ` ORDER BY COALESCE(updated_at, created_at) DESC NULLS LAST, id DESC LIMIT $` + strconv.Itoa(limitParam) + ` OFFSET $` + strconv.Itoa(offsetParam)
	params = append(params, limit, offset)
	rows, err := r.pool.Query(ctx,
		`SELECT id, nama, special_field, userid, divisi, status_ppat, ppat_khusus, email, created_at, updated_at
		 FROM a_2_verified_users WHERE `+where+order,
		params...,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var list []PpatUserRow
	for rows.Next() {
		var u PpatUserRow
		var createdAt, updatedAt interface{}
		err := rows.Scan(&u.ID, &u.Nama, &u.SpecialField, &u.Userid, &u.Divisi, &u.StatusPpat, &u.PpatKhusus, &u.Email, &createdAt, &updatedAt)
		if err != nil {
			return nil, 0, err
		}
		u.CreatedAt = createdAt
		u.UpdatedAt = updatedAt
		list = append(list, u)
	}
	return list, total, rows.Err()
}

// GetPpatUserByUserid returns one PPAT/PPATS user by userid or id.
func (r *UserRepo) GetPpatUserByUserid(ctx context.Context, userid string) (*PpatUserRow, error) {
	if r.pool == nil || userid == "" {
		return nil, nil
	}
	var u PpatUserRow
	var createdAt, updatedAt interface{}
	err := r.pool.QueryRow(ctx,
		`SELECT id, nama, special_field, userid, divisi, status_ppat, ppat_khusus, email, created_at, updated_at
		 FROM a_2_verified_users
		 WHERE (userid = $1 OR id::text = $1) AND divisi IN ('PPAT', 'PPATS')`,
		userid,
	).Scan(&u.ID, &u.Nama, &u.SpecialField, &u.Userid, &u.Divisi, &u.StatusPpat, &u.PpatKhusus, &u.Email, &createdAt, &updatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	u.CreatedAt = createdAt
	u.UpdatedAt = updatedAt
	return &u, nil
}

// UpdateStatusPpat updates status_ppat for PPAT/PPATS user.
func (r *UserRepo) UpdateStatusPpat(ctx context.Context, userid, statusPpat string) error {
	if r.pool == nil || userid == "" {
		return nil
	}
	_, err := r.pool.Exec(ctx,
		`UPDATE a_2_verified_users SET status_ppat=$1 WHERE userid=$2 AND verifiedstatus='complete' AND divisi IN ('PPAT','PPATS')`,
		statusPpat, userid,
	)
	return err
}

// DeleteCompleteByUserid soft-deletes atau menghapus user complete. Hanya untuk user non-Administrator.
func (r *UserRepo) DeleteCompleteByUserid(ctx context.Context, userid string) error {
	if r.pool == nil || userid == "" {
		return nil
	}
	_, err := r.pool.Exec(ctx,
		`DELETE FROM a_2_verified_users WHERE userid=$1 AND verifiedstatus='complete' AND COALESCE(LOWER(TRIM(divisi)),'') != 'administrator'`,
		userid,
	)
	return err
}

// UpdateFotoprofil updates foto profil path for user (profile upload).
func (r *UserRepo) UpdateFotoprofil(ctx context.Context, userid, path string) error {
	if r.pool == nil || userid == "" {
		return nil
	}
	_, err := r.pool.Exec(ctx,
		`UPDATE a_2_verified_users SET fotoprofil = $1 WHERE userid = $2 AND verifiedstatus = 'complete'`,
		path, userid,
	)
	return err
}

// UpdateTandaTangan updates paraf/tanda tangan path and mime for user.
func (r *UserRepo) UpdateTandaTangan(ctx context.Context, userid, mime, path string) error {
	if r.pool == nil || userid == "" {
		return nil
	}
	_, err := r.pool.Exec(ctx,
		`UPDATE a_2_verified_users SET tanda_tangan_mime = $1, tanda_tangan_path = $2 WHERE userid = $3 AND verifiedstatus = 'complete'`,
		mime, path, userid,
	)
	return err
}

// UpdateProfileEditable updates username, nip, email, telepon, alamat_pu (and optionally gender, special_field, pejabat_umum) for profile edit.
func (r *UserRepo) UpdateProfileEditable(ctx context.Context, userid, username, nip, email, telepon string, alamatPu *string, gender, specialField, pejabatUmum *string) error {
	if r.pool == nil || userid == "" {
		return nil
	}
	alamatVal := ""
	if alamatPu != nil {
		alamatVal = strings.TrimSpace(*alamatPu)
	}
	_, err := r.pool.Exec(ctx,
		`UPDATE a_2_verified_users SET
			username = NULLIF(TRIM($1),''), nip = NULLIF(TRIM($2),''),
			email = NULLIF(TRIM($3),''), telepon = NULLIF(TRIM($4),''), alamat_pu = NULLIF(TRIM($5),'')
		 WHERE userid = $6 AND verifiedstatus = 'complete'`,
		username, nip, email, telepon, alamatVal, userid,
	)
	if err != nil {
		return err
	}
	if gender != nil {
		g := strings.TrimSpace(*gender)
		if g == "Laki-laki" || g == "Perempuan" {
			_, err = r.pool.Exec(ctx,
				`UPDATE a_2_verified_users SET gender = $1 WHERE userid = $2 AND verifiedstatus = 'complete'`,
				g, userid,
			)
			if err != nil {
				return err
			}
		}
	}
	if specialField != nil || pejabatUmum != nil {
		sf := ""
		pu := ""
		if specialField != nil {
			sf = strings.TrimSpace(*specialField)
		}
		if pejabatUmum != nil {
			pu = strings.TrimSpace(*pejabatUmum)
		}
		_, err = r.pool.Exec(ctx,
			`UPDATE a_2_verified_users SET special_field = NULLIF($1,''), pejabat_umum = NULLIF($2,'') WHERE userid = $3 AND verifiedstatus = 'complete'`,
			sf, pu, userid,
		)
	}
	return err
}
