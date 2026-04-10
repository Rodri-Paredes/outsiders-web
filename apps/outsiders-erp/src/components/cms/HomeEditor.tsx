import { useState, useEffect } from 'react'
import { cmsService } from '@/services/cmsService'
import ImageUploader from './ImageUploader'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

interface HeroContent {
  title: string
  subtitle: string
  desktop_title_1: string
  desktop_title_2: string
  desktop_season: string
  desktop_description: string
  cta_text: string
  cta_link: string
  images: string[]
}

const DEFAULT: HeroContent = {
  title: '',
  subtitle: '',
  desktop_title_1: '',
  desktop_title_2: '',
  desktop_season: '',
  desktop_description: '',
  cta_text: 'Shop Now',
  cta_link: '/shop',
  images: [],
}

export default function HomeEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState<HeroContent>(DEFAULT)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const data = await cmsService.getConfig('home_hero')
      if (data) setContent({ ...DEFAULT, ...data })
    } catch (err) {
      toast.error('Error al cargar contenido del hero')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await cmsService.setConfig('home_hero', content)
      toast.success('Hero guardado ✓')
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

  const field = (
    label: string,
    key: keyof HeroContent,
    placeholder = '',
    hint?: string
  ) => (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      <input
        type="text"
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 transition-colors"
        placeholder={placeholder}
        value={(content[key] as string) || ''}
        onChange={e => setContent(c => ({ ...c, [key]: e.target.value }))}
      />
    </div>
  )

  return (
    <div className="max-w-4xl space-y-8">
      <p className="text-sm text-gray-500">
        Edita los textos e imágenes del hero principal de la página de inicio.
      </p>

      {/* Desktop Hero */}
      <section className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-5">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-3">
          Hero — Desktop
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {field('Título Parte 1', 'desktop_title_1', 'ej: Out')}
          {field('Título Parte 2', 'desktop_title_2', 'ej: siders.')}
        </div>
        {field('Temporada', 'desktop_season', 'ej: Fall / Winter 2025')}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Descripción Desktop</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 transition-colors resize-none"
            value={content.desktop_description || ''}
            onChange={e => setContent(c => ({ ...c, desktop_description: e.target.value }))}
          />
        </div>
      </section>

      {/* Mobile Hero */}
      <section className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-5">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-3">
          Hero — Mobile
        </h2>
        {field('Título Mobile', 'title', 'ej: Back In Stock')}
        {field('Subtítulo Mobile', 'subtitle', 'ej: Descubre la nueva colección')}
      </section>

      {/* CTA */}
      <section className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-5">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-3">
          Botón Principal (CTA)
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {field('Texto del botón', 'cta_text', 'ej: Shop Now')}
          {field('Enlace del botón', 'cta_link', 'ej: /shop')}
        </div>
      </section>

      {/* Images */}
      <section className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
        <div className="border-b border-gray-200 pb-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Imágenes del Hero</h2>
          <p className="text-xs text-gray-400 mt-1">Imágenes verticales JPG/WebP. Sube 1 imagen para fondo completo, o 2 imágenes para pantalla dividida (como el diseño de referencia).</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">1. Imagen Principal (Izquierda o Completa)</h3>
            <ImageUploader
              value={content.images?.[0] || ''}
              onChange={(url) => {
                const currentImg2 = content.images?.[1] || '';
                const newImages = [url as string, currentImg2].filter(Boolean);
                setContent(c => ({ ...c, images: newImages }));
              }}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">2. Imagen Secundaria (Derecha - Opcional)</h3>
            <ImageUploader
              value={content.images?.[1] || ''}
              onChange={(url) => {
                const currentImg1 = content.images?.[0] || '';
                const newImages = [currentImg1, url as string].filter(Boolean);
                setContent(c => ({ ...c, images: newImages }));
              }}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end border-t pt-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar Hero
        </button>
      </div>
    </div>
  )
}
