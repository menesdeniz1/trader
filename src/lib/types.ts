export type Market = "BIST" | "US";

export interface Stock {
  symbol: string;
  name: string;
  market: Market;
  currency: "TRY" | "USD";
  basePrice: number;
  sector: string;
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
