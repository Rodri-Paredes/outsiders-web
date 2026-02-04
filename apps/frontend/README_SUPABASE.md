# Migración a Supabase - Outsiders E-commerce

Este proyecto ha sido migrado para usar **Supabase** como backend completo, eliminando la necesidad del backend de NestJS con Prisma.

## 🚀 Configuración

### 1. Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Guarda las credenciales:
   - **Project URL** (SUPABASE_URL)
   - **anon public key** (SUPABASE_ANON_KEY)

### 2. Configurar la base de datos

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Ejecuta el script SQL que se encuentra en: `apps/frontend/supabase/schema.sql`
3. Este script creará:
   - Las tablas necesarias (users, products, carts, cart_items, orders, order_items)
   - Las políticas de seguridad (RLS)
   - Los triggers automáticos
   - Datos de ejemplo (8 productos)

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en `apps/frontend/` con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 4. Instalar dependencias

```bash
cd apps/frontend
npm install
```

### 5. Ejecutar el proyecto

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3001](http://localhost:3001)

## 📁 Estructura del proyecto

```
apps/frontend/
├── src/
│   ├── app/                    # Páginas de Next.js
│   │   ├── page.tsx           # Página principal
│   │   ├── layout.tsx         # Layout con providers
│   │   ├── auth/              # Página de autenticación
│   │   ├── cart/              # Carrito de compras
│   │   └── drops/             # Drops/productos
│   ├── components/            # Componentes React
│   │   ├── CartProvider.tsx  # Context del carrito
│   │   ├── Navbar.tsx        # Barra de navegación
│   │   └── ProductList.tsx   # Lista de productos
│   ├── contexts/              # Contexts de React
│   │   └── AuthContext.tsx   # Context de autenticación
│   ├── lib/                   # Utilidades
│   │   ├── supabase.ts       # Cliente de Supabase
│   │   └── database.types.ts # Tipos de TypeScript
│   └── services/              # Servicios de API
│       ├── auth.service.ts   # Autenticación
│       ├── cart.service.ts   # Carrito
│       ├── orders.service.ts # Órdenes
│       └── products.service.ts # Productos
└── supabase/
    └── schema.sql             # Schema de la base de datos
```

## 🔐 Autenticación

El sistema usa **Supabase Auth** para manejar usuarios:

- **Sign Up**: Registro de nuevos usuarios
- **Sign In**: Inicio de sesión con email/contraseña
- **Sign Out**: Cerrar sesión
- **Session Management**: Manejo automático de sesiones

Las sesiones se persisten automáticamente en localStorage.

## 🛒 Funcionalidades

### Productos
- Listado de productos con imágenes
- Filtrado y búsqueda (próximamente)
- Stock en tiempo real

### Carrito
- Agregar productos al carrito (requiere autenticación)
- Actualizar cantidades
- Eliminar productos
- Contador de items en navbar

### Órdenes
- Crear órdenes desde el carrito
- Ver historial de órdenes
- Estados de orden (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)

### Administración
- Los usuarios con rol ADMIN pueden:
  - Crear, editar y eliminar productos
  - Ver todas las órdenes
  - Actualizar estados de órdenes

## 🔒 Seguridad (Row Level Security)

Las políticas RLS garantizan que:

- Los usuarios solo vean sus propios carritos y órdenes
- Solo los administradores pueden modificar productos
- Todos pueden ver productos (lectura pública)
- Los usuarios autenticados pueden crear órdenes

## 🎨 Personalización

Los colores principales del tema son:
- **Verde oscuro**: `#2d5f5d`
- **Dorado**: `#d4a574`

Puedes modificarlos en `tailwind.config.ts`

## 🚫 Backend eliminado

El backend de NestJS/Prisma (`apps/backend/`) ya no es necesario y puede ser eliminado. Toda la lógica ahora está en:
- **Supabase Database**: Base de datos PostgreSQL
- **Supabase Auth**: Autenticación
- **Supabase RLS**: Seguridad a nivel de fila
- **Frontend Services**: Lógica de negocio en el cliente

## 📝 Próximos pasos

1. Personalizar los productos desde el panel de Supabase
2. Implementar pasarela de pagos (Stripe, MercadoPago, etc.)
3. Agregar administración de usuarios desde el frontend
4. Implementar notificaciones por email
5. Agregar imágenes reales de productos

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"
Asegúrate de tener el archivo `.env.local` con las variables correctas.

### Error: "Please sign in to add items to cart"
El usuario debe estar autenticado para agregar productos al carrito.

### Los productos no se cargan
Verifica que hayas ejecutado el script SQL en Supabase y que las políticas RLS estén activas.

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
