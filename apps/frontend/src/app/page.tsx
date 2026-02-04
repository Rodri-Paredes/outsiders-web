import { HeroSection } from '@/components/home/HeroSection';
// import { FeaturedDrops } from '@/components/home/FeaturedDrops';
import { FeaturedBanner } from '@/components/home/FeaturedBanner';
import { NewArrivals } from '@/components/home/NewArrivals';
// import { Newsletter } from '@/components/home/Newsletter';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedBanner />
      <NewArrivals />
      {/* <Newsletter /> */}
    </>
  );
}
