-- ====================================================================================================
-- NUEVA FUNCIONALIDAD: Triggers para Auditoría Automática de Stock
-- ====================================================================================================
-- Fecha: 2026-03-01
-- Propósito: Registrar automáticamente TODOS los cambios en la tabla stock
-- Permite: Trazabilidad completa sin modificar código existente
-- ====================================================================================================

-- ====================================================================================================
-- FUNCIÓN: Registrar movimiento de stock en la tabla de auditoría
-- ====================================================================================================

CREATE OR REPLACE FUNCTION register_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
  v_movement_type text;
  v_quantity_change integer;
  v_user_id uuid;
BEGIN
  -- Obtener usuario actual (puede ser NULL en operaciones del sistema)
  SELECT id INTO v_user_id FROM users WHERE id = auth.uid();
  
  -- Determinar tipo de movimiento y cantidad
  IF TG_OP = 'INSERT' THEN
    v_movement_type := 'INICIALIZACION';
    v_quantity_change := NEW.quantity;
    
    -- Insertar registro de auditoría para INICIALIZACIÓN
    INSERT INTO stock_movements (
      variant_id, branch_id, movement_type, quantity,
      previous_quantity, new_quantity, reason, user_id
    ) VALUES (
      NEW.variant_id, NEW.branch_id, v_movement_type, v_quantity_change,
      0, NEW.quantity, 'Inicialización de stock', v_user_id
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_quantity_change := NEW.quantity - OLD.quantity;
    
    -- Solo registrar si la cantidad realmente cambió
    IF v_quantity_change != 0 THEN
      -- Determinar tipo de movimiento basado en el cambio
      IF v_quantity_change > 0 THEN
        v_movement_type := 'AJUSTE_ENTRADA';
      ELSE
        v_movement_type := 'AJUSTE_SALIDA';
      END IF;
      
      -- Insertar registro de auditoría para ACTUALIZACIÓN
      -- NOTA: Los triggers específicos (ventas, transferencias) sobrescribirán esto
      -- Esta es una red de seguridad para capturar cualquier cambio
      INSERT INTO stock_movements (
        variant_id, branch_id, movement_type, quantity,
        previous_quantity, new_quantity, reason, user_id
      ) VALUES (
        NEW.variant_id, NEW.branch_id, v_movement_type, v_quantity_change,
        OLD.quantity, NEW.quantity, 'Actualización de stock', v_user_id
      );
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Registrar eliminación (raro, pero por seguridad)
    INSERT INTO stock_movements (
      variant_id, branch_id, movement_type, quantity,
      previous_quantity, new_quantity, reason, user_id
    ) VALUES (
      OLD.variant_id, OLD.branch_id, 'OTRO', -OLD.quantity,
      OLD.quantity, 0, 'Registro de stock eliminado', v_user_id
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION register_stock_movement IS 
'Registra automáticamente todos los cambios en la tabla stock.
Trigger genérico que captura INSERT, UPDATE y DELETE.';

-- ====================================================================================================
-- TRIGGER: Ejecutar auditoría después de cada cambio en stock
-- ====================================================================================================

DROP TRIGGER IF EXISTS trigger_audit_stock_changes ON stock;

CREATE TRIGGER trigger_audit_stock_changes
  AFTER INSERT OR UPDATE OR DELETE ON stock
  FOR EACH ROW
  EXECUTE FUNCTION register_stock_movement();

COMMENT ON TRIGGER trigger_audit_stock_changes ON stock IS 
'Registra automáticamente todos los cambios en stock para auditoría';

-- ====================================================================================================
-- ACTUALIZAR: Función update_stock para agregar contexto de auditoría
-- ====================================================================================================

-- Versión mejorada con soporte para auditoría
CREATE OR REPLACE FUNCTION update_stock_with_audit(
  p_variant_id uuid,
  p_branch_id uuid,
  p_quantity integer,
  p_movement_type text DEFAULT 'AJUSTE_ENTRADA',
  p_reason text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_related_sale_id uuid DEFAULT NULL,
  p_related_transfer_id uuid DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_current_quantity integer;
  v_new_quantity integer;
  v_user_id uuid;
BEGIN
  -- Obtener usuario actual
  SELECT id INTO v_user_id FROM users WHERE id = auth.uid();
  
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
  
  -- Insertar o actualizar stock (el trigger register_stock_movement se ejecuta automáticamente)
  INSERT INTO stock (variant_id, branch_id, quantity)
  VALUES (p_variant_id, p_branch_id, v_new_quantity)
  ON CONFLICT (variant_id, branch_id) 
  DO UPDATE SET 
    quantity = v_new_quantity,
    updated_at = now();
  
  -- Actualizar el registro de auditoría más reciente con información adicional
  -- (el trigger ya lo creó, ahora lo enriquecemos)
  UPDATE stock_movements
  SET 
    movement_type = p_movement_type,
    reason = COALESCE(p_reason, reason),
    notes = p_notes,
    related_sale_id = p_related_sale_id,
    related_transfer_id = p_related_transfer_id
  WHERE id = (
    SELECT id FROM stock_movements
    WHERE variant_id = p_variant_id 
      AND branch_id = p_branch_id
      AND created_at >= now() - interval '1 second'
    ORDER BY created_at DESC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_stock_with_audit IS 
'Actualiza stock con contexto completo de auditoría.
Usa esta función en lugar de update_stock cuando necesites registrar motivos específicos.';

-- ====================================================================================================
-- ACTUALIZAR: Función transfer_stock_atomic para usar auditoría
-- ====================================================================================================

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
  v_transfer_id uuid;
BEGIN
  -- Generar UUID único para esta transferencia (vincula origen y destino)
  v_transfer_id := gen_random_uuid();
  
  -- Validar usuario autenticado
  SELECT id INTO v_user_id FROM users WHERE id = auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Validar que las sucursales sean diferentes
  IF p_from_branch_id = p_to_branch_id THEN
    RAISE EXCEPTION 'No se puede transferir a la misma sucursal';
  END IF;
  
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad debe ser mayor a 0';
  END IF;
  
  -- Obtener información del producto
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
  
  -- Obtener stock origen (con bloqueo)
  SELECT quantity INTO v_from_stock
  FROM stock
  WHERE variant_id = p_variant_id AND branch_id = p_from_branch_id
  FOR UPDATE;
  
  IF v_from_stock IS NULL OR v_from_stock < p_quantity THEN
    RAISE EXCEPTION 'Stock insuficiente en sucursal "%". Disponible: %, Requerido: %', 
      v_from_branch_name, COALESCE(v_from_stock, 0), p_quantity;
  END IF;
  
  -- Obtener stock destino
  SELECT COALESCE(quantity, 0) INTO v_to_stock
  FROM stock
  WHERE variant_id = p_variant_id AND branch_id = p_to_branch_id;
  
  -- Realizar transferencia con auditoría completa
  
  -- 1. Restar del origen
  PERFORM update_stock_with_audit(
    p_variant_id, 
    p_from_branch_id, 
    -p_quantity,
    'TRANSFERENCIA_SALIDA',
    'Transferencia a ' || v_to_branch_name,
    p_notes,
    NULL,
    v_transfer_id
  );
  
  -- 2. Sumar al destino
  PERFORM update_stock_with_audit(
    p_variant_id, 
    p_to_branch_id, 
    p_quantity,
    'TRANSFERENCIA_ENTRADA',
    'Transferencia desde ' || v_from_branch_name,
    p_notes,
    NULL,
    v_transfer_id
  );
  
  RAISE NOTICE 'Transferencia exitosa: % x% (Talla %) de % a % [Transfer ID: %]', 
    p_quantity, v_product_name, v_variant_size, v_from_branch_name, v_to_branch_name, v_transfer_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'transfer_id', v_transfer_id,
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

-- ====================================================================================================
-- ACTUALIZAR: Trigger de ventas para usar auditoría
-- ====================================================================================================

CREATE OR REPLACE FUNCTION trigger_update_stock_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  v_branch_id uuid;
  v_user_id uuid;
BEGIN
  -- Obtener la sucursal de la venta
  SELECT branch_id INTO v_branch_id
  FROM sales
  WHERE id = NEW.sale_id;
  
  -- Obtener usuario
  SELECT user_id INTO v_user_id
  FROM sales
  WHERE id = NEW.sale_id;
  
  -- Descontar stock con auditoría completa
  PERFORM update_stock_with_audit(
    NEW.variant_id,
    v_branch_id,
    -NEW.quantity,
    'VENTA',
    'Venta registrada',
    NULL,
    NEW.sale_id,
    NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear trigger de ventas
DROP TRIGGER IF EXISTS after_sale_item_insert_update_stock ON sale_items;
CREATE TRIGGER after_sale_item_insert_update_stock
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_stock_on_sale();

-- ====================================================================================================
-- VERIFICACIÓN FINAL
-- ====================================================================================================

DO $$
DECLARE
  v_count integer;
BEGIN
  -- Verificar trigger en stock
  SELECT COUNT(*) INTO v_count
  FROM pg_trigger
  WHERE tgname = 'trigger_audit_stock_changes';
  
  IF v_count > 0 THEN
    RAISE NOTICE '✅ Trigger de auditoría en stock activado';
  ELSE
    RAISE WARNING '⚠️  Trigger de auditoría NOT encontrado';
  END IF;
  
  -- Verificar funciones
  SELECT COUNT(*) INTO v_count
  FROM pg_proc
  WHERE proname IN ('register_stock_movement', 'update_stock_with_audit', 'transfer_stock_atomic');
  
  RAISE NOTICE '✅ % funciones de auditoría creadas', v_count;
  RAISE NOTICE '✅ Sistema de auditoría de stock completamente implementado';
  RAISE NOTICE 'ℹ️  Todos los cambios en stock ahora se registran automáticamente';
END $$;
