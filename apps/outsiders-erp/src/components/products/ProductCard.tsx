import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Product } from '../../lib/types';
import Badge from '../ui/Badge';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleVisibility,
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group">
      {/* Imagen */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Badge de oculto */}
        {!product.is_visible && (
          <div className="absolute top-2 right-2">
            <Badge variant="danger">Oculto</Badge>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>

        <div className="flex items-center justify-between mb-2">
          <Badge variant="info">{product.category}</Badge>
          <span className="font-bold text-lg">{formatPrice(product.price)}</span>
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            title="Editar"
          >
            <Edit size={16} />
            Editar
          </button>

          <button
            onClick={() => onToggleVisibility(product.id)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title={product.is_visible ? 'Ocultar' : 'Mostrar'}
          >
            {product.is_visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          <button
            onClick={() => onDelete(product.id)}
            className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
