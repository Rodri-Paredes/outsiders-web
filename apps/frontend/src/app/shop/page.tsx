'use client';

import { useEffect, useState, Suspense, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { productsService } from '@/services/products.service';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/lib/database.types';
import toast from 'react-hot-toast';
import { Search, Filter, X, Check } from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';

// Inner component handling the logic
function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  // Initialize state directly from URL params
  const initialCat = searchParams.get('category') || 'all';
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    // Map child categories to parent groups on initial load
    const childToParent: Record<string, string> = { 'Hoodies': 'Sudaderas', 'Quarter Zip': 'Sudaderas', 'Jeans': 'Pantalones', 'Jogger': 'Pantalones' };
    return childToParent[initialCat] || initialCat;
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.get('tag') ? [searchParams.get('tag') as string] : []);
  const [showOnlySale, setShowOnlySale] = useState(searchParams.get('sale') === 'true');
  
  const { selectedBranch } = useBranch();
  const [mounted, setMounted] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(() => {
    const childCats = ['Hoodies', 'Quarter Zip', 'Jeans', 'Jogger'];
    return childCats.includes(initialCat) ? initialCat : '';
  });

  // Categories shown in the filter bar (parent groups, not individual DB categories)
  const categories = ['all', 'Poleras', 'Soleras', 'Sudaderas', 'Pantalones', 'Bermudas', 'Accesorios', 'Otros'];

  // Group categories that expand into sub-categories
  const CATEGORY_GROUPS: Record<string, string[]> = {
    'Sudaderas': ['Hoodies', 'Quarter Zip'],
    'Pantalones': ['Jeans', 'Jogger'],
  };

  useEffect(() => {
    setMounted(true);
    // Hydrate cart store from localStorage
    useCartStore.persist.rehydrate();
  }, []);

  // Reverse lookup: DB category → parent group name
  const CHILD_TO_PARENT: Record<string, string> = {};
  Object.entries(CATEGORY_GROUPS).forEach(([parent, children]) => {
    children.forEach((child) => { CHILD_TO_PARENT[child] = parent; });
  });

  // Effect to handle URL param changes (e.g. from Link clicks while routing)
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    const tag = searchParams.get('tag');
    const saleParam = searchParams.get('sale');

    if (q !== null) setSearchTerm(q);
    if (cat !== null) {
      // If URL has a child category (e.g. Hoodies), select the parent group + sub-category
      if (CHILD_TO_PARENT[cat]) {
        setSelectedCategory(CHILD_TO_PARENT[cat]);
        setSelectedSubCategory(cat);
      } else {
        setSelectedCategory(cat);
        setSelectedSubCategory('');
      }
    }
    
    setShowOnlySale(saleParam === 'true');
    
    // Si viene un tag en la URL, lo seleccionamos, pero solo si no está ya
    if (tag) {
      setSelectedTags((prev) => prev.includes(tag) ? prev : [tag]);
    }
  }, [searchParams]);

  // Reset tags and sub-category when category changes manually
  const prevCategoryRef = useRef<string>(selectedCategory);
  useEffect(() => {
    if (prevCategoryRef.current !== selectedCategory && !searchParams.get('tag')) {
      setSelectedTags([]);
      setSelectedSubCategory('');
    }
    prevCategoryRef.current = selectedCategory;
  }, [selectedCategory, searchParams]);

  // Reload products when branch changes (or on first mount)
  useEffect(() => {
    if (mounted) {
      loadProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch, mounted]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const branchId = selectedBranch?.id;
      const data = await productsService.getProducts(branchId);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // Derive dynamic filters from products available in the selected category
  const availableTagsMap = useMemo(() => {
    const map = new Map<string, { name: string; group: string }>();
    // Determine which DB categories to match for tag extraction
    const dbCategories = CATEGORY_GROUPS[selectedCategory] || (selectedCategory !== 'all' ? [selectedCategory] : []);
    const targetCategory = selectedSubCategory || null;

    products.forEach((p) => {
      if (selectedCategory === 'all') return;
      // If there's a sub-category selected, only show tags for that sub-cat
      const matches = targetCategory
        ? p.category === targetCategory
        : dbCategories.length > 0
          ? dbCategories.includes(p.category || '')
          : p.category === selectedCategory;
      if (matches && p.tags) {
        p.tags.forEach((assignment) => {
          const t = assignment.tag;
          if (t) {
            map.set(t.name, { name: t.name, group: t.tag_group || 'Atributos' });
          }
        });
      }
    });
    return Array.from(map.values());
  }, [products, selectedCategory, selectedSubCategory]);

  // Standard tag filters that should always show for certain categories
  const STATIC_FILTERS: Record<string, Record<string, string[]>> = {
    'Poleras': { 'gramaje': ['20/1', 'Alto gramaje'], 'tipo': ['Básica', 'Estampada'] },
    'Soleras': { 'tipo': ['Básica', 'Estampada'] },
    'Hoodies': { 'gramaje': ['20/1', 'Alto gramaje'], 'tipo': ['Básica', 'Estampada'] },
    'Quarter Zip': { 'gramaje': ['20/1', 'Alto gramaje'], 'tipo': ['Básica', 'Estampada'] },
  };

  const groupedTags = useMemo(() => {
    // Start with dynamic tags from products
    const groups: Record<string, string[]> = {};
    availableTagsMap.forEach((t) => {
      if (!groups[t.group]) groups[t.group] = [];
      if (!groups[t.group].includes(t.name)) groups[t.group].push(t.name);
    });

    // Merge static filters for the active category/sub-category
    const activeCats = selectedSubCategory
      ? [selectedSubCategory]
      : CATEGORY_GROUPS[selectedCategory]
        ? CATEGORY_GROUPS[selectedCategory]
        : selectedCategory !== 'all' ? [selectedCategory] : [];

    activeCats.forEach((cat) => {
      const statics = STATIC_FILTERS[cat];
      if (statics) {
        Object.entries(statics).forEach(([group, tags]) => {
          if (!groups[group]) groups[group] = [];
          tags.forEach((tag) => {
            if (!groups[group].includes(tag)) groups[group].push(tag);
          });
        });
      }
    });

    // Sort arrays
    Object.keys(groups).forEach(key => {
      groups[key].sort();
    });
    
    return groups;
  }, [availableTagsMap, selectedCategory, selectedSubCategory]);

  // Explicit display order for categories (used when multiple categories are visible at once)
  const CATEGORY_DISPLAY_ORDER: Record<string, number> = {
    'Poleras': 0,
    'Soleras': 1,
    'Hoodies': 2,
    'Quarter Zip': 3,
    'Jeans': 4,
    'Jogger': 5,
    'Bermudas': 6,
    'Accesorios': 7,
    'Otros': 8,
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Category matching: handle groups (Sudaderas→Hoodies/Quarter Zip, Pantalones→Jeans/Jogger)
    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (CATEGORY_GROUPS[selectedCategory]) {
      // It's a parent group — if sub-category is selected, match only that
      if (selectedSubCategory) {
        matchesCategory = product.category === selectedSubCategory;
      } else {
        matchesCategory = CATEGORY_GROUPS[selectedCategory].includes(product.category || '');
      }
    } else {
      matchesCategory = product.category === selectedCategory;
    }

    const matchesSale = !showOnlySale || (product.original_price && product.discount_percentage && product.discount_percentage > 0);
    
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tagName) => 
        product.tags?.some((t) => t.tag?.name === tagName)
      );

    return matchesSearch && matchesCategory && matchesTags && matchesSale;
  }).sort((a, b) => {
    const showingMultipleCategories = selectedCategory === 'all' || (!!CATEGORY_GROUPS[selectedCategory] && !selectedSubCategory);
    // 1. When multiple categories are visible, group by category FIRST
    //    so all Hoodies appear before all Quarter Zip regardless of sort_order
    if (showingMultipleCategories) {
      const aCatOrder = CATEGORY_DISPLAY_ORDER[a.category || ''] ?? 99;
      const bCatOrder = CATEGORY_DISPLAY_ORDER[b.category || ''] ?? 99;
      if (aCatOrder !== bCatOrder) return aCatOrder - bCatOrder;
    }
    // 2. Within the same category, respect sort_order (nulls go last)
    const aOrder = a.sort_order ?? Infinity;
    const bOrder = b.sort_order ?? Infinity;
    if (aOrder !== bOrder) return aOrder - bOrder;
    // 3. Then newest first
    const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bDate - aDate;
  });

  const toggleTag = (group: string, tagName: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((t) => t !== tagName);
      }
      const tagsInThisGroup = groupedTags[group] || [];
      const prevWithoutSameGroup = prev.filter((t) => !tagsInThisGroup.includes(t));
      return [...prevWithoutSameGroup, tagName];
    });
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  // Prevent hydration errors by rendering only on client
  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-bg pt-32 pb-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-light text-white tracking-tighter mb-6">Shop</h1>
            <div className="h-px w-24 bg-white/30 mx-auto mb-6" />
            <p className="text-gray-light text-xs tracking-[0.3em] uppercase">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  const hasAnyFilters = Object.keys(groupedTags).length > 0;

  return (
    <div className="min-h-screen bg-white pt-36 lg:pt-40 pb-20">
      {/* Mobile Filters Drawer - Keeps Mobile tidy */}
      <div 
        className={`fixed inset-0 z-[100] transition-opacity duration-300 lg:hidden ${
          showMobileFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
        <div 
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${
            showMobileFilters ? 'translate-x-0' : 'translate-x-full'
          } flex flex-col`}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-sm font-bold uppercase tracking-widest text-black">Filtros - {selectedCategory !== 'all' ? selectedCategory : 'Tienda'}</h2>
            <button onClick={() => setShowMobileFilters(false)} className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {hasAnyFilters ? (
              Object.entries(groupedTags).map(([group, tags]) => (
                <div key={`mobile-group-${group}`}>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">{group}</h4>
                  <div className="space-y-3">
                    {tags.map((tag) => (
                      <label key={`mobile-${tag}`} onClick={() => toggleTag(group, tag)} className="flex items-center gap-4 cursor-pointer group">
                        <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                          selectedTags.includes(tag) ? 'bg-black border-black text-white' : 'border-gray-300 group-hover:border-black text-transparent'
                        }`}>
                          <Check size={14} strokeWidth={3} className="shrink-0" />
                        </div>
                        <span className={`text-sm tracking-wide ${selectedTags.includes(tag) ? 'text-black font-medium' : 'text-gray-600'}`}>
                          {tag}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Entra a una categoría principal para ver sus filtros aplicables.</p>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-100 space-y-3 bg-gray-50/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{filteredProducts.length} Productos</span>
              {selectedTags.length > 0 && (
                <button onClick={clearFilters} className="text-xs font-medium text-gray-500 underline underline-offset-4 hover:text-black">
                  Limpiar Filtros
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowMobileFilters(false)}
              className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors"
            >
              Ver Resultados
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom">
        <div className="flex flex-col gap-6">
          
          {/* Top Horizontal Bar (Categories & Search & Mobile Toggle) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-5 w-full relative z-10">
            {/* Primary Categories */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full relative items-end">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-[11px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'text-black border-b-2 border-black'
                        : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    {category === 'all' ? 'Todos' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Search + Mobile Filters Button */}
            <div className="w-full md:w-64 flex-shrink-0 flex gap-4 items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-0 pr-8 py-2 bg-transparent border-b border-gray-200 text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={16} strokeWidth={2} />
                </div>
              </div>
              
              {/* Mobile filter toggle */}
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors hover:bg-gray-100"
              >
                <Filter size={14} />
                <span>Filtrar</span>
                {selectedTags.length > 0 && (
                  <span className="w-4 h-4 flex items-center justify-center bg-black text-white text-[9px] rounded-full ml-1">
                    {selectedTags.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Sub-categories for group categories (Sudaderas → Hoodies/Quarter Zip, Pantalones → Jeans/Jogger) */}
          {CATEGORY_GROUPS[selectedCategory] && (
            <div className="flex items-center gap-3 pt-2 pb-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <button
                onClick={() => { setSelectedSubCategory(''); setSelectedTags([]); }}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                  !selectedSubCategory
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-400 hover:text-black'
                }`}
              >
                Todos
              </button>
              {CATEGORY_GROUPS[selectedCategory].map((sub) => (
                <button
                  key={sub}
                  onClick={() => { setSelectedSubCategory(sub === selectedSubCategory ? '' : sub); setSelectedTags([]); }}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                    selectedSubCategory === sub
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-400 hover:text-black'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Sub-Filters: Desktop Only Inline display */}
          {/* We only show subfilters if a specific category is chosen and it has unique tags */}
          {selectedCategory !== 'all' && hasAnyFilters && (
            <div className="hidden lg:flex flex-wrap items-center gap-x-8 gap-y-4 pt-1 pb-6 w-full animate-in fade-in slide-in-from-top-2 duration-300">
              {Object.entries(groupedTags).map(([group, tags]) => (
                <div key={`inline-group-${group}`} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{group}:</span>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const isActive = selectedTags.includes(tag);
                      return (
                        <button
                          key={`inline-${tag}`}
                          onClick={() => toggleTag(group, tag)}
                          className={`px-1 py-1 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 border-b-2 ${
                            isActive
                              ? 'border-black text-black'
                              : 'border-transparent text-gray-400 hover:text-black hover:border-gray-300'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {selectedTags.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black border-b border-transparent hover:border-black transition-colors"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex flex-col w-full pt-4 md:pt-0">
            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-6 md:gap-y-12">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-[4/5] bg-gray-50 animate-pulse border border-gray-100" />
                    <div className="h-4 bg-gray-100 animate-pulse w-2/3" />
                    <div className="h-4 bg-gray-100 animate-pulse w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-24 bg-gray-50/50 border border-gray-50 mt-4 rounded-xl">
                <p className="text-gray-500 text-lg mb-2">No se encontraron productos</p>
                <p className="text-gray-400 text-sm">Intenta limpiando los filtros o usando otras palabras clave.</p>
                {selectedTags.length > 0 && (
                  <button onClick={clearFilters} className="mt-8 px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors">
                    Limpiar Filtros
                  </button>
                )}
              </div>
            )}

            {/* Products List */}
            {!loading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-6 md:gap-y-12 pb-12">
                {filteredProducts.map((product) => {
                  const hasStock = (product as any).hasStock;
                  const slug = `${product.id}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

                  return (
                    <Link
                      key={product.id}
                      href={`/producto/${slug}`}
                      className="group cursor-pointer block"
                      prefetch={true}
                    >
                      {/* Image */}
                      <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden mb-4 border border-gray-100 flex items-center justify-center">
                        <ProductImageCarousel
                          images={(product as any).images || (product.image_url ? [product.image_url] : [])}
                          alt={product.name}
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />

                        {/* Badges Container */}
                        <div className="absolute top-0 left-0 z-10 flex flex-col items-start gap-0.5">
                          {(product as any).is_new_in && (
                            <span className="inline-block px-2 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest">
                              NEW IN
                            </span>
                          )}
                        </div>
                        <div className="absolute top-0 right-0 z-10 flex flex-col items-end">
                          {/* Stock Badge */}
                          {!hasStock && (
                            <span className="inline-block px-2 py-1.5 md:px-3 md:py-1.5 bg-black text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-center shadow-sm">
                              SOLD OUT
                            </span>
                          )}
                          {/* Web Only Badge */}
                          {hasStock && (product as any).web_only && (
                            <span className="inline-block px-2 py-1.5 md:px-3 md:py-1.5 bg-blue-600 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-center shadow-sm">
                              SOLO WEB
                            </span>
                          )}
                        </div>

                        {/* Quick View Overlay (Desktop only) */}
                        {hasStock && (
                          <div className="hidden md:block absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
                        )}

                      </div>

                      {/* Info Container */}
                      <div className="flex flex-col w-full px-1 mt-2 text-left">
                        {/* Product Name (Top) */}
                        <h3 className="text-[11px] text-black mb-0.5 capitalize tracking-tight font-medium">
                          {product.name.toLowerCase()}
                        </h3>

                        {/* Price and Sizes (Bottom Row) */}
                        <div className="flex justify-between items-center w-full mt-0.5">
                          {/* Left Side: Price */}
                          <div className="flex items-center gap-2">
                            {product.original_price && product.discount_percentage && product.discount_percentage > 0 ? (
                              <>
                                <span className="text-[11px] text-gray-400 line-through">
                                  Bs. {Number(product.original_price).toFixed(2)}
                                </span>
                                <span className="text-[11px] text-gray-800 font-medium tracking-wide">
                                  Bs. {(product.original_price * (1 - product.discount_percentage / 100)).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-[11px] text-gray-800 font-medium tracking-wide">
                                Bs. {Number(product.price).toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Right Side: Sizes */}
                          <div className="flex items-center gap-1.5">
                            {( ((product as any).variants && (product as any).variants.length > 0)
                              ? (Array.from(new Set((product as any).variants.map((v: any) => v.size as string))) as string[])
                              : ['XS', 'S', 'M', 'L', 'XL', 'XXL']
                            ).sort((a, b) => ['XS', 'S', 'M', 'L', 'XL', 'XXL'].indexOf(a as string) - ['XS', 'S', 'M', 'L', 'XL', 'XXL'].indexOf(b as string)).map((size) => {
                              const hasCurrentStock = (product as any).variants 
                                ? (product as any).variants.some((v: any) => v.size === size && (v.stock?.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0) || 0) > 0) 
                                : true;
                              return (
                                <span 
                                  key={size} 
                                  className={`text-[9px] uppercase tracking-wider transition-colors inline-block ${hasCurrentStock ? 'text-black font-semibold' : 'text-gray-300 font-medium'}`}
                                >
                                  {size}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapping ShopPage in Suspense since it uses useSearchParams
export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white pt-32 pb-20 flex items-center justify-center">
        <p className="text-gray-400 text-xs tracking-[0.3em] uppercase animate-pulse">Cargando Tienda...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
