import { supabase } from '@/lib/supabase'
import { Branch } from '@/lib/types'

export const branchService = {
  /**
   * Obtener todas las sucursales
   */
  getBranches: async (): Promise<Branch[]> => {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  /**
   * Obtener sucursal por ID
   */
  getBranchById: async (id: string): Promise<Branch> => {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Crear nueva sucursal
   */
  createBranch: async (branchData: Omit<Branch, 'id' | 'created_at'>): Promise<Branch> => {
    const { data, error } = await supabase
      .from('branches')
      .insert([branchData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualizar sucursal
   */
  updateBranch: async (id: string, updates: Partial<Branch>): Promise<Branch> => {
    const { data, error } = await supabase
      .from('branches')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Eliminar sucursal
   */
  deleteBranch: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
