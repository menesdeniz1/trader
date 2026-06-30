"use client";

import { useMemo, useState } from "react";
import { STOCKS } from "@/lib/mockStocks";
import { Market } from "@/lib/types";
import { useMarket } from "@/context/MarketContext";
import StockListItem from "@/components/StockListItem";

const TABS: { label: string; value: Market | "ALL" }[] = [
  { label: "Tümü", value: "ALL" },
  { label: "BIST", value: "BIST" },
  { label: "ABD", value: "US" },
];

export default function MarketsPage() {
  const [tab, setTab] = useState<Market | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const { error, updatedAt, loading } = useMarket();

  const filtered = useMemo(() => {
    return STOCKS.filter((stock) => {
      const matchesTab = tab === "ALL" || stock.market === tab;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || stock.symbol.toLowerCase().includes(q) || stock.name.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [tab, query]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Piyasalar</h1>
        <p className="text-sm text-slate-500">
          Gerçek piyasa verisiyle (Stooq) BIST ve ABD hisseleri ·{" "}
          {loading
            ? "yükleniyor..."
            : updatedAt
              ? `son güncelleme ${new Date(updatedAt).toLocaleTimeString("tr-TR")}`
              : "—"}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{error}</div>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Hisse ara (örn. THYAO, Apple)"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-violet-500 focus:outline-none"
      />

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === t.value ? "bg-violet-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((stock) => (
          <StockListItem key={stock.symbol} stock={stock} />
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">Sonuç bulunamadı.</p>
        )}
      </div>
    </div>
  );
}
