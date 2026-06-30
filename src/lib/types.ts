export type Market = "BIST" | "US";

export interface Stock {
  symbol: string;
  name: string;
  market: Market;
  currency: "TRY" | "USD";
  sector: string;
  /** Ticker used to query the Stooq free quote API (e.g. "aapl.us", "thyao.tr"). */
  stooqSymbol: string;
}

export interface Holding {
  symbol: string;
  quantity: number;
  avgCost: number;
}

export type TransactionSide = "BUY" | "SELL";

export interface Transaction {
  id: string;
  symbol: string;
  side: TransactionSide;
  quantity: number;
  price: number;
  total: number;
  date: string;
}
