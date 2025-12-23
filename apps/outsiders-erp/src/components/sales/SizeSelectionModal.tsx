import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product, ProductVariant } from '../../lib/types';
import { productService } from '../../services/productService';
import { stockService } from '../../services/stockService';
import { useCartStore } from '../../store/cartStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Toast from '../ui/Toast';

interface SizeSelectionModalProps {
  product: Product;
  branchId: string;
  onClose: () => void;
}

export function SizeSelectionModal({
  product,
  branchId,
  onClose,
}: SizeSelectionModalProps) {
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCartStore();

  useEffect(() => {
    loadVariants();
  }, []);

  const loadVariants = async () => {
    try {
      setLoading(true);
      const productVariants = await productService.getProductVariants(product.id);

      // Obtener stock de cada variante
      const variantsWithStock = await Promise.all(
        productVariants.map(async (variant) => {
          try {
            const stock = await stockService.getStockByVariant(variant.id, branchId);
            return {
              ...variant,
              stock: stock?.quantity || 0,
            };
          } catch (error) {
            return {
              ...variant,
              stock: 0,
            };
          }
        })
      );

      setVariants(variantsWithStock);
    } catch (error) {
      Toast.error('Error al cargar tallas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      Toast.error('Selecciona una talla');
      return;
    }

    if (quantity <= 0) {
      Toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    if (quantity > selectedVariant.stock) {
      Toast.error('Stock insuficiente');
      return;
    }

    // Crear objetos que coincidan con la interfaz del store
    const variant: ProductVariant = {
      id: selectedVariant.id,
      product_id: product.id,
      size: selectedVariant.size,
      created_at: selectedVariant.created_at || new Date().toISOString(),
    };

    const productWithStock = {
      ...product,
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    };

    addItem(variant, productWithStock as any, quantity, selectedVariant.stock);

    Toast.success('Producto agregado al carrito');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Seleccionar Talla</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Producto */}
          <div className="flex gap-4">
            {product.image_url && (
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.category}</p>
              <p className="font-bold mt-1">Bs {product.price.toFixed(2)}</p>
            </div>
          </div>

          {/* Tallas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tallas disponibles
            </label>

            {loading ? (
              <div className="text-center py-4">Cargando...</div>
            ) : variants.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No hay tallas disponibles
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={variant.stock === 0}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-black bg-black text-white'
                        : variant.stock > 0
                        ? 'border-gray-300 hover:border-gray-400'
                        : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="font-semibold">{variant.size}</div>
                    <div className="text-xs mt-1">
                      {variant.stock > 0 ? `(${variant.stock})` : 'Agotado'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cantidad */}
          {selectedVariant && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <Input
                type="number"
                min="1"
                max={selectedVariant.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-gray-600 mt-1">
                Stock disponible: {selectedVariant.stock}
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedVariant || loading}
              className="flex-1"
            >
              Agregar al Carrito
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
