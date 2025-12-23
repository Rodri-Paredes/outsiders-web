-- Ver movimientos de caja para debug
SELECT 
  'MOVIMIENTOS DE CAJA ACTUAL' as info;

SELECT 
  cm.id,
  cm.created_at,
  cm.payment_type,
  cm.movement_type,
  cm.amount,
  cm.description,
  cr.opening_date as caja_abierta
FROM cash_movements cm
JOIN cash_registers cr ON cm.cash_register_id = cr.id
WHERE cr.status = 'ABIERTA'
ORDER BY cm.created_at DESC;

-- Ver ventas y sus payment_type
SELECT 
  'ÚLTIMAS VENTAS' as info;

SELECT 
  s.id,
  s.sale_date,
  s.payment_type,
  s.total,
  s.payment_details
FROM sales s
ORDER BY s.sale_date DESC
LIMIT 10;
