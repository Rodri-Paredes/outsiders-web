'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsService } from '@/services/products.service';
import { Product } from '@/lib/database.types';

export function NewArrivals() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const loadProducts = async () => {
      try {
        const data = await productsService.getProducts();
        setProducts(data.slice(0, 8)); // Show only first 8
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleProductClick = (product: Product) => {
    const slug = `${product.id}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    router.push(`/producto/${slug}`);
  };

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
    <section id="best-sellers" className="section-padding bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight uppercase mb-2">
            Best Sellers
          </h2>
          <p className="text-gray-500 text-sm">Our most popular items</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              {/* Image */}
              <div className="aspect-square bg-gray-50 relative overflow-hidden mb-4">
                {product.image_url || (product as any).images?.[0] ? (
                  <img
                    src={(product as any).images?.[0] || product.image_url || ''}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-6xl font-bold">
                    {product.name.charAt(0)}
                  </div>
                )}
                
                {/* Quick Add Button - Appears on hover */}
                {(product as any).hasStock && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center pb-6">
                    <button className="px-6 py-2.5 bg-white text-black text-xs font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                      Add to Cart
                    </button>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <h3 className="text-sm font-medium text-black mb-1.5 uppercase tracking-wide">
                  {product.name}
                </h3>
                <p className="text-base font-semibold text-black mb-3">
                  ${product.price?.toFixed(2) || '0.00'}
                </p>
                
                {/* Color Options */}
                {(product as any).hasStock ? (
                  <div className="flex gap-1.5">
                    <button className="w-5 h-5 rounded-full bg-black border-2 border-gray-200 hover:border-gray-400 transition-colors"></button>
                    <button className="w-5 h-5 rounded-full bg-gray-600 border-2 border-gray-200 hover:border-gray-400 transition-colors"></button>
                    <button className="w-5 h-5 rounded-full bg-blue-900 border-2 border-gray-200 hover:border-gray-400 transition-colors"></button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
