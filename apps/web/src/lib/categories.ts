// ─── Categories — single source of truth ────────────────────────────────────
//
// TASK-302 (PR-V3-02) — Replaces ad-hoc bucket arrays in `outcomes.ts` and
// per-locale strings scattered across `i18n.ts`. From this point forward
// any label change happens here once and propagates everywhere through
// `bucketTitleLabel(...)` / `bucketDescriptionLabel(...)` lookups.
//
// What lives here:
//   • `CategoryId` enum — internal, stable identifiers (don't rename — the
//     catalog data still keys on these). Slugs and labels are derived.
//   • `CATEGORIES` — the 9 canonical user-facing buckets in the order they
//     should appear in nav + on Home. Each carries an internal id, the new
//     plain-English label per locale, the new plain-English description
//     per locale, and the URL slug.
//   • `CATEGORY_REDIRECTS` — old slug → new slug. Consumed by
//     `next.config.ts` to 301 old jargon URLs (TASK-310 ships the
//     redirect wiring).
//   • `SUB_CATEGORIES` — TASK-304. The per-bucket chip taxonomy that used
//     to live as nested sidebar children. Now drives the sticky chip row
//     inside `bucket-workspace.tsx` on every category.
//
// The mobile app keeps its own mirror in `apps/mobile/lib/core/constants
// /categories.dart` — same shape, same order, same labels. Keep them in
// lockstep when adding a category.

import type { MarketplaceLocale } from "@payn/types";

// ─── Category ids ─────────────────────────────────────────────────────────────
//
// 9 buckets, in nav order. The id is the stable internal handle — don't
// rename it. URL slugs and labels live on `CATEGORIES` below.

export type CategoryId =
  | "cards"
  | "saving"
  | "sending-money"
  | "bank-accounts"
  | "investing"
  | "borrowing"
  | "for-business"
  | "family"
  | "insurance";

// ─── Per-category label + description per locale ─────────────────────────────
//
// V3 brief §1.1 + §1.3 specify the en strings exactly. For de we use the
// V1 brief's hand-picked translations. For es/fr/it/pt the rule is
// "natural translations, not word-for-word" — translations below were
// hand-tuned, not auto-generated. If a market-specific phrase feels off
// to a native reader, change it here and only here.

type LocaleStrings = Record<MarketplaceLocale, string>;

interface CategoryMeta {
  id: CategoryId;
  /** URL slug. Same on every locale (see V1 brief — don't translate URLs). */
  slug: string;
  /** Per-locale label (sidebar, chips, hero copy). */
  label: LocaleStrings;
  /** Per-locale one-line description (rendered on the bucket page header). */
  description: LocaleStrings;
}

export const CATEGORIES: ReadonlyArray<CategoryMeta> = [
  {
    id: "cards",
    slug: "cards",
    label: {
      en: "Cards",
      de: "Karten",
      es: "Tarjetas",
      fr: "Cartes",
      it: "Carte",
      pt: "Cartões",
    },
    description: {
      en: "Find the right card for travel, daily spending, or earning rewards",
      de: "Finde die richtige Karte für Reisen, Alltag oder Cashback",
      es: "Encuentra la tarjeta para viajar, gastar a diario o ganar recompensas",
      fr: "Trouve la bonne carte pour voyager, dépenser au quotidien ou gagner des récompenses",
      it: "Trova la carta giusta per viaggi, spese quotidiane o ricompense",
      pt: "Encontra o cartão certo para viagens, gastos do dia a dia ou recompensas",
    },
  },
  {
    id: "saving",
    slug: "saving",
    label: {
      en: "Saving",
      de: "Sparen",
      es: "Ahorrar",
      fr: "Épargner",
      it: "Risparmiare",
      pt: "Poupar",
    },
    description: {
      en: "Grow what you don't need right now",
      de: "Lass dein Geld arbeiten, wenn du es gerade nicht brauchst",
      es: "Haz crecer lo que no necesitas ahora",
      fr: "Fais fructifier ce dont tu n'as pas besoin tout de suite",
      it: "Fai crescere ciò che non ti serve adesso",
      pt: "Faz crescer o que não precisas agora",
    },
  },
  {
    id: "sending-money",
    slug: "sending-money",
    label: {
      en: "Sending money",
      de: "Geld senden",
      es: "Enviar dinero",
      fr: "Envoyer de l'argent",
      it: "Inviare denaro",
      pt: "Enviar dinheiro",
    },
    description: {
      en: "Send money abroad without losing it to fees",
      de: "Geld ins Ausland senden, ohne Gebühren zu verschenken",
      es: "Envía dinero al extranjero sin perderlo en comisiones",
      fr: "Envoie de l'argent à l'étranger sans le perdre en frais",
      it: "Manda denaro all'estero senza perderlo in commissioni",
      pt: "Envia dinheiro para o estrangeiro sem perder em taxas",
    },
  },
  {
    id: "bank-accounts",
    slug: "bank-accounts",
    label: {
      en: "Bank accounts",
      de: "Bankkonten",
      es: "Cuentas bancarias",
      fr: "Comptes bancaires",
      it: "Conti bancari",
      pt: "Contas bancárias",
    },
    description: {
      en: "Day-to-day accounts — modern apps or traditional banks",
      de: "Konten für den Alltag — moderne Apps oder klassische Banken",
      es: "Cuentas del día a día — apps modernas o bancos tradicionales",
      fr: "Comptes du quotidien — apps modernes ou banques classiques",
      it: "Conti per ogni giorno — app moderne o banche tradizionali",
      pt: "Contas do dia a dia — apps modernos ou bancos tradicionais",
    },
  },
  {
    id: "investing",
    slug: "investing",
    label: {
      en: "Investing",
      de: "Anlegen",
      es: "Invertir",
      fr: "Investir",
      it: "Investire",
      pt: "Investir",
    },
    description: {
      en: "Make your money work for you over time",
      de: "Lass dein Geld langfristig für dich arbeiten",
      es: "Pon tu dinero a trabajar a largo plazo",
      fr: "Fais travailler ton argent sur le long terme",
      it: "Fai lavorare i tuoi soldi nel tempo",
      pt: "Põe o teu dinheiro a trabalhar a longo prazo",
    },
  },
  {
    id: "borrowing",
    slug: "borrowing",
    label: {
      en: "Borrowing",
      de: "Kredite",
      es: "Pedir prestado",
      fr: "Emprunter",
      it: "Prendere in prestito",
      pt: "Pedir emprestado",
    },
    description: {
      en: "Buy now, pay over time — see the real cost",
      de: "Jetzt kaufen, später zahlen — sieh die wahren Kosten",
      es: "Compra ahora, paga después — mira el coste real",
      fr: "Achète maintenant, paye plus tard — vois le vrai coût",
      it: "Compra ora, paga più tardi — vedi il costo reale",
      pt: "Compra agora, paga depois — vê o custo real",
    },
  },
  {
    id: "for-business",
    slug: "for-business",
    label: {
      en: "For business",
      de: "Für Unternehmen",
      es: "Para negocios",
      fr: "Pour entreprises",
      it: "Per aziende",
      pt: "Para empresas",
    },
    description: {
      en: "Money tools for freelancers and small teams",
      de: "Finanztools für Freelancer und kleine Teams",
      es: "Herramientas financieras para autónomos y equipos pequeños",
      fr: "Outils financiers pour freelances et petites équipes",
      it: "Strumenti finanziari per freelance e piccoli team",
      pt: "Ferramentas financeiras para freelancers e equipas pequenas",
    },
  },
  {
    id: "family",
    slug: "family",
    label: {
      en: "Family",
      de: "Familie",
      es: "Familia",
      fr: "Famille",
      it: "Famiglia",
      pt: "Família",
    },
    description: {
      en: "Money for kids, partner, parents",
      de: "Geldlösungen für Kinder, Partner und Eltern",
      es: "Dinero para hijos, pareja, padres",
      fr: "L'argent pour les enfants, le partenaire, les parents",
      it: "Denaro per figli, partner, genitori",
      pt: "Dinheiro para filhos, parceiro, pais",
    },
  },
  {
    id: "insurance",
    slug: "insurance",
    label: {
      en: "Insurance",
      de: "Versicherung",
      es: "Seguros",
      fr: "Assurance",
      it: "Assicurazione",
      pt: "Seguros",
    },
    description: {
      en: "Protect what matters — without overpaying",
      de: "Schütze, was dir wichtig ist — ohne zu viel zu zahlen",
      es: "Protege lo que importa — sin pagar de más",
      fr: "Protège ce qui compte — sans payer trop cher",
      it: "Proteggi ciò che conta — senza pagare troppo",
      pt: "Protege o que importa — sem pagar demais",
    },
  },
];

// Quick id-keyed lookup. Cheaper than `.find` on the array per render.
const CATEGORIES_BY_ID: Record<CategoryId, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, CategoryMeta>,
);

export function categoryLabel(
  id: CategoryId,
  locale: MarketplaceLocale,
): string {
  return CATEGORIES_BY_ID[id]?.label[locale] ?? CATEGORIES_BY_ID[id]?.label.en ?? id;
}

export function categoryDescription(
  id: CategoryId,
  locale: MarketplaceLocale,
): string {
  return (
    CATEGORIES_BY_ID[id]?.description[locale] ??
    CATEGORIES_BY_ID[id]?.description.en ??
    ""
  );
}

export function categorySlug(id: CategoryId): string {
  return CATEGORIES_BY_ID[id]?.slug ?? id;
}

// ─── Old slug redirects ──────────────────────────────────────────────────────
//
// V1 brief step 6. The pre-rename slugs and the V1-era `i-want-to/*`
// situation routes all 301 to the new plain-English `/explore/<slug>`
// URLs. Consumed by `next.config.ts` (TASK-310) — exposed here so the
// list lives next to the labels it depends on.

export const CATEGORY_REDIRECTS: Record<string, string> = {
  // Old bucket slugs → new category slugs
  "spend-smarter":     "cards",
  "earn-on-cash":      "saving",
  "travel-and-abroad": "sending-money",
  "daily-banking":     "bank-accounts",
  "invest-and-grow":   "investing",
  "big-purchases":     "borrowing",
  "family-and-kids":   "family",
  protect:             "insurance",

  // Sub-cat-as-route → parent category (sub-cat lives as a chip filter now)
  "cards/credit":          "cards?type=credit",
  "banking/neobanks":      "bank-accounts?type=app-only",
  "transfers/exchange":    "sending-money?type=exchange",
  "investments/crypto":    "investing?type=crypto",
  bnpl:                    "borrowing?type=instalments",

  // Legacy /loans /banking direct routes
  loans:        "borrowing",
  investments:  "investing",
};

// ─── Sub-category chip taxonomy ──────────────────────────────────────────────
//
// TASK-304. Lifted verbatim from V1 brief §D. The slug stays the internal
// handle (consumed by the existing filter logic); the label is the chip
// text users see. `All` always first.
//
// One source for both web + mobile filter sheets. The mobile companion at
// `apps/mobile/lib/core/constants/sub_categories.dart` mirrors this exactly.

export interface SubCategory {
  /** Internal handle. Stable. */
  slug: string;
  /** User-visible chip text per locale. */
  label: LocaleStrings;
}

const all = (locale: MarketplaceLocale): string => {
  const dict: LocaleStrings = {
    en: "All",
    de: "Alle",
    es: "Todos",
    fr: "Tout",
    it: "Tutti",
    pt: "Todos",
  };
  return dict[locale];
};

const ALL_CHIP: SubCategory = {
  slug: "all",
  label: { en: "All", de: "Alle", es: "Todos", fr: "Tout", it: "Tutti", pt: "Todos" },
};

export const SUB_CATEGORIES: Record<CategoryId, ReadonlyArray<SubCategory>> = {
  cards: [
    ALL_CHIP,
    { slug: "travel",   label: { en: "Travel",   de: "Reisen",   es: "Viajes",   fr: "Voyage",  it: "Viaggi",  pt: "Viagens" } },
    { slug: "cashback", label: { en: "Cashback", de: "Cashback", es: "Cashback", fr: "Cashback",it: "Cashback",pt: "Cashback" } },
    { slug: "credit",   label: { en: "Credit",   de: "Kredit",   es: "Crédito",  fr: "Crédit",  it: "Credito", pt: "Crédito" } },
    { slug: "debit",    label: { en: "Debit",    de: "Debit",    es: "Débito",   fr: "Débit",   it: "Debito",  pt: "Débito" } },
  ],
  saving: [
    ALL_CHIP,
    { slug: "instant", label: { en: "Take out anytime",          de: "Jederzeit verfügbar", es: "Retira cuando quieras", fr: "Retrait à tout moment", it: "Ritira quando vuoi", pt: "Levanta a qualquer hora" } },
    { slug: "notice",  label: { en: "Plan ahead (30–90 days)",    de: "Vorausplanen (30–90 Tage)", es: "Plan a 30–90 días",  fr: "Préavis 30–90 j",       it: "Piano 30–90 giorni",  pt: "Plano 30–90 dias" } },
    { slug: "fixed",   label: { en: "Lock in for 1+ year",        de: "Festlegen ab 1 Jahr",      es: "Bloquea 1+ año",      fr: "Bloque 1 an +",          it: "Vincola 1+ anno",     pt: "Bloqueia 1+ ano" } },
    { slug: "isa",     label: { en: "ISA (UK tax-free)",          de: "ISA (UK, steuerfrei)",     es: "ISA (Reino Unido)",   fr: "ISA (Royaume-Uni)",      it: "ISA (Regno Unito)",   pt: "ISA (Reino Unido)" } },
  ],
  "sending-money": [
    ALL_CHIP,
    { slug: "transfer", label: { en: "Bank transfer",      de: "Banküberweisung",  es: "Transferencia bancaria", fr: "Virement bancaire", it: "Bonifico bancario", pt: "Transferência bancária" } },
    { slug: "exchange", label: { en: "Just convert money", de: "Geld umtauschen",  es: "Solo cambiar dinero",    fr: "Juste convertir",   it: "Solo convertire",   pt: "Só converter" } },
    { slug: "wallet",   label: { en: "Digital wallets",    de: "Digitale Wallets", es: "Billeteras digitales",   fr: "Portefeuilles",     it: "Wallet digitali",   pt: "Carteiras digitais" } },
  ],
  "bank-accounts": [
    ALL_CHIP,
    { slug: "main",        label: { en: "Main account",        de: "Hauptkonto",       es: "Cuenta principal",   fr: "Compte principal", it: "Conto principale", pt: "Conta principal" } },
    { slug: "app-only",    label: { en: "App-only banks",      de: "Reine App-Banken", es: "Bancos solo en app", fr: "Banques mobiles",  it: "Banche solo app",  pt: "Bancos só em app" } },
    { slug: "traditional", label: { en: "Traditional banks",   de: "Klassische Banken",es: "Bancos tradicionales",fr: "Banques classiques",it: "Banche tradizionali",pt: "Bancos tradicionais" } },
    { slug: "joint",       label: { en: "Shared with partner", de: "Mit Partner teilen", es: "Compartida con pareja", fr: "Compte joint",  it: "Con partner",     pt: "Com parceiro" } },
  ],
  investing: [
    ALL_CHIP,
    { slug: "stocks",  label: { en: "Stocks & funds",            de: "Aktien & Fonds",   es: "Acciones y fondos", fr: "Actions & fonds", it: "Azioni e fondi", pt: "Ações e fundos" } },
    { slug: "trading", label: { en: "Active trading",            de: "Aktiver Handel",   es: "Trading activo",    fr: "Trading actif",   it: "Trading attivo", pt: "Trading ativo" } },
    { slug: "crypto",  label: { en: "Crypto",                    de: "Krypto",           es: "Cripto",            fr: "Crypto",          it: "Cripto",         pt: "Cripto" } },
    { slug: "auto",    label: { en: "Auto-invest (set & forget)",de: "Auto-Invest (einmal einrichten)",es: "Auto-invertir",fr: "Auto-investir", it: "Auto-investi", pt: "Auto-investir" } },
  ],
  borrowing: [
    ALL_CHIP,
    { slug: "personal",     label: { en: "Personal loan",            de: "Privatkredit",     es: "Préstamo personal", fr: "Prêt personnel",   it: "Prestito personale", pt: "Empréstimo pessoal" } },
    { slug: "instalments",  label: { en: "Pay in instalments",       de: "Ratenzahlung",     es: "Pagar a plazos",    fr: "Paiement en plusieurs fois", it: "Pagamento a rate", pt: "Pagar em prestações" } },
    { slug: "car",          label: { en: "Car finance",              de: "Autofinanzierung", es: "Financiación coche", fr: "Crédit auto",      it: "Finanziamento auto", pt: "Crédito automóvel" } },
    { slug: "consolidate",  label: { en: "Combine debts into one",   de: "Schulden zusammenfassen", es: "Unifica deudas",     fr: "Regrouper les crédits", it: "Unifica i debiti",   pt: "Junta dívidas" } },
  ],
  "for-business": [
    ALL_CHIP,
    { slug: "account",  label: { en: "Business account",         de: "Geschäftskonto",      es: "Cuenta de empresa", fr: "Compte pro",       it: "Conto business",     pt: "Conta empresarial" } },
    { slug: "payroll",  label: { en: "Paying staff & invoices",  de: "Lohn & Rechnungen",   es: "Nóminas y facturas",fr: "Paie & factures",  it: "Stipendi e fatture", pt: "Salários e faturas" } },
    { slug: "tax",      label: { en: "Tax & bookkeeping",        de: "Steuer & Buchhaltung",es: "Impuestos y contabilidad",fr: "Impôts & comptabilité", it: "Tasse e contabilità", pt: "Impostos e contabilidade" } },
    { slug: "expenses", label: { en: "Tracking spending",        de: "Ausgaben verfolgen",  es: "Control de gastos", fr: "Suivi des dépenses",it: "Tracciamento spese", pt: "Acompanhar gastos" } },
  ],
  family: [
    ALL_CHIP,
    { slug: "kids",      label: { en: "Pocket money for kids", de: "Taschengeld für Kinder", es: "Paga para hijos", fr: "Argent de poche", it: "Paghetta per i figli", pt: "Mesada para crianças" } },
    { slug: "joint",     label: { en: "Joint accounts",        de: "Gemeinschaftskonten",    es: "Cuentas conjuntas",fr: "Comptes joints",  it: "Conti cointestati",  pt: "Contas conjuntas" } },
    { slug: "budgeting", label: { en: "Family budgeting",      de: "Familienbudget",         es: "Presupuesto familiar", fr: "Budget familial", it: "Budget familiare", pt: "Orçamento familiar" } },
  ],
  insurance: [
    ALL_CHIP,
    { slug: "travel", label: { en: "Travel", de: "Reise",     es: "Viaje",    fr: "Voyage", it: "Viaggio", pt: "Viagem" } },
    { slug: "health", label: { en: "Health", de: "Gesundheit",es: "Salud",    fr: "Santé",  it: "Salute",  pt: "Saúde" } },
    { slug: "car",    label: { en: "Car",    de: "Auto",      es: "Coche",    fr: "Auto",   it: "Auto",    pt: "Carro" } },
    { slug: "home",   label: { en: "Home",   de: "Zuhause",   es: "Hogar",    fr: "Maison", it: "Casa",    pt: "Casa" } },
    { slug: "life",   label: { en: "Life",   de: "Leben",     es: "Vida",     fr: "Vie",    it: "Vita",    pt: "Vida" } },
  ],
};

export function subCategoryLabel(
  subSlug: string,
  categoryId: CategoryId,
  locale: MarketplaceLocale,
): string {
  const subs = SUB_CATEGORIES[categoryId];
  const match = subs.find((s) => s.slug === subSlug);
  return match?.label[locale] ?? match?.label.en ?? subSlug;
}

// Suppress unused-import warning if `all` helper is ever inlined out.
void all;
