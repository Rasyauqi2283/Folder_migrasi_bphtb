-- Migration: Add verse and registration-type fields to a_1_unverified_users
-- Supports 3 registration flows: WP, Karyawan (NIP), PU (PPAT/PPATS with special_field)
-- Run after 002_add_verse_to_a_2_verified_users.sql

-- Verse: 'WP' | 'Karyawan' | 'PU'
ALTER TABLE public.a_1_unverified_users
ADD COLUMN IF NOT EXISTS verse VARCHAR(50);

-- Karyawan flow: NIP required at registration
ALTER TABLE public.a_1_unverified_users
ADD COLUMN IF NOT EXISTS nip VARCHAR(20);

-- PU flow: PPAT/PPATS require special_field and pejabat_umum; divisi = PPAT or PPATS
ALTER TABLE public.a_1_unverified_users
ADD COLUMN IF NOT EXISTS special_field VARCHAR(255);

ALTER TABLE public.a_1_unverified_users
ADD COLUMN IF NOT EXISTS pejabat_umum VARCHAR(50);

ALTER TABLE public.a_1_unverified_users
ADD COLUMN IF NOT EXISTS divisi VARCHAR(255);

COMMENT ON COLUMN public.a_1_unverified_users.verse IS 'Registration type: WP, Karyawan, or PU';
COMMENT ON COLUMN public.a_1_unverified_users.nip IS 'NIP for Karyawan registration';
COMMENT ON COLUMN public.a_1_unverified_users.special_field IS 'Nama PPAT/gelar for PU registration';
COMMENT ON COLUMN public.a_1_unverified_users.pejabat_umum IS 'Pejabat umum (PPAT/Notaris) for PU registration';
COMMENT ON COLUMN public.a_1_unverified_users.divisi IS 'Divisi for PU: PPAT or PPATS';
