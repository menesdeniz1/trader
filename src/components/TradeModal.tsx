"use client";

import { useState } from "react";
import { Stock, TransactionSide } from "@/lib/types";
import { usePortfolio } from "@/context/PortfolioContext";

interface TradeModalProps {
  stock: Stock;
  side: TransactionSide;
  price: number;
  onClose: () => void;
}

export default function TradeModal({ stock, side, price, onClose }: TradeModalProps) {
  const { buy, sell, cashTRY, holdings, toTRY } = usePortfolio();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currencySymbol = stock.currency === "USD" ? "$" : "₺";
  const total = quantity * price;
  const totalTRY = toTRY(stock.symbol, total);
  const holding = holdings.find((h) => h.symbol === stock.symbol);

  const handleSubmit = () => {
    const result = side === "BUY" ? buy(stock.symbol, quantity, price) : sell(stock.symbol, quantity, price);
    if (!result.ok) {
      setError(result.message ?? "İşlem başarısız.");
      return;
    }
    setError(null);
    setSuccess(true);
    setTimeout(onClose, 900);
  };

  const isBuy = side === "BUY";

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {stock.symbol} {isBuy ? "Al" : "Sat"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Güncel fiyat: {currencySymbol}
          {price.toFixed(2)}
        </p>

        {!isBuy && (
          <p className="mt-1 text-sm text-slate-500">Elinizde: {holding?.quantity ?? 0} adet</p>
        )}

        <label className="mt-4 block text-sm font-medium text-slate-700">Adet</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-violet-500 focus:outline-none"
        />

        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <span className="text-slate-500">Toplam</span>
          <span className="font-semibold text-slate-900">
            {currencySymbol}
            {total.toFixed(2)}
            {stock.currency === "USD" && (
              <span className="ml-1 text-slate-400">(~₺{totalTRY.toFixed(2)})</span>
            )}
          </span>
        </div>

        {isBuy && <p className="mt-2 text-xs text-slate-400">Kullanılabilir bakiye: ₺{cashTRY.toFixed(2)}</p>}

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        {success && (
          <p className="mt-3 text-sm font-medium text-green-600">İşlem tamamlandı.</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={success}
          className={`mt-4 w-full rounded-lg py-2.5 font-semibold text-white transition disabled:opacity-60 ${
            isBuy ? "bg-violet-700 hover:bg-violet-800" : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {isBuy ? "Satın Al" : "Sat"}
        </button>
      </div>
    </div>
  );
}
