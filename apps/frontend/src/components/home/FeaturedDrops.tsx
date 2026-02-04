'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dropsService } from '@/services/drops.service';
import { Drop } from '@/lib/database.types';

export function FeaturedDrops() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDrops = async () => {
      try {
        const data = await dropsService.getActiveDrops();
        setDrops(data.slice(0, 3)); // Show only first 3
      } catch (error) {
        console.error('Error loading drops:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDrops();
  }, []);

  if (loading) {
    return (
      <section className="section-padding bg-black">
        <div className="container-custom">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-light text-white tracking-tighter mb-6">
              Drops
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[600px] bg-dark-card animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (drops.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-black" id="drops">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-light text-white tracking-tighter">
              Latest Drops
            </h2>
            <div className="h-px w-24 bg-white/30 mx-auto" />
          </div>
          <p className="text-gray-light text-xs tracking-[0.3em] uppercase mt-6">Exclusive Collections</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {drops.map((drop) => (
            <Link
              key={drop.id}
              href={`/drops/${drop.id}`}
              className="group relative h-[600px] bg-dark-card overflow-hidden transition-all duration-500 hover:scale-[1.02]"
            >
              {/* Background effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                <h3 className="text-2xl font-light text-white mb-2 tracking-tight">{drop.name || 'Unnamed Drop'}</h3>
                {drop.description && (
                  <p className="text-gray-light text-sm mb-4 line-clamp-2 font-light">{drop.description}</p>
                )}
                <div className="flex items-center gap-2 text-white text-xs font-light tracking-widest uppercase">
                  <span>Explore</span>
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-20">
          <Link
            href="/drops"
            className="inline-block px-12 py-4 bg-white text-black font-light text-xs tracking-widest uppercase hover:bg-white/90 transition-all duration-300 border border-white"
          >
            View All Drops
          </Link>
        </div>
      </div>
    </section>
  );
}
