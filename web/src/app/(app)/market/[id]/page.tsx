"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Minus, Plus, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";
import { getStock } from "@/services/api/stocks";
import { buy, sell } from "@/services/api/trades";
import { StockResponse, ApiError } from "@/types/api";
import { formatMoney, formatPercent } from "@/lib/money";
import { ApiErrorAlert } from "@/components/ApiError";
import { useStockStream } from "@/hooks/useStockStream";
import { useStockHistory } from "@/hooks/useStockHistory";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useToast } from "@/components/ui/Toast";
import { PriceChart } from "@/components/charts/PriceChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

type Tab = "buy" | "sell";

function dailyChange(stock: StockResponse | null) {
  if (!stock) return null;
  if (stock.priceChangePercent != null) return stock.priceChangePercent;
  if (stock.previousPrice) return ((stock.currentPrice - stock.previousPrice) / stock.previousPrice) * 100;
  return null;
}

export default function TradePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const { toast } = useToast();
  const { portfolio, refresh } = usePortfolio();
  const { stocks, connected } = useStockStream();
  const [fetchedStock, setFetchedStock] = useState<StockResponse | null>(null);
  const [qtyInput, setQtyInput] = useState("10");
  const [tab, setTab] = useState<Tab>("buy");
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState<{ type: Tab; quantity: number; symbol: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [range, setRange] = useState("1D");

  const liveStock = stocks.find((stock) => stock.id === id) ?? null;
  const stock = liveStock ?? fetchedStock;
  const { points, loading } = useStockHistory(id, range, stock?.currentPrice);
  const position = portfolio?.items.find((item) => item.stockId === id);
  const balance = portfolio?.balance ?? 0;
  const owned = position?.quantity ?? 0;
  const average = position?.averagePrice ?? null;
  const change = dailyChange(stock);

  useEffect(() => {
    getStock(id).then(setFetchedStock).catch(setError);
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (requestedTab === "sell") setTab("sell");
  }, [id]);

  const quantity = Number(qtyInput);
  const quantityValid = Number.isInteger(quantity) && quantity > 0;
  const total = stock ? stock.currentPrice * (quantityValid ? quantity : 0) : 0;
  const after = tab === "buy" ? balance - total : balance + total;
  const insufficientBalance = tab === "buy" && total > balance;
  const insufficientShares = tab === "sell" && quantityValid && quantity > owned;
  const inactive = stock?.active === false;
  const portfolioReady = portfolio != null;
  const canSubmit =
    !!stock &&
    quantityValid &&
    !insufficientBalance &&
    !insufficientShares &&
    !inactive &&
    portfolioReady &&
    !submitting;

  const maxQuantity = stock
    ? tab === "buy"
      ? Math.max(0, Math.floor(balance / stock.currentPrice))
      : owned
    : 0;

  function setTabSafe(next: Tab) {
    setTab(next);
    setError(null);
    setSuccess(null);
  }

  function setQuantity(next: number) {
    setQtyInput(String(Math.max(0, Math.floor(next))));
    setError(null);
    setSuccess(null);
  }

  function requestConfirmation() {
    if (!canSubmit) return;
    setConfirmOpen(true);
  }

  async function execute() {
    if (!stock || !quantityValid) return;
    setSubmitting(true);
    setError(null);
    try {
      if (tab === "buy") await buy({ stockId: id, quantity });
      else await sell({ stockId: id, quantity });
      await refresh();
      setConfirmOpen(false);
      setSuccess({ type: tab, quantity, symbol: stock.symbol });
      toast({
        tone: "success",
        title: `${tab === "buy" ? "Compra" : "Venda"} concluída`,
        description: `${quantity} ${stock.symbol} por ${formatMoney(total)}.`,
      });
    } catch (err) {
      setError(err);
      setConfirmOpen(false);
      if (err instanceof ApiError && err.status === 401) router.push("/login");
    } finally {
      setSubmitting(false);
    }
  }

  if (!stock) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label="Carregando ação">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-soft" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl bg-soft" />
          <div className="h-96 animate-pulse rounded-2xl bg-soft" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/market" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-green">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar ao mercado
        </Link>
        <Badge tone={connected ? "green" : "orange"}>{connected ? "Preço em tempo real" : "Preço atualizado a cada 5s"}</Badge>
      </div>

      {success ? (
        <Card className="border-green/30 bg-soft p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green" aria-hidden="true" />
              <div>
                <h2 className="font-bold text-ink">
                  {success.type === "buy" ? "Compra" : "Venda"} concluída: {success.quantity} {success.symbol}
                </h2>
                <p className="text-sm text-muted">Sua carteira e seu saldo já foram atualizados.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/wallet" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-green px-4 text-sm font-semibold text-white">
                Ver carteira <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Button variant="outline" onClick={() => setSuccess(null)}>
                Continuar negociando
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{stock.symbol}</Badge>
                  <Badge tone="neutral">{stock.sector}</Badge>
                  {inactive ? <Badge tone="red">Indisponível</Badge> : null}
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">{stock.name}</h1>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <span className="money text-3xl font-bold tracking-tight text-ink">{formatMoney(stock.currentPrice)}</span>
                  {change != null ? (
                    <span className={`inline-flex items-center gap-1 pb-1 text-sm font-semibold ${change >= 0 ? "text-green" : "text-red"}`}>
                      {change >= 0 ? <TrendingUp className="h-4 w-4" aria-hidden="true" /> : <TrendingDown className="h-4 w-4" aria-hidden="true" />}
                      {formatPercent(change)} hoje
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="rounded-xl bg-bg p-3 text-right text-xs text-muted">
                <p className="font-semibold text-ink">{owned} ações</p>
                <p>{average != null ? `média ${formatMoney(average)}` : "você ainda não possui"}</p>
              </div>
            </div>
            {stock.description ? <p className="mt-3 text-sm leading-relaxed text-muted">{stock.description}</p> : null}
          </Card>

          <PriceChart
            points={points}
            loading={loading}
            range={range}
            onRangeChange={setRange}
            connected={connected}
            symbol={stock.symbol}
            baseline={average}
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <div className="grid grid-cols-2 rounded-xl bg-bg p-1" role="tablist" aria-label="Tipo de operação">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "buy"}
                onClick={() => setTabSafe("buy")}
                className={`min-h-10 rounded-lg text-sm font-bold transition-colors ${tab === "buy" ? "bg-green text-white shadow-sm" : "text-muted hover:text-ink"}`}
              >
                Comprar
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "sell"}
                onClick={() => setTabSafe("sell")}
                className={`min-h-10 rounded-lg text-sm font-bold transition-colors ${tab === "sell" ? "bg-green text-white shadow-sm" : "text-muted hover:text-ink"}`}
              >
                Vender
              </button>
            </div>

            <h2 className="mt-4 font-bold text-ink">Nova {tab === "buy" ? "compra" : "venda"}</h2>
            <p className="mt-1 text-xs text-muted">
              {tab === "buy" ? "Informe a quantidade inteira que deseja comprar." : `Você possui ${owned} ações disponíveis para venda.`}
            </p>

            <ApiErrorAlert error={error} onClose={() => setError(null)} />

            <div className="mt-4 flex flex-col gap-2">
              <label htmlFor="quantity" className="text-sm font-semibold text-ink">
                Quantidade
              </label>
              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((quantity || 1) - 1)}
                  className="flex w-10 items-center justify-center rounded-xl border border-border text-ink hover:bg-bg"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={qtyInput}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  aria-describedby="quantity-help"
                  aria-invalid={!quantityValid || insufficientBalance || insufficientShares}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-white px-3 py-2.5 text-center text-lg font-bold text-ink"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((quantity || 0) + 1)}
                  className="flex w-10 items-center justify-center rounded-xl border border-border text-ink hover:bg-bg"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[10, 25, 50].map((value) => (
                  <Button key={value} size="sm" variant="outline" onClick={() => setQuantity(value)}>
                    {value}
                  </Button>
                ))}
                <Button size="sm" variant="secondary" onClick={() => setQuantity(maxQuantity)}>
                  Máx. {maxQuantity}
                </Button>
              </div>
              <p id="quantity-help" className="text-xs text-muted">
                {tab === "buy" ? "Máximo pelo saldo atual." : "Máximo conforme suas ações."}
              </p>
            </div>

            <dl className="mt-4 flex flex-col gap-2 rounded-xl bg-bg p-3 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Preço unitário</dt>
                <dd className="money font-semibold text-ink">{formatMoney(stock.currentPrice)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Saldo disponível</dt>
                <dd className="money font-semibold text-ink">{portfolioReady ? formatMoney(balance) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-2 border-t border-line pt-2">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="money font-bold text-ink">{formatMoney(total)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Saldo após</dt>
                <dd className={`money font-semibold ${after < 0 ? "text-red" : "text-ink"}`}>
                  {portfolioReady ? formatMoney(after) : "—"}
                </dd>
              </div>
            </dl>

            {inactive ? (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#fbece9] p-3 text-xs text-[#9c2e26]" role="alert">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Esta ação está desativada e não aceita novas negociações.
              </p>
            ) : insufficientBalance ? (
              <p className="mt-3 rounded-xl bg-[#fbece9] p-3 text-xs text-[#9c2e26]" role="alert">
                Saldo insuficiente. Reduza a quantidade ou escolha o máximo de {maxQuantity} ações.
              </p>
            ) : insufficientShares ? (
              <p className="mt-3 rounded-xl bg-[#fbece9] p-3 text-xs text-[#9c2e26]" role="alert">
                Quantidade indisponível. Você possui {owned} ações.
              </p>
            ) : !quantityValid ? (
              <p className="mt-3 rounded-xl bg-[#fbece9] p-3 text-xs text-[#9c2e26]" role="alert">
                Informe uma quantidade inteira maior que zero.
              </p>
            ) : null}

            <Button
              size="lg"
              onClick={requestConfirmation}
              disabled={!canSubmit}
              className="mt-4 w-full"
            >
              Revisar {tab === "buy" ? "compra" : "venda"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Card>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Confirmar ${tab === "buy" ? "compra" : "venda"}`}
        description="Confira os detalhes antes de enviar a ordem."
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={execute} disabled={submitting}>
              {submitting ? "Enviando..." : "Confirmar"}
            </Button>
          </>
        }
      >
        <dl className="flex flex-col gap-2 rounded-xl bg-bg p-3 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Ativo</dt>
            <dd className="font-semibold text-ink">{stock.symbol} · {stock.name}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Quantidade</dt>
            <dd className="font-semibold text-ink">{quantity}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Preço unitário</dt>
            <dd className="money font-semibold text-ink">{formatMoney(stock.currentPrice)}</dd>
          </div>
          <div className="flex justify-between gap-2 border-t border-line pt-2">
            <dt className="font-semibold text-ink">Total</dt>
            <dd className="money font-bold text-ink">{formatMoney(total)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Saldo após</dt>
            <dd className="money font-semibold text-ink">{formatMoney(after)}</dd>
          </div>
        </dl>
      </Modal>
    </>
  );
}
