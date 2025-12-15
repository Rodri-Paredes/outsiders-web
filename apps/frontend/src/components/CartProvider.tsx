'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Cart, CartItem } from '../lib/types';

type CartContextValue = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    const apiBaseUrl = getApiBaseUrl();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/cart`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load cart (${res.status})`);
      const data = (await res.json()) as Cart;
      setCart(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    const apiBaseUrl = getApiBaseUrl();
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) throw new Error(`Failed to add to cart (${res.status})`);
      await refreshCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add to cart');
      throw e;
    }
  }, [refreshCart]);

  const removeFromCart = useCallback(async (itemId: string) => {
    const apiBaseUrl = getApiBaseUrl();
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed to remove item (${res.status})`);
      setCart((prev: Cart | null) => {
        if (!prev) return prev;
        const nextItems = prev.items.filter((i: CartItem) => i.id !== itemId);
        return { ...prev, items: nextItems };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove item');
      throw e;
    }
  }, []);

  const itemCount = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  }, [cart]);

  const value = useMemo<CartContextValue>(() => {
    return {
      cart,
      loading,
      error,
      itemCount,
      refreshCart,
      addToCart,
      removeFromCart,
    };
  }, [cart, loading, error, itemCount, refreshCart, addToCart, removeFromCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function formatBs(amount: number) {
  return `Bs. ${Number(amount).toFixed(0)}`;
}

export function cartItemLineTotal(item: CartItem) {
  return Number(item.product.price) * item.quantity;
}
