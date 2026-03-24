package repository

import (
	"context"
	"fmt"
	"strings"

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
	Namapemilikobjekpajak   string  `json:"namapemilikobjekpajak"`
	TanggalTerima          string  `json:"tanggal_terima"`
	Trackstatus            string  `json:"trackstatus"`
	Status                 string  `json:"status"`
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
