import { X, Printer } from 'lucide-react';
import { Sale } from '../../lib/types';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

interface SaleReceiptProps {
  sale: Sale;
  onClose: () => void;
}

export function SaleReceipt({ sale, onClose }: SaleReceiptProps) {
  const { items } = useCartStore();
  const { user, activeBranch } = useAuthStore();

  const handlePrint = () => {
    window.print();
  };

  const handleNewSale = () => {
    onClose();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header (no print) */}
        <div className="flex items-center justify-between p-6 border-b print:hidden">
          <h2 className="text-xl font-bold">Comprobante de Venta</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 print:p-8" id="receipt">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">OUTSIDERS</h1>
            <p className="text-sm text-gray-600">{activeBranch?.name}</p>
            <p className="text-sm text-gray-600">{activeBranch?.address}</p>
          </div>

          {/* Info de venta */}
          <div className="mb-6 pb-4 border-b space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Nro. Venta:</span>
              <span className="font-mono">{sale.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span>{formatDate(sale.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vendedor:</span>
              <span>{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Método de Pago:</span>
              <span className="font-semibold">{sale.payment_type}</span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Producto</th>
                  <th className="text-center py-2">Cant.</th>
                  <th className="text-right py-2">Precio</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-xs text-gray-600">Talla: {item.size}</div>
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{item.price.toFixed(2)}</td>
                    <td className="text-right font-semibold">
                      {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Bs {sale.subtotal.toFixed(2)}</span>
            </div>

            {sale.discount_amount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Descuento:</span>
                <span>- Bs {sale.discount_amount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>TOTAL:</span>
              <span>Bs {sale.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Desglose de pago mixto */}
          {sale.payment_type === 'MIXTO' && sale.payment_details && (
            <div className="mb-6 pb-4 border-t pt-4 space-y-1 text-sm">
              <div className="font-semibold mb-2">Desglose de Pago:</div>
              {sale.payment_details.efectivo && sale.payment_details.efectivo > 0 && (
                <div className="flex justify-between">
                  <span>Efectivo:</span>
                  <span>Bs {sale.payment_details.efectivo.toFixed(2)}</span>
                </div>
              )}
              {sale.payment_details.qr && sale.payment_details.qr > 0 && (
                <div className="flex justify-between">
                  <span>QR:</span>
                  <span>Bs {sale.payment_details.qr.toFixed(2)}</span>
                </div>
              )}
              {sale.payment_details.tarjeta && sale.payment_details.tarjeta > 0 && (
                <div className="flex justify-between">
                  <span>Tarjeta:</span>
                  <span>Bs {sale.payment_details.tarjeta.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t">
            <p>¡Gracias por tu compra!</p>
            <p className="mt-1">OUTSIDERS - Moda Urbana</p>
          </div>
        </div>

        {/* Acciones (no print) */}
        <div className="flex gap-3 p-6 border-t print:hidden">
          <Button
            variant="secondary"
            onClick={handlePrint}
            icon={<Printer size={20} />}
            className="flex-1"
          >
            Imprimir
          </Button>
          <Button onClick={handleNewSale} className="flex-1">
            Nueva Venta
          </Button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt,
          #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
