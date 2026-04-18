-- =====================================================
-- Migración: Agregar cost_price a products y validar roles
-- Fecha: 2026-04-18
-- =====================================================

-- 1. Agregar columna cost_price a la tabla products
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2) DEFAULT NULL;

COMMENT ON COLUMN products.cost_price IS 'Precio de costo del producto. Solo visible para administradores.';

-- 2. Asegurarse de que el tipo de rol exista y esté limitado a admin/vendedor
-- (ya existe en el schema base, esto es solo verificación)
-- ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'vendedor'));

-- 3. RLS: Restringir la lectura del cost_price a admin únicamente
-- Nota: Esto se hace a nivel de aplicación. En Supabase se puede reforzar con RLS:

-- Política: Solo admins pueden VER cost_price en products
-- Para mayor seguridad, se puede crear una view para vendedores sin cost_price:
CREATE OR REPLACE VIEW products_for_sellers AS
  SELECT 
    id,
    name,
    description,
    category,
    price,
    original_price,
    discount_percentage,
    image_url,
    images,
    drop_id,
    is_visible,
    created_at
  FROM products;

-- Permisos de la vista para el rol anon/authenticated (vendedores)
-- Los admins siguen leyendo la tabla products directamente con cost_price

-- 4. Verificar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'cost_price';
