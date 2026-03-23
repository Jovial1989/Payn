import { SectionContainer } from "@/components/section-container";
import { SiteShell } from "@/components/site-shell";

export default async function CountryCategoryPage({
  params,
}: {
  params: Promise<{ country: string; category: string }>;
}) {
  const { country, category } = await params;

  return (
    <SiteShell
      eyebrow="Country-aware marketplace"
      title={`Localized ${category} discovery for ${country.toUpperCase()}.`}
      description="Country-aware routes are scaffolded now so compliance notes, metadata, and local market variations can be added without rewriting route architecture."
      heroTags={["Localized catalog", "Compliance notes", "Market-specific routing"]}
    >
      <SectionContainer className="text-sm leading-7 text-muted">
        This route is reserved for country-specific catalog retrieval, content blocks, and future
        localization.
      </SectionContainer>
    </SiteShell>
  );
}
