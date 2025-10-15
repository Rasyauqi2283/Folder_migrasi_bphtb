-- Tabel untuk tracking kuota booking harian
CREATE TABLE IF NOT EXISTS booking_daily_counters (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    daily_sequence INTEGER NOT NULL DEFAULT 1,
    booking_number VARCHAR(50),
    user_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_booking_daily_counters_date ON booking_daily_counters(date);
CREATE INDEX IF NOT EXISTS idx_booking_daily_counters_user_id ON booking_daily_counters(user_id);

-- Tabel untuk tracking kuota per tanggal (untuk monitoring)
CREATE TABLE IF NOT EXISTS daily_quota_tracking (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_bookings INTEGER DEFAULT 0,
    quota_limit INTEGER DEFAULT 80,
    first_booking_number VARCHAR(50),
    last_booking_number VARCHAR(50),
    is_quota_full BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_daily_quota_tracking_date ON daily_quota_tracking(date);
CREATE INDEX IF NOT EXISTS idx_daily_quota_tracking_is_full ON daily_quota_tracking(is_quota_full);

-- Function untuk update quota tracking otomatis
CREATE OR REPLACE FUNCTION update_daily_quota_tracking()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO daily_quota_tracking (date, total_bookings, quota_limit, first_booking_number, last_booking_number, is_quota_full)
    VALUES (
        DATE(NEW.created_at),
        1,
        80,
        NEW.nobooking,
        NEW.nobooking,
        FALSE
    )
    ON CONFLICT (date) DO UPDATE SET
        total_bookings = daily_quota_tracking.total_bookings + 1,
        last_booking_number = NEW.nobooking,
        is_quota_full = (daily_quota_tracking.total_bookings + 1) >= 80,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update quota tracking
DROP TRIGGER IF EXISTS trigger_update_daily_quota ON pat_1_bookingsspd;
CREATE TRIGGER trigger_update_daily_quota
    AFTER INSERT ON pat_1_bookingsspd
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_quota_tracking();

-- View untuk monitoring kuota
CREATE OR REPLACE VIEW v_quota_monitoring AS
SELECT 
    dqt.date,
    dqt.total_bookings,
    dqt.quota_limit,
    dqt.quota_limit - dqt.total_bookings as remaining_quota,
    ROUND((dqt.total_bookings::DECIMAL / dqt.quota_limit) * 100, 2) as usage_percentage,
    dqt.first_booking_number,
    dqt.last_booking_number,
    dqt.is_quota_full,
    CASE 
        WHEN dqt.is_quota_full THEN 'FULL'
        WHEN (dqt.quota_limit - dqt.total_bookings) <= 5 THEN 'CRITICAL'
        WHEN (dqt.quota_limit - dqt.total_bookings) <= 20 THEN 'WARNING'
        ELSE 'NORMAL'
    END as status
FROM daily_quota_tracking dqt
ORDER BY dqt.date DESC;

-- Function untuk mendapatkan nomor booking berikutnya
CREATE OR REPLACE FUNCTION get_next_booking_number(p_target_date DATE, p_user_id VARCHAR(50))
RETURNS TABLE(
    booking_number VARCHAR(50),
    daily_sequence INTEGER,
    global_sequence INTEGER,
    remaining_quota INTEGER
) AS $$
DECLARE
    v_year INTEGER;
    v_day_of_year INTEGER;
    v_daily_bookings INTEGER;
    v_global_sequence INTEGER;
    v_daily_sequence INTEGER;
    v_booking_number VARCHAR(50);
BEGIN
    -- Validasi tanggal tidak boleh di masa lalu
    IF p_target_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Tidak dapat membuat booking untuk tanggal yang sudah lewat';
    END IF;
    
    -- Hitung hari sejak awal tahun
    v_year := EXTRACT(YEAR FROM p_target_date);
    v_day_of_year := EXTRACT(DOY FROM p_target_date);
    
    -- Hitung booking yang sudah dibuat untuk tanggal tersebut
    SELECT COUNT(*) INTO v_daily_bookings
    FROM pat_1_bookingsspd 
    WHERE DATE(created_at) = p_target_date;
    
    -- Validasi kuota harian
    IF v_daily_bookings >= 80 THEN
        RAISE EXCEPTION 'Kuota harian sudah terpenuhi (80 booking)';
    END IF;
    
    -- Generate nomor booking
    v_global_sequence := ((v_day_of_year - 1) * 80) + v_daily_bookings + 1;
    v_daily_sequence := v_daily_bookings + 1;
    v_booking_number := v_year || 'O' || LPAD(v_global_sequence::TEXT, 5, '0');
    
    -- Update counter
    INSERT INTO booking_daily_counters (date, daily_sequence, booking_number, user_id)
    VALUES (p_target_date, v_daily_sequence, v_booking_number, p_user_id)
    ON CONFLICT (date) DO UPDATE SET
        daily_sequence = EXCLUDED.daily_sequence,
        booking_number = EXCLUDED.booking_number,
        user_id = EXCLUDED.user_id,
        updated_at = NOW();
    
    RETURN QUERY SELECT 
        v_booking_number,
        v_daily_sequence,
        v_global_sequence,
        (80 - v_daily_bookings - 1);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
-- GRANT EXECUTE ON FUNCTION get_next_booking_number TO your_app_user;
-- GRANT SELECT ON v_quota_monitoring TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON booking_daily_counters TO your_app_user;
-- GRANT SELECT ON daily_quota_tracking TO your_app_user;
