import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  CreditCard,
  Smartphone,
  Wallet,
  Calendar
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import Toast from '../components/ui/Toast';
import Badge from '../components/ui/Badge';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [paymentStats, setPaymentStats] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { activeBranch } = useAuthStore();

  useEffect(() => {
    if (activeBranch) {
      loadDashboardData();
    }
  }, [activeBranch, dateRange]);

  const loadDashboardData = async () => {
    if (!activeBranch) return;

    try {
      setLoading(true);

      const [statsData, paymentsData, productsData] = await Promise.all([
        reportService.getDashboardStats(activeBranch.id, dateRange.startDate, dateRange.endDate),
        reportService.getSalesByPaymentMethod(activeBranch.id, dateRange.startDate, dateRange.endDate),
        reportService.getTopProducts(activeBranch.id, dateRange.startDate, dateRange.endDate, 5),
      ]);

      console.log('Dashboard Data:', { statsData, paymentsData, productsData });

      setStats(statsData);
      setPaymentStats(paymentsData);
      setTopProducts(productsData);
    } catch (error) {
      Toast.error('Error al cargar estadísticas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(amount);
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'EFECTIVO': return <Wallet size={20} />;
      case 'QR': return <Smartphone size={20} />;
      case 'TARJETA': return <CreditCard size={20} />;
      default: return <DollarSign size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Sucursal: <span className="font-semibold">{activeBranch?.name}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-500" />
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-gray-500 self-center">-</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Ventas</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.total_sales || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Transacciones</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_transactions || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ticket Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.average_ticket || 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Productos Vendidos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_products_sold || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Package size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ventas por Método de Pago</h3>
          <div className="space-y-4">
            {paymentStats.length > 0 ? (
              paymentStats.map((stat) => (
                <div key={stat.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      {getPaymentIcon(stat.type)}
                    </div>
                    <div>
                      <p className="font-medium">{stat.type}</p>
                      <p className="text-sm text-gray-600">{stat.count} transacciones</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">{formatCurrency(stat.total)}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos de pagos</p>
            )}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.product_name}</p>
                      <p className="text-sm text-gray-600">{product.quantity_sold} unidades</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">{formatCurrency(product.total_revenue)}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos de productos</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
