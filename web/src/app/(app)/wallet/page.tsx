"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpDown, PieChart, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { formatMoney, formatPercent } from "@/lib/money";
import { GrowthTag } from "@/components/GrowthTag";
import { usePortfolioStream } from "@/hooks/usePortfolioStream";
import { usePortfolioHistory } from "@/hooks/usePortfolioHistory";
import { markOnboarding } from "@/lib/onboarding";
import { PatrimonyChart } from "@/components/charts/PatrimonyChart";
import { AllocationChart } from "@/components/charts/AllocationChart";
import { ExportMenu } from "@/components/ExportMenu";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { PageSkeleton } from "@/components/ui/Skeleton";

type SortKey = "name" | "value" | "profit";

export default function WalletPage() {
  const { portfolio: p, point, connected } = usePortfolioStream();
  const [range, setRange] = useState("7D");
  const { points, loading } = usePortfolioHistory(range, point);
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    markOnboarding("wallet");
  }, []);

  const sortedItems = useMemo(() => {
    if (!p) return [];
    return [...p.items].sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") comparison = a.stockSymbol.localeCompare(b.stockSymbol);
      if (sortKey === "value") comparison = a.currentValue - b.currentValue;
      if (sortKey === "profit") comparison = a.profitLoss - b.profitLoss;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [p, sortKey, sortDirection]);

  if (!p) {
    return <PageSkeleton />;
  }

  const isEmpty = p.items.length === 0;
  const profitPercent = p.totalInvested ? (p.totalProfitLoss / p.totalInvested) * 100 : 0;
  const topPosition = p.items.length
    ? [...p.items].sort((a, b) => b.currentValue - a.currentValue)[0]
    : null;
  const topPercent = topPosition && p.totalCurrentValue ? (topPosition.currentValue / p.totalCurrentValue) * 100 : 0;

  function changeSort(key: SortKey) {
    if (sortKey === key) setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDirection(key === "name" ? "asc" : "desc");
    }
  }

  function sortAria(key: SortKey) {
    if (sortKey !== key) return "none" as const;
    return sortDirection === "asc" ? ("ascending" as const) : ("descending" as const);
  }

  return (
    <>
      <PageHeader
        eyebrow="CARTEIRA"
        title="Minha carteira"
        description="Acompanhe suas posições, a alocação e a evolução do patrimônio."
        actions={<ExportMenu kind="portfolio" label="Exportar carteira" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Patrimônio total"
          value={formatMoney(p.totalPatrimony)}
          hint="Saldo + valor das ações"
          tone="dark"
          icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Saldo disponível"
          value={formatMoney(p.balance)}
          hint="Para novas compras"
          icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Valor em ações"
          value={formatMoney(p.totalCurrentValue)}
          hint={`${p.items.length} empresas`}
          icon={<PieChart className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Resultado total"
          value={formatMoney(p.totalProfitLoss)}
          hint={`${formatPercent(profitPercent)} sobre o investido`}
          icon={p.totalProfitLoss >= 0 ? <TrendingUp className="h-4 w-4" aria-hidden="true" /> : <TrendingDown className="h-4 w-4" aria-hidden="true" />}
          className={p.totalProfitLoss >= 0 ? "border-green/20" : "border-red/20"}
        />
      </div>

      {topPosition && topPercent >= 40 ? (
        <div className="rounded-xl border border-orange/40 bg-[#fff0d6] p-4 text-sm text-[#754600]">
          <strong>Concentração:</strong> {topPercent.toFixed(0)}% do valor em ações está em {topPosition.stockSymbol}. Considere diversificar.
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <PatrimonyChart
          points={points}
          loading={loading}
          range={range}
          onRangeChange={setRange}
          connected={connected}
          title="Evolução do patrimônio"
          baseline={p.totalInvested}
        />
        <AllocationChart items={p.items} />
      </div>

      {isEmpty ? (
        <EmptyState
          icon={<TrendingUp className="h-6 w-6" />}
          title="Sua primeira ação espera por você."
          description="Explore o mercado fictício para montar sua carteira e acompanhar o patrimônio."
          action={
            <Link href="/market" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-green px-5 text-sm font-semibold text-white">
              Explorar mercado <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
      ) : (
        <>
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Posições da carteira</caption>
                <thead className="border-b border-line bg-bg/60 text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th scope="col" className="p-4 text-left" aria-sort={sortAria("name")}>
                      <button type="button" onClick={() => changeSort("name")} className="inline-flex items-center gap-1 font-bold">
                        Ativo <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col" className="p-4 text-center font-bold">Qtd.</th>
                    <th scope="col" className="p-4 text-right font-bold">Preço médio</th>
                    <th scope="col" className="p-4 text-right font-bold">Atual</th>
                    <th scope="col" className="p-4 text-right" aria-sort={sortAria("value")}>
                      <button type="button" onClick={() => changeSort("value")} className="inline-flex items-center gap-1 font-bold">
                        Valor atual <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col" className="p-4 text-right" aria-sort={sortAria("profit")}>
                      <button type="button" onClick={() => changeSort("profit")} className="inline-flex items-center gap-1 font-bold">
                        Resultado <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col" className="p-4 text-right font-bold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map((item) => (
                    <tr key={item.id} className="border-t border-line transition-colors hover:bg-bg/60">
                      <td className="p-4">
                        <div className="font-bold text-ink">{item.stockSymbol}</div>
                        <div className="text-xs text-muted">{item.stockName}</div>
                      </td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="money p-4 text-right">{formatMoney(item.averagePrice)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="money">{formatMoney(item.currentPrice)}</span>
                          <GrowthTag current={item.currentPrice} average={item.averagePrice} />
                        </div>
                      </td>
                      <td className="money p-4 text-right font-bold">{formatMoney(item.currentValue)}</td>
                      <td className={`p-4 text-right font-semibold ${item.profitLoss >= 0 ? "text-green" : "text-red"}`}>
                        {item.profitLoss >= 0 ? "+" : "−"}
                        {formatMoney(Math.abs(item.profitLoss))}{" "}
                        <span className="text-xs">({formatPercent(item.profitLossPercent)})</span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/market/${item.stockId}?tab=sell`}
                          className="inline-flex min-h-9 items-center rounded-lg bg-soft px-3 text-xs font-semibold text-green hover:bg-[#dbe9df]"
                        >
                          Vender
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-col gap-3 md:hidden">
            {sortedItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-ink">{item.stockSymbol}</div>
                    <div className="text-xs text-muted">{item.stockName}</div>
                  </div>
                  <Badge tone={item.profitLoss >= 0 ? "green" : "red"}>
                    {formatPercent(item.profitLossPercent)}
                  </Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-muted">Quantidade</dt>
                    <dd className="font-semibold text-ink">{item.quantity}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Preço médio</dt>
                    <dd className="money font-semibold text-ink">{formatMoney(item.averagePrice)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Atual</dt>
                    <dd className="money font-semibold text-ink">{formatMoney(item.currentPrice)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Valor atual</dt>
                    <dd className="money font-semibold text-ink">{formatMoney(item.currentValue)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted">Resultado</dt>
                    <dd className={`money font-semibold ${item.profitLoss >= 0 ? "text-green" : "text-red"}`}>
                      {item.profitLoss >= 0 ? "+" : "−"}
                      {formatMoney(Math.abs(item.profitLoss))} ({formatPercent(item.profitLossPercent)})
                    </dd>
                  </div>
                </dl>
                <Link
                  href={`/market/${item.stockId}?tab=sell`}
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-soft text-sm font-semibold text-green"
                >
                  Vender {item.stockSymbol} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Card>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-muted">
        Patrimônio = saldo + valor atual das ações. Resultado = (preço atual − preço médio) × quantidade.
      </p>
    </>
  );
}
