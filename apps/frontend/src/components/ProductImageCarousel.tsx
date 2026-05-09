'use client';

import { useState, useRef, useCallback, MouseEvent, TouchEvent } from 'react';
import Image from 'next/image';

interface Props {
  images: string[];
  alt: string;
  sizes?: string;
  priority?: boolean;
}

export function ProductImageCarousel({
  images,
  alt,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
  priority = false,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const swipeOccurred = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const validImages = images.filter(Boolean);
  const hasMultiple = validImages.length > 1;

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!hasMultiple || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const zoneWidth = rect.width / validImages.length;
      const newIndex = Math.min(Math.floor(x / zoneWidth), validImages.length - 1);
      setCurrentIndex(newIndex);
    },
    [hasMultiple, validImages.length]
  );

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentIndex(0);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    swipeOccurred.current = false;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || !hasMultiple) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) {
      swipeOccurred.current = true;
      if (diff > 0) {
        setCurrentIndex((prev) => Math.min(prev + 1, validImages.length - 1));
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
    touchStartX.current = null;
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (swipeOccurred.current) {
      e.stopPropagation();
      e.preventDefault();
      swipeOccurred.current = false;
    }
  };

  if (validImages.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-6xl font-bold">
        {alt.charAt(0)}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {validImages.map((src, i) => (
        <Image
          key={src + i}
          src={src}
          alt={i === 0 ? alt : `${alt} - ${i + 1}`}
          fill
          sizes={sizes}
          className={`object-cover transition-opacity duration-200 ${currentIndex === i ? 'opacity-100' : 'opacity-0'}`}
          loading={priority && i === 0 ? undefined : 'lazy'}
          priority={priority && i === 0}
          quality={80}
        />
      ))}

      {/* Progress indicators — visible on hover / touch */}
      {hasMultiple && (
        <div
          className={`absolute bottom-2 left-0 right-0 flex justify-center gap-[3px] z-10 transition-opacity duration-200 pointer-events-none ${isHovered || currentIndex > 0 ? 'opacity-100' : 'opacity-0'}`}
        >
          {validImages.map((_, i) => (
            <div
              key={i}
              className={`h-[2px] rounded-full transition-all duration-200 ${currentIndex === i ? 'w-5 bg-black' : 'w-2.5 bg-black/25'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
