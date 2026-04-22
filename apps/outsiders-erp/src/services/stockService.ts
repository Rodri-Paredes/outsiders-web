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
        .maybeSingle();

      if (error) throw error;
      return data as Stock | null;
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

      if (currentStock === null) {
        // No existe registro de stock — inicializarlo directamente
        await this.initializeStock(variantId, branchId, newQuantity);
        return { success: true };
      }

      const difference = newQuantity - currentStock.quantity;

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
   * Transferir stock entre sucursales usando función transaccional atómica
   * La función transfer_stock_atomic garantiza que ambas operaciones (origen y destino)
   * se ejecuten en una sola transacción. Si cualquiera falla, ambas revierten.
   */
  async transferStock(
    variantId: string,
    fromBranchId: string,
    toBranchId: string,
    quantity: number,
    notes?: string
  ) {
    try {
      // Validaciones básicas en frontend
      if (fromBranchId === toBranchId) {
        throw new Error('No se puede transferir a la misma sucursal');
      }

      if (quantity <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      // Llamar a la función transaccional de la base de datos
      // Esta función es ATÓMICA: si cualquier operación falla, toda la transacción revierte
      const { data, error } = await supabase.rpc('transfer_stock_atomic', {
        p_variant_id: variantId,
        p_from_branch_id: fromBranchId,
        p_to_branch_id: toBranchId,
        p_quantity: quantity,
        p_notes: notes || null,
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error transferring stock:', error);
      // Mejorar mensajes de error
      if (error.message?.includes('Stock insuficiente')) {
        throw new Error(error.message);
      }
      if (error.message?.includes('misma sucursal')) {
        throw new Error('No se puede transferir a la misma sucursal');
      }
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
