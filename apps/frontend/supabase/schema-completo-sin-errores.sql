-- ====================================================================================================
-- SCHEMA UNIFICADO COMPLETO - SIN ERRORES DE RECURSIÓN
-- ====================================================================================================
-- Sistema E-commerce + ERP con Supabase
-- Este script crea TODO desde cero sin problemas de recursión en RLS
-- ====================================================================================================

-- PASO 1: Limpiar todo (solo si ya existe algo)
-- ====================================================================================================

DROP TABLE IF EXISTS public.cash_movements CASCADE;
DROP TABLE IF EXISTS public.cash_registers CASCADE;
DROP TABLE IF EXISTS public.sale_items CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.stock_movements CASCADE;
DROP TABLE IF EXISTS public.stock CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;
DROP TABLE IF EXISTS public.drops CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;

DROP TYPE IF EXISTS cash_register_status CASCADE;
DROP TYPE IF EXISTS movement_type CASCADE;
DROP TYPE IF EXISTS payment_type CASCADE;
DROP TYPE IF EXISTS drop_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ====================================================================================================
-- PASO 2: Crear ENUMS
-- ====================================================================================================

CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'VENDEDOR');
CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE drop_status AS ENUM ('PROXIMO', 'ACTIVO', 'FINALIZADO');
CREATE TYPE payment_type AS ENUM ('EFECTIVO', 'QR', 'TARJETA', 'MIXTO');
CREATE TYPE movement_type AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE', 'TRANSFERENCIA');
CREATE TYPE cash_register_status AS ENUM ('ABIERTA', 'CERRADA');

-- ====================================================================================================
-- PASO 3: Crear TABLAS (sin RLS todavía)
-- ====================================================================================================

-- 1. BRANCHES (Sucursales)
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS (Perfiles de usuario)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  role user_role DEFAULT 'USER',
  phone VARCHAR(50),
  address TEXT,
  branch_id UUID REFERENCES public.branches(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS (Productos del catálogo)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  category VARCHAR(100),
  image_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DROPS (Lanzamientos especiales)
CREATE TABLE public.drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  release_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status drop_status DEFAULT 'PROXIMO',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CARTS (Carritos de compra)
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 6. CART_ITEMS (Items del carrito)
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- 7. ORDERS (Pedidos e-commerce)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  status order_status DEFAULT 'PENDING',
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDER_ITEMS (Items de pedidos)
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0)
);

-- 9. PRODUCT_VARIANTS (Variantes para ERP)
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size VARCHAR(50),
  color VARCHAR(50),
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STOCK (Inventario por sucursal)
CREATE TABLE public.stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, variant_id)
);

-- 11. STOCK_MOVEMENTS (Movimientos de inventario)
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id),
  movement_type movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SALES (Ventas en sucursal)
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 13. SALE_ITEMS (Items de ventas)
CREATE TABLE public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- 14. CASH_REGISTERS (Cajas registradoras)
CREATE TABLE public.cash_registers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 15. CASH_MOVEMENTS (Movimientos de caja)
CREATE TABLE public.cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_register_id UUID NOT NULL REFERENCES public.cash_registers(id) ON DELETE CASCADE,
  movement_type movement_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  payment_type payment_type,
  description TEXT,
  sale_id UUID REFERENCES public.sales(id),
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================================================
-- PASO 4: Crear TRIGGER para auto-crear perfiles de usuario
-- ====================================================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'USER'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================================================
-- PASO 5: Habilitar RLS en TODAS las tablas
-- ====================================================================================================

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

-- ====================================================================================================
-- PASO 6: Crear POLÍTICAS RLS (SIN RECURSIÓN)
-- ====================================================================================================

-- BRANCHES: Todos pueden ver, solo admins pueden modificar
CREATE POLICY "branches_select_all" ON public.branches
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "branches_modify_admin" ON public.branches
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('ADMIN', 'VENDEDOR'))
  );

-- USERS: Políticas simples sin recursión
CREATE POLICY "users_select_all" ON public.users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated 
  USING (id = auth.uid());

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT TO authenticated 
  WITH CHECK (id = auth.uid());

-- PRODUCTS: Todos pueden ver, autenticados pueden modificar
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "products_insert_auth" ON public.products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "products_update_auth" ON public.products
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "products_delete_auth" ON public.products
  FOR DELETE TO authenticated USING (true);

-- DROPS: Todos pueden ver, autenticados pueden modificar
CREATE POLICY "drops_select_all" ON public.drops
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "drops_modify_auth" ON public.drops
  FOR ALL TO authenticated USING (true);

-- CARTS: Solo el propietario
CREATE POLICY "carts_all_own" ON public.carts
  FOR ALL TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- CART_ITEMS: Solo items de tu carrito
CREATE POLICY "cart_items_all_own" ON public.cart_items
  FOR ALL TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

-- ORDERS: Ver tus propias órdenes, crear tus propias órdenes
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid());

-- ORDER_ITEMS: Ver items de tus órdenes
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- PRODUCT_VARIANTS: Todos los autenticados pueden acceder
CREATE POLICY "variants_all_auth" ON public.product_variants
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- STOCK: Todos los autenticados pueden acceder
CREATE POLICY "stock_all_auth" ON public.stock
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- STOCK_MOVEMENTS: Todos los autenticados pueden ver
CREATE POLICY "stock_movements_all_auth" ON public.stock_movements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SALES: Todos los autenticados pueden acceder
CREATE POLICY "sales_all_auth" ON public.sales
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SALE_ITEMS: Todos los autenticados pueden acceder
CREATE POLICY "sale_items_all_auth" ON public.sale_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CASH_REGISTERS: Todos los autenticados pueden acceder
CREATE POLICY "cash_registers_all_auth" ON public.cash_registers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CASH_MOVEMENTS: Todos los autenticados pueden acceder
CREATE POLICY "cash_movements_all_auth" ON public.cash_movements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ====================================================================================================
-- PASO 7: Crear ÍNDICES para mejor rendimiento
-- ====================================================================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_visible ON public.products(is_visible);
CREATE INDEX idx_carts_user ON public.carts(user_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_stock_branch ON public.stock(branch_id);
CREATE INDEX idx_stock_variant ON public.stock(variant_id);
CREATE INDEX idx_sales_branch ON public.sales(branch_id);
CREATE INDEX idx_sales_date ON public.sales(sale_date);

-- ====================================================================================================
-- PASO 8: Insertar DATOS INICIALES
-- ====================================================================================================

-- Crear sucursal principal
INSERT INTO public.branches (name, address, phone, is_active)
VALUES ('Sucursal Principal', 'Dirección Principal', '123456789', true);

-- ====================================================================================================
-- VERIFICACIÓN FINAL
-- ====================================================================================================

-- Verificar tablas creadas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'on_auth_user_created';

-- ====================================================================================================
-- ¡LISTO! Tu base de datos está completamente configurada sin errores de recursión
-- ====================================================================================================
