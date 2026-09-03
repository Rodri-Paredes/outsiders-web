-- ====================================================================================================
-- FIX: get_sales_stats multiplicaba s.total por la cantidad de sale_items en el JOIN.
-- Esta migración corrige la función para sumar ventas y transacciones sin duplicación.
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
  WITH sales_filtered AS (
    SELECT s.id, s.total
    FROM sales s
    WHERE s.branch_id = p_branch_id
      AND s.sale_date::date BETWEEN p_start_date AND p_end_date
  ),
  items_sum AS (
    SELECT COALESCE(SUM(si.quantity), 0) as total_qty
    FROM sale_items si
    WHERE si.sale_id IN (SELECT id FROM sales_filtered)
  )
  SELECT 
    COALESCE(SUM(sf.total), 0)::numeric as total_sales,
    COUNT(sf.id)::bigint as total_transactions,
    CASE 
      WHEN COUNT(sf.id) > 0 THEN (COALESCE(SUM(sf.total), 0) / COUNT(sf.id))::numeric
      ELSE 0::numeric
    END as average_ticket,
    COALESCE((SELECT total_qty FROM items_sum), 0)::bigint as total_products_sold
  FROM sales_filtered sf;
END;
$$ LANGUAGE plpgsql;
