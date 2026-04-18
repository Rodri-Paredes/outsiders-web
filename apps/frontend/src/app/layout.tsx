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

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://outsiders-web.vercel.app'),
  title: 'OUTSIDERS - Urban Streetwear',
  description: 'Ropa urbana para los que se atreven a ser diferentes. Diseños únicos y drops exclusivos.',
  keywords: ['streetwear', 'ropa urbana', 'fashion', 'outsiders', 'drops', 'bolivia'],
  openGraph: {
    title: 'OUTSIDERS - Urban Streetwear',
    description: 'Ropa urbana para los que se atreven a ser diferentes.',
    type: 'website',
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

