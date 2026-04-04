import React, { useState } from 'react';
import { X, DollarSign, TrendingDown } from 'lucide-react';
import { cashService } from '../../services/cashService';
import { Button } from '../ui/Button';
import Toast from '../ui/Toast';

interface CashWithdrawalModalProps {
  cashRegisterId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const WITHDRAWAL_REASONS = [
  'Depósito bancario',
  'Pago a proveedor',
  'Gastos operativos',
  'Sueldos',
  'Servicios (luz, agua, internet)',
  'Alquiler',
  'Otro (especificar en notas)'
];

export function CashWithdrawalModal({ cashRegisterId, onClose, onSuccess }: CashWithdrawalModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      Toast.error('El monto debe ser mayor a 0');
      return;
    }

    if (!reason) {
      Toast.error('Selecciona una razón para el retiro');
      return;
    }

    if (reason.includes('Otro') && !notes.trim()) {
      Toast.error('Especifica el motivo del retiro en las notas');
      return;
    }

    try {
      setLoading(true);

      await cashService.addCashMovement({
        cash_register_id: cashRegisterId,
        movement_type: 'EGRESO',
        payment_type: 'EFECTIVO',
        amount: amount,
        description: `${reason}${notes ? ': ' + notes : ''}`,
        user_id: (await cashService.getCurrentUser()).id,
      });

      Toast.success('Retiro registrado correctamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error recording withdrawal:', error);
      Toast.error(error.message || 'Error al registrar el retiro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-bold">Retiro de Efectivo</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto a retirar (Bs) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign size={20} className="text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-lg font-semibold"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Razón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo del retiro *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            >
              <option value="">Selecciona un motivo</option>
              {WITHDRAWAL_REASONS.map((r) => (
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
              placeholder="Detalles del retiro..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              required={reason.includes('Otro')}
            />
          </div>

          {/* Alerta */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Importante:</strong> Este retiro se descontará del efectivo disponible en caja. 
              Asegúrate de tener el monto exacto antes de confirmar.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading} className="flex-1 bg-red-600 hover:bg-red-700">
              Confirmar Retiro
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
