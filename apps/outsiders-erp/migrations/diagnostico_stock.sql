-- ====================================================================================================
-- SCRIPT DE DIAGNÓSTICO: Verificar estado del stock
-- ====================================================================================================
-- Ejecuta este script en Supabase SQL Editor para ver el estado actual del stock
-- ====================================================================================================

-- 1. Ver todos los productos y sus variantes
SELECT 
  'PRODUCTOS Y VARIANTES' as info;
  
SELECT 
  p.id as product_id,
  p.name as product_name,
  pv.id as variant_id,
  pv.size
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
ORDER BY p.name, pv.size;

-- 2. Ver stock actual por variante y sucursal
SELECT 
  'STOCK ACTUAL' as info;

SELECT 
  p.name as producto,
  pv.size as talla,
  b.name as sucursal,
  COALESCE(s.quantity, 0) as cantidad,
  s.updated_at
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
CROSS JOIN branches b
LEFT JOIN stock s ON s.variant_id = pv.id AND s.branch_id = b.id
ORDER BY p.name, pv.size, b.name;

-- 3. Ver variantes SIN stock inicializado en ninguna sucursal
SELECT 
  'VARIANTES SIN STOCK' as info;

SELECT 
  p.name as producto,
  pv.size as talla,
  pv.id as variant_id,
  'No tiene stock en ninguna sucursal' as problema
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE NOT EXISTS (
  SELECT 1 FROM stock s WHERE s.variant_id = pv.id
)
ORDER BY p.name, pv.size;

-- 4. Ver últimas ventas y sus items
SELECT 
  'ÚLTIMAS VENTAS' as info;

SELECT 
  s.id as sale_id,
  s.sale_date,
  b.name as sucursal,
  u.name as vendedor,
  si.quantity as cantidad_vendida,
  p.name as producto,
  pv.size as talla
FROM sales s
JOIN branches b ON s.branch_id = b.id
JOIN users u ON s.user_id = u.id
LEFT JOIN sale_items si ON s.id = si.sale_id
LEFT JOIN product_variants pv ON si.variant_id = pv.id
LEFT JOIN products p ON pv.product_id = p.id
ORDER BY s.sale_date DESC
LIMIT 10;

-- 5. Resumen
SELECT 
  'RESUMEN' as info,
  (SELECT COUNT(*) FROM products) as total_productos,
  (SELECT COUNT(*) FROM product_variants) as total_variantes,
  (SELECT COUNT(DISTINCT variant_id) FROM stock) as variantes_con_stock,
  (SELECT COUNT(*) FROM branches) as total_sucursales;
