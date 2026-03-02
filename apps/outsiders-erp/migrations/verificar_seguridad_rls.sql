-- ====================================================================================================
-- VERIFICACIÓN DE SEGURIDAD - ROW LEVEL SECURITY (RLS)
-- ====================================================================================================
-- Este script verifica que todas las políticas de seguridad estén correctamente configuradas
-- Ejecutar en Supabase SQL Editor
-- ====================================================================================================

-- ====================================================================================================
-- 1. VERIFICAR ESTADO DE RLS POR TABLA
-- ====================================================================================================

SELECT 
  '🔒 ESTADO DE RLS POR TABLA' as seccion;

SELECT 
  schemaname as schema,
  tablename as tabla,
  CASE 
    WHEN rowsecurity = true THEN '✅ ACTIVADO'
    ELSE '❌ DESACTIVADO - CRÍTICO'
  END as estado_rls,
  CASE 
    WHEN rowsecurity = false THEN '⚠️ TABLA SIN PROTECCIÓN'
    ELSE '✅ Tabla protegida'
  END as descripcion
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN ('spatial_ref_sys') -- Excluir tablas del sistema
ORDER BY 
  rowsecurity DESC, 
  tablename;

-- ====================================================================================================
-- 2. LISTAR TODAS LAS POLÍTICAS RLS
-- ====================================================================================================

SELECT 
  '📋 POLÍTICAS RLS CONFIGURADAS' as seccion;

SELECT 
  pol.schemaname as schema,
  pol.tablename as tabla,
  pol.policyname as politica,
  pol.permissive as permisivo,
  pol.roles as roles,
  pol.cmd as comando,
  CASE 
    WHEN pol.qual IS NOT NULL THEN 'CON FILTRO'
    ELSE 'SIN FILTRO'
  END as tiene_filtro,
  '✅ Configurada' as estado
FROM pg_policies pol
WHERE pol.schemaname = 'public'
ORDER BY pol.tablename, pol.policyname;

-- ====================================================================================================
-- 3. TABLAS CRÍTICAS QUE DEBEN TENER RLS
-- ====================================================================================================

SELECT 
  '⚠️ VERIFICACIÓN DE TABLAS CRÍTICAS' as seccion;

WITH tablas_criticas AS (
  SELECT unnest(ARRAY[
    'users',
    'sales', 
    'sale_items',
    'stock',
    'stock_movements',
    'cash_registers',
    'cash_movements',
    'products',
    'product_variants',
    'branches',
    'drops',
    'drop_products'
  ]) as tabla_nombre
)
SELECT 
  tc.tabla_nombre as tabla,
  CASE 
    WHEN pg.rowsecurity = true THEN '✅ PROTEGIDA'
    WHEN pg.rowsecurity = false THEN '❌ SIN RLS - CRÍTICO'
    WHEN pg.tablename IS NULL THEN '⚠️ TABLA NO EXISTE'
  END as estado,
  COALESCE(
    (SELECT COUNT(*)::text 
     FROM pg_policies 
     WHERE tablename = tc.tabla_nombre),
    '0'
  ) || ' políticas' as politicas_total
FROM tablas_criticas tc
LEFT JOIN pg_tables pg ON pg.tablename = tc.tabla_nombre AND pg.schemaname = 'public'
ORDER BY 
  CASE 
    WHEN pg.rowsecurity = false THEN 1
    WHEN pg.tablename IS NULL THEN 2
    ELSE 3
  END,
  tc.tabla_nombre;

-- ====================================================================================================
-- 4. VERIFICAR POLÍTICAS POR OPERACIÓN
-- ====================================================================================================

SELECT 
  '🔐 POLÍTICAS POR OPERACIÓN (CRUD)' as seccion;

SELECT 
  tablename as tabla,
  COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
  COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
  COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
  COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies,
  COUNT(*) as total_policies,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ Bien protegida'
    WHEN COUNT(*) = 1 THEN '⚠️ Protección parcial'
    ELSE '❌ Sin políticas'
  END as evaluacion
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY total_policies DESC, tablename;

-- ====================================================================================================
-- 5. FUNCIONES RPC Y SU SEGURIDAD
-- ====================================================================================================

SELECT 
  '⚙️ FUNCIONES RPC PÚBLICAS' as seccion;

SELECT 
  routine_name as funcion,
  routine_type as tipo,
  security_type as tipo_seguridad,
  CASE 
    WHEN security_type = 'DEFINER' THEN '✅ Segura (ejecuta con permisos del creador)'
    WHEN security_type = 'INVOKER' THEN '⚠️ Ejecuta con permisos del usuario'
    ELSE '❓ Tipo desconocido'
  END as evaluacion_seguridad
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'create_complete_sale',
    'update_stock',
    'transfer_stock_atomic',
    'update_stock_with_audit',
    'register_stock_movement',
    'trigger_update_stock_on_sale'
  )
ORDER BY routine_name;

-- ====================================================================================================
-- 6. VERIFICAR GRANTS (PERMISOS)
-- ====================================================================================================

SELECT 
  '👥 PERMISOS DE ACCESO' as seccion;

SELECT 
  grantee as usuario_role,
  table_schema as schema,
  table_name as tabla,
  string_agg(privilege_type, ', ') as permisos,
  CASE 
    WHEN grantee = 'anon' THEN '🌐 Usuario anónimo (público)'
    WHEN grantee = 'authenticated' THEN '✅ Usuarios autenticados'
    WHEN grantee = 'service_role' THEN '🔧 Service role (backend)'
    ELSE '👤 ' || grantee
  END as descripcion
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'service_role')
GROUP BY grantee, table_schema, table_name
ORDER BY 
  CASE 
    WHEN grantee = 'anon' THEN 1
    WHEN grantee = 'authenticated' THEN 2
    ELSE 3
  END,
  table_name;

-- ====================================================================================================
-- 7. TEST DE SEGURIDAD - ACCESO NO AUTORIZADO
-- ====================================================================================================

SELECT 
  '🧪 TESTS DE SEGURIDAD' as seccion;

-- Test 1: Verificar que tablas críticas no sean accesibles sin autenticación
SELECT 
  'Test 1: Acceso Anónimo' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.role_table_grants
      WHERE grantee = 'anon' 
        AND table_name IN ('users', 'sales', 'cash_registers', 'stock_movements')
        AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE')
    ) THEN '❌ FALLO: Usuario anónimo puede modificar datos críticos'
    ELSE '✅ PASÓ: Usuario anónimo no puede modificar datos críticos'
  END as resultado;

-- Test 2: Verificar que productos sean públicamente legibles
SELECT 
  'Test 2: Productos Públicos' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.role_table_grants
      WHERE grantee = 'anon' 
        AND table_name = 'products'
        AND privilege_type = 'SELECT'
    ) THEN '✅ PASÓ: Productos son públicamente legibles'
    ELSE '⚠️ ADVERTENCIA: Productos podrían no ser públicos'
  END as resultado;

-- Test 3: Verificar RLS en tablas de negocio
SELECT 
  'Test 3: RLS en Tablas de Negocio' as test,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('sales', 'stock', 'cash_registers')
        AND rowsecurity = false
    ) THEN '✅ PASÓ: Todas las tablas de negocio tienen RLS'
    ELSE '❌ FALLO: Algunas tablas de negocio no tienen RLS'
  END as resultado;

-- ====================================================================================================
-- 8. RESUMEN DE SEGURIDAD
-- ====================================================================================================

SELECT 
  '📊 RESUMEN DE SEGURIDAD' as seccion;

DO $$
DECLARE
  v_tablas_con_rls integer;
  v_tablas_sin_rls integer;
  v_total_politicas integer;
  v_funciones_seguras integer;
  v_nivel_seguridad text;
BEGIN
  -- Contar tablas con RLS
  SELECT COUNT(*) INTO v_tablas_con_rls
  FROM pg_tables
  WHERE schemaname = 'public' 
    AND rowsecurity = true
    AND tablename NOT LIKE 'pg_%';
  
  -- Contar tablas sin RLS
  SELECT COUNT(*) INTO v_tablas_sin_rls
  FROM pg_tables
  WHERE schemaname = 'public' 
    AND rowsecurity = false
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT IN ('spatial_ref_sys');
  
  -- Contar políticas totales
  SELECT COUNT(*) INTO v_total_politicas
  FROM pg_policies
  WHERE schemaname = 'public';
  
  -- Contar funciones con seguridad DEFINER
  SELECT COUNT(*) INTO v_funciones_seguras
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND security_type = 'DEFINER';
  
  -- Evaluar nivel de seguridad
  IF v_tablas_sin_rls = 0 AND v_total_politicas >= 10 THEN
    v_nivel_seguridad := '✅ EXCELENTE';
  ELSIF v_tablas_sin_rls <= 2 AND v_total_politicas >= 5 THEN
    v_nivel_seguridad := '⚠️ BUENO (mejorar)';
  ELSE
    v_nivel_seguridad := '❌ INSUFICIENTE';
  END IF;
  
  -- Mostrar resumen
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   RESUMEN DE SEGURIDAD DEL SISTEMA    ';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tablas con RLS: % tablas', v_tablas_con_rls;
  RAISE NOTICE 'Tablas sin RLS: % tablas', v_tablas_sin_rls;
  RAISE NOTICE 'Políticas RLS: % políticas', v_total_politicas;
  RAISE NOTICE 'Funciones seguras: % funciones', v_funciones_seguras;
  RAISE NOTICE '';
  RAISE NOTICE 'NIVEL DE SEGURIDAD: %', v_nivel_seguridad;
  RAISE NOTICE '';
  
  IF v_tablas_sin_rls > 0 THEN
    RAISE WARNING '⚠️ Hay % tablas sin RLS - revisar configuración', v_tablas_sin_rls;
  END IF;
  
  IF v_total_politicas < 10 THEN
    RAISE WARNING '⚠️ Pocas políticas RLS configuradas - revisar protección';
  END IF;
  
  IF v_nivel_seguridad = '✅ EXCELENTE' THEN
    RAISE NOTICE '✅ Sistema seguro y listo para producción';
  END IF;
END $$;

-- ====================================================================================================
-- FIN DE VERIFICACIÓN
-- ====================================================================================================

SELECT 
  '✅ VERIFICACIÓN DE SEGURIDAD COMPLETADA' as estado,
  'Revisa los resultados arriba' as informacion;
