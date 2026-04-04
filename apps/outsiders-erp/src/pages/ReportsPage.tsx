import { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  FileSpreadsheet
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { reportService } from '../services/reportService';
import { excelService } from '../services/excelService';
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
        reportService.getDashboardStats(activeBranch.id, dateRange.startDate!, dateRange.endDate!),
        reportService.getSalesReport(activeBranch.id, dateRange.startDate!, dateRange.endDate!)
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

  const exportToExcel = () => {
    if (!salesData.length) {
      Toast.error('No hay datos para exportar');
      return;
    }

    if (!dateRange.startDate || !dateRange.endDate) {
      Toast.error('Debe seleccionar un rango de fechas válido');
      return;
    }

    try {
      excelService.exportSalesReport(salesData, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      Toast.success('Reporte exportado a Excel correctamente');
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      Toast.error('Error al exportar el reporte');
    }
  };

  const exportToCSV = () => {
    if (!salesData.length) {
      Toast.error('No hay datos para exportar');
      return;
    }

    // Crear filas con detalle de cada producto vendido
    const rows: any[] = [];
    
    salesData.forEach(sale => {
      if (sale.sale_items && sale.sale_items.length > 0) {
        // Una fila por cada producto en la venta
        sale.sale_items.forEach((item: any) => {
          const itemDiscount = item.item_discount || 0;
          const finalPrice = item.subtotal - itemDiscount;
          
          rows.push({
            'Nro. Venta': sale.id.substring(0, 8),
            'Fecha': new Date(sale.sale_date).toLocaleString('es-BO', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
            'Producto': item.product_variant?.product?.name || 'N/A',
            'Talla': item.product_variant?.size || 'N/A',
            'Cantidad': item.quantity,
            'Precio Unitario': item.unit_price.toFixed(2),
            'Subtotal Item': item.subtotal.toFixed(2),
            'Descuento Item': itemDiscount.toFixed(2),
            'Total Item': finalPrice.toFixed(2),
            'Total Venta': sale.total.toFixed(2),
            'Descuento Adicional': sale.discount_amount?.toFixed(2) || '0.00',
            'Tipo de Pago': sale.payment_type,
            'Celular Cliente': sale.customer_phone || 'N/A',
            'Vendedor': sale.user?.name || 'N/A'
          });
        });
      } else {
        // Si no hay items, crear una fila con la info básica
        rows.push({
          'Nro. Venta': sale.id.substring(0, 8),
          'Fecha': new Date(sale.sale_date).toLocaleString('es-BO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          'Producto': 'N/A',
          'Talla': 'N/A',
          'Cantidad': 0,
          'Precio Unitario': '0.00',
          'Subtotal Item': '0.00',
          'Descuento Item': '0.00',
          'Total Item': '0.00',
          'Total Venta': sale.total.toFixed(2),
          'Descuento Adicional': sale.discount_amount?.toFixed(2) || '0.00',
          'Tipo de Pago': sale.payment_type,
          'Celular Cliente': sale.customer_phone || 'N/A',
          'Vendedor': sale.user?.name || 'N/A'
        });
      }
    });

    // Crear headers
    const headers = Object.keys(rows[0]);
    
    // Crear contenido CSV con comillas para campos que puedan contener comas
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(header => {
          const value = row[header]?.toString() || '';
          // Escapar comillas y envolver en comillas si contiene comas o saltos de línea
          return value.includes(',') || value.includes('\n') || value.includes('"')
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // Agregar BOM para que Excel reconozca UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ventas_${dateRange.startDate}_${dateRange.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Toast.success('Reporte CSV exportado correctamente');
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
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Calendar size={20} className="text-gray-500 hidden sm:block" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
            />
            <span className="text-gray-500 text-center sm:inline">-</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={exportToExcel} 
              icon={<FileSpreadsheet size={20} />} 
              className="flex-1 sm:flex-none"
              variant="primary"
            >
              <span className="hidden sm:inline">Exportar Excel</span>
              <span className="sm:hidden">Excel</span>
            </Button>
            <Button 
              onClick={exportToCSV} 
              icon={<Download size={20} />} 
              className="flex-1 sm:flex-none"
              variant="secondary"
            >
              <span className="hidden sm:inline">CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
          </div>
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
              <div className="p-3 bg-gray-100 rounded-lg">
                <Package size={24} className="text-gray-700" />
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Productos</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subtotal</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pago / Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((sale) => {
                    const totalItemDiscounts = sale.sale_items.reduce((sum: number, item: any) => sum + (item.item_discount || 0), 0);
                    
                    return (
                      <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {new Date(sale.sale_date).toLocaleString('es-BO', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-2">
                            {sale.sale_items.map((item: any, idx: number) => (
                              <div key={idx} className="text-sm">
                                <div className="font-medium text-gray-900">
                                  {item.product_variant?.product?.name} - {item.product_variant?.size}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {item.quantity}x {formatCurrency(item.unit_price)}
                                </div>
                                {item.item_discount > 0 && (
                                  <div className="text-xs text-red-600 mt-1">
                                    Desc. item: -Bs {item.item_discount.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-2">
                            {sale.sale_items.map((item: any, idx: number) => (
                              <div key={idx} className="text-sm py-1">
                                {item.item_discount > 0 ? (
                                  <div>
                                    <div className="line-through text-gray-400 text-xs">
                                      {formatCurrency(item.subtotal)}
                                    </div>
                                    <div className="font-semibold text-green-600">
                                      {formatCurrency(item.subtotal - item.item_discount)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="font-semibold text-gray-900">
                                    {formatCurrency(item.subtotal)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              sale.payment_type === 'EFECTIVO' ? 'bg-green-100 text-green-800' :
                              sale.payment_type === 'QR' ? 'bg-blue-100 text-blue-800' :
                              sale.payment_type === 'TARJETA' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {sale.payment_type}
                            </span>
                            {(totalItemDiscounts > 0 || sale.discount_amount > 0) && (
                              <div className="mt-2 p-2 bg-red-50 rounded text-xs space-y-1">
                                {totalItemDiscounts > 0 && (
                                  <div className="text-red-700">
                                    Desc. items: -Bs {totalItemDiscounts.toFixed(2)}
                                  </div>
                                )}
                                {sale.discount_amount > 0 && (
                                  <div className="text-red-700">
                                    Desc. adicional: -Bs {sale.discount_amount.toFixed(2)}
                                  </div>
                                )}
                                <div className="font-semibold text-gray-900 pt-1 border-t border-red-200">
                                  Total: {formatCurrency(sale.total)}
                                </div>
                              </div>
                            )}
                            {totalItemDiscounts === 0 && sale.discount_amount === 0 && (
                              <div className="font-semibold text-gray-900 text-sm mt-1">
                                {formatCurrency(sale.total)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{sale.user?.name || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
