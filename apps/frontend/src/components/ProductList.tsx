'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Product } from '../lib/database.types';
import { useCartStore } from '@/store/cartStore';
import { productsService } from '../services/products.service';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function ProductList() {
  const addItem = useCartStore((state) => state.addItem);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');

  useEffect(() => {
    productsService.getAll()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch products', err);
        setLoading(false);
      });
  }, []);

  // Get available sizes from product variants
  const getAvailableSizes = (product: Product): string[] => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map(v => v.size);
    }
    // Fallback to default sizes
    return ['XS', 'S', 'M', 'L', 'XL'];
  };

  // Calculate final price considering discount
  const getFinalPrice = (product: Product): number => {
    if (product.original_price && product.discount_percentage && product.discount_percentage > 0) {
      return product.original_price * (1 - product.discount_percentage / 100);
    }
    return product.price;
  };

  const hasDiscount = (product: Product): boolean => {
    return !!(product.original_price && product.discount_percentage && product.discount_percentage > 0);
  };

  const handleOpenSizeModal = (product: Product) => {
    if (!product.hasStock && product.stock === 0) {
      toast.error('Producto sin stock');
      return;
    }
    setSelectedProduct(product);
    const sizes = getAvailableSizes(product);
    setSelectedSize(sizes.includes('M') ? 'M' : sizes[0] || 'M');
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    try {
      addItem({
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: getFinalPrice(selectedProduct),
        size: selectedSize,
        quantity: 1,
        image_url: selectedProduct.image_url || ''
      });
      toast.success(`✓ ${selectedProduct.name} agregado al carrito`);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error adding to cart', error);
      toast.error('Error al agregar al carrito');
    }
  };

  if (loading)
    return (
      <div className="text-center p-10 text-gray-500 font-medium text-sm">
        cargando productos...
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const productImages = (product as any).images || (product.image_url ? [product.image_url] : []);
        const mainImage = productImages[0] || '';
        const hoverImage = productImages[1] || mainImage;
        const isHovered = hoveredProduct === product.id;
        const discount = hasDiscount(product);
        const finalPrice = getFinalPrice(product);

        return (
          <article
            key={product.id}
            className="group cursor-pointer flex flex-col w-full"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
            onClick={() => handleOpenSizeModal(product)}
          >
            {/* Image Container */}
            <div className="relative bg-[#f5f5f5] aspect-[4/5] w-full overflow-hidden mb-3">
              {/* Discount Badge */}
              {discount && (
                <div className="absolute top-3 left-3 z-20">
                  <span className="inline-flex items-center px-2.5 py-1 bg-black text-white text-[10px] font-bold tracking-wider uppercase">
                    -{product.discount_percentage}%
                  </span>
                </div>
              )}

              {/* Hover Right Arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 9L5 5L1 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Imagen principal */}
              {mainImage && (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={`object-cover transition-opacity duration-500 ${isHovered && hoverImage !== mainImage ? 'opacity-0' : 'opacity-100'
                    }`}
                  loading="lazy"
                  quality={80}
                />
              )}

              {/* Imagen en hover */}
              {hoverImage && hoverImage !== mainImage && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} - alternativa`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={`object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  loading="lazy"
                  quality={80}
                />
              )}
            </div>

            {/* Info Container */}
            <div className="flex justify-between items-start w-full px-1">
              {/* Left Side: Name and Price */}
              <div className="flex flex-col">
                <h3 className="text-[10px] md:text-[11px] font-bold text-black mb-1 capitalize tracking-tight">
                  {product.name.toLowerCase()}
                </h3>
                <div className="flex items-center gap-2">
                  {discount ? (
                    <>
                      <span className="text-[10px] md:text-[11px] text-gray-400 line-through">
                        Bs. {Number(product.original_price).toFixed(2)}
                      </span>
                      <span className="text-[10px] md:text-[11px] font-bold text-black">
                        Bs. {finalPrice.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] md:text-[11px] font-bold text-black">
                      Bs. {Number(product.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side: Colors */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-black border border-gray-200"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300 border border-gray-200"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#fdfdfd] border border-gray-300 shadow-sm"></div>
              </div>
            </div>
          </article>
        );
      })}

      {/* Size Selection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          />

          {/* Modal */}
          <div className="relative bg-white border-2 border-gray-200 max-w-md w-full p-8 rounded-lg">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-black mb-2">
              {selectedProduct.name}
            </h3>
            
            {/* Price with discount */}
            <div className="mb-6">
              {hasDiscount(selectedProduct) ? (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-400 line-through">
                    Bs. {Number(selectedProduct.original_price).toFixed(2)}
                  </p>
                  <p className="text-xl text-black font-bold">
                    Bs. {getFinalPrice(selectedProduct).toFixed(2)}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 bg-black text-white text-xs font-bold rounded">
                    -{selectedProduct.discount_percentage}%
                  </span>
                </div>
              ) : (
                <p className="text-xl text-black font-bold">
                  Bs. {selectedProduct.price.toFixed(2)}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-3 uppercase tracking-wider font-semibold">
                Selecciona tu talla:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {getAvailableSizes(selectedProduct).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-sm font-bold tracking-wider transition-all rounded ${selectedSize === size
                        ? 'bg-[#2d5f5d] text-[#d4a574]'
                        : 'bg-gray-100 text-black border-2 border-gray-200 hover:border-[#2d5f5d]'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-[#2d5f5d] text-[#d4a574] py-4 text-sm font-bold tracking-wider uppercase hover:bg-[#3a6b6a] transition-all rounded"
            >
              Agregar al Carrito - Talla {selectedSize}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
