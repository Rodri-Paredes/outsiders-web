-- ====================================================================================================
-- DIAGNÓSTICO SIMPLE - Ver todo en una sola consulta
-- ====================================================================================================
-- Ejecuta esto y exporta TODO el resultado (Export CSV)
-- ====================================================================================================

WITH 
funciones AS (
  SELECT 
    '🔍 FUNCIONES INSTALADAS' as categoria,
    routine_name as nombre,
    '✅ EXISTE' as estado
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN (
      'update_stock',
      'transfer_stock_atomic',
      'update_stock_with_audit',
      'register_stock_movement'
    )
),
tablas AS (
  SELECT 
    '📊 TABLAS' as categoria,
    table_name as nombre,
    '✅ EXISTE' as estado
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('stock', 'stock_movements')
),
triggers_sistema AS (
  SELECT 
    '⚡ TRIGGERS' as categoria,
    t.tgname as nombre,
    CASE WHEN t.tgenabled = 'O' THEN '✅ ACTIVO' ELSE '❌ INACTIVO' END as estado
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  WHERE c.relname IN ('stock', 'sale_items')
    AND t.tgname IN ('trigger_audit_stock_changes', 'after_sale_item_insert_update_stock')
    AND NOT t.tgisinternal
),
resumen_funciones AS (
  SELECT 
    '📋 RESUMEN' as categoria,
    'Funciones: ' || COUNT(*)::text || ' / 3' as nombre,
    CASE 
      WHEN COUNT(*) >= 3 THEN '✅ COMPLETO'
      ELSE '⚠️ FALTAN ' || (3 - COUNT(*))::text
    END as estado
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN ('update_stock', 'transfer_stock_atomic', 'update_stock_with_audit')
),
resumen_tablas AS (
  SELECT 
    '📋 RESUMEN' as categoria,
    'Tablas: ' || COUNT(*)::text || ' / 2' as nombre,
    CASE 
      WHEN COUNT(*) >= 2 THEN '✅ COMPLETO'
      ELSE '⚠️ FALTAN ' || (2 - COUNT(*))::text
    END as estado
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('stock', 'stock_movements')
),
resumen_triggers AS (
  SELECT 
    '📋 RESUMEN' as categoria,
    'Triggers: ' || COUNT(*)::text || ' / 2' as nombre,
    CASE 
      WHEN COUNT(*) >= 2 THEN '✅ COMPLETO'
      ELSE '⚠️ FALTAN ' || (2 - COUNT(*))::text
    END as estado
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  WHERE c.relname IN ('stock', 'sale_items')
    AND t.tgname IN ('trigger_audit_stock_changes', 'after_sale_item_insert_update_stock')
    AND NOT t.tgisinternal
)
SELECT * FROM funciones
UNION ALL
SELECT * FROM tablas
UNION ALL
SELECT * FROM triggers_sistema
UNION ALL
SELECT * FROM resumen_funciones
UNION ALL
SELECT * FROM resumen_tablas
UNION ALL
SELECT * FROM resumen_triggers
ORDER BY categoria DESC, nombre;
