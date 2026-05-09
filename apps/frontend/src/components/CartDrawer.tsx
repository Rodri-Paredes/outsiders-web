'use client';

import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'TALLA UNICA'];

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, updateSize, total } = useCartStore();
  const [editingSizeFor, setEditingSizeFor] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-dark-card border-l border-white/10 z-50 flex flex-col shadow-2xl animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-white" size={24} />
            <h2 className="text-xl font-light text-white tracking-wide uppercase">
              Tu Carrito
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-medium hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="text-gray-medium mb-4" size={48} />
              <p className="text-gray-light text-sm tracking-wider uppercase">
                Tu carrito está vacío
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-3 bg-white text-black text-xs tracking-widest uppercase hover:bg-gray-100 transition-colors"
              >
                Seguir Comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-dark-bg p-4 relative group">
                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 text-gray-medium hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 bg-dark-card flex-shrink-0 relative overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                          loading="lazy"
                          quality={60}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl">
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-light mb-1 truncate">
                        {item.name}
                      </h3>
                      <p className="text-gray-light text-xs mb-2">
                        Bs. {item.price.toFixed(2)}
                      </p>

                      {/* Size Selector */}
                      <div className="mb-3">
                        <label className="text-[10px] text-gray-medium uppercase tracking-wider block mb-1">
                          Talla
                        </label>
                        {editingSizeFor === item.id ? (
                          <div className="flex gap-1 flex-wrap">
                            {sizes.map((size) => (
                              <button
                                key={size}
                                onClick={() => {
                                  updateSize(item.id, size);
                                  setEditingSizeFor(null);
                                }}
                                className={`px-2 py-1 text-xs transition-all ${
                                  item.size === size
                                    ? 'bg-white text-black'
                                    : 'bg-dark-card text-gray-light border border-white/10 hover:border-white/30'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingSizeFor(item.id)}
                            className="px-3 py-1 bg-dark-card text-white text-xs border border-white/10 hover:border-white/30 transition-colors"
                          >
                            {item.size || 'Seleccionar'}
                          </button>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center bg-dark-card text-gray-light border border-white/10 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-white text-sm w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-dark-card text-gray-light border border-white/10 hover:border-white/30 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-6 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-light tracking-wider uppercase text-sm">Total</span>
              <span className="text-white font-light text-xl">Bs. {total.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <Link
              href="/cart"
              onClick={onClose}
              className="block w-full py-4 bg-white text-black text-center text-xs tracking-widest uppercase hover:bg-gray-100 transition-colors"
            >
              Ir al Checkout
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full py-3 border border-white/10 text-white text-xs tracking-widest uppercase hover:bg-white/5 transition-colors"
            >
              Seguir Comprando
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
