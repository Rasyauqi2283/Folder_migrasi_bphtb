-- Migration 008: Tukar kolom 4 (email) dan kolom 7 (otp)
-- Urutan 7 kolom data diri: 1=nama, 2=nik, 3=telepon, 4=email, 5=password, 6=foto, 7=otp
-- Setelah perbaikan: 1=nama, 2=nik, 3=telepon, 4=otp, 5=password, 6=foto, 7=email
-- Dilakukan dengan membuat tabel baru (urutan kolom baru), copy data, drop lama, rename.

-- ========== a_1_unverified_users ==========
CREATE TABLE IF NOT EXISTS public.a_1_unverified_users_new (
    id SERIAL PRIMARY KEY,
    nama character varying(255) NOT NULL,
    nik character varying(20) NOT NULL,
    telepon character varying(15) NOT NULL,
    otp character varying(6),
    password text NOT NULL,
    foto text,
    email character varying(255) NOT NULL,
    verifiedstatus character varying(50) NOT NULL DEFAULT 'unverified',
    fotoprofil text,
    gender text,
    verse character varying(50),
    nip character varying(20),
    special_field character varying(255),
    pejabat_umum character varying(50),
    divisi character varying(255),
    ktp_ocr_json text,
    created_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.a_1_unverified_users_new (
    id, nama, nik, telepon, otp, password, foto, email,
    verifiedstatus, fotoprofil, gender, verse, nip, special_field, pejabat_umum, divisi, ktp_ocr_json, created_at
)
SELECT
    id, nama, nik, telepon, otp, password, foto, email,
    COALESCE(verifiedstatus, 'unverified'), fotoprofil, gender, verse, nip, special_field, pejabat_umum, divisi,
    ktp_ocr_json, COALESCE(created_at, now())
FROM public.a_1_unverified_users;

DROP TABLE public.a_1_unverified_users;
ALTER TABLE public.a_1_unverified_users_new RENAME TO a_1_unverified_users;

COMMENT ON TABLE public.a_1_unverified_users IS 'A_1 untuk penyimpanan users yang belum terverified (kolom 4=otp, 7=email)';

-- ========== a_2_verified_users ==========
CREATE TABLE IF NOT EXISTS public.a_2_verified_users_new (
    id SERIAL PRIMARY KEY,
    nama character varying(255) NOT NULL,
    nik character varying(20) NOT NULL,
    telepon character varying(15) NOT NULL,
    otp character varying(6),
    password text NOT NULL,
    foto text,
    email character varying(255) NOT NULL UNIQUE,
    verifiedstatus character varying(50) NOT NULL,
    fotoprofil text,
    userid character varying(255) NOT NULL,
    divisi character varying(255) NOT NULL,
    statuspengguna character varying(50) DEFAULT 'offline',
    username character varying(255),
    nip character varying(20),
    ppat_khusus character varying(100),
    special_field character varying(255),
    last_active timestamp without time zone,
    tanda_tangan_path text,
    special_parafv text,
    tanda_tangan_mime text,
    pejabat_umum character varying(50),
    status_ppat character varying(100),
    gender text,
    verse character varying(50)
);

INSERT INTO public.a_2_verified_users_new (
    id, nama, nik, telepon, otp, password, foto, email,
    verifiedstatus, fotoprofil, userid, divisi, statuspengguna, username, nip, ppat_khusus,
    special_field, last_active, tanda_tangan_path, special_parafv, tanda_tangan_mime, pejabat_umum, status_ppat, gender, verse
)
SELECT
    id, nama, nik, telepon, otp, password, foto, email,
    verifiedstatus, fotoprofil, userid, divisi, COALESCE(statuspengguna, 'offline'), username, nip, ppat_khusus,
    special_field, last_active, tanda_tangan_path, special_parafv, tanda_tangan_mime, pejabat_umum, status_ppat, gender, verse
FROM public.a_2_verified_users;

DROP TABLE public.a_2_verified_users;
ALTER TABLE public.a_2_verified_users_new RENAME TO a_2_verified_users;

COMMENT ON TABLE public.a_2_verified_users IS 'A_2 untuk penyimpanan users yang datanya sudah lengkap (kolom 4=otp, 7=email)';

-- Set sequence nilai id agar insert baru tidak bentrok
SELECT setval(pg_get_serial_sequence('public.a_1_unverified_users', 'id'), COALESCE((SELECT max(id) FROM public.a_1_unverified_users), 1));
SELECT setval(pg_get_serial_sequence('public.a_2_verified_users', 'id'), COALESCE((SELECT max(id) FROM public.a_2_verified_users), 1));
