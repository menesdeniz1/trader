import { Stock } from "./types";

// Yalnızca canlı USD/TRY kuru (bkz. app/api/quotes) hiç alınamadığında kullanılan
// son çare yedek değer. Normal koşullarda Yahoo Finance'ten gelen güncel kur kullanılır.
export const FALLBACK_USD_TRY = 40;

// yahooSymbol alanları Yahoo Finance'in ücretsiz, anahtarsız chart alıntı
// servisinde kullanılan biçimdir. ABD hisseleri için çıplak ticker (örn. "AAPL"),
// BIST hisseleri için ".IS" eki kullanılır. Bir sembol için veri dönmezse o
// hisse otomatik olarak "veri yok" sayılır ve alım-satımı kapatılır
// (bkz. MarketContext / app/api/quotes).
export const STOCKS: Stock[] = [
  { symbol: "THYAO", name: "Türk Hava Yolları", market: "BIST", currency: "TRY", sector: "Ulaştırma", yahooSymbol: "THYAO.IS" },
  { symbol: "ASELS", name: "Aselsan", market: "BIST", currency: "TRY", sector: "Savunma", yahooSymbol: "ASELS.IS" },
  { symbol: "GARAN", name: "Garanti BBVA", market: "BIST", currency: "TRY", sector: "Bankacılık", yahooSymbol: "GARAN.IS" },
  { symbol: "AKBNK", name: "Akbank", market: "BIST", currency: "TRY", sector: "Bankacılık", yahooSymbol: "AKBNK.IS" },
  { symbol: "BIMAS", name: "BİM Mağazalar", market: "BIST", currency: "TRY", sector: "Perakende", yahooSymbol: "BIMAS.IS" },
  { symbol: "KCHOL", name: "Koç Holding", market: "BIST", currency: "TRY", sector: "Holding", yahooSymbol: "KCHOL.IS" },
  { symbol: "SASA", name: "Sasa Polyester", market: "BIST", currency: "TRY", sector: "Kimya", yahooSymbol: "SASA.IS" },
  { symbol: "EREGL", name: "Ereğli Demir Çelik", market: "BIST", currency: "TRY", sector: "Demir Çelik", yahooSymbol: "EREGL.IS" },
  { symbol: "TUPRS", name: "Tüpraş", market: "BIST", currency: "TRY", sector: "Enerji", yahooSymbol: "TUPRS.IS" },
  { symbol: "SAHOL", name: "Sabancı Holding", market: "BIST", currency: "TRY", sector: "Holding", yahooSymbol: "SAHOL.IS" },
  { symbol: "AAPL", name: "Apple Inc.", market: "US", currency: "USD", sector: "Teknoloji", yahooSymbol: "AAPL" },
  { symbol: "MSFT", name: "Microsoft Corp.", market: "US", currency: "USD", sector: "Teknoloji", yahooSymbol: "MSFT" },
  { symbol: "GOOGL", name: "Alphabet Inc.", market: "US", currency: "USD", sector: "Teknoloji", yahooSymbol: "GOOGL" },
  { symbol: "AMZN", name: "Amazon.com Inc.", market: "US", currency: "USD", sector: "E-ticaret", yahooSymbol: "AMZN" },
  { symbol: "TSLA", name: "Tesla Inc.", market: "US", currency: "USD", sector: "Otomotiv", yahooSymbol: "TSLA" },
  { symbol: "NVDA", name: "NVIDIA Corp.", market: "US", currency: "USD", sector: "Teknoloji", yahooSymbol: "NVDA" },
  { symbol: "META", name: "Meta Platforms", market: "US", currency: "USD", sector: "Teknoloji", yahooSymbol: "META" },
  { symbol: "NFLX", name: "Netflix Inc.", market: "US", currency: "USD", sector: "Medya", yahooSymbol: "NFLX" },
  { symbol: "DIS", name: "The Walt Disney Co.", market: "US", currency: "USD", sector: "Medya", yahooSymbol: "DIS" },
  { symbol: "KO", name: "Coca-Cola Co.", market: "US", currency: "USD", sector: "Tüketim", yahooSymbol: "KO" },
  { symbol: "QQQ", name: "Invesco QQQ Trust (Nasdaq-100)", market: "US", currency: "USD", sector: "ETF", yahooSymbol: "QQQ" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", market: "US", currency: "USD", sector: "ETF", yahooSymbol: "VOO" },
];

export function getStock(symbol: string): Stock | undefined {
  return STOCKS.find((s) => s.symbol === symbol);
}
