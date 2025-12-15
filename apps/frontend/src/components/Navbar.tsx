'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from './CartProvider';

export default function Navbar() {
  const { itemCount, refreshCart } = useCart();

  useEffect(() => {
    // Load cart once so the count shows up.
    refreshCart();
  }, [refreshCart]);

  return (
    <header className="sticky top-0 z-50 bg-[#2d5f5d]/95 backdrop-blur-md border-b border-[#d4a574]/30">
      <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#d4a574]">
          <Link href="/#products" className="hover:text-white transition-colors">shop</Link>
          <Link href="/drops" className="hover:text-white transition-colors">drops</Link>
          <Link href="/#products" className="hover:text-white transition-colors">fits</Link>
        </nav>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="text-2xl font-black text-[#d4a574] tracking-tight">OUTSIDERS</span>
          <span className="text-xs font-light text-white/70">streetwear</span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => alert('Search: próximamente')}
            className="text-sm font-medium text-[#d4a574] hover:text-white transition-colors cursor-pointer hidden md:block"
          >
            buscar
          </button>
          <button
            type="button"
            onClick={() => alert('Account: próximamente')}
            className="text-sm font-medium text-[#d4a574] hover:text-white transition-colors cursor-pointer hidden md:block"
          >
            cuenta
          </button>
          <Link
            href="/cart"
            className="text-sm font-medium text-[#d4a574] hover:text-white transition-colors flex items-center gap-1"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">bolsa</span>
            <span>({itemCount})</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
