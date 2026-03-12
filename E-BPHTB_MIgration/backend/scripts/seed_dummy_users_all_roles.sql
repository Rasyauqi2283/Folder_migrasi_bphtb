-- Akun dummy untuk semua role (password: Farras). Userid format: prefix + nomor 01, 02, … 99, 100, 1000, … 99999.
-- Role yang sudah ada di data uji (admin 3 + WP 1) tidak di-insert lagi.
-- Jalankan: psql -U postgres -d bappenda -f scripts/seed_dummy_users_all_roles.sql

-- Bcrypt hash untuk password "Farras" (cost 10)
\set bcrypt_farras '$2a$10$9kTa6izsrsJFbWqWoGLWoesIZddfVHfKMPeWt3pC9yfGdQarSPmjG'

-- Hapus dummy lama jika ada (supaya bisa re-run script)
DELETE FROM a_2_verified_users WHERE email LIKE 'dummy-%@test.local';

-- PPAT
INSERT INTO a_2_verified_users (
  nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi,
  statuspengguna, ppat_khusus, gender, verse, nip, special_field, pejabat_umum
) VALUES (
  'Dummy PPAT', '3171010101010001', '08111111101', 'dummy-ppat@test.local', :'bcrypt_farras',
  '', '', 'complete', '', 'PAT01', 'PPAT', 'offline', '20000', 'Laki-laki', 'PU', NULL, 'PPAT', 'PPAT'
);

-- PPATS
INSERT INTO a_2_verified_users (
  nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi,
  statuspengguna, ppat_khusus, gender, verse, nip, special_field, pejabat_umum
) VALUES (
  'Dummy PPATS', '3171010101010002', '08111111102', 'dummy-ppats@test.local', :'bcrypt_farras',
  '', '', 'complete', '', 'PATS01', 'PPATS', 'offline', '20001', 'Laki-laki', 'PU', NULL, 'PPATS', 'PPATS'
);

-- Notaris
INSERT INTO a_2_verified_users (
  nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi,
  statuspengguna, ppat_khusus, gender, verse, nip, special_field, pejabat_umum
) VALUES (
  'Dummy Notaris', '3171010101010003', '08111111103', 'dummy-notaris@test.local', :'bcrypt_farras',
  '', '', 'complete', '', 'NOTA01', 'Notaris', 'offline', '20002', 'Laki-laki', 'PU', NULL, 'Notaris', 'Notaris'
);

-- BANK
INSERT INTO a_2_verified_users (
  nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi,
  statuspengguna, ppat_khusus, gender, verse, nip, special_field, pejabat_umum
) VALUES (
  'Dummy Bank', '3171010101010004', '08111111104', 'dummy-bank@test.local', :'bcrypt_farras',
  '', '', 'complete', '', 'BANK01', 'BANK', 'offline', NULL, 'Laki-laki', 'Karyawan', '1234567890123456', NULL, NULL
);

-- LTB
INSERT INTO a_2_verified_users (
  nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi,
  statuspengguna, ppat_khusus, gender, verse, nip, special_field, pejabat_umum
) VALUES (
  'Dummy LTB', '3171010101010005', '08111111105', 'dummy-ltb@test.local', :'bcrypt_farras',
  '', '', 'complete', '', 'LTB01', 'LTB', 'offline', NULL, 'Laki-laki', 'Karyawan', '1234567890123457', NULL, NULL
);

-- LSB
INSERT INTO a_2_verified_users (
  nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi,
  statuspengguna, ppat_khusus, gender, verse, nip, special_field, pejabat_umum
) VALUES (
  'Dummy LSB', '3171010101010006', '08111111106', 'dummy-lsb@test.local', :'bcrypt_farras',
  '', '', 'complete', '', 'LSB01', 'LSB', 'offline', NULL, 'Perempuan', 'Karyawan', '1234567890123458', NULL, NULL
);

-- Customer Service
INSERT INTO a_2_verified_users (
  nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi,
  statuspengguna, ppat_khusus, gender, verse, nip, special_field, pejabat_umum
) VALUES (
  'Dummy CS', '3171010101010007', '08111111107', 'dummy-cs@test.local', :'bcrypt_farras',
  '', '', 'complete', '', 'CS01', 'Customer Service', 'offline', NULL, 'Perempuan', 'Karyawan', '1234567890123459', NULL, NULL
);

-- Peneliti
INSERT INTO a_2_verified_users (
  nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi,
  statuspengguna, ppat_khusus, gender, verse, nip, special_field, pejabat_umum
) VALUES (
  'Dummy Peneliti', '3171010101010010', '08111111110', 'dummy-peneliti@test.local', :'bcrypt_farras',
  '', '', 'complete', '', 'P01', 'Peneliti', 'offline', NULL, 'Laki-laki', 'Karyawan', '1234567890123460', NULL, NULL
);

-- Peneliti Validasi
INSERT INTO a_2_verified_users (
  nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, userid, divisi,
  statuspengguna, ppat_khusus, gender, verse, nip, special_field, pejabat_umum, special_parafv
) VALUES (
  'Dummy Peneliti Validasi', '3171010101010011', '08111111111', 'dummy-pv@test.local', :'bcrypt_farras',
  '', '', 'complete', '', 'PV01', 'Peneliti Validasi', 'offline', NULL, 'Perempuan', 'Karyawan', '1234567890123461', NULL, NULL, 'Dummy Pejabat Paraf'
);

-- Ringkasan: Administrator & Wajib Pajak sudah ada (A01, A02, SA01, WP01). Dummy di atas menambah: PPAT, PPATS, Notaris, BANK, LTB, LSB, Customer Service, Peneliti, Peneliti Validasi.
SELECT userid, divisi, nama, email FROM a_2_verified_users WHERE verifiedstatus = 'complete' ORDER BY divisi, userid;
