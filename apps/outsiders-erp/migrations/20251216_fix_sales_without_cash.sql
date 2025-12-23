-- ====================================================================================================
-- FIX: Permitir ventas sin caja abierta (registra movimiento solo si hay caja)
-- ====================================================================================================

CREATE OR REPLACE FUNCTION register_sale_movement(
  p_sale_id uuid
)
RETURNS void AS $$
DECLARE
  v_sale RECORD;
  v_cash_register_id uuid;
BEGIN
  SELECT * INTO v_sale FROM sales WHERE id = p_sale_id;
  
  -- Buscar caja abierta
  SELECT id INTO v_cash_register_id 
  FROM cash_registers 
  WHERE branch_id = v_sale.branch_id 
    AND status = 'ABIERTA' 
  ORDER BY opening_date DESC 
  LIMIT 1;
  
  -- Si no hay caja abierta, simplemente retornar sin error
  IF v_cash_register_id IS NULL THEN
    RAISE NOTICE 'No hay caja abierta. Venta registrada sin movimiento de caja.';
    RETURN;
  END IF;
  
  -- Si hay caja abierta, registrar movimientos según tipo de pago
  IF v_sale.payment_type = 'MIXTO' THEN
    IF (v_sale.payment_details->>'efectivo')::decimal > 0 THEN
      INSERT INTO cash_movements (
        cash_register_id, movement_type, payment_type, amount, 
        description, reference_id, reference_type, user_id
      ) VALUES (
        v_cash_register_id, 'INGRESO', 'EFECTIVO', 
        (v_sale.payment_details->>'efectivo')::decimal,
        'Venta - Pago en efectivo', p_sale_id, 'SALE', v_sale.user_id
      );
    END IF;
    
    IF (v_sale.payment_details->>'qr')::decimal > 0 THEN
      INSERT INTO cash_movements (
        cash_register_id, movement_type, payment_type, amount, 
        description, reference_id, reference_type, user_id
      ) VALUES (
        v_cash_register_id, 'INGRESO', 'QR', 
        (v_sale.payment_details->>'qr')::decimal,
        'Venta - Pago con QR', p_sale_id, 'SALE', v_sale.user_id
      );
    END IF;
    
    IF (v_sale.payment_details->>'tarjeta')::decimal > 0 THEN
      INSERT INTO cash_movements (
        cash_register_id, movement_type, payment_type, amount, 
        description, reference_id, reference_type, user_id
      ) VALUES (
        v_cash_register_id, 'INGRESO', 'TARJETA', 
        (v_sale.payment_details->>'tarjeta')::decimal,
        'Venta - Pago con tarjeta', p_sale_id, 'SALE', v_sale.user_id
      );
    END IF;
  ELSE
    -- Pago simple (EFECTIVO, QR, TARJETA)
    INSERT INTO cash_movements (
      cash_register_id, movement_type, payment_type, amount, 
      description, reference_id, reference_type, user_id
    ) VALUES (
      v_cash_register_id, 'INGRESO', v_sale.payment_type::text, 
      v_sale.total,
      'Venta - Pago con ' || v_sale.payment_type, p_sale_id, 'SALE', v_sale.user_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION register_sale_movement(uuid) IS 
'Registra los movimientos de caja para una venta. 
Si no hay caja abierta, la venta se registra sin movimiento de caja (no bloquea la operación).';
