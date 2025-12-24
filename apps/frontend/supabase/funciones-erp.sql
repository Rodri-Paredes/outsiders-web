-- ====================================================================================================
-- FUNCIONES ADICIONALES PARA EL ERP
-- ====================================================================================================
-- Este script crea las funciones SQL necesarias para el dashboard y reportes del ERP
-- Ejecuta esto DESPUÉS del schema principal
-- ====================================================================================================

-- ====================================================================================================
-- 1. FUNCIÓN: get_sales_stats - Estadísticas de ventas
-- ====================================================================================================

CREATE OR REPLACE FUNCTION get_sales_stats(
  p_branch_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  total_sales numeric,
  total_transactions bigint,
  average_ticket numeric,
  total_products_sold bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.total), 0)::numeric as total_sales,
    COUNT(s.id)::bigint as total_transactions,
    CASE 
      WHEN COUNT(s.id) > 0 THEN (COALESCE(SUM(s.total), 0) / COUNT(s.id))::numeric
      ELSE 0::numeric
    END as average_ticket,
    COALESCE(SUM(si.quantity), 0)::bigint as total_products_sold
  FROM sales s
  LEFT JOIN sale_items si ON s.id = si.sale_id
  WHERE s.branch_id = p_branch_id
    AND s.sale_date::date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_sales_stats IS 'Obtiene estadísticas de ventas para el dashboard';

-- ====================================================================================================
-- 2. FUNCIÓN: get_top_products - Productos más vendidos
-- ====================================================================================================

DROP FUNCTION IF EXISTS get_top_products(uuid,date,date,integer);

CREATE OR REPLACE FUNCTION get_top_products(
  p_branch_id uuid,
  p_start_date date,
  p_end_date date,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  product_id uuid,
  product_name varchar(255),
  quantity_sold bigint,
  total_revenue numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    SUM(si.quantity)::bigint as quantity_sold,
    SUM(si.subtotal)::numeric as total_revenue
  FROM sale_items si
  JOIN product_variants pv ON si.variant_id = pv.id
  JOIN products p ON pv.product_id = p.id
  JOIN sales s ON si.sale_id = s.id
  WHERE s.branch_id = p_branch_id
    AND s.sale_date::date BETWEEN p_start_date AND p_end_date
  GROUP BY p.id, p.name
  ORDER BY quantity_sold DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_top_products IS 'Obtiene los productos más vendidos en un período';

-- ====================================================================================================
-- 3. FUNCIÓN: update_stock - Actualizar stock después de venta
-- ====================================================================================================

CREATE OR REPLACE FUNCTION update_stock(
  p_branch_id uuid,
  p_variant_id uuid,
  p_quantity integer,
  p_movement_type movement_type,
  p_reason text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_current_stock integer;
  v_new_stock integer;
  v_stock_id uuid;
BEGIN
  -- Obtener stock actual
  SELECT id, quantity INTO v_stock_id, v_current_stock
  FROM stock
  WHERE branch_id = p_branch_id AND variant_id = p_variant_id;
  
  -- Si no existe registro de stock, crearlo
  IF v_stock_id IS NULL THEN
    v_current_stock := 0;
    INSERT INTO stock (branch_id, variant_id, quantity)
    VALUES (p_branch_id, p_variant_id, 0)
    RETURNING id INTO v_stock_id;
  END IF;
  
  -- Calcular nuevo stock según tipo de movimiento
  CASE p_movement_type
    WHEN 'ENTRADA' THEN
      v_new_stock := v_current_stock + p_quantity;
    WHEN 'SALIDA' THEN
      v_new_stock := v_current_stock - p_quantity;
      IF v_new_stock < 0 THEN
        RAISE EXCEPTION 'Stock insuficiente. Stock actual: %, intentando retirar: %', v_current_stock, p_quantity;
      END IF;
    WHEN 'AJUSTE' THEN
      v_new_stock := p_quantity;
    ELSE
      RAISE EXCEPTION 'Tipo de movimiento no válido: %', p_movement_type;
  END CASE;
  
  -- Actualizar stock
  UPDATE stock
  SET quantity = v_new_stock, updated_at = NOW()
  WHERE id = v_stock_id;
  
  -- Registrar movimiento
  INSERT INTO stock_movements (
    branch_id, variant_id, movement_type, quantity,
    previous_quantity, new_quantity, reason, user_id
  ) VALUES (
    p_branch_id, p_variant_id, p_movement_type, p_quantity,
    v_current_stock, v_new_stock, p_reason, p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_stock IS 'Actualiza el stock de un producto y registra el movimiento';

-- ====================================================================================================
-- 4. FUNCIÓN: register_sale_movement - Registrar movimientos de caja por venta
-- ====================================================================================================

CREATE OR REPLACE FUNCTION register_sale_movement(
  p_sale_id uuid
)
RETURNS void AS $$
DECLARE
  v_sale RECORD;
  v_cash_register_id uuid;
BEGIN
  -- Obtener datos de la venta
  SELECT * INTO v_sale FROM sales WHERE id = p_sale_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venta no encontrada: %', p_sale_id;
  END IF;
  
  -- Buscar caja abierta en la sucursal
  SELECT id INTO v_cash_register_id 
  FROM cash_registers 
  WHERE branch_id = v_sale.branch_id 
    AND status = 'ABIERTA' 
  ORDER BY opening_date DESC 
  LIMIT 1;
  
  -- Si no hay caja abierta, solo registrar aviso (no bloquear la venta)
  IF v_cash_register_id IS NULL THEN
    RAISE NOTICE 'No hay caja abierta en la sucursal. Venta registrada sin movimiento de caja.';
    RETURN;
  END IF;
  
  -- Registrar movimientos según tipo de pago
  IF v_sale.payment_type = 'MIXTO' AND v_sale.payment_details IS NOT NULL THEN
    -- Pago mixto: registrar cada componente
    IF (v_sale.payment_details->>'efectivo')::decimal > 0 THEN
      INSERT INTO cash_movements (
        cash_register_id, movement_type, payment_type, amount, 
        description, sale_id, user_id
      ) VALUES (
        v_cash_register_id, 'ENTRADA', 'EFECTIVO', 
        (v_sale.payment_details->>'efectivo')::decimal,
        'Venta - Pago en efectivo', p_sale_id, v_sale.user_id
      );
    END IF;
    
    IF (v_sale.payment_details->>'qr')::decimal > 0 THEN
      INSERT INTO cash_movements (
        cash_register_id, movement_type, payment_type, amount, 
        description, sale_id, user_id
      ) VALUES (
        v_cash_register_id, 'ENTRADA', 'QR', 
        (v_sale.payment_details->>'qr')::decimal,
        'Venta - Pago con QR', p_sale_id, v_sale.user_id
      );
    END IF;
    
    IF (v_sale.payment_details->>'tarjeta')::decimal > 0 THEN
      INSERT INTO cash_movements (
        cash_register_id, movement_type, payment_type, amount, 
        description, sale_id, user_id
      ) VALUES (
        v_cash_register_id, 'ENTRADA', 'TARJETA', 
        (v_sale.payment_details->>'tarjeta')::decimal,
        'Venta - Pago con tarjeta', p_sale_id, v_sale.user_id
      );
    END IF;
  ELSE
    -- Pago simple: registrar movimiento único
    INSERT INTO cash_movements (
      cash_register_id, movement_type, payment_type, amount, 
      description, sale_id, user_id
    ) VALUES (
      v_cash_register_id, 'ENTRADA', v_sale.payment_type, v_sale.total,
      'Venta - Pago con ' || v_sale.payment_type, p_sale_id, v_sale.user_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION register_sale_movement IS 'Registra movimientos de caja cuando se realiza una venta';

-- ====================================================================================================
-- 5. FUNCIÓN: transfer_stock - Transferir stock entre sucursales
-- ====================================================================================================

CREATE OR REPLACE FUNCTION transfer_stock(
  p_from_branch_id uuid,
  p_to_branch_id uuid,
  p_variant_id uuid,
  p_quantity integer,
  p_reason text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Validar que la cantidad sea positiva
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad debe ser mayor a 0';
  END IF;
  
  -- Validar que las sucursales sean diferentes
  IF p_from_branch_id = p_to_branch_id THEN
    RAISE EXCEPTION 'Las sucursales de origen y destino deben ser diferentes';
  END IF;
  
  -- Retirar del origen
  PERFORM update_stock(
    p_from_branch_id, p_variant_id, p_quantity, 
    'SALIDA', 'Transferencia a otra sucursal - ' || COALESCE(p_reason, ''), p_user_id
  );
  
  -- Agregar al destino
  PERFORM update_stock(
    p_to_branch_id, p_variant_id, p_quantity,
    'ENTRADA', 'Transferencia desde otra sucursal - ' || COALESCE(p_reason, ''), p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION transfer_stock IS 'Transfiere stock de un producto entre dos sucursales';

-- ====================================================================================================
-- VERIFICACIÓN FINAL
-- ====================================================================================================

-- Verificar que todas las funciones se crearon correctamente
SELECT 
  routine_name as function_name,
  routine_type as type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_sales_stats',
    'get_top_products', 
    'update_stock',
    'register_sale_movement',
    'transfer_stock'
  )
ORDER BY routine_name;

-- ====================================================================================================
-- ¡Listo! Ahora el ERP debería funcionar sin errores 404 en las funciones
-- ====================================================================================================
