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
