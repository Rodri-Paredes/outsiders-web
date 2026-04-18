'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function HeroSection({ content }: { content?: any }) {
  const images = content?.images || [];
  
  const displayImages = images.length > 0 
    ? images 
    : [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80"
      ];
      
  const mobileTitle = content?.title || "";
  const mobileSubtitle = content?.subtitle || "";

  const [mobileIndex, setMobileIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (displayImages.length < 2) return;
    const timer = setInterval(() => {
      setDirection(1);
      setMobileIndex(prev => (prev + 1) % displayImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [displayImages.length]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0, scale: 1.08 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0, scale: 0.95 }),
  };

  return (
    <section className="relative w-full h-[85vh] md:h-screen bg-black pt-16 md:pt-20 overflow-hidden">

      {/* MOBILE: fullscreen slideshow */}
      <div className="block md:hidden w-full h-full relative">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={mobileIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 8, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <Image
                src={displayImages[mobileIndex]}
                alt={`Hero Image ${mobileIndex + 1}`}
                fill
                className="object-cover object-center"
                priority
                sizes="100vw"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Dots indicator */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {displayImages.slice(0, displayImages.length).map((_: string, i: number) => (
              <button
                key={i}
                onClick={() => { setDirection(i > mobileIndex ? 1 : -1); setMobileIndex(i); }}
                className={`rounded-full transition-all duration-300 ${
                  i === mobileIndex ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP: two images side by side */}
      <div className="hidden md:flex w-full h-full">
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
                sizes="50vw"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50" />
          </motion.div>
        ))}

        {displayImages.length === 2 && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/20 z-10 transform -translate-x-1/2"
          />
        )}
      </div>

      {/* Text Overlay (both) */}
      {(mobileTitle || mobileSubtitle) && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="absolute bottom-10 left-6 md:bottom-20 md:left-20 z-20"
        >
          {mobileSubtitle && (
            <p className="text-[10px] md:text-sm font-bold uppercase tracking-[0.4em] text-white/80 mb-3">
              {mobileSubtitle}
            </p>
          )}
          {mobileTitle && (
            <h2 className="text-4xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-[0.85] drop-shadow-2xl">
              {mobileTitle.split(' ').map((word: string, i: number) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h2>
          )}
        </motion.div>
      )}
    </section>
  );
}
