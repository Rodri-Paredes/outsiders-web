# 🔄 Migración a Schema Unificado

## ⚠️ IMPORTANTE - Lee antes de ejecutar

Este schema unifica el e-commerce y el ERP en una sola base de datos de Supabase.

## 🗑️ Limpiar base de datos anterior (si existe)

**Si ya ejecutaste el schema anterior del e-commerce**, primero debes limpiar:

1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta este script para limpiar:

```sql
-- Desactivar RLS temporalmente
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;

-- Eliminar triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_carts_updated_at ON public.carts;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;

-- Eliminar funciones
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Eliminar tablas
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Eliminar tipos
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
```

## ✅ Instalar Schema Unificado

1. **Ve a Supabase Dashboard** → SQL Editor
2. **Crea una nueva query**
3. **Copia TODO el contenido** de `unified-schema.sql`
4. **Ejecuta** (Run)

## 🎯 ¿Qué incluye?

### Para E-commerce (web):
- ✅ Usuarios (USER role)
- ✅ Productos con stock
- ✅ Carrito de compras
- ✅ Órdenes online
- ✅ Drops/Colecciones

### Para ERP (gestión):
- ✅ Usuarios (ADMIN, VENDEDOR roles)
- ✅ Sucursales
- ✅ Productos con variantes (tallas)
- ✅ Stock por sucursal
- ✅ Ventas en tienda
- ✅ Control de caja
- ✅ Drops/Colecciones

### Compartido entre ambos:
- ✅ Tabla `users` (roles: USER, ADMIN, VENDEDOR)
- ✅ Tabla `products` (catálogo único)
- ✅ Tabla `drops` (lanzamientos)

## 📊 Datos de ejemplo incluidos

- 2 sucursales (Centro, Norte)
- 8 productos de streetwear

## 🔐 Crear usuario administrador

Después de ejecutar el schema, crea tu cuenta admin:

### Opción A: Desde la aplicación web

1. Ve a http://localhost:3001/auth
2. Regístrate con tu email
3. Luego ejecuta en Supabase SQL Editor:

```sql
-- Reemplaza 'tu@email.com' con tu email
UPDATE public.users 
SET role = 'ADMIN' 
WHERE email = 'tu@email.com';
```

### Opción B: Crear directamente en Supabase

```sql
-- 1. Primero crea el usuario en Supabase Auth Dashboard
-- 2. Luego actualiza su rol:
UPDATE public.users 
SET role = 'ADMIN' 
WHERE email = 'tu@email.com';
```

## 🚀 Después de la migración

Los mismos comandos de siempre:

```bash
# Frontend e-commerce
cd apps/frontend
npm run dev
# http://localhost:3001

# ERP
cd apps/outsiders-erp
npm run dev
# http://localhost:5173
```

## 🔍 Verificar instalación

Ejecuta en SQL Editor:

```sql
-- Ver tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Ver productos
SELECT id, name, price, stock FROM public.products;

-- Ver sucursales
SELECT * FROM public.branches;
```

## 🆘 Problemas comunes

### "relation already exists"
Ya ejecutaste el schema antes. Usa el script de limpieza primero.

### "permission denied"
Asegúrate de estar usando el SQL Editor de Supabase, no psql directo.

### No puedo iniciar sesión en el ERP
Verifica que tu usuario tenga rol ADMIN o VENDEDOR:
```sql
SELECT email, role FROM public.users;
```

## 📞 Diferencias clave

| Característica | E-commerce | ERP |
|---|---|---|
| Usuarios | Clientes (role: USER) | Staff (role: ADMIN/VENDEDOR) |
| Productos | Vista simplificada | Con variantes y tallas |
| Stock | Global | Por sucursal |
| Ventas | Órdenes online | Ventas en tienda |
| Carrito | Sí | No |
| Control de caja | No | Sí |
