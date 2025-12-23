import React, { useState } from 'react';
import { X } from 'lucide-react';
import { stockService } from '../../services/stockService';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Toast from '../ui/Toast';

interface AdjustStockModalProps {
  stockItem: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdjustStockModal({ stockItem, onClose, onSuccess }: AdjustStockModalProps) {
  const [newQuantity, setNewQuantity] = useState(stockItem.quantity);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newQuantity < 0) {
      Toast.error('La cantidad no puede ser negativa');
      return;
    }

    try {
      setLoading(true);
      await stockService.updateStock(
        stockItem.variant_id,
        stockItem.branch_id,
        newQuantity - stockItem.quantity
      );
      Toast.success('Stock actualizado');
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Ajustar Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600">Producto</p>
            <p className="font-semibold">{stockItem.variant?.product?.name}</p>
            <p className="text-sm">Talla: {stockItem.variant?.size}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Stock actual</p>
            <p className="text-2xl font-bold">{stockItem.quantity}</p>
          </div>

          <Input
            label="Nueva cantidad"
            type="number"
            min="0"
            value={newQuantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewQuantity(parseInt(e.target.value) || 0)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
