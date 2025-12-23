import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Product } from '../lib/types';
import { productService } from '../services/productService';
import { CATEGORIES } from '../lib/constants';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { SizeSelectionModal } from '../components/sales/SizeSelectionModal';
import { PaymentModal } from '../components/sales/PaymentModal';
import { SaleReceipt } from '../components/sales/SaleReceipt';
import { Cart } from '../components/sales/Cart';
import EmptyState from '../components/ui/EmptyState';
import Toast from '../components/ui/Toast';

export function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);

  const { activeBranch } = useAuthStore();
  const { items } = useCartStore();

  useEffect(() => {
    loadProducts();
  }, [search, category]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({
        search: search || undefined,
        category: category || undefined,
        includeHidden: false,
      });
      setProducts(data);
    } catch (error) {
      Toast.error('Error al cargar productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowSizeModal(true);
  };

  const handleProceedToPayment = () => {
    if (items.length === 0) {
      Toast.error('El carrito está vacío');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleSaleCompleted = (sale: any) => {
    setShowPaymentModal(false);
    setCompletedSale(sale);
  };

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-6">
      {/* Columna izquierda - Productos */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-4">Nueva Venta</h1>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Buscar productos..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              icon={<Search size={20} />}
            />

            <Select
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de productos */}
        <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4">
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Search size={48} />}
              title="No se encontraron productos"
              description="Intenta ajustar los filtros de búsqueda"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 text-left transition-colors"
                >
                  {product.image_url && (
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-gray-600">{product.category}</p>
                  <p className="font-bold text-sm mt-1">
                    Bs {product.price.toFixed(2)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Columna derecha - Carrito */}
      <div className="lg:w-96 flex flex-col">
        <Cart onProceedToPayment={handleProceedToPayment} />
      </div>

      {/* Modales */}
      {showSizeModal && selectedProduct && (
        <SizeSelectionModal
          product={selectedProduct}
          branchId={activeBranch?.id || ''}
          onClose={() => {
            setShowSizeModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handleSaleCompleted}
        />
      )}

      {completedSale && (
        <SaleReceipt
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
}
