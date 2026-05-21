import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Loader2, ArrowUp, ArrowDown, GripVertical, AlertCircle, RefreshCw, Save } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface OrderedProduct {
  id: string
  name: string
  image_url: string | null
  images: string[] | null
  price: number
  sort_order: number
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

  // Load product counts per category once
  useEffect(() => {
    loadCategoryCounts()
  }, [])

  // Load products when category changes
  useEffect(() => {
    loadProducts(selectedCategory)
  }, [selectedCategory])

  const loadCategoryCounts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_visible', true)

    if (!error && data) {
      const counts: Record<string, number> = {}
      data.forEach(p => {
        if (p.category) counts[p.category] = (counts[p.category] || 0) + 1
      })
      setCategoryCounts(counts)
    }
  }

  const loadProducts = useCallback(async (category: string) => {
    setLoading(true)
    setDirty(false)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url, images, price, sort_order')
        .eq('category', category)
        .eq('is_visible', true)
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

  const move = (idx: number, dir: 'up' | 'down') => {
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === products.length - 1) return
    const arr = [...products]
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    const a = arr[idx] as OrderedProduct
    const b = arr[swapIdx] as OrderedProduct
    arr[idx] = b
    arr[swapIdx] = a
    setProducts(arr)
    setDirty(true)
  }

  // HTML5 drag-and-drop support
  const onDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const onDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (isNaN(fromIdx) || fromIdx === targetIdx) return
    const arr = [...products]
    const [moved] = arr.splice(fromIdx, 1)
    if (moved) arr.splice(targetIdx, 0, moved)
    setProducts(arr)
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
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
      {/* Header info */}
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
          Arrastra o usa las flechas para ordenar los productos dentro de cada categoría.
          El orden se refleja en la tienda en ~60 segundos.
        </p>
        {dirty && (
          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg shrink-0">
            <AlertCircle className="w-4 h-4" />
            Cambios sin guardar
          </div>
        )}
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
      </div>

      {/* Product list */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {/* List header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span className="w-6" />
          <span className="w-6 text-center">#</span>
          <span className="w-12" />
          <span className="flex-1">Producto</span>
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
            <p className="text-sm">No hay productos visibles en <strong>{selectedCategory}</strong></p>
          </div>
        ) : (
          <div>
            {products.map((product, idx) => (
              <div
                key={product.id}
                draggable
                onDragStart={e => onDragStart(e, idx)}
                onDragOver={onDragOver}
                onDrop={e => onDrop(e, idx)}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/70 group cursor-grab active:cursor-grabbing ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
              >
                {/* Drag handle */}
                <div className="shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Position number */}
                <span className="w-6 text-center text-xs font-bold text-gray-400">{idx + 1}</span>

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
                  <p className="text-xs text-gray-400">id: {product.id.slice(0, 8)}…</p>
                </div>

                {/* Price */}
                <span className="w-24 text-right text-sm text-gray-600 font-medium shrink-0">
                  {formatCurrency(Number(product.price))}
                </span>

                {/* Up / Down buttons */}
                <div className="w-20 flex items-center justify-center gap-1 shrink-0">
                  <button
                    onClick={() => move(idx, 'up')}
                    disabled={idx === 0}
                    title="Subir"
                    className="p-1.5 rounded-md text-gray-400 hover:text-black hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => move(idx, 'down')}
                    disabled={idx === products.length - 1}
                    title="Bajar"
                    className="p-1.5 rounded-md text-gray-400 hover:text-black hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-5">
        <p className="text-xs text-gray-400">
          {products.length} producto{products.length !== 1 ? 's' : ''} en <strong>{selectedCategory}</strong>
        </p>
        <button
          onClick={handleSave}
          disabled={saving || !dirty || products.length === 0}
          className="flex items-center gap-2 bg-black text-white px-7 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar orden
        </button>
      </div>
    </div>
  )
}
