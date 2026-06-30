const STOOQ_HISTORY_URL = "https://stooq.com/q/d/l/";
const HISTORY_DAYS_BACK = 90;
const SPARKLINE_POINTS = 30;

export interface StooqQuote {
  price: number;
  prevClose: number;
  history: number[];
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

/**
 * Fetches daily OHLCV history for a ticker from Stooq's free, key-less CSV
 * endpoint (the same links Stooq publishes for spreadsheet import). Returns
 * null whenever the symbol isn't covered or the request fails, so callers
 * must treat that as "no live data" rather than fabricate a price.
 */
export async function fetchStooqQuote(stooqSymbol: string): Promise<StooqQuote | null> {
  const d2 = new Date();
  const d1 = new Date();
  d1.setDate(d1.getDate() - HISTORY_DAYS_BACK);

  const url = `${STOOQ_HISTORY_URL}?s=${encodeURIComponent(stooqSymbol)}&d1=${formatDate(d1)}&d2=${formatDate(d2)}&i=d`;

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

  const text = await res.text();
  return parseStooqCsv(text);
}

export function parseStooqCsv(csvText: string): StooqQuote | null {
  const lines = csvText.trim().split("\n").filter(Boolean);
  if (lines.length < 3 || !lines[0].startsWith("Date,")) {
    // Unknown symbol responses look like "No data" / "N/D" instead of a CSV header.
    return null;
  }

  const closes: number[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const close = Number(cols[4]);
    if (Number.isFinite(close)) closes.push(close);
  }

  if (closes.length < 2) return null;

  return {
    price: closes[closes.length - 1],
    prevClose: closes[closes.length - 2],
    history: closes.slice(-SPARKLINE_POINTS),
  };
}
