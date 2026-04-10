'use client';
import { supabase } from '@/lib/supabase';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import { X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsService } from '@/services/products.service';
import { Product } from '@/lib/database.types';
import { useBranch, BRANCHES as BRANCH_OPTIONS } from '@/contexts/BranchContext';

// Remove local BRANCHES constant — read from context



const CITIES = [
  'La Paz',
  'El Alto',
  'Cochabamba',
  'Santa Cruz',
  'Sucre',
  'Oruro',
  'Potosí',
  'Tarija',
  'Trinidad',
  'Cobija'
];

const WHATSAPP_NUMBER = '59164884458';

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [branch, setBranch] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping' | ''>('');
  const [city, setCity] = useState('');
  const [comments, setComments] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const { selectedBranch } = useBranch();

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    setMounted(true);
    useCartStore.persist.rehydrate();
  }, []);

  // Pre-select branch from global context
  useEffect(() => {
    if (selectedBranch) {
      setBranch(selectedBranch.name);
    }
  }, [selectedBranch]);

  // Load products when cart opens
  useEffect(() => {
    if (isOpen && items.length > 0) {
      productsService.getProducts().then(setProducts).catch(console.error);
    }
  }, [isOpen, items.length]);

  // Listen for openCart event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openCart', handleOpen);
    return () => window.removeEventListener('openCart', handleOpen);
  }, []);

  // Get available stock for an item
  const getAvailableStock = (item: typeof items[0]): number => {
    const product = products.find(p => p.id === item.productId);
    if (!product || !product.variants) return 0;

    const variant = product.variants.find(v => v.size === item.size);
    if (!variant || !variant.stock) return 0;

    const totalStock = variant.stock.reduce((sum, s) => sum + (s.quantity || 0), 0);
    return totalStock;
  };

  if (!mounted) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleFinalizePurchase = async () => {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    if (!deliveryMethod) {
      toast.error('Selecciona un método de entrega');
      return;
    }

    if (deliveryMethod === 'pickup' && !branch) {
      toast.error('Selecciona la sucursal de recojo');
      return;
    }

    if (deliveryMethod === 'shipping' && !city) {
      toast.error('Selecciona la ciudad de envío');
      return;
    }

    // Generate short code (e.g. ZNHQUUVC)
    const orderCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Attempt to get user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Save order in whatsapp_orders table
    const orderData = {
      id: orderCode,
      customer_id: user ? user.id : null,
      total: subtotal,
      city: deliveryMethod === 'pickup' ? branch : city,
      status: 'pendiente',
      delivery_method: deliveryMethod,
      branch: branch || null,
      items: items
    };

    try {
      const { error } = await supabase.from('whatsapp_orders').insert([orderData]);
      if (error) {
        console.error('Error saving order', error);
        toast.error('Hubo un problema procesando tu orden. Intenta nuevamente.');
        return;
      }
    } catch(err) {
      console.error(err);
      toast.error('Ocurrió un error inesperado');
      return;
    }

    // Build WhatsApp message
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://outsiders.bo';
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const originCity = deliveryMethod === 'pickup' ? `${branch} (Recojo en tienda)` : city;
    
    let message = `¡Hola! 👋 Quiero realizar el siguiente pedido:\n\n`;
    message += `RESUMEN DEL PEDIDO:\n`;
    message += `🛍 ${totalQuantity} producto(s) - Total: Bs. ${subtotal.toFixed(2)}\n`;
    message += `📍 Ciudad de entrega: ${originCity}\n\n`;
    message += `🔗 Ver pedido completo con imágenes:\n`;
    message += `${baseUrl}/pedido/${orderCode}\n\n`;
    message += `Código de pedido: ${orderCode}\n\n`;
    message += `¿Podrían confirmarme la disponibilidad y opciones de pago? ¡Gracias! 🙌`;

    if (comments.trim()) {
      message += `\n\nNotas: ${comments}`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    clearCart();
    setIsOpen(false);
    toast.success('Pedido registrado y abriendo WhatsApp...');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col max-h-screen ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-semibold text-black uppercase tracking-wider">
            Tu Carrito ({items.length})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-3 md:py-6">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-2">Tu carrito está vacío</p>
              <p className="text-gray-400 text-sm">Agrega productos para continuar</p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => {
                  // Find the item ID
                  const itemId = item.id;

                  return (
                    <div key={itemId} className="flex gap-3 md:gap-4 pb-4 border-b border-gray-100">
                      {/* Image */}
                      <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-100 relative overflow-hidden">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 80px, 96px"
                            className="object-cover"
                            loading="lazy"
                            quality={60}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xl md:text-2xl">
                            {item.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <h3 className="font-semibold text-black text-xs md:text-sm uppercase mb-1 truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                          Talla: <span className="font-medium text-black">{item.size}</span>
                        </p>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 md:gap-3 mt-auto">
                          <div className="flex items-center border border-gray-300">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(itemId, item.quantity - 1);
                                }
                              }}
                              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-gray-100 text-black font-medium text-sm"
                            >
                              -
                            </button>
                            <span className="w-8 md:w-10 text-center text-xs md:text-sm font-medium text-black">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                const availStock = getAvailableStock(item);
                                if (item.quantity >= availStock) {
                                  toast.error(`Solo hay ${availStock} unidades disponibles`);
                                  return;
                                }
                                updateQuantity(itemId, item.quantity + 1);
                              }}
                              disabled={products.length > 0 && item.quantity >= getAvailableStock(item)}
                              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-gray-100 text-black font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs md:text-sm font-semibold text-black ml-auto">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>

                          <button
                            onClick={() => removeItem(itemId)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Subtotal */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-black uppercase tracking-wider">
                    Subtotal:
                  </span>
                  <span className="text-2xl font-bold text-black">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="relative mb-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Método de Entrega
                </label>
                <div className="flex flex-wrap gap-5">
                  {[
                    { id: 'pickup', label: 'Recoger en Tienda' },
                    { id: 'shipping', label: 'Envío' }
                  ].map((method) => (
                    <label key={method.id} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-3.5 h-3.5 rounded-full border flex flex-shrink-0 items-center justify-center transition-colors ${deliveryMethod === method.id ? 'border-black' : 'border-gray-300 group-hover:border-black'}`}>
                        {deliveryMethod === method.id && <div className="w-2 h-2 bg-black rounded-full" />}
                      </div>
                      <span className={`text-[11px] uppercase tracking-wider transition-colors ${deliveryMethod === method.id ? 'text-black font-bold' : 'text-gray-500 group-hover:text-black'}`}>
                        {method.label}
                      </span>
                      <input 
                        type="radio" 
                        name="deliveryMethod" 
                        value={method.id} 
                        checked={deliveryMethod === method.id} 
                        onChange={(e) => {
                          setDeliveryMethod(e.target.value as 'pickup' | 'shipping');
                          if (e.target.value === 'pickup') setCity('');
                          if (e.target.value === 'shipping') setBranch('');
                        }} 
                        className="hidden" 
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Branch Selection */}
              {deliveryMethod === 'pickup' && (
              <div className="relative mb-2 animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Sucursal de Atención
                </label>
                <div className="flex flex-wrap gap-5">
                  {BRANCH_OPTIONS.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-3.5 h-3.5 rounded-full border flex flex-shrink-0 items-center justify-center transition-colors ${branch === b.name ? 'border-black' : 'border-gray-300 group-hover:border-black'}`}>
                        {branch === b.name && <div className="w-2 h-2 bg-black rounded-full" />}
                      </div>
                      <span className={`text-[11px] uppercase tracking-wider transition-colors ${branch === b.name ? 'text-black font-bold' : 'text-gray-500 group-hover:text-black'}`}>
                        {b.label}
                      </span>
                      <input 
                        type="radio" 
                        name="branch" 
                        value={b.name} 
                        checked={branch === b.name} 
                        onChange={(e) => setBranch(e.target.value)} 
                        className="hidden" 
                      />
                    </label>
                  ))}
                </div>
              </div>
              )}

              {/* City Selection */}
              {deliveryMethod === 'shipping' && (
              <div className="relative mb-2 animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Ciudad de Entrega
                </label>
                <div className="flex flex-wrap gap-x-5 gap-y-3">
                  {CITIES.map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-3.5 h-3.5 rounded-full border flex flex-shrink-0 items-center justify-center transition-colors ${city === c ? 'border-black' : 'border-gray-300 group-hover:border-black'}`}>
                        {city === c && <div className="w-2 h-2 bg-black rounded-full" />}
                      </div>
                      <span className={`text-[11px] uppercase tracking-wider transition-colors ${city === c ? 'text-black font-bold' : 'text-gray-500 group-hover:text-black'}`}>
                        {c}
                      </span>
                      <input 
                        type="radio" 
                        name="city" 
                        value={c} 
                        checked={city === c} 
                        onChange={(e) => setCity(e.target.value)} 
                        className="hidden" 
                      />
                    </label>
                  ))}
                </div>
              </div>
              )}

              {/* Comments */}
              <div className="relative pt-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Notas de Pedido (Opcional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Instrucciones adicionales para la entrega..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 text-xs text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Finalize Button - Mobile (inside scroll area) */}
              <div className="md:hidden pt-2">
                <button
                  onClick={handleFinalizePurchase}
                  className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-900 transition-colors"
                >
                  Finalizar Compra
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Finalize Purchase Button - Desktop only */}
        {items.length > 0 && (
          <div className="hidden md:block px-6 py-5 border-t border-gray-200 bg-white flex-shrink-0">
            <button
              onClick={handleFinalizePurchase}
              className="w-full py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors"
            >
              Finalizar Compra
            </button>
          </div>
        )}
      </div>
    </>
  );
}
