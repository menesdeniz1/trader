const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";
const HISTORY_RANGE = "3mo";
const SPARKLINE_POINTS = 30;

export interface YahooQuote {
  price: number;
  prevClose: number;
  history: number[];
}

interface YahooChartResult {
  indicators: { quote: Array<{ close: Array<number | null> }> };
}

interface YahooChartResponse {
  chart: { result: YahooChartResult[] | null };
}

/**
 * Fetches daily close history for a ticker from Yahoo Finance's unofficial,
 * key-less chart endpoint (the same one yfinance and other open-source tools
 * use). Returns null whenever the symbol isn't covered or the request fails,
 * so callers must treat that as "no live data" rather than fabricate a price.
 */
export async function fetchYahooQuote(yahooSymbol: string): Promise<YahooQuote | null> {
  const url = `${YAHOO_CHART_URL}${encodeURIComponent(yahooSymbol)}?range=${HISTORY_RANGE}&interval=1d`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DemoTraderBot/1.0)" },
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  let data: YahooChartResponse;
  try {
    data = await res.json();
  } catch {
    return null;
  }

  return parseYahooChart(data);
}

export function parseYahooChart(data: YahooChartResponse): YahooQuote | null {
  const result = data.chart?.result?.[0];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const valid = closes.filter((c): c is number => typeof c === "number" && Number.isFinite(c));

  if (valid.length < 2) return null;

  return {
    price: valid[valid.length - 1],
    prevClose: valid[valid.length - 2],
    history: valid.slice(-SPARKLINE_POINTS),
  };
}
