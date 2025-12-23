-- ====================================================================================================
-- CORRECCIÓN: Función update_stock para manejar transferencias correctamente
-- ====================================================================================================
-- Fecha: 2025-12-21
-- Problema: La función intentaba insertar p_quantity directamente en INSERT,
--           causando valores null o negativos cuando no existía stock previo
-- Solución: Siempre inicializar stock en 0 y luego sumar
-- ====================================================================================================

-- Función corregida para actualizar stock
CREATE OR REPLACE FUNCTION update_stock(
  p_variant_id uuid,
  p_branch_id uuid,
  p_quantity integer
)
RETURNS void AS $$
DECLARE
  v_current_quantity integer;
  v_new_quantity integer;
BEGIN
  -- Obtener cantidad actual o 0 si no existe
  SELECT COALESCE(quantity, 0) INTO v_current_quantity
  FROM stock
  WHERE variant_id = p_variant_id AND branch_id = p_branch_id;
  
  -- Calcular nueva cantidad
  v_new_quantity := COALESCE(v_current_quantity, 0) + p_quantity;
  
  -- Validar que no sea negativo
  IF v_new_quantity < 0 THEN
    RAISE EXCEPTION 'Stock insuficiente. Stock actual: %, Intentando descontar: %', 
      COALESCE(v_current_quantity, 0), ABS(p_quantity);
  END IF;
  
  -- Insertar o actualizar
  INSERT INTO stock (variant_id, branch_id, quantity)
  VALUES (p_variant_id, p_branch_id, v_new_quantity)
  ON CONFLICT (variant_id, branch_id) 
  DO UPDATE SET 
    quantity = v_new_quantity,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_stock IS 'Actualiza stock validando que no quede negativo. Inicializa en 0 si no existe.';

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Función update_stock corregida exitosamente';
END $$;
