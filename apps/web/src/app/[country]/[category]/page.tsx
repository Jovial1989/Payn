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
    >
      <section className="rounded-3xl border border-white/10 bg-panel p-6 text-sm leading-6 text-muted">
        This route is reserved for country-specific catalog retrieval, content blocks, and future
        localization.
      </section>
    </SiteShell>
  );
}

