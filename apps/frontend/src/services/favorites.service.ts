import { supabase } from '../lib/supabase'

export const favoritesService = {
  async getFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        product_id,
        created_at,
        product:products (
          id,
          name,
          price,
          original_price,
          discount_percentage,
          image_url,
          category,
          is_visible,
          visible_on_web
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async addFavorite(userId: string, productId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, product_id: productId })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return null // already exists
      throw error
    }
    return data
  },

  async removeFavorite(userId: string, productId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) throw error
  },

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) return false
    return (count ?? 0) > 0
  },

  async getFavoriteIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId)

    if (error) return []
    return (data || []).map(f => f.product_id)
  }
}
