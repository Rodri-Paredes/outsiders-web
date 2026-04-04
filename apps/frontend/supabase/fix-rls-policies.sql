-- ====================================================================================================
-- FIX: Drop ALL existing policies on product_tag_assignments and recreate clean ones
-- Run this ENTIRE block in Supabase SQL Editor
-- ====================================================================================================

-- Step 1: Drop ALL policies on product_tag_assignments (any name)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'product_tag_assignments' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.product_tag_assignments', pol.policyname);
  END LOOP;
END $$;

-- Step 2: Drop ALL policies on product_tags too
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'product_tags' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.product_tags', pol.policyname);
  END LOOP;
END $$;

-- Step 3: Drop ALL policies on discounts
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'discounts' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.discounts', pol.policyname);
  END LOOP;
END $$;

-- Step 4: Recreate clean policies for product_tags
CREATE POLICY "Anyone can view product tags" ON public.product_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert product tags" ON public.product_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can update product tags" ON public.product_tags
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can delete product tags" ON public.product_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Step 5: Recreate clean policies for product_tag_assignments
CREATE POLICY "Anyone can view tag assignments" ON public.product_tag_assignments
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert tag assignments" ON public.product_tag_assignments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can update tag assignments" ON public.product_tag_assignments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can delete tag assignments" ON public.product_tag_assignments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Step 6: Recreate clean policies for discounts
CREATE POLICY "Anyone can view discounts" ON public.discounts
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert discounts" ON public.discounts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can update discounts" ON public.discounts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can delete discounts" ON public.discounts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Step 7: Verify — check your user role (should show 'ADMIN')
SELECT id, email, role FROM public.users WHERE role = 'ADMIN' LIMIT 5;

-- Step 8: Show all policies on our tables (for debugging)
SELECT tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('product_tags', 'product_tag_assignments', 'discounts')
ORDER BY tablename, cmd;
