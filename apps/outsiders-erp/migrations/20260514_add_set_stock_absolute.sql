-- ====================================================================================================
-- CORRECCIÓN: Función atómica para establecer stock absoluto
-- ====================================================================================================
-- Fecha: 2026-05-14
-- Problema: stockService.setStock() hacía READ → compute diff → WRITE (no atómico).
--           Entre la lectura y la escritura podía ocurrir una venta y dejar stock incorrecto.
-- Solución:  Función SQL atómica con UPSERT que establece la cantidad directamente.
-- ====================================================================================================

CREATE OR REPLACE FUNCTION set_stock_absolute(
  p_variant_id uuid,
  p_branch_id  uuid,
  p_quantity   integer
)
RETURNS void AS $$
BEGIN
  IF p_quantity < 0 THEN
    RAISE EXCEPTION 'La cantidad no puede ser negativa';
  END IF;

  INSERT INTO stock (variant_id, branch_id, quantity)
  VALUES (p_variant_id, p_branch_id, p_quantity)
  ON CONFLICT (variant_id, branch_id)
  DO UPDATE SET
    quantity   = p_quantity,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION set_stock_absolute IS
'Establece el stock de una variante en una sucursal de forma atómica (UPSERT).
Reemplaza la operación READ-COMPUTE-WRITE que existía en stockService.setStock(),
eliminando el race condition entre lectura y escritura del stock.';

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Función set_stock_absolute creada / actualizada exitosamente';
END $$;
