import type { Metadata } from "next";
import { ProductCategoryView } from "@/components/product-category-view";
import { getRequestPreferences } from "@/lib/request-preferences";
import { buildCategoryMetadata } from "@/lib/seo";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getRequestPreferences();
  return buildCategoryMetadata("payroll", locale);
}

export default async function PayrollPage() {
  const allOffers = await listMarketplaceOffers();
  return <ProductCategoryView category="payroll" allOffers={allOffers} />;
}
