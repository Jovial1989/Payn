import { NextRequest, NextResponse } from "next/server";
import { normalizeFxCurrency } from "@/lib/fx-quote";
import { getFxQuote } from "@/server/fx/fx-quote-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fromCurrency = normalizeFxCurrency(searchParams.get("from"), "EUR");
  const toCurrency = normalizeFxCurrency(searchParams.get("to"), "USD");
  const payload = await getFxQuote({ fromCurrency, toCurrency });

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": payload.unavailable
        ? "no-store"
        : payload.delayed
          ? "public, s-maxage=1800, stale-while-revalidate=3600"
          : "public, s-maxage=300, stale-while-revalidate=900",
      "X-Payn-Fx-Key": `${fromCurrency}:${toCurrency}`,
    },
  });
}
