import { ProductCategoryView } from "@/components/product-category-view";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";

export default async function BudgetingPage() {
  const allOffers = await listMarketplaceOffers();
  return <ProductCategoryView category="budgeting" allOffers={allOffers} />;
}
