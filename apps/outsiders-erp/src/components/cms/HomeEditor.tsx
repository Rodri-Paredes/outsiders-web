import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import ImageUploader from './ImageUploader'
import { Loader2 } from 'lucide-react'

export default function HomeEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [content, setContent] = useState({
    title: '',
    subtitle: '',
    desktop_title_1: '',
    desktop_title_2: '',
    desktop_season: '',
    desktop_description: '',
    cta_text: '',
    cta_link: '',
    images: [] as string[]
  })

  useEffect(() => {
    loadHomeContent()
  }, [])

  const loadHomeContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_key', 'home_hero')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setContent(data.content)
      }
    } catch (error: any) {
      toast.error('Error al cargar contenido: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          section_key: 'home_hero',
          content: content
        }, { onConflict: 'section_key' })

      if (error) throw error
      toast.success('Contenido guardado exitosamente')
    } catch (error: any) {
      toast.error('Error al guardar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* Sección Hero Web */}
      <section className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Hero Desktop (Texto Principal)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título Mitad 1 (ej: Out)</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-lg"
              value={content.desktop_title_1 || ''}
              onChange={(e) => setContent(c => ({ ...c, desktop_title_1: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título Mitad 2 (ej: siders.)</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-lg"
              value={content.desktop_title_2 || ''}
              onChange={(e) => setContent(c => ({ ...c, desktop_title_2: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Temporada (ej: Fall / Winter 2024)</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border rounded-lg"
            value={content.desktop_season || ''}
            onChange={(e) => setContent(c => ({ ...c, desktop_season: e.target.value }))}
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Desktop</label>
           <textarea 
             rows={3}
             className="w-full px-3 py-2 border rounded-lg"
             value={content.desktop_description || ''}
             onChange={(e) => setContent(c => ({ ...c, desktop_description: e.target.value }))}
           />
        </div>
      </section>

      {/* Sección Hero Mobile */}
      <section className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Hero Mobile (Texto)</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título Mobile (ej: BACK IN STOCK)</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border rounded-lg"
            value={content.title || ''}
            onChange={(e) => setContent(c => ({ ...c, title: e.target.value }))}
          />
        </div>
        
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo Mobile</label>
           <input 
            type="text" 
            className="w-full px-3 py-2 border rounded-lg"
            value={content.subtitle || ''}
            onChange={(e) => setContent(c => ({ ...c, subtitle: e.target.value }))}
          />
        </div>
      </section>

      {/* Botón CTA */}
      <section className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Botón Principal (Call To Action)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto del botón</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-lg"
              value={content.cta_text || ''}
              onChange={(e) => setContent(c => ({ ...c, cta_text: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enlace del botón</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-lg"
              value={content.cta_link || ''}
              onChange={(e) => setContent(c => ({ ...c, cta_link: e.target.value }))}
            />
          </div>
        </div>
      </section>

      {/* Imágenes del Slider */}
      <section className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
        <div className="border-b pb-2">
          <h2 className="text-lg font-bold text-gray-900">Imágenes del Slider</h2>
          <p className="text-sm text-gray-500">Se recomiendan imágenes verticales en formato JPG/WebP.</p>
        </div>

        <ImageUploader 
          multiple
          value={content.images || []}
          onChange={(urls) => setContent(c => ({ ...c, images: urls as string[] }))}
        />
      </section>

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
