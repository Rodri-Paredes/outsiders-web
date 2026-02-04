'use client';

import { Trash2, Minus, Plus, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { sendWhatsAppOrder } from '@/utils/whatsapp';

export default function CartView() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);

  const total = getTotal();

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    sendWhatsAppOrder(items, total);
    
    // Opcional: limpiar carrito después de enviar
    if (confirm('¿Deseas vaciar el carrito después de enviar el pedido?')) {
      clearCart();
    }
  };

  if (items.length === 0) {
    return (
      <div className="border border-white/10 bg-dark-card p-10 md:p-16 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <p className="text-xl font-light text-white">Tu carrito está vacío 🛒</p>
          <p className="text-sm font-light text-gray-light">
            Descubre nuestra colección y encuentra algo increíble
          </p>
          <Link
            href="/#products"
            className="inline-block mt-6 px-12 py-4 bg-white text-black text-xs font-light tracking-widest uppercase hover:bg-white/90 transition-all"
          >
            Explorar Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
      {/* Items List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-white/10 bg-dark-card p-6 flex gap-6 hover:border-white/20 transition-all group"
          >
            {/* Image */}
            <div className="relative w-24 h-32 bg-dark-bg overflow-hidden flex-shrink-0">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-light text-gray-medium">
                  Sin imagen
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-light text-white mb-1">{item.name}</h3>
                <p className="text-sm text-gray-light font-light">
                  Talla: <span className="text-white">{item.size}</span>
                </p>
                <p className="text-sm text-gray-light font-light mt-1">
                  Bs. {item.price.toFixed(2)} c/u
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center border border-white/10">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-2 hover:bg-white/5 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-white" />
                  </button>
                  <span className="px-4 py-2 text-sm font-light text-white min-w-[3rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-2 hover:bg-white/5 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-medium hover:text-white transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subtotal */}
            <div className="text-right">
              <p className="text-lg font-light text-white">
                Bs. {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-32 h-fit">
        <div className="border border-white/10 bg-dark-card p-8">
          <h2 className="text-2xl font-light text-white mb-8 tracking-tight">Resumen</h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-light text-gray-light">Subtotal</span>
              <span className="text-white font-light">Bs. {total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-light text-gray-light">Envío</span>
              <span className="text-white font-light">A coordinar</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="font-light text-white">Total</span>
              <span className="text-2xl font-light text-white">Bs. {total.toFixed(2)}</span>
            </div>
          </div>

          {/* WhatsApp Checkout Button */}
          <button
            onClick={handleCheckout}
            className="w-full bg-[#25D366] text-white py-4 px-6 text-xs font-light tracking-widest uppercase hover:bg-[#20BA5A] transition-all flex items-center justify-center gap-3 group"
          >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Enviar Pedido por WhatsApp
          </button>

          <Link
            href="/#products"
            className="block text-center mt-4 text-xs text-gray-light hover:text-white transition-colors uppercase tracking-wider"
          >
            Seguir Comprando
          </Link>
        </div>
      </aside>
    </div>
  );
}
