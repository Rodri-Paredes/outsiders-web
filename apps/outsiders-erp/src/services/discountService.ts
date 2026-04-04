import { supabase } from '../lib/supabase';
import type { Discount } from '../lib/types';

export const discountService = {
  /**
   * Obtener todos los descuentos
   */
  async getDiscounts(includeInactive = false) {
    try {
      let query = supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Discount[];
    } catch (error) {
      console.error('Error fetching discounts:', error);
      throw error;
    }
  },

  /**
   * Obtener descuento por ID
   */
  async getDiscountById(id: string) {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Discount;
    } catch (error) {
      console.error('Error fetching discount by id:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo descuento
   */
  async createDiscount(discount: Omit<Discount, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .insert([discount])
        .select()
        .single();

      if (error) throw error;
      return data as Discount;
    } catch (error) {
      console.error('Error creating discount:', error);
      throw error;
    }
  },

  /**
   * Actualizar descuento
   */
  async updateDiscount(id: string, updates: Partial<Omit<Discount, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Discount;
    } catch (error) {
      console.error('Error updating discount:', error);
      throw error;
    }
  },

  /**
   * Alternar estado activo del descuento
   */
  async toggleDiscountStatus(id: string, currentStatus: boolean) {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .update({ is_active: !currentStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Discount;
    } catch (error) {
      console.error('Error toggling discount status:', error);
      throw error;
    }
  },

  /**
   * Eliminar descuento
   */
  async deleteDiscount(id: string) {
    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting discount:', error);
      throw error;
    }
  }
};
