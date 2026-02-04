-- ====================================================================================================
-- AGREGAR TABLA DROP_PRODUCTS
-- ====================================================================================================
-- Esta tabla permite relacionar productos con drops (lanzamientos especiales)
-- Ejecuta esto si quieres usar la funcionalidad de drops con productos
-- ====================================================================================================

-- Crear tabla drop_products
CREATE TABLE IF NOT EXISTS public.drop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(drop_id, product_id)
);

COMMENT ON TABLE public.drop_products IS 'Relación muchos a muchos entre drops y productos';

-- Crear índices para mejor rendimiento
CREATE INDEX idx_drop_products_drop ON public.drop_products(drop_id);
CREATE INDEX idx_drop_products_product ON public.drop_products(product_id);

-- Habilitar RLS
ALTER TABLE public.drop_products ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Todos los autenticados pueden acceder
CREATE POLICY "drop_products_all_auth" ON public.drop_products
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Verificación
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename = 'drop_products';

-- ====================================================================================================
-- ¡Listo! Ahora puedes asociar productos con drops
-- ====================================================================================================
