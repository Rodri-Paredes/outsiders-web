// SOLO SERVIDOR — no importar desde un componente 'use client'.
//
// Antes, NewIn/HomeSections/BestSellers hacían su propio fetch a Supabase
// desde el navegador de cada visitante, sin ningún tipo de caché. Estas
// funciones corren en el servidor (Server Components) y envuelven las
// queries en `unstable_cache`: sin importar cuántas visitas reciba el sitio,
// Supabase se consulta como mucho una vez cada 60s por cada combinación de
// argumentos — el resto de las visitas se sirve desde la caché de datos de
// Next.js, sin tocar Supabase en absoluto.
import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/database.types';

const CATALOG_SELECT = `
  id, name, description, image_url, images, price, original_price, mid_price,
  discount_percentage, markdown_percentage, category, is_new_in, web_only,
  created_at,
  variants:product_variants(
    size,
    stock(quantity, branch_id)
  )
`;

// El stock se suma de TODAS las sucursales acá — el servidor no sabe qué
// sucursal tiene seleccionada cada visitante (se guarda en localStorage, no
// en una cookie). Es un trade-off consciente: el badge "Sold Out"/"Solo Web"
// de las secciones del home puede no reflejar el stock exacto de una
// sucursal puntual, pero el control real (que sí es 100% preciso por
// sucursal) sigue pasando en la página del producto y al agregar al carrito.
function mapCatalogProduct(p: any): Product {
  let parsedImages: string[] = [];
  if (Array.isArray(p.images)) {
    parsedImages = p.images;
  } else if (typeof p.images === 'string') {
    try {
      parsedImages = JSON.parse(p.images);
    } catch {
      parsedImages = p.images.replace(/^{|}$/g, '').split(',').map((u: string) => u.trim().replace(/^"|"$/g, '')).filter(Boolean);
    }
  }
  if (parsedImages.length === 0 && p.image_url) parsedImages = [p.image_url];

  let totalStock = 0;
  (p.variants || []).forEach((v: any) => {
    (v.stock || []).forEach((s: any) => {
      totalStock += s.quantity || 0;
    });
  });

  return { ...p, images: parsedImages, stock: totalStock, hasStock: totalStock > 0 } as Product;
}

async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) return [];

  const { data, error } = await supabase
    .from('products')
    .select(CATALOG_SELECT)
    .in('id', ids)
    .eq('is_visible', true)
    .eq('visible_on_web', true);

  if (error || !data) {
    console.error('[homeCatalog] Error fetching products by ids:', error);
    return [];
  }

  // Mantiene el orden curado desde el CMS (product_ids), no el orden de la DB.
  return ids
    .map((id) => data.find((p: any) => p.id === id))
    .filter(Boolean)
    .map(mapCatalogProduct);
}

async function fetchRecentProducts(limit: number): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(CATALOG_SELECT)
    .eq('is_visible', true)
    .eq('visible_on_web', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error('[homeCatalog] Error fetching recent products:', error);
    return [];
  }

  return data.map(mapCatalogProduct);
}

async function fetchProductsByTag(tagName: string, limit: number): Promise<Product[]> {
  const { data: tagData } = await supabase
    .from('product_tags')
    .select('id')
    .eq('name', tagName)
    .single();

  if (!tagData) return [];

  const { data: assignments } = await supabase
    .from('product_tag_assignments')
    .select('product_id')
    .eq('tag_id', tagData.id)
    .limit(limit);

  const ids = (assignments || []).map((a: any) => a.product_id);
  return fetchProductsByIds(ids);
}

export const getProductsByIds = unstable_cache(fetchProductsByIds, ['home-products-by-ids'], {
  revalidate: 60,
  tags: ['products'],
});

export const getRecentProducts = unstable_cache(fetchRecentProducts, ['home-recent-products'], {
  revalidate: 60,
  tags: ['products'],
});

export const getProductsByTag = unstable_cache(fetchProductsByTag, ['home-products-by-tag'], {
  revalidate: 60,
  tags: ['products'],
});
