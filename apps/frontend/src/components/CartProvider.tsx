'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Cart, CartItem } from '../lib/database.types';
import { cartService } from '../services/cart.service';
import { useAuth } from '../contexts/AuthContext';

type CartContextValue = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getOrCreateCart(user.id);
      setCart(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    if (!user) {
      setError('Please sign in to add items to cart');
      throw new Error('Not authenticated');
    }

    setError(null);
    try {
      await cartService.addItem(user.id, productId, quantity);
      await refreshCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add to cart');
      throw e;
    }
  }, [user, refreshCart]);

  const removeFromCart = useCallback(async (itemId: string) => {
    setError(null);
    try {
      await cartService.removeItem(itemId);
      await refreshCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove item');
      throw e;
    }
  }, [refreshCart]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setError(null);
    try {
      await cartService.updateItemQuantity(itemId, quantity);
      await refreshCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update quantity');
      throw e;
    }
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    if (!user) return;

    setError(null);
    try {
      await cartService.clearCart(user.id);
      await refreshCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to clear cart');
      throw e;
    }
  }, [user, refreshCart]);

  const itemCount = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
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
      updateQuantity,
      clearCart,
    };
  }, [cart, loading, error, itemCount, refreshCart, addToCart, removeFromCart, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
