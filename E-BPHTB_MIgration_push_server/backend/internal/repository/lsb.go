package repository

import (
	"context"
	"strconv"

	"github.com/jackc/pgx/v5/pgxpool"
)

// LSBRepo handles lsb_1_serah_berkas for LSB role.
type LSBRepo struct {
	pool *pgxpool.Pool
}

// NewLSBRepo creates a LSBRepo.
func NewLSBRepo(pool *pgxpool.Pool) *LSBRepo {
	return &LSBRepo{pool: pool}
}

// LSBBerkasCompleteRow one row for GET /api/LSB_berkas-complete.
type LSBBerkasCompleteRow struct {
	Nobooking           string  `json:"nobooking"`
	Userid              *string `json:"userid"`
	Noppbb              string  `json:"noppbb"`
	Tahunajb            string  `json:"tahunajb"`
	Namawajibpajak      string  `json:"namawajibpajak"`
	Namapemilikobjekpajak string `json:"namapemilikobjekpajak"`
	Status              string  `json:"status"`
	Trackstatus         string  `json:"trackstatus"`
	UpdatedAt           *string `json:"updated_at"`
}

// BerkasComplete returns list where trackstatus = 'Siap Diserahkan'.
func (r *LSBRepo) BerkasComplete(ctx context.Context) ([]LSBBerkasCompleteRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	q := `
		SELECT lsb.nobooking, lsb.userid,
			COALESCE(pb.noppbb::text, '') AS noppbb, COALESCE(pb.tahunajb::text, '') AS tahunajb,
			COALESCE(lsb.namawajibpajak, '') AS namawajibpajak, COALESCE(lsb.namapemilikobjekpajak, '') AS namapemilikobjekpajak,
			COALESCE(lsb.status, '') AS status, COALESCE(lsb.trackstatus, '') AS trackstatus,
			lsb.updated_at::text
		FROM lsb_1_serah_berkas lsb
		LEFT JOIN pat_1_bookingsspd pb ON lsb.nobooking = pb.nobooking
		WHERE lsb.trackstatus = 'Siap Diserahkan'
		ORDER BY lsb.nobooking DESC
	`
	rows, err := r.pool.Query(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []LSBBerkasCompleteRow
	for rows.Next() {
		var row LSBBerkasCompleteRow
		if err := rows.Scan(&row.Nobooking, &row.Userid, &row.Noppbb, &row.Tahunajb, &row.Namawajibpajak, &row.Namapemilikobjekpajak, &row.Status, &row.Trackstatus, &row.UpdatedAt); err != nil {
			continue
		}
		out = append(out, row)
	}
	return out, nil
}

// LSBMonitoringMonth one month group for GET /api/LSB_monitoring-penyerahan.
type LSBMonitoringMonth struct {
	BulanKey   string  `json:"bulan_key"`
	BulanLabel string  `json:"bulan_label"`
	Label      string  `json:"label"` // frontend expects "label"
	BulanDate  string  `json:"bulan_date"`
	Count      int     `json:"count"`
	Bulan      *string `json:"bulan"`
	Tahun      *string `json:"tahun"`
}

// MonitoringPenyerahan returns months with counts (trackstatus = 'Diserahkan'), grouped.
func (r *LSBRepo) MonitoringPenyerahan(ctx context.Context) (months []LSBMonitoringMonth, total int, err error) {
	if r.pool == nil {
		return nil, 0, nil
	}
	q := `
		SELECT TO_CHAR(DATE_TRUNC('month', lsb.updated_at), 'YYYY-MM') AS bulan_key,
			EXTRACT(MONTH FROM lsb.updated_at)::int AS bulan_num,
			EXTRACT(YEAR FROM lsb.updated_at)::int AS tahun_num,
			COUNT(*)::int
		FROM lsb_1_serah_berkas lsb
		WHERE lsb.trackstatus = 'Diserahkan'
		GROUP BY DATE_TRUNC('month', lsb.updated_at)
		ORDER BY DATE_TRUNC('month', lsb.updated_at) DESC
	`
	rows, err := r.pool.Query(ctx, q)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	bulanNames := []string{"Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"}
	for rows.Next() {
		var key string
		var bulanNum, tahunNum, count int
		if err := rows.Scan(&key, &bulanNum, &tahunNum, &count); err != nil {
			continue
		}
		label := key
		var bulanStr, tahunStr string
		if bulanNum >= 1 && bulanNum <= 12 {
			bulanStr = bulanNames[bulanNum-1]
		}
		if tahunNum > 0 {
			tahunStr = strconv.Itoa(tahunNum)
			label = bulanStr + " " + tahunStr
		}
		months = append(months, LSBMonitoringMonth{
			BulanKey: key, BulanLabel: label, Label: label, BulanDate: key, Count: count,
			Bulan: strPtr(bulanStr), Tahun: strPtr(tahunStr),
		})
		total += count
	}
	return months, total, nil
}

func strPtr(s string) *string { if s == "" { return nil }; return &s }
