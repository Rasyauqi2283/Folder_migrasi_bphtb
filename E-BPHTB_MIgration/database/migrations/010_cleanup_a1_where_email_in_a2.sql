-- Migration 010: Bersihkan baris di a_1_unverified_users yang email-nya sudah ada di a_2_verified_users (verified_pending atau complete).
-- Invariant sistem satu pintu: satu user tidak boleh ada di kedua tabel. Jalankan sekali untuk perbaiki data lama/duplikat.

DELETE FROM a_1_unverified_users
WHERE email IN (
  SELECT email FROM a_2_verified_users
  WHERE verifiedstatus IN ('verified_pending', 'complete')
);
