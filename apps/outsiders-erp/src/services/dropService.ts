import { supabase } from '../lib/supabase';
import type { Drop, DropWithProducts, DropStatus } from '../lib/types';

export const dropService = {
  /**
   * Obtener todos los drops
   */
  async getDrops(filters?: { status?: DropStatus }) {
    try {
      let query = supabase
        .from('drops')
        .select('*')
        .order('launch_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Drop[];
    } catch (error) {
      console.error('Error fetching drops:', error);
      throw error;
    }
  },

  /**
   * Obtener drops activos
   */
  async getActiveDrops() {
    try {
      const { data, error } = await supabase.rpc('get_active_drops');

      if (error) throw error;
      return data as Drop[];
    } catch (error) {
      console.error('Error fetching active drops:', error);
      throw error;
    }
  },

  /**
   * Obtener drop por ID
   */
  async getDropById(id: string) {
    try {
      const { data, error } = await supabase
        .from('drops')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Drop;
    } catch (error) {
      console.error('Error fetching drop:', error);
      throw error;
    }
  },

  /**
   * Obtener drop con sus productos
   */
  async getDropWithProducts(id: string): Promise<DropWithProducts> {
    try {
      const { data, error } = await supabase.rpc('get_drop_products', {
        p_drop_id: id,
      });

      if (error) throw error;
      return data as DropWithProducts;
    } catch (error) {
      console.error('Error fetching drop with products:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo drop
   */
  async createDrop(dropData: {
    name: string;
    description?: string;
    launch_date: string;
    end_date?: string;
    status?: DropStatus;
    is_featured?: boolean;
    image_url?: string;
    banner_url?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('drops')
        .insert([
          {
            ...dropData,
            status: dropData.status || 'INACTIVO',
            is_featured: dropData.is_featured || false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Drop;
    } catch (error) {
      console.error('Error creating drop:', error);
      throw error;
    }
  },

  /**
   * Actualizar un drop
   */
  async updateDrop(id: string, updates: Partial<Drop>) {
    try {
      const { data, error } = await supabase
        .from('drops')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Drop;
    } catch (error) {
      console.error('Error updating drop:', error);
      throw error;
    }
  },

  /**
   * Eliminar un drop
   */
  async deleteDrop(id: string) {
    try {
      const { error } = await supabase.from('drops').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting drop:', error);
      throw error;
    }
  },

  /**
   * Agregar producto a un drop
   */
  async addProductToDrop(
    dropId: string,
    productId: string,
    isFeatured: boolean = false,
    sortOrder: number = 0
  ) {
    try {
      const { data, error } = await supabase
        .from('drop_products')
        .insert([
          {
            drop_id: dropId,
            product_id: productId,
            is_featured: isFeatured,
            sort_order: sortOrder,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding product to drop:', error);
      throw error;
    }
  },

  /**
   * Remover producto de un drop
   */
  async removeProductFromDrop(dropId: string, productId: string) {
    try {
      const { error } = await supabase
        .from('drop_products')
        .delete()
        .eq('drop_id', dropId)
        .eq('product_id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing product from drop:', error);
      throw error;
    }
  },

  /**
   * Actualizar producto en drop (featured, order)
   */
  async updateDropProduct(
    dropProductId: string,
    updates: {
      is_featured?: boolean;
      sort_order?: number;
    }
  ) {
    try {
      const { data, error } = await supabase
        .from('drop_products')
        .update(updates)
        .eq('id', dropProductId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating drop product:', error);
      throw error;
    }
  },

  /**
   * Subir imagen o banner de drop
   */
  async uploadDropImage(file: File, _type: 'image' | 'banner'): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `drops/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('drops')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('drops').getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading drop image:', error);
      throw error;
    }
  },
};
