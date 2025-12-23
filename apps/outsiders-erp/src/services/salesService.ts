import { supabase } from '../lib/supabase';
import type { Sale, SaleWithItems, PaymentType, PaymentDetails } from '../lib/types';

export const salesService = {
  /**
   * Crear una nueva venta usando la función transaccional de la base de datos
   * Los triggers automáticos se encargan de:
   * - Descontar stock (trigger: after_sale_item_insert_update_stock)
   * - Registrar movimientos de caja (trigger: after_sale_insert_register_cash)
   */
  async createSale(saleData: {
    user_id: string;
    branch_id: string;
    items: Array<{
      variant_id: string;
      quantity: number;
      unit_price: number;
    }>;
    subtotal: number;
    discount_amount: number;
    total: number;
    payment_type: PaymentType;
    payment_details?: PaymentDetails;
  }) {
    try {
      // Usar la función transaccional que valida todo y ejecuta los triggers automáticamente
      const { data, error } = await supabase.rpc('create_complete_sale', {
        p_branch_id: saleData.branch_id,
        p_items: saleData.items,
        p_discount_amount: saleData.discount_amount,
        p_payment_type: saleData.payment_type,
        p_payment_details: saleData.payment_details || null,
      });

      if (error) throw error;

      // Retornar la venta creada
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', data.sale_id)
        .single();

      if (saleError) throw saleError;

      return sale as Sale;
    } catch (error: any) {
      console.error('Error creating sale:', error);
      // Mejorar mensaje de error
      if (error.message?.includes('Stock insuficiente')) {
        throw new Error('Stock insuficiente para completar la venta');
      }
      if (error.message?.includes('No hay una caja abierta')) {
        throw new Error('No hay una caja abierta. Por favor, abre la caja antes de realizar ventas.');
      }
      throw error;
    }
  },

  /**
   * MÉTODO LEGACY - Mantener por compatibilidad pero no usar
   * Este método quedó obsoleto con la implementación de triggers automáticos
   * @deprecated Use createSale() instead
   */
  async createSaleLegacy(saleData: {
    user_id: string;
    branch_id: string;
    items: Array<{
      variant_id: string;
      quantity: number;
      unit_price: number;
    }>;
    subtotal: number;
    discount_amount: number;
    total: number;
    payment_type: PaymentType;
    payment_details?: PaymentDetails;
  }) {
    try {
      // Crear la venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([
          {
            user_id: saleData.user_id,
            branch_id: saleData.branch_id,
            subtotal: saleData.subtotal,
            discount_amount: saleData.discount_amount,
            total: saleData.total,
            payment_type: saleData.payment_type,
            payment_details: saleData.payment_details,
          },
        ])
        .select()
        .single();

      if (saleError) throw saleError;

      // Crear los items de la venta
      const saleItems = saleData.items.map((item) => ({
        sale_id: sale.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // NOTA: Los triggers automáticos ya manejan:
      // 1. Descuento de stock (after_sale_item_insert_update_stock)
      // 2. Registro de caja (after_sale_insert_register_cash)
      // Ya no necesitamos hacer estas operaciones manualmente

      return sale as Sale;
    } catch (error) {
      console.error('Error creating sale (legacy):', error);
      throw error;
    }
  },

  /**
   * MÉTODO ELIMINADO - Ya no es necesario
   * El código duplicado que ejecutaba manualmente lo que los triggers ya hacen
   */
  _removedDuplicateLogic() {
    // Este código fue eliminado porque duplicaba la lógica de los triggers:
    // - update_stock() se ejecutaba manualmente Y por el trigger
    // - cash_movements se insertaban manualmente Y por el trigger
    // Resultado: doble descuento de stock y movimientos duplicados
  },

  /**
   * Obtener ventas por sucursal
   */
  async getSales(
    branchId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      userId?: string;
    }
  ) {
    try {
      let query = supabase
        .from('sales')
        .select('*')
        .eq('branch_id', branchId)
        .order('sale_date', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('sale_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('sale_date', filters.endDate);
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Sale[];
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  },

  /**
   * Obtener una venta por ID con sus items
   */
  async getSaleById(id: string): Promise<SaleWithItems> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          items:sale_items(
            *,
            variant:product_variants(
              *,
              product:products(*)
            )
          ),
          user:users(name, email),
          branch:branches(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as SaleWithItems;
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw error;
    }
  },

  /**
   * Obtener ventas por fecha específica
   */
  async getSalesByDate(branchId: string, date: string): Promise<SaleWithItems[]> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          items:sale_items(
            *,
            variant:product_variants(
              *,
              product:products(*)
            )
          ),
          user:users(name)
        `)
        .eq('branch_id', branchId)
        .gte('sale_date', `${date}T00:00:00`)
        .lte('sale_date', `${date}T23:59:59`)
        .order('sale_date', { ascending: false });

      if (error) throw error;
      return data as SaleWithItems[];
    } catch (error) {
      console.error('Error fetching sales by date:', error);
      throw error;
    }
  },

  /**
   * Obtener ventas del día actual
   */
  async getDailySales(branchId: string): Promise<SaleWithItems[]> {
    const today = new Date().toISOString().split('T')[0]!;
    return await this.getSalesByDate(branchId, today);
  },

  /**
   * Obtener estadísticas de ventas
   */
  async getSalesStats(
    branchId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const { data, error } = await supabase.rpc('get_sales_stats', {
        p_branch_id: branchId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      throw error;
    }
  },
};
