-- Fix p_1_verifikasi table columns
-- This script ensures the updated_at and created_at columns exist

-- Check if columns exist and add them if they don't
DO $$
BEGIN
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'p_1_verifikasi' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE p_1_verifikasi ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added created_at column to p_1_verifikasi';
    ELSE
        RAISE NOTICE 'created_at column already exists in p_1_verifikasi';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'p_1_verifikasi' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE p_1_verifikasi ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updated_at column to p_1_verifikasi';
    ELSE
        RAISE NOTICE 'updated_at column already exists in p_1_verifikasi';
    END IF;

    -- Update existing rows to have proper timestamps
    UPDATE p_1_verifikasi 
    SET created_at = CURRENT_TIMESTAMP 
    WHERE created_at IS NULL;

    UPDATE p_1_verifikasi 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE updated_at IS NULL;

    RAISE NOTICE 'Updated existing rows with proper timestamps';
END $$;

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_p_1_verifikasi_updated_at ON p_1_verifikasi;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_p_1_verifikasi_updated_at
    BEFORE UPDATE ON p_1_verifikasi
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'p_1_verifikasi' 
AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name;
