'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80", // Streetwear look
  "https://images.unsplash.com/photo-1622445270921-2eb287f3bd29?w=1200&q=80", // Edgy layout
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80"  // Detailed garment
];

export function HeroSection({ content }: { content?: any }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const images = content?.images?.length > 0 ? content.images : HERO_IMAGES;
  const desktopTitle1 = content?.desktop_title_1 || "Out";
  const desktopTitle2 = content?.desktop_title_2 || "siders.";
  const desktopSeason = content?.desktop_season || "Fall / Winter 2024";
  const desktopDesc = content?.desktop_description || "Redefiniendo el lujo urbano. Colecciones limitadas para quienes buscan siluetas estructuradas y un diseño silencioso pero dominante.";
  const mobileTitle = content?.title || "BACK IN STOCK";
  const mobileSubtitle = content?.subtitle || "GODS™ ESTABLISHED 2020 — DESIGNED TO PERFORM";
  const ctaText = content?.cta_text || "EXPLORAR COLECCIÓN";
  const ctaLink = content?.cta_link || "/shop";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prevIdx) => (prevIdx + 1) % images.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center bg-off-white overflow-hidden pt-16 md:pt-20">

      {/* MOBILE BACKGROUND SLIDER (Full Bleed) */}
      <div className="absolute inset-0 w-full h-full md:hidden z-0">
        {images.map((img: string, idx: number) => (
          <Image
            key={`mobile-${idx}`}
            src={img}
            alt={`Outsiders Collection Look ${idx + 1}`}
            fill
            className={`object-cover transition-opacity duration-1000 ease-in-out ${idx === currentIdx ? 'opacity-100' : 'opacity-0'
              }`}
            priority={idx === 0}
            quality={85}
            sizes="100vw"
          />
        ))}
        {/* Mobile Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
      </div>


      {/* Editorial Layout Container */}
      <div className="container-custom w-full h-[calc(90vh-4rem)] md:h-full flex flex-col justify-end md:justify-between md:flex-row md:items-center gap-6 md:gap-12 pb-12 md:py-24 relative z-20">

        {/* Text Content */}
        <div className="w-full md:w-1/2 flex flex-col z-20 animate-fadeInUp">

          {/* Desktop Text (Hidden on mobile) */}
          <div className="hidden md:flex flex-col">
            <p className="text-xs font-medium tracking-[0.4em] text-gray-400 uppercase mb-10">
              {desktopSeason}
            </p>

            <h1 className="text-6xl lg:text-[10rem] font-bold text-black tracking-tighter leading-[0.85] mb-12 uppercase mix-blend-difference break-words">
              {desktopTitle1}<br />{desktopTitle2}
            </h1>

            <p className="max-w-md text-base text-gray-500 font-light leading-relaxed mb-10">
              {desktopDesc}
            </p>
          </div>

          {/* Mobile Text (Mimicking reference image) */}
          <div className="flex md:hidden flex-col text-white mb-6">
            <h1 className="text-5xl font-black italic tracking-tighter leading-none mb-1 uppercase">
              {mobileTitle}<span className="text-3xl ml-1">↗</span>
            </h1>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-90">
              {mobileSubtitle}
            </p>
          </div>

          <Link
            href={ctaLink}
            className="inline-flex items-center group w-fit"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-white md:text-black mr-4 group-hover:mr-6 transition-all duration-300">
              {ctaText}
            </span>
            <div className="w-12 h-[1px] bg-white md:bg-black group-hover:w-16 transition-all duration-300"></div>
          </Link>
        </div>

        {/* DESKTOP Slider - Right side (Hidden on mobile) */}
        <div className="hidden md:block w-1/2 relative h-[60vh] md:h-[80vh] z-10">
          {images.map((img: string, idx: number) => (
            <Image
              key={`desktop-${idx}`}
              src={img}
              alt={`Outsiders Collection Look ${idx + 1}`}
              fill
              className={`object-cover transition-opacity duration-1000 ease-in-out ${idx === currentIdx ? 'opacity-100' : 'opacity-0'
                }`}
              priority={idx === 0}
              quality={85}
              sizes="50vw"
            />
          ))}

          {/* Desktop Slider Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_: any, idx: number) => (
              <div
                key={idx}
                className={`h-[2px] w-8 transition-all duration-500 ${idx === currentIdx ? 'bg-black' : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile Slider Indicators (Bottom Right, circular) */}
        <div className="flex md:hidden absolute bottom-6 right-4 gap-2 z-30">
          {images.map((_: any, idx: number) => (
            <div
              key={idx}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${idx === currentIdx ? 'bg-white scale-125' : 'bg-white/40'
                }`}
            />
          ))}
        </div>

      </div>

      {/* Decorative Elements (Desktop only) */}
      <div className="absolute bottom-8 right-8 md:right-12 hidden md:flex flex-col items-center gap-4">
        <span className="text-[9px] tracking-widest text-gray-400 uppercase font-bold" style={{ writingMode: 'vertical-rl' }}>
          SCROLL
        </span>
        <div className="w-[1px] h-16 bg-gray-300"></div>
      </div>
    </section>
  );
}
