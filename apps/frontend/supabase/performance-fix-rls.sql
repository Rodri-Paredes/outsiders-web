-- ====================================================================================================
-- PERFORMANCE & RLS FIX: Fix slow product pages and allow customers to see sizes/stock
-- Run this ENTIRE block in Supabase SQL Editor
-- ====================================================================================================

-- 1. Create missing indexes to drastically speed up JOINs (product details and shop page)
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_variant_id ON public.stock(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_branch_id ON public.stock(branch_id);

-- 2. Fix RLS on product_variants so anyone (customers) can see available sizes
DROP POLICY IF EXISTS "Staff can view product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Anyone can view product variants" ON public.product_variants;
CREATE POLICY "Anyone can view product variants" ON public.product_variants
  FOR SELECT USING (true); -- Customers need to see sizes to buy!

-- 3. Fix RLS on stock so anyone (customers) can see if an item is sold out
DROP POLICY IF EXISTS "Staff can view stock" ON public.stock;
DROP POLICY IF EXISTS "Anyone can view stock" ON public.stock;
CREATE POLICY "Anyone can view stock" ON public.stock
  FOR SELECT USING (true); -- Customers need to see stock levels to add to cart!

-- Note: Admins/Staff policies for INSERT, UPDATE, DELETE remain untouched.
