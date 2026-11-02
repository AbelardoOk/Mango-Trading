"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { PortfolioHistoryPoint } from "@/types/api";
import { formatMoney, formatPercent } from "@/lib/money";
import { ChartEmptyState } from "./ChartEmptyState";
import { LiveBadge } from "./LiveBadge";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const RANGES = [
  { value: "1H", label: "1H" },
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
  baseline?: number;
};

function formatAxis(value: string, range: string) {
  const date = new Date(value);
  if (range === "1H" || range === "1D") {
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
  baseline,
}: Props) {
  const data = points.map((point) => ({
    timestamp: point.timestamp,
    patrimony: Number(point.patrimony),
  }));
  const last = data[data.length - 1];
  const first = data[0];
  const delta = last && first ? last.patrimony - first.patrimony : 0;
  const deltaPercent = first?.patrimony ? (delta / first.patrimony) * 100 : 0;
  const positive = delta >= 0;
  const ariaLabel = data.length
    ? `Evolução do patrimônio de ${formatMoney(first.patrimony)} para ${formatMoney(
        last.patrimony
      )} em ${data.length} pontos.`
    : "Gráfico de evolução do patrimônio sem dados.";

  return (
    <Card className="flex flex-col gap-4 p-5" aria-labelledby="patrimony-chart-title">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 id="patrimony-chart-title" className="font-bold text-ink">
              {title}
            </h3>
            {data.length > 0 ? (
              <Badge tone={positive ? "green" : "red"}>
                {positive ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
                {formatPercent(deltaPercent)}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted">
            Valores em moeda virtual (M$) · {positive ? "+" : "−"}
            {formatMoney(Math.abs(delta))} no período
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LiveBadge connected={connected} />
          <div className="flex rounded-lg bg-bg p-1" role="group" aria-label="Período do gráfico">
            {RANGES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onRangeChange(option.value)}
                aria-pressed={range === option.value}
                className={`min-h-8 rounded-md px-2.5 text-xs font-semibold transition-colors ${
                  range === option.value
                    ? "bg-green text-white"
                    : "text-muted hover:bg-soft hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-52 animate-pulse rounded-xl bg-soft" aria-label="Carregando gráfico" />
      ) : data.length === 0 ? (
        <ChartEmptyState />
      ) : (
        <>
          <div className="h-52" role="img" aria-label={ariaLabel}>
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
                {baseline ? (
                  <ReferenceLine
                    y={baseline}
                    stroke="#6d7f75"
                    strokeDasharray="4 4"
                    label={{ value: "investido", position: "insideTopRight", fontSize: 10, fill: "#4a5a52" }}
                  />
                ) : null}
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
          <details className="text-xs text-muted">
            <summary className="cursor-pointer font-semibold">Ver dados do gráfico</summary>
            <div className="mt-2 max-h-32 overflow-y-auto">
              <table className="w-full">
                <caption className="sr-only">Dados do gráfico de patrimônio</caption>
                <thead>
                  <tr>
                    <th scope="col" className="py-1 text-left font-semibold">Data/hora</th>
                    <th scope="col" className="py-1 text-right font-semibold">Patrimônio</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(-10).map((point) => (
                    <tr key={point.timestamp}>
                      <td className="py-1">{new Date(point.timestamp).toLocaleString("pt-BR")}</td>
                      <td className="money py-1 text-right">{formatMoney(point.patrimony)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </Card>
  );
}
