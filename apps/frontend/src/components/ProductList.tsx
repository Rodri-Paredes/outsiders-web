'use client';

import { useEffect, useState } from 'react';
import { Product } from '../lib/database.types';
import { useCartStore } from '@/store/cartStore';
import { productsService } from '../services/products.service';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import { ProductImageCarousel } from './ProductImageCarousel';

export default function ProductList() {
  const addItem = useCartStore((state) => state.addItem);
  const { selectedBranch } = useBranch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');

  useEffect(() => {
    const branchId = selectedBranch?.id;
    productsService.getProducts(branchId)
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch products', err);
        setLoading(false);
      });
  }, [selectedBranch]);

  // Get available sizes from product variants
  const getAvailableSizes = (product: Product): string[] => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map(v => v.size);
    }
    // Fallback to default sizes
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
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
        const productImages: string[] = (product as any).images || (product.image_url ? [product.image_url] : []);
        const discount = hasDiscount(product);
        const finalPrice = getFinalPrice(product);

        return (
          <article
            key={product.id}
            className="group cursor-pointer flex flex-col w-full"
            onClick={() => handleOpenSizeModal(product)}
          >
            {/* Image Container */}
            <div className="relative bg-[#f5f5f5] aspect-[4/5] w-full overflow-hidden mb-3">
              <ProductImageCarousel
                images={productImages}
                alt={product.name}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>

            {/* Info Container */}
            <div className="flex flex-col w-full px-1 mt-2 text-left">
              {/* Product Name (Top) */}
              <h3 className="text-[11px] text-black mb-0.5 capitalize tracking-tight font-medium">
                {product.name.toLowerCase()}
              </h3>

              {/* Price and Sizes (Bottom Row) */}
              <div className="flex justify-between items-center w-full mt-0.5">
                {/* Left Side: Price */}
                <div className="flex items-center gap-2">
                  {discount ? (
                    <>
                      <span className="text-[11px] text-gray-400 line-through">
                        Bs. {Number(product.original_price).toFixed(2)}
                      </span>
                      <span className="text-[11px] text-gray-800 font-medium tracking-wide">
                        Bs. {finalPrice.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] text-gray-800 font-medium tracking-wide">
                      Bs. {Number(product.price).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Right Side: Sizes */}
                <div className="flex items-center gap-1.5">
                  {(product.variants && product.variants.length > 0 
                    ? Array.from(new Set(product.variants.map(v => v.size)))
                    : ['S', 'M', 'L', 'XL']
                  ).sort((a, b) => ['XS', 'S', 'M', 'L', 'XL', 'XXL'].indexOf(a) - ['XS', 'S', 'M', 'L', 'XL', 'XXL'].indexOf(b)).map(size => {
                    const hasCurrentStock = product.variants 
                      ? product.variants.some(v => v.size === size && (v.stock?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0) > 0) 
                      : true;
                    return (
                      <span 
                        key={size} 
                        className={`text-[9px] uppercase tracking-wider transition-colors ${hasCurrentStock ? 'text-black font-semibold' : 'text-gray-300 font-medium'}`}
                      >
                        {size}
                      </span>
                    );
                  })}
                </div>
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
