-- Comprehensive idempotent migration script (Local <-> Production/Neon sync)
-- Project: E-BPHTB Migration
-- Notes:
-- - Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT).
-- - All timestamps use TIMESTAMPTZ to stay consistent with Jakarta (+7) workflows.

BEGIN;

-- =====================================================================
-- 1) Data Locking & Audit (Table: p_1_verifikasi)
--    Purpose:
--    - Prevent concurrent claim/processing via lock columns.
--    - Store audit trail of verification (who/when).
-- =====================================================================

ALTER TABLE public.p_1_verifikasi
  ADD COLUMN IF NOT EXISTS locked_by_user_id varchar(100),
  ADD COLUMN IF NOT EXISTS locked_by_nama varchar(255),
  ADD COLUMN IF NOT EXISTS locked_at timestamptz;

ALTER TABLE public.p_1_verifikasi
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by varchar(100),
  ADD COLUMN IF NOT EXISTS verified_by_nama varchar(255);

-- Index for faster lookups (lock owner / verifier)
CREATE INDEX IF NOT EXISTS idx_p1_verifikasi_locked_by_user_id
  ON public.p_1_verifikasi (locked_by_user_id);

CREATE INDEX IF NOT EXISTS idx_p1_verifikasi_verified_by
  ON public.p_1_verifikasi (verified_by);

-- =====================================================================
-- 2) Paraf Fix & Audit (Table: p_3_clear_to_paraf)
--    Purpose:
--    - Fix missing created_at column (prevents SQLSTATE 42703).
--    - Add audit fields: completed by whom and when.
-- =====================================================================

ALTER TABLE public.p_3_clear_to_paraf
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Audit pengerjaan paraf (selesai kapan & oleh siapa)
ALTER TABLE public.p_3_clear_to_paraf
  ADD COLUMN IF NOT EXISTS paraf_done_at timestamptz,
  ADD COLUMN IF NOT EXISTS paraf_done_by varchar(100),
  ADD COLUMN IF NOT EXISTS paraf_done_by_nama varchar(255);

CREATE INDEX IF NOT EXISTS idx_p3_clear_to_paraf_created_at
  ON public.p_3_clear_to_paraf (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_p3_clear_to_paraf_done_by
  ON public.p_3_clear_to_paraf (paraf_done_by);

-- =====================================================================
-- 3) CS Ticketing System (New Tables)
--    Purpose:
--    - Accept public tickets and allow CS to reply.
--    - Designed to match current backend implementation fields.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.cs_tickets (
  id              bigserial PRIMARY KEY,
  ticket_id       varchar(32) NOT NULL UNIQUE,
  submitter_name  varchar(255) NOT NULL,
  user_email      varchar(255) NOT NULL,
  subject         text NOT NULL,
  message         text NOT NULL,
  status          varchar(32) NOT NULL DEFAULT 'open',
  unread_by_cs    boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cs_tickets_created ON public.cs_tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cs_tickets_unread ON public.cs_tickets (unread_by_cs) WHERE unread_by_cs = true;

CREATE TABLE IF NOT EXISTS public.cs_ticket_replies (
  id                bigserial PRIMARY KEY,
  ticket_id         varchar(32) NOT NULL REFERENCES public.cs_tickets(ticket_id) ON DELETE CASCADE,
  body              text NOT NULL,
  author_type       varchar(16) NOT NULL DEFAULT 'cs',
  created_by_userid varchar(100),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cs_ticket_replies_ticket ON public.cs_ticket_replies (ticket_id, created_at);

-- =====================================================================
-- 4) System Quota (New Table: system_quotas)
--    Purpose:
--    - Persist daily quota limits for categories online/offline.
--    - Seed defaults: online=80, offline=40.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.system_quotas (
  category   text PRIMARY KEY, -- 'online' | 'offline'
  max_limit  integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.system_quotas (category, max_limit)
VALUES
  ('online', 80),
  ('offline', 40)
ON CONFLICT (category) DO NOTHING;

COMMIT;
