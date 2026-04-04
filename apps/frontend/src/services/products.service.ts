import { Product } from '../lib/database.types'
import { supabase } from '../lib/supabase'

function mapProduct(p: any): Product {
  let totalStock = 0;
  if (p.variants) {
    p.variants.forEach((v: any) => {
      if (v.stock) {
        v.stock.forEach((s: any) => {
          totalStock += s.quantity || 0;
        });
      }
    });
  }

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
    stock: totalStock,
    hasStock: totalStock > 0
  } as Product & { images: string[] };
}

export const productsService = {
  async getProducts(): Promise<Product[]> {
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
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data || []).map(mapProduct);
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data || []).map(mapProduct);
  },

  async getById(id: string): Promise<Product | null> {
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
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }

    return data ? mapProduct(data) : null;
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
