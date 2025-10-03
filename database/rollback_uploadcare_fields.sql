-- Rollback Script: Remove Uploadcare Fields from pat_1_bookingsspd
-- WARNING: This will permanently delete all data in the new fields!
-- Use only if you need to rollback the migration

-- Start transaction
BEGIN;

-- Drop indexes first
DROP INDEX IF EXISTS idx_pat_1_bookingsspd_akta_tanah_file_id;
DROP INDEX IF EXISTS idx_pat_1_bookingsspd_sertifikat_tanah_file_id;
DROP INDEX IF EXISTS idx_pat_1_bookingsspd_pelengkap_file_id;
DROP INDEX IF EXISTS idx_pat_1_bookingsspd_pdf_dokumen_file_id;
DROP INDEX IF EXISTS idx_pat_1_bookingsspd_file_withstempel_file_id;

-- Drop file_id columns
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS akta_tanah_file_id;
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS sertifikat_tanah_file_id;
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS pelengkap_file_id;
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS pdf_dokumen_file_id;
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS file_withstempel_file_id;

-- Drop mime_type columns
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS akta_tanah_mime_type;
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS sertifikat_tanah_mime_type;
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS pelengkap_mime_type;
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS pdf_dokumen_mime_type;
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS file_withstempel_mime_type;

-- Drop size columns
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS akta_tanah_size;
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS sertifikat_tanah_size;
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS pelengkap_size;
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS pdf_dokumen_size;
ALTER TABLE pat_1_bookingsspd DROP COLUMN IF EXISTS file_withstempel_size;

-- Commit transaction
COMMIT;

-- Display rollback message
SELECT 'Rollback completed successfully! Removed all Uploadcare fields.' as result;
