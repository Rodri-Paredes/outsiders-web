-- Migration: Visibilidad web por sucursal
-- Date: 2026-09-03
--
-- Permite que la visibilidad de un producto en la tienda online se controle
-- de forma independiente para cada sucursal (ej: Santa Cruz vs Cochabamba).

CREATE TABLE IF NOT EXISTS public.product_branch_visibility (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  visible_on_web BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (product_id, branch_id)
);

COMMENT ON TABLE public.product_branch_visibility IS 'Configuración de visibilidad web por producto y sucursal';
COMMENT ON COLUMN public.product_branch_visibility.visible_on_web IS 'Si es false, el producto no se muestra en la tienda virtual de la sucursal especificada.';

-- Índice para acelerar las búsquedas por sucursal
CREATE INDEX IF NOT EXISTS idx_product_branch_visibility_branch ON public.product_branch_visibility(branch_id);

-- Habilitar RLS
ALTER TABLE public.product_branch_visibility ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "product_branch_visibility_select_public" ON public.product_branch_visibility;
CREATE POLICY "product_branch_visibility_select_public" ON public.product_branch_visibility
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "product_branch_visibility_all_staff" ON public.product_branch_visibility;
CREATE POLICY "product_branch_visibility_all_staff" ON public.product_branch_visibility
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
