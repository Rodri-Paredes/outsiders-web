import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import ImageUploader from './ImageUploader'

export default function BannersEditor() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('position', { ascending: true })

      if (error) throw error
      setBanners(data || [])
    } catch (error: any) {
      toast.error('Error al cargar banners: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addBanner = () => {
    const newBanner = {
      id: `temp-${Date.now()}`,
      title: 'Nuevo Banner',
      image_url: '',
      link: '',
      is_active: true,
      position: banners.length,
      isNew: true
    }
    setBanners([...banners, newBanner])
  }

  const removeBanner = async (id: string, index: number) => {
    if (!id.toString().startsWith('temp-')) {
      const confirmMsg = "Eliminar este banner permanentemente?"
      if (!window.confirm(confirmMsg)) return

      try {
        const { error } = await supabase.from('banners').delete().eq('id', id)
        if (error) throw error
        toast.success('Eliminado')
      } catch (error: any) {
        toast.error('Error al eliminar: ' + error.message)
        return
      }
    }
    
    setBanners(b => b.filter((_, i) => i !== index))
  }

  const moveBanner = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === banners.length - 1) return

    const newBanners = [...banners]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    const temp = newBanners[index]
    newBanners[index] = newBanners[swapIndex]
    newBanners[swapIndex] = temp

    // Update positions
    newBanners.forEach((b, i) => b.position = i)
    setBanners(newBanners)
  }

  const updateBanner = (index: number, field: string, value: any) => {
    const newBanners = [...banners]
    newBanners[index] = { ...newBanners[index], [field]: value }
    setBanners(newBanners)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const banner of banners) {
        const payload = {
          title: banner.title,
          image_url: banner.image_url,
          link: banner.link,
          is_active: banner.is_active,
          position: banner.position,
        }

        if (banner.isNew) {
          const { error } = await supabase.from('banners').insert(payload)
          if (error) throw error
        } else {
          const { error } = await supabase.from('banners').update(payload).eq('id', banner.id)
          if (error) throw error
        }
      }
      toast.success('Banners guardados')
      loadBanners() // Recargar para obtener IDs reales
    } catch (error: any) {
      toast.error('Error al guardar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>

  return (
    <div className="max-w-4xl space-y-6">
      
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Administra los banners promocionales del frontend.</p>
        <button
          onClick={addBanner}
          className="bg-gray-100 text-gray-900 border border-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Agregar Banner
        </button>
      </div>

      <div className="space-y-4">
        {banners.map((banner, index) => (
          <div key={banner.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200 relative flex gap-6">
            
            <div className="flex flex-col gap-2 justify-center border-r pr-4">
               <button 
                 onClick={() => moveBanner(index, 'up')}
                 disabled={index === 0}
                 className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
               >
                 <ArrowUp className="w-5 h-5" />
               </button>
               <span className="text-center font-medium text-gray-500">{index + 1}</span>
               <button 
                 onClick={() => moveBanner(index, 'down')}
                 disabled={index === banners.length - 1}
                 className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
               >
                 <ArrowDown className="w-5 h-5" />
               </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mx-1">Título Interno</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={banner.title}
                    onChange={(e) => updateBanner(index, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mx-1">Enlace HTML (Href)</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={banner.link || ''}
                    placeholder="/shop, /categoria/camisetas"
                    onChange={(e) => updateBanner(index, 'link', e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id={`active-${banner.id}`}
                    checked={banner.is_active}
                    onChange={(e) => updateBanner(index, 'is_active', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor={`active-${banner.id}`} className="text-sm font-medium text-gray-700">Activo (Visible en frontend)</label>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mx-1 mb-2">Imagen Promocional (Desktop)</label>
                 <ImageUploader 
                   value={banner.image_url} 
                   onChange={(url) => updateBanner(index, 'image_url', url)}
                 />
              </div>

            </div>

            <button 
              onClick={() => removeBanner(banner.id, index)}
              className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl text-gray-500">
            No hay banners configurados. Crea uno nuevo.
          </div>
        )}
      </div>

      <div className="flex justify-end border-t pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar Cambios
        </button>
      </div>

    </div>
  )
}
