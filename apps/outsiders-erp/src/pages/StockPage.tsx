import { useState, useEffect, useMemo } from 'react';
import { Search, AlertTriangle, Package, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';
import { stockService } from '../services/stockService';
import { useAuthStore } from '../store/authStore';
import { CATEGORIES } from '../lib/constants';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import Toast from '../components/ui/Toast';
import { AdjustStockModal } from '../components/stock/AdjustStockModal';
import { TransferStockModal } from '../components/stock/TransferStockModal';
import { useAuth } from '../hooks/useAuth';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

function sortItems(items: any[]) {
  return [...items].sort((a, b) => {
    const sizeA = a.variant?.size ?? '';
    const sizeB = b.variant?.size ?? '';
    const iA = SIZE_ORDER.indexOf(sizeA.toUpperCase());
    const iB = SIZE_ORDER.indexOf(sizeB.toUpperCase());
    if (iA !== -1 && iB !== -1) return iA - iB;
    if (iA !== -1) return -1;
    if (iB !== -1) return 1;
    return isNaN(Number(sizeA)) ? sizeA.localeCompare(sizeB) : Number(sizeA) - Number(sizeB);
  });
}

function stockColor(qty: number): string {
  if (qty === 0) return 'bg-red-50 border-red-200 text-red-700';
  if (qty < 5) return 'bg-yellow-50 border-yellow-300 text-yellow-800';
  if (qty < 10) return 'bg-blue-50 border-blue-200 text-blue-700';
  return 'bg-green-50 border-green-200 text-green-700';
}

export function StockPage() {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const [adjustModal, setAdjustModal] = useState<any>(null);
  const [transferModal, setTransferModal] = useState<any>(null);

  const { activeBranch } = useAuthStore();
  const { isAdmin } = useAuth();

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

  const groupedProducts = useMemo(() => {
    const map = new Map<string, { product: any; items: any[] }>();
    for (const item of filteredStock) {
      const product = item.variant?.product;
      if (!product) continue;
      const key = product.id ?? product.name;
      if (!map.has(key)) map.set(key, { product, items: [] });
      map.get(key)!.items.push(item);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.product.name.localeCompare(b.product.name)
    );
  }, [filteredStock]);

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Control de Stock</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? '...' : `${groupedProducts.length} producto${groupedProducts.length !== 1 ? 's' : ''}`}
            {activeBranch && <> &middot; <span className="font-medium text-gray-700">{activeBranch.name}</span></>}
          </p>
        </div>

        {/* Leyenda de colores */}
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200 inline-block" /> Sin stock
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-yellow-50 border border-yellow-300 inline-block" /> Bajo (&lt;5)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-200 inline-block" /> Medio (5–9)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-50 border border-green-200 inline-block" /> OK (≥10)
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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
            <AlertTriangle size={18} className="text-yellow-600" />
            <span className="text-sm text-gray-700">Solo stock bajo (&lt; 5)</span>
          </label>
        </div>
      </div>

      {/* Grilla de productos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <div className="flex gap-3">
                <Skeleton width={56} height={56} className="rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton height={16} />
                  <Skeleton height={12} width="60%" />
                </div>
              </div>
              <Skeleton height={36} />
            </div>
          ))}
        </div>
      ) : groupedProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <Package size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron resultados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groupedProducts.map(({ product, items }) => {
            const totalStock = items.reduce((sum, i) => sum + i.quantity, 0);
            const hasAlert = items.some((i) => i.quantity < 5);
            const sortedItems = sortItems(items);

            return (
              <div
                key={product.id ?? product.name}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Product header */}
                <div className="flex items-start gap-3 p-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={22} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                      {hasAlert && (
                        <AlertTriangle size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                    <p className="text-xs font-semibold text-gray-600 mt-1">
                      {totalStock} uds · {items.length} talla{items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Size grid */}
                <div className="border-t border-gray-50 px-4 py-3 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {sortedItems.map((item) => (
                      <div key={item.id} className="group relative">
                        {/* Size pill */}
                        <div
                          className={`flex flex-col items-center px-2 py-1.5 rounded-lg border text-center min-w-[44px] ${stockColor(item.quantity)}`}
                        >
                          <span className="text-[10px] font-bold uppercase leading-none">
                            {item.variant?.size}
                          </span>
                          <span className="text-sm font-bold leading-tight mt-0.5">
                            {item.quantity}
                          </span>
                        </div>

                        {/* Hover actions — solo admin */}
                        {isAdmin && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex bg-gray-900 rounded-lg shadow-lg overflow-hidden z-10">
                          <button
                            onClick={() => setAdjustModal(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-white hover:bg-gray-700 transition-colors text-[11px] font-medium whitespace-nowrap"
                            title="Ajustar stock"
                          >
                            <SlidersHorizontal size={11} />
                            Ajustar
                          </button>
                          <div className="w-px bg-gray-700" />
                          <button
                            onClick={() => setTransferModal(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-white hover:bg-gray-700 transition-colors text-[11px] font-medium whitespace-nowrap"
                            title="Transferir stock"
                          >
                            <ArrowLeftRight size={11} />
                            Transferir
                          </button>
                        </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
