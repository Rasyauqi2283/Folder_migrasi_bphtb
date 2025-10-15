-- Tabel untuk tracking booking dengan sistem akumulasi global
CREATE TABLE IF NOT EXISTS booking_global_tracking (
    id SERIAL PRIMARY KEY,
    target_date DATE NOT NULL,
    booking_number VARCHAR(50) NOT NULL UNIQUE,
    user_id VARCHAR(50) NOT NULL,
    global_sequence INTEGER NOT NULL,
    daily_sequence INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_booking_global_tracking_date ON booking_global_tracking(target_date);
CREATE INDEX IF NOT EXISTS idx_booking_global_tracking_booking_number ON booking_global_tracking(booking_number);
CREATE INDEX IF NOT EXISTS idx_booking_global_tracking_global_sequence ON booking_global_tracking(global_sequence);
CREATE INDEX IF NOT EXISTS idx_booking_global_tracking_user_id ON booking_global_tracking(user_id);

-- Tabel untuk tracking kuota harian (update dari sistem lama)
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

-- Function untuk generate nomor booking dengan akumulasi global
CREATE OR REPLACE FUNCTION get_global_accumulation_booking_number(
    p_target_date DATE, 
    p_user_id VARCHAR(50)
)
RETURNS TABLE(
    booking_number VARCHAR(50),
    global_sequence INTEGER,
    daily_sequence INTEGER,
    total_previous INTEGER,
    daily_count INTEGER,
    remaining_quota INTEGER
) AS $$
DECLARE
    v_year INTEGER;
    v_start_of_year DATE;
    v_total_previous INTEGER;
    v_daily_count INTEGER;
    v_global_sequence INTEGER;
    v_daily_sequence INTEGER;
    v_booking_number VARCHAR(50);
    v_daily_limit INTEGER := 80;
BEGIN
    -- Validasi tanggal tidak boleh di masa lalu
    IF p_target_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Tidak dapat membuat booking untuk tanggal yang sudah lewat';
    END IF;
    
    -- Validasi maksimal 30 hari ke depan
    IF p_target_date > (CURRENT_DATE + INTERVAL '30 days') THEN
        RAISE EXCEPTION 'Booking maksimal 30 hari ke depan';
    END IF;
    
    -- Hitung tahun dan tanggal awal tahun
    v_year := EXTRACT(YEAR FROM p_target_date);
    v_start_of_year := DATE(v_year || '-01-01');
    
    -- Hitung total booking dari awal tahun sampai tanggal target (tidak termasuk)
    SELECT COUNT(*) INTO v_total_previous
    FROM pat_1_bookingsspd 
    WHERE created_at >= v_start_of_year 
    AND DATE(created_at) < p_target_date;
    
    -- Hitung booking di tanggal target hari ini
    SELECT COUNT(*) INTO v_daily_count
    FROM pat_1_bookingsspd 
    WHERE DATE(created_at) = p_target_date;
    
    -- Validasi kuota harian
    IF v_daily_count >= v_daily_limit THEN
        RAISE EXCEPTION 'Kuota harian sudah terpenuhi (80 booking)';
    END IF;
    
    -- Generate nomor booking dengan akumulasi global
    v_global_sequence := v_total_previous + v_daily_count + 1;
    v_daily_sequence := v_daily_count + 1;
    v_booking_number := v_year || 'O' || LPAD(v_global_sequence::TEXT, 5, '0');
    
    -- Simpan ke tracking table
    INSERT INTO booking_global_tracking (
        target_date, 
        booking_number, 
        user_id, 
        global_sequence, 
        daily_sequence
    ) VALUES (
        p_target_date, 
        v_booking_number, 
        p_user_id, 
        v_global_sequence, 
        v_daily_sequence
    );
    
    -- Update daily quota tracking
    INSERT INTO daily_quota_tracking (
        date, 
        total_bookings, 
        quota_limit, 
        first_booking_number, 
        last_booking_number
    ) VALUES (
        p_target_date, 
        1, 
        v_daily_limit, 
        v_booking_number, 
        v_booking_number
    )
    ON CONFLICT (date) DO UPDATE SET
        total_bookings = daily_quota_tracking.total_bookings + 1,
        last_booking_number = EXCLUDED.last_booking_number,
        is_quota_full = (daily_quota_tracking.total_bookings + 1) >= v_daily_limit,
        updated_at = NOW();
    
    RETURN QUERY SELECT 
        v_booking_number,
        v_global_sequence,
        v_daily_sequence,
        v_total_previous,
        v_daily_count,
        (v_daily_limit - v_daily_count - 1);
END;
$$ LANGUAGE plpgsql;

-- View untuk monitoring akumulasi global
CREATE OR REPLACE VIEW v_global_booking_monitoring AS
SELECT 
    DATE(created_at) as booking_date,
    COUNT(*) as daily_bookings,
    MIN(nobooking) as first_booking_of_day,
    MAX(nobooking) as last_booking_of_day,
    -- Hitung akumulasi global
    (
        SELECT COUNT(*) 
        FROM pat_1_bookingsspd b2 
        WHERE DATE(b2.created_at) <= DATE(pb.created_at)
    ) as cumulative_bookings,
    -- Hitung sisa kuota
    (80 - COUNT(*)) as remaining_daily_quota,
    CASE 
        WHEN COUNT(*) >= 80 THEN 'FULL'
        WHEN (80 - COUNT(*)) <= 5 THEN 'CRITICAL'
        WHEN (80 - COUNT(*)) <= 20 THEN 'WARNING'
        ELSE 'NORMAL'
    END as quota_status
FROM pat_1_bookingsspd pb
GROUP BY DATE(created_at)
ORDER BY booking_date DESC;

-- View untuk statistik global
CREATE OR REPLACE VIEW v_global_booking_summary AS
SELECT 
    EXTRACT(YEAR FROM created_at) as year,
    COUNT(*) as total_bookings,
    MIN(created_at) as first_booking_date,
    MAX(created_at) as last_booking_date,
    MIN(nobooking) as first_booking_number,
    MAX(nobooking) as last_booking_number,
    COUNT(DISTINCT DATE(created_at)) as active_days,
    ROUND(AVG(daily_count), 2) as avg_bookings_per_day
FROM (
    SELECT 
        created_at,
        nobooking,
        COUNT(*) OVER (PARTITION BY DATE(created_at)) as daily_count
    FROM pat_1_bookingsspd
) pb
GROUP BY EXTRACT(YEAR FROM created_at);

-- Function untuk mendapatkan statistik booking per tanggal
CREATE OR REPLACE FUNCTION get_booking_stats_by_date_range(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    booking_date DATE,
    daily_count INTEGER,
    cumulative_count INTEGER,
    first_booking VARCHAR(50),
    last_booking VARCHAR(50),
    remaining_quota INTEGER,
    quota_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(pb.created_at) as booking_date,
        COUNT(*)::INTEGER as daily_count,
        (
            SELECT COUNT(*)::INTEGER 
            FROM pat_1_bookingsspd b2 
            WHERE DATE(b2.created_at) <= DATE(pb.created_at)
        ) as cumulative_count,
        MIN(pb.nobooking) as first_booking,
        MAX(pb.nobooking) as last_booking,
        (80 - COUNT(*))::INTEGER as remaining_quota,
        CASE 
            WHEN COUNT(*) >= 80 THEN 'FULL'
            WHEN (80 - COUNT(*)) <= 5 THEN 'CRITICAL'
            WHEN (80 - COUNT(*)) <= 20 THEN 'WARNING'
            ELSE 'NORMAL'
        END as quota_status
    FROM pat_1_bookingsspd pb
    WHERE DATE(pb.created_at) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(pb.created_at)
    ORDER BY booking_date;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (sesuaikan dengan user database Anda)
-- GRANT EXECUTE ON FUNCTION get_global_accumulation_booking_number TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_booking_stats_by_date_range TO your_app_user;
-- GRANT SELECT ON v_global_booking_monitoring TO your_app_user;
-- GRANT SELECT ON v_global_booking_summary TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON booking_global_tracking TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON daily_quota_tracking TO your_app_user;
