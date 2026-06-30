import { NextRequest, NextResponse } from "next/server";
import { STOCKS } from "@/lib/mockStocks";
import { fetchStooqQuote, StooqQuote } from "@/lib/stooq";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 45_000;
const cache = new Map<string, { data: StooqQuote | null; ts: number }>();

async function getQuote(symbol: string, stooqSymbol: string): Promise<StooqQuote | null> {
  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }
  const data = await fetchStooqQuote(stooqSymbol);
  cache.set(symbol, { data, ts: Date.now() });
  return data;
}

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  const requested = symbolsParam
    ? symbolsParam
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    : STOCKS.map((s) => s.symbol);

  const stocks = STOCKS.filter((s) => requested.includes(s.symbol));

  const settled = await Promise.allSettled(
    stocks.map(async (stock) => ({
      symbol: stock.symbol,
      quote: await getQuote(stock.symbol, stock.stooqSymbol),
    }))
  );

  const quotes: Record<string, StooqQuote | null> = {};
  for (const result of settled) {
    if (result.status === "fulfilled") {
      quotes[result.value.symbol] = result.value.quote;
    } else {
      // Network/parse failure for this symbol: surface as unavailable, not a fake value.
    }
  }

  return NextResponse.json({ updatedAt: new Date().toISOString(), quotes });
}
