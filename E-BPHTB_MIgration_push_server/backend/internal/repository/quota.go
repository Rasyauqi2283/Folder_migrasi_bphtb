package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type QuotaRepo struct {
	pool *pgxpool.Pool
}

func NewQuotaRepo(pool *pgxpool.Pool) *QuotaRepo {
	return &QuotaRepo{pool: pool}
}

func jakartaLoc() *time.Location {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return time.Local
	}
	return loc
}

func jakartaDayBounds(now time.Time) (start time.Time, end time.Time) {
	loc := jakartaLoc()
	n := now.In(loc)
	y, m, d := n.Date()
	start = time.Date(y, m, d, 0, 0, 0, 0, loc)
	end = start.Add(24 * time.Hour)
	return start, end
}

// CountOnlineReceivedOnDate counts documents entering p_1_verifikasi on a given date (Jakarta)
// using tanggal_terima (DD-MM-YYYY).
func (r *QuotaRepo) CountOnlineReceivedOnDate(ctx context.Context, dateJakarta time.Time) (int, error) {
	if r.pool == nil {
		return 0, fmt.Errorf("database not configured")
	}
	loc := jakartaLoc()
	dayStr := dateJakarta.In(loc).Format("02-01-2006") // DD-MM-YYYY
	var n int
	if err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM p_1_verifikasi WHERE tanggal_terima = $1`, dayStr).Scan(&n); err != nil {
		return 0, err
	}
	return n, nil
}

// CountOnlineVerifiedByUserOnDate counts documents verified on a given date (Jakarta) by userid using verified_at.
func (r *QuotaRepo) CountOnlineVerifiedByUserOnDate(ctx context.Context, userid string, dateJakarta time.Time) (int, error) {
	if r.pool == nil {
		return 0, fmt.Errorf("database not configured")
	}
	start, end := jakartaDayBounds(dateJakarta)
	var n int
	if err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM p_1_verifikasi
		WHERE verified_by = $1
		  AND verified_at >= $2
		  AND verified_at < $3
	`, userid, start, end).Scan(&n); err != nil {
		return 0, err
	}
	return n, nil
}

