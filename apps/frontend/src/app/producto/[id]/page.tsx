'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { productsService } from '@/services/products.service';
import { Product } from '@/lib/database.types';
import { useCartStore } from '@/store/cartStore';
import { ChevronLeft, ChevronRight, X, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBranch } from '@/contexts/BranchContext';
import { RecommendedForYou } from '@/components/home/RecommendedForYou';
import { useAnonId } from '@/hooks/useAnonId';
import { recommendationsService } from '@/services/recommendations.service';
import { sizeGuideService, SizeGuide } from '@/services/sizeGuide.service';
import { useAuth } from '@/contexts/AuthContext';
import { favoritesService } from '@/services/favorites.service';

// Sizes are now loaded dynamically from product variants

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [availableSizes, setAvailableSizes] = useState<{[key: string]: number}>({});
  const [sizeGuide, setSizeGuide] = useState<SizeGuide | null>(null);
  const [sizeGuideLoading, setSizeGuideLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const { selectedBranch } = useBranch();
  const anonId = useAnonId();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    useCartStore.persist.rehydrate();
  }, []);

  // Check favorite status
  useEffect(() => {
    if (user && params.id) {
      favoritesService.isFavorite(user.id, params.id as string).then(setIsFavorite);
    }
  }, [user, params.id]);

  // Registrar vista del producto cuando el producto y el anon_id estén disponibles
  useEffect(() => {
    if (product && anonId && product.category) {
      recommendationsService.trackView(anonId, product.id, product.category);
    }
  }, [product?.id, anonId]);

  // Cargar guía de tallas basada en el material del producto
  useEffect(() => {
    if (!product) return;
    // El material está en los tags del producto (tag_group = 'gramaje' o 'material')
    const materialTag = product.tags?.find(
      (t) => t.tag && (t.tag.tag_group === 'gramaje' || t.tag.tag_group === 'material')
    );
    if (!materialTag?.tag?.name) return;

    setSizeGuideLoading(true);
    sizeGuideService.getByMaterial(materialTag.tag.name).then((guide) => {
      setSizeGuide(guide);
      setSizeGuideLoading(false);
    });
  }, [product?.id]);

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
        
        // Fetch only this product, passing the selected branch to get accurate stock filtering
        const branchId = selectedBranch?.id;
        const foundProduct = await productsService.getById(productId, branchId);
        
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
  }, [params.id, router, selectedBranch]);

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

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (!product || favLoading) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await favoritesService.removeFavorite(user.id, product.id);
        setIsFavorite(false);
        toast.success('Eliminado de favoritos');
      } else {
        await favoritesService.addFavorite(user.id, product.id);
        setIsFavorite(true);
        toast.success('Agregado a favoritos');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFavLoading(false);
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
    <div className="min-h-screen bg-white pt-20 lg:pt-24 pb-16 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          {/* Image Gallery */}
          <div className="w-full lg:w-[65%]">
            {images.length > 0 ? (
              <>
                {/* Desktop Grid View */}
                <div className={`hidden lg:grid gap-4 mb-4 ${images.length === 1 ? 'grid-cols-1 w-full max-w-sm mx-auto' : 'grid-cols-2'}`}>
                  {images.map((img: string, index: number) => (
                    <div key={`desktop-${index}`} className="aspect-[3/4] relative bg-gray-50 overflow-hidden group">
                      <Image
                        src={img}
                        alt={`${product.name} - view ${index + 1}`}
                        fill
                        sizes="33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority={index === 0}
                        quality={80}
                      />
                    </div>
                  ))}
                </div>

                {/* Mobile Carousel View */}
                <div className="block lg:hidden aspect-square bg-gray-50 relative mb-4 overflow-hidden">
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
                        className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 lg:w-6 lg:h-6 text-black" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 lg:w-6 lg:h-6 text-black" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails (Mobile Only) */}
                {images.length > 1 && (
                  <div className="flex lg:hidden gap-3 overflow-x-auto pb-2">
                    {images.map((img: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 border-2 transition-all relative overflow-hidden ${
                          index === currentImageIndex
                            ? 'border-black'
                            : 'border-gray-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          sizes="64px"
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
          <div className="w-full lg:w-[35%] flex flex-col lg:sticky lg:top-36">
            {/* Category + NEW IN */}
            {product.category && (
              <div className="flex items-center gap-3 mb-3">
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                  {product.category}
                </p>
                {(product as any).is_new_in && (
                  <span className="inline-block px-2 py-0.5 bg-black text-white text-[9px] font-bold uppercase tracking-widest">
                    NEW IN
                  </span>
                )}
              </div>
            )}

            {/* Name */}
            <div className="flex items-start gap-4 mb-4 mt-2">
              <h1 className="text-xl lg:text-2xl font-normal text-black uppercase tracking-wide leading-snug">
                {product.name}
              </h1>
              {!hasStock && (
                <span className="inline-block px-4 py-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest">
                  Sold Out
                </span>
              )}
            </div>

            {/* Price */}
            {product.original_price && product.discount_percentage && product.discount_percentage > 0 ? (
              <div className="flex items-center gap-3 mb-8">
                <p className="text-lg text-gray-400 line-through">
                  Bs. {Number(product.original_price).toFixed(2)}
                </p>
                <p className="text-2xl font-medium text-black">
                  Bs. {(product.original_price * (1 - product.discount_percentage / 100)).toFixed(2)}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-medium text-black mb-8">
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
              <div className="flex justify-between items-center mb-4">
                <label className="block text-[11px] font-medium text-black uppercase tracking-widest">
                  Selecciona tu talla
                </label>
                <button 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[10px] text-gray-400 hover:text-black underline uppercase tracking-widest transition-colors"
                >
                  Guía de tallas
                </button>
              </div>
              <div className="flex flex-wrap gap-6 mb-3">
                {(product.variants?.map(v => v.size) || []).map((size) => {
                  const sizeStock = availableSizes[size] || 0;
                  const hasStockForSize = sizeStock > 0;
                  
                  return (
                  <button
                    key={size}
                    onClick={() => hasStockForSize && setSelectedSize(size)}
                    disabled={!hasStockForSize}
                    className={`pb-1 px-1 text-xs font-medium uppercase tracking-widest border-b transition-all ${
                      !hasStockForSize
                        ? 'text-gray-300 border-transparent cursor-not-allowed line-through'
                        : selectedSize === size
                        ? 'text-black border-black'
                        : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                )})}
              </div>
              <div className="min-h-[16px]">
                {(availableSizes[selectedSize] || 0) > 0 && (availableSizes[selectedSize] || 0) <= 5 && (
                  <p className="text-[10px] text-red-800 font-medium tracking-widest uppercase animate-in fade-in">
                    Quedan pocas unidades
                  </p>
                )}
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
              className={`w-full py-4 lg:py-5 text-sm lg:text-base font-semibold uppercase tracking-widest transition-all ${
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

            {/* Favorite button */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={`w-full py-3.5 border text-sm font-medium uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                isFavorite
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
              {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
            </button>
          </div>
        </div>
      </div>

      {/* Recomendado para ti — basado en historial del usuario */}
      {product && anonId && (
        <RecommendedForYou
          anonId={anonId}
          currentProductId={product.id}
          currentCategory={product.category}
          branchId={selectedBranch?.id}
        />
      )}

      {/* Size Guide Modal (Left side) */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isSizeGuideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsSizeGuideOpen(false)}
        />
        <div 
          className={`absolute top-0 left-0 w-full max-w-sm h-full bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
            isSizeGuideOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-[14px] font-medium tracking-widest uppercase">Guía de Tallas</h2>
              {sizeGuide && (
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">{sizeGuide.material}</p>
              )}
            </div>
            <button 
              onClick={() => setIsSizeGuideOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Encuentra la talla perfecta para ti con nuestra guía de medidas. Todas las medidas están en centímetros.
            </p>

            {/* Imagen de referencia (si existe) */}
            {sizeGuide?.image_url && (
              <div className="relative w-full aspect-video mb-6 overflow-hidden rounded-lg">
                <img src={sizeGuide.image_url} alt="Referencia de medidas" className="object-contain w-full h-full" />
              </div>
            )}

            {sizeGuideLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 animate-pulse rounded" />)}
              </div>
            ) : sizeGuide ? (
              /* Tabla dinámica desde la base de datos */
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 font-medium uppercase tracking-wider text-[11px] text-gray-400">Talla</th>
                    <th className="py-3 font-medium uppercase tracking-wider text-[11px] text-gray-400">{sizeGuide.col_a_label}</th>
                    <th className="py-3 font-medium uppercase tracking-wider text-[11px] text-gray-400">{sizeGuide.col_b_label}</th>
                    {sizeGuide.col_c_label && (
                      <th className="py-3 font-medium uppercase tracking-wider text-[11px] text-gray-400">{sizeGuide.col_c_label}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sizeGuide.rows.map((row) => (
                    <tr key={row.size} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{row.size}</td>
                      <td className="py-3 text-gray-500">{row.a}</td>
                      <td className="py-3 text-gray-500">{row.b}</td>
                      {sizeGuide.col_c_label && (
                        <td className="py-3 text-gray-500">{row.c}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* Tabla genérica (fallback cuando no hay guía del material) */
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 font-medium uppercase tracking-wider text-[11px] text-gray-400">Talla</th>
                    <th className="py-3 font-medium uppercase tracking-wider text-[11px] text-gray-400">Ancho</th>
                    <th className="py-3 font-medium uppercase tracking-wider text-[11px] text-gray-400">Largo</th>
                  </tr>
                </thead>
                <tbody>
                  {[['S','51','70'],['M','54','72'],['L','57','75'],['XL','60','78']].map(([size, a, b]) => (
                    <tr key={size} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{size}</td>
                      <td className="py-3 text-gray-500">{a}</td>
                      <td className="py-3 text-gray-500">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
