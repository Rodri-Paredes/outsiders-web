-- ====================================================================================================
-- SCRIPT DE VERIFICACIÓN RÁPIDA - Sistema de Stock
-- ====================================================================================================
-- Ejecuta este script después de aplicar las migraciones para verificar que todo funciona
-- Proporciona un reporte completo del estado del sistema de stock
-- Compatible con Supabase SQL Editor
-- ====================================================================================================

-- ====================================================================================================
-- 1. VERIFICAR FUNCIONES PRINCIPALES
-- ====================================================================================================

SELECT 
  '1️⃣ FUNCIONES PRINCIPALES' as "🔍 Verificación",
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  routine_name as "Función",
  CASE 
    WHEN routine_name = 'update_stock' THEN '✅ Actualización básica de stock'
    WHEN routine_name = 'transfer_stock_atomic' THEN '✅ Transferencias transaccionales'
    WHEN routine_name = 'update_stock_with_audit' THEN '✅ Actualización con auditoría'
    WHEN routine_name = 'register_stock_movement' THEN '✅ Registro de auditoría'
    WHEN routine_name = 'trigger_update_stock_on_sale' THEN '✅ Descuento en ventas'
    WHEN routine_name = 'create_complete_sale' THEN '✅ Creación de ventas'
    ELSE '⚠️  Función auxiliar'
  END as "Estado"
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_stock',
    'transfer_stock_atomic',
    'update_stock_with_audit',
    'register_stock_movement',
    'trigger_update_stock_on_sale',
    'create_complete_sale'
  )
ORDER BY routine_name;

-- ====================================================================================================
-- 2. VERIFICAR TABLA DE AUDITORÍA
-- ====================================================================================================

SELECT 
  '2️⃣ TABLA DE AUDITORÍA' as "🔍 Verificación",
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  table_name as "Tabla",
  CASE 
    WHEN table_name = 'stock' THEN '✅ Tabla principal de inventario'
    WHEN table_name = 'stock_movements' THEN '✅ Tabla de auditoría de movimientos'
    ELSE '⚠️  Tabla relacionada'
  END as "Estado"
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('stock', 'stock_movements')
ORDER BY table_name;

-- Verificar índices de stock_movements (solo si existe)
SELECT 
  '📊 ÍNDICES DE AUDITORÍA' as "Categoría",
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements')
    THEN '✅ ' || COUNT(*)::text || ' índices creados'
    ELSE '⚠️ Tabla stock_movements no existe'
  END as "Estado",
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements')
    THEN 'Índices optimizan consultas de auditoría'
    ELSE 'Ejecuta: 20260301_create_stock_movements_table.sql'
  END as "Descripción"
FROM information_schema.tables
WHERE table_schema = 'public'
GROUP BY table_schema;

-- ====================================================================================================
-- 3. VERIFICAR TRIGGERS
-- ====================================================================================================

SELECT 
  '3️⃣ TRIGGERS DEL SISTEMA' as "🔍 Verificación",
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  t.tgname as "Trigger",
  c.relname as "Tabla",
  CASE 
    WHEN t.tgenabled = 'O' THEN '✅ Activo'
    WHEN t.tgenabled = 'D' THEN '❌ Desactivado'
    ELSE '⚠️  Estado desconocido'
  END as "Estado",
  CASE 
    WHEN t.tgname = 'trigger_audit_stock_changes' THEN 'Registro automático de cambios'
    WHEN t.tgname = 'after_sale_item_insert_update_stock' THEN 'Descuento en ventas'
    WHEN t.tgname = 'after_sale_insert_register_cash' THEN 'Registro en caja'
    ELSE 'Otro propósito'
  END as "Descripción"
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('stock', 'sale_items', 'sales')
  AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- ====================================================================================================
-- 4. VERIFICAR VISTAS
-- ====================================================================================================

SELECT 
  '4️⃣ VISTAS DEL SISTEMA' as "🔍 Verificación",
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'stock_movements_detailed')
    THEN '✅ Vista stock_movements_detailed existe'
    ELSE '⚠️ Vista stock_movements_detailed NO existe'
  END as "Estado",
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'stock_movements_detailed')
    THEN 'Vista disponible para consultas simplificadas'
    ELSE 'Se creará con: 20260301_create_stock_movements_table.sql'
  END as "Descripción";

-- ====================================================================================================
-- 5. VERIFICAR RLS (ROW LEVEL SECURITY)
-- ====================================================================================================

SELECT 
  '5️⃣ ROW LEVEL SECURITY' as "🔍 Verificación",
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  schemaname as "Schema",
  tablename as "Tabla",
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Activado'
    ELSE '❌ RLS Desactivado'
  END as "Estado"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('stock', 'stock_movements')
ORDER BY tablename;

-- Políticas RLS
SELECT 
  '📋 POLÍTICAS RLS' as "Categoría",
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  schemaname as "Schema",
  tablename as "Tabla",
  policyname as "Política",
  '✅ Configurada' as "Estado"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('stock', 'stock_movements')
ORDER BY tablename, policyname;

-- ====================================================================================================
-- 6. ESTADÍSTICAS DE STOCK ACTUAL
-- ====================================================================================================

SELECT 
  '6️⃣ ESTADÍSTICAS DEL SISTEMA' as "🔍 Verificación",
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

-- Estadísticas básicas  
SELECT 
  'Registros de Stock' as "Métrica",
  COUNT(*)::text as "Valor"
FROM stock
UNION ALL
SELECT 
  'Productos con Stock',
  COUNT(DISTINCT variant_id)::text
FROM stock
UNION ALL
SELECT 
  'Sucursales con Stock',
  COUNT(DISTINCT branch_id)::text
FROM stock
UNION ALL
SELECT 
  'Unidades Totales en Inventario',
  COALESCE(SUM(quantity), 0)::text
FROM stock
UNION ALL
SELECT 
  'Stock Promedio por Producto',
  COALESCE(ROUND(AVG(CASE WHEN quantity > 0 THEN quantity END), 2), 0)::text
FROM stock
UNION ALL
-- Verificar si existe tabla de movimientos
SELECT 
  'Movimientos Registrados',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements')
    THEN '✅ Ver sección 7 y 8'
    ELSE '⚠️ Tabla no existe'
  END
FROM (SELECT 1) as dummy;

-- ====================================================================================================
-- 7. ÚLTIMAS OPERACIONES REGISTRADAS
-- ====================================================================================================

SELECT 
  '7️⃣ ÚLTIMAS OPERACIONES' as "🔍 Verificación",
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements')
    THEN '✅ Tabla stock_movements existe'
    ELSE '⚠️  Tabla stock_movements NO existe'
  END as "Estado",
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements')
    THEN 'Ejecuta queries manualmente para ver datos'
    ELSE 'Ejecuta: 20260301_create_stock_movements_table.sql'
  END as "Acción";

-- NOTA: Si la tabla existe, ejecuta esta query manualmente:
-- SELECT created_at, movement_type, quantity, branch_name, product_name
-- FROM stock_movements_detailed
-- ORDER BY created_at DESC LIMIT 10;

-- ====================================================================================================
-- 8. DISTRIBUCIÓN DE MOVIMIENTOS POR TIPO
-- ====================================================================================================

SELECT 
  '8️⃣ DISTRIBUCIÓN POR TIPO' as "🔍 Verificación",
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements')
    THEN '✅ Sistema de auditoría disponible'
    ELSE '⚠️  Sin sistema de auditoría'
  END as "Estado",
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements')
    THEN 'Ejecuta queries manualmente para ver estadísticas'
    ELSE 'Instala sistema completo con las 3 migraciones'
  END as "Acción";

-- NOTA: Si la tabla existe, ejecuta esta query manualmente:
-- SELECT movement_type, COUNT(*) as cantidad,
--   ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) || '%' as porcentaje
-- FROM stock_movements
-- GROUP BY movement_type
-- ORDER BY COUNT(*) DESC;

-- ====================================================================================================
-- 9. PRODUCTOS CON STOCK BAJO (< 5 unidades)
-- ====================================================================================================

SELECT 
  '9️⃣ ALERTAS DE STOCK BAJO' as "🔍 Verificación",
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  COUNT(*) as "Productos con Stock Bajo"
FROM stock
WHERE quantity < 5;

SELECT 
  p.name as "Producto",
  pv.size as "Talla",
  b.name as "Sucursal",
  s.quantity as "Stock Actual"
FROM stock s
JOIN product_variants pv ON s.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
JOIN branches b ON s.branch_id = b.id
WHERE s.quantity < 5
ORDER BY s.quantity ASC, p.name
LIMIT 10;

-- ====================================================================================================
-- 10. TEST RÁPIDO DE INTEGRIDAD
-- ====================================================================================================

SELECT 
  '🔟 TEST DE INTEGRIDAD' as "🔍 Verificación",
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

DO $$
DECLARE
  v_stock_count integer;
  v_movements_count integer;
  v_functions_count integer;
  v_triggers_count integer;
  v_test_result text;
BEGIN
  -- Contar funciones críticas
  SELECT COUNT(*) INTO v_functions_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN (
      'update_stock',
      'transfer_stock_atomic',
      'update_stock_with_audit'
    );
  
  -- Contar triggers críticos
  SELECT COUNT(*) INTO v_triggers_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  WHERE c.relname IN ('stock', 'sale_items')
    AND t.tgname IN ('trigger_audit_stock_changes', 'after_sale_item_insert_update_stock')
    AND NOT t.tgisinternal;
  
  -- Verificar tabla stock
  SELECT COUNT(*) INTO v_stock_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'stock';
  
  -- Verificar tabla stock_movements
  SELECT COUNT(*) INTO v_movements_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'stock_movements';
  
  -- Evaluar resultado
  IF v_functions_count >= 3 AND v_triggers_count >= 2 AND 
     v_stock_count = 1 AND v_movements_count = 1 THEN
    RAISE NOTICE '✅ ============================================';
    RAISE NOTICE '✅   SISTEMA DE STOCK: TODO CORRECTO          ';
    RAISE NOTICE '✅ ============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Funciones críticas: % / 3', v_functions_count;
    RAISE NOTICE 'Triggers activos: % / 2', v_triggers_count;
    RAISE NOTICE 'Tabla stock: EXISTE';
    RAISE NOTICE 'Tabla stock_movements: EXISTE';
    RAISE NOTICE '';
    RAISE NOTICE '✅ El sistema está listo para producción';
  ELSE
    RAISE WARNING '⚠️  ============================================';
    RAISE WARNING '⚠️   ATENCIÓN: CONFIGURACIÓN INCOMPLETA       ';
    RAISE WARNING '⚠️  ============================================';
    RAISE WARNING '';
    RAISE WARNING 'Funciones críticas: % / 3', v_functions_count;
    RAISE WARNING 'Triggers activos: % / 2', v_triggers_count;
    
    IF v_stock_count = 0 THEN
      RAISE WARNING '❌ Tabla stock: NO EXISTE';
    END IF;
    
    IF v_movements_count = 0 THEN
      RAISE WARNING '❌ Tabla stock_movements: NO EXISTE';
      RAISE WARNING '   → Ejecutar: 20260301_create_stock_movements_table.sql';
    END IF;
    
    IF v_functions_count < 3 THEN
      RAISE WARNING '⚠️  Faltan funciones críticas';
      RAISE WARNING '   → Ejecutar: 20260301_add_transfer_stock_atomic.sql';
      RAISE WARNING '   → Ejecutar: 20260301_add_stock_audit_triggers.sql';
    END IF;
    
    IF v_triggers_count < 2 THEN
      RAISE WARNING '⚠️  Faltan triggers críticos';
      RAISE WARNING '   → Ejecutar: 20260301_add_stock_audit_triggers.sql';
    END IF;
  END IF;
END $$;

-- ====================================================================================================
-- FIN DE VERIFICACIÓN
-- ====================================================================================================

SELECT 
  '✅ VERIFICACIÓN COMPLETADA' as "Estado",
  'Revisa los resultados arriba' as "Información";

SELECT 
  '📚 DOCUMENTACIÓN DISPONIBLE' as "Recursos";

SELECT 
  'docs/ANALISIS_FLUJO_STOCK.md' as "Archivo",
  'Análisis completo del flujo' as "Descripción"
UNION ALL
SELECT 
  'migrations/README_CORRECCIONES_STOCK.md',
  'Guía de correcciones'
UNION ALL
SELECT 
  'migrations/ORDEN_EJECUCION_STOCK.md',
  'Orden de ejecución de migraciones';
