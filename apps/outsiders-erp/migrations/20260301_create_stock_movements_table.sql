-- ====================================================================================================
-- NUEVA FUNCIONALIDAD: Tabla de Auditoría de Movimientos de Stock
-- ====================================================================================================
-- Fecha: 2026-03-01
-- Propósito: Registrar TODOS los movimientos de stock para auditoría y trazabilidad
-- Permite: Rastrear quién, cuándo, por qué y cómo cambió el inventario
-- ====================================================================================================

-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación del producto
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  
  -- Tipo de movimiento
  movement_type text NOT NULL CHECK (
    movement_type IN (
      'VENTA',                    -- Descuento automático por venta
      'AJUSTE_ENTRADA',           -- Ajuste manual: agregar stock
      'AJUSTE_SALIDA',            -- Ajuste manual: restar stock
      'AJUSTE_SET',               -- Ajuste manual: establecer cantidad exacta
      'TRANSFERENCIA_SALIDA',     -- Salida por transferencia a otra sucursal
      'TRANSFERENCIA_ENTRADA',    -- Entrada por transferencia desde otra sucursal
      'INICIALIZACION',           -- Creación inicial de stock para nueva variante
      'CORRECCION_INVENTARIO',    -- Corrección después de conteo físico
      'ENTRADA_PROVEEDOR',        -- Entrada de mercadería de proveedor
      'DEVOLUCION_CLIENTE',       -- Devolución de cliente
      'PRODUCTO_DANADO',          -- Producto dañado/inservible
      'PRODUCTO_PERDIDO',         -- Producto extraviado
      'REGALO_DONACION',          -- Regalo, donación o muestra
      'OTRO'                      -- Otro motivo (especificar en notes)
    )
  ),
  
  -- Cantidades
  quantity integer NOT NULL,           -- Cantidad del movimiento (positivo o negativo)
  previous_quantity integer NOT NULL,  -- Stock antes del movimiento
  new_quantity integer NOT NULL,       -- Stock después del movimiento (para verificación)
  
  -- Contexto y trazabilidad
  reason text,                         -- Razón predefinida del movimiento
  notes text,                          -- Notas adicionales del usuario
  user_id uuid REFERENCES users(id),   -- Usuario que realizó el movimiento
  
  -- Relaciones con otras tablas
  related_sale_id uuid REFERENCES sales(id) ON DELETE SET NULL,  -- Si fue por una venta
  related_transfer_id uuid,            -- UUID común para vincular origen/destino de transferencias
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX idx_stock_movements_variant ON stock_movements(variant_id);
CREATE INDEX idx_stock_movements_branch ON stock_movements(branch_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_user ON stock_movements(user_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_transfer ON stock_movements(related_transfer_id) WHERE related_transfer_id IS NOT NULL;
CREATE INDEX idx_stock_movements_sale ON stock_movements(related_sale_id) WHERE related_sale_id IS NOT NULL;

-- Comentarios
COMMENT ON TABLE stock_movements IS 'Registro completo de todos los movimientos de stock para auditoría y trazabilidad';
COMMENT ON COLUMN stock_movements.movement_type IS 'Tipo de movimiento de stock';
COMMENT ON COLUMN stock_movements.quantity IS 'Cantidad movida (positiva para entrada, negativa para salida)';
COMMENT ON COLUMN stock_movements.previous_quantity IS 'Stock antes del movimiento';
COMMENT ON COLUMN stock_movements.new_quantity IS 'Stock después del movimiento';
COMMENT ON COLUMN stock_movements.reason IS 'Razón predefinida del movimiento';
COMMENT ON COLUMN stock_movements.notes IS 'Notas adicionales del usuario';
COMMENT ON COLUMN stock_movements.related_transfer_id IS 'UUID compartido para vincular origen y destino en transferencias';

-- RLS (Row Level Security)
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Política de lectura: usuarios pueden ver movimientos de su sucursal o todos si son admin
CREATE POLICY "Users can read stock movements for their branch or all if admin"
  ON stock_movements FOR SELECT
  USING (
    branch_id IN (SELECT branch_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Política de inserción: solo a través de funciones de base de datos (no directo)
-- Por seguridad, los registros solo se crean vía triggers/funciones
CREATE POLICY "Stock movements can only be inserted by system functions"
  ON stock_movements FOR INSERT
  WITH CHECK (false);  -- Nadie puede insertar directamente, solo vía funciones SECURITY DEFINER

-- Vista para consultas comunes
CREATE OR REPLACE VIEW stock_movements_detailed AS
SELECT 
  sm.id,
  sm.variant_id,
  pv.size as variant_size,
  p.id as product_id,
  p.name as product_name,
  p.category as product_category,
  sm.branch_id,
  b.name as branch_name,
  sm.movement_type,
  sm.quantity,
  sm.previous_quantity,
  sm.new_quantity,
  sm.reason,
  sm.notes,
  sm.user_id,
  u.name as user_name,
  sm.related_sale_id,
  sm.related_transfer_id,
  sm.created_at
FROM stock_movements sm
JOIN product_variants pv ON sm.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
JOIN branches b ON sm.branch_id = b.id
LEFT JOIN users u ON sm.user_id = u.id;

COMMENT ON VIEW stock_movements_detailed IS 'Vista con información completa de movimientos de stock';

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla stock_movements creada exitosamente';
  RAISE NOTICE '✅ Índices y RLS configurados';
  RAISE NOTICE '✅ Vista stock_movements_detailed creada';
  RAISE NOTICE 'ℹ️  Siguiente paso: Crear triggers para registro automático';
END $$;
