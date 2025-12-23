import { supabase } from '../lib/supabase';

export const reportService = {
  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboardStats(branchId: string, startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase.rpc('get_sales_stats', {
        p_branch_id: branchId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;
      // La función retorna TABLE, así que tomamos el primer elemento
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Obtener ventas por método de pago
   */
  async getSalesByPaymentMethod(
    branchId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('payment_type, total')
        .eq('branch_id', branchId)
        .gte('sale_date', `${startDate}T00:00:00`)
        .lte('sale_date', `${endDate}T23:59:59`);

      if (error) throw error;

      // Agrupar por método de pago
      const grouped = data.reduce((acc: any, sale: any) => {
        const type = sale.payment_type;
        if (!acc[type]) {
          acc[type] = { type, total: 0, count: 0 };
        }
        acc[type].total += Number(sale.total) || 0;
        acc[type].count += 1;
        return acc;
      }, {});

      return Object.values(grouped);
    } catch (error) {
      console.error('Error fetching sales by payment method:', error);
      throw error;
    }
  },

  /**
   * Obtener top productos vendidos
   */
  async getTopProducts(
    branchId: string,
    startDate: string,
    endDate: string,
    limit: number = 5
  ) {
    try {
      const { data, error } = await supabase.rpc('get_top_products', {
        p_branch_id: branchId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_limit: limit,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  },

  /**
   * Obtener datos para gráfico de ventas diarias
   */
  async getSalesChart(branchId: string, startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('sale_date, total')
        .eq('branch_id', branchId)
        .gte('sale_date', startDate)
        .lte('sale_date', endDate)
        .order('sale_date', { ascending: true });

      if (error) throw error;

      // Agrupar por día
      const grouped = data.reduce((acc: any, sale: any) => {
        const date = sale.sale_date.split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, total: 0, count: 0 };
        }
        acc[date].total += sale.total;
        acc[date].count += 1;
        return acc;
      }, {});

      return Object.values(grouped);
    } catch (error) {
      console.error('Error fetching sales chart data:', error);
      throw error;
    }
  },

  /**
   * Obtener tendencia de ingresos
   */
  async getRevenueTrend(branchId: string, days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getSalesChart(
      branchId,
      startDate.toISOString(),
      endDate.toISOString()
    );
  },

  /**
   * Obtener desglose de pagos mixtos
   */
  async getMixedPaymentBreakdown(branchId: string, date: string) {
    try {
      const { data, error } = await supabase.rpc('get_mixed_payment_breakdown', {
        p_branch_id: branchId,
        p_date: date,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching mixed payment breakdown:', error);
      throw error;
    }
  },

  /**
   * Obtener ventas con descuentos
   */
  async getSalesWithDiscounts(branchId: string, date: string) {
    try {
      const { data, error } = await supabase.rpc('get_sales_with_discounts', {
        p_branch_id: branchId,
        p_date: date,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sales with discounts:', error);
      throw error;
    }
  },

  /**
   * Obtener reporte detallado de ventas
   */
  async getSalesReport(branchId: string, startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          user:users!sales_user_id_fkey(name),
          sale_items(
            quantity,
            product_variant:product_variants(
              product:products(name)
            )
          )
        `)
        .eq('branch_id', branchId)
        .gte('sale_date', `${startDate}T00:00:00`)
        .lte('sale_date', `${endDate}T23:59:59`)
        .order('sale_date', { ascending: false });

      if (error) throw error;

      // Formatear datos para el reporte
      return data.map((sale: any) => ({
        ...sale,
        userName: sale.user?.name || 'N/A',
        products: sale.sale_items.map((item: any) => 
          `${item.product_variant?.product?.name || 'N/A'} (x${item.quantity})`
        ).join(', ')
      }));
    } catch (error) {
      console.error('Error fetching sales report:', error);
      throw error;
    }
  },

  /**
   * Exportar reporte a CSV
   */
  exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Obtener headers
    const headers = Object.keys(data[0]);

    // Crear contenido CSV
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')
      ),
    ].join('\n');

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
