'use client';

import { useEffect, useState } from 'react';
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

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Imágenes de Unsplash para ropa streetwear
  const unsplashImages = [
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1623876229339-0df13d6a0027?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&h=750&fit=crop'
  ];

  const unsplashImagesHover = [
    'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1623876229339-0df13d6a0027?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop'
  ];

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
      {products.map((product, index) => {
        const imageIndex = index % unsplashImages.length;
        const mainImage = product.image_url || unsplashImages[imageIndex];
        const hoverImage = unsplashImagesHover[imageIndex];
        const isHovered = hoveredProduct === product.id;

        return (
          <article
            key={product.id}
            className="group cursor-pointer rounded-lg border-2 border-gray-200 bg-white overflow-hidden hover:border-[#2d5f5d] transition-all hover:shadow-xl"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            <div className="relative">
              <div className="relative bg-gray-50 aspect-[4/5] overflow-hidden">
                <span className="absolute top-3 left-3 z-10 text-xs font-bold bg-[#2d5f5d] text-[#d4a574] px-3 py-1 rounded-sm">
                  nuevo 🔥
                </span>

                <button
                  type="button"
                  aria-label="Save"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-[#2d5f5d] hover:text-[#d4a574] hover:border-[#2d5f5d] transition-all"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 3h10a2 2 0 0 1 2 2v16l-7-4-7 4V5a2 2 0 0 1 2-2z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>

                {/* Imagen principal */}
                <img
                  src={mainImage}
                  alt={product.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    isHovered ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                
                {/* Imagen en hover */}
                <img
                  src={hoverImage}
                  alt={`${product.name} - vista alternativa`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenSizeModal(product);
                  }}
                  disabled={!product.stock || product.stock === 0}
                  className={`absolute bottom-0 left-0 w-full py-3 text-sm font-bold translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${
                    !product.stock || product.stock === 0
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-[#2d5f5d] text-[#d4a574] hover:bg-[#3a6b6a]'
                  }`}
                >
                  {!product.stock || product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-bold text-black">
                  {product.name}
                </h3>
              </div>
              <p className="mt-2 text-base font-bold text-black">Bs. {Number(product.price).toFixed(2)}</p>
              {(product.stock || 0) > 0 && (product.stock || 0) <= 5 && (
                <p className="mt-1 text-xs text-orange-500 font-semibold">
                  ¡Solo quedan {product.stock} unidades!
                </p>
              )}
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
            <p className="text-xl text-black mb-6 font-bold">
              Bs. {selectedProduct.price.toFixed(2)}
            </p>

            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-3 uppercase tracking-wider font-semibold">
                Selecciona tu talla:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-sm font-bold tracking-wider transition-all rounded ${
                      selectedSize === size
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
