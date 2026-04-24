-- Migration v9: Add size_guide_id to products table
-- This allows each product to specify which size guide to display,
-- instead of relying on the material tag lookup.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS size_guide_id UUID REFERENCES size_guides(id) ON DELETE SET NULL;

-- Optional index for faster joins
CREATE INDEX IF NOT EXISTS idx_products_size_guide_id ON products(size_guide_id);

COMMENT ON COLUMN products.size_guide_id IS
  'Reference to a specific size guide. If set, this guide is shown on the product page instead of the material-based lookup.';
