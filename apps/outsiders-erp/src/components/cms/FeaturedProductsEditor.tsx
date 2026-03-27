import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Loader2, Search, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

export default function FeaturedProductsEditor() {
  const [sections, setSections] = useState<any[]>([])
  const [selectedSection, setSelectedSection] = useState<any>(null)
  
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 1. Cargar las secciones al montar
  useEffect(() => {
    loadSections()
  }, [])

  // 2. Al cambiar de sección, cargar sus productos asignados
  useEffect(() => {
    if (selectedSection) {
      loadFeaturedProducts(selectedSection.id)
    }
  }, [selectedSection])

  const loadSections = async () => {
    try {
      const { data, error } = await supabase.from('featured_sections').select('*').order('display_order')
      if (error) throw error
      setSections(data || [])
      if (data?.length > 0) {
        setSelectedSection(data[0]) // Select first by default
      }
    } catch (error: any) {
      toast.error('Error al cargar secciones')
    } finally {
      setLoading(false)
    }
  }

  const loadFeaturedProducts = async (sectionId: string) => {
    try {
      // Necesitamos cargar el producto de `featured_products` cruzado con `products`.
      // Como product_id es referenciado (si lo seteaste así), podemos hacer un JOIN, o hacerlo manual.
      const { data: featuredData, error: featError } = await supabase
        .from('featured_products')
        .select('*')
        .eq('section_id', sectionId)
        .order('display_order')

      if (featError) throw featError

      const prodIds = featuredData?.map(f => f.product_id) || []
      
      if (prodIds.length > 0) {
        // Cargar detalles de los productos
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('id, name, image_url, price, stock')
          .in('id', prodIds)
        
        if (prodError) throw prodError

        // Combinar datos
        const comb = featuredData?.map(feat => {
          const p = prodData.find(pd => pd.id === feat.product_id)
          return {
             ...feat,
             product: p || { name: 'Producto no encontrado', id: feat.product_id }
          }
        })
        setFeaturedProducts(comb || [])
      } else {
        setFeaturedProducts([])
      }
    } catch (error: any) {
      console.error(error)
      toast.error('Error al cargar productos destacados')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery) return
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url, price, stock')
        .ilike('name', `%${searchQuery}%`)
        .limit(5)
      
      if (error) throw error
      setSearchResults(data || [])
    } catch (error: any) {
      toast.error('Error en búsqueda: ' + error.message)
    }
  }

  const addProductToSection = (product: any) => {
    if (!selectedSection) return
    const exists = featuredProducts.find(f => f.product_id === product.id)
    if (exists) {
      toast.error('Este producto ya está en la sección')
      return
    }

    const newItem = {
      section_id: selectedSection.id,
      product_id: product.id,
      display_order: featuredProducts.length,
      product: product,
      isNew: true // Flag local
    }

    setFeaturedProducts([...featuredProducts, newItem])
    setSearchQuery('')
    setSearchResults([])
  }

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === featuredProducts.length - 1) return

    const newArr = [...featuredProducts]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    const temp = newArr[index]
    newArr[index] = newArr[swapIndex]
    newArr[swapIndex] = temp

    newArr.forEach((b, i) => b.display_order = i)
    setFeaturedProducts(newArr)
  }

  const removeProduct = async (item: any, index: number) => {
    if (!item.isNew && item.id) {
       // Eliminar de base de datos directamente
       try {
         await supabase.from('featured_products').delete().eq('id', item.id)
       } catch (e) {
         toast.error('Error al remover de la base de datos')
       }
    }
    setFeaturedProducts(p => p.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!selectedSection) return
    setSaving(true)
    try {
      // 1. Opcional: Para evitar complicaciones, borramos todos los de la sección y reinsertamos.
      // O solo actualizamos e insertamos nuevos. Por ser pocos, actualizar/insertar es mejor.
      for (const item of featuredProducts) {
        if (item.isNew) {
           await supabase.from('featured_products').insert({
             section_id: item.section_id,
             product_id: item.product_id,
             display_order: item.display_order
           })
        } else {
           await supabase.from('featured_products').update({
             display_order: item.display_order
           }).eq('id', item.id)
        }
      }
      toast.success('Cambios guardados')
      loadFeaturedProducts(selectedSection.id) // Refrescar para quitar isNew y obtener id final
    } catch (error: any) {
      toast.error('Error al guardar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* Selector de Sección */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-gray-900">Sección a Editar:</h2>
        <div className="flex gap-2">
          {sections.map(s => (
            <button 
              key={s.id}
              onClick={() => setSelectedSection(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${selectedSection?.id === s.id ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {s.section_name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Productos en la Sección */}
        <div className="md:col-span-2 space-y-4">
           <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 min-h-[400px]">
             <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Orden de Productos</h3>
             
             {featuredProducts.length === 0 ? (
                <div className="text-center text-gray-400 py-10">La sección está vacía. Añade productos desde el panel derecho.</div>
             ) : (
                <div className="space-y-2">
                  {featuredProducts.map((item, index) => (
                    <div key={item.product_id} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                      
                      <div className="flex items-center gap-4">
                         <div className="flex flex-col gap-1">
                           <button onClick={() => moveProduct(index, 'up')} disabled={index === 0} className="hover:text-black text-gray-400 disabled:opacity-20"><ArrowUp className="w-4 h-4" /></button>
                           <button onClick={() => moveProduct(index, 'down')} disabled={index === featuredProducts.length - 1} className="hover:text-black text-gray-400 disabled:opacity-20"><ArrowDown className="w-4 h-4" /></button>
                         </div>
                         <img src={item.product?.image_url || 'https://via.placeholder.com/50'} className="w-12 h-12 object-cover rounded bg-gray-100" alt="img" />
                         <div>
                            <p className="text-sm font-bold text-gray-900">{item.product?.name}</p>
                            <p className="text-xs text-gray-500">${item.product?.price}</p>
                         </div>
                      </div>

                      <button onClick={() => removeProduct(item, index)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  ))}
                </div>
             )}
           </div>
           
           <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar Orden
            </button>
          </div>
        </div>

        {/* Buscador de Productos para Añadir */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 h-fit">
          <h3 className="font-bold text-gray-900 mb-4">Añadir Producto</h3>
          
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              className="bg-gray-100 p-2 rounded-lg border hover:bg-gray-200"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {searchResults.map(prod => (
              <div key={prod.id} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-gray-50 text-sm">
                <img src={prod.image_url} className="w-10 h-10 object-cover rounded" alt="thumb" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{prod.name}</p>
                  <p className="text-xs text-gray-500">Stock: {prod.stock}</p>
                </div>
                <button 
                  onClick={() => addProductToSection(prod)}
                  className="p-1.5 bg-black text-white rounded text-xs px-2 whitespace-nowrap"
                >
                  Añadir
                </button>
              </div>
            ))}
            {searchResults.length === 0 && searchQuery && (
               <p className="text-xs text-gray-400 text-center py-4">Presiona el botón de buscar.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
