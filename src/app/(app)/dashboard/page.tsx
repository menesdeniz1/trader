"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePortfolio } from "@/context/PortfolioContext";
import { useAuth } from "@/context/AuthContext";
import { useMarket } from "@/context/MarketContext";
import StatCard from "@/components/StatCard";
import Sparkline from "@/components/Sparkline";
import ConvertModal from "@/components/ConvertModal";
import { formatQty } from "@/lib/format";

interface QuoteData {
  price: number;
  prevClose: number;
  history: number[];
}

export default function DashboardPage() {
  const { userName } = useAuth();
  const { cashTRY, cashUSD, holdings, ready, toTRY } = usePortfolio();
  const { usdTry } = useMarket();
  const [quotes, setQuotes] = useState<Record<string, QuoteData | null>>({});
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [convertOpen, setConvertOpen] = useState(false);

  const holdingSymbols = holdings.map((h) => h.symbol).join(",");

  useEffect(() => {
    if (!ready || holdingSymbols === "") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuotesLoading(false);
      return;
    }
    let cancelled = false;
    setQuotesLoading(true);
    fetch(`/api/quotes?symbols=${holdingSymbols}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json: { quotes: Record<string, QuoteData | null> }) => {
        if (!cancelled) {
          setQuotes(json.quotes);
          setQuotesLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setQuotesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, holdingSymbols]);

  if (!ready) {
    return <p className="text-sm text-slate-400">Yükleniyor...</p>;
  }

  const valuesReady = !quotesLoading;

  const holdingsValueTRY = holdings.reduce((sum, h) => {
    const price = quotes[h.symbol]?.price ?? h.avgCost;
    return sum + toTRY(h.currency, price * h.quantity);
  }, 0);
  const totalCostTRY = holdings.reduce((sum, h) => {
    return sum + toTRY(h.currency, h.avgCost * h.quantity);
  }, 0);
  const totalValue = cashTRY + toTRY("USD", cashUSD) + holdingsValueTRY;
  const totalPnl = holdingsValueTRY - totalCostTRY;
  const totalPnlPct = totalCostTRY === 0 ? 0 : (totalPnl / totalCostTRY) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Merhaba, {userName} 👋</h1>
        <p className="text-sm text-slate-500">Demo portföyünün genel durumu</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Toplam Varlık"
          value={valuesReady ? `₺${totalValue.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
        />
        <StatCard
          label="TL Bakiye"
          value={`₺${cashTRY.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`≈ $${(cashTRY / usdTry).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Dolar Bakiye"
          value={`$${cashUSD.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`≈ ₺${(cashUSD * usdTry).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Portföy Değeri"
          value={valuesReady ? `₺${holdingsValueTRY.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
        />
        <StatCard
          label="Toplam Kar/Zarar"
          value={valuesReady ? `${totalPnl >= 0 ? "+" : ""}₺${totalPnl.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
          sub={valuesReady ? `${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(2)}%` : undefined}
          subTone={totalPnl >= 0 ? "positive" : "negative"}
        />
      </div>

      <button
        onClick={() => setConvertOpen(true)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-violet-700 transition hover:bg-violet-50"
      >
        ⇄ Bakiyeni Çevir
      </button>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="font-semibold text-slate-900">Hisselerim</h2>
          <Link href="/markets" className="text-sm font-medium text-violet-700 hover:underline">
            Piyasaları Keşfet
          </Link>
        </div>

        {holdings.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-400">
            Henüz hiç hissen yok.{" "}
            <Link href="/markets" className="font-medium text-violet-700 hover:underline">
              Piyasalara göz at
            </Link>{" "}
            ve ilk demo işlemini yap.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {holdings.map((h) => {
              const quote = quotes[h.symbol];
              const available = !!quote;
              const price = quote?.price ?? 0;
              const pct = quote && quote.prevClose !== 0 ? ((quote.price - quote.prevClose) / quote.prevClose) * 100 : 0;
              const isUp = pct >= 0;
              const valueTRY = toTRY(h.currency, price * h.quantity);
              const costTRY = toTRY(h.currency, h.avgCost * h.quantity);
              const pnl = valueTRY - costTRY;
              const pnlPct = costTRY === 0 ? 0 : (pnl / costTRY) * 100;

              return (
                <li key={h.symbol}>
                  <Link
                    href={`/stock/${h.symbol}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{h.symbol}</p>
                      <p className="text-sm text-slate-500">{formatQty(h.quantity)} adet · ort. {h.avgCost.toFixed(2)}</p>
                    </div>
                    {available && (
                      <div className="hidden sm:block">
                        <Sparkline data={quote?.history ?? []} positive={isUp} />
                      </div>
                    )}
                    <div className="text-right">
                      {!valuesReady ? (
                        <p className="text-sm text-slate-400">Yükleniyor...</p>
                      ) : !available ? (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-400">
                          Veri yok
                        </span>
                      ) : (
                        <>
                          <p className="font-semibold text-slate-900">
                            ₺{valueTRY.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className={`text-sm font-medium ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {pnl >= 0 ? "+" : ""}
                            {pnlPct.toFixed(2)}%
                          </p>
                        </>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {convertOpen && <ConvertModal onClose={() => setConvertOpen(false)} />}
    </div>
  );
}
