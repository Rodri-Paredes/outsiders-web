import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { productService } from '../services/productService';
import { Product } from '../lib/types';
import { CATEGORIES } from '../lib/constants';
import { Button } from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { ProductCard } from '../components/products/ProductCard';
import { ProductForm } from '../components/products/ProductForm';
import { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Toast from '../components/ui/Toast';
import { useDebounce } from '../hooks/useDebounce';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [includeHidden, setIncludeHidden] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadProducts();
  }, [debouncedSearch, category, includeHidden]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({
        search: debouncedSearch,
        category: category || undefined,
        includeHidden,
      });
      setProducts(data);
    } catch (error) {
      Toast.error('Error al cargar productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await productService.deleteProduct(id);
      Toast.success('Producto eliminado');
      loadProducts();
    } catch (error) {
      Toast.error('Error al eliminar producto');
      console.error(error);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      await productService.toggleProductVisibility(id);
      Toast.success('Visibilidad actualizada');
      loadProducts();
    } catch (error) {
      Toast.error('Error al actualizar visibilidad');
      console.error(error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    loadProducts();
    handleFormClose();
  };

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button
          onClick={() => setShowForm(true)}
          icon={<Plus size={20} />}
        >
          Nuevo Producto
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar productos..."
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
              checked={includeHidden}
              onChange={(e) => setIncludeHidden(e.target.checked)}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <span className="text-sm text-gray-700">Mostrar ocultos</span>
          </label>
        </div>
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Search size={48} />}
          title="No se encontraron productos"
          description={
            search || category
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer producto'
          }
          action={
            !search && !category ? (
              <Button onClick={() => setShowForm(true)}>Crear Producto</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
