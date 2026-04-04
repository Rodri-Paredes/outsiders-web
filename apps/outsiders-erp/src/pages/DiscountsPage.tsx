import { useState, useEffect } from 'react';
import { Plus, Tag, Pencil, Trash2, Power, PowerOff } from 'lucide-react';
import { discountService } from '../services/discountService';
import { Discount } from '../lib/types';
import { Button } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Toast from '../components/ui/Toast';
import { DiscountForm } from '../components/discounts/DiscountForm';

export function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const data = await discountService.getDiscounts(true); // Include inactive
      setDiscounts(data);
    } catch (error) {
      Toast.error('Error al cargar descuentos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setShowForm(true);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`¿Estás seguro de eliminar el descuento ${code}?`)) return;

    try {
      await discountService.deleteDiscount(id);
      Toast.success('Descuento eliminado');
      loadDiscounts();
    } catch (error) {
      Toast.error('Error al eliminar descuento');
      console.error(error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await discountService.toggleDiscountStatus(id, currentStatus);
      Toast.success(`Descuento ${currentStatus ? 'desactivado' : 'activado'}`);
      loadDiscounts();
    } catch (error) {
      Toast.error('Error al cambiar el estado del descuento');
      console.error(error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDiscount(null);
  };

  const handleFormSuccess = () => {
    loadDiscounts();
    handleFormClose();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="text-black" /> Promociones y Descuentos
        </h1>
        <Button
          onClick={() => setShowForm(true)}
          icon={<Plus size={20} />}
        >
          Nuevo Descuento
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando descuentos...</div>
      ) : discounts.length === 0 ? (
        <EmptyState
          icon={<Tag size={48} />}
          title="No hay descuentos configurados"
          description="Crea tu primer descuento para aplicarlo en el punto de venta"
          action={
            <Button onClick={() => setShowForm(true)}>Crear Descuento</Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => (
            <div key={discount.id} className={`bg-white rounded-lg shadow p-6 ${!discount.is_active ? 'opacity-70' : ''}`}>
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="text-xl font-black truncate">{discount.code}</div>
                <Badge variant={discount.is_active ? 'success' : 'warning'}>
                  {discount.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Valor de Descuento</div>
                  <div className="text-2xl font-bold text-green-600">
                    {discount.type === 'PERCENTAGE' 
                      ? `${discount.value}% OFF` 
                      : `- Bs ${discount.value.toFixed(2)}`}
                  </div>
                </div>

                {discount.description && (
                  <div>
                    <div className="text-sm text-gray-600 truncate">{discount.description}</div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                   <Button 
                      variant="secondary" 
                      className="flex-1"
                      icon={<Pencil size={16} />}
                      onClick={() => handleEdit(discount)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="secondary" 
                      className={`flex-1 ${discount.is_active ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}`}
                      icon={discount.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                      onClick={() => handleToggleStatus(discount.id, discount.is_active)}
                    >
                      {discount.is_active ? 'Apagar' : 'Activar'}
                    </Button>
                    <Button 
                      variant="danger" 
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDelete(discount.id, discount.code)}
                      aria-label="Eliminar descuento"
                    >
                      {''}
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <DiscountForm
          discount={editingDiscount}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
