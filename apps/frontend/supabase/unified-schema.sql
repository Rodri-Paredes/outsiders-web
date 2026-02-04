/*
  ====================================================================================================
  SCHEMA UNIFICADO - OUTSIDERS E-COMMERCE + ERP
  ====================================================================================================
  
  Sistema completo que integra:
  - E-commerce (frontend web)
  - ERP (gestión interna)
  
  Ambos sistemas comparten:
  - Usuarios y autenticación
  - Productos y catálogo
  - Drops/Colecciones
  
  ERP adicional:
  - Sucursales y stock por ubicación
  - Variantes de productos (tallas)
  - Ventas y control de caja
  - Inventario multi-sucursal
  
  Creado: 2025-12-23
  ====================================================================================================
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================================================
-- ENUMS
-- ====================================================================================================

CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'VENDEDOR');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE drop_status AS ENUM ('ACTIVO', 'INACTIVO', 'FINALIZADO');
CREATE TYPE payment_type AS ENUM ('EFECTIVO', 'QR', 'TARJETA', 'MIXTO');
CREATE TYPE movement_type AS ENUM ('INGRESO', 'EGRESO');
CREATE TYPE cash_register_status AS ENUM ('ABIERTA', 'CERRADA');

-- ====================================================================================================
-- 1. BRANCHES (Sucursales) - SOLO ERP
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.branches IS 'Sucursales físicas de la tienda';

-- ====================================================================================================
-- 2. USERS (Usuarios unificados)
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role user_role DEFAULT 'USER',
  branch_id UUID REFERENCES public.branches(id), -- Solo para VENDEDOR
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Usuarios del sistema (e-commerce y ERP)';
COMMENT ON COLUMN public.users.role IS 'USER: cliente web, ADMIN: administrador total, VENDEDOR: vendedor de sucursal';
COMMENT ON COLUMN public.users.branch_id IS 'Sucursal asignada (solo para rol VENDEDOR)';

-- ====================================================================================================
-- 3. DROPS (Lanzamientos/Colecciones) - COMPARTIDO
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.drops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  launch_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status drop_status DEFAULT 'ACTIVO',
  is_featured BOOLEAN DEFAULT false,
  image_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.drops IS 'Lanzamientos y colecciones de productos (visible en web y ERP)';

-- ====================================================================================================
-- 4. PRODUCTS (Productos) - COMPARTIDO
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0, -- Stock total (suma de todas las sucursales)
  image_url TEXT,
  drop_id UUID REFERENCES public.drops(id),
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.products IS 'Catálogo de productos (compartido entre e-commerce y ERP)';
COMMENT ON COLUMN public.products.stock IS 'Stock total disponible para e-commerce (calculado desde stock de sucursales)';
COMMENT ON COLUMN public.products.is_visible IS 'Si es visible en el e-commerce web';

-- ====================================================================================================
-- 5. PRODUCT_VARIANTS (Variantes - Tallas) - SOLO ERP
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size)
);

COMMENT ON TABLE public.product_variants IS 'Variantes de productos por talla (usado en ERP para inventario)';

-- ====================================================================================================
-- 6. STOCK (Inventario por sucursal) - SOLO ERP
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(variant_id, branch_id)
);

COMMENT ON TABLE public.stock IS 'Inventario de productos por sucursal y variante';

-- ====================================================================================================
-- 7. CARTS (Carritos) - SOLO E-COMMERCE
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================================================
-- 8. CART_ITEMS (Items del carrito) - SOLO E-COMMERCE
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(cart_id, product_id)
);

-- ====================================================================================================
-- 9. ORDERS (Órdenes web) - SOLO E-COMMERCE
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================================================
-- 10. ORDER_ITEMS (Items de órdenes) - SOLO E-COMMERCE
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL
);

-- ====================================================================================================
-- 11. SALES (Ventas en sucursales) - SOLO ERP
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  subtotal DECIMAL(10,2) CHECK (subtotal >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  payment_type payment_type DEFAULT 'EFECTIVO',
  payment_details JSONB,
  sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.sales IS 'Ventas realizadas en sucursales físicas (ERP)';

-- ====================================================================================================
-- 12. SALE_ITEMS (Items de ventas) - SOLO ERP
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- ====================================================================================================
-- 13. CASH_REGISTERS (Control de cajas) - SOLO ERP
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.cash_registers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  status cash_register_status DEFAULT 'ABIERTA',
  
  opening_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opening_amount DECIMAL(10,2) NOT NULL CHECK (opening_amount >= 0),
  opening_user_id UUID NOT NULL REFERENCES public.users(id),
  opening_notes TEXT,
  
  closing_date TIMESTAMPTZ,
  closing_amount DECIMAL(10,2) CHECK (closing_amount >= 0),
  closing_user_id UUID REFERENCES public.users(id),
  closing_notes TEXT,
  
  expected_cash DECIMAL(10,2) CHECK (expected_cash >= 0),
  expected_qr DECIMAL(10,2) CHECK (expected_qr >= 0),
  expected_card DECIMAL(10,2) CHECK (expected_card >= 0),
  expected_total DECIMAL(10,2) CHECK (expected_total >= 0),
  cash_difference DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================================================
-- 14. CASH_MOVEMENTS (Movimientos de caja) - SOLO ERP
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.cash_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cash_register_id UUID NOT NULL REFERENCES public.cash_registers(id) ON DELETE CASCADE,
  movement_type movement_type NOT NULL,
  payment_type payment_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================================================
-- 15. DROP_PRODUCTS (Relación productos-drops) - COMPARTIDO
-- ====================================================================================================

CREATE TABLE IF NOT EXISTS public.drop_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drop_id UUID NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(drop_id, product_id)
);

-- ====================================================================================================
-- TRIGGERS
-- ====================================================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drops_updated_at BEFORE UPDATE ON public.drops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_updated_at BEFORE UPDATE ON public.stock
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_registers_updated_at BEFORE UPDATE ON public.cash_registers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================================================

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

-- ====================================================================================================
-- POLICIES - USERS
-- ====================================================================================================

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'VENDEDOR'))
  );

-- ====================================================================================================
-- POLICIES - PRODUCTS (público para lectura, admin/vendedor para escritura)
-- ====================================================================================================

CREATE POLICY "Anyone can view visible products" ON public.products
  FOR SELECT USING (is_visible = true OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'VENDEDOR')
  ));

CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ====================================================================================================
-- POLICIES - DROPS
-- ====================================================================================================

CREATE POLICY "Anyone can view active drops" ON public.drops
  FOR SELECT USING (status = 'ACTIVO' OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'VENDEDOR')
  ));

CREATE POLICY "Admins can manage drops" ON public.drops
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ====================================================================================================
-- POLICIES - CARTS (solo usuario propietario)
-- ====================================================================================================

CREATE POLICY "Users can view their own cart" ON public.carts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own cart" ON public.carts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cart" ON public.carts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own cart" ON public.carts
  FOR DELETE USING (user_id = auth.uid());

-- ====================================================================================================
-- POLICIES - CART_ITEMS
-- ====================================================================================================

CREATE POLICY "Users can view their cart items" ON public.cart_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

CREATE POLICY "Users can manage their cart items" ON public.cart_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

-- ====================================================================================================
-- POLICIES - ORDERS
-- ====================================================================================================

CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  ));

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ====================================================================================================
-- POLICIES - ORDER_ITEMS
-- ====================================================================================================

CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Users can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- ====================================================================================================
-- POLICIES - ERP TABLES (Admin y Vendedor)
-- ====================================================================================================

CREATE POLICY "Staff can view branches" ON public.branches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'VENDEDOR'))
  );

CREATE POLICY "Admins can manage branches" ON public.branches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Staff can view stock" ON public.stock
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'VENDEDOR'))
  );

CREATE POLICY "Admins can manage stock" ON public.stock
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Staff can view sales" ON public.sales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'ADMIN' OR (role = 'VENDEDOR' AND branch_id = sales.branch_id))
    )
  );

CREATE POLICY "Staff can create sales" ON public.sales
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'VENDEDOR'))
  );

CREATE POLICY "Staff can view product variants" ON public.product_variants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'VENDEDOR'))
  );

CREATE POLICY "Admins can manage product variants" ON public.product_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Staff can view sale items" ON public.sale_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sales s
      JOIN public.users u ON u.id = auth.uid()
      WHERE s.id = sale_items.sale_id
      AND (u.role = 'ADMIN' OR (u.role = 'VENDEDOR' AND u.branch_id = s.branch_id))
    )
  );

CREATE POLICY "Staff can create sale items" ON public.sale_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'VENDEDOR'))
  );

CREATE POLICY "Staff can view cash registers" ON public.cash_registers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'ADMIN' OR (role = 'VENDEDOR' AND branch_id = cash_registers.branch_id))
    )
  );

CREATE POLICY "Staff can manage cash registers" ON public.cash_registers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'VENDEDOR'))
  );

CREATE POLICY "Staff can view cash movements" ON public.cash_movements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cash_registers cr
      JOIN public.users u ON u.id = auth.uid()
      WHERE cr.id = cash_movements.cash_register_id
      AND (u.role = 'ADMIN' OR (u.role = 'VENDEDOR' AND u.branch_id = cr.branch_id))
    )
  );

CREATE POLICY "Staff can create cash movements" ON public.cash_movements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'VENDEDOR'))
  );

CREATE POLICY "Anyone can view drop products" ON public.drop_products
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage drop products" ON public.drop_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ====================================================================================================
-- FUNCTION: Auto-create user profile on signup
-- ====================================================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'USER');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================================================
-- SAMPLE DATA
-- ====================================================================================================

-- Insertar sucursal principal
INSERT INTO public.branches (name, address) VALUES
('Sucursal Centro', 'Av. Principal 123'),
('Sucursal Norte', 'Calle Comercio 456')
ON CONFLICT DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO public.products (name, description, category, price, stock, image_url, is_visible) VALUES
('OVERSIZED TEE BLACK', 'Camiseta oversized premium con logo bordado', 'CAMISETAS', 45.00, 50, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop', true),
('CARGO PANTS TACTICAL', 'Pantalón cargo con múltiples bolsillos', 'PANTALONES', 89.00, 30, 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=750&fit=crop', true),
('HOODIE WASHED GREY', 'Sudadera con capucha efecto lavado', 'HOODIES', 75.00, 40, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop', true),
('UTILITY VEST', 'Chaleco táctico multibolsillos', 'CHALECOS', 65.00, 25, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=750&fit=crop', true),
('TRACK PANTS RETRO', 'Pantalón deportivo con bandas laterales', 'PANTALONES', 55.00, 35, 'https://images.unsplash.com/photo-1623876229339-0df13d6a0027?w=600&h=750&fit=crop', true),
('BOMBER JACKET', 'Chaqueta bomber reversible', 'CHAQUETAS', 120.00, 20, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop', true),
('GRAPHIC TEE LIMITED', 'Camiseta con estampado exclusivo edición limitada', 'CAMISETAS', 50.00, 15, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop', true),
('DENIM JACKET VINTAGE', 'Chaqueta denim con efecto vintage', 'CHAQUETAS', 95.00, 18, 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&h=750&fit=crop', true)
ON CONFLICT DO NOTHING;
