-- ====================================================================================================
-- QUICK FIX: Disable RLS on tag tables (safe for internal ERP use)
-- Run this in Supabase SQL Editor
-- ====================================================================================================

-- Option A: Disable RLS entirely on tag/discount tables (simplest fix)
ALTER TABLE public.product_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tag_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts DISABLE ROW LEVEL SECURITY;

-- Diagnostic: check RLS status on all relevant tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'product_variants', 'product_tags', 'product_tag_assignments', 'discounts', 'stock')
ORDER BY tablename;
