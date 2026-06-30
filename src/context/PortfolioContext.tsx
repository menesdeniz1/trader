"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Holding, Transaction } from "@/lib/types";
import { getStock, USD_TRY } from "@/lib/mockStocks";

const STORAGE_KEY = "demo-trader-portfolio";
const STARTING_CASH = 100000;

interface PortfolioState {
  cashTRY: number;
  holdings: Holding[];
  transactions: Transaction[];
}

interface PortfolioContextValue extends PortfolioState {
  ready: boolean;
  buy: (symbol: string, quantity: number, price: number) => { ok: boolean; message?: string };
  sell: (symbol: string, quantity: number, price: number) => { ok: boolean; message?: string };
  reset: () => void;
  toTRY: (symbol: string, amount: number) => number;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

function initialState(): PortfolioState {
  return { cashTRY: STARTING_CASH, holdings: [], transactions: [] };
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortfolioState>(initialState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage; safe to run only on the client.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(JSON.parse(stored));
      } catch {
        setState(initialState());
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, ready]);

  const toTRY = (symbol: string, amount: number) => {
    const stock = getStock(symbol);
    return stock?.currency === "USD" ? amount * USD_TRY : amount;
  };

  const buy = (symbol: string, quantity: number, price: number) => {
    if (quantity <= 0) return { ok: false, message: "Adet 0'dan büyük olmalı." };
    const cost = toTRY(symbol, quantity * price);
    if (cost > state.cashTRY) {
      return { ok: false, message: "Yetersiz bakiye." };
    }
    setState((prev) => {
      const existing = prev.holdings.find((h) => h.symbol === symbol);
      let holdings: Holding[];
      if (existing) {
        const totalQty = existing.quantity + quantity;
        const avgCost = (existing.avgCost * existing.quantity + price * quantity) / totalQty;
        holdings = prev.holdings.map((h) =>
          h.symbol === symbol ? { ...h, quantity: totalQty, avgCost } : h
        );
      } else {
        holdings = [...prev.holdings, { symbol, quantity, avgCost: price }];
      }
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        symbol,
        side: "BUY",
        quantity,
        price,
        total: quantity * price,
        date: new Date().toISOString(),
      };
      return {
        cashTRY: prev.cashTRY - cost,
        holdings,
        transactions: [transaction, ...prev.transactions],
      };
    });
    return { ok: true };
  };

  const sell = (symbol: string, quantity: number, price: number) => {
    const existing = state.holdings.find((h) => h.symbol === symbol);
    if (quantity <= 0) return { ok: false, message: "Adet 0'dan büyük olmalı." };
    if (!existing || existing.quantity < quantity) {
      return { ok: false, message: "Yetersiz hisse adedi." };
    }
    setState((prev) => {
      const target = prev.holdings.find((h) => h.symbol === symbol)!;
      const remaining = target.quantity - quantity;
      const holdings = remaining > 0
        ? prev.holdings.map((h) => (h.symbol === symbol ? { ...h, quantity: remaining } : h))
        : prev.holdings.filter((h) => h.symbol !== symbol);
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        symbol,
        side: "SELL",
        quantity,
        price,
        total: quantity * price,
        date: new Date().toISOString(),
      };
      return {
        cashTRY: prev.cashTRY + toTRY(symbol, quantity * price),
        holdings,
        transactions: [transaction, ...prev.transactions],
      };
    });
    return { ok: true };
  };

  const reset = () => {
    setState(initialState());
  };

  return (
    <PortfolioContext.Provider value={{ ...state, ready, buy, sell, reset, toTRY }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}

export { STARTING_CASH };
