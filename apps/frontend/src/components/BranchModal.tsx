'use client';

import { useBranch, BRANCHES, BranchInfo } from '@/contexts/BranchContext';
import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export function BranchModal() {
  const { showModal, setBranch } = useBranch();
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [render, setRender] = useState(showModal);

  // Trigger animation properly
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (showModal) {
      setRender(true);
    } else {
      timeoutId = setTimeout(() => setRender(false), 300);
    }
    
    return () => clearTimeout(timeoutId);
  }, [showModal]);

  if (!render) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center transition-colors duration-500 ${
        showModal ? 'bg-black/60 backdrop-blur-[2px]' : 'bg-transparent backdrop-blur-none pointer-events-none'
      }`}
    >
      <div 
        className={`bg-white w-full max-w-[calc(100%-2rem)] sm:max-w-lg mx-auto mb-6 sm:mb-0 sm:rounded-2xl rounded-3xl overflow-hidden shadow-2xl transform transition-transform duration-500 ${
          showModal ? 'translate-y-0 sm:scale-100' : 'translate-y-[120%] sm:translate-y-0 sm:scale-95 sm:opacity-0'
        }`}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-full flex justify-center pt-4 pb-2 sm:hidden">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 pt-4 sm:pt-10 pb-8 sm:pb-10">
          
          <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-black uppercase tracking-widest">
                Tienda
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                Selecciona tu sucursal más cercana
              </p>
            </div>
          </div>

          {/* Branch Options */}
          <div className="space-y-3">
            {BRANCHES.map((branch: BranchInfo) => (
              <button
                key={branch.id}
                onClick={() => setBranch(branch)}
                onMouseEnter={() => setHoveredBranch(branch.id)}
                onMouseLeave={() => setHoveredBranch(null)}
                className={`w-full p-4 sm:p-6 border rounded-xl transition-all duration-300 flex items-center justify-between group relative overflow-hidden ${
                  hoveredBranch === branch.id
                    ? 'bg-black text-white border-black scale-[1.02] shadow-lg'
                    : 'bg-white text-black border-gray-200 hover:border-black'
                }`}
              >
                <div className="text-left relative z-10">
                  <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5 sm:mb-1 transition-colors ${hoveredBranch === branch.id ? 'text-gray-400' : 'text-gray-400'}`}>
                    Stock Disponible En
                  </p>
                  <p className={`text-sm sm:text-lg font-bold uppercase tracking-wider transition-colors ${hoveredBranch === branch.id ? 'text-white' : 'text-black'}`}>
                    {branch.name}
                  </p>
                </div>
                
                {/* Arrow Icon */}
                <div className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 rounded-full border flex items-center justify-center transition-all duration-300 relative z-10 ${
                  hoveredBranch === branch.id ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                }`}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform duration-300 group-hover:translate-x-0.5 ${hoveredBranch === branch.id ? 'text-white' : 'text-black'}`}
                  >
                    <path
                      d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
