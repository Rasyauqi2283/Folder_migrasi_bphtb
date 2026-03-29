package repository

import (
	"context"
	"fmt"
	"path"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// LtbRepo handles ltb_1_terima_berkas_sspd for LTB role.
type LtbRepo struct {
	pool     *pgxpool.Pool
	peneliti *PenelitiRepo
}

// NewLtbRepo creates an LtbRepo. peneliti may be nil (assignment skipped).
func NewLtbRepo(pool *pgxpool.Pool, peneliti *PenelitiRepo) *LtbRepo {
	return &LtbRepo{pool: pool, peneliti: peneliti}
}

// LtbTerimaBerkasRow is one row for GET /api/ltb/terima-berkas-sspd.
type LtbTerimaBerkasRow struct {
	NoRegistrasi           *string `json:"no_registrasi"`
	Nobooking              string  `json:"nobooking"`
	Noppbb                 string  `json:"noppbb"`
	Namawajibpajak         string  `json:"namawajibpajak"`
	Namapemilikobjekpajak  string  `json:"namapemilikobjekpajak"`
	TanggalTerima          string  `json:"tanggal_terima"`
	Trackstatus            string  `json:"trackstatus"`
	Status                 string  `json:"status"`
}

type LtbDocument struct {
	URL  string `json:"url"`
	Name string `json:"name"`
}

// SendToPenelitiResult is returned after LTB forwards a booking to Peneliti (verifikasi).
type SendToPenelitiResult struct {
	NoRegistrasi     string `json:"no_registrasi"`
	PenelitiUserid   string `json:"peneliti_userid"`
	PenelitiNama     string `json:"peneliti_nama"`
	AssignmentStatus string `json:"assignment_status"`
}

// LtbOfflineDraftRow is one draft booking created at the LTB offline counter (no LTB queue row yet).
type LtbOfflineDraftRow struct {
	Nobooking       string `json:"nobooking"`
	Noppbb          string `json:"noppbb"`
	Namawajibpajak  string `json:"namawajibpajak"`
	JenisWajibPajak string `json:"jenis_wajib_pajak"`
	Trackstatus     string `json:"trackstatus"`
}

func toDocRelativePath(p string) string {
	rel := strings.TrimPrefix(strings.TrimSpace(p), "/")
	rel = strings.TrimPrefix(rel, "storage/ppat/")
	rel = strings.TrimPrefix(rel, "ppat/")
	return rel
}

// TerimaBerkasList returns paginated rows from ltb_1 joined with pat_1 for NOP / names.
func (r *LtbRepo) TerimaBerkasList(ctx context.Context, search string, page, limit int) (rows []LtbTerimaBerkasRow, total int, totalPages int, err error) {
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

	if search != "" {
		pat := "%" + strings.ToLower(search) + "%"
		where = append(where, fmt.Sprintf(`(
			lower(l.nobooking) LIKE $%d OR lower(COALESCE(l.no_registrasi, '')::text) LIKE $%d
			OR lower(COALESCE(p.noppbb, '')::text) LIKE $%d
			OR lower(COALESCE(p.namawajibpajak, l.namawajibpajak, '')::text) LIKE $%d
			OR lower(COALESCE(p.namapemilikobjekpajak, l.namapemilikobjekpajak, '')::text) LIKE $%d
		)`, argIdx, argIdx, argIdx, argIdx, argIdx))
		args = append(args, pat)
		argIdx++
	}

	whereClause := ""
	if len(where) > 0 {
		whereClause = "WHERE " + strings.Join(where, " AND ")
	}

	countSQL := `
		SELECT COUNT(*) FROM ltb_1_terima_berkas_sspd l
		LEFT JOIN pat_1_bookingsspd p ON p.nobooking = l.nobooking
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

	listSQL := fmt.Sprintf(`
		SELECT
			l.no_registrasi,
			COALESCE(l.nobooking, '') AS nobooking,
			COALESCE(NULLIF(TRIM(p.noppbb), ''), '') AS noppbb,
			COALESCE(NULLIF(TRIM(l.namawajibpajak), ''), p.namawajibpajak, '') AS namawajibpajak,
			COALESCE(NULLIF(TRIM(l.namapemilikobjekpajak), ''), p.namapemilikobjekpajak, '') AS namapemilikop,
			COALESCE(l.tanggal_terima, '') AS tanggal_terima,
			COALESCE(l.trackstatus, '') AS trackstatus,
			COALESCE(l.status, '') AS status
		FROM ltb_1_terima_berkas_sspd l
		LEFT JOIN pat_1_bookingsspd p ON p.nobooking = l.nobooking
		%s
		ORDER BY l.id DESC
		LIMIT %d OFFSET %d`, whereClause, limit, offset)

	rowsResult, err := r.pool.Query(ctx, listSQL, args...)
	if err != nil {
		return nil, 0, 0, err
	}
	defer rowsResult.Close()

	for rowsResult.Next() {
		var row LtbTerimaBerkasRow
		if err := rowsResult.Scan(
			&row.NoRegistrasi,
			&row.Nobooking,
			&row.Noppbb,
			&row.Namawajibpajak,
			&row.Namapemilikobjekpajak,
			&row.TanggalTerima,
			&row.Trackstatus,
			&row.Status,
		); err != nil {
			continue
		}
		rows = append(rows, row)
	}
	return rows, total, totalPages, nil
}

// GetDocumentsByBooking returns related uploaded docs for one booking.
func (r *LtbRepo) GetDocumentsByBooking(ctx context.Context, nobooking string) ([]LtbDocument, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("database not configured")
	}
	var akta, sertifikat, pelengkap *string
	err := r.pool.QueryRow(ctx, `
		SELECT akta_tanah_path, sertifikat_tanah_path, pelengkap_path
		FROM pat_1_bookingsspd
		WHERE nobooking = $1
	`, nobooking).Scan(&akta, &sertifikat, &pelengkap)
	if err != nil {
		if err == pgx.ErrNoRows {
			return []LtbDocument{}, nil
		}
		return nil, err
	}
	var out []LtbDocument
	add := func(v *string) {
		if v == nil || strings.TrimSpace(*v) == "" {
			return
		}
		rel := toDocRelativePath(*v)
		if rel == "" {
			return
		}
		out = append(out, LtbDocument{
			URL:  rel,
			Name: path.Base(rel),
		})
	}
	add(akta)
	add(sertifikat)
	add(pelengkap)
	return out, nil
}

// ListOfflineDrafts returns pat_1 Draft rows for this LTB user that are not yet on ltb_1 (belum nomor registrasi).
func (r *LtbRepo) ListOfflineDrafts(ctx context.Context, ltbUserid string) ([]LtbOfflineDraftRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	u := strings.TrimSpace(ltbUserid)
	if u == "" {
		return nil, fmt.Errorf("userid required")
	}
	rows, err := r.pool.Query(ctx, `
		SELECT
			COALESCE(p.nobooking, ''),
			COALESCE(p.noppbb, ''),
			COALESCE(p.namawajibpajak, ''),
			COALESCE(p.jenis_wajib_pajak::text, ''),
			COALESCE(p.trackstatus, '')
		FROM pat_1_bookingsspd p
		WHERE p.userid = $1
		  AND LOWER(TRIM(COALESCE(p.trackstatus, ''))) = 'draft'
		  AND NOT EXISTS (SELECT 1 FROM ltb_1_terima_berkas_sspd l WHERE l.nobooking = p.nobooking)
		ORDER BY p.bookingid DESC
	`, u)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []LtbOfflineDraftRow
	for rows.Next() {
		var row LtbOfflineDraftRow
		if err := rows.Scan(&row.Nobooking, &row.Noppbb, &row.Namawajibpajak, &row.JenisWajibPajak, &row.Trackstatus); err != nil {
			continue
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

// RejectBerkas updates LTB row as rejected.
func (r *LtbRepo) RejectBerkas(ctx context.Context, nobooking, ltbUserid, _ string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	tag, err := r.pool.Exec(ctx, `
		UPDATE ltb_1_terima_berkas_sspd
		SET status = 'Ditolak', trackstatus = 'Ditolak', pengirim_ltb = $2, updated_at = NOW()
		WHERE nobooking = $1
	`, nobooking, ltbUserid)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("booking not found")
	}
	return nil
}

// SendToVerifikasi pushes one LTB record into p_1_verifikasi and updates LTB + pat trackstatus (sinkron dengan PU/Peneliti).
func (r *LtbRepo) SendToVerifikasi(ctx context.Context, nobooking, ltbUserid, pbbCheckNo string) (*SendToPenelitiResult, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("database not configured")
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var noReg *string
	var bookingUser, namaWP, namaOP string
	err = tx.QueryRow(ctx, `
		SELECT
			l.no_registrasi,
			COALESCE(NULLIF(TRIM(l.userid), ''), p.userid, ''),
			COALESCE(NULLIF(TRIM(l.namawajibpajak), ''), p.namawajibpajak, ''),
			COALESCE(NULLIF(TRIM(l.namapemilikobjekpajak), ''), p.namapemilikobjekpajak, '')
		FROM ltb_1_terima_berkas_sspd l
		LEFT JOIN pat_1_bookingsspd p ON p.nobooking = l.nobooking
		WHERE l.nobooking = $1
		FOR UPDATE OF l
	`, nobooking).Scan(&noReg, &bookingUser, &namaWP, &namaOP)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("booking not found")
		}
		return nil, err
	}

	tag, err := tx.Exec(ctx, `
		UPDATE p_1_verifikasi
		SET
			userid = $2,
			namawajibpajak = $3,
			namapemilikobjekpajak = $4,
			status = 'Diajukan',
			trackstatus = 'Dilanjutkan',
			pengirim_ltb = $5,
			no_registrasi = COALESCE($6, no_registrasi),
			tanggal_terima = to_char((now() AT TIME ZONE 'Asia/Jakarta'), 'DD-MM-YYYY'),
			nomorstpd = CASE WHEN $7 <> '' THEN $7 ELSE nomorstpd END
		WHERE nobooking = $1
	`, nobooking, bookingUser, namaWP, namaOP, ltbUserid, noReg, strings.TrimSpace(pbbCheckNo))
	if err != nil {
		return nil, err
	}
	if tag.RowsAffected() == 0 {
		_, err = tx.Exec(ctx, `
			INSERT INTO p_1_verifikasi (
				nobooking, userid, namawajibpajak, namapemilikobjekpajak, tanggal_terima,
				status, trackstatus, pengirim_ltb, no_registrasi, nomorstpd
			) VALUES (
				$1, $2, $3, $4, to_char((now() AT TIME ZONE 'Asia/Jakarta'), 'DD-MM-YYYY'),
				'Diajukan', 'Dilanjutkan', $5, $6, NULLIF($7, '')
			)
		`, nobooking, bookingUser, namaWP, namaOP, ltbUserid, noReg, strings.TrimSpace(pbbCheckNo))
		if err != nil {
			return nil, err
		}
	}

	_, err = tx.Exec(ctx, `
		UPDATE ltb_1_terima_berkas_sspd
		SET status = 'Dilanjutkan', trackstatus = 'Diterima', pengirim_ltb = $2, updated_at = NOW()
		WHERE nobooking = $1
	`, nobooking, ltbUserid)
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec(ctx, `
		UPDATE pat_1_bookingsspd
		SET trackstatus = 'Diterima', updated_at = NOW()
		WHERE nobooking = $1
	`, nobooking)
	if err != nil {
		return nil, err
	}

	if r.peneliti != nil {
		if err := r.peneliti.AssignTaskToPenelitiTx(ctx, tx, nobooking); err != nil {
			return nil, err
		}
	}

	noRegStr := ""
	if noReg != nil {
		noRegStr = strings.TrimSpace(*noReg)
	}

	var assignedTo *string
	var asgStatus *string
	_ = tx.QueryRow(ctx, `
		SELECT assigned_to, assignment_status
		FROM p_1_verifikasi
		WHERE nobooking = $1
	`, nobooking).Scan(&assignedTo, &asgStatus)

	res := &SendToPenelitiResult{NoRegistrasi: noRegStr}
	if asgStatus != nil {
		res.AssignmentStatus = strings.TrimSpace(*asgStatus)
	}
	if assignedTo != nil && strings.TrimSpace(*assignedTo) != "" {
		uid := strings.TrimSpace(*assignedTo)
		res.PenelitiUserid = uid
		var nama string
		_ = tx.QueryRow(ctx, `
			SELECT COALESCE(NULLIF(TRIM(nama), ''), $1)
			FROM a_2_verified_users
			WHERE userid = $1
			LIMIT 1
		`, uid).Scan(&nama)
		res.PenelitiNama = strings.TrimSpace(nama)
	} else {
		res.PenelitiUserid = "UNASSIGNED"
		res.PenelitiNama = "Antrean UNASSIGNED"
	}

	if err = tx.Commit(ctx); err != nil {
		return nil, err
	}
	return res, nil
}
