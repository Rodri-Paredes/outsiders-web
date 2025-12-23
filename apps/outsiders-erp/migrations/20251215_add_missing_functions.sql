-- ====================================================================================================
-- FUNCIONES FALTANTES PARA EL ERP
-- ====================================================================================================

-- Función para actualizar stock
CREATE OR REPLACE FUNCTION update_stock(
  p_variant_id uuid,
  p_branch_id uuid,
  p_quantity integer
)
RETURNS void AS $$
BEGIN
  -- Si la cantidad es negativa, restamos del stock
  -- Si es positiva, sumamos
  INSERT INTO stock (variant_id, branch_id, quantity)
  VALUES (p_variant_id, p_branch_id, p_quantity)
  ON CONFLICT (variant_id, branch_id) 
  DO UPDATE SET 
    quantity = stock.quantity + p_quantity,
    updated_at = now()
  WHERE stock.quantity + p_quantity >= 0;
  
  -- Verificar que no sea negativo
  IF (SELECT quantity FROM stock WHERE variant_id = p_variant_id AND branch_id = p_branch_id) < 0 THEN
    RAISE EXCEPTION 'Stock insuficiente';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de ventas
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

-- Función para obtener top productos
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

-- Trigger para actualizar updated_at en stock
CREATE OR REPLACE FUNCTION update_stock_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_stock_updated_at ON stock;
CREATE TRIGGER trigger_update_stock_updated_at
  BEFORE UPDATE ON stock
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_updated_at();

-- Trigger para actualizar updated_at en drops
CREATE OR REPLACE FUNCTION update_drops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_drops_updated_at ON drops;
CREATE TRIGGER trigger_update_drops_updated_at
  BEFORE UPDATE ON drops
  FOR EACH ROW
  EXECUTE FUNCTION update_drops_updated_at();

-- Trigger para actualizar updated_at en cash_registers
CREATE OR REPLACE FUNCTION update_cash_registers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cash_registers_updated_at ON cash_registers;
CREATE TRIGGER trigger_update_cash_registers_updated_at
  BEFORE UPDATE ON cash_registers
  FOR EACH ROW
  EXECUTE FUNCTION update_cash_registers_updated_at();

-- ====================================================================================================
-- FUNCIONES DE UTILIDAD
-- ====================================================================================================

-- Función para obtener stock total de un producto en todas las sucursales
CREATE OR REPLACE FUNCTION get_product_total_stock(p_product_id uuid)
RETURNS TABLE (
  variant_id uuid,
  size text,
  total_quantity bigint,
  stock_by_branch jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.id as variant_id,
    pv.size,
    SUM(s.quantity)::bigint as total_quantity,
    jsonb_object_agg(b.name, s.quantity) as stock_by_branch
  FROM product_variants pv
  LEFT JOIN stock s ON pv.id = s.variant_id
  LEFT JOIN branches b ON s.branch_id = b.id
  WHERE pv.product_id = p_product_id
  GROUP BY pv.id, pv.size
  ORDER BY pv.size;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener movimientos de caja con detalles
CREATE OR REPLACE FUNCTION get_cash_movements_detailed(p_cash_register_id uuid)
RETURNS TABLE (
  id uuid,
  movement_type text,
  payment_type text,
  amount numeric,
  description text,
  user_name text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.movement_type,
    cm.payment_type,
    cm.amount::numeric,
    cm.description,
    u.name as user_name,
    cm.created_at
  FROM cash_movements cm
  JOIN users u ON cm.user_id = u.id
  WHERE cm.cash_register_id = p_cash_register_id
  ORDER BY cm.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Verificación
SELECT 'Funciones adicionales creadas correctamente' as status;
