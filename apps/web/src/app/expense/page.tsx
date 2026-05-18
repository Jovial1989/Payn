import { ProductCategoryView } from "@/components/product-category-view";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";

export default async function ExpensePage() {
  const allOffers = await listMarketplaceOffers();
  return <ProductCategoryView category="expense" allOffers={allOffers} />;
}
