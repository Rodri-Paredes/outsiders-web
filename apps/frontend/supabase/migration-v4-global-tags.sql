-- ====================================================================================================
-- MIGRATION V4 — GLOBAL TAGS (Toggles category constraint to NULL)
-- ====================================================================================================
-- Run this in your Supabase SQL Editor.
-- This sets the 'Básica' and 'Estampada' tags so they can be applied to both Poleras and Hoodies.
-- ====================================================================================================

-- Quitar restricción de categoría de Poleras para hacerlas globales
UPDATE public.product_tags 
SET category = NULL 
WHERE name IN ('Básica', 'Estampada');

-- Agregar un par de tags adicionales de prueba si se considera útil para hoodies
-- INSERT INTO public.product_tags (name, category, tag_group) VALUES
--   ('Heavyweight', NULL, 'material'),
--   ('French Terry', NULL, 'material')
-- ON CONFLICT (name) DO NOTHING;
