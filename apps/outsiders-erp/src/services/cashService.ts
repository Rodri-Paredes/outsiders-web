import { supabase } from '../lib/supabase';
import type { CashRegister, CashMovement, CashRegisterStatus } from '../lib/types';

export const cashService = {
  /**
   * Obtener caja abierta de una sucursal
   */
  async getOpenCashRegister(branchId: string) {
    try {
      const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('branch_id', branchId)
        .eq('status', 'ABIERTA')
        .order('opening_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data as CashRegister | null;
    } catch (error) {
      console.error('Error fetching open cash register:', error);
      throw error;
    }
  },

  /**
   * Abrir caja
   */
  async openCashRegister(
    branchId: string,
    userId: string,
    openingAmount: number,
    notes?: string
  ) {
    try {
      // Verificar que no haya caja abierta
      const { data: existing, error: checkError } = await supabase
        .from('cash_registers')
        .select('id')
        .eq('branch_id', branchId)
        .eq('status', 'ABIERTA')
        .maybeSingle(); // Usa maybeSingle() en lugar de single() para manejar 0 resultados

      // Si hay error que NO sea "no rows", lanzarlo
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        throw new Error('Ya existe una caja abierta en esta sucursal');
      }

      // Crear registro de caja
      const { data: cashRegister, error: crError } = await supabase
        .from('cash_registers')
        .insert([{
          branch_id: branchId,
          user_id: userId,
          opening_amount: openingAmount,
          opening_user_id: userId,
          opening_notes: notes,
          status: 'ABIERTA'
        }])
        .select()
        .single();

      if (crError) throw crError;

      // Crear movimiento de apertura
      const { error: mvError } = await supabase
        .from('cash_movements')
        .insert([{
          cash_register_id: cashRegister.id,
          movement_type: 'INGRESO',
          payment_type: 'EFECTIVO',
          amount: openingAmount,
          description: 'Apertura de caja - Fondo inicial',
          user_id: userId
        }]);

      if (mvError) throw mvError;

      return cashRegister as CashRegister;
    } catch (error) {
      console.error('Error opening cash register:', error);
      throw error;
    }
  },

  /**
   * Cerrar caja
   */
  async closeCashRegister(
    cashRegisterId: string,
    userId: string,
    closingAmount: number,
    notes?: string
  ) {
    try {
      // Calcular totales esperados
      const { data: movements, error: mvError } = await supabase
        .from('cash_movements')
        .select('payment_type, amount')
        .eq('cash_register_id', cashRegisterId)
        .eq('movement_type', 'INGRESO');

      if (mvError) throw mvError;

      const expected_cash = movements
        ?.filter(m => m.payment_type === 'EFECTIVO')
        .reduce((sum, m) => sum + Number(m.amount), 0) || 0;
      
      const expected_qr = movements
        ?.filter(m => m.payment_type === 'QR')
        .reduce((sum, m) => sum + Number(m.amount), 0) || 0;
      
      const expected_card = movements
        ?.filter(m => m.payment_type === 'TARJETA')
        .reduce((sum, m) => sum + Number(m.amount), 0) || 0;
      
      const expected_total = movements?.reduce((sum, m) => sum + Number(m.amount), 0) || 0;
      
      const cash_difference = closingAmount - expected_cash;

      // Actualizar caja
      const { data, error } = await supabase
        .from('cash_registers')
        .update({
          status: 'CERRADA',
          closing_date: new Date().toISOString(),
          closing_amount: closingAmount,
          closing_user_id: userId,
          closing_notes: notes,
          expected_cash,
          expected_qr,
          expected_card,
          expected_total,
          cash_difference
        })
        .eq('id', cashRegisterId)
        .select()
        .single();

      if (error) throw error;
      return data as CashRegister;
    } catch (error) {
      console.error('Error closing cash register:', error);
      throw error;
    }
  },

  /**
   * Obtener resumen de caja
   */
  async getCashRegisterSummary(cashRegisterId: string) {
    try {
      // Obtener caja
      const { data: cashRegister, error: crError } = await supabase
        .from('cash_registers')
        .select('opening_amount')
        .eq('id', cashRegisterId)
        .single();

      if (crError) throw crError;

      // Obtener movimientos
      const { data: movements, error: mvError } = await supabase
        .from('cash_movements')
        .select('payment_type, amount, reference_type, reference_id')
        .eq('cash_register_id', cashRegisterId)
        .eq('movement_type', 'INGRESO');

      if (mvError) throw mvError;

      // Calcular totales
      const total_cash = movements
        ?.filter(m => m.payment_type === 'EFECTIVO')
        .reduce((sum, m) => sum + Number(m.amount), 0) || 0;
      
      const total_qr = movements
        ?.filter(m => m.payment_type === 'QR')
        .reduce((sum, m) => sum + Number(m.amount), 0) || 0;
      
      const total_card = movements
        ?.filter(m => m.payment_type === 'TARJETA')
        .reduce((sum, m) => sum + Number(m.amount), 0) || 0;
      
      const total_general = movements?.reduce((sum, m) => sum + Number(m.amount), 0) || 0;
      
      const sales_count = new Set(
        movements?.filter(m => m.reference_type === 'SALE').map(m => m.reference_id)
      ).size;

      return {
        total_cash,
        total_qr,
        total_card,
        total_general,
        sales_count,
        opening_amount: Number(cashRegister.opening_amount)
      };
    } catch (error) {
      console.error('Error fetching cash register summary:', error);
      throw error;
    }
  },

  /**
   * Obtener movimientos de caja
   */
  async getCashMovements(cashRegisterId: string) {
    try {
      const { data, error } = await supabase
        .from('cash_movements')
        .select(`
          *,
          user:users(name)
        `)
        .eq('cash_register_id', cashRegisterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CashMovement[];
    } catch (error) {
      console.error('Error fetching cash movements:', error);
      throw error;
    }
  },

  /**
   * Agregar movimiento manual de caja
   */
  async addCashMovement(movement: {
    cash_register_id: string;
    movement_type: 'INGRESO' | 'EGRESO';
    payment_type: string;
    amount: number;
    description: string;
    user_id: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('cash_movements')
        .insert([movement])
        .select()
        .single();

      if (error) throw error;
      return data as CashMovement;
    } catch (error) {
      console.error('Error adding cash movement:', error);
      throw error;
    }
  },

  /**
   * Obtener histórico de cajas de una sucursal
   */
  async getCashRegisterHistory(
    branchId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      status?: CashRegisterStatus;
    }
  ) {
    try {
      let query = supabase
        .from('cash_registers')
        .select(`
          *,
          opening_user:users!opening_user_id(name),
          closing_user:users!closing_user_id(name)
        `)
        .eq('branch_id', branchId)
        .order('opening_date', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('opening_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('opening_date', filters.endDate);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching cash register history:', error);
      throw error;
    }
  },

  /**
   * Obtener caja por ID
   */
  async getCashRegisterById(id: string) {
    try {
      const { data, error } = await supabase
        .from('cash_registers')
        .select(`
          *,
          opening_user:users!opening_user_id(name),
          closing_user:users!closing_user_id(name),
          branch:branches(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as CashRegister;
    } catch (error) {
      console.error('Error fetching cash register:', error);
      throw error;
    }
  },
};
