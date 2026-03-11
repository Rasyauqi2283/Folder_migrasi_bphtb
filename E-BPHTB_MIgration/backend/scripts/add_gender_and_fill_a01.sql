-- Tambah kolom gender ke a_2_verified_users jika belum ada (agar kompatibel dengan login/dashboard).
-- Kolom yang boleh kosong (beragam role): ppatk_khusus, special_field, pejabat_umum, status_ppat, nip.
-- Jalankan di psql: \i path/to/add_gender_and_fill_a01.sql

-- 1) Tambah kolom gender jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'a_2_verified_users' AND column_name = 'gender'
  ) THEN
    ALTER TABLE a_2_verified_users ADD COLUMN gender TEXT;
  END IF;
END $$;

-- 2) Opsional: isi gender untuk user A01 jika masih NULL (kolom lain seperti nip, ppatk_khusus, special_field, pejabat_umum, status_ppat boleh tetap kosong)
UPDATE a_2_verified_users
SET gender = COALESCE(NULLIF(TRIM(gender), ''), 'Laki-laki')
WHERE userid = 'A01' AND (gender IS NULL OR TRIM(gender) = '');

-- Cek hasil
SELECT userid, nama, divisi, username, nip, gender, telepon, statuspengguna, verifiedstatus
FROM a_2_verified_users
WHERE userid = 'A01';
