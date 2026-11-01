"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PortfolioHistoryPoint } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { ChartEmptyState } from "./ChartEmptyState";
import { LiveBadge } from "./LiveBadge";

const RANGES = [
  { value: "1D", label: "1D" },
  { value: "7D", label: "7D" },
  { value: "30D", label: "30D" },
];

type Props = {
  points: PortfolioHistoryPoint[];
  loading?: boolean;
  range: string;
  onRangeChange: (range: string) => void;
  connected?: boolean;
  title?: string;
};

function formatAxis(value: string, range: string) {
  const date = new Date(value);
  if (range === "1D") {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function PatrimonyChart({
  points,
  loading,
  range,
  onRangeChange,
  connected = false,
  title = "Evolução do patrimônio",
}: Props) {
  const data = points.map((p) => ({
    timestamp: p.timestamp,
    patrimony: Number(p.patrimony),
  }));
  const last = data[data.length - 1];
  const first = data[0];
  const ariaLabel = data.length
    ? `Evolução do patrimônio de ${formatMoney(first.patrimony)} para ${formatMoney(
        last.patrimony
      )} em ${data.length} pontos.`
    : "Gráfico de evolução do patrimônio sem dados.";

  return (
    <section className="bg-white rounded-xl p-6 border flex flex-col gap-4" aria-labelledby="patrimony-chart-title">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h3 id="patrimony-chart-title" className="font-semibold">
            {title}
          </h3>
          <p className="text-xs text-[#4a5a52]">Valores em moeda virtual (M$)</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge connected={connected} />
          <div className="flex bg-[#f5f7f3] rounded-lg p-1" role="group" aria-label="Período do gráfico">
            {RANGES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onRangeChange(option.value)}
                aria-pressed={range === option.value}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                  range === option.value
                    ? "bg-[#174f3d] text-white"
                    : "text-[#4a5a52] hover:bg-[#e8f1eb]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-lg bg-[#e8f1eb]" aria-label="Carregando gráfico" />
      ) : data.length === 0 ? (
        <ChartEmptyState />
      ) : (
        <>
          <div className="h-48" role="img" aria-label={ariaLabel}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="patrimonyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#174f3d" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#174f3d" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e4eae5" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => formatAxis(String(value), range)}
                  tick={{ fontSize: 10, fill: "#4a5a52" }}
                  minTickGap={24}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value) =>
                    Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 0 })
                  }
                  tick={{ fontSize: 10, fill: "#4a5a52" }}
                  width={54}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={(value) => [formatMoney(Number(value)), "Patrimônio"]}
                  labelFormatter={(label) => new Date(String(label)).toLocaleString("pt-BR")}
                  contentStyle={{ borderRadius: 10, borderColor: "#d4dfd7", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="patrimony"
                  stroke="#174f3d"
                  strokeWidth={3}
                  fill="url(#patrimonyFill)"
                  isAnimationActive={false}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <details className="text-xs text-[#4a5a52]">
            <summary className="cursor-pointer">Ver dados do gráfico</summary>
            <div className="mt-2 max-h-32 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left font-semibold py-1">Data/hora</th>
                    <th className="text-right font-semibold py-1">Patrimônio</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(-10).map((point) => (
                    <tr key={point.timestamp}>
                      <td className="py-1">{new Date(point.timestamp).toLocaleString("pt-BR")}</td>
                      <td className="py-1 text-right">{formatMoney(point.patrimony)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
