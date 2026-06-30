"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Holding, Transaction } from "@/lib/types";
import { useMarket } from "./MarketContext";

const STORAGE_KEY = "demo-trader-portfolio";
const STARTING_CASH = 100000;

interface PortfolioState {
  cashTRY: number;
  cashUSD: number;
  holdings: Holding[];
  transactions: Transaction[];
}

interface TradeStock {
  symbol: string;
  name: string;
  currency: "TRY" | "USD";
}

interface PortfolioContextValue extends PortfolioState {
  ready: boolean;
  buy: (stock: TradeStock, quantity: number, price: number) => { ok: boolean; message?: string };
  sell: (stock: TradeStock, quantity: number, price: number) => { ok: boolean; message?: string };
  convert: (from: "TRY" | "USD", amount: number) => { ok: boolean; message?: string };
  reset: () => void;
  toTRY: (currency: "TRY" | "USD", amount: number) => number;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

// "Tümü" kısayolu tam bakiyeyi tutar olarak girip adede (tutar/fiyat) çevirdiğinde,
// adet*fiyat çarpımı float yuvarlamasıyla bakiyeyi yüzde milyonda bir aşabilir.
// Bu payı tanımadan "yetersiz bakiye" hatası gösterilmesin diye küçük bir tolerans bırakılır.
const BALANCE_EPSILON = 1e-4;

function initialState(): PortfolioState {
  return { cashTRY: STARTING_CASH, cashUSD: 0, holdings: [], transactions: [] };
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { usdTry } = useMarket();
  const [state, setState] = useState<PortfolioState>(initialState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage; safe to run only on the client.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({ ...initialState(), ...parsed, cashUSD: parsed.cashUSD ?? 0 });
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

  const toTRY = (currency: "TRY" | "USD", amount: number) => (currency === "USD" ? amount * usdTry : amount);

  const buy = (stock: TradeStock, quantity: number, price: number) => {
    if (quantity <= 0) return { ok: false, message: "Adet 0'dan büyük olmalı." };
    const cost = quantity * price;
    const cashKey = stock.currency === "USD" ? "cashUSD" : "cashTRY";
    if (cost > state[cashKey] + BALANCE_EPSILON) {
      const currencyLabel = stock.currency === "USD" ? "dolar" : "TL";
      return { ok: false, message: `Yetersiz ${currencyLabel} bakiyesi. Bakiyeni Çevir ile dönüştürebilirsin.` };
    }
    setState((prev) => {
      const existing = prev.holdings.find((h) => h.symbol === stock.symbol);
      let holdings: Holding[];
      if (existing) {
        const totalQty = existing.quantity + quantity;
        const avgCost = (existing.avgCost * existing.quantity + price * quantity) / totalQty;
        holdings = prev.holdings.map((h) =>
          h.symbol === stock.symbol ? { ...h, quantity: totalQty, avgCost } : h
        );
      } else {
        holdings = [
          ...prev.holdings,
          { symbol: stock.symbol, name: stock.name, currency: stock.currency, quantity, avgCost: price },
        ];
      }
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        symbol: stock.symbol,
        name: stock.name,
        currency: stock.currency,
        side: "BUY",
        quantity,
        price,
        total: quantity * price,
        date: new Date().toISOString(),
      };
      return {
        ...prev,
        [cashKey]: Math.max(0, prev[cashKey] - cost),
        holdings,
        transactions: [transaction, ...prev.transactions],
      };
    });
    return { ok: true };
  };

  const sell = (stock: TradeStock, quantity: number, price: number) => {
    const existing = state.holdings.find((h) => h.symbol === stock.symbol);
    if (quantity <= 0) return { ok: false, message: "Adet 0'dan büyük olmalı." };
    if (!existing || existing.quantity < quantity - BALANCE_EPSILON) {
      return { ok: false, message: "Yetersiz hisse adedi." };
    }
    const cashKey = stock.currency === "USD" ? "cashUSD" : "cashTRY";
    setState((prev) => {
      const target = prev.holdings.find((h) => h.symbol === stock.symbol)!;
      const remaining = target.quantity - quantity;
      const holdings = remaining > 0
        ? prev.holdings.map((h) => (h.symbol === stock.symbol ? { ...h, quantity: remaining } : h))
        : prev.holdings.filter((h) => h.symbol !== stock.symbol);
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        symbol: stock.symbol,
        name: stock.name,
        currency: stock.currency,
        side: "SELL",
        quantity,
        price,
        total: quantity * price,
        date: new Date().toISOString(),
      };
      return {
        ...prev,
        [cashKey]: prev[cashKey] + quantity * price,
        holdings,
        transactions: [transaction, ...prev.transactions],
      };
    });
    return { ok: true };
  };

  const convert = (from: "TRY" | "USD", amount: number) => {
    if (amount <= 0) return { ok: false, message: "Tutar 0'dan büyük olmalı." };
    if (from === "TRY") {
      if (amount > state.cashTRY) return { ok: false, message: "Yetersiz TL bakiyesi." };
      const usdAmount = amount / usdTry;
      setState((prev) => ({ ...prev, cashTRY: prev.cashTRY - amount, cashUSD: prev.cashUSD + usdAmount }));
    } else {
      if (amount > state.cashUSD) return { ok: false, message: "Yetersiz dolar bakiyesi." };
      const tryAmount = amount * usdTry;
      setState((prev) => ({ ...prev, cashUSD: prev.cashUSD - amount, cashTRY: prev.cashTRY + tryAmount }));
    }
    return { ok: true };
  };

  const reset = () => {
    setState(initialState());
  };

  return (
    <PortfolioContext.Provider value={{ ...state, ready, buy, sell, convert, reset, toTRY }}>
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
