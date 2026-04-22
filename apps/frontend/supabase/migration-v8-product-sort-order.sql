-- ====================================================================================================
-- MIGRATION V8 — PRODUCT SORT ORDER PER CATEGORY
-- ====================================================================================================
-- Agrega columna sort_order a products para que el cliente pueda ordenar manualmente
-- los productos dentro de cada categoría desde el CMS del ERP.
-- Si sort_order = 0 (default), se usa created_at DESC como criterio de desempate.
-- ====================================================================================================

-- 1. CAMPO sort_order EN PRODUCTS
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.products.sort_order IS
  'Orden manual dentro de la categoría. Menor número = aparece primero. 0 = sin orden definido (usa created_at DESC como desempate).';

-- 2. ÍNDICE para acelerar ORDER BY category + sort_order
CREATE INDEX IF NOT EXISTS idx_products_category_sort_order
  ON public.products(category, sort_order, created_at DESC);

-- 3. Inicializar sort_order con el orden actual (created_at DESC por categoría)
--    Esto asigna números 1, 2, 3... a cada producto dentro de su categoría
--    para que el orden actual se preserve al activar el nuevo sistema.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY category
      ORDER BY created_at DESC
    ) AS rn
  FROM public.products
)
UPDATE public.products p
SET sort_order = r.rn
FROM ranked r
WHERE p.id = r.id;
