-- Migration 009: Rapikan urutan kolom
-- a_1_unverified_users: ktp_ocr_json di kolom terakhir sebelum created_at
-- a_2_verified_users: username <-> statuspengguna swap; lalu statuspengguna, nip, special_parafv, special_field, ppat_khusus, pejabat_umum, status_ppat, sisanya berurut

BEGIN;

-- ========== a_1_unverified_users ==========
CREATE TABLE public.a_1_unverified_users_new (
    id SERIAL PRIMARY KEY,
    nama character varying(255) NOT NULL,
    nik character varying(20) NOT NULL,
    telepon character varying(15) NOT NULL,
    email character varying(255) NOT NULL,
    password text NOT NULL,
    foto text,
    otp character varying(6),
    verifiedstatus character varying(50) NOT NULL,
    fotoprofil text,
    gender character varying(50),
    verse character varying(50),
    nip character varying(30),
    special_field character varying(250),
    pejabat_umum character varying(20),
    divisi character varying(20),
    ktp_ocr_json text,
    created_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.a_1_unverified_users_new (
    id, nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil,
    gender, verse, nip, special_field, pejabat_umum, divisi, ktp_ocr_json, created_at
)
SELECT id, nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil,
       gender, verse, nip, special_field, pejabat_umum, divisi, ktp_ocr_json, COALESCE(created_at, now())
FROM public.a_1_unverified_users;

DROP TABLE public.a_1_unverified_users;
ALTER TABLE public.a_1_unverified_users_new RENAME TO a_1_unverified_users;

-- ========== a_2_verified_users ==========
-- Drop FK dari sys_notifications (jika ada) agar bisa DROP a_2
ALTER TABLE IF EXISTS public.sys_notifications DROP CONSTRAINT IF EXISTS sys_notifications_recipient_id_fkey;

-- Drop trigger dulu (akan hilang saat DROP table)
-- Trigger akan dibuat ulang setelah table baru

CREATE TABLE public.a_2_verified_users_new (
    id SERIAL PRIMARY KEY,
    nama character varying(255) NOT NULL,
    nik character varying(20) NOT NULL,
    telepon character varying(15) NOT NULL,
    email character varying(255) NOT NULL,
    password text NOT NULL,
    foto text,
    otp character varying(6),
    verifiedstatus character varying(50) NOT NULL,
    fotoprofil text,
    userid character varying(255) NOT NULL,
    divisi character varying(255) NOT NULL,
    username character varying(255),
    statuspengguna character varying(50) DEFAULT 'offline'::character varying,
    nip character varying(20),
    special_parafv text,
    special_field character varying(255),
    ppat_khusus character varying(100),
    pejabat_umum character varying(50),
    status_ppat character varying(100),
    tanda_tangan_path text,
    tanda_tangan_mime text,
    last_active timestamp without time zone,
    gender text,
    verse character varying(50),
    CONSTRAINT verified_users_email_key_new UNIQUE (email)
);

INSERT INTO public.a_2_verified_users_new (
    id, nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil,
    userid, divisi, username, statuspengguna, nip, special_parafv, special_field,
    ppat_khusus, pejabat_umum, status_ppat, tanda_tangan_path, tanda_tangan_mime,
    last_active, gender, verse
)
SELECT id, nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil,
       userid, divisi, username, COALESCE(statuspengguna, 'offline'), nip, special_parafv, special_field,
       ppat_khusus, pejabat_umum, status_ppat, tanda_tangan_path, tanda_tangan_mime,
       last_active, gender, verse
FROM public.a_2_verified_users;

DROP TABLE public.a_2_verified_users;
ALTER TABLE public.a_2_verified_users_new RENAME TO a_2_verified_users;
ALTER TABLE public.a_2_verified_users RENAME CONSTRAINT verified_users_email_key_new TO verified_users_email_key;

-- Recreate trigger set_default_status_ppat
CREATE TRIGGER trg_set_status_ppat
    BEFORE INSERT OR UPDATE ON public.a_2_verified_users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_default_status_ppat();

-- Recreate FK dari sys_notifications (jika tabel dan kolom recipient_id ada)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sys_notifications' AND column_name = 'recipient_id'
  ) THEN
    ALTER TABLE public.sys_notifications
      ADD CONSTRAINT sys_notifications_recipient_id_fkey
      FOREIGN KEY (recipient_id) REFERENCES public.a_2_verified_users(id);
  END IF;
END $$;

-- Set sequence id
SELECT setval(pg_get_serial_sequence('public.a_1_unverified_users', 'id'), COALESCE((SELECT max(id) FROM public.a_1_unverified_users), 1));
SELECT setval(pg_get_serial_sequence('public.a_2_verified_users', 'id'), COALESCE((SELECT max(id) FROM public.a_2_verified_users), 1));

COMMIT;
