# Instrucciones de configuración

## 1. Configurar Supabase

### Crear cuenta y proyecto
1. Ve a https://supabase.com
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Copia tu **Project URL** y **anon/public API key**

### Ejecutar el schema SQL
1. En tu dashboard de Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega todo el contenido de `apps/frontend/supabase/schema.sql`
4. Ejecuta el script (Run)

Esto creará:
- ✅ Todas las tablas necesarias
- ✅ Políticas de seguridad (RLS)
- ✅ Triggers automáticos
- ✅ 8 productos de ejemplo

## 2. Configurar variables de entorno

Crea un archivo `.env.local` en `apps/frontend/`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 3. Instalar dependencias

```bash
cd apps/frontend
npm install
```

## 4. Ejecutar el proyecto

```bash
npm run dev
```

Abre http://localhost:3001

## ¿Qué cambió?

✅ **Backend eliminado**: Ya no necesitas el servidor NestJS  
✅ **Supabase como backend**: Base de datos, autenticación y APIs  
✅ **Frontend actualizado**: Ahora se comunica directamente con Supabase  
✅ **Autenticación integrada**: Sistema completo de login/registro  
✅ **RLS habilitado**: Seguridad a nivel de base de datos  

## Prueba las funcionalidades

1. **Ver productos**: La página principal muestra los productos
2. **Registrarse**: Clic en "ingresar" → "¿No tienes cuenta? Regístrate"
3. **Agregar al carrito**: Requiere estar autenticado
4. **Ver carrito**: Clic en el icono del carrito

## Backend de NestJS

El directorio `apps/backend/` ya no es necesario y puede ser eliminado o archivado.
