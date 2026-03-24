-- Audit trail for Peneliti verification (Jakarta time expected from backend writes)
ALTER TABLE public.p_1_verifikasi
  ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS verified_by character varying(100),
  ADD COLUMN IF NOT EXISTS verified_by_nama character varying(255);

CREATE INDEX IF NOT EXISTS idx_p1_verifikasi_verified_by
  ON public.p_1_verifikasi (verified_by);
