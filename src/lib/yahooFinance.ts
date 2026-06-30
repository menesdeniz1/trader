const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";
const YAHOO_SEARCH_URL = "https://query1.finance.yahoo.com/v1/finance/search";
const HISTORY_RANGE = "3mo";
const SPARKLINE_POINTS = 30;

export interface YahooQuote {
  price: number;
  prevClose: number;
  history: number[];
  name: string;
  currency: string;
  exchange: string;
}

interface YahooChartMeta {
  currency?: string;
  exchangeName?: string;
  longName?: string;
  shortName?: string;
  symbol: string;
}

interface YahooChartResult {
  meta: YahooChartMeta;
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

  if (valid.length < 2 || !result) return null;

  return {
    price: valid[valid.length - 1],
    prevClose: valid[valid.length - 2],
    history: valid.slice(-SPARKLINE_POINTS),
    name: result.meta.longName ?? result.meta.shortName ?? result.meta.symbol,
    currency: result.meta.currency ?? "USD",
    exchange: result.meta.exchangeName ?? "",
  };
}

export interface YahooSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

interface YahooSearchQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  exchange?: string;
}

interface YahooSearchResponse {
  quotes?: YahooSearchQuote[];
}

// BIST (Istanbul) ve başlıca ABD borsaları (Nasdaq/NYSE/NYSE American/Arca/Cboe BZX).
// Uygulama yalnızca TRY ve USD kuru biliyor; arama sonuçları bu borsalarla
// sınırlanarak Frankfurt/Tokyo gibi diğer para birimlerindeki yinelenen
// kayıtlar (ör. "Tesla Inc. (Frankfurt)") elenir.
const ALLOWED_SEARCH_EXCHANGES = new Set(["NMS", "NYQ", "NGM", "NCM", "ASE", "PCX", "BTS", "IST"]);

/**
 * Yahoo Finance'in ücretsiz, anahtarsız arama/otomatik tamamlama uç noktasını
 * kullanarak serbest metin sorgusuna (sembol veya şirket adı) göre hisse/ETF
 * arar. Sabit STOCKS listesinde olmayan semboller dahil her şeyi bulabilir.
 */
export async function searchYahooSymbols(query: string): Promise<YahooSearchResult[]> {
  const url = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DemoTraderBot/1.0)" },
    });
  } catch {
    return [];
  }

  if (!res.ok) return [];

  let data: YahooSearchResponse;
  try {
    data = await res.json();
  } catch {
    return [];
  }

  return (data.quotes ?? [])
    .filter(
      (q) =>
        (q.quoteType === "EQUITY" || q.quoteType === "ETF") &&
        q.exchange &&
        ALLOWED_SEARCH_EXCHANGES.has(q.exchange)
    )
    .map((q) => ({
      symbol: q.symbol,
      name: q.longname ?? q.shortname ?? q.symbol,
      exchange: q.exchange ?? "",
    }));
}
