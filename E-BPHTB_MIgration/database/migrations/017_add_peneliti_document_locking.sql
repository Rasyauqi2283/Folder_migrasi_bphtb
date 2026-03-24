-- Add locking columns to prevent concurrent claim on p_1_verifikasi documents.
ALTER TABLE public.p_1_verifikasi
  ADD COLUMN IF NOT EXISTS locked_by_user_id character varying(100),
  ADD COLUMN IF NOT EXISTS locked_by_nama character varying(255),
  ADD COLUMN IF NOT EXISTS locked_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_p1_verifikasi_locked_by_user_id
  ON public.p_1_verifikasi (locked_by_user_id);
