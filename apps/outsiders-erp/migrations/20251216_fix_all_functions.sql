-- ====================================================================================================
-- CONSOLIDADO: Todas las funciones necesarias para el ERP
-- ====================================================================================================
-- Ejecuta este script para asegurarte de que todas las funciones estén creadas
-- ====================================================================================================

-- 1. Función para actualizar stock (con validación mejorada)
DROP FUNCTION IF EXISTS update_stock(uuid, uuid, integer);

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

-- 2. Función para obtener estadísticas de ventas
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
$$ LANGUAGE plpgsql;

-- 3. Función para obtener top productos
CREATE OR REPLACE FUNCTION get_top_products(
  p_branch_id uuid,
  p_start_date date,
  p_end_date date,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  product_id uuid,
  product_name text,
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
$$ LANGUAGE plpgsql;

-- 4. Función para registrar movimiento de venta (sin bloquear si no hay caja)
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

-- 5. Verificar que exista get_cash_register_summary
-- Si no existe, crearla desde el schema original
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_cash_register_summary'
  ) THEN
    CREATE OR REPLACE FUNCTION get_cash_register_summary(p_cash_register_id uuid)
    RETURNS TABLE (
      total_cash decimal(10,2),
      total_qr decimal(10,2),
      total_card decimal(10,2),
      total_general decimal(10,2),
      sales_count integer,
      opening_amount decimal(10,2)
    ) AS $func$
    BEGIN
      RETURN QUERY
      SELECT 
        COALESCE(SUM(CASE WHEN cm.payment_type = 'EFECTIVO' THEN cm.amount ELSE 0 END), 0) as total_cash,
        COALESCE(SUM(CASE WHEN cm.payment_type = 'QR' THEN cm.amount ELSE 0 END), 0) as total_qr,
        COALESCE(SUM(CASE WHEN cm.payment_type = 'TARJETA' THEN cm.amount ELSE 0 END), 0) as total_card,
        COALESCE(SUM(cm.amount), 0) as total_general,
        COUNT(DISTINCT CASE WHEN cm.reference_type = 'SALE' THEN cm.reference_id END)::integer as sales_count,
        cr.opening_amount
      FROM cash_registers cr
      LEFT JOIN cash_movements cm ON cm.cash_register_id = cr.id AND cm.movement_type = 'INGRESO'
      WHERE cr.id = p_cash_register_id
      GROUP BY cr.opening_amount;
    END;
    $func$ LANGUAGE plpgsql;
    
    RAISE NOTICE '✓ Función get_cash_register_summary creada';
  ELSE
    RAISE NOTICE '✓ Función get_cash_register_summary ya existe';
  END IF;
END $$;

-- 6. Verificar que exista get_open_cash_register
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_open_cash_register'
  ) THEN
    CREATE OR REPLACE FUNCTION get_open_cash_register(p_branch_id uuid)
    RETURNS TABLE (
      id uuid,
      branch_id uuid,
      user_id uuid,
      status text,
      opening_date timestamptz,
      opening_amount decimal(10,2),
      opening_user_id uuid,
      opening_notes text
    ) AS $func$
    BEGIN
      RETURN QUERY
      SELECT 
        cr.id, cr.branch_id, cr.user_id, cr.status,
        cr.opening_date, cr.opening_amount, cr.opening_user_id, cr.opening_notes
      FROM cash_registers cr
      WHERE cr.branch_id = p_branch_id AND cr.status = 'ABIERTA'
      ORDER BY cr.opening_date DESC
      LIMIT 1;
    END;
    $func$ LANGUAGE plpgsql;
    
    RAISE NOTICE '✓ Función get_open_cash_register creada';
  ELSE
    RAISE NOTICE '✓ Función get_open_cash_register ya existe';
  END IF;
END $$;

-- 7. Verificar que exista open_cash_register
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'open_cash_register'
  ) THEN
    CREATE OR REPLACE FUNCTION open_cash_register(
      p_branch_id uuid,
      p_user_id uuid,
      p_opening_amount decimal(10,2),
      p_notes text DEFAULT NULL
    )
    RETURNS uuid AS $func$
    DECLARE
      v_cash_register_id uuid;
    BEGIN
      IF EXISTS (
        SELECT 1 FROM cash_registers 
        WHERE branch_id = p_branch_id AND status = 'ABIERTA'
      ) THEN
        RAISE EXCEPTION 'Ya existe una caja abierta en esta sucursal';
      END IF;
      
      INSERT INTO cash_registers (
        branch_id, user_id, opening_amount, opening_user_id, opening_notes
      ) VALUES (
        p_branch_id, p_user_id, p_opening_amount, p_user_id, p_notes
      ) RETURNING id INTO v_cash_register_id;
      
      INSERT INTO cash_movements (
        cash_register_id, movement_type, payment_type, amount, description, user_id
      ) VALUES (
        v_cash_register_id, 'INGRESO', 'EFECTIVO', p_opening_amount, 
        'Apertura de caja - Fondo inicial', p_user_id
      );
      
      RETURN v_cash_register_id;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;
    
    RAISE NOTICE '✓ Función open_cash_register creada';
  ELSE
    RAISE NOTICE '✓ Función open_cash_register ya existe';
  END IF;
END $$;

-- 8. Verificar que exista close_cash_register
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'close_cash_register'
  ) THEN
    CREATE OR REPLACE FUNCTION close_cash_register(
      p_cash_register_id uuid,
      p_user_id uuid,
      p_closing_amount decimal(10,2),
      p_notes text DEFAULT NULL
    )
    RETURNS void AS $func$
    DECLARE
      v_expected_cash decimal(10,2);
      v_expected_qr decimal(10,2);
      v_expected_card decimal(10,2);
      v_expected_total decimal(10,2);
      v_cash_difference decimal(10,2);
    BEGIN
      SELECT 
        COALESCE(SUM(CASE WHEN payment_type = 'EFECTIVO' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN payment_type = 'QR' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN payment_type = 'TARJETA' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(amount), 0)
      INTO v_expected_cash, v_expected_qr, v_expected_card, v_expected_total
      FROM cash_movements
      WHERE cash_register_id = p_cash_register_id
        AND movement_type = 'INGRESO';
      
      v_cash_difference := p_closing_amount - v_expected_cash;
      
      UPDATE cash_registers SET
        status = 'CERRADA',
        closing_date = now(),
        closing_amount = p_closing_amount,
        closing_user_id = p_user_id,
        closing_notes = p_notes,
        expected_cash = v_expected_cash,
        expected_qr = v_expected_qr,
        expected_card = v_expected_card,
        expected_total = v_expected_total,
        cash_difference = v_cash_difference
      WHERE id = p_cash_register_id;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;
    
    RAISE NOTICE '✓ Función close_cash_register creada';
  ELSE
    RAISE NOTICE '✓ Función close_cash_register ya existe';
  END IF;
END $$;

-- 9. REFRESCAR ESQUEMA DE SUPABASE (IMPORTANTE)
NOTIFY pgrst, 'reload schema';

-- 10. Verificar resumen
SELECT 
  'FUNCIONES VERIFICADAS' as info,
  COUNT(*) FILTER (WHERE proname = 'update_stock') as update_stock,
  COUNT(*) FILTER (WHERE proname = 'get_sales_stats') as get_sales_stats,
  COUNT(*) FILTER (WHERE proname = 'get_top_products') as get_top_products,
  COUNT(*) FILTER (WHERE proname = 'register_sale_movement') as register_sale_movement,
  COUNT(*) FILTER (WHERE proname = 'get_cash_register_summary') as get_cash_register_summary,
  COUNT(*) FILTER (WHERE proname = 'get_open_cash_register') as get_open_cash_register,
  COUNT(*) FILTER (WHERE proname = 'open_cash_register') as open_cash_register,
  COUNT(*) FILTER (WHERE proname = 'close_cash_register') as close_cash_register
FROM pg_proc
WHERE proname IN (
  'update_stock', 'get_sales_stats', 'get_top_products', 
  'register_sale_movement', 'get_cash_register_summary', 'get_open_cash_register',
  'open_cash_register', 'close_cash_register'
);
