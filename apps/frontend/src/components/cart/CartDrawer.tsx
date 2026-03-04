'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import { X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsService } from '@/services/products.service';
import { Product } from '@/lib/database.types';

const BRANCHES = [
  'Sucursal Centro',
  'Sucursal Norte',
  'Sucursal Sur',
  'Sucursal Este',
  'Sucursal Oeste'
];

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

const WHATSAPP_NUMBER = '59178788416';

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [branch, setBranch] = useState('');
  const [city, setCity] = useState('');
  const [comments, setComments] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    setMounted(true);
    useCartStore.persist.rehydrate();
  }, []);

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

  const handleFinalizePurchase = () => {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    if (!branch || !city) {
      toast.error('Selecciona sucursal y ciudad de entrega');
      return;
    }

    // Build WhatsApp message
    let message = `*NUEVO PEDIDO - OUTSIDERS*\n\n`;
    message += `*Productos:*\n`;
    
    items.forEach((item, index) => {
      message += `\n${index + 1}. ${item.name}\n`;
      message += `   Talla: ${item.size}\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio: $${item.price.toFixed(2)}\n`;
      message += `   Total: $${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n*Subtotal: $${subtotal.toFixed(2)}*\n\n`;
    message += `*Datos de entrega:*\n`;
    message += `Sucursal: ${branch}\n`;
    message += `Ciudad: ${city}\n`;
    
    if (comments.trim()) {
      message += `\nComentarios: ${comments}\n`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    toast.success('Redirigiendo a WhatsApp...');
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
        className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col max-h-screen ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
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
                        <p className="text-xs text-gray-500 mb-1">
                          Talla: <span className="font-medium text-black">{item.size}</span>
                        </p>
                        {products.length > 0 && (
                          <p className="text-xs text-gray-400 mb-2">
                            Stock disponible: <span className="font-medium text-black">{getAvailableStock(item)}</span>
                          </p>
                        )}

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
                  )})}
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

                {/* Branch Selection */}
                <div>
                  <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                    Sucursal de atención:
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">Selecciona una sucursal</option>
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* City Selection */}
                <div>
                  <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                    Ciudad de entrega:
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option value="">Selecciona una ciudad</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                    Comentarios opcionales:
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Ej: Preferencia de color, instrucciones de entrega..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black resize-none"
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
