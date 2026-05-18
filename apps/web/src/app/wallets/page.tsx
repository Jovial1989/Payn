import { ProductCategoryView } from "@/components/product-category-view";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";

export default async function WalletsPage() {
  const allOffers = await listMarketplaceOffers();
  return <ProductCategoryView category="wallets" allOffers={allOffers} />;
}
