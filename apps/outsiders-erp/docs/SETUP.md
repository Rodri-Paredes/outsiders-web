# 📝 GUÍA DE CONFIGURACIÓN PASO A PASO

## ✅ Pasos Completados

- [x] Proyecto inicializado con Vite + React + TypeScript
- [x] Dependencias instaladas
- [x] Tailwind CSS configurado
- [x] Estructura de carpetas creada
- [x] Sistema de autenticación implementado
- [x] Layout y navegación creados
- [x] Componentes UI base creados

---

## 🔧 Configuración Necesaria

### 1. Configurar Supabase (IMPORTANTE)

#### 1.1 Crear Proyecto en Supabase

1. Ve a https://supabase.com
2. Haz clic en "New Project"
3. Completa los datos:
   - **Name**: Outsiders ERP
   - **Database Password**: [guarda esta contraseña]
   - **Region**: [la más cercana a ti]
4. Espera a que el proyecto se cree (2-3 minutos)

#### 1.2 Obtener Credenciales

1. En el dashboard de tu proyecto, ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL** (ejemplo: https://xxxxx.supabase.co)
   - **anon public** key (la clave que empieza con "eyJ...")

#### 1.3 Crear archivo .env

1. En la raíz del proyecto, crea un archivo llamado `.env`
2. Pega esto y reemplaza con tus valores:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...tu-clave-completa-aqui
```

#### 1.4 Ejecutar el Schema SQL

1. En Supabase Dashboard, ve a **SQL Editor**
2. Haz clic en **New Query**
3. Abre el archivo `migrations/20251214_outsiders_complete_schema.sql`
4. Copia TODO el contenido
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **Run** (esquina inferior derecha)
7. Deberías ver: "Success. No rows returned"

**IMPORTANTE:** Este paso crea toda la base de datos, funciones y políticas de seguridad.

---

### 2. Crear Datos Iniciales

#### 2.1 Crear una Sucursal

En el SQL Editor de Supabase, ejecuta:

```sql
INSERT INTO branches (name, address) VALUES
('Sucursal Principal', 'Av. Principal #123, Ciudad');
```

Copia el ID de la sucursal que se creó (aparecerá en los resultados).

#### 2.2 Crear Usuario Administrador

1. En Supabase Dashboard, ve a **Authentication** → **Users**
2. Haz clic en **Add User**
3. Completa:
   - **Email**: admin@outsiders.com
   - **Password**: admin123 (cámbiala después)
   - **Auto Confirm User**: ✅ (marca la casilla)
4. Haz clic en **Create User**
5. Copia el **User UID** que aparece

#### 2.3 Vincular Usuario con Perfil

En el SQL Editor, ejecuta (reemplaza los valores):

```sql
INSERT INTO users (id, name, email, role, branch_id) VALUES
('user-uid-copiado', 'Administrador', 'admin@outsiders.com', 'admin', 'branch-id-copiado');
```

---

### 3. Crear Buckets de Storage (para imágenes)

1. En Supabase Dashboard, ve a **Storage**
2. Haz clic en **New Bucket**
3. Crea estos buckets:

**Bucket 1: products**
- Name: `products`
- Public: ✅ (marca la casilla)

**Bucket 2: drops**
- Name: `drops`
- Public: ✅

**Bucket 3: banners**
- Name: `banners`
- Public: ✅

---

### 4. Configurar Políticas de Storage

Para cada bucket creado, necesitas agregar políticas de acceso:

1. Haz clic en el bucket
2. Ve a **Policies**
3. Haz clic en **New Policy**
4. Selecciona **For full customization**
5. Agrega estas 3 políticas:

**Política 1: SELECT (lectura pública)**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');
-- Repite para 'drops' y 'banners'
```

**Política 2: INSERT (solo autenticados)**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');
-- Repite para 'drops' y 'banners'
```

**Política 3: DELETE (solo autenticados)**
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');
-- Repite para 'drops' y 'banners'
```

---

### 5. Verificar Configuración

Ejecuta este comando para verificar que todo está bien:

```bash
npm run dev
```

La aplicación debería abrir en http://localhost:3000

---

## 🎯 Prueba de la Aplicación

### Login
1. Ve a http://localhost:3000
2. Deberías ver la página de login
3. Ingresa:
   - Email: admin@outsiders.com
   - Password: admin123
4. Haz clic en "Iniciar Sesión"

### Selección de Sucursal
1. Deberías ver la sucursal que creaste
2. Haz clic en ella

### Dashboard
1. Deberías entrar al sistema y ver el menú lateral
2. Puedes navegar entre las diferentes secciones

---

## 🔨 Próximos Pasos de Desarrollo

Ahora que la base está lista, puedes continuar con:

1. **Gestión de Productos** - Crear, editar, eliminar productos
2. **Sistema de Ventas** - Implementar el carrito y proceso de venta
3. **Control de Inventario** - Gestión de stock
4. **Sistema de Drops** - Crear colecciones especiales
5. **Control de Caja** - Apertura y cierre de caja
6. **Dashboard y Reportes** - Estadísticas y gráficos

---

## ❓ Solución de Problemas Comunes

### "Missing Supabase environment variables"
- ✅ Verifica que el archivo `.env` existe en la raíz
- ✅ Verifica que las variables tienen el formato correcto
- ✅ Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)

### "Invalid login credentials"
- ✅ Verifica que el usuario existe en Authentication
- ✅ Verifica que el perfil existe en la tabla `users`
- ✅ Verifica que el email y password coinciden

### "No sucursales disponibles"
- ✅ Verifica que insertaste al menos una sucursal
- ✅ Verifica que el schema SQL se ejecutó correctamente

### Imágenes no se cargan
- ✅ Verifica que los buckets de Storage existen
- ✅ Verifica que los buckets son públicos
- ✅ Verifica que las políticas de acceso están creadas

---

## 📞 Soporte

Si tienes problemas con la configuración:

1. Verifica que todos los pasos se ejecutaron en orden
2. Revisa la consola del navegador (F12) en busca de errores
3. Revisa la terminal en busca de errores de compilación
4. Verifica los logs de Supabase en el Dashboard

---

**¡Listo! Tu ERP Outsiders está configurado y funcionando! 🎉**
