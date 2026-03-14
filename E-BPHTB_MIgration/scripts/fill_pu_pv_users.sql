-- Lengkapi kolom kosong untuk PU (PPAT, PPATS, Notaris) dan Peneliti Validasi dummy

-- PAT01 (PPAT): isi special_field (nama pejabat) dan pejabat_umum
UPDATE a_2_verified_users
SET special_field = 'Dummy PPAT',
    pejabat_umum = 'PPAT'
WHERE userid = 'PAT01'
  AND (special_field IS NULL OR special_field = '')
  AND (pejabat_umum IS NULL OR pejabat_umum = '');

-- NOTA01 (Notaris): isi username (special_field & pejabat_umum sudah ada)
UPDATE a_2_verified_users
SET username = 'dummy_notaris'
WHERE userid = 'NOTA01'
  AND (username IS NULL OR username = '');

-- PATS01 (PPATS): isi special_field dan pejabat_umum
UPDATE a_2_verified_users
SET special_field = 'Dummy PPATS',
    pejabat_umum = 'PPATS'
WHERE userid = 'PATS01'
  AND (special_field IS NULL OR special_field = '')
  AND (pejabat_umum IS NULL OR pejabat_umum = '');

-- PV01 (Peneliti Validasi): isi username; pastikan special_parafv seperti PU (nama pejabat paraf di spanduk)
UPDATE a_2_verified_users
SET username = 'dummy_pv'
WHERE userid = 'PV01'
  AND (username IS NULL OR username = '');

UPDATE a_2_verified_users
SET special_parafv = 'Dummy Pejabat Paraf BAPPENDA'
WHERE userid = 'PV01';
