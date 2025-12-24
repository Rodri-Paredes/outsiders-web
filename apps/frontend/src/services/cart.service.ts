import { supabase } from '../lib/supabase'
import { Cart, CartItem } from '../lib/database.types'

export const cartService = {
  async getOrCreateCart(userId: string): Promise<Cart> {
    // Try to get existing cart
    let { data: cart, error } = await supabase
      .from('carts')
      .select(`
        *,
        items:cart_items(
          *,
          product:products(*)
        )
      `)
      .eq('user_id', userId)
      .single()

    // If no cart exists, create one
    if (error && error.code === 'PGRST116') {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select(`
          *,
          items:cart_items(
            *,
            product:products(*)
          )
        `)
        .single()

      if (createError) throw createError
      return newCart
    }

    if (error) throw error
    return cart
  },

  async addItem(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    const cart = await this.getOrCreateCart(userId)

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .single()

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: productId,
          quantity
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  async updateItemQuantity(cartItemId: string, quantity: number): Promise<CartItem | null> {
    if (quantity <= 0) {
      await this.removeItem(cartItemId)
      return null
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async removeItem(cartItemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)

    if (error) throw error
  },

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId)

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)

    if (error) throw error
  }
}
