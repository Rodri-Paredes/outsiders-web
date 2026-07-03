-- Migration: Segundo nivel de descuento (markdown compuesto sobre el descuento vigente)
-- Date: 2026-07-10
--
-- Pedido: cuando un producto ya tiene un descuento activo, poder agregarle un
-- segundo descuento "encima" del primero, y que la web muestre las tres cifras:
-- precio normal (tachado), primer descuento (tachado), último descuento
-- (precio real de venta, sin tachar). El segundo descuento se calcula sobre el
-- precio YA descontado por el primero (compuesto), no sobre base_price directo.
--
-- Sigue el mismo principio que la migración anterior (20260703): base_price es
-- la única fuente editable, todo lo demás se deriva. Un generated column no
-- puede referenciar a otro generated column en Postgres, así que la fórmula de
-- cada nivel se repite completa en cada columna en vez de encadenarlas.

-- ====================================================================================================
-- 1. Segundo nivel de descuento
-- ====================================================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS markdown_percentage DECIMAL;

COMMENT ON COLUMN products.markdown_percentage IS
  'Segundo descuento, aplicado sobre el precio ya rebajado por discount_percentage (compuesto, no sobre base_price). Requiere discount_percentage activo. NULL = sin segundo descuento.';

-- No puede haber un segundo descuento sin el primero.
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_markdown_requires_discount;
ALTER TABLE products ADD CONSTRAINT products_markdown_requires_discount
  CHECK (markdown_percentage IS NULL OR (discount_percentage IS NOT NULL AND discount_percentage > 0))
  NOT VALID;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_markdown_percentage_check;
ALTER TABLE products ADD CONSTRAINT products_markdown_percentage_check
  CHECK (markdown_percentage IS NULL OR (markdown_percentage > 0 AND markdown_percentage < 100))
  NOT VALID;

-- ====================================================================================================
-- 2. Recalcular columnas generadas: mid_price (nueva) + price (redefinida)
-- ====================================================================================================

DROP VIEW IF EXISTS products_for_sellers;

-- Precio intermedio: el precio tras el primer descuento, tachado en la UI,
-- pero solo tiene sentido mostrarlo cuando también hay un segundo descuento
-- activo (si no hay markdown, el precio final YA ES el de un solo descuento,
-- como antes — no hay tres cifras que mostrar).
ALTER TABLE products DROP COLUMN IF EXISTS mid_price;
ALTER TABLE products ADD COLUMN mid_price DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE
    WHEN discount_percentage IS NOT NULL AND discount_percentage > 0
     AND markdown_percentage IS NOT NULL AND markdown_percentage > 0
      THEN ROUND(base_price * (1 - discount_percentage / 100.0), 2)
    ELSE NULL
  END
) STORED;

COMMENT ON COLUMN products.mid_price IS
  'Precio tras el primer descuento (columna generada), a mostrar tachado en la UI. Solo no-NULL cuando hay un segundo descuento (markdown_percentage) activo encima.';

ALTER TABLE products DROP COLUMN IF EXISTS price;
ALTER TABLE products ADD COLUMN price DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE
    WHEN discount_percentage IS NOT NULL AND discount_percentage > 0
     AND markdown_percentage IS NOT NULL AND markdown_percentage > 0
      -- Compuesto: el segundo descuento se aplica sobre el precio YA
      -- redondeado del primero, para que coincida exactamente con lo que se
      -- muestra tachado en mid_price.
      THEN ROUND(ROUND(base_price * (1 - discount_percentage / 100.0), 2) * (1 - markdown_percentage / 100.0), 2)
    WHEN discount_percentage IS NOT NULL AND discount_percentage > 0
      THEN ROUND(base_price * (1 - discount_percentage / 100.0), 2)
    ELSE base_price
  END
) STORED;

COMMENT ON COLUMN products.price IS
  'Precio final de venta (columna generada). base_price con discount_percentage aplicado, y markdown_percentage aplicado además si está activo (compuesto sobre el precio ya descontado).';

CREATE OR REPLACE VIEW products_for_sellers AS
  SELECT
    id,
    name,
    description,
    category,
    base_price,
    mid_price,
    price,
    original_price,
    discount_percentage,
    markdown_percentage,
    image_url,
    images,
    drop_id,
    is_visible,
    visible_on_web,
    created_at
  FROM products;

-- Una vez confirmado que no hay filas legacy fuera de rango:
-- ALTER TABLE products VALIDATE CONSTRAINT products_markdown_requires_discount;
-- ALTER TABLE products VALIDATE CONSTRAINT products_markdown_percentage_check;
