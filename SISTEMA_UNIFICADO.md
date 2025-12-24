# ✅ Sistema Unificado Completado

## 🎯 ¿Qué se hizo?

Se unificó el e-commerce y el ERP para usar **una única base de datos** en Supabase, permitiendo:

✅ Gestionar productos desde el ERP y verlos en la web
✅ Crear drops/colecciones que aparecen en ambos sistemas
✅ Un solo login para todo el sistema
✅ Roles diferenciados (USER, ADMIN, VENDEDOR)

## 📋 Pasos para completar la configuración

### 1. Ejecutar el Schema Unificado en Supabase

1. **Limpia la base de datos anterior** (si ya ejecutaste el schema del e-commerce):
   - Abre Supabase Dashboard → SQL Editor
   - Ejecuta el script de limpieza de [MIGRACION_SCHEMA_UNIFICADO.md](MIGRACION_SCHEMA_UNIFICADO.md)

2. **Ejecuta el nuevo schema**:
   - Copia TODO el contenido de `apps/frontend/supabase/unified-schema.sql`
   - Pégalo en SQL Editor de Supabase
   - Ejecuta (Run)

3. **Verifica que se creó correctamente**:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Deberías ver:
- branches
- carts
- cart_items
- cash_movements
- cash_registers
- drop_products
- drops
- order_items
- orders
- product_variants
- products
- sale_items
- sales
- stock
- users

### 2. Crear tu Usuario Administrador

**Opción A** - Desde la web (recomendado):

1. Ve a http://localhost:3001/auth
2. Registra tu cuenta normalmente
3. En Supabase SQL Editor, ejecuta:

```sql
-- Reemplaza con tu email
UPDATE public.users 
SET role = 'ADMIN' 
WHERE email = 'tu@email.com';
```

**Opción B** - Directamente en Supabase:

1. Ve a Supabase Dashboard → Authentication → Users
2. Crea un nuevo usuario
3. Actualiza su rol con el SQL de arriba

### 3. Verificar que todo funcione

1. **E-commerce** (http://localhost:3001):
   - Ver productos ✅
   - Agregar al carrito (requiere login) ✅
   - Ver drops ✅

2. **ERP** (http://localhost:5173):
   - Login con tu usuario ADMIN ✅
   - Ver/crear productos ✅
   - Ver sucursales ✅
   - Gestionar drops ✅

## 🔐 Roles y Permisos

| Rol | Acceso E-commerce | Acceso ERP | Permisos |
|-----|------------------|------------|----------|
| **USER** | ✅ Sí | ❌ No | Navegar, comprar, ver su carrito |
| **VENDEDOR** | ✅ Sí | ✅ Sí | Todo lo de USER + gestionar ventas de su sucursal |
| **ADMIN** | ✅ Sí | ✅ Sí | Acceso total a todo |

## 📊 Flujo de trabajo típico

### Para gestionar productos (Admin):

1. **Entra al ERP** (http://localhost:5173)
2. **Crea/edita productos** en la sección de Productos
3. **Marca productos como visibles** (`is_visible = true`)
4. **Los productos aparecen automáticamente** en el e-commerce

### Para crear un Drop:

1. **Entra al ERP**
2. **Ve a Drops → Nuevo Drop**
3. **Agrega productos al drop**
4. **El drop aparece** en http://localhost:3001/drops

### Para vender en tienda física:

1. **Vendedor abre caja** en su sucursal
2. **Registra ventas** con productos del inventario
3. **Stock se descuenta automáticamente**
4. **Al final del día cierra caja**

## 🗂️ Estructura de Archivos

```
apps/
├── frontend/                    # E-commerce Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Inicio
│   │   │   ├── auth/           # Login/Registro
│   │   │   ├── cart/           # Carrito
│   │   │   └── drops/          # Drops
│   │   ├── components/
│   │   │   ├── ProductList.tsx
│   │   │   ├── DropsGrid.tsx
│   │   │   └── Navbar.tsx
│   │   ├── services/           # Servicios Supabase
│   │   │   ├── auth.service.ts
│   │   │   ├── products.service.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── orders.service.ts
│   │   │   └── drops.service.ts
│   │   └── lib/
│   │       ├── supabase.ts
│   │       └── database.types.ts
│   └── supabase/
│       └── unified-schema.sql   # ⭐ Schema unificado
│
└── outsiders-erp/               # ERP React + Vite
    ├── src/
    │   ├── pages/               # Páginas del ERP
    │   ├── services/            # Servicios
    │   └── lib/
    │       └── supabase.ts
    └── migrations/              # (Ya no se usan, usar unified-schema.sql)
```

## 🔄 Diferencias importantes

### Antes (Sistemas Separados):
- ❌ Dos bases de datos diferentes
- ❌ Usuarios duplicados
- ❌ Productos no sincronizados
- ❌ Configuración complicada

### Ahora (Sistema Unificado):
- ✅ Una sola base de datos
- ✅ Login único
- ✅ Productos compartidos
- ✅ Gestión centralizada

## 🚀 Comandos

```bash
# Frontend E-commerce
cd apps/frontend
npm run dev
# http://localhost:3001

# ERP
cd apps/outsiders-erp
npm run dev
# http://localhost:5173
```

## 🆘 Troubleshooting

### "No puedo ver productos en el e-commerce"
Verifica que `is_visible = true`:
```sql
UPDATE products SET is_visible = true WHERE id = 'product_id';
```

### "No puedo iniciar sesión en el ERP"
Tu usuario debe ser ADMIN o VENDEDOR:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

### "Error: relation does not exist"
No ejecutaste el schema unificado. Ve al paso 1.

### "Los productos no tienen stock"
El ERP maneja stock por sucursal con variantes. Para el e-commerce, el campo `stock` en `products` es un resumen global que debes actualizar manualmente o con un trigger.

## 📈 Próximos pasos recomendados

1. **Agregar trigger** para actualizar `products.stock` automáticamente desde `stock` de sucursales
2. **Implementar pasarela de pagos** en el e-commerce (Stripe, MercadoPago)
3. **Agregar sistema de notificaciones** cuando se creen nuevos drops
4. **Dashboard de analytics** para ver ventas consolidadas
5. **Imágenes reales** de productos (usar Supabase Storage)

## 📞 Contacto

Para cualquier duda sobre el sistema, revisa:
- [MIGRACION_SCHEMA_UNIFICADO.md](MIGRACION_SCHEMA_UNIFICADO.md) - Guía de migración
- [README_SUPABASE.md](apps/frontend/README_SUPABASE.md) - Documentación del frontend
- [unified-schema.sql](apps/frontend/supabase/unified-schema.sql) - Schema completo
