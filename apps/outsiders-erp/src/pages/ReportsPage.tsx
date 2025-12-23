import { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { reportService } from '../services/reportService';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Toast from '../components/ui/Toast';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { activeBranch } = useAuthStore();

  useEffect(() => {
    if (activeBranch) {
      loadReportData();
    }
  }, [activeBranch, dateRange]);

  const loadReportData = async () => {
    if (!activeBranch) return;

    try {
      setLoading(true);
      const [statsData, salesReport] = await Promise.all([
        reportService.getDashboardStats(activeBranch.id, dateRange.startDate, dateRange.endDate),
        reportService.getSalesReport(activeBranch.id, dateRange.startDate, dateRange.endDate)
      ]);

      setStats(statsData);
      setSalesData(salesReport || []);
    } catch (error) {
      Toast.error('Error al cargar reportes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!salesData.length) {
      Toast.error('No hay datos para exportar');
      return;
    }

    const headers = ['Fecha', 'Total', 'Método de Pago', 'Productos', 'Usuario'];
    const rows = salesData.map(sale => [
      new Date(sale.sale_date).toLocaleString('es-BO'),
      `Bs ${sale.total.toFixed(2)}`,
      sale.payment_type,
      sale.items?.length || 0,
      sale.user?.name || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ventas_${dateRange.startDate}_${dateRange.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Toast.success('Reporte exportado correctamente');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Sucursal: <span className="font-semibold">{activeBranch?.name}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          
          <Button onClick={exportToCSV} icon={<Download size={20} />}>
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Ventas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.total_sales || 0)}
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
                  {stats.total_transactions || 0}
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
                  {formatCurrency(stats.average_ticket || 0)}
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
                  {stats.total_products_sold || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Package size={24} className="text-orange-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Sales Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Detalle de Ventas</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando reportes...</p>
            </div>
          ) : salesData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay ventas en el período seleccionado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pago</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(sale.sale_date).toLocaleString('es-BO', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sale.payment_type === 'EFECTIVO' ? 'bg-green-100 text-green-800' :
                          sale.payment_type === 'QR' ? 'bg-blue-100 text-blue-800' :
                          sale.payment_type === 'TARJETA' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sale.payment_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{sale.items?.length || 0}</td>
                      <td className="py-3 px-4 text-gray-600">{sale.user?.name || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
