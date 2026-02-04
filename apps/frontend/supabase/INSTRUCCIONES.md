# 🚀 INSTALACIÓN COMPLETA - SIN ERRORES

## 📋 Pasos para configurar tu base de datos desde cero

### PASO 1: Limpiar la base de datos actual en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Ve a **SQL Editor**
3. Copia y pega TODO el contenido de `schema-completo-sin-errores.sql`
4. Click en **RUN** o presiona `Ctrl + Enter`

**Tiempo estimado:** 30 segundos

---

### PASO 2: Crear las funciones del ERP

1. En el mismo **SQL Editor de Supabase**
2. Abre el archivo `funciones-erp.sql`
3. Copia y pega TODO el contenido
4. Click en **RUN**

Esto creará 5 funciones necesarias para el dashboard:
- `get_sales_stats` - Estadísticas de ventas
- `get_top_products` - Productos más vendidos
- `update_stock` - Actualizar inventario
- `register_sale_movement` - Movimientos de caja
- `transfer_stock` - Transferencias entre sucursales

**Tiempo estimado:** 10 segundos

---

### PASO 3: (Opcional) Agregar tabla drop_products

Si quieres usar la funcionalidad completa de drops con productos asociados:

1. Abre el archivo `agregar-drop-products.sql`
2. Copia y pega el contenido
3. Click en **RUN**

**Tiempo estimado:** 5 segundos

---

### PASO 4: Verificar que todo se creó correctamente

Al final de ambos scripts verás consultas de verificación que mostrarán:

✅ **15 tablas creadas** con RLS habilitado
✅ **Múltiples políticas RLS** sin errores de recursión
✅ **1 trigger** para auto-crear perfiles de usuario
✅ **1 sucursal principal** creada
✅ **5 funciones SQL** para el ERP

Si ves errores, cópialos y dímelo para ayudarte.

---

### PASO 5: Registrar tu cuenta de administrador

1. **Inicia el frontend:**
   ```powershell
   cd apps/frontend
   npm run dev
   ```

2. **Abre tu navegador:** http://localhost:3001

3. **Registra una nueva cuenta:**
   - Ve a la página de registro/login
   - Usa un email válido (ej: admin@outsiders.com)
   - Crea una contraseña segura
   - Click en "Registrarse"

4. **Confirma tu email** (si Supabase te envió un correo de confirmación)

---

### PASO 6: Convertir tu cuenta en ADMIN

1. Regresa a **Supabase SQL Editor**
2. Abre el archivo `crear-usuario-admin.sql`
3. **REEMPLAZA** `'TU_EMAIL@example.com'` con el email que usaste (en TODAS las líneas que lo mencionen)
4. Ejecuta el script completo
5. Verás tu perfil actualizado con `role = 'ADMIN'`

---

### PASO 7: Iniciar el ERP y probar

1. **Inicia el ERP:**
   ```powershell
   cd apps/outsiders-erp
   npm run dev
   ```

2. **Abre tu navegador:** http://localhost:5173

3. **Inicia sesión:**
   - Usa el mismo email y contraseña que registraste
   - Deberías poder acceder sin errores

---

## 🔑 Configuración de API Keys

Tus archivos `.env` ya están correctamente configurados:

### Frontend (.env.local):
```env
NEXT_PUBLIC_SUPABASE_URL=https://bzsnyvcetqvinlrbyapn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_KlPBKlcV6wGResMa6LSNkw_JPg6YoxY
```

### ERP (.env):
```env
VITE_SUPABASE_URL=https://bzsnyvcetqvinlrbyapn.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_KlPBKlcV6wGResMa6LSNkw_JPg6YoxY
```

**Nota:** La "publishable API key" es la misma que la "anon key" - es la clave pública que puedes usar en el frontend sin problemas.

---

## ✅ Verificación Final

Después de completar todos los pasos, deberías poder:

- ✅ Registrarte e iniciar sesión en el e-commerce (localhost:3001)
- ✅ Iniciar sesión en el ERP (localhost:5173)
- ✅ Ver y gestionar productos
- ✅ Ver y gestionar drops
- ✅ Acceder a todas las funcionalidades del ERP sin errores de recursión

---

## 🐛 Solución de Problemas

### Error: "infinite recursion detected"
- ✅ **SOLUCIONADO** - El nuevo schema no tiene políticas recursivas

### Error: "Invalid credentials"
- Verifica que usaste el email y contraseña correctos
- Confirma tu email si Supabase te lo pidió

### Error: "User not found" en el ERP
- Ejecuta el script `crear-usuario-admin.sql`
- Verifica que tu role sea 'ADMIN' con: `SELECT * FROM public.users WHERE email = 'TU_EMAIL'`

### Error 404: "Could not find function get_sales_stats"
- ✅ **SOLUCIONADO** - Ejecuta el script `funciones-erp.sql`

### Error 406: "Not Acceptable" en consultas
- Esto puede ser un problema de configuración de headers
- Reinicia el servidor del ERP después de ejecutar todos los scripts

### No puedo ver la tabla users
- ✅ **SOLUCIONADO** - Ahora todos los usuarios autenticados pueden ver la tabla users sin recursión

---

## 📁 Archivos Creados

1. **schema-completo-sin-errores.sql** - Schema completo sin problemas de recursión
2. **funciones-erp.sql** - Funciones SQL necesarias para el ERP
3. **crear-usuario-admin.sql** - Script para convertir tu cuenta en admin
4. **INSTRUCCIONES.md** - Este archivo con todos los pasos

---

## 💡 Diferencias clave vs versión anterior

1. **Sin recursión:** Las políticas RLS no consultan la tabla users dentro de las políticas de users
2. **Más permisivas:** Para desarrollo, las políticas son más simples y permiten a usuarios autenticados acceder a más datos
3. **Mejor trigger:** El trigger handle_new_user() crea automáticamente el perfil cuando te registras
4. **Índices optimizados:** Mejor rendimiento en consultas frecuentes

---

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. Crear productos desde el ERP
2. Configurar drops
3. Probar el flujo completo de compra en el e-commerce
4. Configurar el inventario por sucursales
5. Realizar ventas desde el ERP

¡Todo debería funcionar sin errores de recursión! 🎉
