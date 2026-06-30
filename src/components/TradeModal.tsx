"use client";

import { useState } from "react";
import { Stock, TransactionSide } from "@/lib/types";
import { usePortfolio } from "@/context/PortfolioContext";
import { formatQty } from "@/lib/format";

interface TradeModalProps {
  stock: Stock;
  side: TransactionSide;
  price: number;
  onClose: () => void;
}

type Mode = "QUANTITY" | "AMOUNT";

const TRY_AMOUNT_CHIPS = [1000, 5000, 10000];
const USD_AMOUNT_CHIPS = [50, 200, 500];
const SELL_PCT_CHIPS = [25, 50, 100];

export default function TradeModal({ stock, side, price, onClose }: TradeModalProps) {
  const { buy, sell, cashTRY, cashUSD, holdings, toTRY } = usePortfolio();
  const [mode, setMode] = useState<Mode>("AMOUNT");
  const [quantityInput, setQuantityInput] = useState(1);
  const [amountInput, setAmountInput] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isBuy = side === "BUY";
  const currencySymbol = stock.currency === "USD" ? "$" : "₺";
  const holding = holdings.find((h) => h.symbol === stock.symbol);
  const availableBalance = stock.currency === "USD" ? cashUSD : cashTRY;
  const holdingValue = (holding?.quantity ?? 0) * price;

  // Tutar modunda asıl gerçek olan girilen tutardır (kuruş hassasiyetine
  // yuvarlanır); kesirli adet (ör. 2,33) bundan sadece görüntü için türetilir.
  // Adedi ayrıca yuvarlayıp tekrar adet×fiyat ile maliyeti hesaplamak, "Tümü"
  // gibi art arda kullanımlarda küçük bir kayma biriktirip yanlış "yetersiz
  // bakiye" hatasına yol açabiliyordu.
  const amountRounded = Math.round(amountInput * 100) / 100;
  const quantity = mode === "QUANTITY" ? quantityInput : price > 0 ? amountRounded / price : 0;
  const total = mode === "AMOUNT" ? amountRounded : quantity * price;
  const totalTRY = toTRY(stock.currency, total);

  const amountChips = stock.currency === "USD" ? USD_AMOUNT_CHIPS : TRY_AMOUNT_CHIPS;

  const handleSubmit = () => {
    const result = side === "BUY" ? buy(stock, quantity, price) : sell(stock, quantity, price);
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
          <p className="mt-1 text-sm text-slate-500">Elinizde: {formatQty(holding?.quantity ?? 0)} adet</p>
        )}

        <div className="mt-4 flex gap-1.5 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setMode("AMOUNT")}
            className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition ${
              mode === "AMOUNT" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"
            }`}
          >
            Tutar
          </button>
          <button
            onClick={() => setMode("QUANTITY")}
            className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition ${
              mode === "QUANTITY" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"
            }`}
          >
            Adet
          </button>
        </div>

        {mode === "AMOUNT" ? (
          <>
            <label className="mt-4 block text-sm font-medium text-slate-700">Tutar ({currencySymbol})</label>
            <input
              type="number"
              min={0}
              value={amountInput || ""}
              onChange={(e) => setAmountInput(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-violet-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">≈ {formatQty(quantity)} adet</p>

            <div className="mt-2 flex flex-wrap gap-2">
              {isBuy
                ? amountChips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setAmountInput(chip)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                    >
                      {currencySymbol}
                      {chip.toLocaleString("tr-TR")}
                    </button>
                  ))
                : SELL_PCT_CHIPS.map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setAmountInput(Math.round(holdingValue * (pct / 100) * 100) / 100)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
                    >
                      %{pct}
                    </button>
                  ))}
              <button
                onClick={() => setAmountInput(isBuy ? availableBalance : holdingValue)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
              >
                Tümü
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="mt-4 block text-sm font-medium text-slate-700">Adet</label>
            <input
              type="number"
              min={0}
              step="any"
              value={quantityInput || ""}
              onChange={(e) => setQuantityInput(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-violet-500 focus:outline-none"
            />
          </>
        )}

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

        {isBuy && (
          <p className="mt-2 text-xs text-slate-400">
            Kullanılabilir bakiye: {currencySymbol}
            {availableBalance.toFixed(2)}
          </p>
        )}

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        {success && (
          <p className="mt-3 text-sm font-medium text-green-600">İşlem tamamlandı.</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={success || quantity <= 0}
          className={`mt-4 w-full rounded-lg py-2.5 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isBuy ? "bg-violet-700 hover:bg-violet-800" : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {isBuy ? "Satın Al" : "Sat"}
        </button>
      </div>
    </div>
  );
}
