import { Stock } from "./types";

export interface DynamicQuoteMeta {
  name: string;
  currency: string;
  exchange: string;
}

// Sabit STOCKS listesinde olmayan bir sembol için, Yahoo'dan dönen meta
// bilgisinden (ad, para birimi, borsa) anlık bir Stock nesnesi kurar.
// Arama yalnızca BIST (IST) ve ABD borsalarıyla sınırlandırıldığı için
// (bkz. yahooFinance.ts) bu iki para birimi varsayımı her zaman geçerlidir.
export function buildDynamicStock(symbol: string, quote: DynamicQuoteMeta): Stock {
  const isBist = quote.exchange === "IST";
  return {
    symbol,
    name: quote.name,
    market: isBist ? "BIST" : "US",
    currency: isBist ? "TRY" : "USD",
    sector: "—",
    yahooSymbol: symbol,
  };
}
