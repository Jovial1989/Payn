import { ProductCategoryView } from "@/components/product-category-view";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";

export default async function TravelPage() {
  const allOffers = await listMarketplaceOffers();
  return <ProductCategoryView category="travel" allOffers={allOffers} />;
}
