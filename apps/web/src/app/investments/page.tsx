import type { Metadata } from "next";
import { ProductCategoryView } from "@/components/product-category-view";
import { getRequestPreferences } from "@/lib/request-preferences";
import { buildCategoryMetadata } from "@/lib/seo";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getRequestPreferences();
  return buildCategoryMetadata("investments", locale);
}

export default async function InvestmentsPage() {
  const allOffers = await listMarketplaceOffers();
  return <ProductCategoryView category="investments" allOffers={allOffers} />;
}
