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
import { PricePoint } from "@/types/api";
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
  points: PricePoint[];
  loading?: boolean;
  range: string;
  onRangeChange: (range: string) => void;
  connected?: boolean;
  symbol: string;
  baseline?: number | null;
};

function formatAxis(value: string, range: string) {
  const date = new Date(value);
  if (range === "1H" || range === "1D") {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function PriceChart({ points, loading, range, onRangeChange, connected = false, symbol, baseline }: Props) {
  const data = points.map((point) => ({
    timestamp: point.timestamp,
    price: Number(point.price),
  }));
  const last = data[data.length - 1];
  const first = data[0];
  const delta = last && first ? last.price - first.price : 0;
  const deltaPercent = first?.price ? (delta / first.price) * 100 : 0;
  const positive = delta >= 0;
  const ariaLabel = data.length
    ? `Preço de ${symbol} de ${formatMoney(first.price)} para ${formatMoney(last.price)} em ${data.length} pontos.`
    : `Gráfico de preço de ${symbol} sem dados.`;

  return (
    <Card className="flex flex-col gap-4 p-5" aria-labelledby="price-chart-title">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 id="price-chart-title" className="font-bold text-ink">
              Preço de {symbol}
            </h3>
            {data.length > 0 ? (
              <Badge tone={positive ? "green" : "red"}>
                {positive ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
                {formatPercent(deltaPercent)}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted">
            Histórico de preços em moeda virtual (M$) · {positive ? "+" : "−"}
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
        <div className="h-48 animate-pulse rounded-xl bg-soft" aria-label="Carregando gráfico" />
      ) : data.length === 0 ? (
        <ChartEmptyState message="Ainda não há histórico de preços para esta ação." />
      ) : (
        <div className="h-48" role="img" aria-label={ariaLabel}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f5ac45" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#f5ac45" stopOpacity={0.03} />
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
                  Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 })
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
                  label={{ value: "média", position: "insideTopRight", fontSize: 10, fill: "#4a5a52" }}
                />
              ) : null}
              <Tooltip
                formatter={(value) => [formatMoney(Number(value)), "Preço"]}
                labelFormatter={(label) => new Date(String(label)).toLocaleString("pt-BR")}
                contentStyle={{ borderRadius: 10, borderColor: "#d4dfd7", fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#174f3d"
                strokeWidth={3}
                fill="url(#priceFill)"
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
