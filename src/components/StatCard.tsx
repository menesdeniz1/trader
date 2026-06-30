interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  subTone?: "positive" | "negative" | "neutral";
}

export default function StatCard({ label, value, sub, subTone = "neutral" }: StatCardProps) {
  const toneClass =
    subTone === "positive"
      ? "text-green-600"
      : subTone === "negative"
        ? "text-red-600"
        : "text-slate-500";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className={`mt-1 text-sm font-medium ${toneClass}`}>{sub}</p>}
    </div>
  );
}
