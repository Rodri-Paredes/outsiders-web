-- ====================================================================================================
-- SCRIPT DE LIMPIEZA DE DATOS PARA PRODUCCIÓN
-- ====================================================================================================
-- Propósito: Eliminar todos los datos de prueba (transacciones, catálogo y stock)
--            preservando la configuración básica (usuarios y sucursales) para que el
--            cliente pueda empezar desde cero manteniendo el acceso al panel de administración.
-- Fecha: 2026-03-04
-- ====================================================================================================

BEGIN;

-- TRUNCATE TABLE vacía las tablas rápidamente.
-- La cláusula CASCADE se encarga de vaciar cualquier otra tabla que dependa de estas 
-- mediante llaves foráneas (foreign keys), garantizando integridad referencial.

TRUNCATE TABLE 
    stock_movements,
    sale_items,
    sales,
    cash_movements,
    cash_registers,
    stock,
    drop_products,
    product_variants,
    products,
    drops
CASCADE;

COMMIT;

-- ====================================================================================================
-- NOTA: Este script NO elimina los usuarios (`users` y `auth.users`) ni las sucursales (`branches`).
-- Esto permite que el administrador siga teniendo acceso al sistema para comenzar a cargar la
-- información real de producción.
-- 
-- Si por algún motivo también necesitas borrar los usuarios (NO RECOMENDADO si quieres conservar
-- el acceso) y las sucursales, descomenta la siguiente línea y ejecútala por separado:
-- 
-- TRUNCATE TABLE users, branches CASCADE;
-- ====================================================================================================
