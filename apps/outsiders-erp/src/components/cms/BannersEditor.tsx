import { useState, useEffect, useRef } from 'react'
import { cmsService } from '@/services/cmsService'
import toast from 'react-hot-toast'
import { Loader2, Upload, X } from 'lucide-react'

interface BannerConfig {
  image_url: string
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  is_active: boolean
}

const DEFAULT: BannerConfig = {
  image_url: '',
  title: '',
  subtitle: '',
  cta_text: 'Ver Tienda',
  cta_link: '/shop',
  is_active: true,
}

export default function BannersEditor() {
  const [config, setConfig] = useState<BannerConfig>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const data = await cmsService.getConfig('home_banner')
      if (data) setConfig({ ...DEFAULT, ...data })
    } catch (err) {
      toast.error('Error al cargar el banner')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await cmsService.uploadImage(file, 'banners')
      setConfig(c => ({ ...c, image_url: url }))
      toast.success('Imagen subida')
    } catch (err: any) {
      toast.error('Error al subir imagen: ' + err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await cmsService.setConfig('home_banner', config)
      toast.success('Banner guardado ✓')
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
    <div className="max-w-4xl space-y-8">
      <p className="text-sm text-gray-500">
        Configura el banner principal que aparece en la página de inicio de la tienda.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Upload */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800">Imagen del Banner</label>
          <div
            className="relative aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-gray-400 transition-colors group"
            onClick={() => fileRef.current?.click()}
          >
            {config.image_url ? (
              <>
                <img src={config.image_url} alt="Banner preview" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Cambiar imagen</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfig(c => ({ ...c, image_url: '' })) }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black rounded-full flex items-center justify-center text-white z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                {uploading ? (
                  <Loader2 className="w-10 h-10 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 mb-3" />
                    <p className="text-sm font-medium">Haz clic para subir imagen</p>
                    <p className="text-xs mt-1 text-gray-400">JPG, PNG, WebP • Recomendado: 1920×800px</p>
                  </>
                )}
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Text & Link Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Título Principal</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 transition-colors"
              placeholder="ej: Nueva Colección"
              value={config.title}
              onChange={e => setConfig(c => ({ ...c, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Subtítulo (opcional)</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 transition-colors"
              placeholder="ej: Fall / Winter 2025"
              value={config.subtitle}
              onChange={e => setConfig(c => ({ ...c, subtitle: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Texto del Botón CTA</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="ej: Ver Tienda"
                value={config.cta_text}
                onChange={e => setConfig(c => ({ ...c, cta_text: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Link del Botón</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="ej: /shop"
                value={config.cta_link}
                onChange={e => setConfig(c => ({ ...c, cta_link: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <input
              type="checkbox"
              id="banner-active"
              checked={config.is_active}
              onChange={e => setConfig(c => ({ ...c, is_active: e.target.checked }))}
              className="w-4 h-4 rounded accent-black"
            />
            <label htmlFor="banner-active" className="text-sm font-medium text-gray-700">
              Banner activo (visible en la tienda)
            </label>
          </div>
        </div>
      </div>

      {/* Live Preview Hint */}
      {config.image_url && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Los cambios se reflejan en la tienda dentro de ~60 segundos al guardar.
        </div>
      )}

      <div className="flex justify-end border-t pt-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar Banner
        </button>
      </div>
    </div>
  )
}
