import { Stock } from "./types";

// Demo amaçlı sabit kur (gerçek piyasa verisi değildir).
export const USD_TRY = 32.5;

export const STOCKS: Stock[] = [
  { symbol: "THYAO", name: "Türk Hava Yolları", market: "BIST", currency: "TRY", basePrice: 287.5, sector: "Ulaştırma" },
  { symbol: "ASELS", name: "Aselsan", market: "BIST", currency: "TRY", basePrice: 84.3, sector: "Savunma" },
  { symbol: "GARAN", name: "Garanti BBVA", market: "BIST", currency: "TRY", basePrice: 121.9, sector: "Bankacılık" },
  { symbol: "AKBNK", name: "Akbank", market: "BIST", currency: "TRY", basePrice: 64.2, sector: "Bankacılık" },
  { symbol: "BIMAS", name: "BİM Mağazalar", market: "BIST", currency: "TRY", basePrice: 512.0, sector: "Perakende" },
  { symbol: "KCHOL", name: "Koç Holding", market: "BIST", currency: "TRY", basePrice: 178.4, sector: "Holding" },
  { symbol: "SASA", name: "Sasa Polyester", market: "BIST", currency: "TRY", basePrice: 12.7, sector: "Kimya" },
  { symbol: "EREGL", name: "Ereğli Demir Çelik", market: "BIST", currency: "TRY", basePrice: 41.6, sector: "Demir Çelik" },
  { symbol: "TUPRS", name: "Tüpraş", market: "BIST", currency: "TRY", basePrice: 154.8, sector: "Enerji" },
  { symbol: "SAHOL", name: "Sabancı Holding", market: "BIST", currency: "TRY", basePrice: 91.3, sector: "Holding" },
  { symbol: "AAPL", name: "Apple Inc.", market: "US", currency: "USD", basePrice: 213.4, sector: "Teknoloji" },
  { symbol: "MSFT", name: "Microsoft Corp.", market: "US", currency: "USD", basePrice: 441.2, sector: "Teknoloji" },
  { symbol: "GOOGL", name: "Alphabet Inc.", market: "US", currency: "USD", basePrice: 178.6, sector: "Teknoloji" },
  { symbol: "AMZN", name: "Amazon.com Inc.", market: "US", currency: "USD", basePrice: 198.3, sector: "E-ticaret" },
  { symbol: "TSLA", name: "Tesla Inc.", market: "US", currency: "USD", basePrice: 256.9, sector: "Otomotiv" },
  { symbol: "NVDA", name: "NVIDIA Corp.", market: "US", currency: "USD", basePrice: 134.7, sector: "Teknoloji" },
  { symbol: "META", name: "Meta Platforms", market: "US", currency: "USD", basePrice: 521.8, sector: "Teknoloji" },
  { symbol: "NFLX", name: "Netflix Inc.", market: "US", currency: "USD", basePrice: 689.1, sector: "Medya" },
  { symbol: "DIS", name: "The Walt Disney Co.", market: "US", currency: "USD", basePrice: 112.5, sector: "Medya" },
  { symbol: "KO", name: "Coca-Cola Co.", market: "US", currency: "USD", basePrice: 64.8, sector: "Tüketim" },
];

export function getStock(symbol: string): Stock | undefined {
  return STOCKS.find((s) => s.symbol === symbol);
}
