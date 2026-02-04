'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsService } from '@/services/products.service';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/lib/database.types';
import toast from 'react-hot-toast';

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  const categories = ['all', 'Camisetas', 'Sudaderas', 'Pantalones', 'Accesorios', 'Calzado', 'Gorras', 'Otros'];

  useEffect(() => {
    setMounted(true);
    // Hydrate cart store from localStorage
    useCartStore.persist.rehydrate();
    loadProducts();
  }, []);

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

  const handleProductClick = (product: Product) => {
    const slug = `${product.id}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    router.push(`/producto/${slug}`);
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
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-32 space-y-6">
              {/* Search */}
              <div>
                <label className="block text-xs font-bold text-black mb-3 uppercase tracking-widest">
                  Buscar
                </label>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold text-black mb-3 uppercase tracking-widest">
                  Categorías
                </h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-4 py-3 text-sm font-medium uppercase tracking-wide transition-all ${
                        selectedCategory === category
                          ? 'bg-black text-white'
                          : 'text-black hover:bg-gray-100 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      {category === 'all' ? 'Todos los productos' : category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters */}
            <div className="space-y-4 mb-8">
              {/* Search - Mobile */}
              <div className="lg:hidden">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black"
                />
              </div>
              
              {/* Categories - Mobile */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-2 ${
                      selectedCategory === category
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-200 hover:border-black'
                    }`}
                  >
                    {category === 'all' ? 'Todos' : category}
                  </button>
                ))}
              </div>
            </div>

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
                  
                  return (
                  <div
                    key={product.id}
                    className="group cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Image */}
                    <div className="aspect-square bg-gray-50 relative overflow-hidden mb-4 border border-gray-100">
                      {product.image_url || (product as any).images?.[0] ? (
                        <img
                          src={(product as any).images?.[0] || product.image_url || ''}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
