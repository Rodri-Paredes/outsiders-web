-- Registrar movimientos de caja para ventas existentes que no los tienen
DO $$
DECLARE
  v_sale RECORD;
  v_cash_register_id uuid;
BEGIN
  -- Obtener caja abierta
  SELECT id INTO v_cash_register_id
  FROM cash_registers
  WHERE status = 'ABIERTA'
  ORDER BY opening_date DESC
  LIMIT 1;
  
  IF v_cash_register_id IS NULL THEN
    RAISE NOTICE 'No hay caja abierta';
    RETURN;
  END IF;
  
  -- Procesar cada venta que no tiene movimiento de caja
  FOR v_sale IN 
    SELECT s.*
    FROM sales s
    WHERE NOT EXISTS (
      SELECT 1 FROM cash_movements cm 
      WHERE cm.reference_id = s.id AND cm.reference_type = 'SALE'
    )
    ORDER BY s.sale_date
  LOOP
    INSERT INTO cash_movements (
      cash_register_id, movement_type, payment_type, amount,
      description, reference_id, reference_type, user_id
    ) VALUES (
      v_cash_register_id, 
      'INGRESO', 
      v_sale.payment_type,
      v_sale.total,
      'Venta - Pago con ' || v_sale.payment_type || ' (corregido)',
      v_sale.id,
      'SALE',
      v_sale.user_id
    );
    
    RAISE NOTICE 'Movimiento creado para venta % - % Bs %', v_sale.id, v_sale.payment_type, v_sale.total;
  END LOOP;
END $$;

-- Verificar
SELECT 
  'RESUMEN DESPUÉS DE CORRECCIÓN' as info,
  COUNT(*) as total_movimientos,
  SUM(CASE WHEN payment_type = 'EFECTIVO' THEN amount ELSE 0 END) as total_efectivo,
  SUM(CASE WHEN payment_type = 'QR' THEN amount ELSE 0 END) as total_qr,
  SUM(CASE WHEN payment_type = 'TARJETA' THEN amount ELSE 0 END) as total_tarjeta
FROM cash_movements cm
JOIN cash_registers cr ON cm.cash_register_id = cr.id
WHERE cr.status = 'ABIERTA'
  AND cm.movement_type = 'INGRESO';
