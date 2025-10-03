-- CLEANUP DATA BOOKING - HAPUS SEMUA KECUALI YANG SUDAH SELESAI
-- Dibuat: 2025-10-03
-- Tujuan: Menghapus semua data booking kecuali yang trackstatus = 'Diserahkan'

-- ========================================
-- STEP 1: BACKUP DATA (Safety First)
-- ========================================

-- Backup semua data sebelum cleanup
CREATE TABLE IF NOT EXISTS pat_1_bookingsspd_backup_20251003 AS 
SELECT * FROM pat_1_bookingsspd;

-- Backup data yang akan dipertahankan
CREATE TABLE IF NOT EXISTS pat_1_bookingsspd_keep_20251003 AS 
SELECT * FROM pat_1_bookingsspd WHERE trackstatus = 'Diserahkan';

-- Backup data yang akan dihapus
CREATE TABLE IF NOT EXISTS pat_1_bookingsspd_delete_20251003 AS 
SELECT * FROM pat_1_bookingsspd WHERE trackstatus != 'Diserahkan';

-- ========================================
-- STEP 2: TAMPILKAN STATISTIK SEBELUM CLEANUP
-- ========================================

SELECT 
    'BEFORE CLEANUP' as status,
    'Total Records' as category,
    COUNT(*) as count
FROM pat_1_bookingsspd
UNION ALL
SELECT 
    'BEFORE CLEANUP' as status,
    'Records to Keep (Diserahkan)' as category,
    COUNT(*) as count
FROM pat_1_bookingsspd WHERE trackstatus = 'Diserahkan'
UNION ALL
SELECT 
    'BEFORE CLEANUP' as status,
    'Records to Delete' as category,
    COUNT(*) as count
FROM pat_1_bookingsspd WHERE trackstatus != 'Diserahkan';

-- ========================================
-- STEP 3: HAPUS DATA YANG TIDAK DIPERLUKAN
-- ========================================

-- Hapus semua data kecuali yang trackstatus = 'Diserahkan'
DELETE FROM pat_1_bookingsspd 
WHERE trackstatus != 'Diserahkan';

-- ========================================
-- STEP 4: TAMPILKAN STATISTIK SETELAH CLEANUP
-- ========================================

SELECT 
    'AFTER CLEANUP' as status,
    'Remaining Records' as category,
    COUNT(*) as count
FROM pat_1_bookingsspd;

-- ========================================
-- STEP 5: TAMPILKAN DATA YANG TERSISA
-- ========================================

SELECT 
    bookingid,
    userid,
    nobooking,
    namawajibpajak,
    trackstatus,
    created_at,
    updated_at
FROM pat_1_bookingsspd 
ORDER BY bookingid;

-- ========================================
-- STEP 6: VERIFIKASI CLEANUP
-- ========================================

-- Pastikan hanya data dengan trackstatus = 'Diserahkan' yang tersisa
SELECT 
    CASE 
        WHEN COUNT(*) = (SELECT COUNT(*) FROM pat_1_bookingsspd WHERE trackstatus = 'Diserahkan') 
        THEN '✅ CLEANUP SUCCESS - Only Diserahkan records remain'
        ELSE '❌ CLEANUP FAILED - Some non-Diserahkan records still exist'
    END as cleanup_status,
    COUNT(*) as total_remaining,
    (SELECT COUNT(*) FROM pat_1_bookingsspd WHERE trackstatus = 'Diserahkan') as diserahkan_count
FROM pat_1_bookingsspd;
