"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { STOCKS } from "@/lib/mockStocks";
import { generateHistory, nextTick } from "@/lib/marketSim";

interface MarketData {
  prices: Record<string, number>;
  histories: Record<string, number[]>;
  prevCloses: Record<string, number>;
}

interface MarketContextValue extends MarketData {
  getChange: (symbol: string) => { abs: number; pct: number };
}

const MarketContext = createContext<MarketContextValue | null>(null);

function buildInitial(): MarketData {
  const prices: Record<string, number> = {};
  const histories: Record<string, number[]> = {};
  const prevCloses: Record<string, number> = {};
  for (const stock of STOCKS) {
    const history = generateHistory(stock.symbol, stock.basePrice);
    histories[stock.symbol] = history;
    prices[stock.symbol] = history[history.length - 1];
    prevCloses[stock.symbol] = history[0];
  }
  return { prices, histories, prevCloses };
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MarketData>(() => buildInitial());

  useEffect(() => {
    const interval = setInterval(() => {
      setData((current) => {
        const prices: Record<string, number> = { ...current.prices };
        const histories: Record<string, number[]> = { ...current.histories };
        for (const stock of STOCKS) {
          const newPrice = nextTick(prices[stock.symbol]);
          prices[stock.symbol] = newPrice;
          histories[stock.symbol] = [...histories[stock.symbol].slice(-49), newPrice];
        }
        return { prices, histories, prevCloses: current.prevCloses };
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const getChange = (symbol: string) => {
    const price = data.prices[symbol] ?? 0;
    const prevClose = data.prevCloses[symbol] ?? price;
    const abs = price - prevClose;
    const pct = prevClose === 0 ? 0 : (abs / prevClose) * 100;
    return { abs, pct };
  };

  return (
    <MarketContext.Provider value={{ ...data, getChange }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used within MarketProvider");
  return ctx;
}
