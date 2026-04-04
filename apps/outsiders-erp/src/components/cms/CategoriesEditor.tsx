import { useState, useEffect, useRef } from 'react'
import { cmsService } from '@/services/cmsService'
import toast from 'react-hot-toast'
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Image as ImageIcon } from 'lucide-react'

interface CategoryItem {
  title: string
  subtitle: string
  href: string
  image: string
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { title: 'HOODIES', subtitle: 'Zippers / Hoodies / Crewnecks', href: '/shop', image: '' },
  { title: 'TEES', subtitle: 'Basics / Sleeveless / Best sellers', href: '/shop', image: '' },
  { title: 'SWEATERS', subtitle: 'Knitwear / Crochet', href: '/shop', image: '' },
  { title: 'PANTS', subtitle: 'Shorts / Denim / Joggers', href: '/shop', image: '' },
]

export default function CategoriesEditor() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<number | null>(null)
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const data = await cmsService.getConfig('home_categories')
      if (data && Array.isArray(data) && data.length > 0) {
        setCategories(data)
      }
    } catch {
      toast.error('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  const addCategory = () => {
    setCategories(prev => [...prev, { title: 'Nueva Categoría', subtitle: '', href: '/shop', image: '' }])
  }

  const removeCategory = (idx: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    setCategories(prev => prev.filter((_, i) => i !== idx))
  }

  const updateCategory = (idx: number, patch: Partial<CategoryItem>) => {
    setCategories(prev => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)))
  }

  const moveCategory = (idx: number, dir: 'up' | 'down') => {
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === categories.length - 1) return
    const arr = [...categories]
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    const a = arr[idx] as CategoryItem
    const b = arr[swapIdx] as CategoryItem
    arr[idx] = b
    arr[swapIdx] = a
    setCategories(arr)
  }

  const handleImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(idx)
    try {
      const url = await cmsService.uploadImage(file, 'categories')
      updateCategory(idx, { image: url })
      toast.success('Imagen subida')
    } catch (err: any) {
      toast.error('Error al subir: ' + err.message)
    } finally {
      setUploading(null)
      const ref = fileRefs.current[idx]
      if (ref) ref.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await cmsService.setConfig('home_categories', categories)
      toast.success('Categorías guardadas ✓')
    } catch (err: any) {
      toast.error('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Edita las tarjetas de categorías que aparecen en el home después de los Best Sellers.
        </p>
        <button
          onClick={addCategory}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      <div className="space-y-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => moveCategory(idx, 'up')} disabled={idx === 0} className="text-gray-400 hover:text-black disabled:opacity-20">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveCategory(idx, 'down')} disabled={idx === categories.length - 1} className="text-gray-400 hover:text-black disabled:opacity-20">
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs font-bold text-gray-400 w-5 text-center">{idx + 1}</span>
              <span className="flex-1 text-sm font-bold text-gray-800 truncate">{cat.title || 'Sin título'}</span>
              <button onClick={() => removeCategory(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Image */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Imagen</label>
                <div
                  className="relative aspect-[3/4] bg-gray-50 border border-dashed border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-gray-400 transition-colors group"
                  onClick={() => fileRefs.current[idx]?.click()}
                >
                  {cat.image ? (
                    <>
                      <img src={cat.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-2">
                      {uploading === idx ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6 mb-1" />}
                      <p className="text-[10px] text-center">Click para subir</p>
                    </div>
                  )}
                </div>
                <input
                  ref={el => { fileRefs.current[idx] = el }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageUpload(idx, e)}
                />
                <input
                  type="text"
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="o pega URL de imagen..."
                  value={cat.image}
                  onChange={e => updateCategory(idx, { image: e.target.value })}
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Título</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold uppercase focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="HOODIES"
                  value={cat.title}
                  onChange={e => updateCategory(idx, { title: e.target.value })}
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Subtítulo</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="Zippers / Hoodies / Crewnecks"
                  value={cat.subtitle}
                  onChange={e => updateCategory(idx, { subtitle: e.target.value })}
                />
              </div>

              {/* Link */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Link
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="/shop"
                  value={cat.href}
                  onChange={e => updateCategory(idx, { href: e.target.value })}
                />
                <p className="text-[10px] text-gray-400">ej: /shop o /shop?category=Poleras</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="flex justify-end border-t pt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar Categorías
          </button>
        </div>
      )}
    </div>
  )
}
