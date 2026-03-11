-- Password reset OTP (email+NIK) dengan TTL 10 menit, single-use.
-- Flow:
-- 1) request: insert row (otp_hash, otp_expires_at)
-- 2) verify otp: set otp_verified_at + set reset_token_hash + reset_expires_at
-- 3) reset password: set password_reset_at (token single-use)

CREATE TABLE IF NOT EXISTS password_reset_otp (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  nik TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  otp_expires_at TIMESTAMPTZ NOT NULL,
  otp_verified_at TIMESTAMPTZ NULL,
  reset_token_hash TEXT NULL,
  reset_expires_at TIMESTAMPTZ NULL,
  password_reset_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_otp_email_created
  ON password_reset_otp (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_password_reset_otp_reset_expires
  ON password_reset_otp (reset_expires_at);

