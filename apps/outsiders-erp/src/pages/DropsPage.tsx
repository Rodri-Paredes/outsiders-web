import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Eye, EyeOff, Package } from 'lucide-react';
import { Drop } from '../lib/types';
import { dropService } from '../services/dropService';
import { Button } from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { DropForm } from '../components/drops/DropForm';
import { DropProductsModal } from '../components/drops/DropProductsModal';
import EmptyState from '../components/ui/EmptyState';
import Toast from '../components/ui/Toast';

export function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingDrop, setEditingDrop] = useState<Drop | null>(null);
  const [managingProductsDrop, setManagingProductsDrop] = useState<Drop | null>(null);

  useEffect(() => {
    loadDrops();
  }, [statusFilter]);

  const loadDrops = async () => {
    try {
      setLoading(true);
      const data = await dropService.getDrops({
        status: statusFilter as any || undefined,
      });
      setDrops(data);
    } catch (error) {
      Toast.error('Error al cargar drops');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (drop: Drop) => {
    setEditingDrop(drop);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este drop?')) return;

    try {
      await dropService.deleteDrop(id);
      Toast.success('Drop eliminado exitosamente');
      loadDrops();
    } catch (error) {
      Toast.error('Error al eliminar drop');
      console.error(error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDrop(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadDrops();
  };

  const filteredDrops = drops.filter((drop) => {
    const matchesSearch = !search || 
      drop.name.toLowerCase().includes(search.toLowerCase()) ||
      drop.description?.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVO: 'success' as const,
      INACTIVO: 'info' as const,
      FINALIZADO: 'danger' as const,
    };
    return variants[status as keyof typeof variants] || 'info';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Drops / Lanzamientos</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={20} />
          Nuevo Drop
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Buscar drops..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            icon={<Search size={20} />}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
            <option value="FINALIZADO">Finalizados</option>
          </select>
        </div>
      </div>

      {/* Lista de drops */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="text-center py-12">Cargando...</div>
        ) : filteredDrops.length === 0 ? (
          <EmptyState
            icon={<Calendar size={48} />}
            title="No hay drops registrados"
            description="Crea tu primer lanzamiento para empezar"
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus size={20} />
                Crear Drop
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Drop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Lanzamiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destacado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrops.map((drop) => (
                  <tr key={drop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {drop.image_url && (
                          <img
                            src={drop.image_url}
                            alt={drop.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="font-semibold">{drop.name}</div>
                          {drop.description && (
                            <div className="text-sm text-gray-600 line-clamp-1">
                              {drop.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span>Inicio: {formatDate(drop.launch_date)}</span>
                        {drop.end_date && (
                          <span>Fin: {formatDate(drop.end_date)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadge(drop.status)}>
                        {drop.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {drop.is_featured ? (
                        <Eye size={20} className="text-green-600" />
                      ) : (
                        <EyeOff size={20} className="text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setManagingProductsDrop(drop)}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                        title="Gestionar productos"
                      >
                        <Package size={20} className="inline mr-1" />
                        Productos
                      </button>
                      <button
                        onClick={() => handleEdit(drop)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(drop.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Modal de productos */}
      {managingProductsDrop && (
        <DropProductsModal
          drop={managingProductsDrop}
          onClose={() => setManagingProductsDrop(null)}
        />
      )}
      {/* Modal de formulario */}
      {showForm && (
        <DropForm
          drop={editingDrop}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
