// Regenerate via: npx tsx apps/web/scripts/ingest-provider-logos.ts
// Downloads provider logos from Brandfetch CDN → public/logos/{slug}.png
// Writes apps/web/src/features/catalog/known-logos.generated.ts

import { existsSync, writeFileSync, mkdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGOS_DIR = join(__dirname, "../public/logos");
const MANIFEST_PATH = join(__dirname, "../src/features/catalog/known-logos.generated.ts");
const DELAY_MS = 250;

// ─── Provider → domain mapping ────────────────────────────────────────────────

const PROVIDER_DOMAINS: Record<string, string> = {
  "730 Online":           "730online.de",
  "ABN AMRO":             "abnamro.nl",
  "Admiral":              "admiral.com",
  "Aion Bank":            "aion.be",
  "Alan":                 "alan.com",
  "Allianz":              "allianz.com",
  "Allianz Care":         "allianzcare.com",
  "Allianz Direct":       "allianzdirect.de",
  "Alma":                 "almapay.fr",
  "Anna Money":           "anna.money",
  "Atlantic Money":       "atlantic.money",
  "Auxmoney":             "auxmoney.com",
  "Aviva":                "aviva.com",
  "AXA":                  "axa.com",
  "BBVA":                 "bbva.com",
  "Bank Norwegian":       "banknorwegian.no",
  "Barclaycard":          "barclaycard.co.uk",
  "Barclays":             "barclays.com",
  "Binance":              "binance.com",
  "Binance EU":           "binance.com",
  "Bitpanda":             "bitpanda.com",
  "BNP Paribas":          "bnpparibas.com",
  "Bondora":              "bondora.com",
  "BoursoBank":           "boursorama.com",
  "Boursorama":           "boursorama.com",
  "Bupa Global":          "bupa.com",
  "bunq":                 "bunq.com",
  "C24 Bank":             "c24.de",
  "CaixaBank":            "caixabank.es",
  "Cardif":               "cardif.com",
  "CEC Bank":             "cecbank.ro",
  "Cetelem":              "cetelem.fr",
  "Chase UK":             "chase.co.uk",
  "Chip":                 "getchip.com",
  "Cigna Global":         "cigna.com",
  "Clearpay":             "clearpay.co.uk",
  "Cleo":                 "meetcleo.com",
  "Cofidis":              "cofidis.fr",
  "Coinbase":             "coinbase.com",
  "Credit Agricole":      "credit-agricole.com",
  "Credit Mutuel":        "creditmutuel.fr",
  "Creditea":             "creditea.com",
  "Currencies Direct":    "currenciesdirect.com",
  "CurrencyFair":         "currencyfair.com",
  "Curve":                "curve.com",
  "DEGIRO":               "degiro.com",
  "Deel":                 "deel.com",
  "Deutsche Bank":        "db.com",
  "Ebury":                "ebury.com",
  "Emma":                 "emma-app.com",
  "ERGO":                 "ergo.com",
  "eToro":                "etoro.com",
  "Ferratum":             "ferratum.com",
  "Fidelidade":           "fidelidade.pt",
  "Finom":                "finom.com",
  "Freetrade":            "freetrade.io",
  "Generali":             "generali.com",
  "Genki":                "genki.me",
  "GoHenry":              "gohenry.com",
  "GoSimpleTax":          "gosimpletax.com",
  "Greenlight":           "greenlight.com",
  "Heymondo":             "heymondo.com",
  "Holvi":                "holvi.com",
  "HSBC":                 "hsbc.com",
  "ING":                  "ing.com",
  "Insured Nomads":       "insurednomads.com",
  "Interactive Brokers":  "interactivebrokers.com",
  "Intesa Sanpaolo":      "intesasanpaolo.com",
  "Iuvo Group":           "iuvogroup.com",
  "Klarna":               "klarna.com",
  "Kraken":               "kraken.com",
  "Ledger":               "ledger.com",
  "Lemonade":             "lemonade.com",
  "Lightyear":            "lightyear.com",
  "Linxea":               "linxea.com",
  "Lloyds":               "lloydsbank.com",
  "Lunar":                "lunar.app",
  "Lydia":                "lydia.app",
  "mBank":                "mbank.pl",
  "Mettle":               "mettle.com",
  "Millennium BCP":       "millenniumbcp.pt",
  "Monese":               "monese.com",
  "Monex Europe":         "monexeurope.com",
  "MoneyGram":            "moneygram.com",
  "Monzo":                "monzo.com",
  "Moss":                 "getmoss.com",
  "N26":                  "n26.com",
  "Nationwide":           "nationwide.co.uk",
  "Nickel":               "nickel.eu",
  "OFX":                  "ofx.com",
  "Oney":                 "oney.fr",
  "OP Financial Group":   "op.fi",
  "Openbank":             "openbank.es",
  "PassportCard":         "passportcard.com",
  "PayPal":               "paypal.com",
  "Payoneer":             "payoneer.com",
  "Paysend":              "paysend.com",
  "PaySend":              "paysend.com",
  "Paysera":              "paysera.com",
  "PKO Bank Polski":      "pkobp.pl",
  "PixPay":               "pixpay.fr",
  "Pleo":                 "pleo.io",
  "Plum":                 "withplum.com",
  "Plutus":               "plutus.it",
  "Postbank":             "postbank.de",
  "Qonto":                "qonto.com",
  "Rabobank":             "rabobank.com",
  "Raiffeisen Bank":      "raiffeisen.com",
  "Raisin":               "raisin.com",
  "Remitly":              "remitly.com",
  "Remote":               "remote.com",
  "Revolut":              "revolut.com",
  "Rooster Money":        "roostermoney.com",
  "SafetyWing":           "safetywing.com",
  "Santander":            "santander.com",
  "Saxo":                 "home.saxo",
  "Scalable Capital":     "scalable.capital",
  "Scalapay":             "scalapay.com",
  "SEB":                  "seb.se",
  "Sendwave":             "sendwave.com",
  "Skrill":               "skrill.com",
  "Small World":          "smallworld.co.uk",
  "Smava":                "smava.de",
  "Snoop":                "snoop.app",
  "Société Générale":     "societegenerale.fr",
  "Sogexia":              "sogexia.com",
  "Soldo":                "soldo.com",
  "Spendesk":             "spendesk.com",
  "Starling":             "starlingbank.com",
  "Starling Bank":        "starlingbank.com",
  "Starling Kite":        "starlingbank.com",
  "Stripe":               "stripe.com",
  "Tide":                 "tide.co",
  "Tomorrow Bank":        "tomorrow.one",
  "TorFX":                "torfx.com",
  "Trade Republic":       "traderepublic.com",
  "Trading 212":          "trading212.com",
  "Trezor":               "trezor.io",
  "UniCredit":            "unicredit.eu",
  "Vivid":                "vivid.money",
  "Vivid Money":          "vivid.money",
  "Western Union":        "westernunion.com",
  "Wirex":                "wirexapp.com",
  "Wise":                 "wise.com",
  "Wise Business":        "wise.com",
  "World Nomads":         "worldnomads.com",
  "WorldNomads":          "worldnomads.com",
  "WorldRemit":           "worldremit.com",
  "XE":                   "xe.com",
  "XTB":                  "xtb.com",
  "YNAB":                 "youneedabudget.com",
  "Younited":             "younited-credit.com",
  "Younited Credit":      "younited-credit.com",
  "Zopa":                 "zopa.com",
  "Zurich":               "zurich.com",
  // WEB.6 — Catalog-expansion providers that hadn't been added to
  // the domain map yet. Each entry maps the catalog display name to
  // the brand's canonical domain so the Google favicon proxy can
  // resolve a high-res icon at build time.
  "ActivTrades":          "activtrades.com",
  "Airwallex":            "airwallex.com",
  "BlueTax":              "bluetax.eu",
  "Coinhouse":            "coinhouse.com",
  "Contabilidade Online": "contabilidadeonline.pt",
  "Cornerstone":          "cornerstone.eu",
  "Currensea":            "currensea.com",
  "Deblock":              "deblock.com",
  "Declareo":             "declareo.fr",
  "Enky Invest":          "enkyinvest.com",
  "Expatax":              "expatax.nl",
  "Fiscozen":             "fiscozen.it",
  "Hilton Honors":        "hilton.com",
  "Juste":                "juste.app",
  "Keyfin":               "keyfin.de",
  "Krak Card":            "krak.com",
  "NHR Advisors":         "nhradvisors.pt",
  "Orange Protect":       "orange.fr",
  "Quelimpôt":            "quelimpot.fr",
  "Sorted":               "sorted.com",
  "Steuergo":             "steuergo.de",
  "SumUp":                "sumup.com",
  "TaxCalc":              "taxcalc.com",
  "TaxDown":              "taxdown.es",
  "TaxSavers":            "thetaxsavers.nl",
  "Taxback Portugal":     "taxback.pt",
  "Taxfix":               "taxfix.de",
  "Wallester":            "wallester.com",
  "Waltio":               "waltio.com",
  "Wundertax":            "wundertax.de",
  "YouHodler":            "youhodler.com",
};

const SKIP_PROVIDERS = new Set(["Unknown Provider"]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function tryFetch(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return false;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 200) return false; // empty favicons / 1×1 sentinels
    writeFileSync(destPath, buf);
    return true;
  } catch {
    return false;
  }
}

async function downloadLogo(domain: string, destPath: string): Promise<"ok" | "error"> {
  // WEB.6 — Multi-source fallback chain. The previous single-source
  // (Google favicon proxy) failed on ~20% of providers because some
  // brand domains either lack a proper apple-touch-icon or block
  // Google's crawler. We now try, in order:
  //   1. Clearbit Logo API — clean square PNG, no auth needed for
  //      low-volume one-shot ingestion.
  //   2. Google favicon V2 at size 128 — slightly higher than 64,
  //      catches more brands with a real icon.
  //   3. Google favicon V2 at size 64 — final fallback for the cases
  //      that worked before.
  // First success wins; if all fail we report "error" and the slug
  // stays out of KNOWN_LOGOS so the row falls back to provider
  // initials.
  const candidates = [
    `https://logo.clearbit.com/${domain}?size=128`,
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`,
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=64`,
  ];
  for (const url of candidates) {
    if (await tryFetch(url, destPath)) return "ok";
  }
  return "error";
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  mkdirSync(LOGOS_DIR, { recursive: true });

  // Collect all unique provider names from catalogue files via regex
  const CATALOG_FILES = [
    join(__dirname, "../src/features/catalog/marketplace-offers.ts"),
    join(__dirname, "../src/features/catalog/new-categories-catalog.ts"),
    join(__dirname, "../src/features/catalog/catalog-expansion.ts"),
    join(__dirname, "../src/features/catalog/mock-data.ts"),
    join(__dirname, "../src/features/catalog/marketplace-expanded-offers.ts"),
    join(__dirname, "../src/features/catalog/marketplace-fallback-offers.ts"),
  ];

  const allNames = new Set<string>();
  for (const f of CATALOG_FILES) {
    if (!existsSync(f)) continue;
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/providerName:\s*["']([^"']+)["']/g)) {
      allNames.add(m[1]);
    }
  }

  const providers = [...allNames].filter((n) => !SKIP_PROVIDERS.has(n));
  console.log(`Found ${providers.length} unique providers\n`);

  let downloaded = 0, skippedExists = 0, noDomain = 0, errors = 0;
  const succeededSlugs: string[] = [];
  const seenSlugs = new Set<string>();

  for (const name of providers) {
    const slug = toSlug(name);

    // Deduplicate slugs (e.g. "Wise Business" → same slug as "Wise" after dedup)
    if (seenSlugs.has(slug)) {
      if (existsSync(join(LOGOS_DIR, `${slug}.png`))) {
        succeededSlugs.push(slug);
      }
      continue;
    }
    seenSlugs.add(slug);

    const destPath = join(LOGOS_DIR, `${slug}.png`);

    if (existsSync(destPath)) {
      console.log(`⏭  Exists:    ${name} → ${slug}.png`);
      succeededSlugs.push(slug);
      skippedExists++;
      continue;
    }

    const domain = PROVIDER_DOMAINS[name];
    if (!domain) {
      console.log(`⚠  No domain: ${name}`);
      noDomain++;
      continue;
    }

    await sleep(DELAY_MS);
    const result = await downloadLogo(domain, destPath);

    if (result === "ok") {
      console.log(`✓  Downloaded: ${name} → ${slug}.png`);
      succeededSlugs.push(slug);
      downloaded++;
    } else {
      console.log(`✗  Failed:     ${name} [${domain}]`);
      errors++;
    }
  }

  // Merge existing SVG slugs into the manifest (the 9 that were there before)
  const existingSvgSlugs = [
    "wise", "revolut", "n26", "klarna", "coinbase",
    "bnp-paribas", "santander", "smava", "auxmoney",
  ];
  for (const s of existingSvgSlugs) {
    if (!succeededSlugs.includes(s)) succeededSlugs.push(s);
  }

  const uniqueSlugs = [...new Set(succeededSlugs)].sort();

  // ─── Write manifest ──────────────────────────────────────────────────────
  const manifestLines = uniqueSlugs.map((s) => `  "${s}",`).join("\n");
  const manifest = `// Regenerate via: npx tsx apps/web/scripts/ingest-provider-logos.ts
// Do not edit by hand.
export const KNOWN_LOGOS = new Set<string>([
${manifestLines}
]);
`;
  writeFileSync(MANIFEST_PATH, manifest);

  console.log(`\n── Summary ────────────────────────────────────────`);
  console.log(`  Downloaded:  ${downloaded}`);
  console.log(`  Exists/skip: ${skippedExists}`);
  console.log(`  No domain:   ${noDomain}`);
  console.log(`  Errors/skip: ${errors}`);
  console.log(`  Manifest:    ${uniqueSlugs.length} logos registered`);
}

main().catch((e) => { console.error(e); process.exit(1); });
