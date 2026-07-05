// P0.5 — a market name is a proper noun ("Germany", "All Europe") and must
// stay title-cased in every heading and sentence. Copy interpolated
// marketLabel.toLowerCase(), producing "…for all europe" / "…in germany".
// marketLabel is already title-cased upstream (getCountryLabel); this
// normalises defensively and gives every call site one helper to reach for.
export function formatMarketName(label: string): string {
  return label
    .trim()
    .split(/\s+/)
    .map((word) => (word.length === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join(" ");
}
