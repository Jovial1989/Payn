import type { MarketplaceLocale } from "@payn/types";
import { getDictionary } from "@/lib/i18n";

type TrustedProvider =
  | {
      label: string;
      kind: "asset";
      src: string;
      scale?: number;
      maxWidthClassName?: string;
      maxHeightClassName?: string;
    }
  | {
      label: string;
      kind: "wordmark";
      lines: string[];
      className?: string;
    };

const trustedProviders: TrustedProvider[] = [
  { label: "Revolut", kind: "asset", src: "/logos/revolut.svg", scale: 0.9, maxWidthClassName: "max-w-[44px]", maxHeightClassName: "max-h-[16px]" },
  { label: "Wise", kind: "asset", src: "/logos/wise.svg", scale: 0.94, maxWidthClassName: "max-w-[44px]", maxHeightClassName: "max-h-[18px]" },
  { label: "N26", kind: "asset", src: "/logos/n26.svg", scale: 0.92, maxWidthClassName: "max-w-[30px]", maxHeightClassName: "max-h-[16px]" },
  { label: "Klarna", kind: "asset", src: "/logos/klarna.svg", scale: 0.9, maxWidthClassName: "max-w-[52px]", maxHeightClassName: "max-h-[18px]" },
  { label: "Santander", kind: "asset", src: "/logos/santander-monochrome.svg", scale: 1, maxWidthClassName: "max-w-[54px]", maxHeightClassName: "max-h-[18px]" },
  { label: "BNP Paribas", kind: "asset", src: "/logos/bnp-paribas-monochrome.svg", scale: 1, maxWidthClassName: "max-w-[56px]", maxHeightClassName: "max-h-[18px]" },
  { label: "Allianz", kind: "wordmark", lines: ["Allianz"], className: "text-[10px] font-extrabold tracking-[-0.07em]" },
  { label: "Trade Republic", kind: "wordmark", lines: ["Trade", "Republic"], className: "text-[9px] font-extrabold leading-[0.95] tracking-[-0.05em]" },
  { label: "Coinbase", kind: "asset", src: "/logos/coinbase.svg", scale: 0.98, maxWidthClassName: "max-w-[22px]", maxHeightClassName: "max-h-[22px]" },
  { label: "eToro", kind: "wordmark", lines: ["eToro"], className: "text-[11px] font-extrabold tracking-[-0.07em]" },
  { label: "Payoneer", kind: "wordmark", lines: ["Payoneer"], className: "text-[9px] font-extrabold tracking-[-0.06em]" },
  { label: "Western Union", kind: "wordmark", lines: ["Western", "Union"], className: "text-[9px] font-extrabold leading-[0.95] tracking-[-0.04em]" },
];

const TRUST_STATS = [
  { value: "50+", label: "Providers compared" },
  { value: "120K+", label: "Users trust Payn" },
  { value: "40+", label: "Countries covered" },
  { value: "Free", label: "Always & forever" },
] as const;

function getEyebrow(locale: MarketplaceLocale) {
  switch (locale) {
    case "de": return "Führende Finanzanbieter im Vergleich";
    case "es": return "Proveedores financieros que comparamos";
    case "fr": return "Les fournisseurs financiers que nous comparons";
    case "it": return "I fornitori finanziari che confrontiamo";
    case "pt": return "Fornecedores financeiros que comparamos";
    default:   return "Financial providers we compare";
  }
}

function TrustLogoCell({ provider }: { provider: TrustedProvider }) {
  return (
    <div
      className="group/trust flex h-14 w-14 items-center justify-center rounded-[14px] border border-line bg-white shadow-subtle transition-all duration-200 hover:border-accent-emerald/20 hover:bg-bg-surface sm:h-16 sm:w-16 sm:rounded-[16px]"
      title={provider.label}
      aria-label={provider.label}
    >
      {provider.kind === "asset" ? (
        <span
          className="inline-flex items-center justify-center"
          style={{ transform: `scale(${provider.scale ?? 1})` }}
        >
          <img
            src={provider.src}
            alt={provider.label}
            loading="lazy"
            className={`h-auto w-auto object-contain opacity-70 transition-opacity duration-200 ease-out group-hover/trust:opacity-100 ${provider.maxWidthClassName ?? "max-w-[42px]"} ${provider.maxHeightClassName ?? "max-h-[18px]"}`}
          />
        </span>
      ) : (
        <div
          className={`flex flex-col items-center justify-center text-center text-ink-tertiary opacity-80 transition-opacity duration-200 ease-out group-hover/trust:opacity-100 ${provider.className ?? ""}`}
          style={{ fontFamily: "Manrope, system-ui, sans-serif" }}
        >
          {provider.lines.map((line) => (
            <span key={`${provider.label}-${line}`}>{line}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function TrustedProviderGrid({ locale }: { locale: MarketplaceLocale }) {
  const dictionary = getDictionary(locale);

  return (
    <section className="rounded-[28px] border border-line bg-white px-5 py-6 shadow-card sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      {/* ── Stat counters ── */}
      <div className="mb-8 grid grid-cols-2 gap-4 border-b border-line pb-8 sm:grid-cols-4 sm:gap-6">
        {TRUST_STATS.map((stat) => (
          <div key={stat.label} className="text-center sm:text-left">
            <p className="text-[2rem] font-extrabold leading-none tracking-[-0.06em] text-ink sm:text-[2.4rem]">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[12px] font-medium text-ink-tertiary">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Provider grid ── */}
      <div className="max-w-2xl">
        <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
          {getEyebrow(locale)}
        </p>
        <h2 className="mt-3 text-h3 text-ink">{dictionary.home.providerTitle}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-secondary">
          {dictionary.home.providerDescription}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 justify-items-center gap-x-3 gap-y-3 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-4 md:grid-cols-6 lg:grid-cols-6">
        {trustedProviders.map((provider) => (
          <TrustLogoCell key={provider.label} provider={provider} />
        ))}
      </div>

      {/* ── Ranking note ── */}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5">
        <p className="text-[12px] text-ink-tertiary">
          Rankings are updated daily based on fees, rates, and real user outcomes.
        </p>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent-emerald">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-emerald" />
          No ads · No sponsored placements
        </span>
      </div>
    </section>
  );
}
