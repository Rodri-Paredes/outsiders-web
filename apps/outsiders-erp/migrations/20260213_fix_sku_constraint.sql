-- ====================================================================================================
-- Migración: Ajustar constraint de SKU para permitir múltiples valores NULL
-- Fecha: 2026-02-13
-- Descripción: Modificar la restricción UNIQUE del campo SKU para permitir múltiples productos sin SKU
-- ====================================================================================================

-- Eliminar el constraint único existente en SKU
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;

-- Crear un índice único parcial que solo aplica a valores no NULL
-- Esto permite múltiples productos con SKU NULL pero garantiza que los SKU no NULL sean únicos
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique_idx 
ON products (sku) 
WHERE sku IS NOT NULL;

COMMENT ON INDEX products_sku_unique_idx IS 'Índice único para SKU, permite múltiples valores NULL';
