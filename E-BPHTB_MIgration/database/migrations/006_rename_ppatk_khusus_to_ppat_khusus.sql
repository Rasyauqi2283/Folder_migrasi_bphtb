-- Migration: Rename ppatk_khusus -> ppat_khusus (bukan tambah kolom baru)
-- ppatk_khusus dan ppat_khusus sama; perbaiki typo nama kolom

-- Hapus kolom ppat_khusus yang ditambah oleh migration 005 (jika ada)
ALTER TABLE public.a_2_verified_users DROP COLUMN IF EXISTS ppat_khusus;

-- Rename ppatk_khusus (typo) menjadi ppat_khusus
ALTER TABLE public.a_2_verified_users RENAME COLUMN ppatk_khusus TO ppat_khusus;

COMMENT ON COLUMN public.a_2_verified_users.ppat_khusus IS 'Nomor PPAT/PPATS khusus; diisi admin saat validasi';
