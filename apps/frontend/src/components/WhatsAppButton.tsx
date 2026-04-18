'use client';

import { MessageCircle } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';

const WHATSAPP_CBB = '59164884458';

export function WhatsAppButton() {
  const { selectedBranch } = useBranch();

  const handleClick = () => {
    const number = selectedBranch?.phone ?? WHATSAPP_CBB;
    const message = encodeURIComponent('Hola! Me gustaría obtener más información sobre sus productos.');
    const url = `https://wa.me/${number}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />

      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-4 py-2 bg-[#25D366] text-white text-xs font-light tracking-wider uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded">
        Contáctanos
      </span>
    </button>
  );
}
