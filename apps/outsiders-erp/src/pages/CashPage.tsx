import { useState, useEffect } from 'react';
import { Wallet, DollarSign, CreditCard, Smartphone, TrendingUp } from 'lucide-react';
import { cashService } from '../services/cashService';
import { useAuthStore } from '../store/authStore';
import { CashRegister } from '../lib/types';
import { Button } from '../components/ui/Button';
import Card from '../components/ui/Card';
import Toast from '../components/ui/Toast';
import { OpenCashModal } from '../components/cash/OpenCashModal';
import { CloseCashModal } from '../components/cash/CloseCashModal';

export function CashPage() {
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const { activeBranch } = useAuthStore();

  useEffect(() => {
    if (activeBranch) {
      loadCashRegister();
    }
  }, [activeBranch]);

  const loadCashRegister = async () => {
    if (!activeBranch) return;

    try {
      setLoading(true);
      const openCash = await cashService.getOpenCashRegister(activeBranch.id);

      if (openCash) {
        setCashRegister(openCash);
        const summaryData = await cashService.getCashRegisterSummary(openCash.id);
        setSummary(summaryData);
      } else {
        setCashRegister(null);
        setSummary(null);
      }
    } catch (error) {
      Toast.error('Error al cargar caja');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!cashRegister) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Wallet size={64} className="text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No hay caja abierta</h2>
        <p className="text-gray-600 mb-6">Abre la caja para comenzar a registrar ventas</p>
        <Button onClick={() => setShowOpenModal(true)} icon={<Wallet size={20} />}>
          Abrir Caja
        </Button>

        {showOpenModal && (
          <OpenCashModal
            onClose={() => setShowOpenModal(false)}
            onSuccess={loadCashRegister}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Caja Abierta</h1>
          <p className="text-sm text-gray-600">
            Abierta el {new Date(cashRegister.opening_date).toLocaleString('es-BO')}
          </p>
        </div>
        <Button variant="danger" onClick={() => setShowCloseModal(true)}>
          Cerrar Caja
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Efectivo</p>
              <p className="text-2xl font-bold">Bs {summary?.total_cash?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Smartphone size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">QR</p>
              <p className="text-2xl font-bold">Bs {summary?.total_qr?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <CreditCard size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tarjeta</p>
              <p className="text-2xl font-bold">Bs {summary?.total_card?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">Bs {summary?.total_general?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Fondo inicial */}
      <Card className="p-6">
        <h3 className="font-semibold mb-2">Fondo Inicial</h3>
        <p className="text-2xl font-bold">Bs {cashRegister.opening_amount.toFixed(2)}</p>
        {cashRegister.opening_notes && (
          <p className="text-sm text-gray-600 mt-2">{cashRegister.opening_notes}</p>
        )}
      </Card>

      {/* Modales */}
      {showCloseModal && cashRegister && (
        <CloseCashModal
          cashRegister={cashRegister}
          summary={summary}
          onClose={() => setShowCloseModal(false)}
          onSuccess={loadCashRegister}
        />
      )}
    </div>
  );
}
