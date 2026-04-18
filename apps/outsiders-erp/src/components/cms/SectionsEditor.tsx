import { useState, useEffect } from 'react'
import { cmsService } from '@/services/cmsService'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Search, X, Tag as TagIcon, Package } from 'lucide-react'

type SectionType = 'products' | 'tag'

interface Section {
  id: string  // client-side ID
  title: string
  type: SectionType
  product_ids: string[]
  tag?: string
}

interface ProductItem {
  id: string
  name: string
  image_url: string | null
  images: string[] | null
  price: number
}

interface ProductTag {
  id: string
  name: string
  tag_group: string
}

let sectionCounter = 0
const newSectionId = () => `section-${++sectionCounter}-${Date.now()}`

export default function SectionsEditor() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // For product picker
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProductItem[]>([])
  const [searching, setSearching] = useState(false)

  // Available tags
  const [availableTags, setAvailableTags] = useState<ProductTag[]>([])

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      setLoading(true)
      const [sectionsData, tagsData] = await Promise.all([
        cmsService.getConfig('home_sections'),
        supabase.from('product_tags').select('id, name, tag_group').order('tag_group').order('name'),
      ])

      const raw: any[] = sectionsData ?? []
      setSections(
        raw.map(s => ({
          ...s,
          id: s.id || newSectionId(),
          product_ids: s.product_ids || [],
        }))
      )

      if (!tagsData.error) {
        setAvailableTags(tagsData.data || [])
      }
    } catch (err) {
      toast.error('Error al cargar secciones')
    } finally {
      setLoading(false)
    }
  }

  const addSection = () => {
    setSections(prev => [
      ...prev,
      {
        id: newSectionId(),
        title: 'Nueva Sección',
        type: 'products',
        product_ids: [],
      },
    ])
  }

  const updateSection = (id: string, patch: Partial<Section>) => {
    setSections(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)))
  }

  const removeSection = async (id: string) => {
    if (!confirm('¿Eliminar esta sección?')) return
    const updated = sections.filter(s => s.id !== id)
    setSections(updated)
    if (activeSectionId === id) setActiveSectionId(null)
    try {
      await cmsService.setConfig('home_sections', updated)
      toast.success('Sección eliminada ✓')
    } catch (err: any) {
      toast.error('Error al guardar: ' + err.message)
    }
  }

  const moveSection = (index: number, dir: 'up' | 'down') => {
    if (dir === 'up' && index === 0) return
    if (dir === 'down' && index === sections.length - 1) return
    const arr: Section[] = [...sections]
    const swapIdx = dir === 'up' ? index - 1 : index + 1
    const a = arr[index] as Section
    const b = arr[swapIdx] as Section
    arr[index] = b
    arr[swapIdx] = a
    setSections(arr)
  }


  const handleSearch = async () => {
    if (!searchQuery.trim() || !activeSectionId) return
    setSearching(true)
    try {
      const activeSection = sections.find(s => s.id === activeSectionId)
      const { data } = await supabase
        .from('products')
        .select('id, name, image_url, images, price')
        .ilike('name', `%${searchQuery}%`)
        .eq('is_visible', true)
        .limit(6)
      setSearchResults((data || []).filter(p => !activeSection?.product_ids.includes(p.id)))
    } finally {
      setSearching(false)
    }
  }

  const addProductToSection = async (sectionId: string, product: ProductItem) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section || section.product_ids.includes(product.id)) return
    updateSection(sectionId, { product_ids: [...section.product_ids, product.id] })
    setSearchResults(prev => prev.filter(p => p.id !== product.id))
  }

  const removeProductFromSection = (sectionId: string, productId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return
    updateSection(sectionId, { product_ids: section.product_ids.filter(id => id !== productId) })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await cmsService.setConfig('home_sections', sections)
      toast.success('Secciones guardadas ✓')
    } catch (err: any) {
      toast.error('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Load product names for display
  const [productNames, setProductNames] = useState<Record<string, string>>({})
  useEffect(() => {
    const allIds = Array.from(new Set(sections.flatMap(s => s.product_ids)))
    if (allIds.length === 0) return
    supabase
      .from('products')
      .select('id, name, image_url')
      .in('id', allIds)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {}
          data.forEach(p => { map[p.id] = p.name })
          setProductNames(map)
        }
      })
  }, [sections])

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
          Crea y ordena secciones de productos que aparecen en el home de la tienda.
        </p>
        <button
          onClick={addSection}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Sección
        </button>
      </div>

      {sections.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No hay secciones configuradas</p>
          <p className="text-xs mt-1">Crea una nueva sección para empezar</p>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={section.id} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="text-gray-400 hover:text-black disabled:opacity-20">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveSection(idx, 'down')} disabled={idx === sections.length - 1} className="text-gray-400 hover:text-black disabled:opacity-20">
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              <span className="text-sm font-bold text-gray-400 w-5 text-center">{idx + 1}</span>

              <input
                type="text"
                className="flex-1 px-3 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="Nombre de la sección"
                value={section.title}
                onChange={e => updateSection(section.id, { title: e.target.value })}
              />

              {/* Type selector */}
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => updateSection(section.id, { type: 'products', tag: undefined })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    section.type === 'products' ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  <Package className="w-3 h-3" />
                  Productos
                </button>
                <button
                  onClick={() => updateSection(section.id, { type: 'tag', product_ids: [] })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    section.type === 'tag' ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  <TagIcon className="w-3 h-3" />
                  Por Tag
                </button>
              </div>

              <button
                onClick={() => removeSection(section.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Section Content */}
            <div className="p-4">
              {section.type === 'tag' ? (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Tag de Filtro</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.length === 0 ? (
                      <p className="text-sm text-gray-400">No hay tags disponibles. Crea tags desde el módulo de Productos.</p>
                    ) : (
                      availableTags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => updateSection(section.id, { tag: tag.name })}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            section.tag === tag.name
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {tag.name}
                          <span className="ml-1 text-[10px] opacity-60">{tag.tag_group}</span>
                        </button>
                      ))
                    )}
                  </div>
                  {section.tag && (
                    <p className="text-xs text-green-600 font-medium">
                      ✓ Mostrará todos los productos con tag: <strong>{section.tag}</strong>
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Product list */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Productos ({section.product_ids.length})
                    </label>
                    <div className="min-h-[80px] space-y-1.5">
                      {section.product_ids.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-lg">
                          Busca y añade productos →
                        </p>
                      ) : (
                        section.product_ids.map(pid => (
                          <div key={pid} className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm">
                            <span className="text-gray-800 font-medium truncate">{productNames[pid] ?? pid}</span>
                            <button
                              onClick={() => removeProductFromSection(section.id, pid)}
                              className="text-gray-400 hover:text-red-500 ml-2 shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Search */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Buscar</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-900 transition-colors"
                        placeholder="Nombre..."
                        value={activeSectionId === section.id ? searchQuery : ''}
                        onClick={() => { setActiveSectionId(section.id); setSearchResults([]) }}
                        onChange={e => { setActiveSectionId(section.id); setSearchQuery(e.target.value) }}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      />
                      <button
                        onClick={() => { setActiveSectionId(section.id); handleSearch() }}
                        className="px-2 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                      >
                        {searching && activeSectionId === section.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                      </button>
                    </div>

                    {activeSectionId === section.id && searchResults.length > 0 && (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {searchResults.map(p => (
                          <div key={p.id} className="flex items-center justify-between px-2.5 py-2 border border-gray-100 rounded-lg hover:bg-gray-50 text-xs gap-2">
                            <span className="truncate font-medium">{p.name}</span>
                            <button
                              onClick={() => addProductToSection(section.id, p)}
                              className="text-xs font-bold bg-black text-white px-2 py-1 rounded hover:bg-gray-800 shrink-0"
                            >
                              +
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {sections.length > 0 && (
        <div className="flex justify-end border-t pt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar Secciones
          </button>
        </div>
      )}
    </div>
  )
}
