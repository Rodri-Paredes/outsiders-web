'use client';

import { useEffect, useState } from 'react';
import { Product } from '../lib/types';
import { useCart } from './CartProvider';

export default function ProductList() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const { addToCart: addToCartInContext } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiBaseUrl}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch products', err);
        setLoading(false);
      });
  }, [apiBaseUrl]);

  const addToCart = async (productId: string) => {
    try {
      await addToCartInContext(productId, 1);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart', error);
      alert('Failed to add to cart');
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
      {products.map((product) => (
        <article
          key={product.id}
          className="group cursor-pointer rounded-lg border-2 border-gray-200 bg-white overflow-hidden hover:border-[#2d5f5d] transition-all hover:shadow-xl"
        >
          <div className="relative">
            <div className="relative bg-gray-50 aspect-[4/5]">
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

              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                  sin imagen
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product.id);
                }}
                className="absolute bottom-0 left-0 w-full bg-[#2d5f5d] text-[#d4a574] py-3 text-sm font-bold translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-[#3a6b6a]"
              >
                agregar al carrito
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-bold text-black">
                {product.name}
              </h3>
            </div>
            <p className="mt-2 text-base font-bold text-black">Bs. {Number(product.price).toFixed(0)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
