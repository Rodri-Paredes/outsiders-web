-- ====================================================================================================
-- CORREGIR POLÍTICAS RLS PARA ACCESO PÚBLICO
-- ====================================================================================================
-- Este script permite que cualquier persona (sin login) vea productos y drops
-- Y permite que vendedores puedan crear/editar productos
-- ====================================================================================================

-- ====================================================================================================
-- 1. ELIMINAR POLÍTICAS ANTIGUAS DE PRODUCTS
-- ====================================================================================================

DROP POLICY IF EXISTS "products_select_all" ON public.products;
DROP POLICY IF EXISTS "products_insert_auth" ON public.products;
DROP POLICY IF EXISTS "products_update_auth" ON public.products;
DROP POLICY IF EXISTS "products_delete_auth" ON public.products;

-- ====================================================================================================
-- 2. CREAR NUEVAS POLÍTICAS PARA PRODUCTS (ACCESO PÚBLICO PARA VER)
-- ====================================================================================================

-- Cualquiera puede ver productos visibles (incluso sin login)
CREATE POLICY "products_select_public" ON public.products
  FOR SELECT 
  USING (is_visible = true);

-- Usuarios autenticados (admin y vendedor) pueden ver todos los productos
CREATE POLICY "products_select_staff" ON public.products
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'VENDEDOR'))
  );

-- Vendedores y admins pueden crear productos
CREATE POLICY "products_insert_staff" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'VENDEDOR'))
  );

-- Vendedores y admins pueden actualizar productos
CREATE POLICY "products_update_staff" ON public.products
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'VENDEDOR'))
  );

-- Solo admins pueden eliminar productos
CREATE POLICY "products_delete_admin" ON public.products
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
  );

-- ====================================================================================================
-- 3. ELIMINAR POLÍTICAS ANTIGUAS DE DROPS
-- ====================================================================================================

DROP POLICY IF EXISTS "drops_select_all" ON public.drops;
DROP POLICY IF EXISTS "drops_modify_auth" ON public.drops;

-- ====================================================================================================
-- 4. CREAR NUEVAS POLÍTICAS PARA DROPS (ACCESO PÚBLICO PARA VER)
-- ====================================================================================================

-- Cualquiera puede ver drops activos (incluso sin login)
CREATE POLICY "drops_select_public" ON public.drops
  FOR SELECT 
  USING (status IN ('ACTIVO', 'PROXIMO'));

-- Staff puede ver todos los drops
CREATE POLICY "drops_select_staff" ON public.drops
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'VENDEDOR'))
  );

-- Vendedores y admins pueden crear drops
CREATE POLICY "drops_insert_staff" ON public.drops
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'VENDEDOR'))
  );

-- Vendedores y admins pueden actualizar drops
CREATE POLICY "drops_update_staff" ON public.drops
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'VENDEDOR'))
  );

-- Solo admins pueden eliminar drops
CREATE POLICY "drops_delete_admin" ON public.drops
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
  );

-- ====================================================================================================
-- 5. ACTUALIZAR POLÍTICAS DE CARTS PARA ACCESO PÚBLICO (usuarios anónimos también pueden tener carrito)
-- ====================================================================================================

-- Esta parte es opcional, pero permite que usuarios no logueados también agreguen al carrito
-- Por ahora la dejamos como está (requiere login para carrito)

-- ====================================================================================================
-- VERIFICACIÓN FINAL
-- ====================================================================================================

-- Ver todas las políticas de products
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'drops')
ORDER BY tablename, policyname;

-- Probar acceso público a productos
SELECT 
  id,
  name,
  category,
  price,
  is_visible
FROM public.products
WHERE is_visible = true
LIMIT 5;

-- ====================================================================================================
-- ✅ Después de ejecutar esto:
-- - Usuarios NO logueados podrán ver productos y drops
-- - Vendedores podrán crear/editar productos
-- - Solo admins podrán eliminar
-- ====================================================================================================
