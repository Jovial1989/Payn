import { ProductCategoryView } from "@/components/product-category-view";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";

export default async function SavingsPage() {
  const allOffers = await listMarketplaceOffers();
  return <ProductCategoryView category="savings" allOffers={allOffers} />;
}
