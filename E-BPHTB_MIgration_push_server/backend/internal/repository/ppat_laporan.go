package repository

import (
	"context"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PpatLaporanRepo menyimpan submit laporan bulanan PPAT.
type PpatLaporanRepo struct {
	pool *pgxpool.Pool
}

func NewPpatLaporanRepo(pool *pgxpool.Pool) *PpatLaporanRepo {
	return &PpatLaporanRepo{pool: pool}
}

// Pool returns underlying pool (nil if none).
func (r *PpatLaporanRepo) Pool() *pgxpool.Pool {
	if r == nil {
		return nil
	}
	return r.pool
}

// UpsertSubmission menyimpan atau memperbarui laporan untuk periode aktivitas (tahun/bulan).
func (r *PpatLaporanRepo) UpsertSubmission(ctx context.Context, userid string, tahun, bulan int, filePath *string) error {
	if r == nil || r.pool == nil || userid == "" {
		return errors.New("invalid repo")
	}
	_, err := r.pool.Exec(ctx, `
		INSERT INTO ppat_laporan_bulanan (userid, tahun, bulan, submitted_at, file_path)
		VALUES ($1, $2, $3, now(), $4)
		ON CONFLICT (userid, tahun, bulan) DO UPDATE SET
		  submitted_at = now(),
		  file_path = COALESCE(EXCLUDED.file_path, ppat_laporan_bulanan.file_path)
	`, userid, tahun, bulan, filePath)
	return err
}

// HasSubmission true jika sudah ada laporan untuk periode aktivitas.
func (r *PpatLaporanRepo) HasSubmission(ctx context.Context, userid string, tahun, bulan int) (bool, error) {
	if r == nil || r.pool == nil || userid == "" {
		return false, nil
	}
	var n int
	err := r.pool.QueryRow(ctx,
		`SELECT 1 FROM ppat_laporan_bulanan WHERE userid=$1 AND tahun=$2 AND bulan=$3`,
		userid, tahun, bulan,
	).Scan(&n)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

// TryMarkJobRun mengembalikan true jika ini pertama kali job dijalankan untuk tanggal tersebut.
func (r *PpatLaporanRepo) TryMarkJobRun(ctx context.Context, jobName string, runDate string) (bool, error) {
	if r == nil || r.pool == nil {
		return false, errors.New("invalid repo")
	}
	ct, err := r.pool.Exec(ctx,
		`INSERT INTO ppat_job_runs (job_name, run_date) VALUES ($1, $2::date) ON CONFLICT DO NOTHING`,
		jobName, runDate,
	)
	if err != nil {
		return false, err
	}
	return ct.RowsAffected() > 0, nil
}

// PpatMonitoringRow satu baris untuk dashboard monitoring.
type PpatMonitoringRow struct {
	Userid            string
	NamaPejabat       string
	NIP               string
	PeriodeTahun      int
	PeriodeBulan      int
	JatuhTempoRFC3339 string
	HariTerlambat     int
	StatusPpat        string
	StatusAkun        string // aktif | peringatan | terblokir
	SudahLapor        bool
}

// ListMonitoringCompliance menghasilkan satu baris per pejabat untuk periode aktivitas (tahun/bulan).
func (r *PpatLaporanRepo) ListMonitoringCompliance(ctx context.Context, activityYear, activityMonth int, search string, onlyUserid string) ([]PpatMonitoringRow, error) {
	if r == nil || r.pool == nil {
		return nil, nil
	}
	q := `
		SELECT u.userid,
			COALESCE(NULLIF(TRIM(u.pejabat_umum),''), u.nama, '') AS nama_pejabat,
			COALESCE(u.nip, '') AS nip,
			COALESCE(u.status_ppat, '') AS status_ppat
		FROM a_2_verified_users u
		WHERE u.verifiedstatus = 'complete'
		  AND u.divisi IN ('PPAT','PPATS','Notaris')
		  AND ($1 = '' OR u.userid = $1)
		  AND (
			$2 = '' OR
			LOWER(u.nama) LIKE '%' || $2 || '%' OR
			LOWER(COALESCE(u.userid,'')) LIKE '%' || $2 || '%' OR
			LOWER(COALESCE(u.nip,'')) LIKE '%' || $2 || '%' OR
			LOWER(COALESCE(u.pejabat_umum,'')) LIKE '%' || $2 || '%'
		  )
		ORDER BY nama_pejabat
	`
	s := strings.ToLower(strings.TrimSpace(search))
	searchArg := ""
	if s != "" {
		searchArg = s
	}
	only := strings.TrimSpace(onlyUserid)
	rows, err := r.pool.Query(ctx, q, only, searchArg)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []PpatMonitoringRow
	for rows.Next() {
		var userid, nama, nip, st string
		if err := rows.Scan(&userid, &nama, &nip, &st); err != nil {
			return nil, err
		}
		var ok bool
		_ = r.pool.QueryRow(ctx,
			`SELECT EXISTS(SELECT 1 FROM ppat_laporan_bulanan WHERE userid=$1 AND tahun=$2 AND bulan=$3)`,
			userid, activityYear, activityMonth,
		).Scan(&ok)
		out = append(out, PpatMonitoringRow{
			Userid:       userid,
			NamaPejabat:  nama,
			NIP:          nip,
			PeriodeTahun: activityYear,
			PeriodeBulan: activityMonth,
			StatusPpat:   strings.TrimSpace(strings.ToLower(st)),
			SudahLapor:   ok,
		})
	}
	return out, rows.Err()
}

// SuspendUsersMissingLaporan meng-set status_ppat = suspend bagi yang belum mengirim laporan periode tersebut.
func (r *PpatLaporanRepo) SuspendUsersMissingLaporan(ctx context.Context, activityYear, activityMonth int) (int64, error) {
	if r == nil || r.pool == nil {
		return 0, errors.New("invalid repo")
	}
	ct, err := r.pool.Exec(ctx, `
		UPDATE a_2_verified_users u SET status_ppat = 'suspend'
		WHERE u.verifiedstatus = 'complete'
		  AND u.divisi IN ('PPAT','PPATS','Notaris')
		  AND COALESCE(LOWER(TRIM(u.status_ppat)), '') NOT IN ('meninggal', 'pindah kerja', 'suspend')
		  AND NOT EXISTS (
			SELECT 1 FROM ppat_laporan_bulanan l
			WHERE l.userid = u.userid AND l.tahun = $1 AND l.bulan = $2
		  )
	`, activityYear, activityMonth)
	if err != nil {
		return 0, err
	}
	return ct.RowsAffected(), nil
}
