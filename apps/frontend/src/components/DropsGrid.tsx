'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/database.types';
import { productsService } from '@/services/products.service';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function DropsGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDrop, setHoveredDrop] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const addItem = useCartStore((state) => state.addItem);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Imágenes alternativas para hover
  const hoverImages = [
    'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop'
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsService.getProducts();
        setProducts(data.slice(0, 6)); // Mostrar 6 drops
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleOpenSizeModal = (product: Product) => {
    if (!product.stock || product.stock === 0) {
      toast.error('Producto sin stock');
      return;
    }
    setSelectedProduct(product);
    setSelectedSize('M');
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    try {
      addItem({
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        size: selectedSize,
        quantity: 1,
        image_url: selectedProduct.image_url || ''
      });
      toast.success(`✓ ${selectedProduct.name} agregado al carrito`);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error al agregar al carrito');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border border-white/10 bg-dark-card overflow-hidden">
            <div className="aspect-[4/5] bg-dark-bg animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-dark-bg animate-pulse rounded" />
              <div className="h-3 bg-dark-bg animate-pulse rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => {
          const isHovered = hoveredDrop === product.id;
          const mainImage = product.image_url || hoverImages[index % hoverImages.length];
          const altImage = hoverImages[(index + 1) % hoverImages.length];

          return (
            <article
              key={product.id}
              className="group cursor-pointer border border-white/10 bg-dark-card overflow-hidden hover:border-white/30 transition-all hover:shadow-2xl relative"
              onMouseEnter={() => setHoveredDrop(product.id)}
              onMouseLeave={() => setHoveredDrop(null)}
            >
              {/* Badge de stock limitado */}
              {(product.stock || 0) > 0 && (product.stock || 0) <= 20 && (
                <div className="absolute top-3 left-3 z-20 text-xs font-light bg-red-600 text-white px-3 py-1 uppercase tracking-wider">
                  Solo {product.stock} unidades 🔥
                </div>
              )}

              {/* Badge sin stock */}
              {(!product.stock || product.stock === 0) && (
                <div className="absolute top-3 right-3 z-20 text-xs font-light bg-gray-800 text-white px-3 py-1 uppercase tracking-wider">
                  Sin Stock
                </div>
              )}

              <div className="relative">
                <div className="relative bg-dark-bg aspect-[4/5] overflow-hidden">
                  {/* Imagen principal */}
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-cover transition-all duration-500 ${
                      isHovered ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
                    }`}
                    loading="lazy"
                    quality={75}
                  />
                  
                  {/* Imagen en hover */}
                  <Image
                    src={altImage}
                    alt={`${product.name} - vista alternativa`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-cover transition-all duration-500 ${
                      isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                    }`}
                    loading="lazy"
                    quality={75}
                  />

                  {/* Overlay con botón en hover */}
                  <div className={`absolute inset-0 bg-black/90 flex items-center justify-center transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSizeModal(product);
                      }}
                      disabled={!product.stock || product.stock === 0}
                      className={`px-8 py-3 text-xs font-light tracking-widest uppercase transition-all transform hover:scale-105 ${
                        !product.stock || product.stock === 0
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-black hover:bg-white/90'
                      }`}
                    >
                      {!product.stock || product.stock === 0 ? 'Sin Stock' : 'Comprar Ahora'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-dark-card">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-light text-white uppercase tracking-tight">
                    {product.name}
                  </h3>
                  <span className="text-lg font-light text-white whitespace-nowrap">
                    Bs. {product.price.toFixed(2)}
                  </span>
                </div>
                {product.description && (
                  <p className="text-xs text-gray-light mb-3 leading-relaxed font-light line-clamp-2">
                    {product.description}
                  </p>
                )}
                
                {/* Barra de stock */}
                {(product.stock || 0) > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-light text-gray-medium">
                      <span>Disponibilidad</span>
                      <span>{product.stock} unidades</span>
                    </div>
                    <div className="w-full bg-dark-bg h-1.5">
                      <div 
                        className="bg-white h-1.5 transition-all"
                        style={{ width: `${Math.min(((product.stock || 0) / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Size Selection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          />
          
          {/* Modal */}
          <div className="relative bg-dark-card border border-white/10 max-w-md w-full p-8">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-gray-light hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-light text-white mb-2 tracking-tight">
              {selectedProduct.name}
            </h3>
            <p className="text-lg text-white mb-6 font-light">
              Bs. {selectedProduct.price.toFixed(2)}
            </p>

            <div className="mb-6">
              <label className="block text-sm text-gray-light mb-3 uppercase tracking-wider font-light">
                Selecciona tu talla:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-sm font-light tracking-wider transition-all ${
                      selectedSize === size
                        ? 'bg-white text-black'
                        : 'bg-dark-bg text-white border border-white/10 hover:border-white/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-white text-black py-4 text-xs font-light tracking-widest uppercase hover:bg-white/90 transition-all"
            >
              Agregar al Carrito - Talla {selectedSize}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
