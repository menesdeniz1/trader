"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getStock } from "@/lib/mockStocks";
import { useMarket } from "@/context/MarketContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { useFavorites } from "@/context/FavoritesContext";
import Sparkline from "@/components/Sparkline";
import TradeModal from "@/components/TradeModal";
import { TransactionSide } from "@/lib/types";
import { buildDynamicStock } from "@/lib/dynamicStock";
import { formatQty } from "@/lib/format";

interface QuoteData {
  price: number;
  prevClose: number;
  history: number[];
  name: string;
  currency: string;
  exchange: string;
}

export default function StockDetailPage() {
  const params = useParams<{ symbol: string }>();
  const symbol = (params.symbol ?? "").toUpperCase();
  const curatedStock = getStock(symbol);

  const market = useMarket();
  const { holdings } = usePortfolio();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [tradeSide, setTradeSide] = useState<TransactionSide | null>(null);

  const [dynamicQuote, setDynamicQuote] = useState<QuoteData | null | undefined>(undefined);

  useEffect(() => {
    if (curatedStock) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDynamicQuote(undefined);
    fetch(`/api/quotes?symbols=${encodeURIComponent(symbol)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json: { quotes: Record<string, QuoteData | null> }) => {
        if (!cancelled) setDynamicQuote(json.quotes[symbol] ?? null);
      })
      .catch(() => {
        if (!cancelled) setDynamicQuote(null);
      });
    return () => {
      cancelled = true;
    };
  }, [curatedStock, symbol]);

  const stock = curatedStock ?? (dynamicQuote ? buildDynamicStock(symbol, dynamicQuote) : null);

  // Statik listedeki hisseler için MarketContext'in zaten taşıdığı toplu veri
  // kullanılır; listede olmayanlar için yukarıdaki tekil fetch'ten gelen veri.
  const loading = curatedStock ? market.loading : dynamicQuote === undefined;
  const available = curatedStock ? market.isAvailable(stock?.symbol ?? "") : !!dynamicQuote;
  const price = curatedStock ? market.prices[stock?.symbol ?? ""] : dynamicQuote?.price;
  const history = curatedStock ? market.histories[stock?.symbol ?? ""] ?? [] : dynamicQuote?.history ?? [];
  const change = curatedStock
    ? market.getChange(stock?.symbol ?? "")
    : dynamicQuote && dynamicQuote.prevClose !== 0
      ? {
          abs: dynamicQuote.price - dynamicQuote.prevClose,
          pct: ((dynamicQuote.price - dynamicQuote.prevClose) / dynamicQuote.prevClose) * 100,
        }
      : { abs: 0, pct: 0 };

  if (!curatedStock && dynamicQuote === undefined) {
    return <p className="py-16 text-center text-sm text-slate-400">Hisse aranıyor...</p>;
  }

  if (!stock) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Hisse bulunamadı.</p>
        <Link href="/markets" className="mt-2 inline-block text-violet-700 hover:underline">
          Piyasalara dön
        </Link>
      </div>
    );
  }

  const { abs, pct } = change;
  const isUp = pct >= 0;
  const currencySymbol = stock.currency === "USD" ? "$" : "₺";
  const holding = holdings.find((h) => h.symbol === stock.symbol);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(stock.symbol)}
              aria-label={isFavorite(stock.symbol) ? "Favorilerden çıkar" : "Favorilere ekle"}
              className={`text-xl transition ${isFavorite(stock.symbol) ? "text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
            >
              {isFavorite(stock.symbol) ? "★" : "☆"}
            </button>
            <h1 className="text-2xl font-bold text-slate-900">{stock.symbol}</h1>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              {stock.market}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {stock.name}
            {stock.sector !== "—" && ` · ${stock.sector}`}
          </p>
        </div>
        {available && <Sparkline data={history} width={140} height={48} positive={isUp} />}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {loading ? (
          <p className="text-sm text-slate-400">Fiyat yükleniyor...</p>
        ) : available ? (
          <>
            <p className="text-3xl font-bold text-slate-900">
              {currencySymbol}
              {price?.toFixed(2)}
            </p>
            <p className={`mt-1 text-sm font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
              {isUp ? "+" : ""}
              {abs.toFixed(2)} ({isUp ? "+" : ""}
              {pct.toFixed(2)}%) bugün
            </p>
          </>
        ) : (
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Bu hisse için şu anda canlı veri alınamıyor. Veri sağlayıcıda bu sembol kapsamda olmayabilir
            veya geçici bir sorun yaşanıyor olabilir. Veri gelene kadar alım-satım kapalıdır.
          </div>
        )}

        {holding && (
          <p className="mt-3 text-sm text-slate-500">
            Elinizde {formatQty(holding.quantity)} adet · ortalama maliyet {currencySymbol}
            {holding.avgCost.toFixed(2)}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setTradeSide("BUY")}
            disabled={!available}
            className="flex-1 rounded-lg bg-violet-700 py-2.5 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Al
          </button>
          <button
            onClick={() => setTradeSide("SELL")}
            disabled={!available || !holding}
            className="flex-1 rounded-lg bg-slate-900 py-2.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sat
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Fiyatlar Yahoo Finance&apos;ten alınır, gecikmeli olabilir ve yatırım tavsiyesi
        değildir. Alım-satım tamamen sahte (demo) bakiyeyle yapılır, gerçek para veya gerçek borsa
        emri söz konusu değildir.
      </p>

      {tradeSide && available && price !== undefined && (
        <TradeModal stock={stock} side={tradeSide} price={price} onClose={() => setTradeSide(null)} />
      )}
    </div>
  );
}
