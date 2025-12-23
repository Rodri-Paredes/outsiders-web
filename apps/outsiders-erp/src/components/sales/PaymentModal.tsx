import { useState } from 'react';
import { X } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { salesService } from '../../services/salesService';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import { PaymentType, PaymentDetails } from '../../lib/types';
import Toast from '../ui/Toast';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: (sale: any) => void;
}

export function PaymentModal({ onClose, onSuccess }: PaymentModalProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>('EFECTIVO');
  const [cashReceived, setCashReceived] = useState(0);
  const [mixedPayment, setMixedPayment] = useState<PaymentDetails>({
    efectivo: 0,
    qr: 0,
    tarjeta: 0,
  });
  const [loading, setLoading] = useState(false);

  const { items, total, subtotal, discount, clearCart } = useCartStore();
  const { user, activeBranch } = useAuthStore();

  const calculateChange = () => {
    if (paymentType === 'EFECTIVO') {
      return Math.max(0, cashReceived - total);
    }
    return 0;
  };

  const validateMixedPayment = () => {
    const sum = (mixedPayment.efectivo || 0) + (mixedPayment.qr || 0) + (mixedPayment.tarjeta || 0);
    return Math.abs(sum - total) < 0.01; // Tolerancia de 1 centavo
  };

  const handleSubmit = async () => {
    // Validaciones
    if (paymentType === 'EFECTIVO' && cashReceived < total) {
      Toast.error('El monto recibido es insuficiente');
      return;
    }

    if (paymentType === 'MIXTO' && !validateMixedPayment()) {
      Toast.error('Los montos del pago mixto no suman el total');
      return;
    }

    if (!user || !activeBranch) {
      Toast.error('Sesión inválida');
      return;
    }

    try {
      setLoading(true);

      // Preparar datos de la venta
      const saleData = {
        user_id: user.id,
        branch_id: activeBranch.id,
        items: items.map((item) => ({
          variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        subtotal,
        discount_amount: discount,
        total,
        payment_type: paymentType,
        payment_details: paymentType === 'MIXTO' ? mixedPayment : undefined,
      };

      // Crear la venta
      const sale = await salesService.createSale(saleData);

      Toast.success('Venta realizada exitosamente');
      clearCart();
      onSuccess(sale);
    } catch (error: any) {
      Toast.error(error.message || 'Error al procesar la venta');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Pagar</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Total */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total a pagar</div>
            <div className="text-3xl font-bold">Bs {total.toFixed(2)}</div>
          </div>

          {/* Tipo de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['EFECTIVO', 'QR', 'TARJETA', 'MIXTO'] as PaymentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setPaymentType(type)}
                  className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                    paymentType === type
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs según tipo de pago */}
          {paymentType === 'EFECTIVO' && (
            <div className="space-y-4">
              <Input
                label="Monto recibido (Bs)"
                type="number"
                step="0.01"
                min="0"
                value={cashReceived}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCashReceived(parseFloat(e.target.value) || 0)}
                autoFocus
              />

              {cashReceived >= total && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-700">Cambio</div>
                  <div className="text-2xl font-bold text-green-700">
                    Bs {calculateChange().toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}

          {paymentType === 'MIXTO' && (
            <div className="space-y-3">
              <Input
                label="Efectivo (Bs)"
                type="number"
                step="0.01"
                min="0"
                value={mixedPayment.efectivo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMixedPayment((prev) => ({
                    ...prev,
                    efectivo: parseFloat(e.target.value) || 0,
                  }))
                }
              />

              <Input
                label="QR (Bs)"
                type="number"
                step="0.01"
                min="0"
                value={mixedPayment.qr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMixedPayment((prev) => ({
                    ...prev,
                    qr: parseFloat(e.target.value) || 0,
                  }))
                }
              />

              <Input
                label="Tarjeta (Bs)"
                type="number"
                step="0.01"
                min="0"
                value={mixedPayment.tarjeta}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMixedPayment((prev) => ({
                    ...prev,
                    tarjeta: parseFloat(e.target.value) || 0,
                  }))
                }
              />

              <div className="flex justify-between text-sm">
                <span>Suma:</span>
                <span className={validateMixedPayment() ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  Bs {((mixedPayment.efectivo || 0) + (mixedPayment.qr || 0) + (mixedPayment.tarjeta || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={loading} className="flex-1">
              Confirmar Venta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
