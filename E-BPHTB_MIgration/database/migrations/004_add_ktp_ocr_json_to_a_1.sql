-- Migration: Add ktp_ocr_json to a_1_unverified_users for storing OCR scan result
-- Run after 003_add_verse_and_registration_fields_to_a_1.sql

ALTER TABLE public.a_1_unverified_users
ADD COLUMN IF NOT EXISTS ktp_ocr_json TEXT;

COMMENT ON COLUMN public.a_1_unverified_users.ktp_ocr_json IS 'JSON string hasil OCR KTP (real-ktp-verification)';
