import React, { useState } from 'react';
import { X, Percent, DollarSign } from 'lucide-react';
import { Discount, DiscountType } from '../../lib/types';
import { discountService } from '../../services/discountService';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Toast from '../ui/Toast';

interface DiscountFormProps {
  discount?: Discount | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DiscountForm({ discount, onClose, onSuccess }: DiscountFormProps) {
  const [formData, setFormData] = useState({
    code: discount?.code || '',
    description: discount?.description || '',
    type: (discount?.type || 'PERCENTAGE') as DiscountType,
    value: discount?.value || 0,
    is_active: discount?.is_active ?? true,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      Toast.error('El código es requerido');
      return;
    }

    if (formData.value <= 0) {
      Toast.error('El valor debe ser mayor a 0');
      return;
    }

    if (formData.type === 'PERCENTAGE' && formData.value > 100) {
       Toast.error('El porcentaje no puede ser mayor a 100');
       return;
    }

    try {
      setLoading(true);

      const discountData = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || undefined,
      };

      if (discount) {
        await discountService.updateDiscount(discount.id, discountData);
        Toast.success('Descuento actualizado exitosamente');
      } else {
        await discountService.createDiscount(discountData);
        Toast.success('Descuento creado exitosamente');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving discount:', error);
      if (error?.code === '23505') {
        Toast.error('Este código de descuento ya existe');
      } else {
        Toast.error('Error al guardar el descuento');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {discount ? 'Editar Descuento' : 'Nuevo Descuento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <Input
            label="Código (Válido para cajero y tienda)"
            name="code"
            value={formData.code}
            onChange={(e: any) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="Ej: VERANO20"
            required
          />

          <Input
            label="Descripción (Opcional)"
            name="description"
            value={formData.description}
            onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Breve detalle de la promoción..."
          />

          <Select
            label="Tipo de Descuento"
            value={formData.type}
            onChange={(e: any) => {
              const newType = e.target.value as DiscountType;
              let newValue = formData.value;
              if (newType === 'PERCENTAGE' && newValue > 100) newValue = 100;
              setFormData({ ...formData, type: newType, value: newValue });
            }}
            options={[
              { value: 'PERCENTAGE', label: 'Porcentaje (%)' },
              { value: 'FIXED', label: 'Monto Fijo (Bs)' },
            ]}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Valor del descuento
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                {formData.type === 'PERCENTAGE' ? <Percent size={16} /> : <DollarSign size={16} />}
              </div>
              <input
                type="number"
                min="0.1"
                step="0.1"
                max={formData.type === 'PERCENTAGE' ? "100" : undefined}
                value={formData.value || ''}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.type === 'PERCENTAGE' 
                ? 'El cliente recibirá este porcentaje de descuento sobre el subtotal.' 
                : 'Se descontará este monto exacto del subtotal.'}
            </p>
          </div>

          <label className="flex items-center gap-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <span className="text-sm font-medium text-gray-700">
              Activar descuento inmediatamente
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {discount ? 'Guardar Cambios' : 'Crear Descuento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
