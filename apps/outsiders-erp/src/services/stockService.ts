import { supabase } from '../lib/supabase';
import type { Stock } from '../lib/types';

export const stockService = {
  /**
   * Obtener stock por sucursal
   */
  async getStockByBranch(branchId: string) {
    try {
      const { data, error } = await supabase
        .from('stock')
        .select(`
          *,
          variant:product_variants(
            id,
            size,
            product:products(
              id,
              name,
              category,
              price,
              image_url
            )
          )
        `)
        .eq('branch_id', branchId)
        .order('quantity', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching stock by branch:', error);
      throw error;
    }
  },

  /**
   * Obtener stock por producto en una sucursal
   */
  async getStockByProduct(productId: string, branchId: string) {
    try {
      const { data, error } = await supabase
        .from('stock')
        .select(`
          *,
          variant:product_variants!inner(
            id,
            size,
            product_id
          )
        `)
        .eq('branch_id', branchId)
        .eq('variant.product_id', productId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching stock by product:', error);
      throw error;
    }
  },

  /**
   * Obtener stock por variante en una sucursal
   */
  async getStockByVariant(variantId: string, branchId: string) {
    try {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .eq('variant_id', variantId)
        .eq('branch_id', branchId)
        .single();

      if (error) throw error;
      return data as Stock;
    } catch (error) {
      console.error('Error fetching stock by variant:', error);
      throw error;
    }
  },

  /**
   * Actualizar stock de una variante en una sucursal
   * @param quantity - Cantidad a ajustar (positivo para aumentar, negativo para disminuir)
   */
  async updateStock(variantId: string, branchId: string, quantity: number) {
    try {
      const { error } = await supabase.rpc('update_stock', {
        p_variant_id: variantId,
        p_branch_id: branchId,
        p_quantity: quantity,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  /**
   * Establecer stock absoluto (reemplaza el valor actual)
   */
  async setStock(variantId: string, branchId: string, newQuantity: number) {
    try {
      if (newQuantity < 0) {
        throw new Error('La cantidad no puede ser negativa');
      }

      // Primero obtenemos el stock actual
      const currentStock = await this.getStockByVariant(variantId, branchId);
      const difference = newQuantity - (currentStock?.quantity || 0);

      // Actualizamos con la diferencia
      const { error } = await supabase.rpc('update_stock', {
        p_variant_id: variantId,
        p_branch_id: branchId,
        p_quantity: difference,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error setting stock:', error);
      throw error;
    }
  },

  /**
   * Transferir stock entre sucursales
   */
  async transferStock(
    variantId: string,
    fromBranchId: string,
    toBranchId: string,
    quantity: number
  ) {
    try {
      if (fromBranchId === toBranchId) {
        throw new Error('No se puede transferir a la misma sucursal');
      }

      if (quantity <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      // Verificar stock disponible en origen
      const stockOrigen = await this.getStockByVariant(variantId, fromBranchId);
      if (!stockOrigen || stockOrigen.quantity < quantity) {
        throw new Error('Stock insuficiente en la sucursal de origen');
      }

      // Restar del origen (cantidad negativa)
      await this.updateStock(variantId, fromBranchId, -quantity);

      // Sumar al destino (cantidad positiva)
      await this.updateStock(variantId, toBranchId, quantity);

      return { success: true };
    } catch (error) {
      console.error('Error transferring stock:', error);
      throw error;
    }
  },

  /**
   * Obtener productos con stock bajo
   */
  async getLowStock(branchId: string, threshold: number = 5) {
    try {
      const { data, error } = await supabase
        .from('stock')
        .select(`
          *,
          variant:product_variants(
            id,
            size,
            product:products(
              id,
              name,
              category,
              price,
              image_url
            )
          )
        `)
        .eq('branch_id', branchId)
        .lt('quantity', threshold)
        .order('quantity', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching low stock:', error);
      throw error;
    }
  },

  /**
   * Inicializar stock para una nueva variante
   */
  async initializeStock(variantId: string, branchId: string, quantity: number = 0) {
    try {
      const { data, error } = await supabase
        .from('stock')
        .insert([
          {
            variant_id: variantId,
            branch_id: branchId,
            quantity,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Stock;
    } catch (error) {
      console.error('Error initializing stock:', error);
      throw error;
    }
  },
};
