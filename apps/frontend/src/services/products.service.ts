import { supabase } from '../lib/supabase'
import { Product } from '../lib/database.types'

export const productsService = {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(
          id,
          size,
          stock:stock(quantity)
        )
      `)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Calcular stock total por producto
    const productsWithStock = (data || []).map(product => {
      const totalStock = product.variants?.reduce((sum: number, variant: any) => {
        const variantStock = variant.stock?.reduce((s: number, st: any) => s + (st.quantity || 0), 0) || 0;
        return sum + variantStock;
      }, 0) || 0;
      
      return {
        ...product,
        stock: totalStock,
        hasStock: totalStock > 0
      };
    });
    
    return productsWithStock as any;
  },

  async getAll(): Promise<Product[]> {
    return this.getProducts();
  },

  async getById(id: string): Promise<Product | null> {
    console.log('Fetching product with ID:', id);
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(
          id,
          size,
          stock:stock(quantity)
        )
      `)
      .eq('id', id)
      .eq('is_visible', true)
      .single()

    if (error) {
      console.error('Error fetching product from Supabase:', error);
      return null;
    }
    
    if (!data) {
      console.error('No data returned for product ID:', id);
      return null;
    }
    
    console.log('Product data from Supabase:', data);
    
    // Calcular stock total
    const totalStock = data.variants?.reduce((sum: number, variant: any) => {
      const variantStock = variant.stock?.reduce((s: number, st: any) => s + (st.quantity || 0), 0) || 0;
      return sum + variantStock;
    }, 0) || 0;
    
    return {
      ...data,
      stock: totalStock,
      hasStock: totalStock > 0
    } as any;
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
