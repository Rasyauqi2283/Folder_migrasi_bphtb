-- Migration Script: Add Uploadcare Fields to pat_1_bookingsspd
-- Created: $(date)
-- Purpose: Add missing fields for Uploadcare integration
-- Author: System Migration

-- Start transaction
BEGIN;

-- Add file_id fields for Uploadcare file tracking
ALTER TABLE pat_1_bookingsspd 
ADD COLUMN IF NOT EXISTS akta_tanah_file_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS sertifikat_tanah_file_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS pelengkap_file_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS pdf_dokumen_file_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS file_withstempel_file_id VARCHAR(50);

-- Add mime_type fields for file type tracking
ALTER TABLE pat_1_bookingsspd 
ADD COLUMN IF NOT EXISTS akta_tanah_mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS sertifikat_tanah_mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS pelengkap_mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS pdf_dokumen_mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS file_withstempel_mime_type VARCHAR(100);

-- Add size fields for file size tracking
ALTER TABLE pat_1_bookingsspd 
ADD COLUMN IF NOT EXISTS akta_tanah_size BIGINT,
ADD COLUMN IF NOT EXISTS sertifikat_tanah_size BIGINT,
ADD COLUMN IF NOT EXISTS pelengkap_size BIGINT,
ADD COLUMN IF NOT EXISTS pdf_dokumen_size BIGINT,
ADD COLUMN IF NOT EXISTS file_withstempel_size BIGINT;

-- Add comments for documentation
COMMENT ON COLUMN pat_1_bookingsspd.akta_tanah_file_id IS 'Uploadcare file ID for akta tanah document';
COMMENT ON COLUMN pat_1_bookingsspd.akta_tanah_mime_type IS 'MIME type of akta tanah document';
COMMENT ON COLUMN pat_1_bookingsspd.akta_tanah_size IS 'File size of akta tanah document in bytes';

COMMENT ON COLUMN pat_1_bookingsspd.sertifikat_tanah_file_id IS 'Uploadcare file ID for sertifikat tanah document';
COMMENT ON COLUMN pat_1_bookingsspd.sertifikat_tanah_mime_type IS 'MIME type of sertifikat tanah document';
COMMENT ON COLUMN pat_1_bookingsspd.sertifikat_tanah_size IS 'File size of sertifikat tanah document in bytes';

COMMENT ON COLUMN pat_1_bookingsspd.pelengkap_file_id IS 'Uploadcare file ID for pelengkap document';
COMMENT ON COLUMN pat_1_bookingsspd.pelengkap_mime_type IS 'MIME type of pelengkap document';
COMMENT ON COLUMN pat_1_bookingsspd.pelengkap_size IS 'File size of pelengkap document in bytes';

COMMENT ON COLUMN pat_1_bookingsspd.pdf_dokumen_file_id IS 'Uploadcare file ID for PDF dokumen';
COMMENT ON COLUMN pat_1_bookingsspd.pdf_dokumen_mime_type IS 'MIME type of PDF dokumen';
COMMENT ON COLUMN pat_1_bookingsspd.pdf_dokumen_size IS 'File size of PDF dokumen in bytes';

COMMENT ON COLUMN pat_1_bookingsspd.file_withstempel_file_id IS 'Uploadcare file ID for file with stempel';
COMMENT ON COLUMN pat_1_bookingsspd.file_withstempel_mime_type IS 'MIME type of file with stempel';
COMMENT ON COLUMN pat_1_bookingsspd.file_withstempel_size IS 'File size of file with stempel in bytes';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pat_1_bookingsspd_akta_tanah_file_id ON pat_1_bookingsspd(akta_tanah_file_id);
CREATE INDEX IF NOT EXISTS idx_pat_1_bookingsspd_sertifikat_tanah_file_id ON pat_1_bookingsspd(sertifikat_tanah_file_id);
CREATE INDEX IF NOT EXISTS idx_pat_1_bookingsspd_pelengkap_file_id ON pat_1_bookingsspd(pelengkap_file_id);
CREATE INDEX IF NOT EXISTS idx_pat_1_bookingsspd_pdf_dokumen_file_id ON pat_1_bookingsspd(pdf_dokumen_file_id);
CREATE INDEX IF NOT EXISTS idx_pat_1_bookingsspd_file_withstempel_file_id ON pat_1_bookingsspd(file_withstempel_file_id);

-- Commit transaction
COMMIT;

-- Display success message
SELECT 'Migration completed successfully! Added 15 new fields for Uploadcare integration.' as result;
