'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { productsService } from '@/services/products.service';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/lib/database.types';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

// Inner component handling the logic
function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  const categories = ['all', 'Camisetas', 'Sudaderas', 'Pantalones', 'Accesorios', 'Calzado', 'Gorras', 'Otros'];

  useEffect(() => {
    setMounted(true);
    // Hydrate cart store from localStorage
    useCartStore.persist.rehydrate();
    loadProducts();
  }, []);

  // Effect to handle URL param changes (e.g. from SearchOverlay while already on the page)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchTerm(q);
      setSelectedCategory('all'); // Reset category to prioritize search term
    }
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Prevent hydration errors by rendering only on client
  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-bg pt-32 pb-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-light text-white tracking-tighter mb-6">
              Shop
            </h1>
            <div className="h-px w-24 bg-white/30 mx-auto mb-6" />
            <p className="text-gray-light text-xs tracking-[0.3em] uppercase">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-36 lg:pt-40 pb-20">
      <div className="container-custom">
        <div className="flex flex-col gap-8">
          {/* Horizontal Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 pb-6 w-full">
            {/* Categories */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === category
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-400 hover:text-black'
                      }`}
                  >
                    {category === 'all' ? 'Todos' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-transparent border-b border-gray-200 text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                  <Search size={18} strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full">
            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-square bg-gray-100 animate-pulse" />
                    <div className="h-4 bg-gray-100 animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-100 animate-pulse w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-2">No se encontraron productos</p>
                <p className="text-gray-400 text-sm">Intenta con otros términos de búsqueda</p>
              </div>
            )}

            {/* Products Grid */}
            {!loading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const hasStock = (product as any).hasStock;
                  const slug = `${product.id}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

                  return (
                    <Link
                      key={product.id}
                      href={`/producto/${slug}`}
                      className="group cursor-pointer block"
                      prefetch={true}
                    >
                      {/* Image */}
                      <div className="aspect-square bg-gray-50 relative overflow-hidden mb-4 border border-gray-100">
                        {product.image_url || (product as any).images?.[0] ? (
                          <Image
                            src={(product as any).images?.[0] || product.image_url || ''}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            quality={75}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-6xl font-bold">
                            {product.name.charAt(0)}
                          </div>
                        )}

                        {/* Stock Badge */}
                        {!hasStock && (
                          <div className="absolute top-3 right-3">
                            <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-widest">
                              SOLD OUT
                            </span>
                          </div>
                        )}

                        {/* Quick View on Hover */}
                        {hasStock && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-black uppercase tracking-wide line-clamp-2 group-hover:text-gray-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-black">
                          ${product.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapping ShopPage in Suspense since it uses useSearchParams
export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white pt-32 pb-20 flex items-center justify-center">
        <p className="text-gray-400 text-xs tracking-[0.3em] uppercase animate-pulse">Cargando Tienda...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
