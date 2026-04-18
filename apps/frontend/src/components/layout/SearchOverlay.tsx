'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const POPULAR_TERMS = ['Hoodies', 'Poleras', 'Pantalones', 'Accesorios'];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [visible, setVisible] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Animate in/out
    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            setTimeout(() => inputRef.current?.focus(), 150);
        } else {
            setVisible(false);
            setQuery('');
        }
    }, [isOpen]);

    // Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Lock scroll
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
            onClose();
        }
    };

    const handleTermClick = (term: string) => {
        router.push(`/shop?q=${encodeURIComponent(term)}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[200] flex flex-col transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Backdrop — click to close */}
            <div
                className="absolute inset-0 bg-white"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">

                {/* Top bar */}
                <div className="flex items-center justify-between px-5 md:px-10 h-16 md:h-20 border-b border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                        Buscador
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar búsqueda"
                        className="group flex items-center gap-2 text-black"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-black transition-colors hidden md:block">
                            Cerrar
                        </span>
                        <div className="w-9 h-9 flex items-center justify-center border border-gray-200 group-hover:border-black group-hover:bg-black group-hover:text-white transition-all duration-200 rounded-sm">
                            <X className="w-4 h-4" strokeWidth={2} />
                        </div>
                    </button>
                </div>

                {/* Search form */}
                <div className={`flex-1 flex flex-col justify-center px-5 md:px-16 lg:px-32 transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="flex items-end border-b-2 border-gray-200 focus-within:border-black transition-colors duration-300 pb-3 md:pb-5 gap-4">
                            <Search className="w-5 h-5 md:w-7 md:h-7 text-gray-300 flex-shrink-0 mb-0.5" strokeWidth={2} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Busca un producto..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent text-2xl md:text-4xl lg:text-5xl font-bold text-black placeholder-gray-300 focus:outline-none tracking-tight"
                                autoComplete="off"
                            />
                            {query.trim() && (
                                <button
                                    type="submit"
                                    aria-label="Buscar"
                                    className="flex-shrink-0 bg-black text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-gray-800 transition-colors"
                                >
                                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Suggestions */}
                    <div className={`mt-8 md:mt-12 transition-all duration-500 delay-100 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">
                            Categorías populares
                        </p>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {POPULAR_TERMS.map((term) => (
                                <button
                                    key={term}
                                    type="button"
                                    onClick={() => handleTermClick(term)}
                                    className="px-4 py-2 border border-gray-200 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:border-black hover:bg-black hover:text-white transition-all duration-200"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hint */}
                    <p className="mt-8 text-[10px] text-gray-300 uppercase tracking-widest hidden md:block">
                        Presiona <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-400 font-mono">ESC</kbd> para cerrar
                    </p>
                </div>
            </div>
        </div>
    );
}
