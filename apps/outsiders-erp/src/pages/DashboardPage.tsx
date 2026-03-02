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

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [paymentStats, setPaymentStats] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0] || '',
    endDate: new Date().toISOString().split('T')[0] || '',
  });

  const { activeBranch } = useAuthStore();

  useEffect(() => {
    if (activeBranch) {
      loadDashboardData();
    }
  }, [activeBranch, dateRange]);

  const loadDashboardData = async () => {
    if (!activeBranch?.id) return;

    try {
      setLoading(true);

      const branchId = activeBranch.id!;
      const startDate = dateRange.startDate;
      const endDate = dateRange.endDate;
      
      const [statsData, paymentsData, productsData, salesData] = await Promise.all([
        reportService.getDashboardStats(branchId, startDate, endDate),
        reportService.getSalesByPaymentMethod(branchId, startDate, endDate),
        reportService.getTopProducts(branchId, startDate, endDate, 5),
        reportService.getSalesReport(branchId, startDate, endDate),
      ]);

      console.log('Dashboard Data:', { statsData, paymentsData, productsData, salesData });

      setStats(statsData);
      setPaymentStats(paymentsData);
      setTopProducts(productsData);
      setRecentSales(salesData.slice(0, 10)); // Últimas 10 ventas
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
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
            <div className="p-3 bg-gray-100 rounded-lg">
              <Package size={24} className="text-gray-700" />
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

      {/* Recent Sales Detail */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detalle de Ventas Recientes</h3>
        {recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Producto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Talla</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Cantidad</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Precio Unit.</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Subtotal</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Pago</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => {
                  // Mostrar cada item de la venta como una fila
                  if (sale.sale_items && sale.sale_items.length > 0) {
                    // Calcular el total de descuentos individuales
                    const totalItemDiscounts = sale.sale_items.reduce((sum: number, item: any) => 
                      sum + (item.item_discount || 0), 0
                    );
                    
                    return sale.sale_items.map((item: any, idx: number) => (
                      <tr key={`${sale.id}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50">
                        {idx === 0 && (
                          <td className="py-3 px-4 text-xs" rowSpan={sale.sale_items.length}>
                            {new Date(sale.sale_date).toLocaleDateString('es-BO', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        )}
                        <td className="py-3 px-4 text-sm">
                          {item.product_variant?.product?.name || 'N/A'}
                          {item.item_discount > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              Desc. item: -Bs {item.item_discount.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                            {item.product_variant?.size || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-sm font-semibold">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm">
                          <div>
                            {item.item_discount > 0 && (
                              <div className="line-through text-gray-400 text-xs">
                                {formatCurrency(item.subtotal)}
                              </div>
                            )}
                            <div className={item.item_discount > 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                              {formatCurrency(item.subtotal - (item.item_discount || 0))}
                            </div>
                          </div>
                        </td>
                        {idx === 0 && (
                          <td className="py-3 px-4" rowSpan={sale.sale_items.length}>
                            <div className="space-y-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                                sale.payment_type === 'EFECTIVO' ? 'bg-green-100 text-green-800' :
                                sale.payment_type === 'QR' ? 'bg-blue-100 text-blue-800' :
                                sale.payment_type === 'TARJETA' ? 'bg-purple-100 text-purple-800' :
                                sale.payment_type === 'REGALO' ? 'bg-pink-100 text-pink-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {sale.payment_type}
                              </span>
                              {(totalItemDiscounts > 0 || sale.discount_amount > 0) && (
                                <div className="text-xs text-gray-600 mt-2">
                                  {totalItemDiscounts > 0 && (
                                    <div className="text-red-600">
                                      Desc. items: -Bs {totalItemDiscounts.toFixed(2)}
                                    </div>
                                  )}
                                  {sale.discount_amount > 0 && (
                                    <div className="text-red-600">
                                      Desc. adicional: -Bs {sale.discount_amount.toFixed(2)}
                                    </div>
                                  )}
                                  <div className="font-semibold text-gray-900 mt-1">
                                    Total: {formatCurrency(sale.total)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ));
                  }
                  return null;
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay ventas recientes</p>
        )}
      </Card>
    </div>
  );
}
