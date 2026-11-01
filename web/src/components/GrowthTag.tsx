"use client";
import { formatMoney } from "@/lib/money";

export function GrowthTag({ current, average, previousPrice, quantity = 1 }: { current: number; average?: number | null; previousPrice?: number | null; quantity?: number }) {
  const baseline = average && average !== 0 ? average : previousPrice;
  if (!baseline || baseline === 0) return null;
  const diffPerUnit = current - baseline;
  const pct = (diffPerUnit / baseline) * 100;
  if (Math.abs(pct) <= 0.5) return null;
  const isPos = diffPerUnit >= 0;
  const absDiff = Math.abs(diffPerUnit);
  const color = isPos ? "text-[#174f3d] bg-[#e8f1eb] border-[#174f3d]" : "text-[#ad342c] bg-[#fbece9] border-[#ad342c]";
  const sign = isPos ? "+" : "-";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full border font-medium ${color}`} aria-label={`${pct.toFixed(2)} por cento, ${sign}${formatMoney(absDiff)} vs média`}>
      <span aria-hidden>{isPos ? "↑" : "↓"}</span>
      <span>{sign}{pct.toFixed(2)}%</span>
      <span className="opacity-60">·</span>
      <span>{sign}{formatMoney(absDiff)}</span>
    </span>
  );
}
