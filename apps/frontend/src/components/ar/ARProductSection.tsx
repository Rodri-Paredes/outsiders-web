/**
 * ============================================================
 * BETA — Sección de Experiencia 3D / AR en página de producto
 * ============================================================
 *
 * Muestra una sección con el visor 3D integrado debajo de la
 * información principal del producto. Incluye:
 *   - Encabezado con badge "BETA"
 *   - Visor 3D interactivo con el modelo
 *   - Botón para ver en Realidad Aumentada
 *   - Instrucciones de uso
 *
 * NOTA: Esta es una versión BETA. Actualmente usa un modelo 3D
 * genérico de demostración. En futuras versiones, cada producto
 * tendrá su propio modelo 3D.
 * ============================================================
 */
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, RotateCcw, Smartphone, ZoomIn } from 'lucide-react';

// Lazy-load the model viewer to avoid SSR issues with web components
const ModelViewer3D = dynamic(() => import('./ModelViewer3D'), {
  ssr: false,
  loading: () => (
    <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          Cargando visor 3D...
        </p>
      </div>
    </div>
  ),
});

/**
 * Default demo model paths. In production, these would come from
 * the product's database record (e.g. product.model_glb, product.model_usdz).
 */
const DEFAULT_MODEL_GLB = '/models/hoodie.glb';
// const DEFAULT_MODEL_USDZ = '/models/hoodie.usdz'; // Uncomment when USDZ is available

interface ARProductSectionProps {
  /** Product name — used for alt text and labels */
  productName: string;
  /** Optional: custom .glb model path. Falls back to demo model. */
  modelGlb?: string;
  /** Optional: custom .usdz model path for iOS AR. */
  modelUsdz?: string;
}

export default function ARProductSection({
  productName,
  modelGlb,
  modelUsdz,
}: ARProductSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const glbSrc = modelGlb || DEFAULT_MODEL_GLB;
  const usdzSrc = modelUsdz || undefined;

  return (
    <section
      id="ar-section"
      className="mt-12 mb-8 border border-gray-100 rounded-2xl overflow-hidden bg-white"
    >
      {/* Header — click to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 flex items-center justify-between group hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200/50">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-black uppercase tracking-widest">
                Nueva experiencia
              </h3>
              <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[9px] font-bold uppercase tracking-widest rounded-full">
                Beta
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Visualiza esta prenda en 3D y Realidad Aumentada
            </p>
          </div>
        </div>

        {/* Expand/collapse indicator */}
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 group-hover:border-gray-300 transition-all ${
            isExpanded ? 'rotate-180' : ''
          }`}
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
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expandable content */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6">
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />

          {/* 3D Viewer */}
          <div className="aspect-square max-h-[500px] w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            {isExpanded && (
              <ModelViewer3D
                modelSrc={glbSrc}
                iosSrc={usdzSrc}
                alt={`Modelo 3D de ${productName}`}
                enableAR={true}
                autoRotate={true}
                className="w-full h-full"
              />
            )}
          </div>

          {/* Interaction hints */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1.5 px-3 py-3 bg-gray-50 rounded-lg">
              <RotateCcw className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider text-center">
                Arrastra para rotar
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-3 py-3 bg-gray-50 rounded-lg">
              <ZoomIn className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider text-center">
                Pellizca para zoom
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 px-3 py-3 bg-gray-50 rounded-lg">
              <Smartphone className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider text-center">
                AR en celular
              </span>
            </div>
          </div>

          {/* Beta disclaimer */}
          <p className="mt-4 text-[10px] text-gray-300 text-center uppercase tracking-widest">
            Versión beta experimental · Modelo 3D de demostración
          </p>
        </div>
      </div>
    </section>
  );
}
