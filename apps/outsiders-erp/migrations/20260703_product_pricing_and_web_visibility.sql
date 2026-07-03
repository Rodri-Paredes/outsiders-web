-- Migration: Precio base inmutable + descuentos consistentes + visibilidad web independiente
-- Date: 2026-07-03
--
-- Problema 1 (bug de descuentos): la columna `price` se usaba a la vez como
-- "precio base" y como "precio final ya con descuento aplicado". Al quitar un
-- descuento, el formulario del ERP limpiaba `original_price`/`discount_percentage`
-- pero nunca restauraba `price`, dejando el valor descontado guardado como si
-- fuera el precio normal del producto (100 -> 80 con descuento -> se quita el
-- descuento -> queda en 80 para siempre).
--
-- Solución: `base_price` pasa a ser la única fuente de verdad, editable solo
-- desde el ERP y nunca tocada por la lógica de descuento. `price` y
-- `original_price` se convierten en columnas GENERADAS por Postgres, calculadas
-- siempre a partir de `base_price` + `discount_percentage`. Quitar un descuento
-- es simplemente poner `discount_percentage = NULL`; la base de datos misma
-- recalcula `price = base_price` en la misma transacción. Ya no existe ningún
-- lugar donde un precio descontado pueda "quedar pegado", y el redondeo ocurre
-- en un único lugar (evita los errores de punto flotante que motivaron el
-- parche anterior en d7e91ff).
--
-- Problema 2 (productos solo-ERP): `is_visible` ya se usa para el listado
-- propio del ERP y para la política RLS pública, así que no sirve para
-- "vender en POS pero ocultar de la web" sin romper el comportamiento actual
-- del ERP. Se agrega `visible_on_web`, independiente, y se refuerza a nivel de
-- RLS (no solo en el código del frontend) para que un producto oculto no sea
-- legible ni siquiera pegándole directo a la API REST de Supabase con la
-- anon key.

-- ====================================================================================================
-- 1. VISIBILIDAD WEB INDEPENDIENTE DEL ERP
-- ====================================================================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS visible_on_web BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN products.visible_on_web IS
  'Cuando es false, el producto sigue existiendo y se puede vender desde el ERP/POS, pero no aparece en el catálogo web, búsquedas, ni es accesible por su URL pública. Independiente de is_visible (que controla el listado interno del ERP).';

CREATE INDEX IF NOT EXISTS idx_products_visible_on_web ON products(visible_on_web);

-- ====================================================================================================
-- 2. PRECIO BASE INMUTABLE + DESCUENTO SIEMPRE CALCULADO
-- ====================================================================================================

-- 2.1 Nueva columna: única fuente de verdad del precio, nunca escrita por la
--     lógica de descuento. Se rellena con el precio "real" de cada producto:
--     si ya tenía un descuento activo, original_price es el precio base
--     verdadero; si no, price ya era el precio base.
ALTER TABLE products ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);

UPDATE products
SET base_price = COALESCE(original_price, price)
WHERE base_price IS NULL;

ALTER TABLE products ALTER COLUMN base_price SET NOT NULL;

-- NOT VALID: no escanea las filas existentes al agregar el constraint (evita
-- que la migración aborte si hay datos legacy fuera de rango), pero sí se
-- aplica a partir de ahora a todo INSERT/UPDATE. Correr el VALIDATE CONSTRAINT
-- comentado más abajo cuando se confirme que los datos existentes son válidos.
ALTER TABLE products ADD CONSTRAINT products_base_price_check CHECK (base_price >= 0) NOT VALID;

-- 2.2 Rango válido para el porcentaje de descuento (ya validado en el
--     formulario del ERP, se refuerza también en la DB).
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_discount_percentage_check;
ALTER TABLE products ADD CONSTRAINT products_discount_percentage_check
  CHECK (discount_percentage IS NULL OR (discount_percentage > 0 AND discount_percentage < 100)) NOT VALID;

-- Una vez confirmado que no hay filas legacy fuera de rango:
-- ALTER TABLE products VALIDATE CONSTRAINT products_base_price_check;
-- ALTER TABLE products VALIDATE CONSTRAINT products_discount_percentage_check;

-- 2.3 `price` y `original_price` dejan de ser columnas normales y pasan a ser
--     generadas: ya no se pueden escribir directamente (INSERT/UPDATE con
--     estos campos falla), Postgres las recalcula siempre desde base_price +
--     discount_percentage. Todo el código que solo LEE product.price /
--     product.original_price (catálogo, carrito, checkout, ERP) sigue
--     funcionando sin cambios porque el nombre y el tipo de columna no cambian.
--
--     `products_for_sellers` (vista de 20260418_add_cost_price_and_roles.sql,
--     sin uso detectado en el código actual) depende de products.price /
--     products.original_price, así que bloquearía el DROP COLUMN. Se elimina
--     y se recrea idéntica al final para no perder el objeto por si algo
--     externo al repo la usa.
DROP VIEW IF EXISTS products_for_sellers;

ALTER TABLE products DROP COLUMN IF EXISTS price;
ALTER TABLE products ADD COLUMN price DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE
    WHEN discount_percentage IS NOT NULL AND discount_percentage > 0
      THEN ROUND(base_price * (1 - discount_percentage / 100.0), 2)
    ELSE base_price
  END
) STORED;

ALTER TABLE products DROP COLUMN IF EXISTS original_price;
ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE
    WHEN discount_percentage IS NOT NULL AND discount_percentage > 0
      THEN base_price
    ELSE NULL
  END
) STORED;

COMMENT ON COLUMN products.base_price IS 'Precio base del producto. Única fuente de verdad; nunca lo modifica la lógica de descuento. Editable solo desde el ERP.';
COMMENT ON COLUMN products.price IS 'Precio final de venta (columna generada): base_price con el descuento aplicado si discount_percentage > 0, si no es igual a base_price.';
COMMENT ON COLUMN products.original_price IS 'Precio tachado a mostrar en UI (columna generada): igual a base_price cuando hay descuento activo, NULL si no.';

-- Recrear la vista eliminada en el paso 2.3, ahora sobre las columnas generadas.
CREATE OR REPLACE VIEW products_for_sellers AS
  SELECT
    id,
    name,
    description,
    category,
    base_price,
    price,
    original_price,
    discount_percentage,
    image_url,
    images,
    drop_id,
    is_visible,
    visible_on_web,
    created_at
  FROM products;

-- ====================================================================================================
-- 3. RLS: reforzar visibilidad web a nivel de base de datos
-- ====================================================================================================

DROP POLICY IF EXISTS "products_select_public" ON public.products;
CREATE POLICY "products_select_public" ON public.products
  FOR SELECT
  USING (is_visible = true AND visible_on_web = true);

-- Nota: "products_select_staff" (usuarios ADMIN/VENDEDOR autenticados) no se
-- toca — el ERP debe seguir viendo y vendiendo productos con
-- visible_on_web = false.
