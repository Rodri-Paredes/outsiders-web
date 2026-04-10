"use client";

import Image from 'next/image';
import { MapPin, Navigation, Clock } from 'lucide-react';

const STORES = [
  {
    city: "COCHABAMBA",
    address: "Av. Potosí 1384, entre Av. Portales y Pedro Blanco",
    url: "https://maps.app.goo.gl/mXpEFRJ5z2CXwd2Y8",
    image: "/stores/central.png",
    schedule: "Lunes a Sábado: 11:00 - 20:00",
  },
  {
    city: "SANTA CRUZ",
    address: "Av. Busch 970, entre 2 y 3 anillo",
    url: "https://maps.app.goo.gl/MNdXKaCzUu9VS8Zf9",
    image: "/stores/central.png", // Usando la misma como placeholder si no hay otra
    schedule: "Lunes a Sábado: 11:00 - 20:00",
  }
];

export default function StoresPage() {
  return (
    <div className="bg-white min-h-screen pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter mb-4">Nuestras Tiendas</h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            Visita nuestras sucursales para conocer los últimos drops y experimentar OUTSIDERS en persona.
          </p>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {STORES.map((store, idx) => (
            <a 
              key={idx}
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative bg-gray-50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                <Image
                  src={store.image}
                  alt={`Tienda Outsiders en ${store.city}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <div className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Navigation className="w-4 h-4" />
                    Cómo Llegar
                  </div>
                </div>
              </div>

              {/* Content Region */}
              <div className="p-6 md:p-8 md:px-10 bg-white group-hover:bg-gray-50 transition-colors duration-300 relative z-10 border-t border-gray-100">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">
                    {store.city}
                  </h2>
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 text-gray-600">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="font-medium text-sm md:text-base leading-relaxed">
                      {store.address}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-gray-500">
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">
                      {store.schedule}
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center text-sm font-bold uppercase tracking-widest text-black group-hover:text-amber-600 transition-colors">
                  Abrir en Google Maps
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}