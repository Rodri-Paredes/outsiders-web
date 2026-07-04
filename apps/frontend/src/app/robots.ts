import type { MetadataRoute } from 'next';

// No existía ningún robots.txt — cualquier bot podía rastrear libremente
// rutas privadas o "caras" en Supabase (carrito, perfil, pedidos) sin
// ninguna guía. Se bloquean las rutas que no tiene sentido indexar y que
// además disparan fetches innecesarios si un bot las visita en bucle.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/cart', '/perfil', '/mis-pedidos', '/pedido', '/auth'],
    },
    host: 'https://outsidersbrand.shop',
  };
}
