"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

interface SaleItem {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  size: string;
  product: Product;
}

interface Sale {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  delivery_method?: string;
  branch?: string;
  city?: string;
  items: SaleItem[];
}

export default function MisPedidosPage() {
  const [orders, setOrders] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Debes iniciar sesión para ver tus pedidos');
          setLoading(false);
          return;
        }

        const { data: sales, error: salesError } = await supabase
          .from('sales')
          .select(`
            id,
            created_at,
            total_amount,
            status,
            delivery_method,
            branch,
            city,
            items:sale_items(
              id,
              quantity,
              unit_price,
              subtotal,
              size,
              product:products(
                id,
                name,
                slug,
                image_url
              )
            )
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (salesError) throw salesError;

        setOrders(sales as unknown as Sale[]);
      } catch (err: any) {
        console.error('Error al cargar pedidos:', err);
        setError('Ocurrió un error al cargar tus pedidos.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-amber-100 text-amber-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 py-24 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/login" className="inline-flex px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 py-8 md:py-12 bg-white min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8 uppercase">Mis Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 mb-6 text-lg">No tienes pedidos registrados aún.</p>
          <Link href="/shop" className="inline-flex px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wide text-sm">
            Ir a la Tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border text-black border-gray-200 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden transition-all hover:shadow-md">
              <div className="bg-[#FAF9F8] p-5 sm:px-6 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-1">
                    Fecha: {new Date(order.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </span>
                  <span className="font-bold text-gray-900 text-lg uppercase tracking-tight">
                    PEDIDO #{order.id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                  <div className="flex items-center justify-between sm:justify-end w-full gap-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items.map((item) => {
                  const product = item.product || { name: 'Producto Desconocido', slug: '', image_url: '' };
                  const productUrl = product.slug ? `/producto/${product.slug}` : `/producto/${product.id}`;

                  return (
                    <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center group hover:bg-gray-50/50 transition-colors">
                      <Link href={productUrl} className="flex-shrink-0 w-[70px] h-[70px] relative rounded bg-gray-100 border border-gray-100 block overflow-hidden">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="70px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-xs font-medium">No IMG</span>
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 flex flex-col min-w-0">
                        <Link href={productUrl} className="text-base font-bold text-gray-900 hover:underline truncate uppercase tracking-tight mb-1">
                          {product.name}
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                          <p className="flex items-center gap-1"><span className="text-gray-400 text-xs uppercase tracking-wider">Talla:</span> <span className="font-medium text-gray-900">{item.size}</span></p>
                          <p className="flex items-center gap-1"><span className="text-gray-400 text-xs uppercase tracking-wider">Cantidad:</span> <span className="font-medium text-gray-900">{item.quantity}</span></p>
                          <p className="flex items-center gap-1"><span className="text-gray-400 text-xs uppercase tracking-wider">Precio:</span> <span className="font-medium text-gray-900">Bs {Number(item.unit_price).toFixed(2)}</span></p>
                        </div>
                        
                        <div className="text-sm font-semibold text-gray-900">
                          Total: Bs {Number(item.subtotal).toFixed(2)}
                        </div>
                      </div>

                      <div className="w-full sm:w-auto mt-2 sm:mt-0">
                        <Link href={productUrl} className="flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded border border-black hover:bg-white hover:text-black transition-all">
                          Ver producto
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#FAF9F8] p-5 sm:px-6 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-4">
                <div className="text-gray-600 space-y-1">
                  {order.delivery_method && (
                    <p><span className="font-medium text-gray-800">Método:</span> {order.delivery_method === 'pickup' ? 'Recojo en tienda' : 'Envío'}</p>
                  )}
                  {order.branch && order.delivery_method === 'pickup' && (
                    <p><span className="font-medium text-gray-800">Sucursal:</span> {order.branch}</p>
                  )}
                  {order.city && order.delivery_method !== 'pickup' && (
                    <p><span className="font-medium text-gray-800">Ciudad:</span> {order.city}</p>
                  )}
                </div>
                <div className="text-right w-full sm:w-auto">
                    <span className="text-gray-500 uppercase tracking-widest text-xs mr-2">Total del Pedido</span>
                    <span className="font-black text-xl text-gray-900">Bs {Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
