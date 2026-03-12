-- FAQ: Tanya Jawab (admin CRUD, publik read-only)
CREATE TABLE IF NOT EXISTS public.faq (
  id          BIGSERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  answer_html TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NULL
);

-- Banners: Iklan di landing (TTL: hours / day / lifetime)
CREATE TABLE IF NOT EXISTS public.banners (
  id          BIGSERIAL PRIMARY KEY,
  image_path  TEXT NOT NULL,
  link_url    TEXT,
  ttl_type    VARCHAR(20) NOT NULL CHECK (ttl_type IN ('hours', 'day', 'lifetime')),
  ttl_value   INT NULL,
  expires_at  TIMESTAMPTZ NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faq_expires_at ON public.faq (expires_at);
CREATE INDEX IF NOT EXISTS idx_banners_expires_at ON public.banners (expires_at);
