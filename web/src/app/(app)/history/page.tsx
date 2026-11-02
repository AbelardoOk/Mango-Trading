"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, History, SearchX } from "lucide-react";
import { history } from "@/services/api/trades";
import { TransactionResponse } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { ExportMenu } from "@/components/ExportMenu";
import { ApiErrorAlert } from "@/components/ApiError";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

type Filter = "ALL" | "BUY" | "SELL";

export default function HistoryPage() {
  const [rows, setRows] = useState<TransactionResponse[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [visible, setVisible] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    history()
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (filter !== "ALL" && row.type !== filter) return false;
        const date = new Date(row.createdAt).toISOString().slice(0, 10);
        if (from && date < from) return false;
        if (to && date > to) return false;
        return true;
      }),
    [rows, filter, from, to]
  );

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, row) => {
        const total = row.price * row.quantity;
        if (row.type === "BUY") acc.bought += total;
        else acc.sold += total;
        acc.operations += 1;
        return acc;
      },
      { bought: 0, sold: 0, operations: 0 }
    );
  }, [filtered]);

  const visibleRows = filtered.slice(0, visible);
  const hasFilters = filter !== "ALL" || Boolean(from) || Boolean(to);

  function clearFilters() {
    setFilter("ALL");
    setFrom("");
    setTo("");
    setVisible(20);
  }

  return (
    <>
      <PageHeader
        eyebrow="HISTÓRICO"
        title="Histórico de transações"
        description="Consulte compras e vendas, filtre por período e exporte seus registros."
        actions={
          <ExportMenu
            kind="trades"
            params={{ from, to, type: filter === "ALL" ? "" : filter }}
            label="Exportar histórico"
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total comprado"
          value={formatMoney(totals.bought)}
          hint={`${filtered.filter((row) => row.type === "BUY").length} operações`}
          icon={<ArrowDownLeft className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Total vendido"
          value={formatMoney(totals.sold)}
          hint={`${filtered.filter((row) => row.type === "SELL").length} operações`}
          icon={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Operações no filtro"
          value={totals.operations}
          hint={hasFilters ? "Filtros aplicados" : "Todo o histórico"}
          tone="soft"
          icon={<History className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por tipo">
            {[
              { value: "ALL", label: "Todas" },
              { value: "BUY", label: "Compras" },
              { value: "SELL", label: "Vendas" },
            ].map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={filter === option.value ? "primary" : "outline"}
                onClick={() => {
                  setFilter(option.value as Filter);
                  setVisible(20);
                }}
                aria-pressed={filter === option.value}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
            De
            <input
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setVisible(20);
              }}
              className="min-h-9 rounded-lg border border-border bg-white px-2.5 text-sm text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
            Até
            <input
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setVisible(20);
              }}
              className="min-h-9 rounded-lg border border-border bg-white px-2.5 text-sm text-ink"
            />
          </label>
          <span className="ml-auto text-xs text-muted">{filtered.length} registros</span>
          {hasFilters ? (
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              Limpar filtros
            </Button>
          ) : null}
        </div>
      </Card>

      {error ? (
        <div className="flex flex-col gap-2">
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setError(null);
                setLoading(true);
                setReloadKey((current) => current + 1);
              }}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <Card className="p-8" role="status" aria-label="Carregando histórico">
          <div className="flex flex-col gap-3">
            <div className="h-6 w-48 animate-pulse rounded bg-soft" />
            <div className="h-10 animate-pulse rounded bg-soft" />
            <div className="h-10 animate-pulse rounded bg-soft" />
            <div className="h-10 animate-pulse rounded bg-soft" />
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-6 w-6" />}
          title={hasFilters ? "Nenhuma transação neste filtro" : "Nenhuma transação ainda"}
          description={hasFilters ? "Ajuste o tipo ou o período para ver mais resultados." : "Suas compras e vendas aparecerão aqui."}
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Histórico de transações</caption>
                <thead className="border-b border-line bg-bg/60 text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th scope="col" className="p-4 text-left font-bold">Data e hora</th>
                    <th scope="col" className="p-4 text-center font-bold">Operação</th>
                    <th scope="col" className="p-4 text-left font-bold">Ativo</th>
                    <th scope="col" className="p-4 text-center font-bold">Qtd.</th>
                    <th scope="col" className="p-4 text-right font-bold">Preço</th>
                    <th scope="col" className="p-4 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-line hover:bg-bg/60">
                      <td className="p-4 text-xs text-muted">{new Date(transaction.createdAt).toLocaleString("pt-BR")}</td>
                      <td className="p-4 text-center">
                        <Badge tone={transaction.type === "BUY" ? "green" : "orange"}>
                          {transaction.type === "BUY" ? "Compra" : "Venda"}
                        </Badge>
                      </td>
                      <td className="p-4 font-bold text-ink">{transaction.stockSymbol}</td>
                      <td className="p-4 text-center">{transaction.quantity}</td>
                      <td className="money p-4 text-right">{formatMoney(transaction.price)}</td>
                      <td className="money p-4 text-right font-bold">{formatMoney(transaction.price * transaction.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-col gap-3 md:hidden">
            {visibleRows.map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-ink">{transaction.stockSymbol}</div>
                    <div className="text-xs text-muted">{new Date(transaction.createdAt).toLocaleString("pt-BR")}</div>
                  </div>
                  <Badge tone={transaction.type === "BUY" ? "green" : "orange"}>
                    {transaction.type === "BUY" ? "Compra" : "Venda"}
                  </Badge>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-muted">Qtd.</dt>
                    <dd className="font-semibold text-ink">{transaction.quantity}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Preço</dt>
                    <dd className="money font-semibold text-ink">{formatMoney(transaction.price)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Total</dt>
                    <dd className="money font-semibold text-ink">{formatMoney(transaction.price * transaction.quantity)}</dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>

          {visibleRows.length < filtered.length ? (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setVisible((current) => current + 20)}>
                Carregar mais ({filtered.length - visibleRows.length} restantes)
              </Button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
