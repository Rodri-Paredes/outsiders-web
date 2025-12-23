import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Trash2, Plus, Minus } from 'lucide-react';
import { Product } from '../../lib/types';
import { productService } from '../../services/productService';
import { stockService } from '../../services/stockService';
import { useAuthStore } from '../../store/authStore';
import { CATEGORIES, SIZES } from '../../lib/constants';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Toast from '../ui/Toast';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface SizeWithStock {
  size: string;
  variantId?: string;
  stock: number;
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const { activeBranch } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price || 0,
  });

  const [mainImage, setMainImage] = useState<string>(product?.image_url || '');
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [sizesWithStock, setSizesWithStock] = useState<SizeWithStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product && activeBranch) {
      loadProductData();
    }
  }, [product, activeBranch]);

  const loadProductData = async () => {
    if (!product || !activeBranch) return;

    try {
      const variants = await productService.getProductVariants(product.id);
      
      const sizesData: SizeWithStock[] = [];
      for (const variant of variants) {
        try {
          const stockData = await stockService.getStockByVariant(variant.id, activeBranch.id);
          sizesData.push({
            size: variant.size,
            variantId: variant.id,
            stock: stockData?.quantity || 0,
          });
        } catch {
          sizesData.push({
            size: variant.size,
            variantId: variant.id,
            stock: 0,
          });
        }
      }
      
      setSizesWithStock(sizesData);
    } catch (error) {
      console.error('Error loading product data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Toast.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Toast.error('La imagen no debe superar 5MB');
      return;
    }

    setMainImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setMainImage('');
    setMainImageFile(null);
  };

  const addSize = (size: string) => {
    if (sizesWithStock.some(s => s.size === size)) {
      Toast.error('Esta talla ya está agregada');
      return;
    }

    setSizesWithStock(prev => [...prev, { size, stock: 0 }]);
  };

  const removeSize = (size: string) => {
    setSizesWithStock(prev => prev.filter(s => s.size !== size));
  };

  const updateSizeStock = (size: string, stock: number) => {
    if (stock < 0) return;
    
    setSizesWithStock(prev => 
      prev.map(s => s.size === size ? { ...s, stock } : s)
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (sizesWithStock.length === 0) {
      newErrors.sizes = 'Agrega al menos una talla';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      Toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (!activeBranch) {
      Toast.error('Debes seleccionar una sucursal');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = mainImage;

      // Subir imagen si hay una nueva
      if (mainImageFile) {
        try {
          imageUrl = await productService.uploadProductImage(mainImageFile);
        } catch (error) {
          console.error('Error uploading image:', error);
          // Continuar sin imagen si falla la subida
        }
      }

      const productData = {
        ...formData,
        image_url: imageUrl || null,
        is_visible: true,
      };

      let savedProduct: Product;

      if (product) {
        // Actualizar producto existente
        savedProduct = await productService.updateProduct(product.id, productData);
        
        // Gestionar variantes
        const existingVariants = await productService.getProductVariants(product.id);
        const existingSizes = existingVariants.map(v => v.size);
        const newSizes = sizesWithStock.map(s => s.size);

        // Crear nuevas variantes y actualizar stock
        for (const sizeData of sizesWithStock) {
          if (!existingSizes.includes(sizeData.size)) {
            const newVariant = await productService.createProductVariant(product.id, sizeData.size);
            
            if (sizeData.stock > 0) {
              await stockService.initializeStock(newVariant.id, activeBranch.id, sizeData.stock);
            }
          } else {
            const variant = existingVariants.find(v => v.size === sizeData.size);
            if (variant) {
              try {
                await stockService.setStock(variant.id, activeBranch.id, sizeData.stock);
              } catch (error) {
                await stockService.initializeStock(variant.id, activeBranch.id, sizeData.stock);
              }
            }
          }
        }

        Toast.success('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        const createData = {
          ...productData,
          image_url: productData.image_url || undefined
        };
        savedProduct = await productService.createProduct(createData);
        
        // Crear variantes y stock
        for (const sizeData of sizesWithStock) {
          const newVariant = await productService.createProductVariant(savedProduct.id, sizeData.size);
          
          if (sizeData.stock > 0) {
            await stockService.initializeStock(newVariant.id, activeBranch.id, sizeData.stock);
          }
        }

        Toast.success('Producto creado correctamente');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      Toast.error('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Selecciona una categoría' },
    ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  const availableSizes = SIZES.filter(size => !sizesWithStock.some(s => s.size === size));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda - Información Básica */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Información del Producto</h3>
              
              <Input
                label="Nombre del Producto"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Ej: Remera Oversized Black"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe las características del producto..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                />
              </div>

              <Select
                label="Categoría"
                name="category"
                options={categoryOptions}
                value={formData.category}
                onChange={handleInputChange}
                error={errors.category}
                required
              />

              <Input
                label="Precio (Bs)"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                error={errors.price}
                placeholder="0.00"
                required
              />

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Producto
                </label>
                
                {mainImage ? (
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden group">
                    <img
                      src={mainImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-12 h-12 mb-3 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">Click para subir imagen</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG o WEBP (máx. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Columna Derecha - Tallas y Stock */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tallas y Stock</h3>
                
                {/* Tallas Agregadas */}
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {sizesWithStock.map((sizeData) => (
                    <div key={sizeData.size} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-black text-white font-bold rounded-lg">
                          {sizeData.size}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Stock inicial
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateSizeStock(sizeData.size, sizeData.stock - 1)}
                            className="p-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            disabled={sizeData.stock <= 0}
                          >
                            <Minus size={16} />
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            value={sizeData.stock}
                            onChange={(e) => updateSizeStock(sizeData.size, parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-1 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          
                          <button
                            type="button"
                            onClick={() => updateSizeStock(sizeData.size, sizeData.stock + 1)}
                            className="p-1 rounded-lg bg-gray-200 hover:bg-gray-300"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeSize(sizeData.size)}
                        className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  {sizesWithStock.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No hay tallas agregadas</p>
                      <p className="text-sm">Agrega tallas disponibles abajo</p>
                    </div>
                  )}
                </div>

                {errors.sizes && (
                  <p className="text-sm text-red-500 mb-3">{errors.sizes}</p>
                )}

                {/* Agregar Tallas */}
                {availableSizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agregar Tallas
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => addSize(size)}
                          className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-black transition-all font-medium"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> El stock se configura para la sucursal actual ({activeBranch?.name || 'seleccionada'}). 
                    Puedes ajustarlo después desde el módulo de Stock.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-6 mt-6 border-t">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              disabled={loading}
            >
              {product ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
