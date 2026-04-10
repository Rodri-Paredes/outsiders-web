"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

interface OrderItem {
  name: string;
  slug?: string;
  productId: string;
  size: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface WhatsappOrder {
  id: string;
  customer_id?: string;
  total: number;
  city?: string;
  status: string;
  delivery_method?: string;
  branch?: string;
  items: OrderItem[];
  created_at: string;
}

export default function PedidoPage({ params }: { params: { codigo: string } }) {
  const { codigo } = params;
  const [order, setOrder] = useState<WhatsappOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data, error } = await supabase
          .from('whatsapp_orders')
          .select('*')
          .eq('id', codigo.toUpperCase())
          .single();

        if (error || !data) {
          console.error(error);
          setOrder(null);
        } else {
          setOrder(data as WhatsappOrder);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (codigo) {
      fetchOrder();
    }
  }, [codigo]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Pedido no encontrado</h1>
        <p className="text-gray-500 mb-8">El código de pedido no existe o es incorrecto.</p>
        <Link href="/shop" className="px-8 py-3 bg-black text-white font-medium rounded uppercase text-sm tracking-widest hover:bg-gray-800 transition-colors">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pt-24 md:pt-32 pb-12 bg-white min-h-screen">
      
      {/* Banner */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded text-center text-sm font-medium mb-8">
        Este pedido expira en 24 horas si no se completa el pago.
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Lista de productos */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Pedido #{order.id}</h1>
          <p className="text-gray-500 text-sm mb-6">
            Fecha: {new Date(order.created_at).toLocaleString('es-ES', { 
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>

          <div className="divide-y divide-gray-100 border-t border-gray-200">
            {order.items.map((item, idx) => {
              const productUrl = item.slug ? `/producto/${item.slug}` : `/producto/${item.productId}`;

              return (
                <div key={idx} className="py-6 flex flex-row gap-4 items-start sm:items-center">
                  <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 relative rounded bg-gray-50 border border-gray-100 overflow-hidden">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 96px, 112px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">No IMG</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-tight mb-2 sm:mb-3 line-clamp-2">{item.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-y-2 text-xs sm:text-sm text-gray-600">
                      <div className="flex flex-col"><span className="text-[10px] sm:text-xs uppercase text-gray-400 font-medium">Talla</span><span className="font-semibold text-black">{item.size}</span></div>
                      <div className="flex flex-col"><span className="text-[10px] sm:text-xs uppercase text-gray-400 font-medium">Cantidad</span><span className="font-semibold text-black">{item.quantity}</span></div>
                      <div className="flex flex-col"><span className="text-[10px] sm:text-xs uppercase text-gray-400 font-medium">Precio</span><span className="font-semibold text-black">Bs {Number(item.price).toFixed(2)}</span></div>
                      <div className="flex flex-col"><span className="text-[10px] sm:text-xs uppercase text-gray-400 font-medium">Subtotal</span><span className="font-semibold text-black">Bs {(item.price * item.quantity).toFixed(2)}</span></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen */}
        <div className="w-full lg:w-[380px] flex-shrink-0 mt-4 lg:mt-0">
          <div className="bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold uppercase tracking-tight mb-4 border-b border-gray-200 pb-4">Resumen del pedido</h2>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Estado</span>
                <span className="font-semibold text-amber-600 capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Método de entrega</span>
                <span className="font-medium text-black">
                  {order.delivery_method === 'pickup' ? 'Recojo en tienda' : 'Envío a domicilio'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Destino</span>
                <span className="font-medium text-black text-right">
                  {order.delivery_method === 'pickup' ? order.branch : order.city || 'Por confirmar'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-200 pt-4 mb-6">
              <span className="text-sm font-semibold uppercase tracking-wider">Total Final</span>
              <span className="text-2xl font-black text-black">Bs {Number(order.total).toFixed(2)}</span>
            </div>

            <Link href="/shop" className="flex items-center justify-center w-full py-3.5 bg-black text-white text-sm font-bold uppercase tracking-widest rounded hover:bg-gray-800 transition-colors">
              Volver a la tienda
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
