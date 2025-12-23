import { Trash2, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';
import Input from '../ui/Input';

interface CartProps {
  onProceedToPayment: () => void;
}

export function Cart({ onProceedToPayment }: CartProps) {
  const {
    items,
    subtotal,
    discount,
    total,
    removeItem,
    updateQuantity,
    setDiscount,
    clearCart,
  } = useCartStore();

  const handleQuantityChange = (variantId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(variantId);
    } else {
      updateQuantity(variantId, newQuantity);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-bold">Carrito de Venta</h2>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p>El carrito está vacío</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{item.productName}</h3>
                  <p className="text-xs text-gray-600">Talla: {item.size}</p>
                  <p className="text-sm font-bold mt-1">
                    Bs {item.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuantityChange(item.variantId, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.variantId, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded"
                      disabled={item.quantity >= item.available}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <p className="text-sm font-bold">
                    Bs {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen y totales */}
      {items.length > 0 && (
        <div className="border-t p-4 space-y-4">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-semibold">Bs {subtotal.toFixed(2)}</span>
          </div>

          {/* Descuento */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Descuento (Bs)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max={subtotal}
              value={discount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          {/* Total */}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>TOTAL:</span>
            <span>Bs {total.toFixed(2)}</span>
          </div>

          {/* Botón Pagar */}
          <Button
            onClick={onProceedToPayment}
            className="w-full"
            size="lg"
          >
            Proceder al Pago
          </Button>
        </div>
      )}
    </div>
  );
}
