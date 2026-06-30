"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { useMarket } from "@/context/MarketContext";

const LINKS = [
  { href: "/dashboard", label: "Portföy" },
  { href: "/markets", label: "Piyasalar" },
  { href: "/transactions", label: "İşlemler" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userName, logout } = useAuth();
  const { cashTRY, cashUSD, ready } = usePortfolio();
  const { usdTry } = useMarket();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-violet-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-sm">
              D
            </span>
            Demo Trader
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  pathname === link.href
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-slate-400">Nakit Bakiye</p>
            <p className="text-sm font-semibold text-slate-900">
              {ready
                ? `₺${(cashTRY + cashUSD * usdTry).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "—"}
            </p>
          </div>
          <span className="hidden text-sm text-slate-500 sm:block">{userName}</span>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Çıkış
          </button>
        </div>
      </div>
    </header>
  );
}
