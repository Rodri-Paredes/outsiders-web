-- Migration: Fix tags and categories
-- Description:
-- 1. Updates the global tag "20/1" to belong to the "gramaje" group instead of "material".
-- 2. Updates all products that were historically categorized as "Sudaderas" to "Hoodies".
-- 3. (Optional safeguard) Updates any tags bound specifically to "Sudaderas" to "Hoodies".

-- Move 20/1 constraint to 'gramaje'
UPDATE product_tags
SET tag_group = 'gramaje'
WHERE name = '20/1' AND tag_group = 'material';

-- Rename the category globally
UPDATE products
SET category = 'Hoodies'
WHERE category = 'Sudaderas';

-- Ensure no orphaned tags mapped specifically to Sudaderas
UPDATE product_tags
SET category = 'Hoodies'
WHERE category = 'Sudaderas';

-- Delete the Waffle tag as uniquely requested
DELETE FROM product_tags WHERE name = 'Waffle';

