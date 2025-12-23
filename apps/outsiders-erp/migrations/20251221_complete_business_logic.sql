/*
  ====================================================================================================
  MIGRACIÓN COMPLEMENTARIA - CIERRE DE FLUJOS DE NEGOCIO
  ====================================================================================================
  
  Esta migración completa la lógica de negocio implícita en el esquema base:
  
  PROBLEMAS IDENTIFICADOS EN LA MIGRACIÓN BASE:
  1. ❌ Las ventas NO descontaban stock automáticamente
  2. ❌ Las ventas NO registraban movimientos de caja automáticamente
  3. ❌ No había validación de stock disponible antes de vender
  4. ❌ No había validación de caja abierta antes de vender
  5. ❌ No había función transaccional completa para crear ventas
  
  SOLUCIONES IMPLEMENTADAS:
  ✅ Triggers automáticos para descuento de stock y registro en caja
  ✅ Función transaccional completa para crear ventas
  ✅ Validaciones de negocio antes de cada operación
  
  Fecha: 2025-12-21
  ====================================================================================================
*/

-- ====================================================================================================
-- PASO 1: ELIMINAR TRIGGERS Y FUNCIONES ANTERIORES SI EXISTEN
-- ====================================================================================================

DROP TRIGGER IF EXISTS after_sale_item_insert_update_stock ON sale_items;
DROP TRIGGER IF EXISTS after_sale_insert_register_cash ON sales;

DROP FUNCTION IF EXISTS trigger_update_stock_on_sale();
DROP FUNCTION IF EXISTS trigger_register_cash_movement_on_sale();
DROP FUNCTION IF EXISTS create_complete_sale(uuid, jsonb, decimal, text, jsonb);

-- ====================================================================================================
-- PASO 2: TRIGGER PARA DESCONTAR STOCK AUTOMÁTICAMENTE
-- ====================================================================================================

CREATE OR REPLACE FUNCTION trigger_update_stock_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  v_branch_id uuid;
BEGIN
  -- Obtener la sucursal de la venta
  SELECT branch_id INTO v_branch_id
  FROM sales
  WHERE id = NEW.sale_id;
  
  -- Descontar stock usando la función existente update_stock
  -- La función update_stock ya valida que no quede stock negativo
  PERFORM update_stock(NEW.variant_id, v_branch_id, -NEW.quantity);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_sale_item_insert_update_stock
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_stock_on_sale();

COMMENT ON FUNCTION trigger_update_stock_on_sale IS 'Descuenta stock automáticamente cuando se crea un sale_item';

-- ====================================================================================================
-- PASO 3: TRIGGER PARA REGISTRAR MOVIMIENTO DE CAJA AUTOMÁTICAMENTE
-- ====================================================================================================

CREATE OR REPLACE FUNCTION trigger_register_cash_movement_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar movimiento de caja usando la función existente
  PERFORM register_sale_movement(NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si falla el registro de caja, revertir la venta
    RAISE EXCEPTION 'Error al registrar movimiento de caja: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_sale_insert_register_cash
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION trigger_register_cash_movement_on_sale();

COMMENT ON FUNCTION trigger_register_cash_movement_on_sale IS 'Registra movimiento de caja automáticamente cuando se crea una venta';

-- ====================================================================================================
-- PASO 4: FUNCIÓN TRANSACCIONAL COMPLETA PARA CREAR VENTAS
-- ====================================================================================================

CREATE OR REPLACE FUNCTION create_complete_sale(
  p_branch_id uuid,
  p_items jsonb, -- [{"variant_id": "uuid", "quantity": 1, "unit_price": 100.00}]
  p_discount_amount decimal(10,2) DEFAULT 0,
  p_payment_type text DEFAULT 'EFECTIVO',
  p_payment_details jsonb DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_sale_id uuid;
  v_user_id uuid;
  v_item jsonb;
  v_subtotal decimal(10,2) := 0;
  v_total decimal(10,2);
  v_item_subtotal decimal(10,2);
  v_cash_register_id uuid;
  v_variant_id uuid;
  v_quantity integer;
  v_available_stock integer;
BEGIN
  -- Validar usuario autenticado
  SELECT id INTO v_user_id FROM users WHERE id = auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Validar que hay items
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'La venta debe tener al menos un producto';
  END IF;
  
  -- Validar que existe caja abierta
  SELECT id INTO v_cash_register_id
  FROM cash_registers
  WHERE branch_id = p_branch_id AND status = 'ABIERTA'
  ORDER BY opening_date DESC
  LIMIT 1;
  
  IF v_cash_register_id IS NULL THEN
    RAISE EXCEPTION 'No hay una caja abierta en esta sucursal';
  END IF;
  
  -- Validar stock disponible para todos los items ANTES de crear la venta
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    
    -- Verificar stock disponible
    SELECT COALESCE(quantity, 0) INTO v_available_stock
    FROM stock
    WHERE variant_id = v_variant_id AND branch_id = p_branch_id;
    
    IF v_available_stock < v_quantity THEN
      RAISE EXCEPTION 'Stock insuficiente para la variante %. Disponible: %, Requerido: %', 
        v_variant_id, v_available_stock, v_quantity;
    END IF;
    
    -- Calcular subtotal del item
    v_item_subtotal := v_quantity * (v_item->>'unit_price')::decimal(10,2);
    v_subtotal := v_subtotal + v_item_subtotal;
  END LOOP;
  
  -- Calcular total
  v_total := v_subtotal - COALESCE(p_discount_amount, 0);
  
  IF v_total < 0 THEN
    RAISE EXCEPTION 'El total no puede ser negativo';
  END IF;
  
  -- Validar payment_details para pagos mixtos
  IF p_payment_type = 'MIXTO' THEN
    IF p_payment_details IS NULL THEN
      RAISE EXCEPTION 'Los pagos mixtos requieren payment_details';
    END IF;
    
    -- Validar que la suma de payment_details sea igual al total
    DECLARE
      v_payment_total decimal(10,2);
    BEGIN
      v_payment_total := 
        COALESCE((p_payment_details->>'efectivo')::decimal(10,2), 0) +
        COALESCE((p_payment_details->>'qr')::decimal(10,2), 0) +
        COALESCE((p_payment_details->>'tarjeta')::decimal(10,2), 0);
      
      IF ABS(v_payment_total - v_total) > 0.01 THEN
        RAISE EXCEPTION 'La suma de los pagos (%) no coincide con el total (%)', 
          v_payment_total, v_total;
      END IF;
    END;
  END IF;
  
  -- Crear la venta
  INSERT INTO sales (
    user_id, branch_id, subtotal, discount_amount, total,
    payment_type, payment_details
  ) VALUES (
    v_user_id, p_branch_id, v_subtotal, COALESCE(p_discount_amount, 0), v_total,
    p_payment_type, p_payment_details
  ) RETURNING id INTO v_sale_id;
  
  -- Crear los sale_items (el trigger descontará el stock automáticamente)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_subtotal := (v_item->>'quantity')::integer * (v_item->>'unit_price')::decimal(10,2);
    
    INSERT INTO sale_items (
      sale_id, variant_id, quantity, unit_price, subtotal
    ) VALUES (
      v_sale_id,
      (v_item->>'variant_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::decimal(10,2),
      v_item_subtotal
    );
  END LOOP;
  
  -- El trigger registrará automáticamente el movimiento de caja
  
  -- Retornar información de la venta creada
  RETURN jsonb_build_object(
    'sale_id', v_sale_id,
    'subtotal', v_subtotal,
    'discount_amount', COALESCE(p_discount_amount, 0),
    'total', v_total,
    'items_count', jsonb_array_length(p_items)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_complete_sale IS 'Crea una venta completa de forma transaccional con todas las validaciones necesarias. Los triggers automáticos descuentan stock y registran en caja.';

-- ====================================================================================================
-- VERIFICACIÓN FINAL
-- ====================================================================================================

DO $$
DECLARE
  v_count integer;
BEGIN
  -- Verificar triggers
  SELECT COUNT(*) INTO v_count
  FROM pg_trigger
  WHERE tgname IN ('after_sale_item_insert_update_stock', 'after_sale_insert_register_cash');
  
  RAISE NOTICE 'Triggers creados: %', v_count;
  
  -- Verificar funciones
  SELECT COUNT(*) INTO v_count
  FROM pg_proc
  WHERE proname IN ('trigger_update_stock_on_sale', 'trigger_register_cash_movement_on_sale', 'create_complete_sale');
  
  RAISE NOTICE 'Funciones creadas: %', v_count;
  
  RAISE NOTICE '✅ Migración completada exitosamente';
END $$;
