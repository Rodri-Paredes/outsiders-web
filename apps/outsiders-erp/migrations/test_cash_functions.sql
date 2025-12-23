-- Test directo de las funciones de caja
-- Si este script funciona, el problema es solo el caché de Supabase

-- 1. Probar get_open_cash_register
SELECT 'TEST: get_open_cash_register' as test;
SELECT * FROM get_open_cash_register('b2e7de73-f9b5-47f4-8b6a-d3c53575470c'); -- Reemplaza con tu branch_id

-- 2. Listar todas las cajas
SELECT 'TODAS LAS CAJAS' as info;
SELECT id, branch_id, status, opening_date, opening_amount FROM cash_registers ORDER BY opening_date DESC;

-- 3. Probar get_cash_register_summary con una caja existente
SELECT 'TEST: get_cash_register_summary' as test;
SELECT * FROM get_cash_register_summary(
  (SELECT id FROM cash_registers LIMIT 1)
);

-- 4. Ver si la función existe
SELECT 
  'FUNCIONES EXISTENTES' as info,
  proname as nombre_funcion,
  pg_get_function_arguments(oid) as argumentos
FROM pg_proc 
WHERE proname LIKE '%cash%'
ORDER BY proname;
