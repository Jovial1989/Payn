export function FilterPanel({ category }: { category: string }) {
  return (
    <aside className="rounded-3xl border border-white/10 bg-panel p-6">
      <h2 className="text-lg font-semibold text-ink">Refine {category}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Filter schema, compliance disclosures, and dynamic facets will be loaded from backend-owned
        contracts rather than embedded in the client.
      </p>
    </aside>
  );
}

