-- ====================================================================================================
-- DEBUG: Verificar ventas y reportes
-- ====================================================================================================

-- 1. Ver todas las ventas
SELECT 'VENTAS REGISTRADAS' as info;

SELECT 
  s.id,
  s.sale_date,
  b.name as sucursal,
  u.name as usuario,
  s.payment_type,
  s.subtotal,
  s.discount_amount,
  s.total
FROM sales s
JOIN branches b ON s.branch_id = b.id
JOIN users u ON s.user_id = u.id
ORDER BY s.sale_date DESC;

-- 2. Ver items de ventas
SELECT 'ITEMS DE VENTAS' as info;

SELECT 
  s.id as sale_id,
  s.sale_date,
  p.name as producto,
  pv.size as talla,
  si.quantity,
  si.unit_price,
  si.subtotal
FROM sales s
JOIN sale_items si ON s.id = si.sale_id
JOIN product_variants pv ON si.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
ORDER BY s.sale_date DESC;

-- 3. Probar función get_sales_stats para cada sucursal
SELECT 'ESTADÍSTICAS POR SUCURSAL (últimos 30 días)' as info;

SELECT 
  b.name as sucursal,
  stats.*
FROM branches b
CROSS JOIN LATERAL (
  SELECT * FROM get_sales_stats(
    b.id,
    (CURRENT_DATE - INTERVAL '30 days')::date,
    CURRENT_DATE::date
  )
) stats
ORDER BY b.name;

-- 4. Probar get_top_products
SELECT 'TOP PRODUCTOS (últimos 30 días)' as info;

SELECT 
  b.name as sucursal,
  tp.*
FROM branches b
CROSS JOIN LATERAL (
  SELECT * FROM get_top_products(
    b.id,
    (CURRENT_DATE - INTERVAL '30 days')::date,
    CURRENT_DATE::date,
    5
  )
) tp
WHERE tp.product_name IS NOT NULL
ORDER BY b.name, tp.quantity_sold DESC;

-- 5. Ver ventas por método de pago
SELECT 'VENTAS POR MÉTODO DE PAGO' as info;

SELECT 
  b.name as sucursal,
  s.payment_type,
  COUNT(*) as cantidad,
  SUM(s.total) as total
FROM sales s
JOIN branches b ON s.branch_id = b.id
WHERE s.sale_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY b.name, s.payment_type
ORDER BY b.name, s.payment_type;
