-- FAQ: siapa saja yang boleh melihat entri (kosong = semua role)
ALTER TABLE public.faq
  ADD COLUMN IF NOT EXISTS allowed_roles TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.faq.allowed_roles IS 'Daftar divisi yang boleh melihat FAQ; {} = semua role. Contoh: {Peneliti,BANK}';
