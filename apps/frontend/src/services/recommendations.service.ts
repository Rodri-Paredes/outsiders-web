import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/database.types';

// Clave en sessionStorage para deduplicar vistas dentro de la misma sesión de navegación
const SESSION_VIEWED_KEY = 'outsiders_session_viewed';

function getSessionViewed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(SESSION_VIEWED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markSessionViewed(productId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const viewed = getSessionViewed();
    viewed.add(productId);
    sessionStorage.setItem(SESSION_VIEWED_KEY, JSON.stringify(Array.from(viewed)));
  } catch {
    // sessionStorage puede estar bloqueado en algunos navegadores (modo privado / incógnito estricto)
  }
}

function mapRecommendedProduct(p: any, branchId?: string): Product & { images: string[] } {
  let totalStock = 0;
  let parsedImages: string[] = [];

  if (Array.isArray(p.images)) {
    parsedImages = p.images;
  } else if (typeof p.images === 'string') {
    try {
      parsedImages = JSON.parse(p.images);
    } catch {
      parsedImages = p.images
        .replace(/^{|}$/g, '')
        .split(',')
        .map((u: string) => u.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
    }
  }
  if (parsedImages.length === 0 && p.image_url) parsedImages = [p.image_url];

  (p.variants || []).forEach((v: any) => {
    (v.stock || []).forEach((s: any) => {
      if (!branchId || s.branch_id === branchId) {
        totalStock += s.quantity || 0;
      }
    });
  });

  return { ...p, images: parsedImages, stock: totalStock, hasStock: totalStock > 0 };
}

export const recommendationsService = {
  /**
   * Registra la vista de un producto por un usuario anónimo.
   * Deduplica dentro de la misma sesión del navegador para no saturar la base de datos.
   */
  async trackView(anonId: string, productId: string, category: string): Promise<void> {
    if (!anonId || !productId || !category) return;

    const viewed = getSessionViewed();
    if (viewed.has(productId)) return; // Ya registrado en esta sesión

    markSessionViewed(productId);

    const { error } = await supabase
      .from('product_views')
      .insert({ anon_id: anonId, product_id: productId, category });

    if (error) {
      console.error('[Recommendations] Error tracking view:', error);
    }
  },

  /**
   * Devuelve la categoría más vista por el usuario anónimo.
   * Usa la función SECURITY DEFINER `get_favorite_category` en la base de datos.
   */
  async getFavoriteCategory(anonId: string): Promise<string | null> {
    if (!anonId) return null;

    const { data, error } = await supabase.rpc('get_favorite_category', {
      p_anon_id: anonId,
    });

    if (error) {
      console.error('[Recommendations] Error getting favorite category:', error);
      return null;
    }

    return data ?? null;
  },

  /**
   * Devuelve hasta `limit` productos de la categoría favorita del usuario,
   * con stock disponible y excluyendo el producto actual.
   */
  async getPersonalizedProducts(
    anonId: string,
    excludeProductId: string,
    branchId?: string,
    limit = 8
  ): Promise<(Product & { images: string[] })[]> {
    const category = await recommendationsService.getFavoriteCategory(anonId);
    if (!category) return [];

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(
          *,
          stock(*)
        )
      `)
      .eq('category', category)
      .eq('is_visible', true)
      .eq('visible_on_web', true)
      .neq('id', excludeProductId)
      .order('created_at', { ascending: false })
      .limit(limit + 5); // Pedimos un poco más para filtrar sin stock

    if (error || !data) {
      console.error('[Recommendations] Error fetching personalized products:', error);
      return [];
    }

    return data
      .map(p => mapRecommendedProduct(p, branchId))
      .filter(p => p.hasStock)
      .slice(0, limit);
  },
};
