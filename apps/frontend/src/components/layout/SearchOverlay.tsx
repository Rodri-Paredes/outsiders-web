'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            // Focus input after auto-focusing animation
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
            onClose();
            setQuery(''); // reset
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-sm flex flex-col animate-fadeIn">
            {/* Header Close Button */}
            <div className="flex justify-end p-6 md:p-10">
                <button
                    onClick={onClose}
                    className="text-black hover:scale-110 transition-transform flex items-center gap-2"
                >
                    <span className="text-xs font-bold uppercase tracking-widest hidden md:block">Cerrar</span>
                    <X className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} />
                </button>
            </div>

            {/* Main Search Area */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-0 -mt-20">
                <div className="w-full max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative group">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="¿QUÉ ESTÁS BUSCANDO?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-gray-200 text-3xl md:text-5xl lg:text-7xl font-bold uppercase tracking-tighter text-black placeholder-gray-300 pb-4 md:pb-8 focus:outline-none focus:border-black transition-colors"
                        />
                        <button
                            type="submit"
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors hover:scale-110"
                            aria-label="Buscar"
                        >
                            <Search className="w-8 h-8 md:w-12 md:h-12" strokeWidth={2} />
                        </button>
                    </form>

                    {/* Quick Links / Suggestions */}
                    <div className="mt-12 flex flex-col gap-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Términos populares</span>
                        <div className="flex flex-wrap gap-4">
                            {['Hoodies', 'Pantalones Cargo', 'T-Shirts Oversize', 'Jackets'].map((term) => (
                                <button
                                    key={term}
                                    onClick={() => {
                                        router.push(`/shop?q=${encodeURIComponent(term)}`);
                                        onClose();
                                    }}
                                    className="px-6 py-2 border border-gray-200 rounded-full text-xs font-bold uppercase tracking-widest hover:border-black hover:bg-black hover:text-white transition-all duration-300"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
