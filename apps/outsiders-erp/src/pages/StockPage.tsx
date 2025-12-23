import { useState, useEffect } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { stockService } from '../services/stockService';
import { useAuthStore } from '../store/authStore';
import { CATEGORIES } from '../lib/constants';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import Toast from '../components/ui/Toast';
import { AdjustStockModal } from '../components/stock/AdjustStockModal';
import { TransferStockModal } from '../components/stock/TransferStockModal';

export function StockPage() {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const [adjustModal, setAdjustModal] = useState<any>(null);
  const [transferModal, setTransferModal] = useState<any>(null);

  const { activeBranch } = useAuthStore();

  useEffect(() => {
    if (activeBranch) {
      loadStock();
    }
  }, [activeBranch, showLowStock]);

  const loadStock = async () => {
    if (!activeBranch) return;

    try {
      setLoading(true);
      const data = showLowStock
        ? await stockService.getLowStock(activeBranch.id)
        : await stockService.getStockByBranch(activeBranch.id);
      setStock(data);
    } catch (error) {
      Toast.error('Error al cargar stock');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStock = stock.filter((item) => {
    const product = item.variant?.product;
    if (!product) return false;

    const matchesSearch = !search || product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Control de Stock</h1>
        <div className="text-sm text-gray-600">
          Sucursal: <span className="font-semibold">{activeBranch?.name}</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar producto..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            icon={<Search size={20} />}
          />

          <Select
            options={categoryOptions}
            value={category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <AlertTriangle size={20} className="text-yellow-600" />
            <span className="text-sm text-gray-700">Solo stock bajo (&lt; 5)</span>
          </label>
        </div>
      </div>

      {/* Tabla de stock */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Talla
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={5}>
                      <Skeleton height={40} />
                    </td>
                  </tr>
                ))
              ) : filteredStock.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                filteredStock.map((item) => {
                  const product = item.variant?.product;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product?.image_url && (
                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="font-medium text-gray-900">{product?.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product?.category}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {item.variant?.size}
                      </td>
                      <td className="px-6 py-4">
                        {item.quantity < 5 ? (
                          <Badge variant="danger">{item.quantity}</Badge>
                        ) : item.quantity < 10 ? (
                          <Badge variant="warning">{item.quantity}</Badge>
                        ) : (
                          <Badge variant="success">{item.quantity}</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => setAdjustModal(item)}
                          className="text-black hover:text-gray-700"
                        >
                          Ajustar
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => setTransferModal(item)}
                          className="text-black hover:text-gray-700"
                        >
                          Transferir
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {adjustModal && (
        <AdjustStockModal
          stockItem={adjustModal}
          onClose={() => setAdjustModal(null)}
          onSuccess={() => {
            loadStock();
            setAdjustModal(null);
          }}
        />
      )}

      {transferModal && (
        <TransferStockModal
          stockItem={transferModal}
          onClose={() => setTransferModal(null)}
          onSuccess={() => {
            loadStock();
            setTransferModal(null);
          }}
        />
      )}
    </div>
  );
}
