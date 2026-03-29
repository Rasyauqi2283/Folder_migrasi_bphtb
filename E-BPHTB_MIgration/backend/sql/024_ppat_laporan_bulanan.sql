-- 024_ppat_laporan_bulanan.sql
-- Pelaporan bulanan PPAT/PPATS/Notaris (aktivitas periode bulan-tahun, jatuh tempo tgl 10 bulan berikutnya).
-- Digunakan untuk monitoring, suspend otomatis (cron), dan unblock saat submit.
-- Sinkron dengan bagian v024 di migrasi_to_neon.sql.

CREATE TABLE IF NOT EXISTS ppat_laporan_bulanan (
  id BIGSERIAL PRIMARY KEY,
  userid VARCHAR(64) NOT NULL,
  tahun INT NOT NULL,
  bulan INT NOT NULL CHECK (bulan >= 1 AND bulan <= 12),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  file_path TEXT,
  CONSTRAINT uq_ppat_laporan_user_periode UNIQUE (userid, tahun, bulan)
);

CREATE INDEX IF NOT EXISTS idx_ppat_laporan_user ON ppat_laporan_bulanan(userid);
CREATE INDEX IF NOT EXISTS idx_ppat_laporan_periode ON ppat_laporan_bulanan(tahun, bulan);

-- Mencegah job suspend ganda jika proses diulang dalam hari yang sama.
CREATE TABLE IF NOT EXISTS ppat_job_runs (
  job_name TEXT NOT NULL,
  run_date DATE NOT NULL,
  PRIMARY KEY (job_name, run_date)
);
