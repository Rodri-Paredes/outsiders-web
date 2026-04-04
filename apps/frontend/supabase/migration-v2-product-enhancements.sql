/*
  ====================================================================================================
  MIGRATION V2 — PRODUCT ENHANCEMENTS
  ====================================================================================================
  
  Changes:
  1. product_tags — dynamic tag/attribute system (Estampada, Básica, Waffle, Alto gramaje, 20/1)
  2. product_tag_assignments — N:N relation between products and tags
  3. products.original_price — original price before discount
  4. products.discount_percentage — discount percentage (0-100)
  5. product_variants.price_override — optional per-variant price override
  
  Run this migration in your Supabase SQL Editor.
  ====================================================================================================
*/

-- ====================================================================================================
-- 1. PRODUCT_TAGS — Dynamic attribute/tag system
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.product_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,           -- Category this tag belongs to (e.g. 'Poleras'), NULL = global/any category
  tag_group TEXT NOT NULL,  -- Logical group: 'tipo', 'material', 'gramaje', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.product_tags IS 'Tags/attributes for products (e.g. Estampada, Básica, Alto gramaje)';
COMMENT ON COLUMN public.product_tags.category IS 'If set, tag only applies to products of this category. NULL = applies to all categories.';
COMMENT ON COLUMN public.product_tags.tag_group IS 'Logical grouping for UI display: tipo, material, gramaje, etc.';

-- ====================================================================================================
-- 2. PRODUCT_TAG_ASSIGNMENTS — N:N relationship
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.product_tag_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.product_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, tag_id)
);

COMMENT ON TABLE public.product_tag_assignments IS 'Assigns tags to products (many-to-many)';

-- ====================================================================================================
-- 3. NEW COLUMNS ON PRODUCTS — Discount system
-- ====================================================================================================

-- Original price before discount (NULL = no discount)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2) CHECK (original_price >= 0);

-- Discount percentage 0-100 (NULL = no discount)  
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

COMMENT ON COLUMN public.products.original_price IS 'Original price before discount. NULL means no discount.';
COMMENT ON COLUMN public.products.discount_percentage IS 'Discount percentage (0-100). Final price = original_price * (1 - discount_percentage/100). NULL means no discount.';

-- ====================================================================================================
-- 4. PRICE OVERRIDE ON PRODUCT_VARIANTS — Per-variant pricing
-- ====================================================================================================

ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS price_override DECIMAL(10,2) CHECK (price_override >= 0);

COMMENT ON COLUMN public.product_variants.price_override IS 'Optional price override for this variant. If set, overrides the product base price.';

-- ====================================================================================================
-- 5. SEED DATA — Initial tags
-- ====================================================================================================

INSERT INTO public.product_tags (name, category, tag_group) VALUES
  ('Estampada', 'Poleras', 'tipo'),
  ('Básica', 'Poleras', 'tipo'),
  ('Waffle', 'Poleras', 'tipo'),
  ('Alto gramaje', NULL, 'gramaje'),
  ('20/1', NULL, 'material')
ON CONFLICT (name) DO NOTHING;

-- ====================================================================================================
-- 6. RLS POLICIES
-- ====================================================================================================

ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tag_assignments ENABLE ROW LEVEL SECURITY;

-- product_tags: anyone can read, admins can manage
DROP POLICY IF EXISTS "Anyone can view product tags" ON public.product_tags;
CREATE POLICY "Anyone can view product tags" ON public.product_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage product tags" ON public.product_tags;
DROP POLICY IF EXISTS "Admins can insert product tags" ON public.product_tags;
CREATE POLICY "Admins can insert product tags" ON public.product_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Admins can update product tags" ON public.product_tags;
CREATE POLICY "Admins can update product tags" ON public.product_tags
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Admins can delete product tags" ON public.product_tags;
CREATE POLICY "Admins can delete product tags" ON public.product_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- product_tag_assignments: anyone can read, admins can manage
DROP POLICY IF EXISTS "Anyone can view tag assignments" ON public.product_tag_assignments;
CREATE POLICY "Anyone can view tag assignments" ON public.product_tag_assignments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage tag assignments" ON public.product_tag_assignments;
DROP POLICY IF EXISTS "Admins can insert tag assignments" ON public.product_tag_assignments;
CREATE POLICY "Admins can insert tag assignments" ON public.product_tag_assignments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Admins can update tag assignments" ON public.product_tag_assignments;
CREATE POLICY "Admins can update tag assignments" ON public.product_tag_assignments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Admins can delete tag assignments" ON public.product_tag_assignments;
CREATE POLICY "Admins can delete tag assignments" ON public.product_tag_assignments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ====================================================================================================
-- 7. INDEXES for performance
-- ====================================================================================================

CREATE INDEX IF NOT EXISTS idx_product_tags_category ON public.product_tags(category);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag_group ON public.product_tags(tag_group);
CREATE INDEX IF NOT EXISTS idx_product_tag_assignments_product ON public.product_tag_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tag_assignments_tag ON public.product_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS idx_products_discount ON public.products(discount_percentage) WHERE discount_percentage IS NOT NULL AND discount_percentage > 0;

-- ====================================================================================================
-- 8. DISCOUNTS TABLE — Promo codes for POS and store
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'PERCENTAGE' CHECK (type IN ('PERCENTAGE', 'FIXED')),
  value DECIMAL(10,2) NOT NULL CHECK (value > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.discounts IS 'Discount/promo codes for POS and online store';

ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- Anyone can read active discounts (needed for store checkout)
DROP POLICY IF EXISTS "Anyone can view discounts" ON public.discounts;
CREATE POLICY "Anyone can view discounts" ON public.discounts
  FOR SELECT USING (true);

-- Admins can manage discounts
DROP POLICY IF EXISTS "Admins can manage discounts" ON public.discounts;
DROP POLICY IF EXISTS "Admins can insert discounts" ON public.discounts;
CREATE POLICY "Admins can insert discounts" ON public.discounts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Admins can update discounts" ON public.discounts;
CREATE POLICY "Admins can update discounts" ON public.discounts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Admins can delete discounts" ON public.discounts;
CREATE POLICY "Admins can delete discounts" ON public.discounts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ====================================================================================================
-- 9. UPDATE existing 'Camisetas' products to 'Poleras'
-- ====================================================================================================

UPDATE public.products SET category = 'Poleras' WHERE category = 'Camisetas';
UPDATE public.products SET category = 'Poleras' WHERE category = 'CAMISETAS';

