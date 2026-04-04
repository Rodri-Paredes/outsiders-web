-- ====================================================================================================
-- MIGRATION V3 — DYNAMIC CMS (site_config)
-- ====================================================================================================
-- Run this in your Supabase SQL Editor.
-- This creates the unified site_config table and migrates existing content.
-- Old tables (banners, featured_sections, featured_products, site_content) are kept for safety.
-- ====================================================================================================

-- 1. Create site_config table
CREATE TABLE IF NOT EXISTS public.site_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.site_config IS 'Unified CMS key-value store. Each key holds a JSONB blob of config.';

-- 2. Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_site_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_site_config_updated_at ON public.site_config;
CREATE TRIGGER update_site_config_updated_at
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION public.update_site_config_updated_at();

-- 3. RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site_config" ON public.site_config;
CREATE POLICY "Anyone can read site_config" ON public.site_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert site_config" ON public.site_config;
CREATE POLICY "Admins can insert site_config" ON public.site_config
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Admins can update site_config" ON public.site_config;
CREATE POLICY "Admins can update site_config" ON public.site_config
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Admins can delete site_config" ON public.site_config;
CREATE POLICY "Admins can delete site_config" ON public.site_config
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- 4. Seed default empty config keys (so ERP has something to edit)
INSERT INTO public.site_config (key, value) VALUES
  ('home_banner', '{
    "image_url": "",
    "title": "Nueva Colección",
    "subtitle": "",
    "cta_text": "Ver Tienda",
    "cta_link": "/shop",
    "is_active": true
  }'),
  ('best_sellers', '{
    "title": "Best Sellers",
    "product_ids": []
  }'),
  ('home_sections', '[]'),
  ('home_hero', '{
    "title": "",
    "subtitle": "",
    "desktop_title_1": "Out",
    "desktop_title_2": "siders.",
    "desktop_season": "",
    "desktop_description": "",
    "cta_text": "Shop Now",
    "cta_link": "/shop",
    "images": []
  }'),
  ('home_categories', '[
    {
      "title": "HOODIES",
      "subtitle": "Zippers / Hoodies / Crewnecks",
      "href": "/shop",
      "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"
    },
    {
      "title": "TEES",
      "subtitle": "Basics / Sleeveless / Best sellers",
      "href": "/shop",
      "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80"
    },
    {
      "title": "SWEATERS",
      "subtitle": "Knitwear / Crochet",
      "href": "/shop",
      "image": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80"
    },
    {
      "title": "PANTS",
      "subtitle": "Shorts / Denim / Joggers",
      "href": "/shop",
      "image": "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80"
    }
  ]')
ON CONFLICT (key) DO NOTHING;

-- 6. Index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_site_config_key ON public.site_config(key);

-- ====================================================================================================
-- Verify result
-- ====================================================================================================
SELECT key, jsonb_typeof(value) as value_type, updated_at FROM public.site_config ORDER BY key;

