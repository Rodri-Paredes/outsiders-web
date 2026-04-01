'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productsService } from '@/services/products.service';
import { Product } from '@/lib/database.types';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const loadProducts = async () => {
      try {
        // Obtenemos la sección
        const { data: section } = await supabase
          .from('featured_sections')
          .select('id, section_name')
          .eq('section_name', 'New Arrivals')
          .single();

        if (section) {
          const { data: featured } = await supabase
            .from('featured_products')
            .select('product_id, display_order')
            .eq('section_id', section.id)
            .order('display_order');

          const prodIds = featured?.map(f => f.product_id) || [];
          
          if (prodIds.length > 0) {
            const { data: prods } = await supabase
              .from('products')
              .select('*')
              .in('id', prodIds);

            // Mantener el orden del CMS
            const sortedProds = prodIds
              .map(id => prods?.find(p => p.id === id))
              .filter(Boolean);

            setProducts(sortedProds as Product[]);
          } else {
            // Fallback si no hay productos configurados
            const data = await productsService.getProducts();
            setProducts(data.slice(0, 5));
          }
        } else {
          // Fallback
          const data = await productsService.getProducts();
          setProducts(data.slice(0, 5));
        }
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback
        const data = await productsService.getProducts();
        setProducts(data.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <section id="best-sellers" className="section-padding bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight uppercase">
              Best Sellers
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="h-4 bg-gray-100 animate-pulse w-3/4" />
                <div className="h-4 bg-gray-100 animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section id="best-sellers" className="py-16 md:py-20 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="w-full px-4 md:px-8 max-w-[1800px] mx-auto"
      >
        {/* Header - Gods Brand Style */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold text-black tracking-tighter uppercase">
            Best Sellers
          </h2>
          <Link
            href="/shop"
            className="px-4 py-2 bg-gray-100 text-black text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded-sm"
          >
            View All
          </Link>
        </div>

        {/* Grid - 5 Columns */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"
        >
          {products.map((product) => {
            const slug = `${product.id}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            return (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                }}
              >
                <Link
                  href={`/producto/${slug}`}
                  className="group cursor-pointer block flex flex-col h-full"
                  prefetch={true}
                >
                  {/* Image */}
                  <div className="aspect-[4/5] bg-[#f5f5f5] w-full relative overflow-hidden mb-3">
                    {/* Hover Right Arrow like in Gods Brand */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 9L5 5L1 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    {product.image_url || (product as any).images?.[0] ? (
                      <Image
                        src={(product as any).images?.[0] || product.image_url || ''}
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

                  {/* Product Info - Editorial Style */}
                  <div className="flex justify-between items-start w-full px-1 mt-auto">
                    <div className="flex flex-col">
                      <h3 className="text-[10px] md:text-[11px] font-bold text-black mb-1 capitalize tracking-tight line-clamp-1 group-hover:text-gray-500 transition-colors">
                        {product.name.toLowerCase()}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-[11px] font-bold text-black">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Color Swatches */}
                    {(product as any).hasStock ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-black border border-gray-200"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300 border border-gray-200"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#fdfdfd] border border-gray-300 shadow-sm"></div>
                      </div>
                    ) : (
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Sold Out
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </section >
  );
}
