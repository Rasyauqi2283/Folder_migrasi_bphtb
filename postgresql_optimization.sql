-- PostgreSQL Optimization Script untuk Railway
-- Jalankan script ini di Railway PostgreSQL untuk mengurangi checkpoint yang terlalu sering

-- 1. Optimasi Checkpoint Settings
-- Meningkatkan checkpoint_timeout untuk mengurangi frekuensi checkpoint
ALTER SYSTEM SET checkpoint_timeout = '15min';  -- Default: 5min, diubah ke 15min

-- 2. Optimasi WAL Settings
-- Meningkatkan max_wal_size untuk mengurangi checkpoint
ALTER SYSTEM SET max_wal_size = '2GB';          -- Default: 1GB, diubah ke 2GB
ALTER SYSTEM SET min_wal_size = '80MB';         -- Default: 80MB, tetap sama

-- 3. Optimasi Shared Buffers (jika memungkinkan di Railway)
-- ALTER SYSTEM SET shared_buffers = '256MB';   -- Uncomment jika Railway mengizinkan

-- 4. Optimasi Checkpoint Completion Target
-- Meningkatkan checkpoint_completion_target untuk spread checkpoint load
ALTER SYSTEM SET checkpoint_completion_target = 0.9;  -- Default: 0.5, diubah ke 0.9

-- 5. Optimasi WAL Writer
-- Meningkatkan wal_writer_delay untuk mengurangi WAL writes
ALTER SYSTEM SET wal_writer_delay = '200ms';    -- Default: 200ms, tetap sama

-- 6. Optimasi Background Writer
-- Mengurangi bgwriter_delay untuk lebih frequent background writes
ALTER SYSTEM SET bgwriter_delay = '200ms';      -- Default: 200ms, tetap sama
ALTER SYSTEM SET bgwriter_lru_maxpages = 100;   -- Default: 100, tetap sama
ALTER SYSTEM SET bgwriter_lru_multiplier = 2.0; -- Default: 2.0, tetap sama

-- 7. Optimasi Logging (untuk mengurangi log noise)
-- Mengurangi log level untuk checkpoint messages
ALTER SYSTEM SET log_checkpoints = 'off';       -- Matikan log checkpoint
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log query > 1 detik

-- 8. Optimasi Connection Settings
-- Meningkatkan max_connections jika diperlukan
-- ALTER SYSTEM SET max_connections = 100;      -- Uncomment jika diperlukan

-- 9. Optimasi Memory Settings
-- Meningkatkan work_mem untuk query yang lebih efisien
ALTER SYSTEM SET work_mem = '4MB';              -- Default: 4MB, tetap sama
ALTER SYSTEM SET maintenance_work_mem = '64MB'; -- Default: 64MB, tetap sama

-- 10. Optimasi Autovacuum (untuk maintenance yang lebih efisien)
ALTER SYSTEM SET autovacuum = 'on';             -- Pastikan autovacuum aktif
ALTER SYSTEM SET autovacuum_max_workers = 3;    -- Default: 3, tetap sama
ALTER SYSTEM SET autovacuum_naptime = '1min';   -- Default: 1min, tetap sama

-- Reload konfigurasi tanpa restart
SELECT pg_reload_conf();

-- Verifikasi konfigurasi yang telah diubah
SELECT name, setting, unit, context 
FROM pg_settings 
WHERE name IN (
    'checkpoint_timeout',
    'max_wal_size', 
    'min_wal_size',
    'checkpoint_completion_target',
    'wal_writer_delay',
    'bgwriter_delay',
    'log_checkpoints',
    'log_min_duration_statement',
    'work_mem',
    'maintenance_work_mem',
    'autovacuum',
    'autovacuum_max_workers',
    'autovacuum_naptime'
)
ORDER BY name;
