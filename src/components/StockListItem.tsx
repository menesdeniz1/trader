"use client";

import Link from "next/link";
import { Stock } from "@/lib/types";
import { useMarket } from "@/context/MarketContext";
import Sparkline from "./Sparkline";

export default function StockListItem({ stock }: { stock: Stock }) {
  const { prices, histories, getChange } = useMarket();
  const price = prices[stock.symbol];
  const history = histories[stock.symbol];
  const { pct } = getChange(stock.symbol);
  const isUp = pct >= 0;
  const currencySymbol = stock.currency === "USD" ? "$" : "₺";

  return (
    <Link
      href={`/stock/${stock.symbol}`}
      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-violet-300 hover:shadow-sm"
    >
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

      <div className="hidden sm:block">
        <Sparkline data={history} positive={isUp} />
      </div>

      <div className="text-right">
        <p className="font-semibold text-slate-900">
          {currencySymbol}
          {price?.toFixed(2)}
        </p>
        <p className={`text-sm font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
          {isUp ? "+" : ""}
          {pct.toFixed(2)}%
        </p>
      </div>
    </Link>
  );
}
