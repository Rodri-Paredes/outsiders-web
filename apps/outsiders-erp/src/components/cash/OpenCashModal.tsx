import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cashService } from '../../services/cashService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Toast from '../ui/Toast';

interface OpenCashModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function OpenCashModal({ onClose, onSuccess }: OpenCashModalProps) {
  const [openingAmount, setOpeningAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, activeBranch } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (openingAmount < 0) {
      Toast.error('El monto no puede ser negativo');
      return;
    }

    if (!user || !activeBranch) {
      Toast.error('Sesión inválida');
      return;
    }

    try {
      setLoading(true);
      await cashService.openCashRegister(
        activeBranch.id,
        user.id,
        openingAmount,
        notes || undefined
      );
      Toast.success('Caja abierta exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      Toast.error(error.message || 'Error al abrir caja');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Abrir Caja</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Fondo inicial (Bs)"
            type="number"
            step="0.01"
            min="0"
            value={openingAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpeningAmount(parseFloat(e.target.value) || 0)}
            required
            autoFocus
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
              placeholder="Notas sobre la apertura..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Abrir Caja
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
