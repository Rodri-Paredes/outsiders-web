-- Migration: Add web_only flag to products
-- Date: 2026-04-27
-- Description: Adds a boolean column `web_only` (default false) to mark products
--              that are only available for purchase through the online store.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS web_only BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN products.web_only IS 'When true, this product is only sold through the web store (shows SOLO WEB badge).';
