# Outsiders Web - Monorepo

Este repositorio contiene dos aplicaciones principales para el sistema Outsiders:

## 📁 Estructura del Proyecto

```
apps/
├── frontend/          # E-commerce público (Next.js)
└── outsiders-erp/     # Sistema ERP interno (Vite + React)
```

## 🌐 Aplicaciones

### Frontend - E-commerce
- **Tecnología**: Next.js 14, React, TypeScript, Tailwind CSS
- **Descripción**: Tienda en línea para clientes
- **Documentación**: [frontend/README.md](./frontend/README.md)

### Outsiders ERP
- **Tecnología**: Vite, React, TypeScript, Tailwind CSS, Supabase
- **Descripción**: Sistema de gestión empresarial interno
- **Documentación**: [outsiders-erp/README.md](./outsiders-erp/README.md)
- **Docs Completas**: [outsiders-erp/docs/](./outsiders-erp/docs/)

## 🚀 Deployment

Ambas aplicaciones están configuradas para deployment en Vercel:

### Frontend
```bash
cd frontend
npm install
npm run build
```

### ERP
```bash
cd outsiders-erp
npm install
npm run build
```

## 📚 Variables de Entorno

Cada proyecto requiere sus propias variables de entorno. Ver los archivos `.env.example` en cada carpeta.

### Frontend
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ERP
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🔧 Desarrollo Local

### Frontend
```bash
cd frontend
npm install
npm run dev
# Abre http://localhost:3000
```

### ERP
```bash
cd outsiders-erp
npm install
npm run dev
# Abre http://localhost:5173
```

## 📦 Base de Datos

Ambos proyectos usan Supabase como backend. Los schemas y migraciones se encuentran en:
- `frontend/supabase/` - Schemas del frontend
- `outsiders-erp/migrations/` - Migraciones del ERP

---

**Última actualización**: Febrero 2026
