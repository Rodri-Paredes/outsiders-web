import { supabase } from '../lib/supabase';
import type { Product, ProductVariant, ProductWithVariants } from '../lib/types';

export const productService = {
  /**
   * Obtener todos los productos con filtros opcionales
   */
  async getProducts(filters?: {
    category?: string;
    search?: string;
    includeHidden?: boolean;
  }) {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (!filters?.includeHidden) {
        query = query.eq('is_visible', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Obtener un producto por ID
   */
  async getProductById(id: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Product;
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
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ProductWithVariants;
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
    price: number;
    image_url?: string;
    drop_id?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
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
      const { data, error } = await supabase
        .from('products')
        .update(updates)
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
   * Eliminar un producto
   */
  async deleteProduct(id: string) {
    try {
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

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
  async createProductVariant(productId: string, size: string) {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert([{ product_id: productId, size }])
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
};
