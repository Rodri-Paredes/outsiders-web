-- Migration: Redondear precios con descuento a bolivianos enteros (sin centavos)
-- Date: 2026-07-11
--
-- Problema: la tienda no maneja centavos, pero cualquier producto con un
-- descuento activo puede terminar con centavos igual, porque el % de
-- descuento se guarda con 2 decimales y al aplicarlo sobre base_price rara
-- vez da un resultado exacto. Ejemplo real encontrado en producción
-- (SKU-783238-R8X1): base_price = 240, discount_percentage = 16.67 (pensado
-- para dar 200 exacto, 1/6 = 16.666...%), pero 240 * (1 - 16.67/100) =
-- 199.992, y redondeado a 2 decimales queda en 199.99 — un centavo menos del
-- número redondo que se buscaba.
--
-- Solución: las columnas generadas price/mid_price pasan de redondear a 2
-- decimales (ROUND(x, 2)) a redondear al entero (ROUND(x, 0)). Redondear al
-- entero absorbe ese error de precisión de los porcentajes con decimales y
-- deja el precio final siempre en bolivianos limpios. Como son columnas
-- GENERADAS, este cambio de fórmula corrige automáticamente TODOS los
-- productos existentes con descuento activo, sin necesidad de tocar cada
-- fila a mano.

DROP VIEW IF EXISTS products_for_sellers;

ALTER TABLE products DROP COLUMN IF EXISTS mid_price;
ALTER TABLE products ADD COLUMN mid_price DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE
    WHEN discount_percentage IS NOT NULL AND discount_percentage > 0
     AND markdown_percentage IS NOT NULL AND markdown_percentage > 0
      THEN ROUND(base_price * (1 - discount_percentage / 100.0), 0)
    ELSE NULL
  END
) STORED;

ALTER TABLE products DROP COLUMN IF EXISTS price;
ALTER TABLE products ADD COLUMN price DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE
    WHEN discount_percentage IS NOT NULL AND discount_percentage > 0
     AND markdown_percentage IS NOT NULL AND markdown_percentage > 0
      THEN ROUND(ROUND(base_price * (1 - discount_percentage / 100.0), 0) * (1 - markdown_percentage / 100.0), 0)
    WHEN discount_percentage IS NOT NULL AND discount_percentage > 0
      THEN ROUND(base_price * (1 - discount_percentage / 100.0), 0)
    ELSE base_price
  END
) STORED;

COMMENT ON COLUMN products.mid_price IS
  'Precio tras el primer descuento (columna generada), redondeado a boliviano entero. A mostrar tachado en la UI. Solo no-NULL cuando hay un segundo descuento (markdown_percentage) activo encima.';
COMMENT ON COLUMN products.price IS
  'Precio final de venta (columna generada), redondeado a boliviano entero (sin centavos). base_price con discount_percentage aplicado, y markdown_percentage aplicado además si está activo.';

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
