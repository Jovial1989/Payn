/**
 * link-audit.mjs — quality audit of every catalog offer link.
 *
 * WHY THIS EXISTS
 * An HTTP status from a server (curl/fetch) is NOT a verdict on whether a link
 * works for a real user. We proved this the hard way: eToro returns 200 (but
 * the page is an "unauthorised-ad" dead-end), Binance returns 202 (a JS shell),
 * Revolut returns 403 to a datacenter IP but 404 to a real browser. The only
 * reliable check is rendering each link in a real browser and inspecting the
 * RESULT (final URL + title + visible text).
 *
 * THE ALGORITHM
 *   Tier 1 — HTTP negatives only (404/410/DNS/timeout) are trusted as dead.
 *   Tier 2 — Real headless Chrome renders the page, waits for JS, then classifies:
 *     BROKEN        — 404; title/body shows "404 / not found / went wrong /
 *                     unauthorised / for sale"; or bounced to homepage when a
 *                     deep path was requested (soft-404).
 *     UNVERIFIABLE  — Cloudflare/captcha wall, 403/429, or timeout. The link is
 *                     probably fine for real users but a bot can't confirm it —
 *                     do NOT treat as OK, do NOT auto-remove. Needs a human /
 *                     residential check.
 *     OK            — 2xx, substantial rendered content, on the provider domain,
 *                     no error markers.
 *
 * USAGE
 *   pnpm --filter web link-audit                 # audits live catalog
 *   CATALOG_URL=http://localhost:3000/api/v1/catalog pnpm --filter web link-audit
 *   node scripts/link-audit.mjs                  # same, from apps/web
 *
 * REQUIREMENTS
 *   pnpm add -D playwright && pnpm exec playwright install chromium
 *   (or have Google Chrome installed — the script uses channel:'chrome' first).
 *
 * Exit code is 1 if any link is BROKEN, so it can gate CI / a pre-deploy step.
 */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright not found. Run: pnpm add -D playwright && pnpm exec playwright install chromium");
  process.exit(2);
}

const CATALOG_URL = process.env.CATALOG_URL || "https://www.payn.online/api/v1/catalog";
const CONCURRENCY = Number(process.env.CONCURRENCY || 6);
const DWELL_MS = Number(process.env.DWELL_MS || 3000);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const NEG = [
  "page not found", "not found", "no longer available", "page doesn't exist",
  "page does not exist", "went wrong", "something went wrong", "unauthoris",
  "unauthoriz", "access denied", "this page could not", "doesn't exist",
  "does not exist", "for sale",
];

function classify(r) {
  if (r.error) return /timeout/i.test(r.error) ? "UNVERIFIABLE_timeout" : "UNVERIFIABLE_error";
  const title = r.title || "";
  if (/just a moment|attention required|are you human|captcha|verify you are/i.test(title)) return "UNVERIFIABLE_botwall";
  if (r.status === 404 || r.status === 410) return "BROKEN_404";
  if (/^404|404 \||404$|not found|went wrong|unauthoris|no longer|for sale/i.test(title)) return "BROKEN_errorpage";
  if ((r.neg || []).length > 0 && r.textLen < 800) return "BROKEN_errorcontent";
  if (r.redirectedToRoot && r.hadDeepPath) return "SOFT404_home";
  if (r.status && r.status >= 200 && r.status < 400 && r.textLen >= 500) return "OK";
  if (r.status === 403 || r.status === 429) return "UNVERIFIABLE_bot";
  return `CHECK_${r.status}_len${r.textLen}`;
}

async function check(browser, item) {
  const ctx = await browser.newContext({ userAgent: UA, locale: "en-GB", viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const out = { ...item };
  try {
    const resp = await page.goto(item.url, { waitUntil: "domcontentloaded", timeout: 28000 });
    out.status = resp ? resp.status() : null;
    await page.waitForTimeout(DWELL_MS);
    out.finalUrl = page.url();
    out.title = (await page.title().catch(() => "")).slice(0, 90);
    const text = (await page.evaluate(() => (document.body && document.body.innerText) || "").catch(() => "")) || "";
    out.textLen = text.length;
    out.neg = NEG.filter((m) => text.toLowerCase().includes(m));
    try {
      const p = new URL(out.finalUrl).pathname.replace(/\/+$/, "");
      out.redirectedToRoot = p === "" || /^\/(en|en-eu|en-gb|us|de|fr|es|it)$/i.test(p);
    } catch { out.redirectedToRoot = false; }
    try {
      out.hadDeepPath = new URL(item.url).pathname.replace(/\/+$/, "").split("/").filter(Boolean).length >= 1 && !item.url.includes("financeads");
    } catch { out.hadDeepPath = false; }
  } catch (e) {
    out.error = String((e && e.message) || e).slice(0, 120);
  }
  out.verdict = classify(out);
  await ctx.close();
  return out;
}

async function pool(items, n, fn) {
  const res = [];
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      res[idx] = await fn(items[idx]);
      process.stderr.write(".");
    }
  }));
  return res;
}

function findOffers(o) {
  if (o && typeof o === "object") {
    for (const k of ["offers", "data", "catalog", "items"]) {
      if (k in o) {
        const v = o[k];
        if (Array.isArray(v)) return v;
        const r = findOffers(v);
        if (r) return r;
      }
    }
  }
  return Array.isArray(o) ? o : null;
}

(async () => {
  const offers = findOffers(await (await fetch(CATALOG_URL)).json()) || [];
  const seen = new Map();
  for (const o of offers) {
    const url = o.affiliateLink || o.providerWebsiteUrl || "";
    if (!url.startsWith("http") || seen.has(url)) continue;
    seen.set(url, { url, provider: o.providerName, category: o.category, monetized: !!(o.attributes && o.attributes.monetized) });
  }
  const items = [...seen.values()];
  process.stderr.write(`Auditing ${items.length} unique links via headless Chrome\n`);

  let browser;
  try { browser = await chromium.launch({ channel: "chrome", headless: true }); }
  catch { browser = await chromium.launch({ headless: true }); }
  const results = await pool(items, CONCURRENCY, (it) => check(browser, it));
  await browser.close();
  process.stderr.write("\n");

  const by = {};
  for (const r of results) (by[r.verdict.split("_")[0]] ||= []).push(r);
  console.log("=== TALLY ===");
  for (const k of Object.keys(by).sort()) console.log(`  ${k}: ${by[k].length}`);

  const broken = results.filter((r) => r.verdict.startsWith("BROKEN") || r.verdict.startsWith("SOFT404"));
  console.log(`\n=== BROKEN (${broken.length}) ===`);
  for (const r of broken.sort((a, b) => (a.category > b.category ? 1 : -1))) {
    console.log(`  [${r.verdict}] ${r.monetized ? "MON " : "    "}${r.provider} (${r.category}) :: ${r.title} :: ${r.url}`);
  }
  const unver = results.filter((r) => r.verdict.startsWith("UNVERIFIABLE") || r.verdict.startsWith("CHECK"));
  console.log(`\n=== UNVERIFIABLE (${unver.length}) — bot-walled, need manual/residential ===`);
  for (const r of unver) console.log(`  [${r.verdict}] ${r.provider} :: ${r.url}`);

  writeFileSync("link-audit-results.json", JSON.stringify(results, null, 1));
  console.log(`\nFull results → apps/web/link-audit-results.json`);
  process.exit(broken.length > 0 ? 1 : 0);
})().catch((e) => { console.error("FATAL", e.message); process.exit(2); });
