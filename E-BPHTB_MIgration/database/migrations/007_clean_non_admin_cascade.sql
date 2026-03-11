-- Clean non-admin: hapus semua data dummy kecuali user dengan divisi Administrator.
-- Cascade: notifikasi, booking & turunannya, lalu user non-admin.
-- Run: psql -U postgres -d bappenda -f migrations/007_clean_non_admin_cascade.sql

BEGIN;

-- 1. Notifikasi: recipient non-admin
DELETE FROM sys_notifications
WHERE recipient_id IN (
  SELECT id FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator'
);

-- 2. Notifikasi: booking yang dibuat oleh non-admin
DELETE FROM sys_notifications
WHERE booking_id IN (
  SELECT bookingid FROM pat_1_bookingsspd
  WHERE userid IN (SELECT userid FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator')
);

-- 3. Tabel yang mereferensi pat_1 (nobooking/bookingid) — hapus data booking non-admin
--    (daftar tabel yang punya nobooking/booking_id ke pat_1_bookingsspd)
DO $$
DECLARE
  non_admin_nobooking TEXT[];
BEGIN
  SELECT ARRAY_AGG(nobooking) INTO non_admin_nobooking
  FROM pat_1_bookingsspd b
  JOIN a_2_verified_users u ON b.userid = u.userid
  WHERE LOWER(TRIM(u.divisi)) != 'administrator';

  IF non_admin_nobooking IS NOT NULL AND array_length(non_admin_nobooking, 1) > 0 THEN
    DELETE FROM pat_2_bphtb_perhitungan WHERE nobooking = ANY(non_admin_nobooking);
    DELETE FROM pat_5_penghitungan_njop WHERE nobooking = ANY(non_admin_nobooking);
    DELETE FROM pat_4_objek_pajak WHERE nobooking = ANY(non_admin_nobooking);
    DELETE FROM pat_3_documents WHERE booking_id = ANY(non_admin_nobooking);
    DELETE FROM pat_6_sign WHERE nobooking = ANY(non_admin_nobooking);
    DELETE FROM pat_8_validasi_tambahan WHERE nobooking = ANY(non_admin_nobooking);
    DELETE FROM ltb_1_terima_berkas_sspd WHERE nobooking = ANY(non_admin_nobooking);
    DELETE FROM lsb_1_serah_berkas WHERE nobooking = ANY(non_admin_nobooking);
    DELETE FROM bank_1_cek_hasil_transaksi WHERE nobooking = ANY(non_admin_nobooking);
    DELETE FROM p_1_verifikasi WHERE nobooking = ANY(non_admin_nobooking);
    DELETE FROM p_2_verif_sign WHERE nobooking = ANY(non_admin_nobooking);
    DELETE FROM p_3_clear_to_paraf WHERE nobooking = ANY(non_admin_nobooking);
    DELETE FROM file_lengkap_tertandatangani WHERE nobooking = ANY(non_admin_nobooking);
    DELETE FROM ttd_paraf_kasie WHERE nobooking = ANY(non_admin_nobooking);
    -- pat_7 & pv_*: hapus lewat nomor_validasi dari pat_1 yang akan dihapus
  END IF;
END $$;

-- 4. pv_* (paraf validate, signing): hapus yang no_validasi dari booking non-admin
DELETE FROM pv_4_signing_audit_event WHERE signing_request_id IN (
  SELECT id FROM pv_2_signing_requests WHERE no_validasi IN (
    SELECT nomor_validasi FROM pat_1_bookingsspd
    WHERE userid IN (SELECT userid FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator')
    AND nomor_validasi IS NOT NULL
  )
);
DELETE FROM pv_2_signing_requests WHERE no_validasi IN (
  SELECT nomor_validasi FROM pat_1_bookingsspd
  WHERE userid IN (SELECT userid FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator')
  AND nomor_validasi IS NOT NULL
);
DELETE FROM pv_1_paraf_validate WHERE no_validasi IN (
  SELECT nomor_validasi FROM pat_1_bookingsspd
  WHERE userid IN (SELECT userid FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator')
  AND nomor_validasi IS NOT NULL
);
DELETE FROM pv_1_debug_log WHERE no_validasi IN (
  SELECT nomor_validasi FROM pat_1_bookingsspd
  WHERE userid IN (SELECT userid FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator')
  AND nomor_validasi IS NOT NULL
);

-- 5. Lepas FK pat_1 -> pat_7 (pat_1.nomor_validasi REFERENCES pat_7)
UPDATE pat_1_bookingsspd SET nomor_validasi = NULL
WHERE userid IN (SELECT userid FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator');

-- 6. pat_7_validasi_surat: baris yang nobooking-nya booking non-admin
DELETE FROM pat_7_validasi_surat WHERE nobooking IN (
  SELECT nobooking FROM pat_1_bookingsspd
  WHERE userid IN (SELECT userid FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator')
);

-- 7. pat_1_bookingsspd: booking oleh non-admin
DELETE FROM pat_1_bookingsspd
WHERE userid IN (SELECT userid FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator');

-- 8. Tabel lain by userid (faqs, notices, pv_local_certs)
DELETE FROM faqs WHERE userid IN (SELECT userid FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator');
DELETE FROM notices WHERE userid IN (SELECT userid FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator');
DELETE FROM pv_local_certs WHERE userid IN (SELECT userid FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator');

-- 9. Akhir: hapus user non-admin
DELETE FROM a_2_verified_users WHERE LOWER(TRIM(divisi)) != 'administrator';

-- 10. (Opsional) Kosongkan calon user yang belum verifikasi
TRUNCATE TABLE a_1_unverified_users RESTART IDENTITY;

COMMIT;
