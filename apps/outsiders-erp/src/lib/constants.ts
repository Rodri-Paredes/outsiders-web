import { PaymentType, UserRole, DropStatus, CashRegisterStatus, MovementType } from './types'

// ==================== PRODUCT CATEGORIES ====================

export const CATEGORIES = [
  'Camisetas',
  'Sudaderas',
  'Pantalones',
  'Accesorios',
  'Calzado',
  'Gorras',
  'Otros',
] as const

export type Category = (typeof CATEGORIES)[number]

// ==================== PRODUCT SIZES ====================

export const SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
  'Única',
] as const

export type Size = (typeof SIZES)[number]

// ==================== PAYMENT TYPES ====================

export const PAYMENT_TYPES: PaymentType[] = [
  'EFECTIVO',
  'QR',
  'TARJETA',
  'MIXTO',
]

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  EFECTIVO: 'Efectivo',
  QR: 'QR',
  TARJETA: 'Tarjeta',
  MIXTO: 'Mixto',
}

// ==================== USER ROLES ====================

export const ROLES: UserRole[] = ['admin', 'vendedor']

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  vendedor: 'Vendedor',
}

// ==================== DROP STATUS ====================

export const DROP_STATUS: DropStatus[] = ['ACTIVO', 'INACTIVO', 'FINALIZADO']

export const DROP_STATUS_LABELS: Record<DropStatus, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  FINALIZADO: 'Finalizado',
}

export const DROP_STATUS_COLORS: Record<DropStatus, string> = {
  ACTIVO: 'bg-green-100 text-green-800',
  INACTIVO: 'bg-yellow-100 text-yellow-800',
  FINALIZADO: 'bg-gray-100 text-gray-800',
}

// ==================== CASH REGISTER STATUS ====================

export const CASH_REGISTER_STATUS: CashRegisterStatus[] = ['ABIERTA', 'CERRADA']

export const CASH_REGISTER_STATUS_LABELS: Record<CashRegisterStatus, string> = {
  ABIERTA: 'Abierta',
  CERRADA: 'Cerrada',
}

export const CASH_REGISTER_STATUS_COLORS: Record<CashRegisterStatus, string> = {
  ABIERTA: 'bg-green-100 text-green-800',
  CERRADA: 'bg-gray-100 text-gray-800',
}

// ==================== MOVEMENT TYPES ====================

export const MOVEMENT_TYPES: MovementType[] = ['INGRESO', 'EGRESO']

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  INGRESO: 'Ingreso',
  EGRESO: 'Egreso',
}

export const MOVEMENT_TYPE_COLORS: Record<MovementType, string> = {
  INGRESO: 'bg-green-100 text-green-800',
  EGRESO: 'bg-red-100 text-red-800',
}

// ==================== STOCK ADJUSTMENT REASONS ====================

export const STOCK_ADJUSTMENT_REASONS = [
  'Compra',
  'Devolución',
  'Corrección',
  'Daño',
  'Pérdida',
  'Inventario',
] as const

export type StockAdjustmentReason = (typeof STOCK_ADJUSTMENT_REASONS)[number]

// ==================== DATE RANGES ====================

export const DATE_RANGES = [
  { label: 'Hoy', value: 'today' },
  { label: 'Últimos 7 días', value: '7days' },
  { label: 'Últimos 30 días', value: '30days' },
  { label: 'Este mes', value: 'this_month' },
  { label: 'Personalizado', value: 'custom' },
] as const

// ==================== PAGINATION ====================

export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// ==================== LOW STOCK THRESHOLD ====================

export const LOW_STOCK_THRESHOLD = 5

// ==================== CURRENCY ====================

export const CURRENCY_SYMBOL = 'Bs.'
export const CURRENCY_CODE = 'BOB'

// ==================== IMAGE UPLOAD ====================

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const STORAGE_BUCKETS = {
  PRODUCTS: 'products',
  DROPS: 'drops',
  BANNERS: 'banners',
} as const

// ==================== DEBOUNCE DELAYS ====================

export const DEBOUNCE_DELAY = {
  SEARCH: 500,
  INPUT: 300,
  RESIZE: 150,
} as const

// ==================== TOAST DURATION ====================

export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 4000,
  INFO: 3000,
  WARNING: 4000,
} as const

// ==================== LOCAL STORAGE KEYS ====================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'outsiders_auth_token',
  ACTIVE_BRANCH: 'outsiders_active_branch',
  THEME: 'outsiders_theme',
  LANGUAGE: 'outsiders_language',
} as const

// ==================== API ENDPOINTS ====================

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_VARIANTS: '/product-variants',
  
  // Sales
  SALES: '/sales',
  SALE_ITEMS: '/sale-items',
  
  // Stock
  STOCK: '/stock',
  STOCK_TRANSFERS: '/stock-transfers',
  
  // Drops
  DROPS: '/drops',
  DROP_PRODUCTS: '/drop-products',
  
  // Cash
  CASH_REGISTERS: '/cash-registers',
  CASH_MOVEMENTS: '/cash-movements',
  
  // Reports
  DASHBOARD_STATS: '/reports/dashboard-stats',
  SALES_CHART: '/reports/sales-chart',
  TOP_PRODUCTS: '/reports/top-products',
} as const

// ==================== REGEX PATTERNS ====================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{8,}$/,
  NUMERIC: /^[0-9]+$/,
  DECIMAL: /^[0-9]+(\.[0-9]{1,2})?$/,
} as const

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_EMAIL: 'Email inválido',
  INVALID_PHONE: 'Teléfono inválido',
  INVALID_NUMBER: 'Número inválido',
  MIN_VALUE: (min: number) => `El valor mínimo es ${min}`,
  MAX_VALUE: (max: number) => `El valor máximo es ${max}`,
  MIN_LENGTH: (min: number) => `Mínimo ${min} caracteres`,
  MAX_LENGTH: (max: number) => `Máximo ${max} caracteres`,
  PASSWORDS_NOT_MATCH: 'Las contraseñas no coinciden',
  GENERIC_ERROR: 'Ha ocurrido un error. Por favor, intenta de nuevo.',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  UNAUTHORIZED: 'No autorizado. Por favor, inicia sesión.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'No se encontró el recurso solicitado.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
} as const

// ==================== SUCCESS MESSAGES ====================

export const SUCCESS_MESSAGES = {
  LOGIN: 'Sesión iniciada correctamente',
  LOGOUT: 'Sesión cerrada correctamente',
  PRODUCT_CREATED: 'Producto creado correctamente',
  PRODUCT_UPDATED: 'Producto actualizado correctamente',
  PRODUCT_DELETED: 'Producto eliminado correctamente',
  SALE_CREATED: 'Venta registrada correctamente',
  CASH_REGISTER_OPENED: 'Caja abierta correctamente',
  CASH_REGISTER_CLOSED: 'Caja cerrada correctamente',
  STOCK_UPDATED: 'Stock actualizado correctamente',
  STOCK_TRANSFERRED: 'Stock transferido correctamente',
  DROP_CREATED: 'Drop creado correctamente',
  DROP_UPDATED: 'Drop actualizado correctamente',
  DROP_DELETED: 'Drop eliminado correctamente',
} as const
