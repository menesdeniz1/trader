"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { STOCKS } from "@/lib/mockStocks";

interface QuoteData {
  price: number;
  prevClose: number;
  history: number[];
}

interface MarketState {
  prices: Record<string, number>;
  histories: Record<string, number[]>;
  prevCloses: Record<string, number>;
  unavailable: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
}

interface MarketContextValue extends MarketState {
  getChange: (symbol: string) => { abs: number; pct: number };
  isAvailable: (symbol: string) => boolean;
  refresh: () => void;
}

const MarketContext = createContext<MarketContextValue | null>(null);

const POLL_INTERVAL_MS = 60_000;

const initialState: MarketState = {
  prices: {},
  histories: {},
  prevCloses: {},
  unavailable: {},
  loading: true,
  error: null,
  updatedAt: null,
};

export function MarketProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MarketState>(initialState);

  const load = useCallback(async () => {
    try {
      const symbols = STOCKS.map((s) => s.symbol).join(",");
      const res = await fetch(`/api/quotes?symbols=${symbols}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: { updatedAt: string; quotes: Record<string, QuoteData | null> } = await res.json();

      const prices: Record<string, number> = {};
      const histories: Record<string, number[]> = {};
      const prevCloses: Record<string, number> = {};
      const unavailable: Record<string, boolean> = {};

      for (const stock of STOCKS) {
        const quote = json.quotes[stock.symbol];
        if (quote) {
          prices[stock.symbol] = quote.price;
          prevCloses[stock.symbol] = quote.prevClose;
          histories[stock.symbol] = quote.history;
        } else {
          unavailable[stock.symbol] = true;
        }
      }

      setState({ prices, histories, prevCloses, unavailable, loading: false, error: null, updatedAt: json.updatedAt });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Piyasa verisi şu anda alınamıyor. Bir süre sonra tekrar denenecek.",
      }));
    }
  }, []);

  useEffect(() => {
    // Initial fetch on mount, then poll; load() sets state asynchronously after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const getChange = (symbol: string) => {
    const price = state.prices[symbol] ?? 0;
    const prevClose = state.prevCloses[symbol] ?? price;
    const abs = price - prevClose;
    const pct = prevClose === 0 ? 0 : (abs / prevClose) * 100;
    return { abs, pct };
  };

  const isAvailable = (symbol: string) => !state.unavailable[symbol] && state.prices[symbol] !== undefined;

  return (
    <MarketContext.Provider value={{ ...state, getChange, isAvailable, refresh: load }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used within MarketProvider");
  return ctx;
}
