-- ====================================================================================================
-- MIGRATION V5 — PRODUCT VIEWS & ANONYMOUS RECOMMENDATION SYSTEM
-- ====================================================================================================
--
-- Crea la tabla de vistas de productos para el sistema de recomendaciones anónimas.
-- No requiere login: cada usuario es identificado por un anon_id UUID almacenado en localStorage.
--
-- TABLAS:
--   product_views — registra cada producto visto por un usuario anónimo
--
-- FUNCIONES:
--   get_favorite_category(p_anon_id) — devuelve la categoría más vista por el usuario
--
-- SEGURIDAD:
--   - Cualquier visitante (anon) puede registrar vistas (INSERT)
--   - Las consultas de historial se hacen vía función SECURITY DEFINER (no expone la tabla completa)
--   - No se almacenan datos personales (solo UUID anonimizado)
--
-- Ejecutar en: Supabase SQL Editor
-- Fecha: 2026-04-18
-- ====================================================================================================

-- ====================================================================================================
-- 1. TABLA: PRODUCT_VIEWS
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.product_views (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id     text        NOT NULL,
  product_id  uuid        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category    text        NOT NULL,
  viewed_at   timestamptz DEFAULT now()
);

COMMENT ON TABLE  public.product_views IS 'Historial de productos vistos por usuarios anónimos (sin login)';
COMMENT ON COLUMN public.product_views.anon_id    IS 'UUID generado en el cliente y guardado en localStorage — identifica al visitante anónimo';
COMMENT ON COLUMN public.product_views.product_id IS 'Producto que fue visto';
COMMENT ON COLUMN public.product_views.category   IS 'Categoría del producto (desnormalizada para agrupar eficientemente)';
COMMENT ON COLUMN public.product_views.viewed_at  IS 'Timestamp de la visita';

-- ====================================================================================================
-- 2. ÍNDICES
-- ====================================================================================================

-- Consultas de historial por usuario
CREATE INDEX IF NOT EXISTS idx_product_views_anon_id
  ON public.product_views(anon_id);

-- Consultas de popularidad por categoría
CREATE INDEX IF NOT EXISTS idx_product_views_category
  ON public.product_views(category);

-- Índice compuesto para la query de categoría favorita
CREATE INDEX IF NOT EXISTS idx_product_views_anon_category
  ON public.product_views(anon_id, category);

-- Para ON DELETE CASCADE eficiente
CREATE INDEX IF NOT EXISTS idx_product_views_product_id
  ON public.product_views(product_id);

-- ====================================================================================================
-- 3. ROW LEVEL SECURITY
-- ====================================================================================================

ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante (incluso sin login) puede registrar una vista
CREATE POLICY "Anyone can insert product views"
  ON public.product_views
  FOR INSERT
  WITH CHECK (true);

-- Nota: No se expone SELECT directamente al cliente para proteger el historial.
-- Las lecturas del historial se realizan a través de la función SECURITY DEFINER (get_favorite_category).

-- ====================================================================================================
-- 4. FUNCIÓN: get_favorite_category
-- ====================================================================================================
-- Devuelve la categoría más vista por un usuario anónimo.
-- Usa SECURITY DEFINER para leer product_views sin exponer la tabla completa al rol anon.
-- ====================================================================================================

CREATE OR REPLACE FUNCTION public.get_favorite_category(p_anon_id text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT category
    FROM public.product_views
   WHERE anon_id = p_anon_id
   GROUP BY category
   ORDER BY COUNT(*) DESC
   LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_favorite_category(text) IS
  'Devuelve la categoría más vista por un usuario anónimo identificado por su anon_id. Usa SECURITY DEFINER para no exponer la tabla product_views al rol público.';

-- Permitir que el rol anon ejecute la función
GRANT EXECUTE ON FUNCTION public.get_favorite_category(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_favorite_category(text) TO authenticated;

-- ====================================================================================================
-- 5. LIMPIEZA PERIÓDICA (opcional — ejecutar manualmente o como cron)
-- ====================================================================================================
-- Para evitar crecimiento indefinido de la tabla, se puede programar esta limpieza:
--
-- DELETE FROM public.product_views
--   WHERE viewed_at < now() - INTERVAL '90 days';
--
-- O con pg_cron (si está habilitado en Supabase):
-- SELECT cron.schedule('clean-old-views', '0 3 * * 0',
--   $$DELETE FROM public.product_views WHERE viewed_at < now() - INTERVAL '90 days'$$);

-- ====================================================================================================
-- 6. VERIFICACIÓN
-- ====================================================================================================

SELECT
  'Migración V5 completada' AS status,
  (SELECT COUNT(*) FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'product_views') AS tabla_creada,
  (SELECT COUNT(*) FROM information_schema.routines
     WHERE routine_schema = 'public' AND routine_name = 'get_favorite_category') AS funcion_creada;
