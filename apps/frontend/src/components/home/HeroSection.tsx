'use client';

import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Hero Image - Full Screen with Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://obrsjuqzmllnfmldlgby.supabase.co/storage/v1/object/public/web/DSC09638.jpg"
          alt="Outsiders Collection"
          fill
          className="object-cover opacity-40"
          priority
          quality={95}
        />
        {/* Light gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
        <div className="space-y-12 animate-fadeInUp">
          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-light text-black tracking-tighter leading-[0.9]">
              OUTSIDERS
            </h1>
            <div className="h-px w-24 bg-black mx-auto" />
          </div>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-gray-700 tracking-[0.3em] uppercase font-light max-w-2xl mx-auto">
            Urban Streetwear Collection
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href="/shop"
              className="group relative px-10 py-4 bg-black text-white text-xs tracking-widest uppercase overflow-hidden transition-all duration-300 hover:bg-white hover:text-black border border-black"
            >
              <span className="relative z-10">Shop Now</span>
            </Link>
            <Link
              href="/shop"
              className="px-10 py-4 border border-black text-black text-xs tracking-widest uppercase transition-all duration-300 hover:bg-black hover:text-white"
            >
              View Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-widest text-white/60 uppercase">Scroll</span>
          <div className="w-px h-12 bg-white/30" />
        </div>
      </div>
    </section>
  );
}
