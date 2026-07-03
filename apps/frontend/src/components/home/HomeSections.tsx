'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getWeservUrl } from '@/utils/weserv';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { HomeSection } from '@/services/cms.service';
import { Product } from '@/lib/database.types';
import { formatCurrency } from '@/utils/format';

interface Props {
  sections: HomeSection[];
}

export function HomeSections({ sections }: Props) {
  if (!sections || sections.length === 0) return null;

  return (
    <div>
      {sections.map((section, idx) => (
        <SectionBlock key={section.id || idx} section={section} idx={idx} />
      ))}
    </div>
  );
}

function SectionBlock({ section, idx }: { section: HomeSection; idx: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [section]);

  const loadProducts = async () => {
    try {
      let query;

      if (section.type === 'tag' && section.tag) {
        // Fetch products with this specific tag
        const { data: tagData } = await supabase
          .from('product_tags')
          .select('id')
          .eq('name', section.tag)
          .single();

        if (tagData) {
          const { data: assignments } = await supabase
            .from('product_tag_assignments')
            .select('product_id')
            .eq('tag_id', tagData.id)
            .limit(10);

          const ids = (assignments || []).map(a => a.product_id);
          if (ids.length > 0) {
            const { data } = await supabase
              .from('products')
              .select('*, variants:product_variants(*, stock(*))')
              .in('id', ids)
              .eq('is_visible', true)
              .eq('visible_on_web', true);
            setProducts((data || []).map(mapProduct));
          }
        }
      } else if (section.type === 'products' && section.product_ids && section.product_ids.length > 0) {
        // Fetch specific products in order
        const { data } = await supabase
          .from('products')
          .select('*, variants:product_variants(*, stock(*))')
          .in('id', section.product_ids)
          .eq('is_visible', true)
          .eq('visible_on_web', true);
        if (data) {
          const ordered = section.product_ids
            .map(id => data.find(p => p.id === id))
            .filter(Boolean)
            .map(mapProduct);
          setProducts(ordered as Product[]);
        }
      }
    } catch (err) {
      console.error('[HomeSections] Error loading section', section.title, err);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className={`py-12 md:py-16 ${idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="w-full px-4 md:px-8 max-w-[1800px] mx-auto"
      >
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold text-black tracking-tighter uppercase">
            {section.title}
          </h2>
          {section.type === 'tag' && section.tag && (
            <Link
              href={`/shop`}
              className="px-4 py-2 bg-gray-100 text-black text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-sm"
            >
              Ver Todo
            </Link>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                <div className="h-3 bg-gray-100 animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {products.map(product => {
              const slug = `${product.id}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
              const images = (product as any).images || [product.image_url].filter(Boolean);

              return (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
                  }}
                >
                  <Link href={`/producto/${slug}`} className="group cursor-pointer block" prefetch={true}>
                    <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden mb-3 border border-gray-100">
                      {images[0] ? (
                        <Image
                          src={getWeservUrl(images[0], { w: 600 })}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          loading="lazy"
                          quality={75}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-5xl font-bold">
                          {product.name.charAt(0)}
                        </div>
                      )}



                      {!(product as any).hasStock && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="inline-block px-2 py-1 bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                      {(product as any).web_only && (product as any).hasStock && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="inline-block px-2 py-1 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-widest">
                            SOLO WEB
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="px-1 space-y-1">
                      <h3 className="text-[11px] md:text-xs font-bold text-black uppercase tracking-wide line-clamp-1 group-hover:text-gray-500 transition-colors">
                        {product.name}
                      </h3>
                      {product.original_price && product.discount_percentage && product.discount_percentage > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 line-through">{formatCurrency(Number(product.original_price))}</span>
                          <span className="text-xs font-bold text-black">
                            {formatCurrency(Number(product.price))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-black">{formatCurrency(Number(product.price))}</span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

// Helper to map raw product data
function mapProduct(p: any): Product {
  let totalStock = 0;
  let parsedImages: string[] = [];

  if (Array.isArray(p.images)) parsedImages = p.images;
  else if (typeof p.images === 'string') {
    try { parsedImages = JSON.parse(p.images); } catch {
      parsedImages = p.images.replace(/^{|}$/g, '').split(',').map((u: string) => u.trim().replace(/^"|"$/g, '')).filter(Boolean);
    }
  }
  if (parsedImages.length === 0 && p.image_url) parsedImages = [p.image_url];

  (p.variants || []).forEach((v: any) => {
    (v.stock || []).forEach((s: any) => { totalStock += s.quantity || 0; });
  });

  return { ...p, images: parsedImages, stock: totalStock, hasStock: totalStock > 0 } as Product;
}
