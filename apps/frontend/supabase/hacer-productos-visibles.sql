-- ====================================================================================================
-- HACER PRODUCTOS VISIBLES EN EL E-COMMERCE
-- ====================================================================================================
-- Este script hace que todos los productos existentes sean visibles en el e-commerce
-- ====================================================================================================

-- Ver productos actuales y su estado de visibilidad
SELECT 
  id,
  name,
  category,
  price,
  is_visible,
  created_at
FROM public.products
ORDER BY created_at DESC;

-- Hacer TODOS los productos visibles
UPDATE public.products
SET is_visible = true
WHERE is_visible = false OR is_visible IS NULL;

-- Verificar que se aplicó el cambio
SELECT 
  id,
  name,
  category,
  price,
  is_visible,
  created_at
FROM public.products
ORDER BY created_at DESC;

-- ====================================================================================================
-- Si solo quieres hacer visible un producto específico:
-- ====================================================================================================
-- UPDATE public.products
-- SET is_visible = true
-- WHERE id = 'PEGA_AQUI_EL_ID_DEL_PRODUCTO';

-- ====================================================================================================
-- ¡Listo! Ahora tus productos deberían aparecer en el e-commerce
-- ====================================================================================================
