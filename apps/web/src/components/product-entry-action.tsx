import clsx from "clsx";
import type { MarketplaceLocale } from "@payn/types";
import { getDictionary } from "@/lib/i18n";

export function getProductEntryActionLabel(locale: MarketplaceLocale) {
  return getDictionary(locale).home.openExplore;
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ProductEntryActionLabel({
  locale = "en",
  className,
  textClassName,
}: {
  locale?: MarketplaceLocale;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <SearchIcon className="shrink-0" />
      <span className={textClassName}>{getProductEntryActionLabel(locale)}</span>
    </span>
  );
}
