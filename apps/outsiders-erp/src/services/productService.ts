import { supabase } from '../lib/supabase';
import type { Product, ProductVariant, ProductWithVariants, ProductTag } from '../lib/types';
import { compressImage } from '../lib/imageCompression';

// Check if tags tables exist (set once on first query)
let tagsAvailable: boolean | null = null;

async function checkTagsAvailable(): Promise<boolean> {
  if (tagsAvailable !== null) return tagsAvailable;
  try {
    const { error } = await supabase.from('product_tags').select('id').limit(1);
    tagsAvailable = !error;
    return tagsAvailable;
  } catch {
    tagsAvailable = false;
    return false;
  }
}

// Build the select query string depending on whether tags tables exist
function getProductSelectQuery(includeTags: boolean): string {
  if (includeTags) {
    return `
      *,
      tags:product_tag_assignments(
        id,
        tag_id,
        tag:product_tags(*)
      )
    `;
  }
  return '*';
}

export const productService = {
  supabase, // Exportar supabase para usar en otros lugares
  
  /**
   * Obtener todos los productos con filtros opcionales
   */
  async getProducts(filters?: {
    category?: string;
    search?: string;
    includeHidden?: boolean;
    tag_ids?: string[];
    hasDiscount?: boolean;
  }) {
    try {
      const hasTags = await checkTagsAvailable();
      const selectQuery = getProductSelectQuery(hasTags);

      let query = supabase
        .from('products')
        .select(selectQuery)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        // Buscar por nombre o SKU
        query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
      }

      if (filters?.includeHidden) {
        query = query.eq('is_visible', false);
      } else {
        query = query.eq('is_visible', true);
      }

      if (filters?.hasDiscount) {
        query = query.not('discount_percentage', 'is', null).gt('discount_percentage', 0);
      }

      const { data, error } = await query;

      if (error) throw error;

      let products = data as unknown as Product[];

      // Filtro por tags (se hace client-side porque Supabase no soporta filtros en relaciones anidadas fácilmente)
      if (hasTags && filters?.tag_ids && filters.tag_ids.length > 0) {
        products = products.filter(product => {
          const productTagIds = product.tags?.map(t => t.tag_id) || [];
          return filters.tag_ids!.every(tagId => productTagIds.includes(tagId));
        });
      }

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Buscar producto por SKU
   */
  async getProductBySKU(sku: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', sku)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data as Product | null;
    } catch (error) {
      console.error('Error fetching product by SKU:', error);
      throw error;
    }
  },

  /**
   * Obtener un producto por ID
   */
  async getProductById(id: string) {
    try {
      const hasTags = await checkTagsAvailable();
      const selectQuery = getProductSelectQuery(hasTags);

      const { data, error } = await supabase
        .from('products')
        .select(selectQuery)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Obtener producto con sus variantes
   */
  async getProductWithVariants(id: string): Promise<ProductWithVariants> {
    try {
      const hasTags = await checkTagsAvailable();
      
      let selectQuery = '*, variants:product_variants(*)';
      if (hasTags) {
        selectQuery = `
          *,
          variants:product_variants(*),
          tags:product_tag_assignments(
            id,
            tag_id,
            tag:product_tags(*)
          )
        `;
      }

      const { data, error } = await supabase
        .from('products')
        .select(selectQuery)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as ProductWithVariants;
    } catch (error) {
      console.error('Error fetching product with variants:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo producto
   */
  async createProduct(product: {
    name: string;
    description?: string;
    category: string;
    base_price: number;
    discount_percentage?: number | null;
    markdown_percentage?: number | null;
    image_url?: string;
    images?: string[];
    drop_id?: string;
  }) {
    try {
      // Clean up: only send fields that the DB actually has.
      // `price` y `original_price` son columnas generadas por Postgres — no se
      // envían nunca, se recalculan solas a partir de base_price + discount_percentage.
      const insertData: Record<string, any> = {
        name: product.name,
        category: product.category,
        base_price: product.base_price,
        is_visible: true,
      };

      if (product.description) insertData.description = product.description;
      if (product.image_url) insertData.image_url = product.image_url;
      if (product.images) insertData.images = product.images;
      if (product.drop_id) insertData.drop_id = product.drop_id;
      if ((product as any).sku) insertData.sku = (product as any).sku;
      if ((product as any).is_new_in !== undefined) insertData.is_new_in = (product as any).is_new_in;
      if ((product as any).web_only !== undefined) insertData.web_only = (product as any).web_only;
      if ((product as any).visible_on_web !== undefined) insertData.visible_on_web = (product as any).visible_on_web;
      if ((product as any).size_guide_id != null) insertData.size_guide_id = (product as any).size_guide_id;

      // Only include discount_percentage if it has a value
      if (product.discount_percentage != null && product.discount_percentage > 0) {
        insertData.discount_percentage = product.discount_percentage;
      }
      if (product.markdown_percentage != null && product.markdown_percentage > 0) {
        insertData.markdown_percentage = product.markdown_percentage;
      }

      const { data, error } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Actualizar un producto
   */
  async updateProduct(id: string, updates: Partial<Product>) {
    try {
      // Remove relational/computed fields that are NOT columns
      const { tags, ...rest } = updates as any;

      // Clean up undefined values
      const cleanUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(rest)) {
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      }

      // Remove fields that don't exist as columns
      delete cleanUpdates.id;
      delete cleanUpdates.created_at;
      // `price`, `original_price` y `mid_price` son columnas generadas por
      // Postgres a partir de base_price + discount_percentage +
      // markdown_percentage: escribirlas directamente falla.
      delete cleanUpdates.price;
      delete cleanUpdates.original_price;
      delete cleanUpdates.mid_price;

      const { data, error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  /**
   * Eliminar un producto con todos sus datos relacionados.
   * NOTA: Las operaciones se ejecutan en secuencia; si alguna falla se lanza el error
   * para que el caller lo capture. Idealmente migrar a una RPC transaccional en DB.
   */
  async deleteProduct(id: string) {
    try {
      // 1. Obtener todas las variantes del producto
      const { data: variants, error: variantsFetchError } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', id);

      if (variantsFetchError) throw variantsFetchError;

      if (variants && variants.length > 0) {
        const variantIds = variants.map((v) => v.id);

        // 2. Eliminar todos los registros de stock de esas variantes
        const { error: stockError } = await supabase
          .from('stock')
          .delete()
          .in('variant_id', variantIds);
        if (stockError) throw stockError;

        // 3. Eliminar las variantes
        const { error: variantsDeleteError } = await supabase
          .from('product_variants')
          .delete()
          .in('id', variantIds);
        if (variantsDeleteError) throw variantsDeleteError;
      }

      // 4. Eliminar asignaciones de tags
      const { error: tagsError } = await supabase
        .from('product_tag_assignments')
        .delete()
        .eq('product_id', id);
      if (tagsError) throw tagsError;

      // 5. Eliminar el producto
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  /**
   * Alternar visibilidad de un producto
   */
  async toggleProductVisibility(id: string) {
    try {
      const product = await this.getProductById(id);
      const { data, error } = await supabase
        .from('products')
        .update({ is_visible: !product.is_visible })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error('Error toggling product visibility:', error);
      throw error;
    }
  },

  /**
   * Subir imagen de producto
   */
  async uploadProductImage(file: File): Promise<string> {
    try {
      const compressedFile = await compressImage(file);
      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // cacheControl largo: filePath incluye random+timestamp, nunca se
      // reemplaza — evita que weserv.nl (o cualquier cliente) vuelva a
      // pedirle el archivo a Supabase Storage más seguido de lo necesario.
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, compressedFile, { cacheControl: '31536000' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  },

  /**
   * Subir múltiples imágenes de producto
   */
  async uploadProductImages(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadProductImage(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading product images:', error);
      throw error;
    }
  },

  /**
   * Eliminar imagen de producto
   */
  async deleteProductImage(url: string) {
    try {
      // Extraer el path del URL
      const urlParts = url.split('/');
      const filePath = `products/${urlParts[urlParts.length - 1]}`;

      const { error } = await supabase.storage
        .from('products')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product image:', error);
      throw error;
    }
  },

  /**
   * Crear variante de producto (talla)
   */
  async createProductVariant(productId: string, size: string, priceOverride?: number | null) {
    try {
      const insertData: Record<string, any> = {
        product_id: productId,
        size,
      };
      // Only include price_override if it has a value
      if (priceOverride != null && priceOverride > 0) {
        insertData.price_override = priceOverride;
      }

      const { data, error } = await supabase
        .from('product_variants')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data as ProductVariant;
    } catch (error) {
      console.error('Error creating product variant:', error);
      throw error;
    }
  },

  /**
   * Actualizar variante de producto (price_override)
   */
  async updateProductVariant(variantId: string, updates: { price_override?: number | null }) {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', variantId)
        .select()
        .single();

      if (error) throw error;
      return data as ProductVariant;
    } catch (error) {
      console.error('Error updating product variant:', error);
      throw error;
    }
  },

  /**
   * Eliminar variante de producto
   */
  async deleteProductVariant(variantId: string) {
    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product variant:', error);
      throw error;
    }
  },

  /**
   * Obtener variantes de un producto
   */
  async getProductVariants(productId: string) {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;
      return data as ProductVariant[];
    } catch (error) {
      console.error('Error fetching product variants:', error);
      throw error;
    }
  },

  // ==================== TAGS ====================

  /**
   * Obtener todos los tags disponibles, opcionalmente filtrados por categoría
   */
  async getProductTags(category?: string): Promise<ProductTag[]> {
    try {
      const hasTags = await checkTagsAvailable();
      if (!hasTags) return [];

      let query = supabase
        .from('product_tags')
        .select('*')
        .order('tag_group', { ascending: true })
        .order('name', { ascending: true });

      if (category) {
        // Tags de esa categoría + tags globales (category IS NULL)
        query = query.or(`category.eq.${category},category.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProductTag[];
    } catch (error) {
      console.error('Error fetching product tags:', error);
      return []; // Graceful fallback
    }
  },

  /**
   * Asignar tags a un producto (reemplaza todos los tags existentes)
   */
  async setProductTags(productId: string, tagIds: string[]) {
    try {
      const hasTags = await checkTagsAvailable();
      if (!hasTags) return; // Silently skip if tags not available

      // Primero eliminar todos los tags existentes
      const { error: deleteError } = await supabase
        .from('product_tag_assignments')
        .delete()
        .eq('product_id', productId);

      if (deleteError) throw deleteError;

      // Luego insertar los nuevos
      if (tagIds.length > 0) {
        const assignments = tagIds.map(tag_id => ({
          product_id: productId,
          tag_id,
        }));

        const { error: insertError } = await supabase
          .from('product_tag_assignments')
          .insert(assignments);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error setting product tags:', error);
      // Don't throw — tags are non-critical
    }
  },

  /**
   * Crear un nuevo tag
   */
  async createTag(tag: { name: string; category?: string | null; tag_group: string }): Promise<ProductTag | null> {
    try {
      const hasTags = await checkTagsAvailable();
      if (!hasTags) return null;

      const { data, error } = await supabase
        .from('product_tags')
        .insert([tag])
        .select()
        .single();

      if (error) throw error;
      return data as ProductTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  },

  /**
   * Eliminar un tag
   */
  async deleteTag(tagId: string) {
    try {
      const hasTags = await checkTagsAvailable();
      if (!hasTags) return;

      const { error } = await supabase
        .from('product_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  },
};
