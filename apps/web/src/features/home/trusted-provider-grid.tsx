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
  {
    label: "Revolut",
    kind: "asset",
    src: "/logos/revolut.svg",
    scale: 0.9,
    maxWidthClassName: "max-w-[44px]",
    maxHeightClassName: "max-h-[16px]",
  },
  {
    label: "Wise",
    kind: "asset",
    src: "/logos/wise.svg",
    scale: 0.94,
    maxWidthClassName: "max-w-[44px]",
    maxHeightClassName: "max-h-[18px]",
  },
  {
    label: "N26",
    kind: "asset",
    src: "/logos/n26.svg",
    scale: 0.92,
    maxWidthClassName: "max-w-[30px]",
    maxHeightClassName: "max-h-[16px]",
  },
  {
    label: "Klarna",
    kind: "wordmark",
    lines: ["Klarna"],
    className: "text-[11px] font-extrabold tracking-[-0.08em]",
  },
  {
    label: "Santander",
    kind: "asset",
    src: "/logos/santander-monochrome.svg",
    scale: 1,
    maxWidthClassName: "max-w-[54px]",
    maxHeightClassName: "max-h-[18px]",
  },
  {
    label: "BNP Paribas",
    kind: "asset",
    src: "/logos/bnp-paribas-monochrome.svg",
    scale: 1,
    maxWidthClassName: "max-w-[56px]",
    maxHeightClassName: "max-h-[18px]",
  },
  {
    label: "Allianz",
    kind: "wordmark",
    lines: ["Allianz"],
    className: "text-[10px] font-extrabold tracking-[-0.07em]",
  },
  {
    label: "Trade Republic",
    kind: "wordmark",
    lines: ["Trade", "Republic"],
    className: "text-[9px] font-extrabold leading-[0.95] tracking-[-0.05em]",
  },
  {
    label: "Coinbase",
    kind: "asset",
    src: "/logos/coinbase.svg",
    scale: 0.98,
    maxWidthClassName: "max-w-[22px]",
    maxHeightClassName: "max-h-[22px]",
  },
  {
    label: "eToro",
    kind: "wordmark",
    lines: ["eToro"],
    className: "text-[11px] font-extrabold tracking-[-0.07em]",
  },
  {
    label: "Payoneer",
    kind: "wordmark",
    lines: ["Payoneer"],
    className: "text-[9px] font-extrabold tracking-[-0.06em]",
  },
  {
    label: "Western Union",
    kind: "wordmark",
    lines: ["Western", "Union"],
    className: "text-[9px] font-extrabold leading-[0.95] tracking-[-0.04em]",
  },
];

function getEyebrow(locale: MarketplaceLocale) {
  switch (locale) {
    case "de":
      return "Vertrauen führender Finanzanbieter";
    case "es":
      return "Confianza de proveedores financieros líderes";
    case "fr":
      return "La confiance des principaux acteurs financiers";
    case "it":
      return "La fiducia dei principali operatori finanziari";
    case "pt":
      return "A confiança dos principais provedores financeiros";
    default:
      return "Trusted by leading financial providers";
  }
}

function TrustLogoCell({ provider }: { provider: TrustedProvider }) {
  return (
    <div
      className="group/trust flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#F5F5F5] transition-transform duration-200 ease-out hover:scale-[1.04] sm:h-16 sm:w-16 sm:rounded-[16px]"
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
            className={`h-auto w-auto object-contain grayscale opacity-[0.78] transition-[opacity,transform] duration-200 ease-out group-hover/trust:opacity-[0.96] ${provider.maxWidthClassName ?? "max-w-[42px]"} ${provider.maxHeightClassName ?? "max-h-[18px]"}`}
          />
        </span>
      ) : (
        <div
          className={`flex flex-col items-center justify-center text-center text-[#555B63] opacity-[0.82] transition-opacity duration-200 ease-out group-hover/trust:opacity-[0.98] ${provider.className ?? ""}`}
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
    <section className="rounded-[28px] border border-[#EEF0F2] bg-white px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      <div className="max-w-2xl">
        <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
          {getEyebrow(locale)}
        </p>
        <h2 className="mt-3 text-h3 text-ink">{dictionary.home.providerTitle}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-secondary">
          {dictionary.home.providerDescription}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 justify-items-center gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-5 md:grid-cols-4 lg:grid-cols-6">
        {trustedProviders.map((provider) => (
          <TrustLogoCell key={provider.label} provider={provider} />
        ))}
      </div>
    </section>
  );
}
