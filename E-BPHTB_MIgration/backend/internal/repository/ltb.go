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
	pool *pgxpool.Pool
}

// NewLtbRepo creates an LtbRepo.
func NewLtbRepo(pool *pgxpool.Pool) *LtbRepo {
	return &LtbRepo{pool: pool}
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

// SendToVerifikasi pushes one LTB record into p_1_verifikasi and updates LTB status.
func (r *LtbRepo) SendToVerifikasi(ctx context.Context, nobooking, ltbUserid, pbbCheckNo string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
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
		FOR UPDATE
	`, nobooking).Scan(&noReg, &bookingUser, &namaWP, &namaOP)
	if err != nil {
		if err == pgx.ErrNoRows {
			return fmt.Errorf("booking not found")
		}
		return err
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
		return err
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
			return err
		}
	}

	_, err = tx.Exec(ctx, `
		UPDATE ltb_1_terima_berkas_sspd
		SET status = 'Dilanjutkan', trackstatus = 'Diterima', pengirim_ltb = $2, updated_at = NOW()
		WHERE nobooking = $1
	`, nobooking, ltbUserid)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}
