-- 016_add_ppat_send_queue_and_daily_quota.sql
-- Menambahkan tabel pendukung fitur send-now / schedule-send PPAT.

BEGIN;

CREATE TABLE IF NOT EXISTS public.ppat_daily_quota (
    quota_date date PRIMARY KEY,
    used_count integer NOT NULL DEFAULT 0,
    limit_count integer NOT NULL DEFAULT 80,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ppat_send_queue (
    id bigserial PRIMARY KEY,
    nobooking character varying(255) NOT NULL,
    userid character varying(255) NOT NULL,
    scheduled_for date NOT NULL,
    status character varying(30) NOT NULL DEFAULT 'queued',
    sent_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_ppat_send_queue_nobooking
    ON public.ppat_send_queue (nobooking);

CREATE INDEX IF NOT EXISTS idx_ppat_send_queue_schedule_status
    ON public.ppat_send_queue (scheduled_for, status);

CREATE INDEX IF NOT EXISTS idx_ppat_send_queue_userid
    ON public.ppat_send_queue (userid);

COMMIT;
