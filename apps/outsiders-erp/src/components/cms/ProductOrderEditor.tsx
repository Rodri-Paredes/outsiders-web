import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { cmsService } from '@/services/cmsService'
import toast from 'react-hot-toast'
import { Loader2, ArrowUp, ArrowDown, GripVertical, AlertCircle, RefreshCw, Save, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

const PAGE_SIZE = 20

interface OrderedProduct {
  id: string
  name: string
  image_url: string | null
  images: string[] | null
  price: number
  sort_order: number
  original_price?: number | null
  discount_percentage?: number | null
  category?: string | null
}

// All DB categories available in the shop
const CATEGORIES = [
  'Poleras',
  'Soleras',
  'Hoodies',
  'Quarter Zip',
  'Jeans',
  'Jogger',
  'Bermudas',
  'Accesorios',
  'Otros',
]

const PRICE_SPECIALS_KEY = '__price_specials__'

function getThumb(p: OrderedProduct): string | null {
  const imgs = p.images as any
  if (Array.isArray(imgs) && imgs.length > 0) return imgs[0]
  return p.image_url || null
}

export default function ProductOrderEditor() {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]!)
  const [products, setProducts] = useState<OrderedProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [saleCount, setSaleCount] = useState(0)
  const [page, setPage] = useState(0)

  const isPriceSpecials = selectedCategory === PRICE_SPECIALS_KEY

  // Load product counts per category once
  useEffect(() => {
    loadCategoryCounts()
  }, [])

  // Load products when category changes
  useEffect(() => {
    if (isPriceSpecials) {
      loadSaleProducts()
    } else {
      loadProducts(selectedCategory)
    }
  }, [selectedCategory])

  const loadCategoryCounts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('category, original_price, discount_percentage')
      .eq('is_visible', true)
      .eq('visible_on_web', true)

    if (!error && data) {
      const counts: Record<string, number> = {}
      let sale = 0
      data.forEach(p => {
        if (p.category) counts[p.category] = (counts[p.category] || 0) + 1
        if (p.original_price && p.discount_percentage && p.discount_percentage > 0) sale++
      })
      setCategoryCounts(counts)
      setSaleCount(sale)
    }
  }

  const loadProducts = useCallback(async (category: string) => {
    setLoading(true)
    setDirty(false)
    setPage(0)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url, images, price, sort_order')
        .eq('category', category)
        .eq('is_visible', true)
        .eq('visible_on_web', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts((data || []) as OrderedProduct[])
    } catch (err: any) {
      toast.error('Error cargando productos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSaleProducts = useCallback(async () => {
    setLoading(true)
    setDirty(false)
    setPage(0)
    try {
      // Fetch all visible sale products
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url, images, price, sort_order, original_price, discount_percentage, category')
        .eq('is_visible', true)
        .eq('visible_on_web', true)
        .not('original_price', 'is', null)
        .gt('discount_percentage', 0)
        .order('created_at', { ascending: false })

      if (error) throw error

      const all = (data || []) as OrderedProduct[]

      // Apply saved custom order from site_config if it exists
      const savedOrder: string[] | null = await cmsService.getConfig('price_specials_order')
      if (savedOrder && savedOrder.length > 0) {
        const orderMap = new Map(savedOrder.map((id, idx) => [id, idx]))
        all.sort((a, b) => {
          const aIdx = orderMap.has(a.id) ? orderMap.get(a.id)! : Infinity
          const bIdx = orderMap.has(b.id) ? orderMap.get(b.id)! : Infinity
          return aIdx - bIdx
        })
      }

      setProducts(all)
    } catch (err: any) {
      toast.error('Error cargando productos en oferta: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const move = (absIdx: number, dir: 'up' | 'down') => {
    if (dir === 'up' && absIdx === 0) return
    if (dir === 'down' && absIdx === products.length - 1) return
    const arr = [...products]
    const swapIdx = dir === 'up' ? absIdx - 1 : absIdx + 1
    const a = arr[absIdx] as OrderedProduct
    const b = arr[swapIdx] as OrderedProduct
    arr[absIdx] = b
    arr[swapIdx] = a
    setProducts(arr)
    setDirty(true)
  }

  // HTML5 drag-and-drop support — uses absolute indices
  const onDragStart = (e: React.DragEvent, absIdx: number) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(absIdx))
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const onDrop = (e: React.DragEvent, targetAbsIdx: number) => {
    e.preventDefault()
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (isNaN(fromIdx) || fromIdx === targetAbsIdx) return
    const arr = [...products]
    const [moved] = arr.splice(fromIdx, 1)
    if (moved) arr.splice(targetAbsIdx, 0, moved)
    setProducts(arr)
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isPriceSpecials) {
        // Save ordered product IDs to CMS config
        const orderedIds = products.map(p => p.id)
        await cmsService.setConfig('price_specials_order', orderedIds)
        setDirty(false)
        toast.success('Orden de Price Specials guardado ✓')
      } else {
        // Build batch updates: assign sort_order = 1..N in current display order
        const updates = products.map((p, idx) => ({
          id: p.id,
          sort_order: idx + 1,
        }))

        // Supabase doesn't support multi-row UPDATE easily; use individual upserts in parallel
        const results = await Promise.all(
          updates.map(({ id, sort_order }) =>
            supabase
              .from('products')
              .update({ sort_order })
              .eq('id', id)
          )
        )

        const failed = results.filter(r => r.error)
        if (failed.length > 0) {
          throw new Error(`${failed.length} productos no se pudieron actualizar`)
        }

        // Update local state to reflect saved sort_order values
        setProducts(prev => prev.map((p, idx) => ({ ...p, sort_order: idx + 1 })))
        setDirty(false)
        toast.success(`Orden guardado para ${selectedCategory} ✓`)
      }
    } catch (err: any) {
      toast.error('Error guardando orden: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCategoryChange = (cat: string) => {
    if (dirty) {
      if (!confirm('Hay cambios sin guardar. ¿Cambiar de categoría de todas formas?')) return
    }
    setSelectedCategory(cat)
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header info + Save button */}
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
          Arrastra o usa las flechas para ordenar los productos dentro de cada categoría.
          El orden se refleja en la tienda en ~60 segundos.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {dirty && (
            <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              Sin guardar
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty || products.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white ${
              isPriceSpecials ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar orden
          </button>
        </div>
      </div>

      {/* Category selector */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-1 flex flex-wrap gap-1">
        {CATEGORIES.map(cat => {
          const count = categoryCounts[cat] || 0
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
              }`}
            >
              {cat}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
        {/* Price Specials special tab */}
        <button
          onClick={() => handleCategoryChange(PRICE_SPECIALS_KEY)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
            isPriceSpecials
              ? 'bg-red-600 text-white border-red-600 shadow-sm'
              : 'text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400'
          }`}
        >
          <Tag className="w-3 h-3" />
          Price Specials
          {saleCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              isPriceSpecials ? 'bg-white/20 text-white' : 'bg-red-100 text-red-500'
            }`}>
              {saleCount}
            </span>
          )}
        </button>
      </div>

      {/* Price Specials info banner */}
      {isPriceSpecials && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-xs text-red-700">
          <Tag className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            Aquí puedes definir el orden en que aparecen los productos en la sección <strong>Price Specials</strong> (ofertas con descuento) de la tienda.
            El orden se guarda independientemente del orden de cada categoría.
          </p>
        </div>
      )}

      {/* Product list */}
      {(() => {
        const totalPages = Math.ceil(products.length / PAGE_SIZE)
        const safePage = Math.min(page, Math.max(0, totalPages - 1))
        const pageProducts = products.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

        return (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            {/* List header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span className="w-6" />
              <span className="w-6 text-center">#</span>
              <span className="w-12" />
              <span className="flex-1">Producto</span>
              {isPriceSpecials && <span className="w-20 text-center">Descuento</span>}
              <span className="w-24 text-right">Precio</span>
              <span className="w-20 text-center">Mover</span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <RefreshCw className="w-8 h-8 mb-3 opacity-30" />
                <p className="text-sm">
                  {isPriceSpecials
                    ? 'No hay productos en oferta visibles'
                    : <>No hay productos visibles en <strong>{selectedCategory}</strong></>
                  }
                </p>
              </div>
            ) : (
              <>
                <div>
                  {pageProducts.map((product, localIdx) => {
                    const absIdx = safePage * PAGE_SIZE + localIdx
                    return (
                      <div
                        key={product.id}
                        draggable
                        onDragStart={e => onDragStart(e, absIdx)}
                        onDragOver={onDragOver}
                        onDrop={e => onDrop(e, absIdx)}
                        className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/70 group cursor-grab active:cursor-grabbing ${
                          absIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        {/* Drag handle */}
                        <div className="shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Position number (global) */}
                        <span className="w-6 text-center text-xs font-bold text-gray-400">{absIdx + 1}</span>

                        {/* Thumbnail */}
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {getThumb(product) ? (
                            <img
                              src={getThumb(product)!}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-base font-bold">
                              {product.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">
                            {isPriceSpecials && product.category ? (
                              <span className="text-gray-500">{product.category} · </span>
                            ) : null}
                            id: {product.id.slice(0, 8)}…
                          </p>
                        </div>

                        {/* Discount badge (Price Specials only) */}
                        {isPriceSpecials && (
                          <div className="w-20 flex justify-center shrink-0">
                            {product.discount_percentage ? (
                              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                -{product.discount_percentage}%
                              </span>
                            ) : null}
                          </div>
                        )}

                        {/* Price */}
                        <span className="w-24 text-right text-sm text-gray-600 font-medium shrink-0">
                          {formatCurrency(Number(product.price))}
                        </span>

                        {/* Up / Down buttons */}
                        <div className="w-20 flex items-center justify-center gap-1 shrink-0">
                          <button
                            onClick={() => move(absIdx, 'up')}
                            disabled={absIdx === 0}
                            title="Subir"
                            className="p-1.5 rounded-md text-gray-400 hover:text-black hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => move(absIdx, 'down')}
                            disabled={absIdx === products.length - 1}
                            title="Bajar"
                            className="p-1.5 rounded-md text-gray-400 hover:text-black hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination footer */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-xs text-gray-500">
                      {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, products.length)} de{' '}
                      <strong>{products.length}</strong> producto{products.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={safePage === 0}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors ${
                            i === safePage
                              ? 'bg-black text-white'
                              : 'text-gray-500 hover:bg-white hover:text-black'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={safePage === totalPages - 1}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })()}

      {/* Bottom count */}
      <p className="text-xs text-gray-400">
        {products.length} producto{products.length !== 1 ? 's' : ''} en{' '}
        <strong>{isPriceSpecials ? 'Price Specials' : selectedCategory}</strong>
      </p>
    </div>
  )
}
