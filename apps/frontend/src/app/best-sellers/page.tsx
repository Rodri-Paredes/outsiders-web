import { BestSellers } from '@/components/home/BestSellers';
import { cmsService } from '@/services/cms.service';

export const revalidate = 60;

export default async function BestSellersPage() {
  const bestSellersData = await cmsService.getConfig('best_sellers');

  return (
    <main className="pt-24 min-h-screen bg-black">
      <BestSellers config={bestSellersData} />
    </main>
  );
}
