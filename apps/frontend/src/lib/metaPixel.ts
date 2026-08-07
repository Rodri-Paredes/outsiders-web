/**
 * Meta (Facebook) Pixel — typed helpers.
 *
 * Usage:
 *   import { trackViewContent, trackAddToCart } from '@/lib/metaPixel';
 *
 *   trackViewContent({
 *     content_name: product.name,
 *     content_ids: [product.id],
 *     content_type: 'product',
 *     value: product.price,
 *     currency: 'BOB',
 *   });
 *
 * The Pixel must be initialized first (via the <MetaPixel /> component in
 * layout.tsx).  If `fbq` is not present (e.g. ad-blocker, SSR), calls are
 * silently ignored — no crashes.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function fbq(...args: any[]) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
}

// --- Standard events --------------------------------------------------------

export function trackPageView() {
  fbq('track', 'PageView');
}

export interface ViewContentParams {
  content_name: string;
  content_ids: string[];
  content_type?: 'product' | 'product_group';
  value?: number;
  currency?: string;
  /** Optional: extra product info for remarketing */
  content_category?: string;
}

export function trackViewContent(params: ViewContentParams) {
  fbq('track', 'ViewContent', {
    content_name: params.content_name,
    content_ids: params.content_ids,
    content_type: params.content_type || 'product',
    value: params.value,
    currency: params.currency || 'BOB',
    content_category: params.content_category,
  });
}

export interface AddToCartParams {
  content_name: string;
  content_ids: string[];
  content_type?: 'product' | 'product_group';
  value: number;
  currency?: string;
}

export function trackAddToCart(params: AddToCartParams) {
  fbq('track', 'AddToCart', {
    content_name: params.content_name,
    content_ids: params.content_ids,
    content_type: params.content_type || 'product',
    value: params.value,
    currency: params.currency || 'BOB',
  });
}

export interface InitiateCheckoutParams {
  content_ids?: string[];
  value?: number;
  currency?: string;
  num_items?: number;
}

export function trackInitiateCheckout(params: InitiateCheckoutParams) {
  fbq('track', 'InitiateCheckout', {
    content_ids: params.content_ids,
    value: params.value,
    currency: params.currency || 'BOB',
    num_items: params.num_items,
  });
}

export interface PurchaseParams {
  content_ids?: string[];
  content_type?: 'product' | 'product_group';
  value: number;
  currency?: string;
  num_items?: number;
}

export function trackPurchase(params: PurchaseParams) {
  fbq('track', 'Purchase', {
    content_ids: params.content_ids,
    content_type: params.content_type || 'product',
    value: params.value,
    currency: params.currency || 'BOB',
    num_items: params.num_items,
  });
}
