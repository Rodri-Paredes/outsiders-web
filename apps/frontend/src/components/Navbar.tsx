'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, MessageCircle, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

const WHATSAPP_NUMBER = '59178788416';

export default function Navbar() {
  const [itemCount, setItemCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Hydrate cart store
    useCartStore.persist.rehydrate();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mounted) {
      const unsubscribe = useCartStore.subscribe((state) => {
        setItemCount(state.getItemCount());
      });
      setItemCount(useCartStore.getState().getItemCount());
      return unsubscribe;
    }
  }, [mounted]);

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hola! Me gustaría obtener más información sobre sus productos.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white'
      }`}
    >
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-2 px-4">
        <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-light">
          Outsiders Studio — Envíos a todo Bolivia
        </p>
      </div>

      {/* Main Nav */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left - Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.25em] uppercase">
            {/* Shop with mega menu */}
            <div 
              className="relative h-full flex items-center"
              onMouseEnter={() => setShopMenuOpen(true)}
              onMouseLeave={() => setShopMenuOpen(false)}
            >
              <button
                type="button"
                className={`flex items-center gap-1 transition-colors ${
                  shopMenuOpen ? 'text-black' : 'text-black hover:text-gray-600'
                }`}
              >
                <span>Shop</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${shopMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega menu */}
              {shopMenuOpen && (
                <div className="absolute left-0 top-full mt-3">
                  <div className="pt-4">
                    <div className="bg-white/95 backdrop-blur border border-gray-200 shadow-xl min-w-[560px] px-8 py-6">
                      <div className="grid grid-cols-3 gap-8 text-[11px] leading-relaxed">
                        {/* Column 1 */}
                        <div>
                          <p className="mb-3 text-[10px] font-medium tracking-[0.25em] text-gray-500">
                            Ropa
                          </p>
                          <div className="space-y-2 text-black">
                            <Link href="/shop" className="block hover:text-gray-600">
                              Camisetas
                            </Link>
                            <Link href="/shop" className="block hover:text-gray-600">
                              Sudaderas & Hoodies
                            </Link>
                            <Link href="/shop" className="block hover:text-gray-600">
                              Pantalones
                            </Link>
                            <Link href="/shop" className="block hover:text-gray-600">
                              Oversized
                            </Link>
                          </div>
                        </div>

                        {/* Column 2 */}
                        <div>
                          <p className="mb-3 text-[10px] font-medium tracking-[0.25em] text-gray-500">
                            Accesorios
                          </p>
                          <div className="space-y-2 text-black">
                            <Link href="/shop" className="block hover:text-gray-600">
                              Gorras & Beanies
                            </Link>
                            <Link href="/shop" className="block hover:text-gray-600">
                              Bolsos
                            </Link>
                            <Link href="/shop" className="block hover:text-gray-600">
                              Calcetas
                            </Link>
                            <Link href="/shop" className="block hover:text-gray-600">
                              Otros
                            </Link>
                          </div>
                        </div>

                        {/* Column 3 */}
                        <div>
                          <p className="mb-3 text-[10px] font-medium tracking-[0.25em] text-gray-500">
                            Colecciones
                          </p>
                          <div className="space-y-2 text-black">
                            <Link href="/shop" className="block hover:text-gray-600">
                              New Arrivals
                            </Link>
                            <Link href="/shop" className="block hover:text-gray-600">
                              Best Sellers
                            </Link>
                            <Link href="/shop" className="block hover:text-gray-600">
                              Últimas unidades
                            </Link>
                            <Link href="/shop" className="block hover:text-gray-600">
                              Ver todo
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link 
              href="/#best-sellers" 
              className="text-black hover:text-gray-600 transition-colors"
            >
              Best Sellers
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-black"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Center - Logo */}
          <Link 
            href="/" 
            className="absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition-opacity"
            prefetch={true}
            scroll={true}
            aria-label="Volver al inicio"
          >
            <img
              src="/logos/logo-negro.png"
              alt="OUTSIDERS"
              width="120"
              height="40"
              className="h-8 md:h-10 w-auto pointer-events-none"
              loading="eager"
              decoding="sync"
            />
          </Link>

          {/* Right - Actions */}
          <div className="flex items-center gap-4 md:gap-6">
            <button
              type="button"
              onClick={() => alert('Búsqueda próximamente')}
              className="hidden md:flex items-center justify-center text-black hover:text-gray-600 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="hidden md:flex items-center justify-center text-[#25D366] hover:scale-110 transition-transform"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('openCart'))}
              className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors relative cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white w-5 h-5 flex items-center justify-center text-[10px] font-medium rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <nav className="flex flex-col gap-4 px-4">
              <Link 
                href="/shop" 
                className="text-xs tracking-widest uppercase text-black hover:text-gray-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                href="/#best-sellers" 
                className="text-xs tracking-widest uppercase text-black hover:text-gray-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Best Sellers
              </Link>
              <button
                onClick={handleWhatsApp}
                className="text-xs tracking-widest uppercase text-[#25D366] hover:text-[#20BA5A] transition-colors text-left"
              >
                WhatsApp
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
