/*
  Migración: Agregar soporte para múltiples imágenes en productos
  Fecha: 2026-01-02
  
  Agrega el campo 'images' como array de URLs para soportar múltiples imágenes por producto.
  Mantiene 'image_url' para compatibilidad con versiones anteriores.
*/

-- Agregar columna images como array de texto
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images text[];

-- Comentario explicativo
COMMENT ON COLUMN products.images IS 'Array de URLs de imágenes del producto (soporte para múltiples imágenes)';

-- Migrar datos existentes: copiar image_url a images si existe
UPDATE products 
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL AND images IS NULL;

-- Crear índice para búsquedas más eficientes
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN(images);

-- Verificación
SELECT 
  'Migración completada' as status,
  COUNT(*) as total_products,
  COUNT(CASE WHEN images IS NOT NULL THEN 1 END) as products_with_images
FROM products;
