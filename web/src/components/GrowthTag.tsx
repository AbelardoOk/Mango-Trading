"use client";
import { formatMoney } from "@/lib/money";

export function GrowthTag({ current, average, previousPrice }: { current: number; average?: number | null; previousPrice?: number | null }) {
  const baseline = average && average !== 0 ? average : previousPrice;
  if (!baseline || baseline === 0) return null;
  const diffPerUnit = current - baseline;
  const pct = (diffPerUnit / baseline) * 100;
  if (Math.abs(pct) <= 0.5) return null;
  const isPos = diffPerUnit >= 0;
  const absDiff = Math.abs(diffPerUnit);
  const color = isPos ? "text-green bg-soft border-green/30" : "text-red bg-[#fbece9] border-red/30";
  const sign = isPos ? "+" : "-";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none ${color}`}
      aria-label={`${pct.toFixed(2)} por cento, ${sign}${formatMoney(absDiff)} ${average ? "vs preço médio" : "vs preço anterior"}`}
    >
      <span aria-hidden>{isPos ? "↑" : "↓"}</span>
      <span>{sign}{pct.toFixed(2)}%</span>
      <span className="opacity-60">·</span>
      <span>{sign}{formatMoney(absDiff)}</span>
    </span>
  );
}
