# 🏪 OUTSIDERS ERP

Sistema de gestión empresarial (ERP) completo para tienda de ropa, desarrollado con React + TypeScript + Vite + Supabase.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)
![Supabase](https://img.shields.io/badge/Supabase-2.39.3-green.svg)

---

## 📋 Características Principales

### ✅ Gestión Completa
- 🔐 **Autenticación** - Login seguro con Supabase Auth
- 🏢 **Multi-sucursal** - Gestión de múltiples ubicaciones
- 👥 **Roles de usuario** - Admin y Vendedor con permisos diferenciados
- 📦 **Productos** - CRUD completo con imágenes y variantes por talla
- 🛒 **Ventas** - Sistema de carrito con pagos múltiples
- 📊 **Inventario** - Control de stock por sucursal y talla
- ✨ **Drops/Colecciones** - Lanzamientos especiales de productos
- 💰 **Control de Caja** - Apertura, cierre y movimientos
- 📈 **Reportes** - Estadísticas y análisis de ventas

### 💳 Métodos de Pago
- Efectivo
- QR
- Tarjeta
- Mixto (combinación de los anteriores)

---

## 🛠️ Tecnologías

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultra rápido
- **Tailwind CSS** - Estilos utility-first
- **React Router v6** - Navegación
- **Zustand** - Gestión de estado global
- **Lucide React** - Iconos modernos
- **Recharts** - Gráficos y visualización
- **React Hot Toast** - Notificaciones

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL - Base de datos
  - Auth - Autenticación
  - Storage - Almacenamiento de imágenes
  - RLS - Row Level Security

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta de Supabase
- Git

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd outsiders-erp
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1 Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia la URL y la ANON KEY

#### 3.2 Ejecutar el Schema SQL
1. Abre el editor SQL en Supabase Dashboard
2. Ejecuta el archivo `migrations/20251214_outsiders_complete_schema.sql`
3. Esto creará todas las tablas, funciones y políticas RLS

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita `.env` y agrega tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 5. Iniciar Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📁 Estructura del Proyecto

```
outsiders-erp/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Sidebar, Layout
│   │   ├── products/        # Componentes de productos
│   │   ├── sales/           # Componentes de ventas
│   │   ├── drops/           # Componentes de drops
│   │   ├── cash/            # Componentes de caja
│   │   └── ui/              # Componentes UI reutilizables
│   ├── pages/               # Páginas de la aplicación
│   ├── services/            # Servicios de API
│   ├── store/               # Estados globales (Zustand)
│   ├── lib/                 # Utilidades y configuración
│   ├── hooks/               # Custom hooks
│   ├── App.tsx              # Componente principal
│   └── main.tsx             # Entry point
├── migrations/              # Scripts SQL de Supabase
├── public/                  # Assets estáticos
└── package.json
```

---

## 🗄️ Base de Datos

### Tablas Principales

- **branches** - Sucursales
- **users** - Usuarios del sistema
- **products** - Productos
- **product_variants** - Variantes por talla
- **stock** - Inventario por sucursal y variante
- **sales** - Ventas
- **sale_items** - Items de cada venta
- **drops** - Lanzamientos/colecciones
- **drop_products** - Productos en drops
- **cash_registers** - Registros de caja
- **cash_movements** - Movimientos de caja

### Funciones RPC

- `open_cash_register()` - Abrir caja
- `close_cash_register()` - Cerrar caja
- `register_sale_movement()` - Registrar venta en caja
- `get_open_cash_register()` - Obtener caja abierta
- `get_cash_register_summary()` - Resumen de caja
- `get_dashboard_stats()` - Estadísticas del dashboard
- `get_drop_products()` - Productos de un drop
- `get_active_drops()` - Drops activos

---

## 👤 Usuarios de Prueba

Después de ejecutar el schema, puedes crear usuarios manualmente en Supabase Auth y luego agregarlos a la tabla `users`:

```sql
INSERT INTO users (id, name, email, role, branch_id) VALUES
('user-uuid-from-auth', 'Admin', 'admin@outsiders.com', 'admin', 'branch-uuid'),
('user-uuid-from-auth', 'Vendedor', 'vendedor@outsiders.com', 'vendedor', 'branch-uuid');
```

---

## 🎨 Paleta de Colores

```css
Negro Principal: #000000
Blanco: #FFFFFF
Accent (Naranja): #FF6B35
```

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 🔒 Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Políticas de acceso por rol (admin/vendedor)
- ✅ Autenticación segura con Supabase Auth
- ✅ Tokens JWT para sesiones
- ✅ Validaciones client-side y server-side

---

## 🚧 Próximas Características

- [ ] Exportar reportes a PDF/Excel
- [ ] Sistema de códigos de barras
- [ ] Devoluciones y cambios
- [ ] Programa de fidelidad
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Multi-moneda
- [ ] App móvil nativa

---

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo

### Error de autenticación
- Verifica que el schema SQL se ejecutó correctamente
- Revisa que las políticas RLS estén habilitadas

### Imágenes no se cargan
- Verifica que los buckets de Storage están creados en Supabase
- Revisa las políticas de acceso en Storage

---

## 📄 Licencia

© 2024 Outsiders. Todos los derechos reservados.

---

## 👨‍💻 Desarrollo

Desarrollado con ❤️ usando React + TypeScript + Supabase

Para reportar bugs o solicitar features, crea un issue en el repositorio.
