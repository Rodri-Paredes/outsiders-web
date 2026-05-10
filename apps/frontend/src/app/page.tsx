import { HeroSection } from '@/components/home/HeroSection';
import { NewIn } from '@/components/home/NewIn';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { HomeSections } from '@/components/home/HomeSections';
import { cmsService } from '@/services/cms.service';

export const dynamic = 'force-dynamic'; // SSR dinámico - evita el bug 304 de Netlify con ISR

export default async function HomePage() {
  const [heroData, newInData, sectionsData, categoriesData] = await Promise.all([
    cmsService.getConfig('home_hero'),
    cmsService.getConfig('new_in'),
    cmsService.getConfig('home_sections'),
    cmsService.getConfig('home_categories')
  ]);

  return (
    <main>
      <HeroSection content={heroData} />
      {newInData && <NewIn config={newInData} />}
      {sectionsData && <HomeSections sections={sectionsData} />}
      {categoriesData && <CategoryGrid categories={categoriesData} />}
    </main>
  );
}
