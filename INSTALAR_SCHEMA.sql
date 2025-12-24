-- ====================================================================================================
-- PASO 1: VERIFICAR SI EL SCHEMA ESTÁ INSTALADO
-- ====================================================================================================

-- Ver si existen las tablas principales
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'products', 'branches', 'drops')
ORDER BY table_name;

-- Si NO aparecen las 4 tablas, necesitas ejecutar el schema completo.
-- Si SÍ aparecen, pasa al PASO 2.

-- ====================================================================================================
-- PASO 2: LIMPIAR BASE DE DATOS ANTERIOR (si existe algo)
-- ====================================================================================================

-- Solo ejecuta esto si ya tenías tablas creadas antes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

DROP TABLE IF EXISTS public.cash_movements CASCADE;
DROP TABLE IF EXISTS public.cash_registers CASCADE;
DROP TABLE IF EXISTS public.drop_products CASCADE;
DROP TABLE IF EXISTS public.sale_items CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;
DROP TABLE IF EXISTS public.stock CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.drops CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;

DROP TYPE IF EXISTS cash_register_status CASCADE;
DROP TYPE IF EXISTS movement_type CASCADE;
DROP TYPE IF EXISTS payment_type CASCADE;
DROP TYPE IF EXISTS drop_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ====================================================================================================
-- PASO 3: DESPUÉS DE LIMPIAR, EJECUTA EL SCHEMA COMPLETO
-- ====================================================================================================

-- Ahora ve al archivo: apps/frontend/supabase/unified-schema.sql
-- Copia TODO su contenido
-- Pégalo aquí en SQL Editor
-- Ejecuta (Run)

-- ====================================================================================================
-- PASO 4: VERIFICAR QUE SE INSTALÓ CORRECTAMENTE
-- ====================================================================================================

-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Deberías ver estas 15 tablas:
-- branches
-- carts
-- cart_items
-- cash_movements
-- cash_registers
-- drop_products
-- drops
-- order_items
-- orders
-- product_variants
-- products
-- sale_items
-- sales
-- stock
-- users

-- Ver productos de ejemplo
SELECT id, name, price, stock FROM public.products LIMIT 5;

-- Ver sucursales
SELECT * FROM public.branches;
