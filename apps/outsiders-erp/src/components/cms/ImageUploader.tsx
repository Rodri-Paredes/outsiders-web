import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'

// ...

import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { compressImage } from '@/lib/imageCompression'

interface ImageUploaderProps {
  value: string | string[]
  onChange: (url: string | string[]) => void
  multiple?: boolean
  bucket?: string
  folder?: string
}

export default function ImageUploader({
  value,
  onChange,
  multiple = false,
  bucket = 'cms-assets',
  folder = 'uploads'
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      const files = event.target.files
      if (!files || files.length === 0) return

      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file) continue
        
        const compressedFile = await compressImage(file);
        const fileExt = compressedFile.name.split('.').pop() || 'jpg';
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        // cacheControl largo: el nombre de archivo es único (timestamp/random),
        // nunca se reemplaza en el mismo path, así que cachear "para siempre"
        // es seguro y evita que se vuelva a descargar de Supabase Storage.
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, compressedFile, { cacheControl: '31536000' })

        if (uploadError) {
          throw uploadError
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrlData.publicUrl)
      }

      if (multiple) {
        onChange([...(Array.isArray(value) ? value : []), ...uploadedUrls] as any)
      } else {
        if (uploadedUrls.length > 0) {
           onChange(uploadedUrls[0] as any)
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      toast.success('Imagen subida con éxito')
    } catch (error: any) {
      toast.error(error.message || 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (indexToRemove: number) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((_, idx) => idx !== indexToRemove))
    } else {
      onChange('')
    }
  }

  const renderImages = () => {
    const images = multiple ? (Array.isArray(value) ? value : []) : (value ? [value as string] : [])

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {images.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200">
            <img src={url} alt="Upload" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {renderImages()}
      
      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${uploading ? 'bg-gray-50 border-gray-300' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          multiple={multiple}
          accept="image/*"
          className="hidden"
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}
          <div className="text-sm font-medium text-gray-600">
            {uploading ? 'Subiendo imágenes...' : 'Añadir imágenes'}
          </div>
          <div className="text-xs text-gray-400">
            Click para seleccionar archivos
          </div>
        </div>
      </div>
    </div>
  )
}
