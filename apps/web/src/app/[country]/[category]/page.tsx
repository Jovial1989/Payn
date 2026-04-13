import { notFound } from "next/navigation";
import { ProductCategoryView } from "@/components/product-category-view";
import { ProductShell } from "@/components/product-shell";
import { isMarketplaceCategory, isSupportedMarket } from "@/lib/marketplace";

export default async function CountryCategoryPage({
  params,
}: {
  params: Promise<{ country: string; category: string }>;
}) {
  const { country, category } = await params;

  if (!isSupportedMarket(country) || !isMarketplaceCategory(category)) {
    notFound();
  }

  return (
    <ProductShell>
      <ProductCategoryView category={category} />
    </ProductShell>
  );
}
