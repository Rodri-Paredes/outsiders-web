'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ShoppingBag, Search, MessageCircle, Menu, X, ChevronDown, MapPin } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { SearchOverlay } from './layout/SearchOverlay';
import { useBranch } from '@/contexts/BranchContext';

const WHATSAPP_NUMBER = '59164884458';

const BANNER_TEXTS = [
  "STREETWEAR STATEMENT",
  "ENVÍO GRATIS A PARTIR DE 800 BS."
];

export default function Navbar() {
  const [itemCount, setItemCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerOpacity, setBannerOpacity] = useState(1);
  const { selectedBranch, setShowModal } = useBranch();

  useEffect(() => {
    // Rotación del banner principal
    const bannerInterval = setInterval(() => {
      setBannerOpacity(0);
      setTimeout(() => {
        setBannerIndex((prev) => (prev + 1) % BANNER_TEXTS.length);
        setBannerOpacity(1);
      }, 400); // Desvanece por 400ms y luego se muestra
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(bannerInterval);
  }, []);

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
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white'
          }`}
      >
        {/* Top Banner */}
        <div className="bg-black text-white text-center py-2 px-4 overflow-hidden h-[34px] flex items-center justify-center">
          <p 
            className="text-[10px] md:text-xs tracking-[0.25em] uppercase font-medium text-gray-200 transition-opacity duration-300 ease-in-out"
            style={{ opacity: bannerOpacity }}
          >
            {BANNER_TEXTS[bannerIndex]}
          </p>
        </div>

        {/* Main Nav */}
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left - Navigation (Desktop) */}
            <nav className="hidden md:flex items-center gap-6 text-[10px] tracking-normal font-medium uppercase">
              <Link
                href="/#best-sellers"
                className="text-black hover:text-gray-600 transition-colors"
              >
                BEST SELLERS
              </Link>
              
              <Link
                href="/shop?sale=true"
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Special Prices"
              >
                SPECIAL PRICES
              </Link>

              {/* Shop with mega menu */}
              <div
                className="relative h-full flex items-center group"
              >
                <button
                  type="button"
                  className="flex items-center gap-1 transition-colors text-black hover:text-gray-500 py-6"
                >
                  <span>PRODUCTOS</span>
                  <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
                </button>

                {/* Dropdown Menu - Sleek & Usable */}
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="bg-white border border-gray-100 shadow-2xl min-w-[220px] py-4">
                    <div className="flex flex-col">
                      <Link href="/shop" className="px-6 py-3 text-[10px] font-bold text-gray-500 hover:text-black hover:bg-gray-50 transition-colors uppercase tracking-widest">
                        Ver Todo
                      </Link>
                      <div className="h-px w-full bg-gray-100 my-1"></div>
                      {/* Poleras with Sub-Menu Flyout */}
                      <div className="group/poleras relative">
                        <Link href="/shop?category=Poleras" className="flex items-center justify-between px-6 py-2.5 text-[11px] text-gray-600 hover:text-black transition-all hover:pl-7">
                          <span>Poleras</span>
                          <span className="text-[8px] text-gray-300 group-hover/poleras:text-black transition-colors">►</span>
                        </Link>
                        <div className="absolute left-full top-0 ml-0 opacity-0 invisible group-hover/poleras:opacity-100 group-hover/poleras:visible transition-all duration-300">
                          <div className="bg-white border border-gray-100 shadow-xl min-w-[170px] py-2 ml-0.5">
                            <Link href="/shop?category=Poleras&tag=Básica" className="block px-5 py-2.5 text-[10px] text-gray-500 hover:text-black hover:bg-gray-50 transition-all uppercase tracking-widest">Básicas</Link>
                            <Link href="/shop?category=Poleras&tag=Estampada" className="block px-5 py-2.5 text-[10px] text-gray-500 hover:text-black hover:bg-gray-50 transition-all uppercase tracking-widest">Estampadas</Link>
                          </div>
                        </div>
                      </div>

                      {/* Soleras with Sub-Menu Flyout */}
                      <div className="group/soleras relative">
                        <Link href="/shop?category=Soleras" className="flex items-center justify-between px-6 py-2.5 text-[11px] text-gray-600 hover:text-black transition-all hover:pl-7">
                          <span>Soleras</span>
                          <span className="text-[8px] text-gray-300 group-hover/soleras:text-black transition-colors">►</span>
                        </Link>
                        <div className="absolute left-full top-0 ml-0 opacity-0 invisible group-hover/soleras:opacity-100 group-hover/soleras:visible transition-all duration-300">
                          <div className="bg-white border border-gray-100 shadow-xl min-w-[170px] py-2 ml-0.5">
                            <Link href="/shop?category=Soleras&tag=Básica" className="block px-5 py-2.5 text-[10px] text-gray-500 hover:text-black hover:bg-gray-50 transition-all uppercase tracking-widest">Básicas</Link>
                            <Link href="/shop?category=Soleras&tag=Estampada" className="block px-5 py-2.5 text-[10px] text-gray-500 hover:text-black hover:bg-gray-50 transition-all uppercase tracking-widest">Estampadas</Link>
                          </div>
                        </div>
                      </div>

                      {/* Hoodies with Sub-Menu Flyout */}
                      <div className="group/hoodies relative">
                        <Link href="/shop?category=Hoodies" className="flex items-center justify-between px-6 py-2.5 text-[11px] text-gray-600 hover:text-black transition-all hover:pl-7">
                          <span>Hoodies</span>
                          <span className="text-[8px] text-gray-300 group-hover/hoodies:text-black transition-colors">►</span>
                        </Link>
                        <div className="absolute left-full top-0 ml-0 opacity-0 invisible group-hover/hoodies:opacity-100 group-hover/hoodies:visible transition-all duration-300">
                          <div className="bg-white border border-gray-100 shadow-xl min-w-[170px] py-2 ml-0.5">
                            <Link href="/shop?category=Hoodies&tag=Básica" className="block px-5 py-2.5 text-[10px] text-gray-500 hover:text-black hover:bg-gray-50 transition-all uppercase tracking-widest">Básicas</Link>
                            <Link href="/shop?category=Hoodies&tag=Estampada" className="block px-5 py-2.5 text-[10px] text-gray-500 hover:text-black hover:bg-gray-50 transition-all uppercase tracking-widest">Estampadas</Link>
                          </div>
                        </div>
                      </div>
                      <Link href="/shop?category=Pantalones" className="px-6 py-2.5 text-[11px] text-gray-600 hover:text-black hover:pl-8 transition-all">
                        Pantalones
                      </Link>
                      <Link href="/shop?category=Bermudas" className="px-6 py-2.5 text-[11px] text-gray-600 hover:text-black hover:pl-8 transition-all">
                        Bermudas
                      </Link>
                      <div className="h-px w-full bg-gray-100 my-1"></div>
                      <Link href="/shop?category=Accesorios" className="px-6 py-2.5 text-[11px] text-gray-600 hover:text-black hover:pl-8 transition-all">
                        Accesorios
                      </Link>
                      <Link href="/shop?category=Gorras" className="px-6 py-2.5 text-[11px] text-gray-600 hover:text-black hover:pl-8 transition-all">
                        Gorras
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stores Link */}
              <Link
                href="/stores"
                className="text-black hover:text-gray-600 transition-colors"
              >
                OUR STORES
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

            <div className="flex items-center gap-4 md:gap-6">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-center text-black hover:scale-110 transition-transform"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Branch indicator */}
              {mounted && selectedBranch && (
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="hidden md:flex items-center gap-1.5 text-black hover:text-gray-600 transition-colors group"
                  title="Cambiar sucursal"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">{selectedBranch.label}</span>
                </button>
              )}

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
                <ShoppingBag className="w-5 h-5" />
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
                  href="/#best-sellers"
                  className="text-[11px] tracking-[0.2em] font-medium uppercase text-black hover:text-gray-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  BEST SELLERS
                </Link>
                <Link
                  href="/shop?sale=true"
                  className="text-[11px] tracking-[0.2em] font-medium uppercase text-red-500 hover:text-red-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  SPECIAL PRICES
                </Link>
                <Link
                  href="/shop"
                  className="text-[11px] tracking-[0.2em] font-medium uppercase text-black hover:text-gray-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  PRODUCTOS
                </Link>
                <Link
                  href="/stores"
                  className="text-[11px] tracking-[0.2em] font-medium uppercase text-black hover:text-gray-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  OUR STORES
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

      {/* Search Fullscreen Overlay (Sibling to header to avoid z-index clipping issues) */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
