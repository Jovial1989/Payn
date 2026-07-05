#!/usr/bin/env node
// P0.5 — fail the build if internal implementation-rationale jargon leaks into
// user-facing source. Multi-word phrases only, so code identifiers (router,
// workflow, flex-flow, next/navigation routes) never trip the guard.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const BANNED = [
  "read-only context",
  "session continuity",
  "saved-session",
  "analytics flow",
  "browse-and-analytics",
  "duplicated card blocks",
  "duplicated sections",
  "no card grid",
  "card routes",
];

const SCAN_DIRS = ["src/app", "src/components", "src/features", "src/copy"];

function walk(dir) {
  let out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out = out.concat(walk(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const hits = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const text = readFileSync(file, "utf8").toLowerCase();
    for (const phrase of BANNED) {
      if (text.includes(phrase)) hits.push(`${file} → "${phrase}"`);
    }
  }
}

if (hits.length > 0) {
  console.error("\n✗ Banned implementation-jargon in user-facing source (P0.5):\n");
  for (const h of hits) console.error("  " + h);
  console.error("\nRewrite to address the user's job, not the product's internals.\n");
  process.exit(1);
}
console.log("✓ check:copy — no banned phrases in user-facing source.");
