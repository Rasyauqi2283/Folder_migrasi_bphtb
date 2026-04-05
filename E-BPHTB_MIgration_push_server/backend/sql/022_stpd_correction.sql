-- 022_stpd_correction.sql
-- Add columns to support STPD kurang bayar flow and correction/resubmission lifecycle.
-- Idempotent: safe to run multiple times.

ALTER TABLE IF EXISTS public.p_1_verifikasi
  ADD COLUMN IF NOT EXISTS verification_state varchar(32),
  ADD COLUMN IF NOT EXISTS stpd_code varchar(32),
  ADD COLUMN IF NOT EXISTS catatan_peneliti text,
  ADD COLUMN IF NOT EXISTS catatan_pu text,
  ADD COLUMN IF NOT EXISTS bukti_pelunasan_path text,
  ADD COLUMN IF NOT EXISTS correction_updated_at timestamptz;

-- Helpful indexes for dashboard/alerts.
CREATE INDEX IF NOT EXISTS idx_p1_verifikasi_verification_state ON public.p_1_verifikasi (verification_state);
CREATE INDEX IF NOT EXISTS idx_p1_verifikasi_stpd_code ON public.p_1_verifikasi (stpd_code);

