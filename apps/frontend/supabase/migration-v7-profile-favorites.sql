-- ============================================================
-- Migration V7: User profile fields + Favorites table
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Add profile fields to users table
-- ============================================================
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- ============================================================
-- STEP 2: Fix role constraint to support e-commerce customers
-- The ERP schema only allowed ('admin', 'vendedor').
-- We need to add 'user' for e-commerce customers.
-- ============================================================
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'vendedor', 'user'));

-- Set default to 'user' so new sign-ups get the right role
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'user';

-- ============================================================
-- STEP 3: Fix the auto-create trigger to use correct role value
-- This trigger runs when a new auth.users row is created (sign-up)
-- It auto-inserts a public.users profile row.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (safe: DROP IF EXISTS + CREATE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STEP 4: RLS policies for users table
-- ============================================================

-- Allow users to read their own profile
DO $$ BEGIN
  CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow users to update their own profile (name, last_name, phone)
DO $$ BEGIN
  CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow the trigger function to insert (it runs as SECURITY DEFINER)
-- Also allow authenticated users to insert their own row as fallback
DO $$ BEGIN
  CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- STEP 5: Create favorites table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users can only see/add/remove their own favorites
DO $$ BEGIN
  CREATE POLICY "favorites_select_own" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "favorites_insert_own" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "favorites_delete_own" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON public.favorites(product_id);

-- ============================================================
-- STEP 6: Link whatsapp_orders to authenticated users
-- So we can show order history in the profile
-- ============================================================
-- Ensure customer_id column exists (it should from previous migration)
ALTER TABLE public.whatsapp_orders 
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id);

-- Allow users to read their own orders
DO $$ BEGIN
  CREATE POLICY "whatsapp_orders_select_own" ON public.whatsapp_orders
    FOR SELECT USING (auth.uid() = customer_id OR customer_id IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
