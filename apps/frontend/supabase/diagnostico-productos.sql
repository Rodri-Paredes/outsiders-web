-- ====================================================================================================
-- DIAGNÓSTICO Y SOLUCIÓN DE PRODUCTOS
-- ====================================================================================================

-- 1. Ver TODOS los productos en la base de datos
SELECT 
  id,
  name,
  category,
  price,
  is_visible,
  stock_quantity,
  created_at
FROM public.products
ORDER BY created_at DESC;

-- 2. Contar productos por visibilidad
SELECT 
  is_visible,
  COUNT(*) as cantidad
FROM public.products
GROUP BY is_visible;

-- ====================================================================================================
-- SOLUCIÓN 1: Hacer visibles TODOS los productos existentes
-- ====================================================================================================

UPDATE public.products
SET is_visible = true
WHERE is_visible = false OR is_visible IS NULL;

-- ====================================================================================================
-- SOLUCIÓN 2: Si NO hay productos, insertar productos de ejemplo
-- ====================================================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
    INSERT INTO public.products (name, description, category, price, is_visible, stock_quantity, image_url)
    VALUES 
      ('Hoodie Oversize Negro', 'Hoodie oversize 100% algodón con diseño exclusivo', 'Hoodies', 89.99, true, 50, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop'),
      ('Cargo Pants Beige', 'Pantalones cargo estilo urbano con múltiples bolsillos', 'Pantalones', 79.99, true, 30, 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=750&fit=crop'),
      ('T-Shirt Graphic Black', 'Playera con diseño gráfico exclusivo oversized', 'Camisetas', 49.99, true, 100, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop'),
      ('Chaqueta Denim Wash', 'Chaqueta de mezclilla oversized con lavado vintage', 'Chaquetas', 129.99, true, 20, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=750&fit=crop'),
      ('Sudadera Cream', 'Sudadera oversized color crema ultra suave', 'Hoodies', 69.99, true, 40, 'https://images.unsplash.com/photo-1623876229339-0df13d6a0027?w=600&h=750&fit=crop'),
      ('Joggers Black', 'Joggers negros con ajuste perfecto y bolsillos laterales', 'Pantalones', 59.99, true, 60, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop'),
      ('Bomber Jacket', 'Chaqueta bomber estilo clásico con detalles premium', 'Chaquetas', 149.99, true, 15, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop'),
      ('T-Shirt White', 'Playera blanca básica oversized 100% algodón', 'Camisetas', 39.99, true, 120, 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&h=750&fit=crop');
  END IF;
END $$;

-- ====================================================================================================
-- VERIFICACIÓN FINAL
-- ====================================================================================================

-- Ver productos visibles (estos deberían aparecer en el e-commerce)
SELECT 
  id,
  name,
  category,
  price,
  is_visible,
  stock_quantity,
  created_at
FROM public.products
WHERE is_visible = true
ORDER BY created_at DESC;

-- Resumen
SELECT 
  COUNT(*) as total_productos,
  COUNT(*) FILTER (WHERE is_visible = true) as productos_visibles,
  COUNT(*) FILTER (WHERE is_visible = false OR is_visible IS NULL) as productos_ocultos
FROM public.products;

-- ====================================================================================================
-- ✅ Después de ejecutar esto, recarga el frontend (F5) y deberías ver los productos
-- ====================================================================================================
