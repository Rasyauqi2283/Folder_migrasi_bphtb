-- migrasi_to_neon.sql
-- Incremental DDL untuk sinkron database Neon / staging / produksi.
-- Jalankan setelah baseline schema; idempotent (IF NOT EXISTS).
-- Tambahkan bagian baru di bawah ini untuk setiap fitur DB baru.

-- =====================================================================
-- v024 — PPAT: laporan bulanan, monitoring keterlambatan, job suspend tgl 11
-- Sinkron dengan: backend/sql/024_ppat_laporan_bulanan.sql
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.ppat_laporan_bulanan (
  id BIGSERIAL PRIMARY KEY,
  userid VARCHAR(64) NOT NULL,
  tahun INT NOT NULL,
  bulan INT NOT NULL CHECK (bulan >= 1 AND bulan <= 12),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  file_path TEXT,
  CONSTRAINT uq_ppat_laporan_user_periode UNIQUE (userid, tahun, bulan)
);

CREATE INDEX IF NOT EXISTS idx_ppat_laporan_user ON public.ppat_laporan_bulanan(userid);
CREATE INDEX IF NOT EXISTS idx_ppat_laporan_periode ON public.ppat_laporan_bulanan(tahun, bulan);

COMMENT ON TABLE public.ppat_laporan_bulanan IS 'Submit laporan bulanan PU (periode aktivitas tahun/bulan); jatuh tempo tgl 10 bulan berikutnya.';

CREATE TABLE IF NOT EXISTS public.ppat_job_runs (
  job_name TEXT NOT NULL,
  run_date DATE NOT NULL,
  PRIMARY KEY (job_name, run_date)
);

COMMENT ON TABLE public.ppat_job_runs IS 'Mencegah job suspend otomatis (missing laporan) berjalan ganda pada hari yang sama.';
