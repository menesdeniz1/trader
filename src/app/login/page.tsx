"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [name, setName] = useState("");
  const router = useRouter();
  const { login, isLoggedIn, ready } = useAuth();

  useEffect(() => {
    if (ready && isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [ready, isLoggedIn, router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    login(trimmed);
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-bold text-violet-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-sm">
            D
          </span>
          Demo Trader
        </Link>

        <h1 className="mt-6 text-xl font-bold text-slate-900">Demo hesabına giriş yap</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bu sahte bir giriş ekranıdır, şifre kontrolü ve gerçek kimlik doğrulama yapılmaz.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Adın</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn. Ahmet Yılmaz"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-violet-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-violet-700 py-2.5 font-semibold text-white transition hover:bg-violet-800"
          >
            Demo Hesabıma Gir
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Girişle birlikte 100.000₺ sahte demo bakiye tanımlanır.
        </p>
      </div>
    </div>
  );
}
