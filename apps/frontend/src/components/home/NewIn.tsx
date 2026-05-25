'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { productsService } from '@/services/products.service';
import { Product } from '@/lib/database.types';
import { NewInConfig } from '@/services/cms.service';
import { useBranch } from '@/contexts/BranchContext';
import { getWeservUrl } from '@/utils/weserv';
import { formatCurrency } from '@/utils/format';

interface Props {
  config: NewInConfig;
}

export function NewIn({ config }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { selectedBranch, isLoaded: branchLoaded } = useBranch();
  const branchId = selectedBranch?.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && branchLoaded) {
      loadProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, branchLoaded, branchId]);

  const loadProducts = async () => {
    try {
      const ids = config?.product_ids ?? [];

      if (ids.length > 0) {
        const { data } = await supabase
          .from('products')
          .select(`
            *,
            variants:product_variants(
              *,
              stock(*)
            )
          `)
          .in('id', ids)
          .eq('is_visible', true);

        if (data && data.length > 0) {
          const mapped = ids
            .map(id => data.find((p: any) => p.id === id))
            .filter(Boolean)
            .map((p: any) => {
              let parsedImages: string[] = [];
              if (Array.isArray(p.images)) parsedImages = p.images;
              else if (typeof p.images === 'string') {
                try { parsedImages = JSON.parse(p.images); } catch {
                  parsedImages = p.images.replace(/^{|}$/g, '').split(',').map((u: string) => u.trim().replace(/^"|"$/g, '')).filter(Boolean);
                }
              }
              if (parsedImages.length === 0 && p.image_url) parsedImages = [p.image_url];

              let totalStock = 0;
              (p.variants || []).forEach((v: any) => {
                (v.stock || []).forEach((s: any) => {
                  if (!branchId || s.branch_id === branchId) {
                    totalStock += s.quantity || 0;
                  }
                });
              });

              return { ...p, images: parsedImages, stock: totalStock, hasStock: totalStock > 0 } as Product;
            });

          setProducts(mapped as Product[]);
          return;
        }
      }

      // Fallback: los más recientes por created_at
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(
            *,
            stock(*)
          )
        `)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(5);

      const mapped = (data || []).map((p: any) => {
        let parsedImages: string[] = [];
        if (Array.isArray(p.images)) parsedImages = p.images;
        else if (typeof p.images === 'string') {
          try { parsedImages = JSON.parse(p.images); } catch {
            parsedImages = p.images.replace(/^{|}$/g, '').split(',').map((u: string) => u.trim().replace(/^"|"$/g, '')).filter(Boolean);
          }
        }
        if (parsedImages.length === 0 && p.image_url) parsedImages = [p.image_url];

        let totalStock = 0;
        (p.variants || []).forEach((v: any) => {
          (v.stock || []).forEach((s: any) => {
            if (!branchId || s.branch_id === branchId) {
              totalStock += s.quantity || 0;
            }
          });
        });

        return { ...p, images: parsedImages, stock: totalStock, hasStock: totalStock > 0 } as Product;
      });

      setProducts(mapped);
    } catch (err) {
      console.error('[NewIn] Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const sectionTitle = config?.title || 'New In';

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="w-full px-4 md:px-8 max-w-[1800px] mx-auto">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <h2 className="text-xl md:text-2xl font-bold text-black tracking-tighter uppercase">{sectionTitle}</h2>
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
    <section id="new-in" className="py-16 md:py-20 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="w-full px-4 md:px-8 max-w-[1800px] mx-auto"
      >
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold text-black tracking-tighter uppercase">{sectionTitle}</h2>
          <Link
            href="/shop"
            className="px-4 py-2 bg-gray-100 text-black text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-sm"
          >
            View All
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
            const images = (product as any).images || [product.image_url].filter(Boolean);

            return (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                }}
              >
                <Link href={`/producto/${slug}`} className="group cursor-pointer block flex flex-col h-full" prefetch={true}>
                  <div className="aspect-[4/5] bg-[#f5f5f5] w-full relative overflow-hidden mb-3">
                    {images[0] ? (
                      <Image
                        src={getWeservUrl(images[0], { w: 600 })}
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


                  </div>

                  <div className="flex justify-between items-start w-full px-1 mt-auto">
                    <div className="flex flex-col">
                      <h3 className="text-[10px] md:text-[11px] font-bold text-black mb-1 capitalize tracking-tight line-clamp-1 group-hover:text-gray-500 transition-colors">
                        {product.name.toLowerCase()}
                      </h3>
                      {product.original_price && product.discount_percentage && product.discount_percentage > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 line-through">{formatCurrency(Number(product.original_price))}</span>
                          <span className="text-[10px] md:text-[11px] font-bold text-black">
                            {formatCurrency(Number(product.price))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] md:text-[11px] font-bold text-black">
                          {formatCurrency(Number(product.price))}
                        </span>
                      )}
                    </div>
                    {!(product as any).hasStock && (
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sold Out</span>
                    )}
                    {(product as any).web_only && (product as any).hasStock && (
                      <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1">Solo Web</span>
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
