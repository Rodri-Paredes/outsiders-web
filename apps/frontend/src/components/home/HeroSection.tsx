'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function HeroSection({ content }: { content?: any }) {
  const images = content?.images || [];
  
  // Use fallbacks if no images in CMS yet
  const displayImages = images.length > 0 
    ? images 
    : [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80"
      ];
      
  const mobileTitle = content?.title || "";
  const mobileSubtitle = content?.subtitle || "";

  return (
    <section className="relative w-full h-[85vh] md:h-screen flex bg-black pt-16 md:pt-20 overflow-hidden">
      {displayImages.slice(0, 2).map((img: string, idx: number) => (
        <motion.div 
          key={idx} 
          initial={{ opacity: 0, scale: 1.1, x: idx === 0 ? -50 : 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: idx * 0.1 }}
          className={`relative h-full overflow-hidden ${displayImages.length === 1 ? 'w-full' : 'w-1/2'}`}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-full h-full"
          >
            <Image
              src={img}
              alt={`Hero Image ${idx + 1}`}
              fill
              className="object-cover"
              priority={idx === 0}
              sizes={displayImages.length === 1 ? '100vw' : '50vw'}
            />
          </motion.div>
          {/* Subtle vignette/gradient over each image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50" />
        </motion.div>
      ))}

      {/* Center Divider if 2 images */}
      {displayImages.length === 2 && (
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/20 z-10 hidden md:block transform -translate-x-1/2"
        />
      )}

      {/* Text Overlay */}
      {(mobileTitle || mobileSubtitle) && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="absolute bottom-10 left-6 md:bottom-20 md:left-20 z-20"
        >
          {mobileSubtitle && (
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-[10px] md:text-sm font-bold uppercase tracking-[0.4em] text-white/80 mb-3"
            >
              {mobileSubtitle}
            </motion.p>
          )}
          {mobileTitle && (
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="text-4xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-[0.85] drop-shadow-2xl"
            >
              {mobileTitle.split(' ').map((word: string, i: number) => (
                <span key={i} className="block hover:text-gray-300 transition-colors cursor-default">
                  {word}
                </span>
              ))}
            </motion.h2>
          )}
        </motion.div>
      )}
    </section>
  );
}
