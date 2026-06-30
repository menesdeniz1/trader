"use client";

import { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useMarket } from "@/context/MarketContext";

export default function ConvertModal({ onClose }: { onClose: () => void }) {
  const { cashTRY, cashUSD, convert } = usePortfolio();
  const { usdTry } = useMarket();
  const [from, setFrom] = useState<"TRY" | "USD">("TRY");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const to = from === "TRY" ? "USD" : "TRY";
  const fromSymbol = from === "USD" ? "$" : "₺";
  const toSymbol = to === "USD" ? "$" : "₺";
  const availableBalance = from === "USD" ? cashUSD : cashTRY;
  const convertedAmount = from === "TRY" ? amount / usdTry : amount * usdTry;

  const handleSwap = () => {
    setFrom(to);
    setAmount(0);
    setError(null);
  };

  const handleSubmit = () => {
    const result = convert(from, amount);
    if (!result.ok) {
      setError(result.message ?? "İşlem başarısız.");
      return;
    }
    setError(null);
    setSuccess(true);
    setTimeout(onClose, 900);
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Bakiyeni Çevir</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
            {from === "USD" ? "Dolar" : "TL"}
          </span>
          <button
            onClick={handleSwap}
            className="rounded-full border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100"
            aria-label="Yönü değiştir"
          >
            ⇄
          </button>
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
            {to === "USD" ? "Dolar" : "TL"}
          </span>
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Tutar ({fromSymbol})
        </label>
        <input
          type="number"
          min={0}
          value={amount || ""}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          placeholder="0"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-violet-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-400">
          Kullanılabilir: {fromSymbol}
          {availableBalance.toFixed(2)}
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <span className="text-slate-500">Karşılığı</span>
          <span className="font-semibold text-slate-900">
            {toSymbol}
            {convertedAmount.toFixed(2)}
          </span>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        {success && <p className="mt-3 text-sm font-medium text-green-600">Çevirme tamamlandı.</p>}

        <button
          onClick={handleSubmit}
          disabled={success || amount <= 0}
          className="mt-4 w-full rounded-lg bg-violet-700 py-2.5 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Çevir
        </button>
      </div>
    </div>
  );
}
