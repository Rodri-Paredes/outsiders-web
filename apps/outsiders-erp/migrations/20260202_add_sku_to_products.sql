/*
  ====================================================================================================
  AGREGAR CAMPO SKU A PRODUCTOS
  ====================================================================================================
  
  Esta migración agrega:
  - Campo 'sku' a la tabla products para códigos de barras/SKU
  - Restricción UNIQUE en el SKU
  - Índice para búsquedas rápidas por SKU
  
  Fecha: 2026-02-02
  ====================================================================================================
*/

-- Agregar columna SKU a productos
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS sku text UNIQUE;

COMMENT ON COLUMN products.sku IS 'Código de barras/SKU del producto (opcional, único)';

-- Crear índice para búsquedas rápidas por SKU
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;

-- Verificar la migración
DO $$
BEGIN

  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'sku'
  ) THEN
    RAISE NOTICE '✅ Campo SKU agregado correctamente a productos';
  ELSE
    RAISE EXCEPTION '❌ Error: Campo SKU no se agregó correctamente';
  END IF;
END $$;
