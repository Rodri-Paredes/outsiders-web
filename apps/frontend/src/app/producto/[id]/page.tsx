'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { productsService } from '@/services/products.service';
import { Product } from '@/lib/database.types';
import { useCartStore } from '@/store/cartStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Sizes are now loaded dynamically from product variants

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [availableSizes, setAvailableSizes] = useState<{[key: string]: number}>({});
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
    useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const slug = params.id as string;
        
        // Extract product ID from slug
        // Format: UUID-name-slug or simple-id-name-slug
        // UUIDs have format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars with dashes)
        let productId: string;
        
        // Check if slug starts with UUID pattern
        const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
        const uuidMatch = slug.match(uuidPattern);
        
        if (uuidMatch) {
          // Extract UUID
          productId = uuidMatch[1];
        } else {
          // Fallback: assume first part before dash is the ID
          productId = slug.split('-')[0];
        }
        
        console.log('Loading product with ID:', productId, 'from slug:', slug);
        
        // Fetch only this product
        const foundProduct = await productsService.getById(productId);
        
        console.log('Found product:', foundProduct);
        
        if (foundProduct) {
          setProduct(foundProduct);
          
          // Calculate available stock per size
          const sizeStock: {[key: string]: number} = {};
          foundProduct.variants?.forEach(variant => {
            const totalStock = variant.stock?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;
            sizeStock[variant.size] = totalStock;
          });
          setAvailableSizes(sizeStock);
          
          // Build sizes list from variants
          const variantSizes = foundProduct.variants?.map(v => v.size) || [];
          
          // Set default selected size to first available size
          const firstAvailableSize = variantSizes.find(size => (sizeStock[size] || 0) > 0);
          if (firstAvailableSize) {
            setSelectedSize(firstAvailableSize);
          } else if (variantSizes.length > 0) {
            setSelectedSize(variantSizes[0]);
          }
        } else {
          console.error('Product not found for ID:', productId);
          toast.error('Producto no encontrado');
          router.push('/shop');
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Error al cargar el producto');
        router.push('/shop');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadProduct();
    }
  }, [params.id, router]);

  const handleAddToCart = () => {
    const selectedSizeStock = availableSizes[selectedSize] || 0;
    
    if (!product || selectedSizeStock <= 0) {
      toast.error('Talla sin stock');
      return;
    }

    // Check how many of this product+size are already in cart
    const existingItem = items.find(
      item => item.productId === product.id && item.size === selectedSize
    );
    const quantityInCart = existingItem ? existingItem.quantity : 0;

    // Don't add if already at limit (validation is in button disabled state)
    if (quantityInCart >= selectedSizeStock) {
      return;
    }

    try {
      const images = (product as any).images || [product.image_url].filter(Boolean);
      const finalPrice = product.original_price && product.discount_percentage && product.discount_percentage > 0
        ? product.original_price * (1 - product.discount_percentage / 100)
        : product.price;
      addItem({
        productId: product.id,
        name: product.name,
        price: finalPrice,
        size: selectedSize,
        quantity: 1,
        image_url: images[0] || '',
        availableStock: selectedSizeStock
      });
      toast.success(`✓ ${product.name} agregado al carrito`);
      
      // Trigger cart drawer to open
      window.dispatchEvent(new CustomEvent('openCart'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error al agregar al carrito');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = (product as any).images || [product.image_url].filter(Boolean);
  const hasStock = (product as any).hasStock;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            {images.length > 0 ? (
              <>
                <div className="aspect-square bg-gray-50 relative mb-4 overflow-hidden">
                  {images.map((img: string, index: number) => (
                    <Image
                      key={`${img}-${index}`}
                      src={img}
                      alt={`${product.name} - view ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={`object-cover transition-opacity duration-300 ${
                        index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                      priority={index === 0}
                      quality={80}
                    />
                  ))}

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6 text-black" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <ChevronRight className="w-6 h-6 text-black" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-24 h-24 border-2 transition-all relative overflow-hidden ${
                          index === currentImageIndex
                            ? 'border-black'
                            : 'border-gray-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          sizes="96px"
                          className="object-cover"
                          loading="lazy"
                          quality={60}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-6xl font-bold">
                {product.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category */}
            {product.category && (
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
                {product.category}
              </p>
            )}

            {/* Name */}
            <div className="flex items-start gap-4 mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-black uppercase tracking-tight">
                {product.name}
              </h1>
              {!hasStock && (
                <span className="inline-block px-4 py-2 bg-red-500 text-white text-xs font-bold uppercase tracking-widest">
                  Sold Out
                </span>
              )}
            </div>

            {/* Price */}
            {product.original_price && product.discount_percentage && product.discount_percentage > 0 ? (
              <div className="flex items-center gap-4 mb-8">
                <p className="text-xl text-gray-400 line-through">
                  Bs. {Number(product.original_price).toFixed(2)}
                </p>
                <p className="text-3xl font-semibold text-black">
                  Bs. {(product.original_price * (1 - product.discount_percentage / 100)).toFixed(2)}
                </p>
                <span className="inline-flex items-center px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider">
                  -{product.discount_percentage}%
                </span>
              </div>
            ) : (
              <p className="text-3xl font-semibold text-black mb-8">
                Bs. {product.price?.toFixed(2) || '0.00'}
              </p>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 text-base mb-8 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Size Selection */}
            <div className="mb-10">
              <label className="block text-sm font-semibold text-black mb-4 uppercase tracking-wider">
                Selecciona tu talla:
              </label>
              <div className="grid grid-cols-5 gap-3">
                {(product.variants?.map(v => v.size) || []).map((size) => {
                  const sizeStock = availableSizes[size] || 0;
                  const hasStockForSize = sizeStock > 0;
                  
                  return (
                  <button
                    key={size}
                    onClick={() => hasStockForSize && setSelectedSize(size)}
                    disabled={!hasStockForSize}
                    className={`py-4 text-sm font-medium uppercase tracking-wider border-2 transition-all ${
                      !hasStockForSize
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                )})}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={(() => {
                const selectedSizeStock = availableSizes[selectedSize] || 0;
                if (selectedSizeStock <= 0) return true;
                const existingItem = items.find(
                  item => item.productId === product?.id && item.size === selectedSize
                );
                const quantityInCart = existingItem ? existingItem.quantity : 0;
                return quantityInCart >= selectedSizeStock;
              })()}
              className={`w-full py-5 text-base font-semibold uppercase tracking-widest transition-all ${
                (() => {
                  const selectedSizeStock = availableSizes[selectedSize] || 0;
                  if (selectedSizeStock <= 0) return 'bg-gray-200 text-gray-400 cursor-not-allowed';
                  const existingItem = items.find(
                    item => item.productId === product?.id && item.size === selectedSize
                  );
                  const quantityInCart = existingItem ? existingItem.quantity : 0;
                  return quantityInCart >= selectedSizeStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-900';
                })()
              }`}
            >
              {(() => {
                const selectedSizeStock = availableSizes[selectedSize] || 0;
                if (selectedSizeStock <= 0) return 'Sin Stock';
                const existingItem = items.find(
                  item => item.productId === product?.id && item.size === selectedSize
                );
                const quantityInCart = existingItem ? existingItem.quantity : 0;
                return quantityInCart >= selectedSizeStock ? 'En el Carrito' : 'Añadir al Carrito';
              })()}
            </button>

            {/* Stock Warning */}
            {(availableSizes[selectedSize] || 0) > 0 && (availableSizes[selectedSize] || 0) <= 5 && (
              <p className="text-sm text-orange-500 mt-4 text-center">
                ¡Solo quedan {availableSizes[selectedSize]} unidades en talla {selectedSize}!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
