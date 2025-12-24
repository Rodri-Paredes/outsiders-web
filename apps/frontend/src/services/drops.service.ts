import { supabase } from '../lib/supabase'
import { Drop } from '../lib/database.types'

export const dropsService = {
  async getAll(): Promise<Drop[]> {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .order('launch_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getActive(): Promise<Drop[]> {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .eq('status', 'ACTIVO')
      .order('launch_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Drop | null> {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getProducts(dropId: string) {
    const { data, error } = await supabase
      .from('drop_products')
      .select(`
        *,
        product:products(*)
      `)
      .eq('drop_id', dropId)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  async create(drop: Omit<Drop, 'id' | 'created_at' | 'updated_at'>): Promise<Drop> {
    const { data, error } = await supabase
      .from('drops')
      .insert(drop)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Drop>): Promise<Drop> {
    const { data, error } = await supabase
      .from('drops')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('drops')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async addProduct(dropId: string, productId: string, isFeatured: boolean = false, sortOrder: number = 0) {
    const { data, error } = await supabase
      .from('drop_products')
      .insert({
        drop_id: dropId,
        product_id: productId,
        is_featured: isFeatured,
        sort_order: sortOrder
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async removeProduct(dropId: string, productId: string) {
    const { error } = await supabase
      .from('drop_products')
      .delete()
      .eq('drop_id', dropId)
      .eq('product_id', productId)

    if (error) throw error
  }
}
