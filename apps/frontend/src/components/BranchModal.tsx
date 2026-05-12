'use client';

import { useBranch, BRANCHES, BranchInfo } from '@/contexts/BranchContext';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

export function BranchModal() {
  const { showModal, setBranch } = useBranch();
  const [selectedId, setSelectedId] = useState<string>(BRANCHES[0].id);
  const [open, setOpen] = useState(false);
  const [render, setRender] = useState(showModal);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (showModal) {
      setRender(true);
    } else {
      timeoutId = setTimeout(() => setRender(false), 300);
    }
    return () => clearTimeout(timeoutId);
  }, [showModal]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!render) return null;

  const handleConfirm = () => {
    const branch = BRANCHES.find((b) => b.id === selectedId);
    if (branch) setBranch(branch);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center px-4 transition-opacity duration-300 ${
        showModal ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none bg-transparent'
      }`}
    >
      <div
        className={`bg-white w-full max-w-[480px] shadow-2xl transition-all duration-300 ${
          showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Brand + Welcome */}
        <div className="text-center px-10 pt-10 pb-6">
          <h2 className="text-xl font-bold text-[#2c1810] tracking-wide mb-3">
            Outsiders
          </h2>
          <p className="text-[13px] text-gray-600 leading-relaxed max-w-xs mx-auto">
            Bienvenido, por favor seleccione su sucursal más cercana para continuar en nuestra tienda online.
          </p>
        </div>

        {/* Custom Dropdown */}
        <div className="px-8 py-6">
          <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              className="w-full flex items-center justify-between gap-3 border border-gray-300 bg-white px-4 py-3.5 text-left hover:border-black transition-colors duration-150 focus:outline-none"
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-[13px] font-medium text-gray-800">
                  {BRANCHES.find(b => b.id === selectedId)?.city} — Bolivia
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Options panel */}
            {open && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 shadow-lg z-10 overflow-hidden">
                {BRANCHES.map((b: BranchInfo) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => { setSelectedId(b.id); setOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-3.5 text-left transition-colors duration-100 ${
                      selectedId === b.id
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className={`w-4 h-4 flex-shrink-0 ${selectedId === b.id ? 'text-gray-300' : 'text-gray-400'}`} />
                    <span className="text-[13px] font-medium">{b.city} — Bolivia</span>
                    {selectedId === b.id && (
                      <svg className="w-3.5 h-3.5 ml-auto text-white" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          className="w-full bg-black hover:bg-gray-900 text-white text-[12px] font-bold uppercase tracking-[0.25em] py-[18px] transition-colors duration-200"
        >
          CONFIRMAR
        </button>
      </div>
    </div>
  );
}
