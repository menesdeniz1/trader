"use client";

import Link from "next/link";
import { Stock } from "@/lib/types";
import { useMarket } from "@/context/MarketContext";
import { useFavorites } from "@/context/FavoritesContext";
import Sparkline from "./Sparkline";

interface QuoteOverride {
  price: number;
  prevClose: number;
  history: number[];
}

interface StockListItemProps {
  stock: Stock;
  /** Sabit STOCKS listesinde olmayan (favori) hisseler için MarketContext yerine
   *  dışarıdan hazır quote verisi geçirilir. undefined ise MarketContext kullanılır. */
  quoteOverride?: QuoteOverride | null;
  loadingOverride?: boolean;
}

export default function StockListItem({ stock, quoteOverride, loadingOverride }: StockListItemProps) {
  const market = useMarket();
  const { isFavorite, toggleFavorite } = useFavorites();
  const usingOverride = quoteOverride !== undefined;

  const loading = usingOverride ? !!loadingOverride : market.loading;
  const available = usingOverride ? !!quoteOverride : market.isAvailable(stock.symbol);
  const price = usingOverride ? quoteOverride?.price : market.prices[stock.symbol];
  const history = usingOverride ? quoteOverride?.history ?? [] : market.histories[stock.symbol] ?? [];
  const pct = usingOverride
    ? quoteOverride && quoteOverride.prevClose !== 0
      ? ((quoteOverride.price - quoteOverride.prevClose) / quoteOverride.prevClose) * 100
      : 0
    : market.getChange(stock.symbol).pct;
  const isUp = pct >= 0;
  const currencySymbol = stock.currency === "USD" ? "$" : "₺";
  const favorite = isFavorite(stock.symbol);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-violet-300 hover:shadow-sm">
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(stock.symbol);
        }}
        aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
        className={`shrink-0 text-lg transition ${favorite ? "text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
      >
        {favorite ? "★" : "☆"}
      </button>
      <Link href={`/stock/${stock.symbol}`} className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
            {stock.symbol.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{stock.symbol}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {stock.market}
              </span>
            </div>
            <p className="truncate text-sm text-slate-500">{stock.name}</p>
          </div>
        </div>

        {available && (
          <div className="hidden sm:block">
            <Sparkline data={history} positive={isUp} />
          </div>
        )}

        <div className="text-right">
          {loading ? (
            <p className="text-sm text-slate-400">Yükleniyor...</p>
          ) : available ? (
            <>
              <p className="font-semibold text-slate-900">
                {currencySymbol}
                {price?.toFixed(2)}
              </p>
              <p className={`text-sm font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
                {isUp ? "+" : ""}
                {pct.toFixed(2)}%
              </p>
            </>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-400">Veri yok</span>
          )}
        </div>
      </Link>
    </div>
  );
}
