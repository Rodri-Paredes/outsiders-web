import { HeroSection } from '@/components/home/HeroSection';
import { NewIn } from '@/components/home/NewIn';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { HomeSections } from '@/components/home/HomeSections';
import { cmsService, HomeSection } from '@/services/cms.service';
import { getProductsByIds, getRecentProducts, getProductsByTag } from '@/services/homeCatalog.server';
import { Product } from '@/lib/database.types';

export const dynamic = 'force-dynamic'; // SSR dinámico - evita el bug 304 de Netlify con ISR

export default async function HomePage() {
  const [heroData, newInData, sectionsData, categoriesData] = await Promise.all([
    cmsService.getConfig('home_hero'),
    cmsService.getConfig('new_in'),
    cmsService.getConfig('home_sections'),
    cmsService.getConfig('home_categories'),
  ]);

  // Los productos de cada sección se resuelven server-side, cacheados 60s
  // (ver homeCatalog.server.ts) — antes cada sección hacía su propio fetch
  // a Supabase desde el navegador de cada visitante, sin caché.
  const [newInProducts, sectionsWithProducts] = await Promise.all([
    newInData?.product_ids?.length
      ? getProductsByIds(newInData.product_ids)
      : newInData
        ? getRecentProducts(5)
        : Promise.resolve([]),
    Promise.all(
      ((sectionsData || []) as HomeSection[]).map(async (section) => {
        let products: Product[] = [];
        if (section.type === 'tag' && section.tag) {
          products = await getProductsByTag(section.tag, 10);
        } else if (section.type === 'products' && section.product_ids?.length) {
          products = await getProductsByIds(section.product_ids);
        }
        return { section, products };
      })
    ),
  ]);

  return (
    <main>
      <HeroSection content={heroData} />
      {newInData && <NewIn config={newInData} products={newInProducts} />}
      {sectionsData && <HomeSections sectionsWithProducts={sectionsWithProducts} />}
      {categoriesData && <CategoryGrid categories={categoriesData} />}
    </main>
  );
}
