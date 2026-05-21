import { useState, useEffect } from 'react'
import { cmsService } from '@/services/cmsService'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Loader2, Search, Trash2, ArrowUp, ArrowDown, Star } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface BestSellersConfig {
  title: string
  product_ids: string[]
}

interface ProductItem {
  id: string
  name: string
  image_url: string | null
  images: string[] | null
  price: number
}

const DEFAULT_CONFIG: BestSellersConfig = {
  title: 'Best Sellers',
  product_ids: [],
}

export default function FeaturedProductsEditor() {
  const [config, setConfig] = useState<BestSellersConfig>(DEFAULT_CONFIG)
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const data: BestSellersConfig = await cmsService.getConfig('best_sellers')
      const cfg = data ?? DEFAULT_CONFIG
      setConfig(cfg)

      // Load product details for the stored IDs
      if (cfg.product_ids?.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name, image_url, images, price')
          .in('id', cfg.product_ids)

        if (products) {
          // Maintain the order from config
          const ordered = cfg.product_ids
            .map(id => products.find(p => p.id === id))
            .filter(Boolean) as ProductItem[]
          setSelectedProducts(ordered)
        }
      }
    } catch (err) {
      toast.error('Error al cargar Best Sellers')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url, images, price')
        .ilike('name', `%${searchQuery}%`)
        .eq('is_visible', true)
        .limit(8)

      if (error) throw error
      // Filter out already selected
      setSearchResults((data || []).filter(p => !selectedProducts.find(s => s.id === p.id)))
    } catch (err: any) {
      toast.error('Error en búsqueda: ' + err.message)
    } finally {
      setSearching(false)
    }
  }

  const addProduct = (product: ProductItem) => {
    if (selectedProducts.find(p => p.id === product.id)) return
    setSelectedProducts(prev => [...prev, product])
    setSearchResults(prev => prev.filter(p => p.id !== product.id))
    setSearchQuery('')
  }

  const removeProduct = (id: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id))
  }

  const moveProduct = (index: number, dir: 'up' | 'down') => {
    if (dir === 'up' && index === 0) return
    if (dir === 'down' && index === selectedProducts.length - 1) return
    const arr: ProductItem[] = [...selectedProducts]
    const swapIdx = dir === 'up' ? index - 1 : index + 1
    const a = arr[index] as ProductItem
    const b = arr[swapIdx] as ProductItem
    arr[index] = b
    arr[swapIdx] = a
    setSelectedProducts(arr)
  }


  const handleSave = async () => {
    setSaving(true)
    try {
      const newConfig: BestSellersConfig = {
        title: config.title,
        product_ids: selectedProducts.map(p => p.id),
      }
      await cmsService.setConfig('best_sellers', newConfig)
      setConfig(newConfig)
      toast.success('Best Sellers guardado ✓')
    } catch (err: any) {
      toast.error('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const getProductImage = (p: ProductItem) => {
    const imgs = p.images as any
    if (Array.isArray(imgs) && imgs.length > 0) return imgs[0]
    return p.image_url || null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Selecciona y ordena los productos que aparecen en la sección <strong>Best Sellers</strong> del home.
        </p>
        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
          {selectedProducts.length} productos
        </span>
      </div>

      {/* Section Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Título de la Sección</label>
        <input
          type="text"
          className="w-64 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 transition-colors"
          value={config.title}
          onChange={e => setConfig(c => ({ ...c, title: e.target.value }))}
          placeholder="Best Sellers"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Selected Products List */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Productos Seleccionados
          </h3>
          <div className="min-h-[300px] bg-gray-50 rounded-xl border border-gray-100 p-3 space-y-2">
            {selectedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-gray-400">
                <Star className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Busca y añade productos desde el panel derecho</p>
              </div>
            ) : (
              selectedProducts.map((product, idx) => (
                <div key={product.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => moveProduct(idx, 'up')}
                      disabled={idx === 0}
                      className="p-0.5 text-gray-400 hover:text-black disabled:opacity-20 transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-center text-gray-400 font-bold w-4">{idx + 1}</span>
                    <button
                      onClick={() => moveProduct(idx, 'down')}
                      disabled={idx === selectedProducts.length - 1}
                      className="p-0.5 text-gray-400 hover:text-black disabled:opacity-20 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {getProductImage(product) ? (
                      <img src={getProductImage(product)!} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg font-bold">
                        {product.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(Number(product.price))}</p>
                  </div>

                  <button
                    onClick={() => removeProduct(product.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Search Panel */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Agregar Producto</h3>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map(product => (
                <div key={product.id} className="flex items-center gap-3 p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden shrink-0">
                    {getProductImage(product) ? (
                      <img src={getProductImage(product)!} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm font-bold">
                        {product.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(Number(product.price))}</p>
                  </div>
                  <button
                    onClick={() => addProduct(product)}
                    className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors shrink-0"
                  >
                    + Añadir
                  </button>
                </div>
              ))}
              {searchResults.length === 0 && searchQuery && !searching && (
                <p className="text-xs text-gray-400 text-center py-6">Presiona Enter o el botón de buscar</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t pt-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar Best Sellers
        </button>
      </div>
    </div>
  )
}
