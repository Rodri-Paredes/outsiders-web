import { formatCurrency } from '../../lib/utils';
import React, { useState, useEffect, useMemo } from 'react';
import { X, Image as ImageIcon, Trash2, Plus, Minus, Tag, Percent, Lock, Ruler, Globe, Store } from 'lucide-react';
import { Product, ProductTag, Branch } from '../../lib/types';
import { productService } from '../../services/productService';
import { branchService } from '../../services/branchService';
import { stockService } from '../../services/stockService';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORIES, SIZES, SIZES_BY_CATEGORY } from '../../lib/constants';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Toast from '../ui/Toast';
import { supabase } from '../../lib/supabase';

interface SizeGuideOption {
  id: string;
  material: string;
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface SizeWithStock {
  size: string;
  variantId?: string;
  stock: number;
  priceOverride?: number | null;
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const { activeBranch } = useAuthStore();
  const { isAdmin } = useAuth();
  
  // `base_price` es la única fuente de verdad del precio: nunca se sobrescribe
  // con el precio descontado. `price`/`original_price` los calcula la DB
  // (columnas generadas) a partir de base_price + discount_percentage, por eso
  // no forman parte de este formulario.
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    base_price: product?.base_price ?? product?.price ?? 0,
    cost_price: product?.cost_price || null as number | null,
    discount_percentage: product?.discount_percentage || null as number | null,
    markdown_percentage: product?.markdown_percentage || null as number | null,
    sku: (product as any)?.sku || '',
    is_new_in: product?.is_new_in ?? false,
    web_only: product?.web_only ?? false,
    visible_on_web: product?.visible_on_web ?? true,
  });

  // Local state for the discounted price input (instead of % field).
  // Si ya hay un segundo descuento (markdown) activo, el precio del primer
  // nivel es mid_price, no price (que en ese caso ya es el precio final).
  const [discountedPriceInput, setDiscountedPriceInput] = useState<string>(() => {
    if (product?.discount_percentage) {
      const tier1Price = product?.markdown_percentage ? product?.mid_price : product?.price;
      if (tier1Price != null) return String(tier1Price);
    }
    return '';
  });

  // Local state for el precio final tras el segundo descuento (markdown).
  const [markdownPriceInput, setMarkdownPriceInput] = useState<string>(() => {
    if (product?.markdown_percentage && product?.price != null) {
      return String(product.price);
    }
    return '';
  });

  // Controla si se muestra el editor de descuento (precio base + precio con
  // descuento) en vez del campo único "Precio de venta".
  const [discountMode, setDiscountMode] = useState<boolean>(!!product?.discount_percentage);

  // Controla si se muestra el editor del segundo descuento (encima del primero).
  const [markdownMode, setMarkdownMode] = useState<boolean>(!!product?.markdown_percentage);

  const [images, setImages] = useState<string[]>(product?.images || (product?.image_url ? [product.image_url] : []));
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [sizesWithStock, setSizesWithStock] = useState<SizeWithStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tags state
  const [availableTags, setAvailableTags] = useState<ProductTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  // Size guide state
  const [sizeGuides, setSizeGuides] = useState<SizeGuideOption[]>([]);
  const [selectedSizeGuideId, setSelectedSizeGuideId] = useState<string>(
    (product as any)?.size_guide_id || ''
  );

  // Branch visibilities state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchVisibilities, setBranchVisibilities] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load all size guides for the dropdown
    supabase
      .from('size_guides')
      .select('id, material')
      .order('material')
      .then(({ data }) => {
        if (data) setSizeGuides(data as SizeGuideOption[]);
      });

    // Load branches and product branch visibilities
    async function loadBranchesAndVisibilities() {
      try {
        const allBranches = await branchService.getBranches();
        setBranches(allBranches);

        let visibilities: Record<string, boolean> = {};
        if (product?.id) {
          visibilities = await productService.getBranchVisibilities(product.id);
        }

        const initialBranchVisibilities: Record<string, boolean> = {};
        allBranches.forEach((b) => {
          if (visibilities[b.id] !== undefined) {
            initialBranchVisibilities[b.id] = visibilities[b.id] === true;
          } else {
            initialBranchVisibilities[b.id] = product?.visible_on_web ?? true;
          }
        });
        setBranchVisibilities(initialBranchVisibilities);
      } catch (err) {
        console.error('Error loading branches and visibilities:', err);
      }
    }
    loadBranchesAndVisibilities();
  }, [product?.id]);

  // Computed: available sizes based on category
  const categorySizes = useMemo(() => {
    if (!formData.category) return SIZES as unknown as string[];
    return (SIZES_BY_CATEGORY[formData.category] || SIZES) as unknown as string[];
  }, [formData.category]);

  // Precio tras el primer descuento (tier 1) — es la base sobre la que se
  // calcula/compone el segundo descuento, si existe.
  // Redondeado a boliviano entero (sin centavos): la tienda no maneja
  // centavos, y un % de descuento "prolijo" (16.67% de un 240 pensado para
  // dar 200 exacto) casi nunca da un resultado exacto en centavos si se
  // redondea a 2 decimales (240 * 0.8333 = 199.992 → 199.99 en vez de 200).
  // Redondeando al entero se absorbe ese error de precisión y el precio
  // final queda limpio.
  const tier1Price = useMemo(() => {
    if (formData.base_price && formData.discount_percentage && formData.discount_percentage > 0) {
      return Math.round(formData.base_price * (1 - formData.discount_percentage / 100));
    }
    return null;
  }, [formData.base_price, formData.discount_percentage]);

  // Computed: discount preview. Aplica la misma fórmula de redondeo que las
  // columnas generadas en la DB para que lo que se ve en el formulario sea
  // exactamente lo que se va a guardar. Si hay markdown_percentage activo,
  // el segundo descuento se compone sobre tier1Price (ya redondeado), no
  // sobre base_price directo.
  const discountPreview = useMemo(() => {
    if (tier1Price == null || !formData.discount_percentage) return null;

    if (formData.markdown_percentage && formData.markdown_percentage > 0) {
      const tier2Price = Math.round(tier1Price * (1 - formData.markdown_percentage / 100));
      return {
        originalPrice: formData.base_price,
        midPrice: tier1Price,
        finalPrice: Math.round(tier2Price),
        percentage: Math.round(formData.discount_percentage),
        markdownPercentage: Math.round(formData.markdown_percentage),
        savings: Math.round(formData.base_price - tier2Price),
      };
    }

    return {
      originalPrice: formData.base_price,
      midPrice: null as number | null,
      finalPrice: Math.round(tier1Price),
      percentage: Math.round(formData.discount_percentage),
      markdownPercentage: null as number | null,
      savings: Math.round(formData.base_price - tier1Price),
    };
  }, [formData.base_price, formData.discount_percentage, formData.markdown_percentage, tier1Price]);

  // Recalcula discount_percentage SOLO cuando el admin edita el campo "Precio
  // con descuento" directamente. OJO: antes esto también escuchaba cambios de
  // formData.base_price, lo cual causaba un bug real — al editar el precio
  // base de un producto que YA tenía un descuento activo, este efecto volvía
  // a dispararse con el discountedPriceInput viejo (el precio con descuento
  // anterior, ej. 249.99) y recalculaba un % nuevo para forzar que el precio
  // final siguiera siendo ese valor viejo, ignorando el precio base recién
  // tipeado. Resultado: el admin ponía "350" en precio base y el producto
  // terminaba costando "249.99" igual. Al sacar base_price de las deps, el
  // % de descuento quedo fijo cuando se edita el precio base (el descuento
  // se sigue aplicando, pero sobre el precio base nuevo) — solo se recalcula
  // si el admin toca el campo de precio con descuento explícitamente.
  useEffect(() => {
    const basePrice = formData.base_price;
    const discountedPrice = parseFloat(discountedPriceInput);
    if (basePrice && basePrice > 0 && !isNaN(discountedPrice) && discountedPrice > 0 && discountedPrice < basePrice) {
      const pct = Math.round(((basePrice - discountedPrice) / basePrice) * 10000) / 100;
      setFormData(prev => ({ ...prev, discount_percentage: pct }));
    } else if (!isNaN(discountedPrice) && discountedPrice > 0) {
      // discountedPrice >= basePrice: no discount
      setFormData(prev => ({ ...prev, discount_percentage: null }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountedPriceInput]);

  // Mismo fix que arriba, para el segundo descuento: solo se recalcula
  // markdown_percentage cuando el admin edita markdownPriceInput a mano, no
  // como efecto colateral de que cambie tier1Price (que depende de base_price
  // y discount_percentage).
  useEffect(() => {
    if (tier1Price == null) return; // sin primer descuento no puede haber segundo
    const finalPrice = parseFloat(markdownPriceInput);
    if (!isNaN(finalPrice) && finalPrice > 0 && finalPrice < tier1Price) {
      const pct = Math.round(((tier1Price - finalPrice) / tier1Price) * 10000) / 100;
      setFormData(prev => ({ ...prev, markdown_percentage: pct }));
    } else if (!isNaN(finalPrice) && finalPrice > 0) {
      setFormData(prev => ({ ...prev, markdown_percentage: null }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdownPriceInput]);

  // Load tags when category changes
  useEffect(() => {
    loadTags();
  }, [formData.category]);

  useEffect(() => {
    if (product && activeBranch) {
      loadProductData();
    }
  }, [product, activeBranch]);

  // When category changes, clear incompatible sizes
  useEffect(() => {
    if (formData.category) {
      const validSizes = SIZES_BY_CATEGORY[formData.category] || SIZES;
      setSizesWithStock(prev => 
        prev.filter(s => (validSizes as readonly string[]).includes(s.size))
      );
    }
  }, [formData.category]);

  const loadTags = async () => {
    try {
      setLoadingTags(true);
      const tags = await productService.getProductTags(formData.category || undefined);
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

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
            priceOverride: variant.price_override,
          });
        } catch {
          sizesData.push({
            size: variant.size,
            variantId: variant.id,
            stock: 0,
            priceOverride: variant.price_override,
          });
        }
      }
      
      setSizesWithStock(sizesData);

      // Load assigned tags
      if (product.tags) {
        setSelectedTagIds(product.tags.map(t => t.tag_id));
      }
    } catch (error) {
      console.error('Error loading product data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'base_price' || name === 'discount_percentage' || name === 'cost_price'
        ? (value === '' ? null : parseFloat(value) || 0)
        : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validar tipo y tamaño de archivos
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        Toast.error('Por favor selecciona solo imágenes válidas');
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        Toast.error('Las imágenes no deben superar 20MB cada una');
        return;
      }
    }

    // Limitar a 5 imágenes máximo
    if (images.length + files.length > 5) {
      Toast.error('Máximo 5 imágenes por producto');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);

    // Crear previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addSize = (size: string) => {
    if (sizesWithStock.some(s => s.size === size)) {
      Toast.error('Esta talla ya está agregada');
      return;
    }

    setSizesWithStock(prev => [...prev, { size, stock: 0, priceOverride: null }]);
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

  const updateSizePriceOverride = (size: string, priceOverride: number | null) => {
    setSizesWithStock(prev =>
      prev.map(s => s.size === size ? { ...s, priceOverride } : s)
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearDiscount = () => {
    // Limpia AMBOS niveles. base_price NUNCA se toca acá — por eso el precio
    // vuelve solo a su valor original al quitar el/los descuento(s).
    setFormData(prev => ({
      ...prev,
      discount_percentage: null,
      markdown_percentage: null,
    }));
    setDiscountedPriceInput('');
    setMarkdownPriceInput('');
    setDiscountMode(false);
    setMarkdownMode(false);
  };

  const clearMarkdown = () => {
    // Solo limpia el segundo descuento — el primero queda intacto, igual que
    // clearDiscount nunca toca base_price.
    setFormData(prev => ({ ...prev, markdown_percentage: null }));
    setMarkdownPriceInput('');
    setMarkdownMode(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    if (formData.base_price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (sizesWithStock.length === 0) {
      newErrors.sizes = 'Agrega al menos una talla';
    }

    if (discountMode && (!discountedPriceInput || parseFloat(discountedPriceInput) <= 0)) {
      newErrors.discounted_price = 'Ingresa el precio con descuento';
    }

    if (markdownMode && (!markdownPriceInput || parseFloat(markdownPriceInput) <= 0)) {
      newErrors.markdown_price = 'Ingresa el precio final con el segundo descuento';
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

      let imageUrls: string[] = [];

      // Subir nuevas imágenes si existen
      if (imageFiles.length > 0) {
        try {
          const uploadedUrls = await productService.uploadProductImages(imageFiles);
          imageUrls = [...images.filter(img => img.startsWith('http')), ...uploadedUrls];
        } catch (error) {
          console.error('Error uploading images:', error);
          Toast.error('Error al subir algunas imágenes');
          // Continuar con las imágenes existentes
          imageUrls = images.filter(img => img.startsWith('http'));
        }
      } else {
        imageUrls = images;
      }

      const productData = {
        ...formData,
        sku: formData.sku?.trim() ? formData.sku.trim() : `SKU-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        images: imageUrls.length > 0 ? imageUrls : null,
        image_url: imageUrls[0] || null,
        is_visible: true,
        is_new_in: formData.is_new_in,
        web_only: formData.web_only,
        visible_on_web: Object.values(branchVisibilities).length > 0 
          ? Object.values(branchVisibilities).some(v => v === true) 
          : formData.visible_on_web,
        discount_percentage: formData.discount_percentage || null,
        markdown_percentage: formData.markdown_percentage || null,
        size_guide_id: selectedSizeGuideId || null,
        // Solo admins pueden guardar/modificar el precio de costo
        cost_price: isAdmin ? (formData.cost_price || null) : undefined,
      };

      let savedProduct: Product;

      if (product) {
        // Actualizar producto existente
        savedProduct = await productService.updateProduct(product.id, productData);
        
        // Guardar visibilidad por sucursal
        if (Object.keys(branchVisibilities).length > 0) {
          await productService.setBranchVisibilities(savedProduct.id, branchVisibilities);
        }

        // Gestionar variantes
        const existingVariants = await productService.getProductVariants(product.id);
        const existingSizes = existingVariants.map(v => v.size);

        // Crear nuevas variantes y actualizar stock
        for (const sizeData of sizesWithStock) {
          if (!existingSizes.includes(sizeData.size)) {
            const newVariant = await productService.createProductVariant(product.id, sizeData.size, sizeData.priceOverride);
            
            if (sizeData.stock > 0) {
              await stockService.initializeStock(newVariant.id, activeBranch.id, sizeData.stock);
            }
          } else {
            const variant = existingVariants.find(v => v.size === sizeData.size);
            if (variant) {
              // Update price_override if changed
              if (variant.price_override !== sizeData.priceOverride) {
                await productService.updateProductVariant(variant.id, { price_override: sizeData.priceOverride });
              }
              try {
                await stockService.setStock(variant.id, activeBranch.id, sizeData.stock);
              } catch (error) {
                await stockService.initializeStock(variant.id, activeBranch.id, sizeData.stock);
              }
            }
          }
        }

        // Actualizar tags
        await productService.setProductTags(product.id, selectedTagIds);

        Toast.success('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        const createData = {
          ...productData,
          images: productData.images || undefined,
          image_url: productData.image_url || undefined
        };
        savedProduct = await productService.createProduct(createData);
        
        // Guardar visibilidad por sucursal
        if (Object.keys(branchVisibilities).length > 0) {
          await productService.setBranchVisibilities(savedProduct.id, branchVisibilities);
        }

        // Crear variantes y stock
        for (const sizeData of sizesWithStock) {
          const newVariant = await productService.createProductVariant(savedProduct.id, sizeData.size, sizeData.priceOverride);
          
          if (sizeData.stock > 0) {
            await stockService.initializeStock(newVariant.id, activeBranch.id, sizeData.stock);
          }
        }

        // Asignar tags
        if (selectedTagIds.length > 0) {
          await productService.setProductTags(savedProduct.id, selectedTagIds);
        }

        Toast.success('Producto creado correctamente');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      if (error?.code === '23505' && error?.message?.includes('sku')) {
        Toast.error('El SKU ingresado ya está en uso por otro producto. Por favor ingresa uno diferente.');
      } else {
        Toast.error('Error al guardar el producto');
      }
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Selecciona una categoría' },
    ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  const availableSizesForCategory = categorySizes.filter(size => !sizesWithStock.some(s => s.size === size));

  // Group tags by tag_group for display
  const tagsByGroup = useMemo(() => {
    const groups: Record<string, ProductTag[]> = {};
    availableTags.forEach(tag => {
      const group = tag.tag_group;
      if (!groups[group]) groups[group] = [];
      groups[group]!.push(tag);
    });
    return groups;
  }, [availableTags]);

  const tagGroupLabels: Record<string, string> = {
    tipo: 'Tipo',
    material: 'Material',
    gramaje: 'Gramaje',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header - Fijo */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-white rounded-t-lg flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
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

        {/* Form - Scrolleable */}
        <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
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
                placeholder="Ej: Polera Oversized Black"
                required
              />

              <Input
                label="SKU / Código de Barras"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                error={errors.sku}
                placeholder="Ej: OUT-POL-001"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
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

              {/* NEW IN toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setFormData(prev => ({ ...prev, is_new_in: !prev.is_new_in }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${formData.is_new_in ? 'bg-black' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${formData.is_new_in ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Marcar como <span className="font-bold text-black">NEW IN</span>
                  <span className="ml-2 text-xs text-gray-400">(muestra badge en tienda)</span>
                </span>
              </label>

              {/* ===== DÓNDE SE PUEDE COMPRAR ESTE PRODUCTO ===== */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">
                  ¿Dónde se puede comprar este producto?
                </h4>

                {/* WEB ONLY toggle: el producto NO se vende en el local/POS */}
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, web_only: !prev.web_only }))}
                    className={`relative w-10 h-6 rounded-full transition-colors mt-0.5 flex-shrink-0 ${formData.web_only ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${formData.web_only ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span className="text-sm text-gray-700">
                    <span className="flex items-center gap-1.5 font-bold text-blue-700">
                      <Globe size={14} />
                      No vender en el local (solo por internet)
                    </span>
                    <span className="block mt-0.5 text-xs text-gray-500">
                      {formData.web_only
                        ? 'Activado: este producto NO se puede vender desde el POS/local. Solo se compra por la tienda online.'
                        : 'Desactivado: se puede vender normalmente en el local y por internet.'}
                    </span>
                  </span>
                </label>

                {/* VISIBILIDAD EN TIENDA ONLINE POR SUCURSAL */}
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-sm text-gray-900">
                      <Store size={16} />
                      Publicar en la tienda online por Sucursal
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Configura de forma independiente en qué sucursal se mostrará este producto en la tienda virtual (ej: Santa Cruz vs. Cochabamba).
                  </p>

                  <div className="space-y-2">
                    {branches.map((b) => {
                      const isVisibleInBranch = branchVisibilities[b.id] ?? true;
                      const isCurrentActiveBranch = b.id === activeBranch?.id;
                      return (
                        <div
                          key={b.id}
                          onClick={() => {
                            setBranchVisibilities((prev) => ({
                              ...prev,
                              [b.id]: !isVisibleInBranch,
                            }));
                          }}
                          className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200 select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <Store size={16} className={isVisibleInBranch ? 'text-green-600' : 'text-gray-400'} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  {b.name}
                                </span>
                                {isCurrentActiveBranch && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                                    Sucursal actual
                                  </span>
                                )}
                              </div>
                              <span className="block text-xs text-gray-500 mt-0.5">
                                {isVisibleInBranch
                                  ? 'Visible en la tienda virtual de esta sucursal'
                                  : 'Oculto en la tienda virtual de esta sucursal'}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                              isVisibleInBranch ? 'bg-black' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                isVisibleInBranch ? 'left-6' : 'left-1'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ===== SECCIÓN DE PRECIOS Y DESCUENTOS ===== */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Percent size={16} />
                    Precio y Descuento
                  </h4>
                  {discountMode && (
                    <button
                      type="button"
                      onClick={clearDiscount}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Quitar descuento
                    </button>
                  )}
                </div>

                {/* Precio base (sin descuento). base_price es la única fuente
                    de verdad: el input de descuento de abajo lo referencia
                    pero nunca lo modifica directamente. */}
                <Input
                  label="Precio de venta (Bs.)"
                  name="base_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_price || ''}
                  onChange={handleInputChange}
                  error={errors.price}
                  placeholder="Monto en bolivianos"
                  required
                />

                {!discountMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountMode(true);
                      setDiscountedPriceInput('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Percent size={14} />
                    Agregar descuento
                  </button>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Precio con descuento (Bs.)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={discountedPriceInput}
                          onChange={(e) => setDiscountedPriceInput(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm ${errors.discounted_price ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="120.00"
                        />
                        {errors.discounted_price && <p className="text-xs text-red-500 mt-1">{errors.discounted_price}</p>}
                      </div>
                    </div>

                    {/* Segundo descuento (encima del primero) */}
                    {discountPreview && !markdownMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setMarkdownMode(true);
                          setMarkdownPriceInput('');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Percent size={14} />
                        Agregar otro descuento
                      </button>
                    )}

                    {markdownMode && (
                      <div className="grid grid-cols-2 gap-3 items-end">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Precio final, con el 2do descuento (Bs.)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={markdownPriceInput}
                            onChange={(e) => setMarkdownPriceInput(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm ${errors.markdown_price ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="90.00"
                          />
                          {errors.markdown_price && <p className="text-xs text-red-500 mt-1">{errors.markdown_price}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={clearMarkdown}
                          className="text-xs text-red-500 hover:text-red-700 font-medium pb-2"
                        >
                          Quitar último descuento
                        </button>
                      </div>
                    )}

                    {/* Discount Preview */}
                    {discountPreview && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 line-through">{formatCurrency(discountPreview.originalPrice)}</p>
                            {discountPreview.midPrice != null && (
                              <p className="text-xs text-gray-400 line-through">{formatCurrency(discountPreview.midPrice)}</p>
                            )}
                            <p className="text-lg font-bold text-green-700">{formatCurrency(discountPreview.finalPrice)}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <div>
                              <span className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                                -{discountPreview.percentage}%
                              </span>
                              {discountPreview.markdownPercentage != null && (
                                <span className="ml-1 inline-flex items-center px-2 py-1 bg-emerald-700 text-white text-xs font-bold rounded">
                                  -{discountPreview.markdownPercentage}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-green-600">Ahorras {formatCurrency(discountPreview.savings)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ===== PRECIO DE COSTO (Solo Admin) ===== */}
              {isAdmin && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                    <Lock size={14} />
                    Información Privada (Solo Administrador)
                  </h4>
                  <div>
                    <label className="block text-xs font-medium text-amber-800 mb-1">
                      Precio de Costo (Bs.)
                    </label>
                    <input
                      type="number"
                      name="cost_price"
                      step="0.01"
                      min="0"
                      value={formData.cost_price ?? ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
                      placeholder="0.00"
                    />
                    {formData.cost_price != null && formData.cost_price > 0 && (() => {
                      // Margen calculado sobre el precio de venta real (con descuento aplicado, si corresponde)
                      const sellingPrice = discountPreview ? discountPreview.finalPrice : formData.base_price;
                      if (!(sellingPrice > 0)) return null;
                      return (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white border border-amber-200 rounded px-2 py-1.5">
                            <span className="text-amber-600 block">Utilidad por unidad</span>
                            <span className="font-bold text-amber-900">
                              {formatCurrency(sellingPrice - formData.cost_price!)}
                            </span>
                          </div>
                          <div className="bg-white border border-amber-200 rounded px-2 py-1.5">
                            <span className="text-amber-600 block">Margen</span>
                            <span className="font-bold text-amber-900">
                              {(((sellingPrice - formData.cost_price!) / sellingPrice) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ===== SECCIÓN DE TAGS/ATRIBUTOS ===== */}
              {formData.category && availableTags.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Tag size={16} />
                    Atributos del Producto
                  </h4>

                  {Object.entries(tagsByGroup).map(([group, tags]) => (
                    <div key={group}>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                        {tagGroupLabels[group] || group}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              selectedTagIds.includes(tag.id)
                                ? 'bg-black text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-300 hover:border-black hover:shadow-sm'
                            }`}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {loadingTags && (
                    <p className="text-xs text-gray-400">Cargando atributos...</p>
                  )}
                </div>
              )}

              {/* ===== GUÍA DE TALLAS ===== */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Ruler size={16} />
                  Guía de Tallas
                </h4>
                <p className="text-xs text-gray-500">
                  Selecciona qué guía de tallas se mostrará en la página de este producto.
                  Si no se selecciona ninguna, se usará la guía del material asignado.
                </p>
                <select
                  value={selectedSizeGuideId}
                  onChange={(e) => setSelectedSizeGuideId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white"
                >
                  <option value="">— Sin guía específica (usar por material)</option>
                  {sizeGuides.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.material}
                    </option>
                  ))}
                </select>
              </div>

              {/* Imágenes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imágenes del Producto (máx. 5)
                </label>
                
                {images.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg">
                    <ImageIcon className="w-10 h-10 mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700 mb-1">No hay imágenes</p>
                    <label className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                      Click para subir imágenes
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Grid de imágenes - Más compacto */}
                    <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black text-white text-xs rounded">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Botón para agregar más imágenes */}
                      {images.length < 5 && (
                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
                          <p className="text-xs font-medium text-gray-700 text-center px-1">Agregar</p>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  La primera imagen será la imagen principal del producto
                </p>
              </div>
            </div>

            {/* Columna Derecha - Tallas y Stock */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tallas y Stock
                  {formData.category && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({formData.category === 'Pantalones' || formData.category === 'Bermudas' || formData.category === 'Calzado' 
                        ? 'Tallas numéricas' 
                        : formData.category === 'Accesorios' || formData.category === 'Gorras'
                          ? 'Talla única'
                          : 'Tallas de ropa'})
                    </span>
                  )}
                </h3>
                
                {/* Tallas Agregadas */}
                <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-2">
                  {sizesWithStock.map((sizeData) => (
                    <div key={sizeData.size} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-black text-white font-bold rounded-lg text-sm">
                          {sizeData.size}
                        </span>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Stock
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateSizeStock(sizeData.size, sizeData.stock - 1)}
                              className="p-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                              disabled={sizeData.stock <= 0}
                            >
                              <Minus size={14} />
                            </button>
                            
                            <input
                              type="number"
                              min="0"
                              value={sizeData.stock || ''}
                              onChange={(e) => updateSizeStock(sizeData.size, e.target.value === '' ? 0 : parseInt(e.target.value))}
                              className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-sm"
                            />
                            
                            <button
                              type="button"
                              onClick={() => updateSizeStock(sizeData.size, sizeData.stock + 1)}
                              className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Precio especial (Bs.)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={sizeData.priceOverride ?? ''}
                            onChange={(e) => updateSizePriceOverride(sizeData.size, e.target.value === '' ? null : parseFloat(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-sm"
                            placeholder="Usar base"
                          />
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
                      <p className="text-sm">
                        {formData.category 
                          ? 'Agrega tallas disponibles abajo' 
                          : 'Selecciona una categoría primero'}
                      </p>
                    </div>
                  )}
                </div>

                {errors.sizes && (
                  <p className="text-sm text-red-500 mb-3">{errors.sizes}</p>
                )}

                {/* Agregar Tallas */}
                {formData.category && availableSizesForCategory.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agregar Tallas
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {availableSizesForCategory.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => addSize(size)}
                          className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-black transition-all font-medium text-sm"
                        >
                          {size}
                        </button>
                      ))}
                    </div>

                    {/* Add all sizes shortcut */}
                    {availableSizesForCategory.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          availableSizesForCategory.forEach(size => {
                            if (!sizesWithStock.some(s => s.size === size)) {
                              setSizesWithStock(prev => [...prev, { size, stock: 0, priceOverride: null }]);
                            }
                          });
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Agregar todas las tallas
                      </button>
                    )}
                  </div>
                )}

                {!formData.category && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Selecciona una categoría para ver las tallas disponibles
                    </p>
                  </div>
                )}

                {/* Info */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tips:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1 list-disc list-inside">
                    <li>El stock se configura para la sucursal actual ({activeBranch?.name || 'seleccionada'}).</li>
                    <li>"Precio especial" permite un precio distinto por talla (deja vacío para usar el precio base).</li>
                    <li>Puedes ajustar stock después desde el módulo de Stock.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          </div>
        </form>

        {/* Botones - Fijos al fondo */}
        <div className="flex gap-3 justify-end p-4 sm:p-6 border-t bg-white flex-shrink-0">
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
            form="product-form"
            loading={loading}
            disabled={loading}
          >
            {product ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </div>
      </div>
    </div>
  );
}
