-- System status / maintenance mode flags.
-- Purpose:
-- - Toggle ONLINE/OFFLINE without redeploy (DB-driven).
-- - Provide maintenance banner message and estimated time.

CREATE TABLE IF NOT EXISTS system_status (
  key text PRIMARY KEY,
  value text NOT NULL,
  message text,
  scheduled_at timestamptz,
  eta_done_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_status_updated_at ON system_status (updated_at DESC);

-- Seed: online by default (idempotent).
INSERT INTO system_status (key, value, message)
VALUES ('maintenance_mode', 'online', NULL)
ON CONFLICT (key) DO NOTHING;

