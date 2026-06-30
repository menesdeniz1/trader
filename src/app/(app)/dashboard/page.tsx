"use client";

import Link from "next/link";
import { usePortfolio } from "@/context/PortfolioContext";
import { useMarket } from "@/context/MarketContext";
import { useAuth } from "@/context/AuthContext";
import { getStock } from "@/lib/mockStocks";
import StatCard from "@/components/StatCard";
import Sparkline from "@/components/Sparkline";

export default function DashboardPage() {
  const { userName } = useAuth();
  const { cashTRY, holdings, ready, toTRY } = usePortfolio();
  const { prices, histories, getChange } = useMarket();

  if (!ready) {
    return <p className="text-sm text-slate-400">Yükleniyor...</p>;
  }

  const holdingsValueTRY = holdings.reduce((sum, h) => {
    const price = prices[h.symbol] ?? 0;
    return sum + toTRY(h.symbol, price * h.quantity);
  }, 0);
  const totalCostTRY = holdings.reduce((sum, h) => {
    return sum + toTRY(h.symbol, h.avgCost * h.quantity);
  }, 0);
  const totalValue = cashTRY + holdingsValueTRY;
  const totalPnl = holdingsValueTRY - totalCostTRY;
  const totalPnlPct = totalCostTRY === 0 ? 0 : (totalPnl / totalCostTRY) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Merhaba, {userName} 👋</h1>
        <p className="text-sm text-slate-500">Demo portföyünün genel durumu</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Varlık" value={`₺${totalValue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`} />
        <StatCard label="Nakit Bakiye" value={`₺${cashTRY.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`} />
        <StatCard
          label="Portföy Değeri"
          value={`₺${holdingsValueTRY.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Toplam Kar/Zarar"
          value={`${totalPnl >= 0 ? "+" : ""}₺${totalPnl.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
          sub={`${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(2)}%`}
          subTone={totalPnl >= 0 ? "positive" : "negative"}
        />
      </div>

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
              const stock = getStock(h.symbol);
              if (!stock) return null;
              const price = prices[h.symbol] ?? 0;
              const { pct } = getChange(h.symbol);
              const isUp = pct >= 0;
              const valueTRY = toTRY(h.symbol, price * h.quantity);
              const costTRY = toTRY(h.symbol, h.avgCost * h.quantity);
              const pnl = valueTRY - costTRY;
              const pnlPct = costTRY === 0 ? 0 : (pnl / costTRY) * 100;

              return (
                <li key={h.symbol}>
                  <Link
                    href={`/stock/${h.symbol}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{stock.symbol}</p>
                      <p className="text-sm text-slate-500">{h.quantity} adet · ort. {h.avgCost.toFixed(2)}</p>
                    </div>
                    <div className="hidden sm:block">
                      <Sparkline data={histories[h.symbol] ?? []} positive={isUp} />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        ₺{valueTRY.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-sm font-medium ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {pnl >= 0 ? "+" : ""}
                        {pnlPct.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
