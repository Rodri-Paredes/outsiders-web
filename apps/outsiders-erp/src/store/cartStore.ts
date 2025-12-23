import { create } from 'zustand'
import { ProductWithStock, ProductVariant } from '@/lib/types'

interface CartItem {
  variantId: string
  productId: string
  productName: string
  size: string
  price: number
  quantity: number
  available: number
  imageUrl?: string
}

interface CartState {
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  
  // Actions
  addItem: (variant: ProductVariant, product: ProductWithStock, quantity: number, available: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  setDiscount: (amount: number) => void
  clearCart: () => void
  calculateTotals: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,

  addItem: (variant, product, quantity, available) => {
    const { items } = get()
    
    // Verificar stock disponible
    if (quantity > available) {
      throw new Error(`Solo hay ${available} unidades disponibles`)
    }

    // Verificar si el item ya existe
    const existingItem = items.find(item => item.variantId === variant.id)

    if (existingItem) {
      // Actualizar cantidad
      const newQuantity = existingItem.quantity + quantity
      if (newQuantity > available) {
        throw new Error(`Solo hay ${available} unidades disponibles`)
      }
      
      set({
        items: items.map(item =>
          item.variantId === variant.id
            ? { ...item, quantity: newQuantity }
            : item
        ),
      })
    } else {
      // Agregar nuevo item
      const newItem: CartItem = {
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        size: variant.size,
        price: product.price,
        quantity,
        available,
        imageUrl: product.image_url || undefined,
      }

      set({ items: [...items, newItem] })
    }

    get().calculateTotals()
  },

  removeItem: (variantId) => {
    const { items } = get()
    set({ items: items.filter(item => item.variantId !== variantId) })
    get().calculateTotals()
  },

  updateQuantity: (variantId, quantity) => {
    const { items } = get()
    
    if (quantity <= 0) {
      get().removeItem(variantId)
      return
    }

    const item = items.find(i => i.variantId === variantId)
    if (item && quantity > item.available) {
      throw new Error(`Solo hay ${item.available} unidades disponibles`)
    }

    set({
      items: items.map(item =>
        item.variantId === variantId
          ? { ...item, quantity }
          : item
      ),
    })
    
    get().calculateTotals()
  },

  setDiscount: (amount) => {
    if (amount < 0) {
      throw new Error('El descuento no puede ser negativo')
    }

    const { subtotal } = get()
    if (amount > subtotal) {
      throw new Error('El descuento no puede ser mayor al subtotal')
    }

    set({ discount: amount })
    get().calculateTotals()
  },

  clearCart: () => {
    set({
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
    })
  },

  calculateTotals: () => {
    const { items, discount } = get()
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const total = subtotal - discount

    set({ subtotal, total })
  },
}))
