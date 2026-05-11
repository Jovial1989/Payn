import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { SiteShell } from "@/components/site-shell";
import { getDictionary } from "@/lib/i18n";
import { getRequestPreferences } from "@/lib/request-preferences";
import { localePath } from "@/lib/locale";
import type { MarketplaceLocale } from "@payn/types";

function getRankingCopy(locale: MarketplaceLocale) {
  const copy = {
    en: {
      eyebrow: "Methodology",
      title: "How We Rank Offers",
      description:
        "Payn ranks financial products using pricing transparency, market fit, user relevance, provider quality, and affiliate priority.",
      meaningTitle: "What this means for you",
      meaningBody:
        "Rankings surface the most relevant and transparent options first. Partner offers are clearly labeled. You can always re-sort by APR, fees, provider name, or recency in the explorer. Payn does not guarantee any financial outcome — always review terms on the provider's site before applying.",
      contact: "Questions? Contact us",
      factors: [
        ["Pricing transparency", "We surface APR, fees, spreads, and hidden costs so you compare actual cost — not headline rates."],
        ["Product-market fit", "Each offer is scored on how well it matches your selected market, category, and financial goals."],
        ["User relevance signals", "When you set preferences, rankings adjust to your country, goals, and categories."],
        ["Provider quality", "We factor in regulatory status, public reputation, and product completeness."],
        ["Affiliate priority", "Partner offers may receive a ranking boost only when they already meet quality and relevance thresholds."],
      ],
    },
    de: {
      eyebrow: "Methodik",
      title: "Wie wir Angebote bewerten",
      description:
        "Payn bewertet Finanzprodukte nach Preistransparenz, Marktrelevanz, Nutzerbedarf, Anbieterqualität und Affiliate-Priorität.",
      meaningTitle: "Was das für dich bedeutet",
      meaningBody:
        "Rankings zeigen zuerst die relevantesten und transparentesten Optionen. Partnerangebote sind klar gekennzeichnet. Du kannst im Explorer jederzeit nach APR, Gebühren, Anbieter oder Aktualität sortieren. Payn garantiert kein finanzielles Ergebnis — prüfe vor dem Antrag immer die Bedingungen beim Anbieter.",
      contact: "Fragen? Kontaktiere uns",
      factors: [
        ["Preistransparenz", "Wir zeigen APR, Gebühren, Spreads und versteckte Kosten, damit du reale Kosten vergleichst."],
        ["Produkt-Markt-Passung", "Jedes Angebot wird danach bewertet, wie gut es zu Markt, Kategorie und Zielen passt."],
        ["Relevanzsignale", "Wenn du Präferenzen setzt, passen sich Rankings an Land, Ziele und Kategorien an."],
        ["Anbieterqualität", "Wir berücksichtigen Regulierung, öffentliche Reputation und Produktvollständigkeit."],
        ["Affiliate-Priorität", "Partnerangebote können nur dann einen Ranking-Boost erhalten, wenn Qualität und Relevanz stimmen."],
      ],
    },
    es: {
      eyebrow: "Metodología",
      title: "Cómo clasificamos las ofertas",
      description:
        "Payn clasifica productos financieros por transparencia de precios, encaje de mercado, relevancia para el usuario, calidad del proveedor y prioridad de afiliación.",
      meaningTitle: "Qué significa para ti",
      meaningBody:
        "Los rankings muestran primero las opciones más relevantes y transparentes. Las ofertas de socios se etiquetan claramente. Siempre puedes reordenar por TAE, comisiones, proveedor o actualidad en el explorador. Payn no garantiza ningún resultado financiero; revisa siempre las condiciones del proveedor antes de solicitar.",
      contact: "¿Preguntas? Contáctanos",
      factors: [
        ["Transparencia de precios", "Mostramos TAE, comisiones, diferenciales y costes ocultos para comparar el coste real."],
        ["Encaje producto-mercado", "Cada oferta se puntúa según su ajuste a tu mercado, categoría y objetivos."],
        ["Señales de relevancia", "Al definir preferencias, los rankings se adaptan a país, objetivos y categorías."],
        ["Calidad del proveedor", "Consideramos regulación, reputación pública y completitud del producto."],
        ["Prioridad de afiliación", "Las ofertas de socios solo pueden subir si ya cumplen calidad y relevancia."],
      ],
    },
    fr: {
      eyebrow: "Méthodologie",
      title: "Comment nous classons les offres",
      description:
        "Payn classe les produits financiers selon la transparence des prix, l’adéquation au marché, la pertinence utilisateur, la qualité du fournisseur et la priorité d’affiliation.",
      meaningTitle: "Ce que cela signifie pour vous",
      meaningBody:
        "Les classements font remonter d’abord les options les plus pertinentes et transparentes. Les offres partenaires sont clairement signalées. Vous pouvez toujours retrier par APR, frais, fournisseur ou date dans l’explorateur. Payn ne garantit aucun résultat financier — vérifiez toujours les conditions chez le fournisseur avant de demander.",
      contact: "Des questions ? Contactez-nous",
      factors: [
        ["Transparence des prix", "Nous affichons APR, frais, spreads et coûts cachés pour comparer le coût réel."],
        ["Adéquation produit-marché", "Chaque offre est notée selon son adéquation à votre marché, catégorie et objectifs."],
        ["Signaux de pertinence", "Lorsque vous définissez des préférences, le classement s’adapte au pays, aux objectifs et aux catégories."],
        ["Qualité du fournisseur", "Nous tenons compte du statut réglementaire, de la réputation publique et de la complétude du produit."],
        ["Priorité d’affiliation", "Les offres partenaires ne peuvent être avantagées que si elles respectent déjà les seuils de qualité et de pertinence."],
      ],
    },
  };

  return copy[locale as keyof typeof copy] ?? copy.en;
}

function rankingIcons() {
  return [
    (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  ];
}

export default async function RankingPage() {
  const preferences = await getRequestPreferences();
  const dictionary = getDictionary(preferences.locale);
  const copy = getRankingCopy(preferences.locale);
  const icons = rankingIcons();

  return (
    <SiteShell
      activePage={undefined}
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
    >
      <div className="grid gap-5">
        <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {copy.factors.map(([title, description], index) => (
            <div
              key={title}
              className="flex flex-col rounded-[22px] border border-line bg-white p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bg-surface text-ink">
                {icons[index]}
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {description}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-[28px] border border-line bg-[#F7F8F9] p-6 sm:p-8">
          <h2 className="text-h3 text-ink">{copy.meaningTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
            {copy.meaningBody}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={localePath(preferences.locale, "/discover")}
              className={buttonStyles({ variant: "primary", size: "md" })}
            >
              {dictionary.home.heroCta}
            </Link>
            <Link
              href={localePath(preferences.locale, "/contact")}
              className={buttonStyles({ variant: "secondary", size: "md" })}
            >
              {copy.contact}
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
