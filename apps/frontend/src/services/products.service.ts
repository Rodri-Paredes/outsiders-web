import { Product } from '../lib/database.types'
import { supabase } from '../lib/supabase'

function mapProduct(p: any, branchId?: string): Product {
  let totalStock = 0;
  if (p.variants) {
    p.variants.forEach((v: any) => {
      if (v.stock) {
        v.stock.forEach((s: any) => {
          // If a branchId is provided, filter stock by branch_id
          if (!branchId || s.branch_id === branchId) {
            totalStock += s.quantity || 0;
          }
        });
      }
    });
  }

  // Deep-copy variants with branch-filtered stock.
  // When branchId is provided, `stock` is overwritten with ONLY the branch's records.
  // This ensures every component that reads `v.stock` gets branch-correct data
  // without requiring each component to switch to `branchStock`.
  const filteredVariants = p.variants?.map((v: any) => {
    const allStock = v.stock || [];
    const branchStock = branchId
      ? allStock.filter((s: any) => s.branch_id === branchId)
      : allStock;
    return {
      ...v,
      stock: branchStock,   // branch-filtered when branchId is provided
      branchStock,
    };
  }) || [];

  let parsedImages: string[] = [];
  if (Array.isArray(p.images)) {
    parsedImages = p.images;
  } else if (typeof p.images === 'string') {
    try {
      parsedImages = JSON.parse(p.images);
    } catch(e) {
      // If it's a comma separated string or pg array
      parsedImages = p.images.replace(/^{|}$/g, '').split(',').map((u: string) => u.replace(/^"|"$/g, '').trim()).filter(Boolean);
    }
  }

  if (parsedImages.length === 0 && p.image_url) {
    parsedImages = [p.image_url];
  }

  // Map tags
  const tags = p.tags?.map((assignment: any) => ({
    id: assignment.id,
    product_id: assignment.product_id || p.id,
    tag_id: assignment.tag_id,
    tag: assignment.tag,
    created_at: assignment.created_at,
  })) || [];

  return {
    ...p,
    images: parsedImages,
    tags,
    variants: filteredVariants,
    stock: totalStock,
    hasStock: totalStock > 0
  } as Product & { images: string[] };
}

// Caché corta en memoria para el catálogo completo (usado por /shop). No
// cambia qué se pide ni cómo se filtra — solo evita repetir el mismo fetch
// completo a Supabase si se vuelve a montar /shop (ej. con el botón "atrás")
// dentro de la misma sesión de navegación. Se resetea con un F5 completo.
const PRODUCTS_CACHE_TTL_MS = 60_000;
const productsCache = new Map<string, { data: Product[]; expiresAt: number }>();

export const productsService = {
  async getProducts(branchId?: string): Promise<Product[]> {
    const cacheKey = branchId || 'all';
    const cached = productsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, image_url, images, price, original_price, mid_price,
        discount_percentage, markdown_percentage,
        category, is_new_in, web_only, is_visible, visible_on_web, sort_order, size_guide_id, created_at,
        variants:product_variants(
          id, size,
          stock(quantity, branch_id)
        ),
        tags:product_tag_assignments(
          id,
          tag_id,
          tag:product_tags(id, name, tag_group)
        )
      `)
      .eq('is_visible', true)
      .eq('visible_on_web', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    const mapped = (data || []).map((p) => mapProduct(p, branchId));
    productsCache.set(cacheKey, { data: mapped, expiresAt: Date.now() + PRODUCTS_CACHE_TTL_MS });
    return mapped;
  },

  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(
          *,
          stock(*)
        ),
        tags:product_tag_assignments(
          id,
          tag_id,
          tag:product_tags(*)
        )
      `)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data || []).map((p) => mapProduct(p));
  },

  async getById(id: string, branchId?: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, description, category, price, original_price, mid_price,
        discount_percentage, markdown_percentage, image_url, images,
        is_new_in, web_only, visible_on_web, size_guide_id, created_at,
        variants:product_variants(
          id, size, price_override,
          stock(quantity, branch_id)
        ),
        tags:product_tag_assignments(
          id,
          tag_id,
          tag:product_tags(id, name, tag_group)
        )
      `)
      // Nota: se piden columnas explícitas (no "select *") — evita mandar
      // cost_price/base_price y otros campos internos a un cliente anónimo.
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }

    return data ? mapProduct(data, branchId) : null;
  },

  /**
   * Trae SOLO el stock por variante (sin imágenes, descripción, tags, etc).
   * Se usa para refrescar el stock por sucursal en el cliente sin repetir la
   * descarga completa del producto que el servidor ya mandó en el HTML inicial.
   */
  async getVariantsStock(productId: string, branchId?: string): Promise<{ size: string; stock: number }[]> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('size, stock(quantity, branch_id)')
      .eq('product_id', productId);

    if (error) {
      console.error(`Error fetching stock for product ${productId}:`, error);
      return [];
    }

    return (data || []).map((v: any) => {
      const stockRows = (v.stock || []) as { quantity: number; branch_id: string }[];
      const relevant = branchId ? stockRows.filter((s) => s.branch_id === branchId) : stockRows;
      return {
        size: v.size,
        stock: relevant.reduce((sum, s) => sum + (s.quantity || 0), 0),
      };
    });
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    
    return mapProduct(data);
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return mapProduct(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
