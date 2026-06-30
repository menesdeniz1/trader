import { NextRequest, NextResponse } from "next/server";
import { STOCKS, FALLBACK_USD_TRY } from "@/lib/mockStocks";
import { fetchYahooQuote, YahooQuote } from "@/lib/yahooFinance";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 45_000;
const USD_TRY_YAHOO_SYMBOL = "USDTRY=X";
const cache = new Map<string, { data: YahooQuote | null; ts: number }>();

async function getQuote(symbol: string, yahooSymbol: string): Promise<YahooQuote | null> {
  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }
  const data = await fetchYahooQuote(yahooSymbol);
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

  const [settled, usdTryQuote] = await Promise.all([
    Promise.allSettled(
      stocks.map(async (stock) => ({
        symbol: stock.symbol,
        quote: await getQuote(stock.symbol, stock.yahooSymbol),
      }))
    ),
    getQuote("USDTRY", USD_TRY_YAHOO_SYMBOL),
  ]);

  const quotes: Record<string, YahooQuote | null> = {};
  for (const result of settled) {
    if (result.status === "fulfilled") {
      quotes[result.value.symbol] = result.value.quote;
    } else {
      // Network/parse failure for this symbol: surface as unavailable, not a fake value.
    }
  }

  const usdTry = usdTryQuote?.price ?? FALLBACK_USD_TRY;

  return NextResponse.json({ updatedAt: new Date().toISOString(), quotes, usdTry });
}
