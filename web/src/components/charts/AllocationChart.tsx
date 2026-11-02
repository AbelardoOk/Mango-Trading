"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { PortfolioItemResponse } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { Card } from "@/components/ui/Card";

const COLORS = ["#174f3d", "#f5ac45", "#6d7f75", "#2f7d5e", "#d98a2b", "#8fa79a", "#ad342c"];

export function AllocationChart({ items }: { items: PortfolioItemResponse[] }) {
  const data = items
    .map((item) => ({ name: item.stockSymbol, value: Number(item.currentValue) }))
    .sort((a, b) => b.value - a.value);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-soft p-2 text-green">
          <PieIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-ink">Alocação da carteira</h3>
          <p className="text-xs text-muted">Distribuição por valor atual</p>
        </div>
      </div>
      <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row">
        <div className="h-40 w-40 shrink-0" role="img" aria-label="Gráfico de alocação da carteira por ativo">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={2} strokeWidth={0}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [formatMoney(Number(value)), String(name)]}
                contentStyle={{ borderRadius: 10, borderColor: "#d4dfd7", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex w-full flex-col gap-1.5">
          {data.slice(0, 6).map((item, index) => {
            const percent = total ? (item.value / total) * 100 : 0;
            return (
              <li key={item.name} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">{item.name}</span>
                <span className="money text-muted">{percent.toFixed(1)}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
