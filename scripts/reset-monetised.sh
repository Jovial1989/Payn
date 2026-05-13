#!/usr/bin/env bash
set -euo pipefail

PAYN_URL="${PAYN_URL:-https://www.payn.online}"
LOGIN_URL="$PAYN_URL/api/v1/admin/login"
SEED_URL="$PAYN_URL/api/v1/admin/offers/seed"
RESET_URL="$PAYN_URL/api/v1/admin/offers/reset-monetised"
JAR="/tmp/payn-admin-$$.jar"

: "${ADMIN_USERNAME:?Set ADMIN_USERNAME}"
: "${ADMIN_PASSWORD:?Set ADMIN_PASSWORD}"

cleanup() { rm -f "$JAR"; }
trap cleanup EXIT

echo "→ Logging in…"
LOGIN=$(curl -sf -c "$JAR" -X POST "$LOGIN_URL" \
  -H "content-type: application/json" \
  -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}")
echo "  $LOGIN"

echo "→ Seeding offers from static catalogue…"
SEED=$(curl -sf -b "$JAR" -X POST "$SEED_URL")
echo "  $SEED"

echo "→ Resetting is_monetised to false on all rows…"
RESET=$(curl -sf -b "$JAR" -X POST "$RESET_URL")
echo "  $RESET"

echo "Done."
