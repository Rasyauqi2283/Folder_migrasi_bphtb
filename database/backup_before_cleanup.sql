-- BACKUP DATA SEBELUM CLEANUP
-- Dibuat: 2025-10-03
-- Tujuan: Backup data booking sebelum menghapus data yang tidak diperlukan

-- Backup semua data booking
CREATE TABLE IF NOT EXISTS pat_1_bookingsspd_backup_20251003 AS 
SELECT * FROM pat_1_bookingsspd;

-- Backup data yang akan dipertahankan (trackstatus = 'Diserahkan')
CREATE TABLE IF NOT EXISTS pat_1_bookingsspd_keep_20251003 AS 
SELECT * FROM pat_1_bookingsspd WHERE trackstatus = 'Diserahkan';

-- Backup data yang akan dihapus
CREATE TABLE IF NOT EXISTS pat_1_bookingsspd_delete_20251003 AS 
SELECT * FROM pat_1_bookingsspd WHERE trackstatus != 'Diserahkan';

-- Tampilkan statistik
SELECT 
    'Total Records' as category,
    COUNT(*) as count
FROM pat_1_bookingsspd
UNION ALL
SELECT 
    'Records to Keep (Diserahkan)' as category,
    COUNT(*) as count
FROM pat_1_bookingsspd WHERE trackstatus = 'Diserahkan'
UNION ALL
SELECT 
    'Records to Delete' as category,
    COUNT(*) as count
FROM pat_1_bookingsspd WHERE trackstatus != 'Diserahkan';
