export function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the|bank|plc|sa|ag|gmbh|ltd|limited)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value: string) {
  return normalizeName(value).replace(/\s+/g, "-").replace(/^-|-$/g, "");
}

export function stableFingerprint(providerName: string, productName: string, country: string) {
  return `${slugify(providerName)}:${slugify(productName)}:${country.toUpperCase()}`;
}

export function similarityScore(left: string, right: string) {
  const a = new Set(normalizeName(left).split(" ").filter(Boolean));
  const b = new Set(normalizeName(right).split(" ").filter(Boolean));
  if (a.size === 0 || b.size === 0) return 0;
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / Math.max(a.size, b.size);
}

export function parseNumber(value: string | undefined | null) {
  if (!value) return null;
  const match = value.replace(/\s/g, "").match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return null;
  return Number(match[0].replace(",", "."));
}
