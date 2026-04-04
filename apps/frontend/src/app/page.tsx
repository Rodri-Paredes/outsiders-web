import { HeroSection } from '@/components/home/HeroSection';
import { BestSellers } from '@/components/home/BestSellers';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { HomeSections } from '@/components/home/HomeSections';
import { cmsService } from '@/services/cms.service';

export const revalidate = 60; // ISR cache de 60 segundos

export default async function HomePage() {
  const [heroData, bestSellersData, sectionsData, categoriesData] = await Promise.all([
    cmsService.getConfig('home_hero'),
    cmsService.getConfig('best_sellers'),
    cmsService.getConfig('home_sections'),
    cmsService.getConfig('home_categories')
  ]);

  return (
    <main>
      <HeroSection content={heroData} />
      {bestSellersData && <BestSellers config={bestSellersData} />}
      {categoriesData && <CategoryGrid categories={categoriesData} />}
      {sectionsData && <HomeSections sections={sectionsData} />}
    </main>
  );
}
