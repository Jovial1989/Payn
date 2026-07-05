"use client";

import type { MarketplaceCategory, MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { CategoryIcon } from "@/components/category-icon";
import { DashboardMarketPulseOverview } from "@/components/dashboard-market-pulse-overview";
import { getProductEntryActionLabel } from "@/components/product-entry-action";
import {
  DashboardMetricCard,
  DashboardSectionCard,
} from "@/components/dashboard-primitives";
import { ProviderLogo } from "@/components/provider-logo";
import { Tag } from "@/components/tag";
import { getDictionary } from "@/lib/i18n";
import { formatMarketName } from "@/lib/market-name";
import { localePath } from "@/lib/locale";
import { getOfferHref, getMetricValue, normalizeDisplayText } from "@/lib/marketplace";
import { getCountryLabel, getLocalizedMarketScopeOptions } from "@/lib/countries";
import { getUserTypeOptions } from "@/lib/ui-copy";
import type { UserProfile } from "@/lib/types";

type ActivityItem = {
  kind: "viewed" | "saved";
  offer: MarketplaceOffer;
  note: string;
};

function DashboardActionBar({
  locale,
  categoryHref,
}: {
  locale: MarketplaceLocale;
  categoryHref: (category: MarketplaceCategory) => string;
}) {
  const actions: Array<{ category: MarketplaceCategory; label: string; hint: string }> =
    locale === "de"
      ? [
          { category: "transfers", label: "Geld senden", hint: "Transfer-Route öffnen" },
          { category: "loans", label: "Kredit finden", hint: "Monatskosten zuerst" },
          { category: "cards", label: "Karte finden", hint: "Reise, Cashback, ATM, FX" },
          { category: "exchange", label: "Wechseln", hint: "Gelieferter Kurs statt Slogans" },
          { category: "insurance", label: "Versichern", hint: "Typenspezifische Filter" },
          { category: "investments", label: "Märkte öffnen", hint: "Chart zuerst, Plattformen danach" },
        ]
      : [
          { category: "transfers", label: "Send money", hint: "Open the transfer route" },
          { category: "loans", label: "Get a loan", hint: "Monthly cost first" },
          { category: "cards", label: "Find a card", hint: "Travel, cashback, ATM, FX" },
          { category: "exchange", label: "Exchange", hint: "Delivered rate, not slogans" },
          { category: "insurance", label: "Get insured", hint: "Type-specific filters" },
          { category: "investments", label: "Open markets", hint: "Chart first, platforms second" },
        ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.category}
          href={categoryHref(action.category)}
          className="group rounded-[22px] border border-[#EAEAEA] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(17,24,39,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(17,24,39,0.10)] active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <CategoryIcon category={action.category} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{action.label}</p>
              <p className="mt-1 text-sm text-ink-secondary">{action.hint}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ActivityList({
  locale,
  items,
  emptyHref,
  categoryHref,
}: {
  locale: MarketplaceLocale;
  items: ActivityItem[];
  emptyHref: string;
  categoryHref: (category: MarketplaceCategory) => string;
}) {
  const dictionary = getDictionary(locale);
  const productEntryActionLabel = getProductEntryActionLabel(locale);
  const emptyTitle = locale === "de" ? "Noch kein aktiver Entscheidungspfad" : "No active decision trail yet";
  const emptyDescription =
    locale === "de"
      ? `Nutze ${productEntryActionLabel.toLowerCase()} oder springe direkt in eine Kategorie und Payn verankert die nächste Sitzung an einem echten Vergleich.`
      : `Use ${productEntryActionLabel.toLowerCase()} or jump straight into a category and Payn will keep the next session anchored to a real comparison.`;

  if (items.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-[#DADCE0] bg-[#F7F7F8] px-5 py-6">
        <p className="text-base font-semibold text-ink">{emptyTitle}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {emptyDescription}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={emptyHref} className={buttonStyles({ variant: "secondary", size: "sm" })}>
            {productEntryActionLabel}
          </Link>
          <Link href={categoryHref("transfers")} className={buttonStyles({ variant: "ghost", size: "sm" })}>
            {locale === "de" ? "Geld senden" : "Send money"}
          </Link>
          <Link href={categoryHref("loans")} className={buttonStyles({ variant: "ghost", size: "sm" })}>
            {locale === "de" ? "Kredite vergleichen" : "Compare loans"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#ECEDEF]">
      {items.map((item) => (
        <Link
          key={`${item.kind}-${item.offer.id}`}
          href={localePath(locale, getOfferHref(item.offer))}
          className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-3">
            <ProviderLogo providerName={item.offer.providerName} size="sm" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-ink">
                  {item.kind === "viewed" ? (locale === "de" ? "Angesehen" : "Viewed") : locale === "de" ? "Gespeichert" : "Saved"}
                </p>
                <span className="text-sm text-ink-tertiary">·</span>
                <p className="truncate text-sm text-ink-secondary">{item.offer.title}</p>
              </div>
              <p className="mt-1 truncate text-xs text-ink-tertiary">{item.note}</p>
            </div>
          </div>
          <Tag tone="muted" className="self-start sm:self-auto">
            {dictionary.categories[item.offer.category]}
          </Tag>
        </Link>
      ))}
    </div>
  );
}

function NextActionRow({
  locale,
  title,
  reason,
  offer,
}: {
  locale: MarketplaceLocale;
  title: string;
  reason: string;
  offer: MarketplaceOffer | null;
}) {
  if (!offer) {
    return null;
  }

  return (
    <Link
      href={localePath(locale, getOfferHref(offer))}
      className="flex flex-col gap-3 rounded-[20px] px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FCFCFD] hover:shadow-[0_10px_24px_rgba(17,24,39,0.06)] first:pt-3 last:pb-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <CategoryIcon category={offer.category} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-1 text-sm text-ink-secondary">{offer.providerName} · {offer.title}</p>
          <p className="mt-1 text-xs text-ink-tertiary">{reason}</p>
        </div>
      </div>
      <span className="text-sm font-semibold text-ink-secondary sm:shrink-0">{locale === "de" ? "Öffnen" : "Open"}</span>
    </Link>
  );
}

function buildActivityItems(
  locale: MarketplaceLocale,
  savedOffers: MarketplaceOffer[],
  watchedOffers: MarketplaceOffer[],
) {
  const items: ActivityItem[] = [];
  const seen = new Set<string>();

  for (const offer of watchedOffers.slice(0, 3)) {
    if (seen.has(offer.id)) continue;
    seen.add(offer.id);
    items.push({
      kind: "viewed",
      offer,
      note: `${offer.providerName} · ${locale === "de" ? "Vergleich fortsetzen" : "Resume the comparison flow"}`,
    });
  }

  for (const offer of savedOffers.slice(0, 3)) {
    if (seen.has(offer.id)) continue;
    seen.add(offer.id);
    items.push({
      kind: "saved",
      offer,
      note: `${offer.providerName} · ${locale === "de" ? "Zurück zur Shortlist" : "Return to the shortlist"}`,
    });
  }

  return items.slice(0, 6);
}

function findOffer(offers: MarketplaceOffer[], matchers: Array<(offer: MarketplaceOffer) => boolean>) {
  for (const matcher of matchers) {
    const found = offers.find(matcher);
    if (found) {
      return found;
    }
  }

  return null;
}

function SnapshotValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#EAEAEA] bg-[#F7F7F8] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

export function DashboardOverviewWorkspace({
  locale,
  username,
  profile,
  marketLabel,
  marketOffers,
  savedOffers,
  watchedOffers,
  categoryCounts,
  settingsHref,
  discoverHref,
  categoryHref,
  investmentsHref,
}: {
  locale: MarketplaceLocale;
  username: string;
  profile: UserProfile | null;
  marketLabel: string;
  marketOffers: MarketplaceOffer[];
  savedOffers: MarketplaceOffer[];
  watchedOffers: MarketplaceOffer[];
  categoryCounts: Record<MarketplaceCategory, number>;
  settingsHref: string;
  discoverHref: string;
  categoryHref: (category: MarketplaceCategory) => string;
  investmentsHref: string;
}) {
  const dictionary = getDictionary(locale);
  const copy =
    locale === "de"
      ? {
          continueTrail: "Pfad fortsetzen",
          controlCenter: "Kontrollzentrum",
          resumeDecision: "Letzte Entscheidung fortsetzen",
          workspaceTitle: "Dein angemeldeter Payn-Workspace",
          workspaceDescription:
            "Das Dashboard bleibt kompakt: Es zeigt Abkürzungen, gespeicherten Kontext, Empfehlungshinweise und den Zugang zu den Einstellungen, ohne Discover zu duplizieren.",
          openSettings: "Einstellungen öffnen",
          continueComparison: "Vergleich fortsetzen",
          resume: "Fortsetzen",
          savedShortlist: "Gespeicherte Shortlist",
          categoriesRepresented: (count: number) => `${count} Kategorien vertreten`,
          saveOffersHint: "Speichere Angebote aus Discover oder den Kategorieseiten",
          recentTrail: "Letzte Aktivität",
          resumeResearch: "Letzte Anbieter-Recherche fortsetzen",
          viewedOffersHint: "Angesehene Angebote erscheinen hier",
          marketCoverage: "Marktabdeckung",
          categoriesWithOffers: `${marketLabel} Kategorien mit sortierten Angeboten`,
          recommendationBasis: "Empfehlungsbasis",
          profileShapesRanking: "Profil und Markteinstellungen steuern das lokale Ranking",
          recentActivity: "Letzte Aktivität",
          realDecisionTrail: "Einen echten Entscheidungspfad fortsetzen",
          realDecisionTrailBody:
            "Öffne unten einen Eintrag, um den Flow fortzusetzen, statt neu anzufangen.",
          profileSignals: "Profilsignale",
          recommendationsUsing: "Was Empfehlungen gerade nutzen",
          recommendationsUsingBody:
            "Einstellungen verwalten jetzt Identität und Marktpräferenzen. Das Dashboard liest sie aus und macht daraus bessere Abkürzungen und Hinweise.",
          editSettings: "Einstellungen bearbeiten",
          recommendationHints: "Empfehlungshinweise",
          usefulNextMoves: `Sinnvolle nächste Schritte für ${formatMarketName(marketLabel)}`,
          usefulNextMovesBody:
            "Diese Hinweise bleiben klein und direkt, damit das Dashboard dir schneller beim Neustart hilft, statt selbst zu einer weiteren Browse-Fläche zu werden.",
          cheapestTransfer: "Günstigste EUR → GBP Überweisung",
          cheapestTransferReason:
            "Guter Startpunkt, wenn der ausgezahlte Betrag wichtiger ist als Geschwindigkeit.",
          travelCard: "Reisekarte mit weniger FX-Reibung",
          travelCardReason:
            "Öffnet einen Karten-Flow, der bereits stärker auf Reisen und Auslandseinsatz ausgerichtet ist.",
          shortTripCover: "Schutz für Kurzreisen",
          shortTripReason:
            "Hilfreich, wenn Versicherung direkt im richtigen Vertikal starten soll statt in einer generischen Filterwand.",
          shortcutsEyebrow: "Nächste Vergleichs-Abkürzungen",
          shortcutsTitle: "Direkt in eine Kategorie springen",
          shortcutsBody:
            "Discover bleibt der geführte Einstieg, aber diese Abkürzungen bleiben hier für wiederkehrendes Verhalten, wenn das gewünschte Produkt schon klar ist.",
          noTrail: "Noch kein aktiver Entscheidungspfad",
          noTrailBody:
            `Nutze ${getProductEntryActionLabel(locale).toLowerCase()} oder springe direkt in eine Kategorie und Payn verankert die nächste Sitzung an einem echten Vergleich.`,
          viewedNote: "Vergleich fortsetzen",
          savedNote: "Zurück zur Shortlist",
          name: "Name",
          country: "Land",
          profileType: "Profiltyp",
          marketScope: "Marktabdeckung",
          notSetYet: "Noch nicht festgelegt",
          savedCategories: "Gespeicherte Kategorien",
        }
      : {
          continueTrail: "Continue trail",
          controlCenter: "Control center",
          resumeDecision: "Resume the last decision",
          workspaceTitle: "Your signed-in Payn workspace",
          workspaceDescription:
            "Dashboard stays compact now: it keeps shortcuts, saved context, recommendation hints, and settings access without duplicating Discover.",
          openSettings: "Open settings",
          continueComparison: "Continue comparison",
          resume: "Resume",
          savedShortlist: "Saved shortlist",
          categoriesRepresented: (count: number) => `${count} categories represented`,
          saveOffersHint: "Save offers from discover or category pages",
          recentTrail: "Recent trail",
          resumeResearch: "Resume recent provider research",
          viewedOffersHint: "Viewed offers will appear here",
          marketCoverage: "Market coverage",
          categoriesWithOffers: `${marketLabel} categories with ranked offers right now`,
          recommendationBasis: "Recommendation basis",
          profileShapesRanking: "Profile and market settings shape local ranking",
          recentActivity: "Recent activity",
          realDecisionTrail: "Resume a real decision trail",
          realDecisionTrailBody:
            "Open any item below to continue the flow instead of starting again.",
          profileSignals: "Profile signals",
          recommendationsUsing: "What recommendations are using",
          recommendationsUsingBody:
            "Settings now own your identity and market preferences. Dashboard reads them and turns them into better shortcuts and hints.",
          editSettings: "Edit settings",
          recommendationHints: "Recommendation hints",
          usefulNextMoves: `Useful next moves for ${formatMarketName(marketLabel)}`,
          usefulNextMovesBody:
            "These hints stay small and actionable so dashboard helps you restart faster instead of becoming another browse surface.",
          cheapestTransfer: "Cheapest EUR → GBP transfer",
          cheapestTransferReason:
            "Good starting point if delivered amount matters more than speed.",
          travelCard: "Travel card with lower FX friction",
          travelCardReason:
            "Open a card flow that already leans toward travel and foreign-spend fit.",
          shortTripCover: "Short-trip cover",
          shortTripReason:
            "Useful when you want insurance to start from the right vertical instead of a generic filter wall.",
          shortcutsEyebrow: "Next comparison shortcuts",
          shortcutsTitle: "Jump straight into a category",
          shortcutsBody:
            "Discover remains the guided entry point, but these shortcuts stay here for repeat behavior when you already know the product you want.",
          noTrail: "No active decision trail yet",
          noTrailBody:
            `Use ${getProductEntryActionLabel(locale).toLowerCase()} or jump straight into a category and Payn will keep the next session anchored to a real comparison.`,
          viewedNote: "Resume the comparison flow",
          savedNote: "Return to the shortlist",
          name: "Name",
          country: "Country",
          profileType: "Profile type",
          marketScope: "Market scope",
          notSetYet: "Not set yet",
          savedCategories: "Saved categories",
        };
  const displayName =
    [profile?.first_name?.trim(), profile?.last_name?.trim()].filter(Boolean).join(" ") || username;
  const activityItems = buildActivityItems(locale, savedOffers, watchedOffers);
  const resumeOffer = watchedOffers[0] ?? savedOffers[0] ?? null;
  const selectedCountryLabel = getCountryLabel(profile?.home_country ?? null, locale);
  const userTypes = getUserTypeOptions(locale);
  const selectedUserTypeLabel =
    userTypes.find((option) => option.id === (profile?.user_type ?? "personal"))?.label ??
    (profile?.user_type ?? "personal");
  const marketScopeOptions = getLocalizedMarketScopeOptions(locale);
  const marketScopeLabel =
    marketScopeOptions.find((option) => option.value === (profile?.market_scope ?? "eu_fallback"))?.label ??
    (locale === "de" ? "Lokal + EU-Fallback" : "Local + EU fallback");
  const activeCategoryCount = Object.values(categoryCounts).filter((count) => count > 0).length;
  const shortlistCategories = Array.from(new Set(savedOffers.map((offer) => offer.category))).slice(0, 3);

  const lowFxOffer = findOffer(marketOffers, [
    (offer) => offer.providerName === "Wise" && offer.category === "transfers",
    (offer) => offer.category === "transfers",
  ]);
  const travelCardOffer = findOffer(marketOffers, [
    (offer) =>
      offer.category === "cards" &&
      `${offer.title} ${offer.subtitle} ${offer.bestFor.join(" ")}`.toLowerCase().includes("travel"),
    (offer) => offer.category === "cards",
  ]);
  const shortTripInsurance = findOffer(marketOffers, [
    (offer) => offer.category === "insurance" && offer.attributes?.insuranceType === "travel",
    (offer) => offer.category === "insurance",
  ]);

  return (
    <div className="mx-auto grid max-w-[1100px] gap-6">
      <DashboardSectionCard
        eyebrow={resumeOffer ? copy.continueTrail : copy.controlCenter}
        title={resumeOffer ? copy.resumeDecision : copy.workspaceTitle}
        description={copy.workspaceDescription}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={discoverHref} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              {getProductEntryActionLabel(locale)}
            </Link>
            <Link href={settingsHref} className={buttonStyles({ variant: "ghost", size: "sm" })}>
              {copy.openSettings}
            </Link>
          </div>
        }
      >
        <div className="grid gap-5">
          {resumeOffer ? (
            <Link
              href={localePath(locale, getOfferHref(resumeOffer))}
              className="flex flex-col gap-4 rounded-[22px] border border-[#EAEAEA] bg-[#F7F7F8] px-5 py-5 transition-colors hover:bg-white sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <ProviderLogo providerName={resumeOffer.providerName} size="sm" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {copy.continueComparison}
                  </p>
                  <p className="mt-2 text-base font-bold tracking-[-0.02em] text-ink">
                    {resumeOffer.title}
                  </p>
                  <p className="mt-2 text-sm text-ink-secondary">
                    {resumeOffer.providerName} · {normalizeDisplayText(getMetricValue(resumeOffer, ["Fee", "APR", "Price"]) ?? resumeOffer.subtitle)}
                  </p>
                </div>
              </div>
              <span className={`${buttonStyles({ variant: "primary", size: "sm" })} w-full justify-center sm:w-auto`}>
                {copy.resume}
              </span>
            </Link>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardMetricCard
              label={copy.savedShortlist}
              value={savedOffers.length}
              hint={savedOffers.length > 0 ? copy.categoriesRepresented(shortlistCategories.length) : copy.saveOffersHint}
            />
            <DashboardMetricCard
              label={copy.recentTrail}
              value={watchedOffers.length}
              hint={watchedOffers.length > 0 ? copy.resumeResearch : copy.viewedOffersHint}
            />
            <DashboardMetricCard
              label={copy.marketCoverage}
              value={activeCategoryCount}
              hint={copy.categoriesWithOffers}
            />
            <DashboardMetricCard
              label={copy.recommendationBasis}
              value={selectedCountryLabel ?? marketLabel}
              hint={copy.profileShapesRanking}
            />
          </div>

          <DashboardActionBar locale={locale} categoryHref={categoryHref} />
        </div>
      </DashboardSectionCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <DashboardSectionCard
          eyebrow={copy.recentActivity}
          title={copy.realDecisionTrail}
          description={copy.realDecisionTrailBody}
        >
          <ActivityList
            locale={locale}
            items={activityItems}
            emptyHref={discoverHref}
            categoryHref={categoryHref}
          />
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow={copy.profileSignals}
          title={copy.recommendationsUsing}
          description={copy.recommendationsUsingBody}
          action={
            <Link href={settingsHref} className={buttonStyles({ variant: "ghost", size: "sm" })}>
              {copy.editSettings}
            </Link>
          }
        >
          <div className="grid gap-3">
            <SnapshotValue label={copy.name} value={displayName} />
            <SnapshotValue label={copy.country} value={selectedCountryLabel ?? copy.notSetYet} />
            <SnapshotValue label={copy.profileType} value={selectedUserTypeLabel} />
            <SnapshotValue label={copy.marketScope} value={marketScopeLabel} />
            {shortlistCategories.length > 0 ? (
              <div className="rounded-[18px] border border-[#EAEAEA] bg-white px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                  {copy.savedCategories}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {shortlistCategories.map((category) => (
                    <Tag key={category} tone="muted">
                      {dictionary.categories[category]}
                    </Tag>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </DashboardSectionCard>
      </div>

      <DashboardSectionCard
        eyebrow={copy.recommendationHints}
        title={copy.usefulNextMoves}
        description={copy.usefulNextMovesBody}
      >
        <div className="divide-y divide-[#ECEDEF]">
          <NextActionRow
            locale={locale}
            title={copy.cheapestTransfer}
            reason={copy.cheapestTransferReason}
            offer={lowFxOffer}
          />
          <NextActionRow
            locale={locale}
            title={copy.travelCard}
            reason={copy.travelCardReason}
            offer={travelCardOffer}
          />
          <NextActionRow
            locale={locale}
            title={copy.shortTripCover}
            reason={copy.shortTripReason}
            offer={shortTripInsurance}
          />
        </div>
      </DashboardSectionCard>

      <DashboardSectionCard
        eyebrow={copy.shortcutsEyebrow}
        title={copy.shortcutsTitle}
        description={copy.shortcutsBody}
      >
        <DashboardActionBar locale={locale} categoryHref={categoryHref} />
      </DashboardSectionCard>

      <DashboardMarketPulseOverview locale={locale} investmentsHref={investmentsHref} />
    </div>
  );
}
