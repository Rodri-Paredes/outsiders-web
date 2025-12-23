import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Drop } from '../../lib/types';
import { dropService } from '../../services/dropService';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Toast from '../ui/Toast';

interface DropFormProps {
  drop?: Drop | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DropForm({ drop, onClose, onSuccess }: DropFormProps) {
  const isEditing = !!drop;

  const [formData, setFormData] = useState({
    name: drop?.name || '',
    description: drop?.description || '',
    launch_date: drop?.launch_date ? new Date(drop.launch_date).toISOString().split('T')[0] : '',
    end_date: drop?.end_date ? new Date(drop.end_date).toISOString().split('T')[0] : '',
    status: drop?.status || 'INACTIVO',
    is_featured: drop?.is_featured || false,
  });

  const [imageUrl, setImageUrl] = useState(drop?.image_url || '');
  const [bannerUrl, setBannerUrl] = useState(drop?.banner_url || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Toast.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Toast.error('La imagen no debe superar 5MB');
      return;
    }

    if (type === 'image') {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.launch_date) {
      newErrors.launch_date = 'La fecha de lanzamiento es obligatoria';
    }

    if (formData.end_date && formData.launch_date) {
      if (new Date(formData.end_date) < new Date(formData.launch_date)) {
        newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      Toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);

      let finalImageUrl = imageUrl;
      let finalBannerUrl = bannerUrl;

      // Subir imagen si hay un archivo nuevo
      if (imageFile) {
        finalImageUrl = await dropService.uploadDropImage(imageFile, 'image');
      }

      // Subir banner si hay un archivo nuevo
      if (bannerFile) {
        finalBannerUrl = await dropService.uploadDropImage(bannerFile, 'banner');
      }

      const dropData: any = {
        ...formData,
        launch_date: formData.launch_date || new Date().toISOString().split('T')[0],
        image_url: finalImageUrl || undefined,
        banner_url: finalBannerUrl || undefined,
      };

      if (isEditing) {
        await dropService.updateDrop(drop.id, dropData);
        Toast.success('Drop actualizado exitosamente');
      } else {
        await dropService.createDrop(dropData);
        Toast.success('Drop creado exitosamente');
      }

      onSuccess();
    } catch (error: any) {
      Toast.error(error.message || 'Error al guardar el drop');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Editar Drop' : 'Nuevo Drop'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <Input
              label="Nombre del Drop *"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="Ej: Colección Verano 2025"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Descripción del lanzamiento..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Fecha de Lanzamiento *"
                type="date"
                name="launch_date"
                value={formData.launch_date}
                onChange={handleInputChange}
                error={errors.launch_date}
              />

              <Input
                label="Fecha de Fin (opcional)"
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                error={errors.end_date}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="FINALIZADO">Finalizado</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Drop Destacado
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Imágenes</h3>

            {/* Imagen principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen Principal
              </label>
              <div className="flex items-start gap-4">
                {imageUrl && (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                    <Upload size={20} />
                    <span className="text-sm">
                      {imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'image')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Tamaño máximo: 5MB. Formatos: JPG, PNG, WEBP
                  </p>
                </div>
              </div>
            </div>

            {/* Banner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner (opcional)
              </label>
              <div className="flex items-start gap-4">
                {bannerUrl && (
                  <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={bannerUrl}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {!bannerUrl && (
                  <label className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                    <ImageIcon size={20} />
                    <span className="text-sm">Subir banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'banner')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Drop'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
