import './globals.css'
import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { AuthProvider } from '../contexts/AuthContext'
import { CartProvider } from '../components/CartProvider'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'OUTSIDERS — Urban Studio',
  description: 'Urban uniforms for the restless',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${spaceGrotesk.className} antialiased bg-white text-outsiders-1`}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
