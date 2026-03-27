import { HeroSection } from '@/components/home/HeroSection';
import { NewArrivals } from '@/components/home/NewArrivals';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { supabase } from '@/lib/supabase';
// import { FeaturedBanner } from '@/components/home/FeaturedBanner';

export const revalidate = 60; // ISR cache de 60 segundos

export default async function HomePage() {
  const { data: heroData } = await supabase
    .from('site_content')
    .select('content')
    .eq('section_key', 'home_hero')
    .single();

  return (
    <>
      <HeroSection content={heroData?.content} />
      <NewArrivals />
      <CategoryGrid />
    </>
  );
}
