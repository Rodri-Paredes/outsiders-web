import { useState, useEffect } from 'react';
import { X, Plus, Star, Trash2 } from 'lucide-react';
import { Drop } from '../../lib/types';
import { dropService } from '../../services/dropService';
import { productService } from '../../services/productService';
import { Button } from '../ui/Button';
import Toast from '../ui/Toast';

interface DropProductsModalProps {
  drop: Drop;
  onClose: () => void;
}

export function DropProductsModal({ drop, onClose }: DropProductsModalProps) {
  const [dropProducts, setDropProducts] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProducts, setShowAddProducts] = useState(false);

  useEffect(() => {
    loadData();
  }, [drop.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Obtener productos del drop
      const dropData = await dropService.getDropWithProducts(drop.id);
      setDropProducts(dropData.products || []);

      // Obtener todos los productos disponibles
      const allProducts = await productService.getProducts();
      
      // Filtrar productos que no están en el drop
      const dropProductIds = new Set((dropData.products || []).map((p: any) => p.id));
      const available = allProducts.filter(p => !dropProductIds.has(p.id));
      setAvailableProducts(available);
    } catch (error) {
      Toast.error('Error al cargar productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productId: string) => {
    try {
      await dropService.addProductToDrop(drop.id, productId);
      Toast.success('Producto agregado al drop');
      loadData();
      setShowAddProducts(false);
    } catch (error: any) {
      Toast.error(error.message || 'Error al agregar producto');
      console.error(error);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!confirm('¿Remover este producto del drop?')) return;

    try {
      await dropService.removeProductFromDrop(drop.id, productId);
      Toast.success('Producto removido del drop');
      loadData();
    } catch (error) {
      Toast.error('Error al remover producto');
      console.error(error);
    }
  };

  const handleToggleFeatured = async (dropProductId: string, currentFeatured: boolean) => {
    try {
      await dropService.updateDropProduct(dropProductId, {
        is_featured: !currentFeatured,
      });
      Toast.success(currentFeatured ? 'Producto desmarcado como destacado' : 'Producto marcado como destacado');
      loadData();
    } catch (error) {
      Toast.error('Error al actualizar producto');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">{drop.name}</h2>
            <p className="text-sm text-gray-600">Gestionar productos del drop</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">Cargando...</div>
          ) : (
            <div className="space-y-6">
              {/* Productos en el drop */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Productos en el drop ({dropProducts.length})
                  </h3>
                  <Button size="sm" onClick={() => setShowAddProducts(!showAddProducts)}>
                    <Plus size={16} />
                    Agregar Productos
                  </Button>
                </div>

                {dropProducts.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No hay productos en este drop</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dropProducts.map((product: any) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        
                        <div className="flex-1">
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            Bs {product.price?.toFixed(2)} • {product.category}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFeatured(product.drop_product_id, product.is_featured)}
                            className={`p-2 rounded-lg transition-colors ${
                              product.is_featured
                                ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                                : 'text-gray-400 hover:bg-gray-200'
                            }`}
                            title={product.is_featured ? 'Destacado' : 'Marcar como destacado'}
                          >
                            <Star size={20} fill={product.is_featured ? 'currentColor' : 'none'} />
                          </button>

                          <button
                            onClick={() => handleRemoveProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover del drop"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Agregar productos */}
              {showAddProducts && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Productos disponibles ({availableProducts.length})
                  </h3>
                  
                  {availableProducts.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">
                        Todos los productos ya están en el drop
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{product.name}</div>
                            <div className="text-sm text-gray-600">
                              Bs {product.price.toFixed(2)}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleAddProduct(product.id)}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
