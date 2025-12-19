-- ============================================
-- Schema untuk Booking Quota Management
-- ============================================

-- Tabel untuk tracking kuota harian
CREATE TABLE IF NOT EXISTS booking_quota_daily (
    date_key DATE PRIMARY KEY,
    quota_total INT NOT NULL DEFAULT 80,
    quota_used INT NOT NULL DEFAULT 0,
    quota_remaining INT GENERATED ALWAYS AS (quota_total - quota_used) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performance
CREATE INDEX IF NOT EXISTS idx_booking_quota_date ON booking_quota_daily(date_key);
CREATE INDEX IF NOT EXISTS idx_booking_quota_remaining ON booking_quota_daily(quota_remaining) WHERE quota_remaining > 0;

-- Trigger untuk update updated_at
CREATE OR REPLACE FUNCTION update_booking_quota_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_quota_updated_at
    BEFORE UPDATE ON booking_quota_daily
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_quota_updated_at();

-- Tabel untuk queue booking (optional, untuk persistence)
CREATE TABLE IF NOT EXISTS booking_queue (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    booking_data JSONB,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    priority INT DEFAULT 0,
    position INT,
    estimated_wait_time INT, -- dalam detik
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Index untuk queue
CREATE INDEX IF NOT EXISTS idx_booking_queue_status ON booking_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_booking_queue_user ON booking_queue(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_booking_queue_priority ON booking_queue(priority DESC, created_at);

-- Function untuk auto-cleanup queue yang sudah lama (optional)
CREATE OR REPLACE FUNCTION cleanup_old_queue_items()
RETURNS void AS $$
BEGIN
    -- Hapus queue items yang sudah completed/failed lebih dari 7 hari
    DELETE FROM booking_queue
    WHERE status IN ('completed', 'failed')
      AND processed_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- View untuk monitoring quota
CREATE OR REPLACE VIEW v_booking_quota_status AS
SELECT 
    date_key,
    quota_total,
    quota_used,
    quota_remaining,
    ROUND((quota_used::NUMERIC / quota_total::NUMERIC * 100), 2) AS usage_percentage,
    CASE 
        WHEN quota_remaining = 0 THEN 'FULL'
        WHEN quota_remaining <= quota_total * 0.1 THEN 'CRITICAL'
        WHEN quota_remaining <= quota_total * 0.3 THEN 'WARNING'
        ELSE 'NORMAL'
    END AS status,
    created_at,
    updated_at
FROM booking_quota_daily
ORDER BY date_key DESC;

-- View untuk queue statistics
CREATE OR REPLACE VIEW v_booking_queue_stats AS
SELECT 
    status,
    COUNT(*) AS count,
    AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) AS avg_processing_time_seconds,
    MIN(created_at) AS oldest_item,
    MAX(created_at) AS newest_item
FROM booking_queue
GROUP BY status;

-- ============================================
-- Sample Data (untuk testing)
-- ============================================

-- Insert quota untuk hari ini (jika belum ada)
INSERT INTO booking_quota_daily (date_key, quota_total, quota_used)
VALUES (CURRENT_DATE, 80, 0)
ON CONFLICT (date_key) DO NOTHING;

-- ============================================
-- Useful Queries
-- ============================================

-- Check quota hari ini
-- SELECT * FROM booking_quota_daily WHERE date_key = CURRENT_DATE;

-- Check quota status
-- SELECT * FROM v_booking_quota_status WHERE date_key = CURRENT_DATE;

-- Check queue status
-- SELECT * FROM booking_queue WHERE status = 'pending' ORDER BY created_at;

-- Check queue statistics
-- SELECT * FROM v_booking_queue_stats;

