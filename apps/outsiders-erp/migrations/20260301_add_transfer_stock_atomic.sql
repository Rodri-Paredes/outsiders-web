-- ====================================================================================================
-- CORRECCIÓN CRÍTICA: Función Transaccional para Transferencias de Stock
-- ====================================================================================================
-- Fecha: 2026-03-01
-- Problema: Las transferencias se hacían con 2 llamadas HTTP separadas, NO transaccionales
--           Si la segunda llamada fallaba, el stock desaparecía del sistema
-- Solución: Función atómica que hace origen y destino en una sola transacción
-- ====================================================================================================

-- Eliminar función anterior si existe
DROP FUNCTION IF EXISTS transfer_stock_atomic(uuid, uuid, uuid, integer, text);

-- Crear función transaccional para transferencias
CREATE OR REPLACE FUNCTION transfer_stock_atomic(
  p_variant_id uuid,
  p_from_branch_id uuid,
  p_to_branch_id uuid,
  p_quantity integer,
  p_notes text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_from_stock integer;
  v_to_stock integer;
  v_user_id uuid;
  v_product_name text;
  v_variant_size text;
  v_from_branch_name text;
  v_to_branch_name text;
BEGIN
  -- Validar usuario autenticado
  SELECT id INTO v_user_id FROM users WHERE id = auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Validar que las sucursales sean diferentes
  IF p_from_branch_id = p_to_branch_id THEN
    RAISE EXCEPTION 'No se puede transferir a la misma sucursal';
  END IF;
  
  -- Validar cantidad positiva
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad debe ser mayor a 0';
  END IF;
  
  -- Obtener información del producto y variante para logging
  SELECT p.name, pv.size 
  INTO v_product_name, v_variant_size
  FROM product_variants pv
  JOIN products p ON pv.product_id = p.id
  WHERE pv.id = p_variant_id;
  
  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Variante de producto no encontrada';
  END IF;
  
  -- Obtener nombres de sucursales
  SELECT name INTO v_from_branch_name FROM branches WHERE id = p_from_branch_id;
  SELECT name INTO v_to_branch_name FROM branches WHERE id = p_to_branch_id;
  
  IF v_from_branch_name IS NULL OR v_to_branch_name IS NULL THEN
    RAISE EXCEPTION 'Sucursal no encontrada';
  END IF;
  
  -- Obtener stock origen (con FOR UPDATE para bloquear la fila y evitar race conditions)
  SELECT quantity INTO v_from_stock
  FROM stock
  WHERE variant_id = p_variant_id AND branch_id = p_from_branch_id
  FOR UPDATE;
  
  -- Validar stock disponible en origen
  IF v_from_stock IS NULL OR v_from_stock < p_quantity THEN
    RAISE EXCEPTION 'Stock insuficiente en sucursal "%". Disponible: %, Requerido: %', 
      v_from_branch_name, COALESCE(v_from_stock, 0), p_quantity;
  END IF;
  
  -- Obtener stock destino actual (para logging)
  SELECT COALESCE(quantity, 0) INTO v_to_stock
  FROM stock
  WHERE variant_id = p_variant_id AND branch_id = p_to_branch_id;
  
  -- OPERACIÓN ATÓMICA: Ambas operaciones en la misma transacción
  -- Si cualquiera falla, ambas revierten automáticamente
  
  -- 1. Restar del origen
  PERFORM update_stock(p_variant_id, p_from_branch_id, -p_quantity);
  
  -- 2. Sumar al destino
  PERFORM update_stock(p_variant_id, p_to_branch_id, p_quantity);
  
  -- Log de éxito
  RAISE NOTICE 'Transferencia exitosa: % x% (Talla %) de % a %', 
    p_quantity, v_product_name, v_variant_size, v_from_branch_name, v_to_branch_name;
  
  -- Retornar información de la transferencia
  RETURN jsonb_build_object(
    'success', true,
    'variant_id', p_variant_id,
    'product_name', v_product_name,
    'variant_size', v_variant_size,
    'from_branch_id', p_from_branch_id,
    'from_branch_name', v_from_branch_name,
    'to_branch_id', p_to_branch_id,
    'to_branch_name', v_to_branch_name,
    'quantity', p_quantity,
    'from_stock_before', v_from_stock,
    'from_stock_after', v_from_stock - p_quantity,
    'to_stock_before', v_to_stock,
    'to_stock_after', v_to_stock + p_quantity,
    'notes', p_notes,
    'user_id', v_user_id,
    'timestamp', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION transfer_stock_atomic IS 
'Transfiere stock entre sucursales de forma ATÓMICA y TRANSACCIONAL.
Si cualquier operación falla (origen o destino), toda la transacción revierte.
Incluye validaciones completas y bloqueo de filas para evitar race conditions.';

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Función transfer_stock_atomic creada exitosamente';
  RAISE NOTICE 'ℹ️  Actualizar stockService.ts para usar esta función';
END $$;
