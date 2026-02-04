'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '../CartProvider';

export function Navbar() {
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}
    >
      {/* Top Banner */}
      <div className="bg-white text-black text-center py-2 px-4">
        <p className="text-xs tracking-wider uppercase font-light">
          Worldwide Shipping
        </p>
      </div>

      {/* Main Nav */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left - Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/shop" 
              className="text-xs tracking-widest uppercase text-white hover:text-gray-light transition-colors"
            >
              Shop
            </Link>
            <Link 
              href="/shop" 
              className="text-xs tracking-widest uppercase text-white hover:text-gray-light transition-colors"
            >
              Products
            </Link>
          </nav>

          {/* Center - Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="text-xl md:text-2xl font-light tracking-[0.25em] uppercase text-white">
              OUTSIDERS
            </span>
          </Link>

          {/* Right - Actions */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => alert('Search: próximamente')}
              className="hidden md:block text-xs tracking-widest uppercase text-white hover:text-gray-light transition-colors"
            >
              Search
            </button>

            <Link
              href="/cart"
              className="text-xs tracking-widest uppercase text-white hover:text-gray-light transition-colors flex items-center gap-2"
            >
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="bg-white text-black w-5 h-5 flex items-center justify-center text-[10px] font-medium">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
