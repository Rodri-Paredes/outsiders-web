-- ====================================================================================================
-- FIX: Corregir función update_stock para manejar correctamente stock insuficiente
-- ====================================================================================================

-- Eliminar la función anterior
DROP FUNCTION IF EXISTS update_stock(uuid, uuid, integer);

-- Crear función mejorada que valida stock antes de actualizar
CREATE OR REPLACE FUNCTION update_stock(
  p_variant_id uuid,
  p_branch_id uuid,
  p_quantity integer
)
RETURNS void AS $$
DECLARE
  v_current_stock integer;
  v_new_stock integer;
BEGIN
  -- Obtener stock actual (0 si no existe)
  SELECT COALESCE(quantity, 0) INTO v_current_stock
  FROM stock
  WHERE variant_id = p_variant_id AND branch_id = p_branch_id;
  
  -- Calcular nuevo stock
  v_new_stock := v_current_stock + p_quantity;
  
  -- Validar que el nuevo stock no sea negativo
  IF v_new_stock < 0 THEN
    RAISE EXCEPTION 'Stock insuficiente. Stock actual: %, cantidad solicitada: %', v_current_stock, ABS(p_quantity);
  END IF;
  
  -- Actualizar o insertar stock
  INSERT INTO stock (variant_id, branch_id, quantity)
  VALUES (p_variant_id, p_branch_id, v_new_stock)
  ON CONFLICT (variant_id, branch_id) 
  DO UPDATE SET 
    quantity = v_new_stock,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario de la función
COMMENT ON FUNCTION update_stock(uuid, uuid, integer) IS 
'Actualiza el stock de una variante en una sucursal. 
Parámetros:
- p_variant_id: ID de la variante del producto
- p_branch_id: ID de la sucursal
- p_quantity: Cantidad a agregar (positivo) o restar (negativo)
Lanza excepción si el stock resultante sería negativo.';
