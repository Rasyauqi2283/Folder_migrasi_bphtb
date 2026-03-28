-- 023_peneliti_assignment.sql
-- Penugasan otomatis LTB → Peneliti (kuota 10), antrean UNASSIGNED, audit edit.
-- Sinkron dengan bagian akhir migrasi_to_neon.sql (v penugasan peneliti).
-- Idempotent.

ALTER TABLE IF EXISTS public.p_1_verifikasi
  ADD COLUMN IF NOT EXISTS assigned_to text,
  ADD COLUMN IF NOT EXISTS assignment_status text DEFAULT 'ASSIGNED',
  ADD COLUMN IF NOT EXISTS last_edited_by text,
  ADD COLUMN IF NOT EXISTS last_edited_at timestamptz,
  ADD COLUMN IF NOT EXISTS peneliti_edited_fields jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.p_1_verifikasi.assigned_to IS 'userid Peneliti yang mendapat tugas; NULL jika UNASSIGNED';
COMMENT ON COLUMN public.p_1_verifikasi.assignment_status IS 'ASSIGNED | UNASSIGNED';

CREATE INDEX IF NOT EXISTS idx_p1_verifikasi_assigned_to ON public.p_1_verifikasi (assigned_to);
CREATE INDEX IF NOT EXISTS idx_p1_verifikasi_assignment_status ON public.p_1_verifikasi (assignment_status);
