'use client';

import { useEffect } from 'react';
import { cartItemLineTotal, formatBs, useCart } from '../../components/CartProvider';
import type { CartItem } from '../../lib/types';

export default function CartView() {
  const { cart, loading, error, refreshCart, removeFromCart } = useCart();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  if (loading && !cart) {
    return (
      <div className="text-center p-10 text-gray-500 font-medium text-sm">
        cargando carrito...
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="border-2 border-gray-200 bg-white p-6 rounded-lg">
        <p className="text-sm font-medium text-gray-600">{error}</p>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum: number, item: CartItem) => sum + cartItemLineTotal(item), 0);

  if (items.length === 0) {
    return (
      <div className="border-2 border-gray-200 bg-white p-10 text-center rounded-lg">
        <p className="text-base font-bold text-gray-700">tu bolsa está vacía 🛒</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <div className="space-y-4">
        {items.map((item: CartItem) => (
          <div key={item.id} className="border-2 border-gray-200 bg-white p-5 flex gap-4 rounded-lg hover:border-[#2d5f5d] transition-all">
            <div className="w-24 h-28 bg-gray-100 overflow-hidden flex-shrink-0 rounded-md">
              {item.product.imageUrl ? (
                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-400">
                  sin imagen
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-bold text-black">{item.product.name}</p>
                  <p className="text-sm text-gray-600 font-medium mt-1">cantidad: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-black">{formatBs(cartItemLineTotal(item))}</p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="mt-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                  >
                    eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="border-2 border-gray-200 bg-white p-6 h-fit rounded-lg">
        <h2 className="text-xl font-black text-black mb-6">resumen</h2>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span className="font-medium">subtotal</span>
          <span className="text-black font-bold">{formatBs(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
          <span className="font-medium">envío</span>
          <span className="text-black font-bold">gratis</span>
        </div>
        <button
          type="button"
          onClick={() => alert('Checkout: próximamente')}
          className="w-full bg-[#2d5f5d] text-[#d4a574] py-4 text-sm font-bold hover:bg-[#3a6b6a] transition-all transform hover:scale-105 rounded-sm"
        >
          pagar ahora
        </button>
      </aside>
    </div>
  );
}
