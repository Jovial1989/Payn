import { ProductCategoryView } from "@/components/product-category-view";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";

export default async function BnplPage() {
  const allOffers = await listMarketplaceOffers();
  return <ProductCategoryView category="bnpl" allOffers={allOffers} />;
}
