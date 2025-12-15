'use client';

import { useState } from 'react';

interface Drop {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  releaseDate: string;
  imageUrl: string;
  hoverImageUrl: string;
}

export default function DropsGrid() {
  const [hoveredDrop, setHoveredDrop] = useState<string | null>(null);

  // Drops simulados con imágenes de Unsplash de ropa streetwear
  const drops: Drop[] = [
    {
      id: '1',
      name: 'Urban Shadow Hoodie',
      description: 'Hoodie oversized de edición limitada con diseño exclusivo',
      price: 350,
      stock: 25,
      releaseDate: '2025-12-20',
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop',
      hoverImageUrl: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=750&fit=crop'
    },
    {
      id: '2',
      name: 'Night Rider Jacket',
      description: 'Chaqueta técnica impermeable con acabado mate',
      price: 580,
      stock: 15,
      releaseDate: '2025-12-18',
      imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop',
      hoverImageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop'
    },
    {
      id: '3',
      name: 'Cargo Essence Pants',
      description: 'Pantalones cargo con múltiples bolsillos y ajuste perfecto',
      price: 280,
      stock: 30,
      releaseDate: '2025-12-22',
      imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=750&fit=crop',
      hoverImageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop'
    },
    {
      id: '4',
      name: 'Minimal Tee Premium',
      description: 'Camiseta oversize de algodón orgánico premium',
      price: 150,
      stock: 50,
      releaseDate: '2025-12-16',
      imageUrl: 'https://images.unsplash.com/photo-1623876229339-0df13d6a0027?w=600&h=750&fit=crop',
      hoverImageUrl: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&h=750&fit=crop'
    },
    {
      id: '5',
      name: 'Street Vision Set',
      description: 'Set completo: hoodie + joggers en edición limitada',
      price: 650,
      stock: 10,
      releaseDate: '2025-12-25',
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop',
      hoverImageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=750&fit=crop'
    },
    {
      id: '6',
      name: 'Tech Windbreaker',
      description: 'Cortavientos técnico con reflectivos y capucha',
      price: 420,
      stock: 20,
      releaseDate: '2025-12-19',
      imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop',
      hoverImageUrl: 'https://images.unsplash.com/photo-1623876229339-0df13d6a0027?w=600&h=750&fit=crop'
    }
  ];

  const getDaysUntilRelease = (releaseDate: string) => {
    const today = new Date();
    const release = new Date(releaseDate);
    const diffTime = release.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {drops.map((drop) => {
        const isHovered = hoveredDrop === drop.id;
        const daysUntilRelease = getDaysUntilRelease(drop.releaseDate);
        const isAvailableSoon = daysUntilRelease > 0;

        return (
          <article
            key={drop.id}
            className="group cursor-pointer rounded-lg border-2 border-[#2d5f5d]/30 bg-white overflow-hidden hover:border-[#2d5f5d] transition-all hover:shadow-2xl relative"
            onMouseEnter={() => setHoveredDrop(drop.id)}
            onMouseLeave={() => setHoveredDrop(null)}
          >
            {/* Badge de stock limitado */}
            {drop.stock <= 20 && (
              <div className="absolute top-3 left-3 z-20 text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-sm">
                solo {drop.stock} unidades 🔥
              </div>
            )}

            {/* Badge de disponibilidad */}
            {isAvailableSoon && (
              <div className="absolute top-3 right-3 z-20 text-xs font-bold bg-[#d4a574] text-[#2d5f5d] px-3 py-1 rounded-sm">
                disponible en {daysUntilRelease}d
              </div>
            )}

            <div className="relative">
              <div className="relative bg-gray-50 aspect-[4/5] overflow-hidden">
                {/* Imagen principal */}
                <img
                  src={drop.imageUrl}
                  alt={drop.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                    isHovered ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
                  }`}
                />
                
                {/* Imagen en hover */}
                <img
                  src={drop.hoverImageUrl}
                  alt={`${drop.name} - vista alternativa`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                    isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                  }`}
                />

                {/* Overlay con información en hover */}
                <div className={`absolute inset-0 bg-[#2d5f5d]/90 flex items-center justify-center transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Próximamente: ${drop.name}`);
                    }}
                    className="px-8 py-3 bg-[#d4a574] text-[#2d5f5d] text-sm font-bold hover:bg-white transition-all transform hover:scale-105 rounded-sm"
                  >
                    {isAvailableSoon ? 'notificarme' : 'comprar ahora'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-b from-white to-gray-50">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-base font-black text-black uppercase tracking-tight">
                  {drop.name}
                </h3>
                <span className="text-lg font-black text-[#2d5f5d] whitespace-nowrap">
                  Bs. {drop.price}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                {drop.description}
              </p>
              
              {/* Barra de stock */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>disponibilidad</span>
                  <span>{drop.stock} unidades</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-[#d4a574] h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((drop.stock / 50) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
