# 🚀 GUÍA RÁPIDA DE CONFIGURACIÓN - OUTSIDERS ERP

## ✅ Credenciales Configuradas

- **URL Supabase:** https://obrsjuqzmllnfmldlgby.supabase.co
- **Usuario UUID:** 77732dc1-f8e7-47b2-acea-cda2bbe0b6d4
- **Archivo .env:** ✅ Creado

---

## 📝 PASOS PARA CONFIGURAR (Orden Exacto)

### Paso 1: Ejecutar Schema Principal

1. Abre tu proyecto Supabase: https://supabase.com/dashboard/project/obrsjuqzmllnfmldlgby
2. En el menú izquierdo, haz clic en **SQL Editor**
3. Haz clic en **New Query**
4. Copia TODO el contenido del archivo: `migrations/20251214_outsiders_complete_schema.sql`
5. Pégalo en el editor
6. Haz clic en **Run** (esquina inferior derecha)
7. ✅ Deberías ver: "Success" con un resumen al final

---

### Paso 2: Crear Usuario en Authentication

1. En el menú izquierdo de Supabase, haz clic en **Authentication**
2. Haz clic en **Users**
3. Haz clic en **Add User** (botón verde arriba a la derecha)
4. Completa el formulario:
   - **Email:** admin@outsiders.com
   - **Password:** admin123 (o el que prefieras)
   - ✅ **IMPORTANTE:** Marca la casilla "Auto Confirm User"
5. Haz clic en **Create User**

---

### Paso 3: Verificar el UUID del Usuario

1. Después de crear el usuario, verás una lista
2. Haz clic en el usuario que acabas de crear
3. Copia el **User UID** que aparece
4. **Debe ser:** `77732dc1-f8e7-47b2-acea-cda2bbe0b6d4`
   - ⚠️ **Si es diferente**, avísame para actualizar el .env

---

### Paso 4: Configurar Perfil del Usuario

1. Vuelve al **SQL Editor**
2. Haz clic en **New Query**
3. Copia el contenido del archivo: `migrations/setup_admin_user.sql`
4. Pégalo en el editor
5. Haz clic en **Run**
6. ✅ Deberías ver los datos del usuario creado

---

### Paso 5: Crear Buckets de Storage (para imágenes)

1. En el menú izquierdo, haz clic en **Storage**
2. Haz clic en **Create a new bucket**

**Bucket 1: products**
- Name: `products`
- ✅ Marca "Public bucket"
- Haz clic en **Create bucket**

**Bucket 2: drops**
- Name: `drops`
- ✅ Marca "Public bucket"
- Haz clic en **Create bucket**

**Bucket 3: banners**
- Name: `banners`
- ✅ Marca "Public bucket"
- Haz clic en **Create bucket**

---

### Paso 6: Configurar Políticas de Storage

Para cada bucket (products, drops, banners), haz lo siguiente:

1. Haz clic en el nombre del bucket
2. Ve a la pestaña **Policies**
3. Haz clic en **New Policy**
4. Selecciona **Get started quickly** y luego **Allow public read access**
5. Haz clic en **Review**
6. Haz clic en **Save policy**

Luego agrega política de INSERT:
1. **New Policy** → **For full customization**
2. Policy name: `Authenticated users can upload`
3. Allowed operation: **INSERT**
4. Target roles: `authenticated`
5. USING expression: `true`
6. WITH CHECK expression: `(bucket_id = 'products')`
   - (Cambia 'products' por 'drops' o 'banners' según el bucket)
7. **Save policy**

---

### Paso 7: Iniciar la Aplicación

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
npm run dev
```

La aplicación se abrirá automáticamente en: http://localhost:3000

---

### Paso 8: Login

1. Ve a http://localhost:3000
2. Inicia sesión con:
   - **Email:** admin@outsiders.com
   - **Password:** admin123 (o el que elegiste)
3. Selecciona una sucursal (hay 3 de ejemplo)
4. ✅ **¡Listo!** Ya estás en el sistema

---

## 🎯 Verificación Rápida

Ejecuta este SQL en Supabase para verificar que todo está bien:

```sql
-- Verificar tablas
SELECT COUNT(*) as total_tablas FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar usuario admin
SELECT * FROM users WHERE role = 'admin';

-- Verificar sucursales
SELECT * FROM branches;

-- Verificar buckets de storage
SELECT * FROM storage.buckets;
```

---

## ❓ Solución de Problemas

### "Missing Supabase environment variables"
✅ El archivo .env ya está creado, solo reinicia el servidor:
```powershell
# Ctrl+C para detener
npm run dev
```

### "Invalid login credentials"
1. Verifica que el usuario existe en Authentication
2. Verifica que ejecutaste el script `setup_admin_user.sql`
3. Verifica que usas el email y password correctos

### "No sucursales disponibles"
1. Verifica que el schema principal se ejecutó correctamente
2. Ejecuta manualmente en SQL Editor:
```sql
INSERT INTO branches (name, address) VALUES
  ('Outsiders Centro', 'Av. Principal 123, Centro');
```

### Error al subir imágenes
1. Verifica que los buckets existen en Storage
2. Verifica que los buckets son públicos
3. Verifica que las políticas están creadas

---

## 📊 Estado del Sistema

- ✅ Proyecto configurado
- ✅ Dependencias instaladas
- ✅ .env creado con credenciales
- ✅ Schema SQL listo para ejecutar
- ✅ Script de usuario admin listo
- ⏳ Pendiente: Ejecutar SQL en Supabase
- ⏳ Pendiente: Crear usuario en Authentication
- ⏳ Pendiente: Crear buckets de Storage

---

## 🎉 Siguiente Paso

**Ejecuta el schema SQL en Supabase** (Paso 1) y luego sigue los demás pasos en orden.

¿Necesitas ayuda con algún paso? ¡Avísame!
