'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getWeservUrl } from '@/utils/weserv';
import { motion } from 'framer-motion';
import { recommendationsService } from '@/services/recommendations.service';
import { Product } from '@/lib/database.types';
import { formatCurrency } from '@/utils/format';

interface Props {
  anonId: string;
  currentProductId: string;
  currentCategory: string | null | undefined;
  branchId?: string;
}

export function RecommendedForYou({ anonId, currentProductId, currentCategory, branchId }: Props) {
  const [products, setProducts] = useState<(Product & { images: string[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteCategory, setFavoriteCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!anonId) return;
    loadRecommendations();
  }, [anonId, currentProductId, branchId]);

  const loadRecommendations = async () => {
    try {
      const result = await recommendationsService.getPersonalizedProducts(
        anonId,
        currentProductId,
        branchId,
        8
      );

      if (result.length > 0) {
        // Obtener la categoría favorita para mostrarla en el subtítulo
        const cat = await recommendationsService.getFavoriteCategory(anonId);
        setFavoriteCategory(cat);
        setProducts(result);
      }
    } catch (err) {
      console.error('[RecommendedForYou] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mientras carga o cuando no hay suficiente historial, no mostrar nada
  if (loading || products.length === 0) return null;

  // Si la categoría favorita es la misma que la actual, el bloque aporta poco valor
  // (RelatedProducts ya lo cubre). Solo ocultar si el listado sería idéntico en práctica.
  // Aquí lo mostramos siempre para no perder señal de comportamiento.

  return (
    <section className="py-12 md:py-16 bg-[#f9f9f9] border-t border-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="w-full px-4 md:px-8 max-w-[1800px] mx-auto"
      >
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-black tracking-tighter uppercase">
              Recomendado para ti
            </h2>
            {favoriteCategory && (
              <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-widest">
                Basado en tu interés en {favoriteCategory}
              </p>
            )}
          </div>
          <Link
            href={favoriteCategory ? `/shop?category=${encodeURIComponent(favoriteCategory)}` : '/shop'}
            className="px-4 py-2 bg-gray-100 text-black text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-sm"
          >
            Ver todo
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-5"
        >
          {products.map(product => {
            const slug = `${product.id}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

            return (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
                }}
              >
                <Link
                  href={`/producto/${slug}`}
                  className="group cursor-pointer block flex flex-col h-full"
                >
                  <div className="aspect-[4/5] bg-[#f0f0f0] w-full relative overflow-hidden mb-2">
                    {product.images[0] ? (
                      <Image
                        src={getWeservUrl(product.images[0], { w: 600 })}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 12.5vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        quality={75}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-5xl font-bold">
                        {product.name.charAt(0)}
                      </div>
                    )}
                    {product.discount_percentage && product.discount_percentage > 0 ? (
                      <span className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                        -{product.discount_percentage}%
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-col px-0.5">
                    <h3 className="text-[10px] font-bold text-black mb-0.5 capitalize tracking-tight line-clamp-1 group-hover:text-gray-500 transition-colors">
                      {product.name.toLowerCase()}
                    </h3>
                    {product.original_price && product.discount_percentage && product.discount_percentage > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-gray-400 line-through">
                          {formatCurrency(Number(product.original_price))}
                        </span>
                        <span className="text-[10px] font-bold text-black">
                          {formatCurrency(product.original_price * (1 - product.discount_percentage / 100))}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-black">
                        {formatCurrency(Number(product.price))}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
