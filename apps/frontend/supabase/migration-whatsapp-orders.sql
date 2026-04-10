CREATE TABLE public.whatsapp_orders (
  id VARCHAR(10) PRIMARY KEY,
  customer_id UUID DEFAULT NULL, -- optional
  total DECIMAL(10,2) NOT NULL,
  city VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pendiente',
  delivery_method VARCHAR(50),
  branch VARCHAR(100),
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.whatsapp_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.whatsapp_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.whatsapp_orders FOR INSERT WITH CHECK (true);
