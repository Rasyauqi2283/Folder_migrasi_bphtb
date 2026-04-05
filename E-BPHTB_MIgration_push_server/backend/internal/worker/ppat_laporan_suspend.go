package worker

import (
	"context"
	"log"
	"time"

	"ebphtb/backend/internal/repository"

	"github.com/jackc/pgx/v5/pgxpool"
)

// StartPpatLaporanSuspendJob menjalankan penangguhan otomatis setiap tanggal 11 pukul 00:01 (Asia/Jakarta)
// bagi PPAT yang belum mengunggah laporan untuk periode aktivitas bulan sebelumnya.
func StartPpatLaporanSuspendJob(pool *pgxpool.Pool, lap *repository.PpatLaporanRepo) {
	if pool == nil || lap == nil || lap.Pool() == nil {
		return
	}
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		loc = time.Local
	}
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()
		var lastKey string
		for range ticker.C {
			now := time.Now().In(loc)
			if now.Day() != 11 || now.Hour() != 0 || now.Minute() != 1 {
				continue
			}
			key := now.Format("2006-01-02")
			if key == lastKey {
				continue
			}
			lastKey = key
			prev := now.AddDate(0, -1, 0)
			y, m := prev.Year(), int(prev.Month())
			ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
			ok, err := lap.TryMarkJobRun(ctx, "suspend_missing_laporan", key)
			cancel()
			if err != nil {
				log.Printf("[PPAT_SUSPEND_JOB] TryMarkJobRun: %v", err)
				continue
			}
			if !ok {
				continue
			}
			ctx2, cancel2 := context.WithTimeout(context.Background(), 3*time.Minute)
			n, err := lap.SuspendUsersMissingLaporan(ctx2, y, m)
			cancel2()
			if err != nil {
				log.Printf("[PPAT_SUSPEND_JOB] SuspendUsersMissingLaporan: %v", err)
				continue
			}
			log.Printf("[PPAT_SUSPEND_JOB] suspended %d users for period %04d-%02d", n, y, m)
		}
	}()
}
