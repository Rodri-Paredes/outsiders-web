import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { stockService } from '../../services/stockService';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Toast from '../ui/Toast';

interface AdjustStockModalProps {
  stockItem: any;
  onClose: () => void;
  onSuccess: () => void;
}

type AdjustmentType = 'ADD' | 'SUBTRACT' | 'SET';

const ADJUSTMENT_REASONS = {
  ADD: [
    'Compra a proveedor',
    'Devolución de cliente',
    'Corrección de inventario',
    'Transferencia recibida',
    'Producción interna',
    'Otro (especificar en notas)'
  ],
  SUBTRACT: [
    'Venta sin registrar',
    'Producto dañado',
    'Producto perdido',
    'Regalo o donación',
    'Muestra o prueba',
    'Corrección de inventario',
    'Otro (especificar en notas)'
  ],
  SET: [
    'Inventario físico',
    'Corrección de error',
    'Migración de sistema',
    'Otro (especificar en notas)'
  ]
};

export function AdjustStockModal({ stockItem, onClose, onSuccess }: AdjustStockModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('ADD');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateNewStock = () => {
    if (adjustmentType === 'SET') {
      return quantity;
    } else if (adjustmentType === 'ADD') {
      return stockItem.quantity + quantity;
    } else {
      return Math.max(0, stockItem.quantity - quantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      Toast.error('Selecciona una razón de ajuste');
      return;
    }

    if (quantity <= 0 && adjustmentType !== 'SET') {
      Toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    if (adjustmentType === 'SET' && quantity < 0) {
      Toast.error('La cantidad no puede ser negativa');
      return;
    }

    if (adjustmentType === 'SUBTRACT' && quantity > stockItem.quantity) {
      Toast.error('No puedes restar más de lo disponible');
      return;
    }

    try {
      setLoading(true);
      
      let adjustmentQuantity: number;
      if (adjustmentType === 'SET') {
        adjustmentQuantity = quantity - stockItem.quantity;
      } else if (adjustmentType === 'ADD') {
        adjustmentQuantity = quantity;
      } else {
        adjustmentQuantity = -quantity;
      }

      await stockService.updateStock(
        stockItem.variant_id,
        stockItem.branch_id,
        adjustmentQuantity
      );

      Toast.success('Stock actualizado correctamente');
      onSuccess();
    } catch (error) {
      Toast.error('Error al actualizar stock');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Ajustar Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Información del Producto */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Producto</p>
            <p className="font-bold text-lg">{stockItem.variant?.product?.name}</p>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm">
                <span className="text-gray-600">Talla:</span> <span className="font-semibold">{stockItem.variant?.size}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Stock actual:</span> <span className="font-bold text-lg">{stockItem.quantity}</span>
              </p>
            </div>
          </div>

          {/* Tipo de Ajuste */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de ajuste
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setAdjustmentType('ADD'); setQuantity(1); setReason(''); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  adjustmentType === 'ADD'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Plus size={20} />
                <span className="text-sm font-medium">Entrada</span>
              </button>
              
              <button
                type="button"
                onClick={() => { setAdjustmentType('SUBTRACT'); setQuantity(1); setReason(''); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  adjustmentType === 'SUBTRACT'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Minus size={20} />
                <span className="text-sm font-medium">Salida</span>
              </button>
              
              <button
                type="button"
                onClick={() => { setAdjustmentType('SET'); setQuantity(stockItem.quantity); setReason(''); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  adjustmentType === 'SET'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">=</span>
                <span className="text-sm font-medium">Establecer</span>
              </button>
            </div>
          </div>

          {/* Cantidad */}
          <Input
            label={adjustmentType === 'SET' ? 'Cantidad final' : `Cantidad a ${adjustmentType === 'ADD' ? 'agregar' : 'restar'}`}
            type="number"
            min="0"
            value={quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(parseInt(e.target.value) || 0)}
            required
          />

          {/* Nuevo Stock Calculado */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Stock después del ajuste:</p>
            <p className="text-2xl font-bold text-blue-900">{calculateNewStock()} unidades</p>
            {adjustmentType !== 'SET' && (
              <p className="text-xs text-blue-600 mt-1">
                {adjustmentType === 'ADD' ? '+' : '-'}{quantity} unidades
              </p>
            )}
          </div>

          {/* Razón del Ajuste */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón del ajuste *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            >
              <option value="">Selecciona una razón</option>
              {ADJUSTMENT_REASONS[adjustmentType].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales {reason.includes('Otro') && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Agrega detalles sobre este ajuste..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              required={reason.includes('Otro')}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Confirmar Ajuste
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
