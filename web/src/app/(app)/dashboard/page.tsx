"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, LineChart, Sparkles, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolioStream } from "@/hooks/usePortfolioStream";
import { usePortfolioHistory } from "@/hooks/usePortfolioHistory";
import { getRanking } from "@/services/api/ranking";
import { listStocks } from "@/services/api/stocks";
import { listEvents } from "@/services/api/events";
import { MarketEventResponse, RankingResponse, StockResponse } from "@/types/api";
import { formatMoney, formatPercent } from "@/lib/money";
import { ApiErrorAlert } from "@/components/ApiError";
import { PatrimonyChart } from "@/components/charts/PatrimonyChart";
import { ExportMenu } from "@/components/ExportMenu";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const { portfolio, point, connected } = usePortfolioStream();
  const [range, setRange] = useState("7D");
  const { points, loading } = usePortfolioHistory(range, point);
  const [ranking, setRanking] = useState<RankingResponse[] | null>(null);
  const [stocks, setStocks] = useState<StockResponse[]>([]);
  const [events, setEvents] = useState<MarketEventResponse[]>([]);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    getRanking().then(setRanking).catch(setError);
    const rankingTimer = setInterval(() => getRanking().then(setRanking).catch(() => {}), 30000);
    listStocks().then(setStocks).catch(() => {});
    const stocksTimer = setInterval(() => listStocks().then(setStocks).catch(() => {}), 30000);
    listEvents().then(setEvents).catch(() => {});
    const eventsTimer = setInterval(() => listEvents().then(setEvents).catch(() => {}), 30000);
    return () => {
      clearInterval(rankingTimer);
      clearInterval(stocksTimer);
      clearInterval(eventsTimer);
    };
  }, []);

  const myRanking = ranking?.find((row) => row.userId === user?.id);
  const first = points[0]?.patrimony;
  const last = points[points.length - 1]?.patrimony;
  const delta = first != null && last != null ? Number(last) - Number(first) : 0;
  const deltaPercent = first ? (delta / Number(first)) * 100 : 0;
  const positive = delta >= 0;

  const movers = useMemo(
    () =>
      [...stocks]
        .filter((stock) => stock.priceChangePercent != null)
        .sort((a, b) => Math.abs(b.priceChangePercent ?? 0) - Math.abs(a.priceChangePercent ?? 0))
        .slice(0, 4),
    [stocks]
  );
  const visibleEvents = events.filter((event) => event.status === "ACTIVE" || event.status === "UPCOMING").slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="VISÃO GERAL"
        title="Seu próximo movimento começa aqui."
        description="Acompanhe seu patrimônio, encontre oportunidades e evolua no mercado fictício."
        actions={<ExportMenu kind="portfolio" label="Relatório da carteira" />}
      />

      {error ? <ApiErrorAlert error={error} onClose={() => setError(null)} /> : null}

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <Card className="relative overflow-hidden border-ink bg-ink p-6 text-white">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-green/40 blur-2xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 right-10 h-48 w-48 rounded-full bg-orange/15 blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="orange">PATRIMÔNIO TOTAL</Badge>
              <span className="text-[11px] text-[#9fb5a8]">Saldo + valor das ações</span>
            </div>
            <p className="money mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              {portfolio ? formatMoney(portfolio.totalPatrimony) : "M$ —"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${
                  positive ? "bg-[#1f5a46] text-[#b9f3d7]" : "bg-[#5a2a27] text-[#ffd0cb]"
                }`}
              >
                {positive ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
                {formatPercent(deltaPercent)} no período
              </span>
              <span className="text-[#9fb5a8]">
                {delta >= 0 ? "+" : "−"}
                {formatMoney(Math.abs(delta))}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/market"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-orange px-4 text-sm font-bold text-ink hover:bg-[#f2a233]"
              >
                Explorar mercado <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/wallet"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/10"
              >
                Ver carteira
              </Link>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between gap-4 border-soft bg-soft p-6">
          <div>
            <span className="text-[10px] font-bold tracking-[0.18em] text-green">SEU LUGAR NO JOGO</span>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-4xl font-bold tracking-tight text-ink">
                {myRanking ? `${myRanking.position}º` : "—"}
              </span>
              <span className="pb-1 text-sm text-muted">no ranking</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {myRanking
                ? `${formatMoney(myRanking.totalPatrimony)} de patrimônio`
                : "Faça sua primeira operação para entrar na disputa."}
            </p>
          </div>
          <Link
            href="/ranking"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#123f30]"
          >
            Ver ranking <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Saldo disponível"
          value={portfolio ? formatMoney(portfolio.balance) : "M$ —"}
          hint="Para novas compras"
          icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Valor em ações"
          value={portfolio ? formatMoney(portfolio.totalCurrentValue) : "M$ —"}
          hint={`${portfolio?.items.length ?? 0} empresas na carteira`}
          icon={<LineChart className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Resultado total"
          value={portfolio ? formatMoney(portfolio.totalProfitLoss) : "M$ —"}
          hint="Valorização das posições"
          icon={(portfolio?.totalProfitLoss ?? 0) >= 0 ? <TrendingUp className="h-4 w-4" aria-hidden="true" /> : <TrendingDown className="h-4 w-4" aria-hidden="true" />}
          className={(portfolio?.totalProfitLoss ?? 0) >= 0 ? "border-green/20" : "border-red/20"}
        />
        <StatCard
          label="Empresas disponíveis"
          value={stocks.length || "—"}
          hint="Catálogo fictício"
          icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
          tone="soft"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <PatrimonyChart
          points={points}
          loading={loading}
          range={range}
          onRangeChange={setRange}
          connected={connected}
        />
        <div className="flex flex-col gap-4">
          <OnboardingChecklist hasPosition={(portfolio?.items.length ?? 0) > 0} />
          <Card className="p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-[#fff0d6] p-2 text-[#754600]">
                  <CalendarClock className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-bold text-ink">Agenda do mercado</h3>
              </div>
              <Badge tone={visibleEvents.length ? "orange" : "neutral"}>{visibleEvents.length} evento(s)</Badge>
            </div>
            {visibleEvents.length === 0 ? (
              <p className="mt-3 text-xs text-muted">Nenhum evento ativo ou iminente agora.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {visibleEvents.map((event) => (
                  <li key={event.id} className="rounded-lg border border-line p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-ink">{event.title}</span>
                      <Badge tone={event.status === "ACTIVE" ? "green" : "orange"}>
                        {event.status === "ACTIVE" ? "Ativo" : "Em breve"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      Impacto {event.impact.toLowerCase()} · {event.scope === "SECTOR" ? event.sector : "Geral"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/market" className="mt-3 inline-flex text-xs font-semibold text-green underline underline-offset-2">
              Ver detalhes no mercado →
            </Link>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-ink">Movimentações do mercado</h3>
            <Link href="/market" className="text-xs font-semibold text-green underline underline-offset-2">
              Ver tudo
            </Link>
          </div>
          {movers.length === 0 ? (
            <p className="mt-4 text-xs text-muted">Aguardando atualizações de preço.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {movers.map((stock) => {
                const change = stock.priceChangePercent ?? 0;
                return (
                  <li key={stock.id}>
                    <Link href={`/market/${stock.id}`} className="flex items-center gap-3 py-2.5 hover:bg-bg">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-soft text-[10px] font-bold text-green">
                        {stock.symbol.slice(0, 2)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{stock.name}</span>
                        <span className="block text-[11px] text-muted">{stock.symbol} · {stock.sector}</span>
                      </span>
                      <span className="text-right">
                        <span className="money block text-sm font-bold text-ink">{formatMoney(stock.currentPrice)}</span>
                        <span className={`block text-[11px] font-semibold ${change >= 0 ? "text-green" : "text-red"}`}>
                          {formatPercent(change)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col justify-between gap-4 p-5">
          <div>
            <span className="text-[10px] font-bold tracking-[0.18em] text-green">PRÓXIMO PASSO</span>
            <h3 className="mt-2 text-lg font-bold text-ink">O mercado está em movimento.</h3>
            <p className="mt-1 text-sm text-muted">
              Descubra empresas, compare preços e encontre sua próxima ação fictícia.
            </p>
          </div>
          <Link
            href="/market"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#123f30]"
          >
            Explorar mercado <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
      </div>
    </>
  );
}
