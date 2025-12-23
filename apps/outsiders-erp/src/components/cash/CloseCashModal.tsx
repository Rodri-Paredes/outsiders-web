import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cashService } from '../../services/cashService';
import { useAuthStore } from '../../store/authStore';
import { CashRegister } from '../../lib/types';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Toast from '../ui/Toast';

interface CloseCashModalProps {
  cashRegister: CashRegister;
  summary: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function CloseCashModal({ cashRegister, summary, onClose, onSuccess }: CloseCashModalProps) {
  const [closingAmount, setClosingAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore();

  const expectedCash = (summary?.total_cash || 0) + cashRegister.opening_amount;
  const difference = closingAmount - expectedCash;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirm('¿Estás seguro de cerrar la caja? Esta acción no se puede deshacer.')) {
      return;
    }

    if (!user) {
      Toast.error('Sesión inválida');
      return;
    }

    try {
      setLoading(true);
      await cashService.closeCashRegister(
        cashRegister.id,
        user.id,
        closingAmount,
        notes || undefined
      );
      Toast.success('Caja cerrada exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      Toast.error(error.message || 'Error al cerrar caja');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Cerrar Caja</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Resumen de ventas */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold mb-3">Resumen del día</h3>

            <div className="flex justify-between text-sm">
              <span>Fondo inicial:</span>
              <span className="font-semibold">Bs {cashRegister.opening_amount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Ventas en efectivo:</span>
              <span className="font-semibold">Bs {summary?.total_cash?.toFixed(2) || '0.00'}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Ventas con QR:</span>
              <span className="font-semibold">Bs {summary?.total_qr?.toFixed(2) || '0.00'}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Ventas con Tarjeta:</span>
              <span className="font-semibold">Bs {summary?.total_card?.toFixed(2) || '0.00'}</span>
            </div>

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Total de ventas:</span>
                <span>Bs {summary?.total_sales?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-green-600">
                <span>Efectivo esperado:</span>
                <span>Bs {expectedCash.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Monto real en caja */}
          <Input
            label="Monto real en efectivo (Bs)"
            type="number"
            step="0.01"
            min="0"
            value={closingAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClosingAmount(parseFloat(e.target.value) || 0)}
            required
            autoFocus
          />

          {/* Diferencia */}
          {closingAmount > 0 && (
            <div className={`p-4 rounded-lg ${difference === 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-3">
                {difference !== 0 && <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {difference > 0 ? 'Sobrante' : difference < 0 ? 'Faltante' : 'Sin diferencia'}
                  </p>
                  <p className={`text-2xl font-bold ${difference > 0 ? 'text-green-700' : difference < 0 ? 'text-red-700' : 'text-green-700'}`}>
                    Bs {Math.abs(difference).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas de cierre (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Observaciones sobre el cierre..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="danger" loading={loading} className="flex-1">
              Cerrar Caja
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
