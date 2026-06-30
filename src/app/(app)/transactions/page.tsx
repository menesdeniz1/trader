"use client";

import Link from "next/link";
import { usePortfolio } from "@/context/PortfolioContext";
import { formatQty } from "@/lib/format";

export default function TransactionsPage() {
  const { transactions, ready } = usePortfolio();

  if (!ready) {
    return <p className="text-sm text-slate-400">Yükleniyor...</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">İşlem Geçmişi</h1>
        <p className="text-sm text-slate-500">Demo hesabındaki tüm alım satım işlemleri</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {transactions.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-400">
            Henüz bir işlem yapmadın.{" "}
            <Link href="/markets" className="font-medium text-violet-700 hover:underline">
              Piyasalara göz at
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const currencySymbol = tx.currency === "USD" ? "$" : "₺";
              const isBuy = tx.side === "BUY";
              return (
                <li key={tx.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isBuy ? "bg-violet-100 text-violet-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isBuy ? "ALIŞ" : "SATIŞ"}
                    </span>
                    <div>
                      <Link href={`/stock/${tx.symbol}`} className="font-semibold text-slate-900 hover:underline">
                        {tx.symbol}
                      </Link>
                      <p className="text-sm text-slate-500">
                        {formatQty(tx.quantity)} adet × {currencySymbol}
                        {tx.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {currencySymbol}
                      {tx.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.date).toLocaleString("tr-TR")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
