# OUTSIDERS - E-commerce Streetwear

> Urban uniforms for the restless

E-commerce moderno para ropa streetwear construido con Next.js y Supabase.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel (Frontend)

## 📦 Estructura del Proyecto

```
├── apps/
│   ├── frontend/           # Next.js App
│   └── outsiders-erp/      # Sistema ERP interno
├── SETUP_SUPABASE.md       # Guía de configuración
└── README.md               # Este archivo
```

## 🎯 Inicio Rápido

Ver [SETUP_SUPABASE.md](SETUP_SUPABASE.md) para instrucciones detalladas de configuración.

### Pasos básicos:

1. **Clonar el repositorio**
2. **Configurar Supabase** (ver SETUP_SUPABASE.md)
3. **Configurar variables de entorno**
4. **Instalar y ejecutar**:

```bash
cd apps/frontend
npm install
npm run dev
```

## 📱 Aplicaciones

### Frontend E-commerce
- Catálogo de productos
- Sistema de carrito de compras
- Autenticación de usuarios
- Gestión de órdenes

### ERP
Sistema interno para gestión de:
- Inventario
- Ventas
- Caja
- Productos y Drops

## 📝 Documentación

- [Configuración de Supabase](SETUP_SUPABASE.md)
- [Documentación del Frontend](apps/frontend/README_SUPABASE.md)
- [Documentación del ERP](apps/outsiders-erp/README.md)

## 🔒 Seguridad

- Row Level Security (RLS) habilitado
- Autenticación con Supabase Auth
- Políticas de acceso por rol (USER/ADMIN)

## 📄 Licencia

Propietario - Todos los derechos reservados

# Outsiders Streetwear

Tienda de ropa streetwear con estilo urbano y juvenil.

## 🚀 Tecnologías

- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: NestJS + Prisma
- **Base de datos**: PostgreSQL

## 📦 Instalación

### Frontend
```bash
cd apps/frontend
npm install
npm run dev
```

### Backend
```bash
cd apps/backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

## 🎨 Características

- Diseño moderno y urbano con colores de marca
- Sección de productos con efecto hover de imágenes
- Sección de DROPS (lanzamientos exclusivos)
- Carrito de compras
- Sistema de gestión de productos

## 🌐 Deploy

El frontend está desplegado en Vercel.

## 🔧 Variables de Entorno

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=tu_url_del_backend
```

### Backend (.env)
```
DATABASE_URL=tu_conexión_postgresql
```

## 📝 Licencia

Proyecto privado - Outsiders Streetwear
