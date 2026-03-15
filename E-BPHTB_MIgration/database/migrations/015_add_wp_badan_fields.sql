-- Migration 015: Kolom untuk registrasi WP Badan Usaha (NPWP, NIB, Sertifikat NIB).
-- Digunakan saat verse = WP dan wp_subtype = Badan Usaha; status akun = pending sampai admin menyetujui.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'a_2_verified_users' AND column_name = 'npwp_badan'
  ) THEN
    ALTER TABLE a_2_verified_users ADD COLUMN npwp_badan TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'a_2_verified_users' AND column_name = 'nib'
  ) THEN
    ALTER TABLE a_2_verified_users ADD COLUMN nib TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'a_2_verified_users' AND column_name = 'nib_doc_path'
  ) THEN
    ALTER TABLE a_2_verified_users ADD COLUMN nib_doc_path TEXT;
  END IF;
END $$;
