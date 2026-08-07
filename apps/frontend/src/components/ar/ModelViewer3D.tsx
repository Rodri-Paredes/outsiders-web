/**
 * ============================================================
 * BETA — Visualización 3D / Realidad Aumentada (AR)
 * ============================================================
 *
 * Componente reutilizable que renderiza un modelo 3D usando
 * Google <model-viewer>. Soporta:
 *   - Rotación interactiva con touch/mouse
 *   - Zoom con scroll/pinch
 *   - Realidad Aumentada (AR) en Android e iOS
 *
 * Para iOS se necesita un archivo .usdz adicional.
 * Para Android se usa WebXR con el archivo .glb.
 *
 * NOTA: Esta es una versión BETA experimental.
 * Los modelos 3D de demo serán reemplazados por modelos reales
 * de las prendas de Outsiders en futuras versiones.
 * ============================================================
 */
'use client';

import { useEffect, useRef, useState } from 'react';

// Type declaration for model-viewer custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          'ios-src'?: string;
          alt?: string;
          ar?: boolean;
          'ar-modes'?: string;
          'camera-controls'?: boolean;
          'touch-action'?: string;
          'auto-rotate'?: boolean;
          'shadow-intensity'?: string;
          'environment-image'?: string;
          exposure?: string;
          poster?: string;
          loading?: 'auto' | 'lazy' | 'eager';
          reveal?: 'auto' | 'manual';
          'camera-orbit'?: string;
          'min-camera-orbit'?: string;
          'max-camera-orbit'?: string;
          'field-of-view'?: string;
          'min-field-of-view'?: string;
          'max-field-of-view'?: string;
          'interaction-prompt'?: string;
          'ar-scale'?: string;
          'ar-placement'?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface ModelViewer3DProps {
  /** Path to the .glb model file (e.g. "/models/hoodie.glb") */
  modelSrc: string;
  /** Optional: Path to .usdz model for iOS AR (e.g. "/models/hoodie.usdz") */
  iosSrc?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Optional poster image shown while model loads */
  poster?: string;
  /** Whether to enable AR mode (default: true) */
  enableAR?: boolean;
  /** Whether to auto-rotate the model (default: true) */
  autoRotate?: boolean;
  /** CSS class name for the container */
  className?: string;
}

export default function ModelViewer3D({
  modelSrc,
  iosSrc,
  alt = 'Modelo 3D de prenda',
  poster,
  enableAR = true,
  autoRotate = true,
  className = '',
}: ModelViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Import model-viewer as a side-effect (web component registration)
  useEffect(() => {
    import('@google/model-viewer')
      .then(() => setIsLoaded(true))
      .catch((err) => {
        console.error('[AR Beta] Error loading model-viewer:', err);
        setLoadError(true);
      });
  }, []);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-xl p-8 ${className}`}>
        <p className="text-sm text-gray-400">
          No se pudo cargar el visor 3D. Intenta recargar la página.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Loading skeleton while model-viewer initializes */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Cargando modelo 3D...
            </p>
          </div>
        </div>
      )}

      {isLoaded && (
        <model-viewer
          src={modelSrc}
          ios-src={iosSrc}
          alt={alt}
          ar={enableAR}
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="auto"
          ar-placement="floor"
          camera-controls={true}
          touch-action="pan-y"
          auto-rotate={autoRotate}
          shadow-intensity="1"
          exposure="1"
          interaction-prompt="auto"
          loading="lazy"
          camera-orbit="45deg 75deg 2.5m"
          min-camera-orbit="auto auto auto"
          max-camera-orbit="auto auto auto"
          field-of-view="30deg"
          poster={poster}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '300px',
            borderRadius: '12px',
            backgroundColor: '#fafafa',
          }}
        >
          {/* AR button slot — styled for Outsiders brand */}
          {enableAR && (
            <button
              slot="ar-button"
              className="
                absolute bottom-4 left-1/2 -translate-x-1/2
                px-6 py-3
                bg-black text-white
                text-xs font-semibold uppercase tracking-widest
                rounded-full
                shadow-lg
                hover:bg-gray-900
                active:scale-95
                transition-all
                flex items-center gap-2
                z-10
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Ver en AR
            </button>
          )}
        </model-viewer>
      )}
    </div>
  );
}
