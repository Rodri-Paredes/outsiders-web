import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertTriangle } from 'lucide-react'
import { stockService } from '@/services/stockService'
import Toast from '@/components/ui/Toast'

export function DashboardPage() {
  const { activeBranch } = useAuth()
  const [lowStock, setLowStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activeBranch) {
      loadDashboardData()
    }
  }, [activeBranch])

  const loadDashboardData = async () => {
    if (!activeBranch) return

    try {
      setLoading(true)

      const [lowStockData] = await Promise.all([
        stockService.getLowStock(activeBranch.id, 5),
      ])

      setLowStock(lowStockData)
    } catch (error) {
      Toast.error('Error al cargar dashboard')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bienvenido a {activeBranch?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventas (7 días)</p>
              <p className="text-2xl font-bold mt-1">Bs 0.00</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transacciones</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ticket Promedio</p>
              <p className="text-2xl font-bold mt-1">Bs 0.00</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Productos Vendidos</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Package size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle size={24} className="text-yellow-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Productos con Stock Bajo
              </h3>
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-yellow-800">
                      {item.variant?.product?.name} - {item.variant?.size}
                    </span>
                    <span className="font-semibold text-yellow-900">
                      {item.quantity} unidades
                    </span>
                  </div>
                ))}
              </div>
              {lowStock.length > 5 && (
                <p className="text-sm text-yellow-700 mt-2">
                  Y {lowStock.length - 5} productos más...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
