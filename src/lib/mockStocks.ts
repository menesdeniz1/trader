import { Stock } from "./types";

// Demo amaçlı sabit kur (gerçek piyasa verisi değildir, sadece TRY toplamı göstermek içindir).
export const USD_TRY = 32.5;

// stooqSymbol alanları Stooq'un (stooq.com) ücretsiz, anahtarsız CSV alıntı
// servisinde kullanılan biçimdir. ABD hisseleri için ".us" eki yaygın ve
// güvenilir şekilde çalışır. BIST hisseleri için ".tr" eki denenir; Stooq bir
// sembol için veri döndürmezse o hisse otomatik olarak "veri yok" sayılır ve
// alım-satımı kapatılır (bkz. MarketContext / app/api/quotes).
export const STOCKS: Stock[] = [
  { symbol: "THYAO", name: "Türk Hava Yolları", market: "BIST", currency: "TRY", sector: "Ulaştırma", stooqSymbol: "thyao.tr" },
  { symbol: "ASELS", name: "Aselsan", market: "BIST", currency: "TRY", sector: "Savunma", stooqSymbol: "asels.tr" },
  { symbol: "GARAN", name: "Garanti BBVA", market: "BIST", currency: "TRY", sector: "Bankacılık", stooqSymbol: "garan.tr" },
  { symbol: "AKBNK", name: "Akbank", market: "BIST", currency: "TRY", sector: "Bankacılık", stooqSymbol: "akbnk.tr" },
  { symbol: "BIMAS", name: "BİM Mağazalar", market: "BIST", currency: "TRY", sector: "Perakende", stooqSymbol: "bimas.tr" },
  { symbol: "KCHOL", name: "Koç Holding", market: "BIST", currency: "TRY", sector: "Holding", stooqSymbol: "kchol.tr" },
  { symbol: "SASA", name: "Sasa Polyester", market: "BIST", currency: "TRY", sector: "Kimya", stooqSymbol: "sasa.tr" },
  { symbol: "EREGL", name: "Ereğli Demir Çelik", market: "BIST", currency: "TRY", sector: "Demir Çelik", stooqSymbol: "eregl.tr" },
  { symbol: "TUPRS", name: "Tüpraş", market: "BIST", currency: "TRY", sector: "Enerji", stooqSymbol: "tuprs.tr" },
  { symbol: "SAHOL", name: "Sabancı Holding", market: "BIST", currency: "TRY", sector: "Holding", stooqSymbol: "sahol.tr" },
  { symbol: "AAPL", name: "Apple Inc.", market: "US", currency: "USD", sector: "Teknoloji", stooqSymbol: "aapl.us" },
  { symbol: "MSFT", name: "Microsoft Corp.", market: "US", currency: "USD", sector: "Teknoloji", stooqSymbol: "msft.us" },
  { symbol: "GOOGL", name: "Alphabet Inc.", market: "US", currency: "USD", sector: "Teknoloji", stooqSymbol: "googl.us" },
  { symbol: "AMZN", name: "Amazon.com Inc.", market: "US", currency: "USD", sector: "E-ticaret", stooqSymbol: "amzn.us" },
  { symbol: "TSLA", name: "Tesla Inc.", market: "US", currency: "USD", sector: "Otomotiv", stooqSymbol: "tsla.us" },
  { symbol: "NVDA", name: "NVIDIA Corp.", market: "US", currency: "USD", sector: "Teknoloji", stooqSymbol: "nvda.us" },
  { symbol: "META", name: "Meta Platforms", market: "US", currency: "USD", sector: "Teknoloji", stooqSymbol: "meta.us" },
  { symbol: "NFLX", name: "Netflix Inc.", market: "US", currency: "USD", sector: "Medya", stooqSymbol: "nflx.us" },
  { symbol: "DIS", name: "The Walt Disney Co.", market: "US", currency: "USD", sector: "Medya", stooqSymbol: "dis.us" },
  { symbol: "KO", name: "Coca-Cola Co.", market: "US", currency: "USD", sector: "Tüketim", stooqSymbol: "ko.us" },
];

export function getStock(symbol: string): Stock | undefined {
  return STOCKS.find((s) => s.symbol === symbol);
}
