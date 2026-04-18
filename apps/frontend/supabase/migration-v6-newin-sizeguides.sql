-- ====================================================================================================
-- MIGRATION V6 — NEW IN FLAG + SIZE GUIDES BY MATERIAL
-- ====================================================================================================
-- 1. Agrega columna is_new_in a products (badge "NEW IN" en frontend)
-- 2. Crea tabla size_guides para guías de talla por material, gestionables desde el ERP
-- ====================================================================================================

-- ====================================================================================================
-- 1. CAMPO is_new_in EN PRODUCTS
-- ====================================================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_new_in boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.products.is_new_in IS 'Si true, muestra el badge NEW IN en el frontend';

-- Índice para filtrar New In rápidamente
CREATE INDEX IF NOT EXISTS idx_products_is_new_in
  ON public.products(is_new_in)
  WHERE is_new_in = true;

-- ====================================================================================================
-- 2. TABLA: SIZE_GUIDES (Guías de talla por material)
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.size_guides (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  material     text        NOT NULL UNIQUE,   -- Ej: 'Alto gramaje', '20/1', 'Jeans'
  rows         jsonb       NOT NULL DEFAULT '[]',
  -- Ejemplo rows:
  -- [
  --   {"size": "S",  "a": 51, "b": 70, "c": 0},
  --   {"size": "M",  "a": 54, "b": 72, "c": 0},
  --   {"size": "L",  "a": 57, "b": 75, "c": 0},
  --   {"size": "XL", "a": 60, "b": 78, "c": 0}
  -- ]
  col_a_label  text        NOT NULL DEFAULT 'Ancho',   -- Nombre de la columna A
  col_b_label  text        NOT NULL DEFAULT 'Largo',   -- Nombre de la columna B
  col_c_label  text        NOT NULL DEFAULT '',        -- Nombre de la columna C (opcional)
  image_url    text,                                   -- Imagen de referencia (medición)
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

COMMENT ON TABLE  public.size_guides IS 'Guías de talla por material. Cada fila define la tabla de medidas para un material específico.';
COMMENT ON COLUMN public.size_guides.material    IS 'Nombre del material (coincide con el nombre de un tag de tipo gramaje/material)';
COMMENT ON COLUMN public.size_guides.rows        IS 'Array JSON de filas: [{ size: "S", a: 51, b: 70, c: 0 }, ...]';
COMMENT ON COLUMN public.size_guides.col_a_label IS 'Etiqueta de la primera columna de medidas (ej: Ancho)';
COMMENT ON COLUMN public.size_guides.col_b_label IS 'Etiqueta de la segunda columna de medidas (ej: Largo)';
COMMENT ON COLUMN public.size_guides.col_c_label IS 'Etiqueta de la tercera columna de medidas (vacío = ocultar columna)';
COMMENT ON COLUMN public.size_guides.image_url   IS 'URL de imagen de referencia para la guía de tallas';

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_size_guides_updated_at ON public.size_guides;
CREATE TRIGGER trg_size_guides_updated_at
  BEFORE UPDATE ON public.size_guides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.size_guides ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede leer las guías (las necesita el frontend)
CREATE POLICY "Anyone can read size guides"
  ON public.size_guides FOR SELECT USING (true);

-- Solo usuarios autenticados del ERP pueden modificar
CREATE POLICY "Authenticated users can manage size guides"
  ON public.size_guides FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ====================================================================================================
-- 3. DATOS DE EJEMPLO
-- ====================================================================================================

INSERT INTO public.size_guides (material, col_a_label, col_b_label, col_c_label, rows)
VALUES
  ('Alto gramaje', 'Ancho', 'Largo', '',
   '[{"size":"XS","a":48,"b":67,"c":0},{"size":"S","a":51,"b":70,"c":0},{"size":"M","a":54,"b":72,"c":0},{"size":"L","a":57,"b":75,"c":0},{"size":"XL","a":60,"b":78,"c":0}]'),
  ('20/1', 'Ancho', 'Largo', '',
   '[{"size":"XS","a":46,"b":65,"c":0},{"size":"S","a":49,"b":68,"c":0},{"size":"M","a":52,"b":70,"c":0},{"size":"L","a":55,"b":73,"c":0},{"size":"XL","a":58,"b":76,"c":0}]')
ON CONFLICT (material) DO NOTHING;

-- ====================================================================================================
-- 4. VERIFICACIÓN
-- ====================================================================================================

SELECT
  'Migración V6 completada' AS status,
  (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_new_in') AS is_new_in_column,
  (SELECT COUNT(*) FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'size_guides') AS size_guides_tabla;
