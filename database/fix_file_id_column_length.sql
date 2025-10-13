-- Fix file_id column length for Railway storage
-- Railway storage relative paths can be very long, need to increase column length

-- Start transaction
BEGIN;

-- Update file_id columns to support longer paths
ALTER TABLE pat_1_bookingsspd 
ALTER COLUMN akta_tanah_file_id TYPE VARCHAR(500),
ALTER COLUMN sertifikat_tanah_file_id TYPE VARCHAR(500),
ALTER COLUMN pelengkap_file_id TYPE VARCHAR(500),
ALTER COLUMN pdf_dokumen_file_id TYPE VARCHAR(500),
ALTER COLUMN file_withstempel_file_id TYPE VARCHAR(500);

-- Also update path columns to be consistent
ALTER TABLE pat_1_bookingsspd 
ALTER COLUMN akta_tanah_path TYPE VARCHAR(500),
ALTER COLUMN sertifikat_tanah_path TYPE VARCHAR(500),
ALTER COLUMN pelengkap_path TYPE VARCHAR(500),
ALTER COLUMN pdf_dokumen_path TYPE VARCHAR(500),
ALTER COLUMN file_withstempel_path TYPE VARCHAR(500);

-- Add comments to explain the change
COMMENT ON COLUMN pat_1_bookingsspd.akta_tanah_file_id IS 'Railway storage relative path (max 500 chars)';
COMMENT ON COLUMN pat_1_bookingsspd.sertifikat_tanah_file_id IS 'Railway storage relative path (max 500 chars)';
COMMENT ON COLUMN pat_1_bookingsspd.pelengkap_file_id IS 'Railway storage relative path (max 500 chars)';
COMMENT ON COLUMN pat_1_bookingsspd.pdf_dokumen_file_id IS 'Railway storage relative path (max 500 chars)';
COMMENT ON COLUMN pat_1_bookingsspd.file_withstempel_file_id IS 'Railway storage relative path (max 500 chars)';

-- Commit transaction
COMMIT;

-- Show the updated table structure
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pat_1_bookingsspd' 
AND column_name LIKE '%_file_id'
ORDER BY column_name;
