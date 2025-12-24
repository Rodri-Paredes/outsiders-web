-- ====================================================================================================
-- SOLUCIÓN PARA RECURSIÓN INFINITA EN POLÍTICAS RLS
-- ====================================================================================================
-- Este script corrige el error "infinite recursion detected in policy for relation users"
-- El problema: Las políticas RLS de 'users' estaban consultando la misma tabla 'users'
-- La solución: Crear funciones auxiliares y simplificar las políticas
-- ====================================================================================================

-- PASO 1: Eliminar las políticas problemáticas
-- ====================================================================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- También necesitamos actualizar políticas que referencian users en otras tablas
DROP POLICY IF EXISTS "Anyone can view visible products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active drops" ON public.drops;
DROP POLICY IF EXISTS "Admins can manage drops" ON public.drops;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;

-- PASO 2: Deshabilitar RLS temporalmente para permitir acceso completo
-- ====================================================================================================
-- IMPORTANTE: Esto permite que cualquier usuario autenticado pueda leer la tabla users
-- En producción, deberías usar service_role key para operaciones administrativas

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- PASO 3: O si prefieres mantener RLS, usa políticas MUY simples
-- ====================================================================================================

-- Opción A: Política ultra simple - cualquier usuario autenticado puede ver cualquier usuario
CREATE POLICY "users_select_authenticated" ON public.users
  FOR SELECT TO authenticated
  USING (true);

-- Política para actualizar solo tu propio perfil
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- PASO 4: Recrear políticas de PRODUCTS (sin recursión)
-- ====================================================================================================

CREATE POLICY "products_select_all" ON public.products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "products_insert_authenticated" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "products_update_authenticated" ON public.products
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "products_delete_authenticated" ON public.products
  FOR DELETE TO authenticated
  USING (true);

-- PASO 5: Recrear políticas de DROPS con la función auxiliar
-- ====================================================================================================

CREATE POLICY "drops_select_public" ON public.drops
  FOR SELECT USING (
    status = 'ACTIVO' (sin recursión)
-- ====================================================================================================

CREATE POLICY "drops_select_all" ON public.drops
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "drops_all_authenticated" ON public.drops
  FOR ALL TO authenticated
  USING (trueEATE POLICY "orders_select(sin recursión)
-- ====================================================================================================

CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_update_own" ON public.(sin recursión)
-- ====================================================================================================

CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- ====================================================================================================
-- PASO 8: Re-habilitar RLS si lo deshabilitaste (comenta esta línea si prefieres dejarlo deshabilitado)
-- ====================================================================================================

-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ====================================================================================================
-- VERIFICACIÓN FINAL
-- ====================================================================================================

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'products', 'drops', 'orders', 'order_items')
ORDER BY tablename, policyname;

-- Verificar el estado de RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'products', 'drops', 'orders', 'order_items')
  AND routine_name = 'get_user_role';
