import Link from "next/link";

const FEATURES = [
  {
    title: "BIST & ABD Hisseleri",
    desc: "Türkiye ve Amerika borsalarından popüler hisselerle demo portföy oluştur.",
  },
  {
    title: "Gerçek Piyasa Verisi",
    desc: "Fiyatlar Yahoo Finance'in ücretsiz veri servisinden çekilir ve düzenli aralıklarla güncellenir.",
  },
  {
    title: "Sahte Bakiye, Gerçek Fiyatlar",
    desc: "100.000₺ demo bakiye ile, gerçek piyasa fiyatları üzerinden risk almadan al-sat dene.",
  },
  {
    title: "İşlem Geçmişi",
    desc: "Yaptığın her alım satımı detaylı şekilde görüntüle.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-bold text-violet-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-sm">
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
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-50 via-white to-white" />
          <div className="mx-auto max-w-6xl px-4 py-20 text-center">
            <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              Demo Uygulama — Gerçek Para Kullanılmaz
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Komisyonsuz, sade ve hızlı
              <br />
              <span className="bg-gradient-to-r from-violet-700 to-violet-500 bg-clip-text text-transparent">
                borsa deneyimini simüle et
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
              BIST ve ABD hisselerinde, gerçek piyasa fiyatları üzerinden çalışan sahte bir portföy
              oluştur. Gösterilen fiyatlar gerçek, ama bakiyen, emirlerin ve borsa bağlantın tamamen
              demo — hiçbir gerçek para hareketi yoktur.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-block rounded-xl bg-gradient-to-r from-violet-700 to-violet-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-800 hover:to-violet-700"
            >
              Demo Hesap Aç
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-violet-200 hover:shadow-sm"
              >
                <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        Bu site eğitim/demo amaçlıdır, herhangi bir yatırım kuruluşuyla bağlantısı yoktur ve
        yatırım tavsiyesi niteliği taşımaz. Fiyat verileri Yahoo Finance&apos;ten alınır, gecikmeli olabilir;
        portföy, bakiye ve işlemler tamamen kurgusaldır.
      </footer>
    </div>
  );
}
