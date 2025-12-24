export interface Product {
  id: string
  name: string
  description: string
  category?: string
  price: number
  stock: number
  image_url?: string
  drop_id?: string
  is_visible: boolean
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN' | 'VENDEDOR'
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
