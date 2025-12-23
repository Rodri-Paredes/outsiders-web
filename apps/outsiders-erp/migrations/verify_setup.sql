-- ====================================================================================================
-- SCRIPT DE VERIFICACIÓN Y SETUP COMPLETO
-- ====================================================================================================
-- Este script verifica que todo esté configurado correctamente
-- ====================================================================================================

-- 1. VERIFICAR TABLAS
DO $$
DECLARE
  table_count integer;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN (
      'branches', 'users', 'products', 'product_variants', 
      'stock', 'sales', 'sale_items', 'drops', 'drop_products', 
      'cash_registers', 'cash_movements'
    );
  
  RAISE NOTICE 'Tablas encontradas: %', table_count;
  
  IF table_count < 11 THEN
    RAISE WARNING 'Faltan tablas. Ejecuta primero el schema principal.';
  ELSE
    RAISE NOTICE '✓ Todas las tablas están creadas';
  END IF;
END $$;

-- 2. VERIFICAR FUNCIONES
DO $$
DECLARE
  func_count integer;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc 
  WHERE proname IN (
    'update_stock',
    'open_cash_register',
    'close_cash_register',
    'register_sale_movement',
    'get_open_cash_register',
    'get_cash_register_summary',
    'get_sales_stats',
    'get_top_products',
    'get_active_drops',
    'get_drop_products'
  );
  
  RAISE NOTICE 'Funciones encontradas: %', func_count;
  
  IF func_count < 10 THEN
    RAISE WARNING 'Faltan funciones. Ejecuta el script de funciones adicionales.';
  ELSE
    RAISE NOTICE '✓ Todas las funciones están creadas';
  END IF;
END $$;

-- 3. VERIFICAR SUCURSALES
DO $$
DECLARE
  branch_count integer;
BEGIN
  SELECT COUNT(*) INTO branch_count FROM branches;
  
  RAISE NOTICE 'Sucursales encontradas: %', branch_count;
  
  IF branch_count = 0 THEN
    RAISE NOTICE 'Creando sucursales iniciales...';
    
    INSERT INTO branches (name, address) VALUES
      ('Outsiders Centro', 'Av. Principal 123, Centro'),
      ('Outsiders Mall', 'Mall Plaza Local 45, Zona Norte'),
      ('Outsiders Express', 'Calle Comercio 789, Zona Sur')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✓ Sucursales creadas';
  ELSE
    RAISE NOTICE '✓ Sucursales ya existen';
  END IF;
END $$;

-- 4. VERIFICAR STORAGE BUCKET
DO $$
BEGIN
  -- Intentar crear el bucket si no existe
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('products', 'products', true)
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE '✓ Storage bucket "products" verificado';
END $$;

-- 5. LISTAR SUCURSALES
SELECT 'SUCURSALES DISPONIBLES' as info;
SELECT id, name, address, created_at FROM branches;

-- 6. LISTAR USUARIOS ADMIN
SELECT 'USUARIOS ADMINISTRADORES' as info;
SELECT id, name, email, role, created_at FROM users WHERE role = 'admin';

-- 7. VERIFICAR POLÍTICAS RLS
SELECT 'POLÍTICAS RLS' as info;
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 8. RESUMEN
SELECT 
  'RESUMEN DEL SISTEMA' as info,
  (SELECT COUNT(*) FROM branches) as sucursales,
  (SELECT COUNT(*) FROM users WHERE role = 'admin') as admins,
  (SELECT COUNT(*) FROM products) as productos,
  (SELECT COUNT(*) FROM sales) as ventas_totales;

-- ====================================================================================================
-- RESULTADO ESPERADO:
-- ✓ 11 tablas creadas
-- ✓ 10+ funciones creadas  
-- ✓ 3 sucursales disponibles
-- ✓ Storage bucket configurado
-- ✓ Políticas RLS activas
-- ====================================================================================================

