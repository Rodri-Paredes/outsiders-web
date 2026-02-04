'use client';

import Link from 'next/link';
import Image from 'next/image';

export function FeaturedBanner() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] bg-gray-50 overflow-hidden">
      {/* Split Layout */}
      <div className="h-full flex flex-col md:flex-row">
        {/* Left Side - Image */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full">
          <Image
            src="https://obrsjuqzmllnfmldlgby.supabase.co/storage/v1/object/public/web/DSC09638.jpg"
            alt="Featured Collection"
            fill
            className="object-cover"
            quality={90}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Right Side - Content */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center px-8 md:px-16 bg-white">
          <div className="max-w-lg">
            <div className="space-y-8">
              {/* Tag */}
              <div className="inline-block">
                <span className="text-xs tracking-[0.3em] text-gray-600 uppercase border border-gray-400 px-4 py-2">
                  New Collection
                </span>
              </div>

              {/* Title */}
              <h2 className="text-4xl md:text-6xl font-light text-black tracking-tight leading-tight">
                Winter
                <br />
                <span className="italic font-light">Collection</span>
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-sm md:text-base font-light leading-relaxed">
                Explore our latest streetwear pieces designed for the urban explorer. 
                Premium quality meets contemporary style.
              </p>

              {/* CTA */}
              <div className="pt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-3 text-black text-xs tracking-widest uppercase hover:gap-5 transition-all duration-300 font-medium"
                >
                  <span>Explore Collection</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
