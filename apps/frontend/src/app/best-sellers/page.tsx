import { BestSellers } from '@/components/home/BestSellers';
import { cmsService } from '@/services/cms.service';
import { getProductsByIds, getRecentProducts } from '@/services/homeCatalog.server';

export const revalidate = 60;

export default async function BestSellersPage() {
  const bestSellersData = await cmsService.getConfig('best_sellers');
  const products = bestSellersData?.product_ids?.length
    ? await getProductsByIds(bestSellersData.product_ids)
    : await getRecentProducts(5);

  return (
    <main className="pt-24 min-h-screen bg-black">
      <BestSellers config={bestSellersData} products={products} />
    </main>
  );
}
