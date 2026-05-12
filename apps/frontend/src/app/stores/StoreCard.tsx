"use client";

import Image from 'next/image';
import { MapPin, Navigation, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface StoreCardProps {
  city: string;
  address: string;
  url: string;
  schedule: string;
  photos: string[];
}

export function StoreCard({ city, address, url, schedule, photos }: StoreCardProps) {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const images = photos.length > 0 ? photos : ['/stores/central.png'];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance every 3 seconds, pauses on hover
  useEffect(() => {
    if (images.length <= 1) return;
    if (hovered) return;
    timerRef.current = setInterval(() => {
      setCurrent(i => (i + 1) % images.length);
    }, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hovered, images.length]);

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
  const next = () => setCurrent(i => (i + 1) % images.length);

  return (
    <div
      className="group relative bg-gray-50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 border border-gray-100"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
        <Image
          src={images[current]}
          alt={`Tienda Outsiders en ${city}`}
          fill
          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* "Cómo Llegar" button — centered, only shows on hover, does NOT cover the whole image */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/90 text-black px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-md whitespace-nowrap"
          onClick={e => e.stopPropagation()}
        >
          <Navigation className="w-4 h-4" />
          Cómo Llegar
        </a>

        {/* Carousel controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 text-white p-1.5 rounded-full hover:bg-black transition-colors"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 text-white p-1.5 rounded-full hover:bg-black transition-colors"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute top-3 right-3 z-20 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Foto ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i === current ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Region */}
      <div className="p-6 md:p-8 md:px-10 bg-white group-hover:bg-gray-50 transition-colors duration-300 relative z-10 border-t border-gray-100">
        <div className="flex items-start justify-between mb-4 gap-4">
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">
            {city}
          </h2>
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
            <MapPin className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 text-gray-600">
            <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="font-medium text-sm md:text-base leading-relaxed">{address}</p>
          </div>

          <div className="flex items-center gap-4 text-gray-500">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{schedule}</p>
          </div>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 pt-6 border-t border-gray-100 flex items-center text-sm font-bold uppercase tracking-widest text-black hover:text-amber-600 transition-colors"
        >
          Abrir en Google Maps
          <svg
            className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}

