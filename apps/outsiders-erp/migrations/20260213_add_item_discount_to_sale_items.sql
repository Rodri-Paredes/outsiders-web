-- ====================================================================================================
-- Migración: Agregar campo item_discount a la tabla sale_items
-- Fecha: 2026-02-13
-- Descripción: Agregar campo para almacenar el descuento individual aplicado a cada producto en una venta
-- ====================================================================================================

-- Agregar columna item_discount a la tabla sale_items
ALTER TABLE sale_items 
ADD COLUMN IF NOT EXISTS item_discount DECIMAL(10,2) DEFAULT 0 CHECK (item_discount >= 0);

COMMENT ON COLUMN sale_items.item_discount IS 'Descuento individual aplicado a este producto (en bolivianos)';

-- Actualizar registros existentes para que tengan 0 como valor por defecto
UPDATE sale_items SET item_discount = 0 WHERE item_discount IS NULL;

-- ====================================================================================================
-- Actualizar función create_complete_sale para incluir item_discount
-- ====================================================================================================

DROP FUNCTION IF EXISTS create_complete_sale(uuid, jsonb, decimal, text, jsonb, text);

CREATE OR REPLACE FUNCTION create_complete_sale(
  p_branch_id uuid,
  p_items jsonb, -- [{"variant_id": "uuid", "quantity": 1, "unit_price": 100.00, "item_discount": 5.00}]
  p_discount_amount decimal(10,2) DEFAULT 0,
  p_payment_type text DEFAULT 'EFECTIVO',
  p_payment_details jsonb DEFAULT NULL,
  p_customer_phone text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_sale_id uuid;
  v_user_id uuid;
  v_item jsonb;
  v_subtotal decimal(10,2) := 0;
  v_total decimal(10,2);
  v_item_subtotal decimal(10,2);
  v_item_discount decimal(10,2);
  v_total_item_discounts decimal(10,2) := 0;
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
    
    -- Sumar descuentos individuales
    v_item_discount := COALESCE((v_item->>'item_discount')::decimal(10,2), 0);
    v_total_item_discounts := v_total_item_discounts + v_item_discount;
  END LOOP;
  
  -- Calcular total: subtotal - descuentos individuales - descuento adicional
  v_total := v_subtotal - v_total_item_discounts - COALESCE(p_discount_amount, 0);
  
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
  
  -- Crear la venta (incluye customer_phone)
  INSERT INTO sales (
    user_id, branch_id, subtotal, discount_amount, total,
    payment_type, payment_details, customer_phone
  ) VALUES (
    v_user_id, p_branch_id, v_subtotal, COALESCE(p_discount_amount, 0), v_total,
    p_payment_type, p_payment_details, p_customer_phone
  ) RETURNING id INTO v_sale_id;
  
  -- Crear los sale_items (el trigger descontará el stock automáticamente)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_subtotal := (v_item->>'quantity')::integer * (v_item->>'unit_price')::decimal(10,2);
    v_item_discount := COALESCE((v_item->>'item_discount')::decimal(10,2), 0);
    
    INSERT INTO sale_items (
      sale_id, variant_id, quantity, unit_price, subtotal, item_discount
    ) VALUES (
      v_sale_id,
      (v_item->>'variant_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::decimal(10,2),
      v_item_subtotal,
      v_item_discount
    );
  END LOOP;
  
  -- El trigger registrará automáticamente el movimiento de caja
  
  -- Retornar información de la venta creada
  RETURN jsonb_build_object(
    'sale_id', v_sale_id,
    'subtotal', v_subtotal,
    'item_discounts', v_total_item_discounts,
    'discount_amount', COALESCE(p_discount_amount, 0),
    'total', v_total,
    'items_count', jsonb_array_length(p_items),
    'customer_phone', p_customer_phone
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_complete_sale IS 'Crea una venta completa de forma transaccional con todas las validaciones necesarias. Los triggers automáticos descuentan stock y registran en caja. Incluye descuentos individuales por producto y campo opcional de celular del cliente.';
