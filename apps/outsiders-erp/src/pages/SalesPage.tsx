import { useState, useEffect, useRef } from 'react';
import { Search, Barcode } from 'lucide-react';
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
  const [barcodeMode, setBarcodeMode] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);

  const { activeBranch } = useAuthStore();
  const { items } = useCartStore();

  useEffect(() => {
    loadProducts();
  }, [search, category]);

  useEffect(() => {
    if (barcodeMode && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [barcodeMode]);

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

  const handleBarcodeSearch = async (sku: string) => {
    if (!sku.trim()) return;

    try {
      const product = await productService.getProductBySKU(sku.trim());
      
      if (product) {
        setSelectedProduct(product);
        setShowSizeModal(true);
        setSearch(''); // Limpiar búsqueda
      } else {
        Toast.error(`No se encontró producto con SKU: ${sku}`);
      }
    } catch (error) {
      console.error('Error searching by barcode:', error);
      Toast.error('Error al buscar por código de barras');
    }
  };

  const handleBarcodeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBarcodeSearch(search);
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
            <div className="relative">
              <Input
                ref={barcodeInputRef}
                placeholder={barcodeMode ? "Escanea o escribe el código de barras..." : "Buscar productos..."}
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                onKeyPress={barcodeMode ? handleBarcodeKeyPress : undefined}
                icon={barcodeMode ? <Barcode size={20} /> : <Search size={20} />}
              />
              <button
                onClick={() => setBarcodeMode(!barcodeMode)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                  barcodeMode 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={barcodeMode ? 'Modo búsqueda normal' : 'Modo escáner de código de barras'}
              >
                <Barcode size={18} />
              </button>
            </div>

            <Select
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {barcodeMode && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <Barcode size={16} className="inline mr-1" />
                <strong>Modo escáner activado:</strong> Escanea el código de barras o escríbelo y presiona Enter
              </p>
            </div>
          )}
        </div>

        {/* Grid de productos */}
        <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-2 sm:p-4">
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Search size={48} />}
              title="No se encontraron productos"
              description="Intenta ajustar los filtros de búsqueda"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-4">
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
