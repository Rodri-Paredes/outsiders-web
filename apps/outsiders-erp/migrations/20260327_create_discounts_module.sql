-- Migración: Crear módulo de Descuentos
-- Fecha: 2026-03-27

CREATE TABLE IF NOT EXISTS discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED')),
    value DECIMAL(10,2) NOT NULL CHECK (value > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discounts viewable by everyone" 
ON discounts FOR SELECT USING (true);

CREATE POLICY "Discounts insertable by authenticated users" 
ON discounts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Discounts updatable by authenticated users" 
ON discounts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Discounts deletable by authenticated users" 
ON discounts FOR DELETE TO authenticated USING (true);

-- Insertar algunos de ejemplo por defecto para que no inicie vacío
INSERT INTO discounts (code, description, type, value, is_active)
VALUES 
('EMPLEADO10', 'Descuento para empleados del 10%', 'PERCENTAGE', 10, true),
('FERIA20', 'Descuento de feria 20 Bs', 'FIXED', 20, true)
ON CONFLICT (code) DO NOTHING;
