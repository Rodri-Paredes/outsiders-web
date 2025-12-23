// ==================== DATABASE TYPES ====================

export interface Branch {
  id: string
  name: string
  address: string
  created_at: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'vendedor'
  branch_id: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  category: string
  price: number
  image_url: string | null
  drop_id: string | null
  is_visible: boolean
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string
  created_at: string
}

export interface Stock {
  id: string
  variant_id: string
  branch_id: string
  quantity: number
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  user_id: string
  branch_id: string
  subtotal: number
  discount_amount: number
  total: number
  payment_type: PaymentType
  payment_details: PaymentDetails | null
  sale_date: string
  created_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  variant_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Drop {
  id: string
  name: string
  description: string | null
  launch_date: string
  end_date: string | null
  status: DropStatus
  is_featured: boolean
  image_url: string | null
  banner_url: string | null
  created_at: string
  updated_at: string
}

export interface DropProduct {
  id: string
  drop_id: string
  product_id: string
  is_featured: boolean
  sort_order: number
  created_at: string
}

export interface CashRegister {
  id: string
  branch_id: string
  user_id: string
  status: CashRegisterStatus
  opening_date: string
  opening_amount: number
  opening_user_id: string
  opening_notes: string | null
  closing_date: string | null
  closing_amount: number | null
  closing_user_id: string | null
  closing_notes: string | null
  expected_cash: number | null
  expected_qr: number | null
  expected_card: number | null
  expected_total: number | null
  cash_difference: number | null
  created_at: string
  updated_at: string
}

export interface CashMovement {
  id: string
  cash_register_id: string
  movement_type: MovementType
  payment_type: PaymentType
  amount: number
  description: string
  reference_id: string | null
  reference_type: string | null
  user_id: string
  created_at: string
}

// ==================== FORM TYPES ====================

export interface ProductFormData {
  name: string
  description?: string
  category: string
  price: number
  image_url?: string
  drop_id?: string
  is_visible: boolean
  sizes: string[]
}

export interface SaleFormData {
  items: SaleItemFormData[]
  discount_amount: number
  payment_type: PaymentType
  payment_details?: PaymentDetails
}

export interface SaleItemFormData {
  variant_id: string
  quantity: number
  unit_price: number
}

export interface DropFormData {
  name: string
  description?: string
  launch_date: string
  end_date?: string
  status: DropStatus
  is_featured: boolean
  image_url?: string
  banner_url?: string
}

export interface CashRegisterFormData {
  opening_amount: number
  opening_notes?: string
}

export interface CashRegisterCloseFormData {
  closing_amount: number
  closing_notes?: string
}

export interface CashMovementFormData {
  movement_type: MovementType
  payment_type: PaymentType
  amount: number
  description: string
}

export interface StockAdjustmentFormData {
  variant_id: string
  branch_id: string
  quantity: number
  reason: string
  notes?: string
}

export interface StockTransferFormData {
  variant_id: string
  from_branch_id: string
  to_branch_id: string
  quantity: number
  notes?: string
}

// ==================== EXTENDED TYPES ====================

export interface ProductWithVariants extends Product {
  variants: ProductVariant[]
}

export interface VariantWithStock extends ProductVariant {
  stock: Stock[]
  product?: Product
}

export interface ProductWithStock extends Product {
  variants: VariantWithStock[]
}

export interface SaleWithItems extends Sale {
  items: SaleItemWithDetails[]
  user?: User
}

export interface SaleItemWithDetails extends SaleItem {
  variant?: ProductVariant
  product?: Product
}

export interface DropWithProducts extends Drop {
  products: DropProductWithDetails[]
}

export interface DropProductWithDetails extends DropProduct {
  product?: Product
}

export interface CashRegisterWithMovements extends CashRegister {
  movements: CashMovementWithDetails[]
  opening_user?: User
  closing_user?: User
}

export interface CashMovementWithDetails extends CashMovement {
  user?: User
}

// ==================== PAYMENT TYPES ====================

export type PaymentType = 'EFECTIVO' | 'QR' | 'TARJETA' | 'MIXTO'

export interface PaymentDetails {
  efectivo?: number
  qr?: number
  tarjeta?: number
}

export type DropStatus = 'ACTIVO' | 'INACTIVO' | 'FINALIZADO'

export type CashRegisterStatus = 'ABIERTA' | 'CERRADA'

export type MovementType = 'INGRESO' | 'EGRESO'

export type UserRole = 'admin' | 'vendedor'

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ==================== FILTER TYPES ====================

export interface ProductFilter {
  category?: string
  search?: string
  includeHidden?: boolean
  drop_id?: string
}

export interface SaleFilter {
  start_date?: string
  end_date?: string
  payment_type?: PaymentType
  user_id?: string
}

export interface StockFilter {
  category?: string
  search?: string
  low_stock?: boolean
  threshold?: number
}

export interface DropFilter {
  status?: DropStatus
  is_featured?: boolean
}

export interface CashRegisterFilter {
  status?: CashRegisterStatus
  start_date?: string
  end_date?: string
  user_id?: string
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardStats {
  total_sales: number
  total_transactions: number
  average_ticket: number
  total_products_sold: number
}

export interface PaymentMethodStats {
  payment_type: PaymentType
  total: number
  count: number
}

export interface TopProduct {
  product_id: string
  product_name: string
  quantity_sold: number
  total_revenue: number
}

export interface SalesChartData {
  date: string
  sales: number
  transactions: number
}

export interface RevenueTrendData {
  date: string
  revenue: number
  change_percentage: number
}

// ==================== UTILITY TYPES ====================

export interface SelectOption {
  value: string
  label: string
}

export interface TableColumn<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export interface ToastMessage {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

// ==================== FORM VALIDATION TYPES ====================

export interface ValidationError {
  field: string
  message: string
}

export interface FormState {
  isSubmitting: boolean
  errors: ValidationError[]
  touched: Record<string, boolean>
}
