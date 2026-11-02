"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  Building2,
  CalendarClock,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { formatMoney, formatPercent } from "@/lib/money";
import { ApiErrorAlert } from "@/components/ApiError";
import { useStockStream } from "@/hooks/useStockStream";
import { useEventStream } from "@/hooks/useEventStream";
import { usePortfolioStream } from "@/hooks/usePortfolioStream";
import { markOnboarding } from "@/lib/onboarding";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

type SortKey = "name" | "price" | "change";
type SortDirection = "asc" | "desc";

function priceChange(stock: { priceChangePercent?: number | null; currentPrice: number; previousPrice?: number | null }) {
  if (stock.priceChangePercent != null) return stock.priceChangePercent;
  if (stock.previousPrice) return ((stock.currentPrice - stock.previousPrice) / stock.previousPrice) * 100;
  return null;
}

export default function MarketPage() {
  const { stocks, connected } = useStockStream();
  const { events } = useEventStream();
  const { portfolio } = usePortfolioStream();
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("Todos os setores");
  const [onlyMine, setOnlyMine] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [error, setError] = useState<unknown>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    markOnboarding("market");
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const ownedIds = useMemo(() => new Set(portfolio?.items.map((item) => item.stockId) ?? []), [portfolio]);
  const sectors = useMemo(
    () => ["Todos os setores", ...Array.from(new Set(stocks.map((stock) => stock.sector).filter(Boolean))).sort()],
    [stocks]
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const rows = stocks.filter((stock) => {
      const matchQuery = !query || `${stock.name} ${stock.symbol} ${stock.sector}`.toLowerCase().includes(query);
      const matchSector = sector === "Todos os setores" || stock.sector === sector;
      const matchOwned = !onlyMine || ownedIds.has(stock.id);
      return matchQuery && matchSector && matchOwned;
    });

    return rows.sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") comparison = a.name.localeCompare(b.name, "pt-BR");
      if (sortKey === "price") comparison = a.currentPrice - b.currentPrice;
      if (sortKey === "change") comparison = (priceChange(a) ?? 0) - (priceChange(b) ?? 0);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [stocks, q, sector, onlyMine, ownedIds, sortKey, sortDirection]);

  const upcoming = events.filter((event) => event.status === "UPCOMING");
  const active = events.filter((event) => event.status === "ACTIVE");
  const ownedCount = portfolio?.items.length ?? 0;

  function changeSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "name" ? "asc" : "desc");
    }
  }

  function sortAria(key: SortKey) {
    if (sortKey !== key) return "none" as const;
    return sortDirection === "asc" ? ("ascending" as const) : ("descending" as const);
  }

  function formatRemaining(endIso?: string) {
    if (!endIso) return "";
    const diff = new Date(endIso).getTime() - now.getTime();
    if (diff <= 0) return "evento encerrado";
    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) return `faltam ${hours}h ${minutes}min`;
    return `faltam ${minutes}min`;
  }

  function formatStart(event: (typeof events)[number]) {
    if (event.secondsToStart != null) {
      const minutes = Math.floor(event.secondsToStart / 60);
      const seconds = event.secondsToStart % 60;
      return `${minutes}m ${seconds}s`;
    }
    if (event.nextRunAt) {
      return new Date(event.nextRunAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "em breve";
  }

  return (
    <>
      <PageHeader
        eyebrow="MERCADO"
        title="Mercado de ações"
        description="Explore empresas fictícias, acompanhe variações e encontre seu próximo movimento."
        actions={<Badge tone={connected ? "green" : "orange"}>{connected ? "Tempo real" : "Atualização a cada 5s"}</Badge>}
      />

      {upcoming.length > 0 ? (
        <div className="rounded-2xl border border-orange/50 bg-[#fff0d6] p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-[#754600]">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            EVENTO IMINENTE · VISÍVEL 3 MIN ANTES
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {upcoming.map((event) => (
              <div key={event.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-[#5f3a00]">
                  {event.title} · impacto {event.impact.toLowerCase()} · {event.scope === "SECTOR" ? event.sector : "geral"}
                </span>
                <Badge tone="orange">Inicia em {formatStart(event)}</Badge>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {active.length > 0 ? (
        <div className="rounded-2xl border border-green/40 bg-soft p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-green">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            EVENTO ATIVO
          </div>
          <div className="mt-2 flex flex-col gap-1">
            {active.map((event) => (
              <p key={event.id} className="text-sm text-ink">
                <strong>{event.title}</strong> · impacto {event.impact.toLowerCase()}
                {event.priceDeltaPercent ? ` (${formatPercent(event.priceDeltaPercent)})` : ""} ·{" "}
                {event.scope === "SECTOR" ? event.sector : "geral"} · {formatRemaining(event.endDate)}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <ApiErrorAlert error={error} onClose={() => setError(null)} /> : null}

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Buscar empresa ou símbolo</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Buscar empresa, símbolo ou setor"
              className="w-full rounded-xl border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted"
            />
          </label>
          <label className="lg:w-56">
            <span className="sr-only">Filtrar por setor</span>
            <select
              value={sector}
              onChange={(event) => setSector(event.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink"
            >
              {sectors.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(event) => setOnlyMine(event.target.checked)}
              className="h-4 w-4 accent-[#174f3d]"
            />
            Só minhas ações
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          <Badge tone="neutral">{filtered.length} empresas</Badge>
          <Badge tone="neutral">{sectors.length - 1} setores</Badge>
          <Badge tone={ownedCount ? "green" : "neutral"}>{ownedCount} na sua carteira</Badge>
          {(q || sector !== "Todos os setores" || onlyMine) && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setSector("Todos os setores");
                setOnlyMine(false);
              }}
              className="ml-auto text-xs font-semibold text-green underline underline-offset-2"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </Card>

      <Card className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Empresas fictícias disponíveis para negociação</caption>
            <thead className="border-b border-line bg-bg/60 text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="p-4 text-left" aria-sort={sortAria("name")}>
                  <button type="button" onClick={() => changeSort("name")} className="inline-flex items-center gap-1 font-bold">
                    Empresa / símbolo <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                  </button>
                </th>
                <th scope="col" className="p-4 text-right" aria-sort={sortAria("price")}>
                  <button type="button" onClick={() => changeSort("price")} className="inline-flex items-center gap-1 font-bold">
                    Preço atual <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                  </button>
                </th>
                <th scope="col" className="p-4 text-right" aria-sort={sortAria("change")}>
                  <button type="button" onClick={() => changeSort("change")} className="inline-flex items-center gap-1 font-bold">
                    Variação do dia <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                  </button>
                </th>
                <th scope="col" className="p-4 text-right font-bold">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stock) => {
                const change = priceChange(stock);
                const owned = portfolio?.items.find((item) => item.stockId === stock.id);
                return (
                  <tr key={stock.id} className="border-t border-line transition-colors hover:bg-bg/60">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-xs font-bold text-green">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-ink">{stock.name}</div>
                          <div className="text-xs text-muted">
                            {stock.symbol} · {stock.sector}
                            {owned ? <span className="ml-2 text-green">· {owned.quantity} na carteira</span> : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="money p-4 text-right font-semibold text-ink">{formatMoney(stock.currentPrice)}</td>
                    <td className="p-4 text-right">
                      {change == null ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${change >= 0 ? "text-green" : "text-red"}`}>
                          {change >= 0 ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
                          {formatPercent(change)}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/market/${stock.id}`}
                        className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-soft px-3 text-xs font-semibold text-green hover:bg-[#dbe9df]"
                      >
                        Negociar <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            className="m-4 border-0"
            icon={<Search className="h-5 w-5" />}
            title="Nenhuma empresa encontrada"
            description="Tente outro termo, setor ou desative o filtro de carteira."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQ("");
                  setSector("Todos os setores");
                  setOnlyMine(false);
                }}
              >
                Limpar filtros
              </Button>
            }
          />
        ) : null}
      </Card>

      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((stock) => {
          const change = priceChange(stock);
          const owned = portfolio?.items.find((item) => item.stockId === stock.id);
          return (
            <Card key={stock.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-xs font-bold text-green">
                  {stock.symbol.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">{stock.name}</div>
                  <div className="text-xs text-muted">{stock.symbol} · {stock.sector}</div>
                  {owned ? <div className="mt-1 text-[11px] font-semibold text-green">{owned.quantity} na carteira</div> : null}
                </div>
                <div className="text-right">
                  <div className="money font-bold text-ink">{formatMoney(stock.currentPrice)}</div>
                  {change == null ? (
                    <div className="text-xs text-muted">—</div>
                  ) : (
                    <div className={`text-xs font-semibold ${change >= 0 ? "text-green" : "text-red"}`}>{formatPercent(change)}</div>
                  )}
                </div>
              </div>
              <Link
                href={`/market/${stock.id}`}
                className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-soft text-sm font-semibold text-green"
              >
                Negociar <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Card>
          );
        })}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-5 w-5" />}
            title="Nenhuma empresa encontrada"
            description="Ajuste a busca ou limpe os filtros para ver todo o mercado."
            action={<Button variant="secondary" onClick={() => { setQ(""); setSector("Todos os setores"); setOnlyMine(false); }}>Limpar filtros</Button>}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
        Todas as empresas e cotações são fictícias. Operações usam saldo virtual.
      </div>
    </>
  );
}
