'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getWeservUrl } from '@/utils/weserv';

export function FeaturedBanner() {
  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      <div className="container-custom">
        {/* Editorial Split Layout */}
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">

          {/* Left Side - Image Container */}
          <div className="w-full md:w-1/2 relative">
            <div className="aspect-[3/4] relative w-full overflow-hidden group">
              <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
              <Image
                src={getWeservUrl("https://obrsjuqzmllnfmldlgby.supabase.co/storage/v1/object/public/web/DSC09638.jpg", { w: 1200 })}
                alt="Featured Collection"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                quality={85}
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
            {/* Subtle decorative accent */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-off-white -z-10 hidden md:block"></div>
          </div>

          {/* Right Side - Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="max-w-md">
              {/* Tag */}
              <div className="mb-6">
                <span className="text-[10px] tracking-[0.3em] text-gray-400 uppercase font-medium">
                  Chapter 01
                </span>
              </div>

              {/* Title */}
              <h2 className="text-5xl md:text-7xl font-bold text-black tracking-tighter leading-[0.9] mb-8 uppercase">
                Winter
                <br />
                <span className="text-gray-300">Edition.</span>
              </h2>

              {/* Description */}
              <p className="text-gray-500 text-sm md:text-base font-light leading-relaxed mb-10">
                Piezas esenciales diseñadas para el entorno urbano. Materiales premium, cortes precisos y una paleta de colores contenida que habla por sí misma.
              </p>

              {/* CTA */}
              <Link
                href="/shop"
                className="inline-flex items-center group w-fit"
              >
                <div className="w-8 h-[1px] bg-black mr-4 group-hover:w-12 transition-all duration-300"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-black group-hover:ml-2 transition-all duration-300">
                  Descubrir
                </span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
