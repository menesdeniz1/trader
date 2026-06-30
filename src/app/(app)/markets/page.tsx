"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { STOCKS, getStock } from "@/lib/mockStocks";
import { Market, Stock } from "@/lib/types";
import { useMarket } from "@/context/MarketContext";
import { useFavorites } from "@/context/FavoritesContext";
import { buildDynamicStock } from "@/lib/dynamicStock";
import StockListItem from "@/components/StockListItem";

const TABS: { label: string; value: Market | "ALL" }[] = [
  { label: "Tümü", value: "ALL" },
  { label: "BIST", value: "BIST" },
  { label: "ABD", value: "US" },
];

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

interface QuoteData {
  price: number;
  prevClose: number;
  history: number[];
  name: string;
  currency: string;
  exchange: string;
}

const SEARCH_DEBOUNCE_MS = 350;

export default function MarketsPage() {
  const [tab, setTab] = useState<Market | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const { error, updatedAt, loading } = useMarket();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const isSearching = query.trim().length >= 2;

  const filtered = useMemo(() => {
    return STOCKS.filter((stock) => {
      const matchesTab = tab === "ALL" || stock.market === tab;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || stock.symbol.toLowerCase().includes(q) || stock.name.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [tab, query]);

  // Favori sembollerin canlı fiyatı: sabit listede olmayanlar dahil hepsi
  // tek bir /api/quotes çağrısıyla çekilir (route.ts bilinmeyen sembolleri
  // de kendi Yahoo sembolü kabul ederek geçiriyor).
  const favoritesKey = favorites.join(",");
  const [favoriteQuotes, setFavoriteQuotes] = useState<Record<string, QuoteData | null>>({});
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  useEffect(() => {
    if (favoritesKey === "") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFavoritesLoading(false);
      return;
    }
    let cancelled = false;
    setFavoritesLoading(true);
    fetch(`/api/quotes?symbols=${favoritesKey}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json: { quotes: Record<string, QuoteData | null> }) => {
        if (!cancelled) {
          setFavoriteQuotes(json.quotes);
          setFavoritesLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setFavoritesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [favoritesKey]);

  const favoriteStocks = useMemo(() => {
    return favorites
      .map((symbol): Stock | null => {
        const curated = getStock(symbol);
        if (curated) return curated;
        const quote = favoriteQuotes[symbol];
        return quote ? buildDynamicStock(symbol, quote) : null;
      })
      .filter((s): s is Stock => !!s && (tab === "ALL" || s.market === tab));
  }, [favorites, favoriteQuotes, tab]);

  const [remoteResults, setRemoteResults] = useState<SearchResult[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRemoteResults([]);
      setRemoteLoading(false);
      return;
    }
    let cancelled = false;
    setRemoteLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((json: { results: SearchResult[] }) => {
          if (!cancelled) {
            setRemoteResults(json.results);
            setRemoteLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) setRemoteLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const localSymbols = new Set(filtered.map((s) => s.symbol));
  const otherResults = remoteResults.filter((r) => !localSymbols.has(r.symbol));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Piyasalar</h1>
        <p className="text-sm text-slate-500">
          Gerçek piyasa verisiyle (Yahoo Finance) BIST ve ABD hisseleri ·{" "}
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
        placeholder="Hisse ara (örn. THYAO, Apple, NVDL...)"
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

      {!isSearching && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Favorilerim</p>
          {favoriteStocks.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Henüz favori hissen yok. Arayıp ★ ile favorile, burada görünsün.
            </p>
          ) : (
            favoriteStocks.map((stock) => (
              <StockListItem
                key={stock.symbol}
                stock={stock}
                quoteOverride={favoriteQuotes[stock.symbol] ?? null}
                loadingOverride={favoritesLoading}
              />
            ))
          )}
        </div>
      )}

      {isSearching && (
        <>
          <div className="space-y-2">
            {filtered.map((stock) => (
              <StockListItem key={stock.symbol} stock={stock} />
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {remoteLoading ? "Diğer sonuçlar aranıyor..." : "Diğer sonuçlar (Yahoo Finance)"}
            </p>
            {otherResults.length === 0 && !remoteLoading ? (
              filtered.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-400">Sonuç bulunamadı.</p>
              )
            ) : (
              <div className="space-y-2">
                {otherResults.map((r) => (
                  <div
                    key={r.symbol}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-violet-300 hover:shadow-sm"
                  >
                    <button
                      onClick={() => toggleFavorite(r.symbol)}
                      aria-label={isFavorite(r.symbol) ? "Favorilerden çıkar" : "Favorilere ekle"}
                      className={`shrink-0 text-lg transition ${
                        isFavorite(r.symbol) ? "text-amber-400" : "text-slate-300 hover:text-amber-300"
                      }`}
                    >
                      {isFavorite(r.symbol) ? "★" : "☆"}
                    </button>
                    <Link
                      href={`/stock/${encodeURIComponent(r.symbol)}`}
                      className="flex min-w-0 flex-1 items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{r.symbol}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                            {r.exchange === "IST" ? "BIST" : "US"}
                          </span>
                        </div>
                        <p className="truncate text-sm text-slate-500">{r.name}</p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-400">Aç →</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
