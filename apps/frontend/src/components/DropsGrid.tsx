'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getWeservUrl } from '@/utils/weserv';
import { Product } from '@/lib/database.types';
import { productsService } from '@/services/products.service';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

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
              className="group cursor-pointer flex flex-col w-full relative"
              onMouseEnter={() => setHoveredDrop(product.id)}
              onMouseLeave={() => setHoveredDrop(null)}
              onClick={() => handleOpenSizeModal(product)}
            >
              {/* Badge de stock limitado */}
              {(product.stock || 0) > 0 && (product.stock || 0) <= 20 && (
                <div className="absolute top-3 left-3 z-30 text-[9px] font-bold bg-white text-black px-2 py-1 uppercase tracking-widest border border-gray-200 shadow-sm">
                  Solo {product.stock} left
                </div>
              )}

              {/* Badge sin stock */}
              {(!product.stock || product.stock === 0) && (
                <div className="absolute top-3 left-3 z-30 text-[9px] font-bold bg-black text-white px-2 py-1 uppercase tracking-widest">
                  Out of Stock
                </div>
              )}

              {/* Image Container */}
              <div className="relative bg-[#f5f5f5] aspect-[4/5] w-full overflow-hidden mb-3">
                {/* Hover Right Arrow like in Gods Brand */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 9L5 5L1 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Imagen principal */}
                <Image
                  src={getWeservUrl(mainImage, { w: 600 })}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'
                    }`}
                  loading="lazy"
                  quality={80}
                />

                {/* Imagen en hover */}
                <Image
                  src={getWeservUrl(altImage, { w: 600 })}
                  alt={`${product.name} - vista alternativa`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  loading="lazy"
                  quality={80}
                />
              </div>

              {/* Info Container */}
              <div className="flex justify-between items-start w-full px-1">
                {/* Left Side: Name and Price */}
                <div className="flex flex-col">
                  <h3 className="text-[10px] md:text-[11px] font-bold text-black mb-1 capitalize tracking-tight">
                    {product.name.toLowerCase()}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-[11px] font-bold text-black">
                      {formatCurrency(Number(product.price))}
                    </span>
                  </div>
                </div>

                {/* Right Side: Colors */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-black border border-gray-200"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300 border border-gray-200"></div>
                </div>
              </div>

              {/* Drops Stock Bar Adapted for Light Theme */}
              {(product.stock || 0) > 0 && (
                <div className="space-y-1 px-1 mt-3">
                  <div className="flex justify-between text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                    <span>Availability</span>
                    <span className="text-black">{product.stock} units</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-1 transition-all"
                      style={{ width: `${Math.min(((product.stock || 0) / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
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
              {formatCurrency(selectedProduct.price)}
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
                    className={`py-3 text-sm font-light tracking-wider transition-all ${selectedSize === size
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
