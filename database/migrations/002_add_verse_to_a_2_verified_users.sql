-- Migration: Add column "verse" to a_2_verified_users
-- Verse categorizes user into: Karyawan, PU (Pejabat Umum/PPAT), WP (Wajib Pajak)
-- Run this against database: bappenda

-- Add column (nullable first for backfill)
ALTER TABLE public.a_2_verified_users
ADD COLUMN IF NOT EXISTS verse VARCHAR(50);

COMMENT ON COLUMN public.a_2_verified_users.verse IS 'Kategori user: Karyawan, PU (PPAT/PPATS), WP (Wajib Pajak)';

-- Backfill: set verse from existing divisi
-- PU = PPAT, PPATS
-- WP = Wajib Pajak (case-insensitive match)
-- Karyawan = Administrator, Admin, LTB, LSB, Peneliti, Peneliti Validasi, BANK, Customer Service, CS, etc.
UPDATE public.a_2_verified_users
SET verse = CASE
    WHEN TRIM(UPPER(divisi)) IN ('PPAT', 'PPATS') THEN 'PU'
    WHEN TRIM(UPPER(divisi)) IN ('WAJIB PAJAK', 'WP') THEN 'WP'
    ELSE 'Karyawan'
END
WHERE verse IS NULL;

-- Add CHECK constraint so only allowed values can be stored (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'public.a_2_verified_users'::regclass AND conname = 'chk_verse'
  ) THEN
    ALTER TABLE public.a_2_verified_users
    ADD CONSTRAINT chk_verse CHECK (verse IN ('Karyawan', 'PU', 'WP'));
  END IF;
END $$;
