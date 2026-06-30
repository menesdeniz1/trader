import Link from "next/link";

const FEATURES = [
  {
    title: "BIST & ABD Hisseleri",
    desc: "Türkiye ve Amerika borsalarından popüler hisselerle demo portföy oluştur.",
  },
  {
    title: "Sahte Bakiye, Gerçek Deneyim",
    desc: "100.000₺ demo bakiye ile risk almadan al-sat akışını dene.",
  },
  {
    title: "Anlık Fiyat Simülasyonu",
    desc: "Fiyatlar birkaç saniyede bir güncellenir, grafiklerle takip et.",
  },
  {
    title: "İşlem Geçmişi",
    desc: "Yaptığın her alım satımı detaylı şekilde görüntüle.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-bold text-violet-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-700 text-white">
              D
            </span>
            Demo Trader
          </div>
          <Link
            href="/login"
            className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800"
          >
            Giriş Yap
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            Demo Uygulama — Gerçek Para Kullanılmaz
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Komisyonsuz, sade ve hızlı
            <br />
            borsa deneyimini simüle et
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
            BIST ve ABD hisselerinde, tamamen sahte verilerle çalışan bir portföy oluştur.
            Hiçbir gerçek işlem, gerçek borsa bağlantısı veya gerçek para söz konusu değildir.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-xl bg-violet-700 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-violet-800"
          >
            Demo Hesap Aç
          </Link>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        Bu site eğitim/demo amaçlıdır, herhangi bir yatırım kuruluşuyla bağlantısı yoktur ve
        yatırım tavsiyesi niteliği taşımaz. Tüm fiyat ve veriler kurgusaldır.
      </footer>
    </div>
  );
}
