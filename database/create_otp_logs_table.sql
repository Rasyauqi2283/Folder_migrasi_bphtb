-- Tabel untuk menyimpan log OTP yang gagal dikirim
-- Ini berguna untuk admin bisa melihat OTP yang tidak terkirim via email

CREATE TABLE IF NOT EXISTS otp_logs (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'failed_to_send',
    notes TEXT
);

-- Index untuk pencarian berdasarkan email
CREATE INDEX IF NOT EXISTS idx_otp_logs_email ON otp_logs(email);

-- Index untuk pencarian berdasarkan tanggal
CREATE INDEX IF NOT EXISTS idx_otp_logs_created_at ON otp_logs(created_at);

-- Komentar tabel
COMMENT ON TABLE otp_logs IS 'Log OTP yang gagal dikirim via email untuk manual verification';
COMMENT ON COLUMN otp_logs.email IS 'Email penerima OTP';
COMMENT ON COLUMN otp_logs.otp IS 'Kode OTP yang gagal dikirim';
COMMENT ON COLUMN otp_logs.status IS 'Status pengiriman: failed_to_send, sent, verified';
COMMENT ON COLUMN otp_logs.notes IS 'Catatan tambahan dari admin';
