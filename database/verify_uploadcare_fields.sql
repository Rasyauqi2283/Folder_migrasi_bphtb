-- Verification Script: Check Uploadcare Fields in pat_1_bookingsspd
-- Purpose: Verify that all required fields for Uploadcare integration exist

-- Check if all file_id fields exist
SELECT 
    'file_id fields' as field_group,
    COUNT(*) as total_fields,
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ All file_id fields exist'
        ELSE '❌ Missing file_id fields'
    END as status
FROM information_schema.columns 
WHERE table_name = 'pat_1_bookingsspd' 
AND column_name LIKE '%_file_id';

-- Check if all mime_type fields exist
SELECT 
    'mime_type fields' as field_group,
    COUNT(*) as total_fields,
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ All mime_type fields exist'
        ELSE '❌ Missing mime_type fields'
    END as status
FROM information_schema.columns 
WHERE table_name = 'pat_1_bookingsspd' 
AND column_name LIKE '%_mime_type';

-- Check if all size fields exist
SELECT 
    'size fields' as field_group,
    COUNT(*) as total_fields,
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ All size fields exist'
        ELSE '❌ Missing size fields'
    END as status
FROM information_schema.columns 
WHERE table_name = 'pat_1_bookingsspd' 
AND column_name LIKE '%_size';

-- List all Uploadcare-related fields
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pat_1_bookingsspd' 
AND (
    column_name LIKE '%_file_id' OR 
    column_name LIKE '%_mime_type' OR 
    column_name LIKE '%_size' OR
    column_name LIKE '%_path'
)
ORDER BY column_name;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'pat_1_bookingsspd' 
AND indexname LIKE '%file_id%'
ORDER BY indexname;
