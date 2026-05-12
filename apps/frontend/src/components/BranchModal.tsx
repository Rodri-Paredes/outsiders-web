'use client';

import { useBranch, BRANCHES, BranchInfo } from '@/contexts/BranchContext';
import { useState, useEffect } from 'react';

export function BranchModal() {
  const { showModal, setBranch } = useBranch();
  const [selectedId, setSelectedId] = useState<string>(BRANCHES[0].id);
  const [render, setRender] = useState(showModal);

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

  const handleConfirm = () => {
    const branch = BRANCHES.find((b) => b.id === selectedId);
    if (branch) setBranch(branch);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center px-4 transition-opacity duration-300 ${
        showModal ? 'opacity-100 bg-black/50' : 'opacity-0 pointer-events-none bg-transparent'
      }`}
    >
      <div
        className={`bg-white w-full max-w-sm border border-gray-300 transition-transform duration-300 ${
          showModal ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-5 text-center border-b border-gray-200">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-1">Bienvenido a</p>
          <h2 className="text-2xl font-bold tracking-widest uppercase text-black">Outsiders</h2>
          <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
            Selecciona tu tienda para ver el stock disponible
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 whitespace-nowrap">
              Tienda
            </label>
            <div className="relative flex-1">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full appearance-none border border-gray-300 px-3 py-2 pr-8 text-xs font-medium text-black bg-white focus:outline-none focus:border-black cursor-pointer"
              >
                {BRANCHES.map((b: BranchInfo) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
              {/* Custom chevron */}
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] py-4 hover:bg-gray-900 transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}


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
