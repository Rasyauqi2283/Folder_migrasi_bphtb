-- =====================================================
-- AUTO DELETE SYSTEM FOR REJECTED DATA
-- Sistem untuk menghapus data yang ditolak setelah 10 hari
-- =====================================================

-- 1. Tabel untuk tracking data yang ditolak
CREATE TABLE IF NOT EXISTS rejected_bookings_tracker (
    id BIGSERIAL PRIMARY KEY,
    nobooking VARCHAR(50) NOT NULL UNIQUE,
    rejection_source VARCHAR(20) NOT NULL CHECK (rejection_source IN ('LTB', 'PV')), -- LTB atau Peneliti Validasi
    rejection_reason TEXT,
    rejected_by VARCHAR(50), -- userid yang menolak
    rejected_at TIMESTAMPTZ DEFAULT NOW(),
    scheduled_delete_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 days'),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel untuk tracking nobooking yang sudah pernah digunakan (untuk mencegah reuse)
CREATE TABLE IF NOT EXISTS used_nobooking_history (
    id BIGSERIAL PRIMARY KEY,
    nobooking VARCHAR(50) NOT NULL UNIQUE,
    original_userid VARCHAR(50),
    original_created_at TIMESTAMPTZ,
    rejection_reason TEXT,
    status VARCHAR(20) DEFAULT 'rejected' CHECK (status IN ('rejected', 'deleted', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index untuk performa
CREATE INDEX IF NOT EXISTS idx_rejected_bookings_tracker_nobooking ON rejected_bookings_tracker(nobooking);
CREATE INDEX IF NOT EXISTS idx_rejected_bookings_tracker_scheduled_delete ON rejected_bookings_tracker(scheduled_delete_at) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_used_nobooking_history_nobooking ON used_nobooking_history(nobooking);
CREATE INDEX IF NOT EXISTS idx_used_nobooking_history_status ON used_nobooking_history(status);

-- 4. Function untuk menambahkan data ke tracker saat ditolak
CREATE OR REPLACE FUNCTION add_rejected_booking(
    p_nobooking VARCHAR(50),
    p_rejection_source VARCHAR(20),
    p_rejection_reason TEXT DEFAULT NULL,
    p_rejected_by VARCHAR(50) DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Insert ke rejected_bookings_tracker
    INSERT INTO rejected_bookings_tracker (
        nobooking, 
        rejection_source, 
        rejection_reason, 
        rejected_by,
        scheduled_delete_at
    ) VALUES (
        p_nobooking, 
        p_rejection_source, 
        p_rejection_reason, 
        p_rejected_by,
        NOW() + INTERVAL '10 days'
    ) ON CONFLICT (nobooking) DO UPDATE SET
        rejection_source = EXCLUDED.rejection_source,
        rejection_reason = EXCLUDED.rejection_reason,
        rejected_by = EXCLUDED.rejected_by,
        scheduled_delete_at = NOW() + INTERVAL '10 days',
        is_deleted = FALSE,
        updated_at = NOW();
    
    -- Insert ke used_nobooking_history untuk mencegah reuse
    INSERT INTO used_nobooking_history (
        nobooking,
        rejection_reason,
        status
    ) VALUES (
        p_nobooking,
        p_rejection_reason,
        'rejected'
    ) ON CONFLICT (nobooking) DO UPDATE SET
        rejection_reason = EXCLUDED.rejection_reason,
        status = 'rejected';
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 5. Function untuk auto-delete data yang sudah 10 hari
CREATE OR REPLACE FUNCTION auto_delete_rejected_data() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    booking_record RECORD;
BEGIN
    -- Ambil semua data yang sudah waktunya dihapus
    FOR booking_record IN 
        SELECT nobooking, rejection_source 
        FROM rejected_bookings_tracker 
        WHERE is_deleted = FALSE 
        AND scheduled_delete_at <= NOW()
    LOOP
        BEGIN
            -- Hapus dari tabel utama berdasarkan source
            IF booking_record.rejection_source = 'LTB' THEN
                -- Hapus dari ltb_1_terima_berkas_sspd
                DELETE FROM ltb_1_terima_berkas_sspd WHERE nobooking = booking_record.nobooking;
                
                -- Hapus dari pat_1_bookingsspd jika ada
                DELETE FROM pat_1_bookingsspd WHERE nobooking = booking_record.nobooking;
                
            ELSIF booking_record.rejection_source = 'PV' THEN
                -- Hapus dari p_1_verifikasi
                DELETE FROM p_1_verifikasi WHERE nobooking = booking_record.nobooking;
                
                -- Hapus dari pat_1_bookingsspd jika ada
                DELETE FROM pat_1_bookingsspd WHERE nobooking = booking_record.nobooking;
            END IF;
            
            -- Update status di tracker
            UPDATE rejected_bookings_tracker 
            SET is_deleted = TRUE, 
                deleted_at = NOW(),
                updated_at = NOW()
            WHERE nobooking = booking_record.nobooking;
            
            -- Update status di history
            UPDATE used_nobooking_history 
            SET status = 'deleted'
            WHERE nobooking = booking_record.nobooking;
            
            deleted_count := deleted_count + 1;
            
        EXCEPTION
            WHEN OTHERS THEN
                -- Log error tapi lanjutkan dengan record berikutnya
                RAISE NOTICE 'Error deleting booking %: %', booking_record.nobooking, SQLERRM;
        END;
    END LOOP;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Function untuk mengecek apakah nobooking sudah pernah digunakan
CREATE OR REPLACE FUNCTION is_nobooking_used(p_nobooking VARCHAR(50)) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM used_nobooking_history 
        WHERE nobooking = p_nobooking
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rejected_bookings_tracker_updated_at
    BEFORE UPDATE ON rejected_bookings_tracker
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. View untuk monitoring data yang akan dihapus
CREATE OR REPLACE VIEW v_rejected_bookings_pending AS
SELECT 
    rbt.id,
    rbt.nobooking,
    rbt.rejection_source,
    rbt.rejection_reason,
    rbt.rejected_by,
    rbt.rejected_at,
    rbt.scheduled_delete_at,
    EXTRACT(EPOCH FROM (rbt.scheduled_delete_at - NOW())) / 86400 AS days_until_delete,
    CASE 
        WHEN rbt.scheduled_delete_at <= NOW() THEN 'READY_TO_DELETE'
        WHEN rbt.scheduled_delete_at <= NOW() + INTERVAL '1 day' THEN 'DELETE_SOON'
        ELSE 'PENDING'
    END AS delete_status
FROM rejected_bookings_tracker rbt
WHERE rbt.is_deleted = FALSE
ORDER BY rbt.scheduled_delete_at ASC;

-- 9. View untuk monitoring nobooking yang sudah pernah digunakan
CREATE OR REPLACE VIEW v_used_nobooking_summary AS
SELECT 
    status,
    COUNT(*) as count,
    MIN(created_at) as earliest_created,
    MAX(created_at) as latest_created
FROM used_nobooking_history
GROUP BY status
ORDER BY status;

-- 10. Stored procedure untuk cleanup manual (untuk testing)
CREATE OR REPLACE FUNCTION manual_cleanup_rejected_data() RETURNS TABLE(
    nobooking VARCHAR(50),
    action VARCHAR(50),
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    booking_record RECORD;
    result_record RECORD;
BEGIN
    FOR booking_record IN 
        SELECT nobooking, rejection_source 
        FROM rejected_bookings_tracker 
        WHERE is_deleted = FALSE 
        AND scheduled_delete_at <= NOW()
    LOOP
        BEGIN
            -- Hapus dari tabel utama
            IF booking_record.rejection_source = 'LTB' THEN
                DELETE FROM ltb_1_terima_berkas_sspd WHERE nobooking = booking_record.nobooking;
                DELETE FROM pat_1_bookingsspd WHERE nobooking = booking_record.nobooking;
            ELSIF booking_record.rejection_source = 'PV' THEN
                DELETE FROM p_1_verifikasi WHERE nobooking = booking_record.nobooking;
                DELETE FROM pat_1_bookingsspd WHERE nobooking = booking_record.nobooking;
            END IF;
            
            -- Update status
            UPDATE rejected_bookings_tracker 
            SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW()
            WHERE nobooking = booking_record.nobooking;
            
            UPDATE used_nobooking_history 
            SET status = 'deleted'
            WHERE nobooking = booking_record.nobooking;
            
            -- Return success
            nobooking := booking_record.nobooking;
            action := 'DELETE';
            success := TRUE;
            message := 'Successfully deleted';
            RETURN NEXT;
            
        EXCEPTION
            WHEN OTHERS THEN
                -- Return error
                nobooking := booking_record.nobooking;
                action := 'DELETE';
                success := FALSE;
                message := SQLERRM;
                RETURN NEXT;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 11. Grant permissions (sesuaikan dengan user database Anda)
-- GRANT EXECUTE ON FUNCTION add_rejected_booking TO your_app_user;
-- GRANT EXECUTE ON FUNCTION auto_delete_rejected_data TO your_app_user;
-- GRANT EXECUTE ON FUNCTION is_nobooking_used TO your_app_user;
-- GRANT EXECUTE ON FUNCTION manual_cleanup_rejected_data TO your_app_user;
-- GRANT SELECT ON v_rejected_bookings_pending TO your_app_user;
-- GRANT SELECT ON v_used_nobooking_summary TO your_app_user;