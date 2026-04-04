# GUÍA DE CONFIGURACIÓN COMPLETA - OUTSIDERS ERP

## 1. Ejecutar Migraciones en Supabase

Ve al Dashboard de Supabase → SQL Editor y ejecuta los siguientes scripts en orden:

### Paso 1: Schema Principal
```sql
-- Ejecutar el archivo: migrations/20251214_outsiders_complete_schema.sql
-- Este crea todas las tablas, funciones, políticas RLS y datos iniciales
```

### Paso 2: Funciones Adicionales
```sql
-- Ejecutar el archivo: migrations/20251215_add_missing_functions.sql
-- Este agrega las funciones faltantes para el ERP
```

### Paso 3: Crear Usuario Admin
1. En Supabase Dashboard → Authentication → Users
2. Click en "Add User" → "Create New User"
3. Usar estos datos:
   - Email: `admin@outsiders.com`
   - Password: `Admin123!` (o la que prefieras)
   - Auto Confirm User: ✅ (activado)

4. Una vez creado el usuario, copiar el **UUID** que se generó

5. En SQL Editor, ejecutar:
```sql
-- Reemplazar 'UUID_DEL_USUARIO' con el UUID real copiado
INSERT INTO users (id, name, email, role, branch_id) 
VALUES (
  'UUID_DEL_USUARIO',
  'Administrador',
  'admin@outsiders.com',
  'admin',
  NULL
)
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;
```

## 2. Verificación de la Base de Datos

Ejecuta estos queries para verificar que todo esté correcto:

### Verificar Tablas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'branches', 'users', 'products', 'product_variants', 
    'stock', 'sales', 'sale_items', 'drops', 'drop_products', 
    'cash_registers', 'cash_movements'
  )
ORDER BY table_name;
-- Debe retornar 11 tablas
```

### Verificar Funciones
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_name IN (
    'update_stock',
    'open_cash_register',
    'close_cash_register',
    'register_sale_movement',
    'get_open_cash_register',
    'get_cash_register_summary',
    'get_sales_stats',
    'get_top_products',
    'get_active_drops',
    'get_drop_products'
  )
ORDER BY routine_name;
-- Debe retornar 10+ funciones
```

### Verificar Sucursales
```sql
SELECT id, name, address FROM branches;
-- Debe retornar 3 sucursales
```

### Verificar Usuario Admin
```sql
SELECT id, name, email, role FROM users WHERE role = 'admin';
-- Debe retornar 1 usuario admin
```

## 3. Iniciar el ERP

El ERP ya está corriendo en: http://localhost:5173

### Credenciales de acceso:
- Email: `admin@outsiders.com`
- Password: `Admin123!` (o la que hayas configurado)

## 4. Flujo de Trabajo del ERP

### Primer Uso:
1. **Login** → Ingresa con admin@outsiders.com
2. **Seleccionar Sucursal** → Elige una de las 3 sucursales
3. **Abrir Caja** → Módulo "Caja" → Abrir con monto inicial
4. **Crear Productos** → Módulo "Productos" → Agregar productos con tallas
5. **Cargar Stock** → Módulo "Stock" → Ajustar stock por producto/talla
6. **Realizar Ventas** → Módulo "Ventas" → Seleccionar productos y procesar pago
7. **Ver Estadísticas** → Dashboard → Ver resumen de ventas

### Módulos Disponibles:
- 📊 **Dashboard**: Estadísticas, ventas, productos top
- 🛍️ **Ventas**: POS para procesar ventas
- 📦 **Productos**: Gestión de catálogo
- 📊 **Stock**: Control de inventario por sucursal
- 💰 **Caja**: Apertura/cierre de caja
- 🎨 **Drops**: Colecciones y lanzamientos

## 5. Datos de Prueba (Opcional)

Si quieres cargar datos de prueba, ejecuta:

```sql
-- Productos de ejemplo
INSERT INTO products (name, description, category, price, is_visible) VALUES
  ('Remera Outsiders Classic', 'Remera 100% algodón con logo', 'Remeras', 150.00, true),
  ('Buzo Hoodie Black', 'Buzo con capucha negro premium', 'Buzos', 350.00, true),
  ('Gorra Snapback', 'Gorra ajustable con logo bordado', 'Gorras', 100.00, true);

-- Obtener IDs de productos creados
SELECT id, name FROM products ORDER BY created_at DESC LIMIT 3;

-- Crear variantes (reemplazar PRODUCT_ID_1, etc con los IDs reales)
INSERT INTO product_variants (product_id, size) VALUES
  ('PRODUCT_ID_1', 'S'),
  ('PRODUCT_ID_1', 'M'),
  ('PRODUCT_ID_1', 'L'),
  ('PRODUCT_ID_1', 'XL'),
  ('PRODUCT_ID_2', 'M'),
  ('PRODUCT_ID_2', 'L'),
  ('PRODUCT_ID_2', 'XL'),
  ('PRODUCT_ID_3', 'UNICA');

-- Cargar stock inicial (reemplazar VARIANT_ID y BRANCH_ID con los reales)
-- Obtener IDs: SELECT id FROM branches;
-- Obtener variant IDs: SELECT id, product_id, size FROM product_variants;
INSERT INTO stock (variant_id, branch_id, quantity) VALUES
  ('VARIANT_ID_1', 'BRANCH_ID_1', 10),
  ('VARIANT_ID_2', 'BRANCH_ID_1', 15),
  ('VARIANT_ID_3', 'BRANCH_ID_1', 8);
```

## 6. Solución de Problemas

### Error: "No hay caja abierta"
- Ve al módulo "Caja" y abre una caja antes de realizar ventas

### Error: "Stock insuficiente"
- Verifica el stock en el módulo "Stock" y ajusta las cantidades

### Error al iniciar sesión
- Verifica que el usuario existe en Authentication
- Verifica que el perfil exista en la tabla `users`
- Verifica que las credenciales sean correctas

### Error de conexión
- Verifica que las variables de entorno estén correctamente configuradas
- Verifica la URL y las claves de Supabase en `.env`

## 7. Próximos Pasos

✅ Sistema listo para usar
✅ Todos los módulos funcionales
✅ Dashboard con estadísticas en tiempo real
✅ Control de stock automático
✅ Sistema de cajas integrado

### Funcionalidades Avanzadas:
- Transferencias de stock entre sucursales
- Reportes de ventas por período
- Gestión de drops/colecciones
- Pagos mixtos (efectivo + tarjeta + QR)
- Control de descuentos
- Múltiples sucursales

## 8. Contacto y Soporte

Para cualquier problema o consulta sobre el ERP, revisar:
- Logs del navegador (F12 → Console)
- Logs de Supabase (Dashboard → Logs)
- Verificar políticas RLS en Supabase

---

**¡El ERP está listo para producción! 🚀**
