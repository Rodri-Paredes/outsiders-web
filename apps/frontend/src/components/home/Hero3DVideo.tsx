'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

interface Hero3DVideoProps {
  mp4Src?: string;
  movSrc?: string;
  fallbackImageSrc?: string;
}

export function Hero3DVideo({ 
  mp4Src = '/videos/logo-3d.mp4', 
  movSrc = '/videos/logo-3d.mov', 
  fallbackImageSrc = '/images/logo-fallback.png' 
}: Hero3DVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - top) / height - 0.5; // -0.5 to 0.5
      
      setMousePos({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', () => setIsHovering(true));
      container.addEventListener('mouseleave', () => {
        setIsHovering(false);
        setMousePos({ x: 0, y: 0 });
      });
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', () => setIsHovering(true));
        container.removeEventListener('mouseleave', () => setIsHovering(false));
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      // Incrementar velocidad ligeramente al interactuar, como pidió el prompt
      videoRef.current.playbackRate = isHovering ? 1.5 : 1.0;
    }
  }, [isHovering]);

  // Sombra paralela dinámica (drop-shadow) y ajuste de brillo (brightness)
  const shadowX = mousePos.x * -40; // Opuesto al ratón
  const shadowY = mousePos.y * -40;
  const shadowStyle = {
    filter: `drop-shadow(${shadowX}px ${shadowY}px 20px rgba(255,255,255,0.15)) ${isHovering ? 'brightness(1.2)' : 'brightness(1)'}`,
    transition: 'filter 0.2s ease-out',
  };

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-[90dvh] md:min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-neutral-950 to-black flex items-center justify-center overflow-hidden pt-20 px-4 md:px-12"
    >
      {/* Contenedor Principal Flex: Columna en móvil, Fila en desktop */}
      <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-center md:justify-between w-full max-w-7xl mx-auto gap-0 md:gap-16">
        
        {/* VIDEO WRAPPER */}
        {/* MÓVIL: Fijo 180x180px centrado, superpuesto sobre la card (-mb-10) */}
        {/* DESKTOP: ancho del 40-50%, alineado a la derecha */}
        <div 
          className="relative flex items-center justify-center w-[180px] h-[180px] aspect-square md:w-[45%] md:h-[60vh] md:aspect-auto z-20 -mb-10 md:mb-0 transition-all duration-500"
          style={shadowStyle}
        >
          {/* Efecto de carga (blur-up placeholder) */}
          <div className={`absolute inset-0 bg-white/5 rounded-full md:rounded-3xl blur-2xl transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}>
            {fallbackImageSrc && (
              <Image 
                src={fallbackImageSrc} 
                alt="Loading 3D Logo" 
                fill
                className="object-contain opacity-40 p-4"
              />
            )}
          </div>
          
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className={`relative z-10 w-full h-full object-contain transition-opacity duration-700 ease-in ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoadedData={() => setIsVideoLoaded(true)}
          >
            {movSrc && <source src={movSrc} type="video/quicktime" />}
            {mp4Src && <source src={mp4Src} type="video/mp4" />}
          </video>
        </div>

        {/* GLASSMORPHISM CARD Y TEXTOS */}
        {/* MÓVIL: Efecto glassmorphism, padding superior extra para darle espacio al video que sobresale */}
        {/* DESKTOP: Transparente sin bordes, 50% de ancho, textos alineados a la izquierda */}
        <div className="relative z-10 w-full md:w-[50%] bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 pt-16 md:p-0 md:pt-0 rounded-3xl md:bg-transparent md:backdrop-blur-none md:border-none shadow-[0_0_40px_rgba(0,0,0,0.5)] md:shadow-none flex flex-col text-center md:text-left">
          
          <p className="inline-block px-3 py-1 bg-white/10 text-white text-[10px] md:text-xs font-bold tracking-[0.2em] rounded-full uppercase mb-4 w-fit mx-auto md:mx-0">
            Nueva Colección
          </p>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1.05] mb-4 md:mb-6">
            Lujo <br className="hidden md:block"/> Elevado.
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-gray-400 font-light leading-relaxed mb-8 md:max-w-md mx-auto md:mx-0">
            Rediseñamos la silueta clásica con cortes de vanguardia y detalles minimalistas. Descubre formas atemporales.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3">
            <a 
              href="/shop" 
              className="px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-200 transition-colors shadow-lg"
            >
              Comprar Ahora
            </a>
            <a 
              href="#drops" 
              className="px-8 py-4 bg-transparent border border-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors"
            >
              Ver Drops
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
