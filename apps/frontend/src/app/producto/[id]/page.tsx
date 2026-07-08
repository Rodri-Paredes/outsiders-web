import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productsService } from '@/services/products.service';
import { extractProductId } from '@/utils/productSlug';
import { getWeservUrl } from '@/utils/weserv';
import { formatCurrency } from '@/utils/format';
import ProductPageClient from './ProductPageClient';

interface ProductRouteParams {
  params: { id: string };
}

// Sin esto, Next.js no tenía ninguna directiva de cache explícita para esta
// ruta y terminaba cacheando el render (con los datos de Supabase de ese
// momento) de forma efectivamente indefinida desde la primera visita — un
// producto con precio o descuento actualizado seguía mostrando el valor
// viejo para siempre, sin importar los cambios hechos después en el ERP.
// Mismo patrón ya probado en producción en /best-sellers.
export const revalidate = 60;

// `cache()` deduplica el fetch entre generateMetadata() y el componente de
// página: Next.js invoca ambos para la misma request, y sin esto se pegaría
// dos veces a Supabase por cada visita.
const getProduct = cache(async (productId: string) => {
  return productsService.getById(productId);
});

export async function generateMetadata({ params }: ProductRouteParams): Promise<Metadata> {
  const product = await getProduct(extractProductId(params.id));

  // Producto inexistente o no visible en la web: metadata genérica, sin
  // datos del producto. La página en sí devuelve 404 (ver default export).
  if (!product || (product as any).visible_on_web === false) {
    return { title: 'Producto no encontrado | OUTSIDERS' };
  }

  const images = (product as any).images?.length
    ? (product as any).images
    : [product.image_url].filter(Boolean);

  // Recorte cuadrado 1080x1080: es el ratio nativo de Instagram y funciona
  // razonablemente bien con fotos de producto en formato retrato, evitando
  // el crop agresivo de un 1.91:1 horizontal sobre una foto de una persona.
  const ogImage = images[0]
    ? getWeservUrl(images[0], { w: 1080, h: 1080, fit: 'cover', output: 'jpg', q: 85 })
    : undefined;

  const description = product.description
    ? product.description.slice(0, 200)
    : `${product.name} — ${formatCurrency(product.price)} · OUTSIDERS Urban Streetwear`;

  const title = `${product.name} | OUTSIDERS`;
  const url = `/producto/${params.id}`;

  return {
    title,
    description,
    openGraph: {
      title: product.name,
      description,
      url,
      type: 'website',
      images: ogImage ? [{ url: ogImage, width: 1080, height: 1080, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    other: {
      'product:price:amount': String(product.price),
      'product:price:currency': 'BOB',
    },
  };
}

export default async function ProductPage({ params }: ProductRouteParams) {
  const product = await getProduct(extractProductId(params.id));

  // Refuerza a nivel de página lo que ya bloquea RLS: un producto marcado
  // como visible_on_web = false no debe ser accesible por su URL pública,
  // ni siquiera si alguien la adivina o la comparte.
  if (!product || (product as any).visible_on_web === false) {
    notFound();
  }

  // El servidor ya trajo el producto completo (arriba, para metadata/notFound).
  // Se lo pasamos al cliente como dato inicial en vez de dejar que lo vuelva a
  // pedir entero al montar — antes se descargaba el mismo producto dos veces
  // por visita (una acá, otra en el cliente).
  return <ProductPageClient slug={params.id} initialProduct={product} />;
}
