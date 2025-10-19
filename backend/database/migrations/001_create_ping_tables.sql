-- =====================================================
-- PING NOTIFICATION SYSTEM - DATABASE MIGRATION
-- =====================================================

-- 1. Tabel untuk menyimpan ping notifications
CREATE TABLE IF NOT EXISTS ping_notifications (
    id SERIAL PRIMARY KEY,
    nobooking VARCHAR(50) NOT NULL,
    no_registrasi VARCHAR(50) NOT NULL,
    target_divisions JSON NOT NULL,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'acknowledged', 'expired')),
    created_at TIMESTAMP DEFAULT NOW(),
    acknowledged_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabel untuk log aktivitas ping
CREATE TABLE IF NOT EXISTS ping_activity_log (
    id SERIAL PRIMARY KEY,
    ping_id INTEGER REFERENCES ping_notifications(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabel untuk real-time sessions
CREATE TABLE IF NOT EXISTS real_time_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    division VARCHAR(20) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabel untuk notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    division VARCHAR(20) NOT NULL,
    enable_ping_notifications BOOLEAN DEFAULT true,
    enable_sound BOOLEAN DEFAULT true,
    enable_popup BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES UNTUK PERFORMANCE
-- =====================================================

-- Index untuk ping_notifications
CREATE INDEX IF NOT EXISTS idx_ping_notifications_nobooking ON ping_notifications(nobooking);
CREATE INDEX IF NOT EXISTS idx_ping_notifications_status ON ping_notifications(status);
CREATE INDEX IF NOT EXISTS idx_ping_notifications_created_at ON ping_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_ping_notifications_target_divisions ON ping_notifications USING GIN(target_divisions);

-- Index untuk ping_activity_log
CREATE INDEX IF NOT EXISTS idx_ping_activity_log_ping_id ON ping_activity_log(ping_id);
CREATE INDEX IF NOT EXISTS idx_ping_activity_log_action ON ping_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_ping_activity_log_created_at ON ping_activity_log(created_at);

-- Index untuk real_time_sessions
CREATE INDEX IF NOT EXISTS idx_real_time_sessions_user_id ON real_time_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_real_time_sessions_division ON real_time_sessions(division);
CREATE INDEX IF NOT EXISTS idx_real_time_sessions_is_active ON real_time_sessions(is_active);

-- Index untuk notification_preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_division ON notification_preferences(division);

-- =====================================================
-- TRIGGERS UNTUK AUTO-UPDATE TIMESTAMP
-- =====================================================

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk ping_notifications
DROP TRIGGER IF EXISTS update_ping_notifications_updated_at ON ping_notifications;
CREATE TRIGGER update_ping_notifications_updated_at
    BEFORE UPDATE ON ping_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk notification_preferences
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA UNTUK TESTING
-- =====================================================

-- Insert sample notification preferences
INSERT INTO notification_preferences (user_id, division, enable_ping_notifications, enable_sound, enable_popup)
VALUES 
    ('admin_001', 'admin', true, true, true),
    ('ltb_001', 'ltb', true, true, true),
    ('bank_001', 'bank', true, true, true),
    ('peneliti_001', 'peneliti', true, false, true),
    ('lsb_001', 'lsb', true, true, false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEWS UNTUK REPORTING
-- =====================================================

-- View untuk ping statistics
CREATE OR REPLACE VIEW ping_statistics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_pings,
    COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_pings,
    COUNT(CASE WHEN status = 'acknowledged' THEN 1 END) as acknowledged_pings,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_pings,
    ROUND(
        COUNT(CASE WHEN status = 'acknowledged' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as acknowledgment_rate
FROM ping_notifications
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View untuk division activity
CREATE OR REPLACE VIEW division_activity AS
SELECT 
    division,
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_sessions,
    MAX(last_activity) as last_activity_time
FROM real_time_sessions
GROUP BY division
ORDER BY total_sessions DESC;

-- =====================================================
-- CLEANUP FUNCTIONS
-- =====================================================

-- Function untuk cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE real_time_sessions 
    SET is_active = false 
    WHERE last_activity < NOW() - INTERVAL '1 hour' AND is_active = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function untuk cleanup old ping notifications
CREATE OR REPLACE FUNCTION cleanup_old_ping_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM ping_notifications 
    WHERE created_at < NOW() - INTERVAL '30 days' AND status = 'acknowledged';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS UNTUK DOKUMENTASI
-- =====================================================

COMMENT ON TABLE ping_notifications IS 'Tabel untuk menyimpan notifikasi ping dari Admin ke divisi lain';
COMMENT ON TABLE ping_activity_log IS 'Log aktivitas untuk setiap ping notification';
COMMENT ON TABLE real_time_sessions IS 'Session pengguna untuk real-time monitoring';
COMMENT ON TABLE notification_preferences IS 'Preferensi notifikasi untuk setiap pengguna';

COMMENT ON COLUMN ping_notifications.target_divisions IS 'Array JSON berisi divisi target (ltb, bank, peneliti, lsb)';
COMMENT ON COLUMN ping_notifications.status IS 'Status ping: sent, acknowledged, expired';
COMMENT ON COLUMN ping_activity_log.action IS 'Aksi yang dilakukan: sent, acknowledged, viewed, expired';
COMMENT ON COLUMN real_time_sessions.division IS 'Divisi pengguna: admin, ltb, bank, peneliti, lsb';

-- =====================================================
-- GRANTS (SESUAIKAN DENGAN USER DATABASE ANDA)
-- =====================================================

-- Grant permissions (sesuaikan dengan user database Anda)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;
