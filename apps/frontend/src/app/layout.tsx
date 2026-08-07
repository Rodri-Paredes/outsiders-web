import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ToastProvider } from '@/components/ToastProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { BranchProvider } from '@/contexts/BranchContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { BranchModal } from '@/components/BranchModal';
import { MetaPixel } from '@/components/MetaPixel';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  // Fallback apuntando al dominio real de producción — NEXT_PUBLIC_SITE_URL no
  // está configurada en Vercel, y el fallback viejo ("outsiders-web.vercel.app")
  // es un dominio muerto (404). Con eso, todas las URLs relativas de metadata
  // (og:image, og:url, etc.) se resolvían contra una URL inexistente: Instagram
  // no podía bajar la imagen, fallaba, y volvía a su heurística de fallback
  // (agarraba el logo del navbar y lo recortaba) — el mismo síntoma de antes,
  // pero con otra causa.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://outsidersbrand.shop'),
  title: 'OUTSIDERS - Urban Streetwear',
  description: 'Ropa urbana para los que se atreven a ser diferentes. Diseños únicos y drops exclusivos.',
  keywords: ['streetwear', 'ropa urbana', 'fashion', 'outsiders', 'drops', 'bolivia'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OUTSIDERS',
  },
  icons: {
    apple: [{ url: '/icon-512.png', sizes: '512x512' }],
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'OUTSIDERS - Urban Streetwear',
    description: 'Ropa urbana para los que se atreven a ser diferentes.',
    type: 'website',
    // Sin esto, Instagram/iOS no encuentran og:image y caen en su heurística
    // de fallback: agarran la imagen más grande de la página (el wordmark
    // "øutsiders" del Navbar, 7763x2268) y la recortan al centro en un
    // cuadrado, mostrando solo un pedazo del texto ("sid") gigante y
    // recortado. Esta es la imagen que se usa en cualquier página sin su
    // propia metadata (home, /shop, etc.) — las páginas de producto ya
    // declaran la suya propia en generateMetadata().
    images: [
      {
        url: '/logos/logo-negro.png',
        width: 1200,
        height: 1200,
        alt: 'OUTSIDERS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OUTSIDERS - Urban Streetwear',
    description: 'Ropa urbana para los que se atreven a ser diferentes.',
    images: ['/logos/logo-negro.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={montserrat.className}>
        <MetaPixel />
        <AuthProvider>
        <BranchProvider>
          <BranchModal />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
          <ToastProvider />
        </BranchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

