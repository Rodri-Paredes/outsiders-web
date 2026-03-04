'use client';

import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Hero Image - Full Screen with Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://obrsjuqzmllnfmldlgby.supabase.co/storage/v1/object/public/web/DSC09638.jpg"
          alt="Outsiders Collection"
          fill
          className="object-cover opacity-50"
          priority
          quality={75}
          sizes="100vw"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <div className="space-y-8 sm:space-y-12 animate-fadeInUp">
          {/* Title */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-bold text-white tracking-tight leading-[1.1]">
              OUTSIDERS
            </h1>
            <div className="h-[2px] w-16 sm:w-24 bg-white mx-auto"></div>
            <p className="text-white/80 text-sm sm:text-base md:text-lg font-light tracking-widest uppercase">
              Streetwear Exclusivo
            </p>
          </div>

          {/* CTA */}
          <div>
            <Link
              href="/shop"
              className="inline-block px-8 sm:px-12 py-3 sm:py-4 bg-white text-black text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:bg-black hover:text-white border-2 border-white"
            >
              Ver Colección
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[9px] sm:text-[10px] tracking-widest text-white/60 uppercase font-medium">Scroll</span>
          <div className="w-px h-10 sm:h-12 bg-white/30" />
        </div>
      </div>
    </section>
  );
}
