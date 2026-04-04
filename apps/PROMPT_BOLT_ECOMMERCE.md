# OUTSIDERS - E-COMMERCE STREETWEAR

Tienda online streetwear premium con estética dark minimalista y checkout directo por WhatsApp.

**STACK:** Vite + React 18 + TypeScript + Tailwind + Zustand + Supabase + Framer Motion + React Hot Toast

**CHECKOUT:** SIN login. Carrito local (Zustand + localStorage). Botón WhatsApp genera mensaje con pedido completo y abre wa.me/{NUMERO}.

## ESTÉTICA DARK PREMIUM

**Variables CSS:**
```css
--black: #000000
--dark-bg: #0A0A0A
--dark-card: #141414
--dark-border: #1F1F1F
--gray-dark: #1A1A1A
--gray-medium: #666666
--gray-light: #999999
```

**Tipografía Premium:**
- Fuente: System fonts (-apple-system, Segoe UI, Roboto)
- Títulos: font-light (300), tracking-tight, letter-spacing: -0.02em
- H1: text-5xl md:text-7xl lg:text-8xl
- H2: text-3xl md:text-5xl lg:text-6xl
- Subtítulos: text-xs, tracking-[0.3em], uppercase
- Separador: h-px w-24 bg-white/30

**UI Principles:**
- Espaciado: section-padding (py-16 md:py-24 lg:py-32)
- Container: max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12
- Hover: scale-[1.02] con transition-smooth
- Bordes: border-white/10
- Botones: uppercase, tracking-widest, px-12 py-4
- Inputs: bg-dark-card, border border-white/10, focus:border-white
- Scrollbar: custom dark (width 10px, bg dark-card)

## PÁGINAS

### HOME
1. **Hero Fullscreen:** 
   - Imagen fondo h-screen con Image component (fill, object-cover, priority)
   - Overlay: gradient from-black/50 via-black/30 to-black
   - Título centrado: "OUTSIDERS" text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter
   - Separador: h-px w-24 bg-white mx-auto
   - Subtítulo: "Urban Streetwear Collection" text-sm tracking-[0.3em] uppercase
   - 2 botones: "Shop Now" (bg-white text-black) + "View Collection" (border outline)
   - Scroll indicator: absolute bottom-10, animate-bounce, línea vertical

2. **Featured Drops:**
   - Fondo: bg-black
   - Título centrado: "Latest Drops" con separador
   - Grid 3 drops: grid-cols-1 md:grid-cols-3 gap-6
   - Cards: h-[600px], group, hover:scale-[1.02] duration-500
   - Overlay gradient: from-transparent to-black/80
   - Contenido: absolute bottom-0, p-8, hover:translate-y-[-10px]

3. **Featured Banner:**
   - Layout asimétrico: imagen grande + texto
   - Grid 2 cols: imagen 60% + contenido 40%
   - Altura min-h-[600px]
   - Diseño alternativo invertido

4. **Products Grid:**
   - Título: "Shop the Collection"
   - Grid 4 cols: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
   - Cards: aspect-square imagen, hover overlay, badge "NEW" si aplica
   - Botón: "View All Products" al final

5. **Features:**
   - Fondo: bg-dark-bg
   - Grid 4 features: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
   - Cada uno: emoji grande (text-5xl), título, descripción
   - Hover: icon scale-110
   - Features: Premium Quality ✨, Worldwide Shipping 🌍, Limited Editions 🔥, Secure Payment 🔒

6. **Newsletter:**
   - Fondo: bg-black
   - Border top/bottom: border-white/10
   - Título: "Newsletter" text-5xl md:text-7xl con separador
   - Form horizontal: input flex-1 + button
   - Input: bg-dark-card, placeholder-gray-medium
   - Button: bg-white text-black, disabled states

### PRODUCTS
- Sidebar filtros (categorías, precio, tallas)
- Grid productos con búsqueda y ordenamiento
- Paginación

### PRODUCT DETAIL
- Grid 2 cols: galería imágenes | detalles
- Selector talla (requerido) + cantidad
- Stock disponible
- Botón "Add to Cart" grande
- Productos relacionados

### CART
- Lista items: thumbnail, talla, precio, +/-, eliminar
- Resumen sticky: subtotal, total
- **Botón verde WhatsApp:** genera mensaje y abre `https://wa.me/591XXXXXXXX?text=MENSAJE`
- Si vacío: mensaje + "Continue Shopping"

### DROPS
- Hero reducido con gradient
- Grid drops con filtros (Activo/Finalizado)
- Badge colores por estado
- Drop individual: banner + productos del drop

## COMPONENTES CLAVE

### NAVBAR (Fixed top, z-50)
**Banner superior:**
- bg-white text-black py-2
- Texto: "Worldwide Shipping" text-xs tracking-wider uppercase

**Nav principal:**
- Scrolled state: bg-black/95 backdrop-blur-md border-b border-white/10
- Height: h-16 md:h-20
- Layout: Left (nav links) | Center (logo absolute centered) | Right (actions)
- Logo: "OUTSIDERS" text-xl md:text-2xl tracking-[0.25em] uppercase
- Links: text-xs tracking-widest uppercase, hover:text-gray-light
- Cart: Badge con contador (bg-white text-black w-5 h-5)
- Mobile: Hamburger menu icon

### PRODUCT CARD
- Container: group, bg-dark-card, overflow-hidden
- Imagen: aspect-square, object-cover
- Overlay hover: absolute inset-0 bg-black/40 opacity-0 hover:opacity-100
- Badge: "NEW" o "DROP" - absolute top-4 right-4, bg-white text-black px-3 py-1 text-[10px]
- Contenido: p-4
- Nombre: text-sm font-light tracking-wide mb-2
- Precio: text-lg font-light mb-4
- Botón: "Add to Cart" - opacity-0 group-hover:opacity-100, transform translate-y-2 group-hover:translate-y-0

### CART DRAWER
- Fixed right-0 top-0 h-full w-full md:w-[400px]
- Transform: translate-x-full (cerrado), translate-x-0 (abierto)
- Backdrop: fixed inset-0 bg-black/80 backdrop-blur-sm
- Header: "Your Cart" + botón cerrar
- ItemgenerateMessage = (items, total) => {
  const header = "Hola! Quiero hacer el siguiente pedido:\n\n";
  const itemsList = items.map(i => 
    `• ${i.name} (${i.size}) x${i.quantity} - Bs. ${i.price * i.quantity}`
  ).join('\n');
  const footer = `\n\nTotal: Bs. ${total}\n\nGracias!`;
  return encodeURIComponent(header + itemsList + footer);
};
const whatsappUrl = `https://wa.me/591XXXXXXXX?text=${generateMessage(cartItems, total)}`;
window.open(whatsappUrl, '_blank');
// Opcional: clearCart() después de enviar
```

**BASE DE DATOS SUPABASE:**

Tablas:
```sql
-- products
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  images TEXT[], -- Array de URLs
  is_visible BOOLEAN DEFAULT true,
  drop_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- drops
CREATE TABLE drops (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  launch_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('ACTIVO','INACTIVO','FINALIZADO')),
  is_featured BOOLEAN DEFAULT false,
  image_url TEXT,
  banner_url TEXT
);

-- drop_products
CREATE TABLE drop_products (
  id UUID PRIMARY KEY,
  drop_id UUID REFERENCES drops(id),
  product_id UUID REFERENCES products(id),
  is_featured BOOLEAN,
  sort_order INTEGER
);

-- newsletter_subscribers
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

RLS: Lectura pública en products/drops. NO hay users, orders, carts.

**ANIMACIONES:**
- Framer Motion: page transitions, cart drawer slideIn
- CSS: @keyframes fadeInUp para hero
- Hover: transition-all duration-300 cubic-bezier(0.4,0,0.2,1)
- Scroll: smooth behavior

**RESPONSIVE:**
- Breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px
- Grids: col-1 → md:col-2 → lg:col-3/4
- Navbar: hamburger mobile, full desktop
- Cart drawer: bottom slide mobile, right slide desktop
- Typography: responsive (text-sm md:text-base lg:text-lg)
- Botón WhatsApp: siempre visible, size adaptive

**EXTRAS ESENCIALES:**
- Footer: bg-dark-bg, links, redes sociales, copyright
- Loading states: skeleton con animate-pulse
- Error boundaries y toast notifications
- Image optimization con next/image o similar
- Lazy loading para imágenes y productos
- Favicon y metadata SEO

Código TypeScript strict, componentes modulares, custom hooks, manejo de errores robusto
## FUNCIONALIDADES CORE

**PRODUCTOS (Supabase público):**
- Tabla `products`: id, name, description, category, price, stock, image_url, images[], videos[], is_visible, drop_id, colors[], materials[], tags[], rating, reviews_count
- Solo is_visible=true
- Filtros múltiples: categoría, precio, talla, color, material, disponibilidad
- Búsqueda avanzada: nombre, descripción, tags, debounce 300ms
- Ordenamiento: precio (asc/desc), más nuevo, popularidad, rating
- Paginación: 12 items por página
- Vista: grid/list toggle

**CARRITO (Zustand local):**
```typescript
{items: [{id, productId, name, price, size, quantity, image_url, color?}], total, discount, coupon?}
```
- Persist localStorage key: 'outsiders-cart'
- addItem, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon
- Talla requerida, color opcional
- Validación stock antes de agregar
- Auto-sincronización entre tabs (storage event)

**WISHLIST (Zustand local):**
```typescript
{items: [{productId, name, price, image_url, addedAt}]}
```
- Persist localStorage key: 'outsiders-wishlist'
- toggleWishlist, clearWishlist, isInWishlist
- Ícono corazón en product cards
- Página /wishlist dedicada

**HISTORIAL DE PEDIDOS (localStorage):**
```typescript
{orders: [{id, items, total, date, status: 'sent', whatsappMessage}]}
```
- Guardar pedido después de enviar WhatsApp
- Ver historial en /orders
- Re-order functionality (agregar items al carrito)

**PRODUCTOS VISTOS RECIENTEMENTE:**
```typescript
{recentlyViewed: [{productId, viewedAt}]} // max 10
```
- Actualizar al visitar product detail
- Mostrar en homepage o sidebar
- localStorage key: 'outsiders-recent'

**DROPS (Supabase):**
- Tabla `drops`: id, name, description, launch_date, end_date, status, is_featured, image_url, banner_url, stock_total, stock_sold
- Tabla `drop_products`: relación productos con sort_order
- Countdown timer para próximos drops
- Notificación cuando drop está activo (toast)
- Progress bar de stock vendido

**CHECKOUT WHATSAPP:**
```javascript
const msg = `🔥 *OUTSIDERS - Nuevo Pedido*\n\n${cartItems.map(i => 
  `• ${i.name}\n  Talla: ${i.size}${i.color ? ` | Color: ${i.color}` : ''}\n  Cantidad: ${i.quantity} x Bs. ${i.price} = Bs. ${i.price * i.quantity}`
).join('\n\n')}${coupon ? `\n\n💰 Cupón: ${coupon} (-Bs. ${discount})` : ''}\n\n*Total: Bs. ${total}*\n\n📦 Esperando confirmación`;
window.open(`https://wa.me/591XXXXXXXX?text=${encodeURIComponent(msg)}`);
// Guardar en historial
saveOrder({id: generateId(), items, total, date: new Date(), status: 'sent', whatsappMessage: msg});
// Limpiar carrito
clearCart();
```

**CUPONES DE DESCUENTO:**
- Tabla `coupons`: code, discount_type ('percent'|'fixed'), discount_value, min_purchase, expires_at, max_uses, uses_count, is_active
- Input en cart page para aplicar
- Validación: activo, no expirado, usos disponibles, monto mínimo
- Toast con feedback

**SISTEMA DE REVIEWS (Supabase):**
- Tabla `reviews`: id, product_id, name, rating (1-5), comment, created_at, is_approved
- Solo is_approved=true público
- Agregar review desde product detail (sin login, solo nombre)
- Promedio rating en product cards
- Filtrar por estrellas

**COMPARADOR DE PRODUCTOS:**
```typescript
{compareList: [productId, productId]} // max 4
```
- Checkbox en product cards
- Floating bar con contador
- Página /compare con tabla comparativa: imagen, nombre, precio, talla, stock, características
- localStorage key: 'outsiders-compare'

**LOOKBOOK/COLLECTIONS:**
- Tabla `lookbooks`: id, name, description, image_url, products[], is_featured
- Página /lookbook con galería estilo Pinterest
- Click en look → ver productos del outfit

**BLOG STREETWEAR:**
- Tabla `blog_posts`: id, title, slug, content, excerpt, cover_image, author, published_at, tags[], views
- Página /blog con grid de posts
- Post detail con rich content
- Related posts al final

**SIZE GUIDE:**
- Tabla `size_guides`: id, category, measurements (JSON con tallas y medidas)
- Modal en product detail "Guía de Tallas"
- Tabla con cm/inches toggle

**QUICK VIEW:**
- Modal con imagen, nombre, precio, tallas disponibles, agregar al carrito
- Trigger: botón "ojo" en product card hover
- No redirige, quick add to cart

**GALERÍA DE IMÁGENES AVANZADA:**
- Zoom on hover (2x scale)
- Lightbox con navegación
- Thumbnails laterales
- Videos autoplay en hover

**NOTIFICACIONES (Toast):**
- Stock bajo: "¡Solo quedan X unidades!"
- Producto agregado: "✓ Agregado al carrito"
- Wishlist: "♥ Agregado a favoritos"
- Cupón aplicado: "💰 Cupón aplicado: -Bs. X"
- Error: "⚠ Producto sin stock"

**COMPARTIR PRODUCTOS:**
- Botones: WhatsApp, Facebook, Twitter, Copy link
- Open Graph meta tags para previews
- Share API nativo en mobile

**BÚSQUEDA INTELIGENTE:**
- Sugerencias en tiempo real (mostrar 5 productos)
- Destacar texto coincidente
- Categorías sugeridas
- Búsquedas populares
- Historial de búsquedas (localStorage)

**FILTROS AVANZADOS:**
- Multi-select: categorías, colores, tallas
- Range slider para precio
- Toggle: en stock, en oferta, nuevos
- Badge con contador de filtros activos
- Botón "Limpiar filtros"

**PROGRAMA DE REFERIDOS:**
- Generar link único (query param ?ref=CODE)
- localStorage track referrer
- Mostrar en footer: "Comparte y gana"

**MULTI-IDIOMA:**
- Toggle ES/EN en navbar
- localStorage key: 'outsiders-lang'
- Context con traducciones
- Objeto de traducciones por página

**GIFT CARDS:**
- Página /gift-cards
- Montos predefinidos: 100, 200, 500, 1000 Bs
- Mensaje personalizado
- Envío por WhatsApp con código

**CUENTA REGRESIVA DROPS:**
```typescript
const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(drop.launch_date));
// Formato: "2d 5h 30m 15s"
```

**ANIMACIONES AVANZADAS:**
- Scroll reveal: fade-in-up para sections
- Parallax en hero images
- Cart counter badge: scale pulse en cambio
- Loading skeleton con shimmer effect
- Page transitions con Framer Motion

**PERFORMANCE:**
- Image lazy loading con Intersection Observer
- Virtual scrolling para grids largos
- Prefetch hover en links
- Service worker para offline
- CDN para imágenes

**BASE DE DATOS COMPLETA:**
```sql
-- products (expandido)
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  images TEXT[],
  videos TEXT[],
  colors TEXT[],
  materials TEXT[],
  tags TEXT[],
  sizes TEXT[],
  is_visible BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  drop_id UUID,
  rating DECIMAL(3,2),
  reviews_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percent','fixed')),
  discount_value DECIMAL(10,2),
  min_purchase DECIMAL(10,2),
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT false
);

-- lookbooks
CREATE TABLE lookbooks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  products UUID[],
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER
);

-- blog_posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  tags TEXT[],
  views INTEGER DEFAULT 0
);

-- size_guides
CREATE TABLE size_guides (
  id UUID PRIMARY KEY,
  category TEXT NOT NULL,
  measurements JSONB
);
```

**RESPONSIVE:** Mobile-first, touch gestures, swipe cart drawer, bottom navigation mobile, hamburger menu, grids adaptativos, botón WhatsApp flotante siempre visible, modals fullscreen mobile.

Código limpio TypeScript strict, componentes modulares reutilizables, custom hooks (useDebounce, useLocalStorage, useMediaQuery, useIntersectionObserver), manejo errores con boundaries, loading states skeletons, testing con Vitest, diseño dark profesional premium.
