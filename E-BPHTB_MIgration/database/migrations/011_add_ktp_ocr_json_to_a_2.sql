-- Migration 011: cek_ktp_ocr — simpan ktp_ocr_json terikat NIK untuk preview admin.
-- Data dari a_1 saat registrasi; dihapus permanen saat user complete (assign) untuk mengurangi kepenuhan data.
-- Tabel a_2_verified_users TIDAK menyimpan ktp_ocr_json; lookup via NIK ke cek_ktp_ocr.

CREATE TABLE IF NOT EXISTS public.cek_ktp_ocr (
    id SERIAL PRIMARY KEY,
    ktp_ocr_json TEXT NOT NULL,
    nik VARCHAR(20) NOT NULL
);

COMMENT ON TABLE public.cek_ktp_ocr IS 'JSON hasil OCR KTP (dari registrasi). Terikat NIK; dihapus saat user complete.';
CREATE INDEX IF NOT EXISTS idx_cek_ktp_ocr_nik ON public.cek_ktp_ocr(nik);
