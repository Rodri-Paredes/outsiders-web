export interface Product {
  id: string
  name: string
  description: string
  category?: string
  price: number
  original_price?: number | null
  discount_percentage?: number | null
  stock: number
  image_url?: string
  images?: string[]
  drop_id?: string
  is_visible: boolean
  is_new_in?: boolean
  web_only?: boolean
  sort_order?: number
  size_guide_id?: string | null
  created_at?: string
  updated_at?: string
  variants?: ProductVariant[]
  tags?: ProductTagAssignment[]
  hasStock?: boolean
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string
  price_override?: number | null
  stock?: StockItem[]
  created_at?: string
}

export interface StockItem {
  id: string
  variant_id: string
  branch_id: string
  quantity: number
  created_at?: string
  updated_at?: string
}

export interface ProductTag {
  id: string
  name: string
  category: string | null
  tag_group: string
  created_at?: string
}

export interface ProductTagAssignment {
  id: string
  product_id: string
  tag_id: string
  tag?: ProductTag
  created_at?: string
}

export interface User {
  id: string
  email: string
  name?: string
  last_name?: string
  phone?: string
  role: 'user' | 'admin' | 'vendedor'
  branch_id?: string
  created_at?: string
  updated_at?: string
}

export interface Branch {
  id: string
  name: string
  address: string
  created_at?: string
}

export interface Drop {
  id: string
  name: string
  description: string
  launch_date: string
  end_date?: string
  status: 'ACTIVO' | 'INACTIVO' | 'FINALIZADO'
  is_featured: boolean
  image_url?: string
  banner_url?: string
  created_at?: string
  updated_at?: string
}

export interface Cart {
  id: string
  user_id: string
  created_at?: string
  updated_at?: string
  items?: CartItem[]
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  total: number
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  created_at?: string
  updated_at?: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  product?: Product
}
