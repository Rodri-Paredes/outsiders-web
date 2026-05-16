'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getWeservUrl } from '@/utils/weserv';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/database.types';

interface Props {
  currentProductId: string;
  category: string | null | undefined;
  branchId?: string;
}

function mapRelatedProduct(p: any, branchId?: string): Product & { images: string[] } {
  let totalStock = 0;
  let parsedImages: string[] = [];

  if (Array.isArray(p.images)) {
    parsedImages = p.images;
  } else if (typeof p.images === 'string') {
    try {
      parsedImages = JSON.parse(p.images);
    } catch {
      parsedImages = p.images.replace(/^{|}$/g, '').split(',').map((u: string) => u.trim().replace(/^"|"$/g, '')).filter(Boolean);
    }
  }
  if (parsedImages.length === 0 && p.image_url) parsedImages = [p.image_url];

  (p.variants || []).forEach((v: any) => {
    (v.stock || []).forEach((s: any) => {
      if (!branchId || s.branch_id === branchId) {
        totalStock += s.quantity || 0;
      }
    });
  });

  return { ...p, images: parsedImages, stock: totalStock, hasStock: totalStock > 0 };
}

export function RelatedProducts({ currentProductId, category, branchId }: Props) {
  const [products, setProducts] = useState<(Product & { images: string[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setLoading(false);
      return;
    }
    loadRelated();
  }, [currentProductId, category, branchId]);

  const loadRelated = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(
            *,
            stock(*)
          )
        `)
        .eq('category', category)
        .eq('is_visible', true)
        .neq('id', currentProductId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error || !data) return;

      const mapped = data
        .map(p => mapRelatedProduct(p, branchId))
        .filter(p => p.hasStock)
        .slice(0, 6);

      setProducts(mapped);
    } catch (err) {
      console.error('[RelatedProducts] Error loading:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-white border-t border-gray-100">
        <div className="w-full px-4 md:px-8 max-w-[1800px] mx-auto">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <h2 className="text-xl md:text-2xl font-bold text-black tracking-tighter uppercase">
              También te puede gustar
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/5] bg-gray-100 animate-pulse" />
                <div className="h-3 bg-gray-100 animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white border-t border-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="w-full px-4 md:px-8 max-w-[1800px] mx-auto"
      >
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold text-black tracking-tighter uppercase">
            También te puede gustar
          </h2>
          <Link
            href="/shop"
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
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"
        >
          {products.map(product => {
            const slug = `${product.id}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

            return (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                }}
              >
                <Link href={`/producto/${slug}`} className="group cursor-pointer block flex flex-col h-full">
                  <div className="aspect-[4/5] bg-[#f5f5f5] w-full relative overflow-hidden mb-3">
                    {product.images[0] ? (
                      <Image
                        src={getWeservUrl(product.images[0], { w: 600 })}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        quality={80}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-6xl font-bold">
                        {product.name.charAt(0)}
                      </div>
                    )}
                    {product.discount_percentage && product.discount_percentage > 0 ? (
                      <span className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1">
                        -{product.discount_percentage}%
                      </span>
                    ) : null}
                  </div>

                  <div className="flex justify-between items-start w-full px-1 mt-auto">
                    <div className="flex flex-col">
                      <h3 className="text-[10px] md:text-[11px] font-bold text-black mb-1 capitalize tracking-tight line-clamp-1 group-hover:text-gray-500 transition-colors">
                        {product.name.toLowerCase()}
                      </h3>
                      {product.original_price && product.discount_percentage && product.discount_percentage > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 line-through">
                            Bs. {Number(product.original_price).toFixed(2)}
                          </span>
                          <span className="text-[10px] md:text-[11px] font-bold text-black">
                            Bs. {(product.original_price * (1 - product.discount_percentage / 100)).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] md:text-[11px] font-bold text-black">
                          Bs. {Number(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
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
