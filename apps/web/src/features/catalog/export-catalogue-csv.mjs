#!/usr/bin/env node
// Run: node src/features/catalog/export-catalogue-csv.mjs > provider-catalogue.csv
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Parse entries from the TypeScript source without transpiling
const __dir = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dir, "provider-catalogue.ts"), "utf8");

// Extract the array literal between first `[` after `providerCatalogue:` and matching `]`
const start = src.indexOf("providerCatalogue: ProviderEntry[] = [") + "providerCatalogue: ProviderEntry[] = [".length;
const block = src.slice(start, src.lastIndexOf("];"));

// Parse each { ... } object (handles nested strings but not nested objects)
const objects = [];
let depth = 0, current = "";
for (const ch of block) {
  if (ch === "{") { depth++; current += ch; }
  else if (ch === "}") { depth--; current += ch; if (depth === 0 && current.trim().length > 2) { objects.push(current.trim()); current = ""; } }
  else { current += ch; }
}

function extractField(obj, field) {
  const re = new RegExp(`${field}:\\s*("(?:[^"\\\\]|\\\\.)*"|\\[[^\\]]*\\])`, "s");
  const m = obj.match(re);
  if (!m) return "";
  const raw = m[1].trim();
  if (raw.startsWith("[")) return raw.replace(/[\[\]"]/g, "").replace(/,\s*/g, "; ");
  return raw.slice(1, -1).replace(/\\"/g, '"');
}

const fields = ["rank","provider","product","category","markets","headline_metric","amount_limit","term","fx_fee","atm_fee","cashback_reward","best_for","pros","watch_out","provider_url","url_type","url_verified_at"];

const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;

process.stdout.write(fields.map(escape).join(",") + "\n");
for (const obj of objects) {
  const row = fields.map((f) => escape(extractField(obj, f)));
  process.stdout.write(row.join(",") + "\n");
}
process.stderr.write(`Exported ${objects.length} entries.\n`);
