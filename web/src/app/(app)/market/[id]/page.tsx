"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { getStock } from "@/services/api/stocks";
import { getPortfolio } from "@/services/api/portfolio";
import { buy, sell } from "@/services/api/trades";
import { StockResponse } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { ApiErrorAlert } from "@/components/ApiError";
import { ApiError } from "@/types/api";

export default function TradePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const [stock, setStock] = useState<StockResponse | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [owned, setOwned] = useState<number>(0);
  const [qty, setQty] = useState(10);
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getStock(id).then(setStock).catch(setError);
    getPortfolio()
      .then((p) => {
        setBalance(p.balance);
        const item = p.items.find((it) => it.stockId === id);
        setOwned(item?.quantity ?? 0);
      })
      .catch(() => {});
  }, [id]);

  // Clear feedback when switching tab/qty via handler instead of effect to avoid set-state-in-effect
  function onTabChange(next: "buy" | "sell") {
    setTab(next);
    setError(null);
    setSuccess(null);
  }
  function onQtyChange(v: number) {
    setQty(v);
    setError(null);
    setSuccess(null);
  }

  if (!stock) return <AuthGuard><Shell><div className="p-8">Carregando...</div></Shell></AuthGuard>;

  const total = stock.currentPrice * qty;
  const after = tab === "buy" ? balance - total : balance + total;
  const canBuy = tab === "buy" && total > balance;
  const canSell = tab === "sell" && qty > owned;

  async function handle() {
    setError(null);
    setSuccess(null);
    try {
      if (tab === "buy") await buy({ stockId: id, quantity: qty });
      else await sell({ stockId: id, quantity: qty });
      setSuccess(`${tab === "buy" ? "Compra" : "Venda"} concluída: ${qty} ${stock!.symbol}`);
      // refresh balance
      const p = await getPortfolio();
      setBalance(p.balance);
      const item = p.items.find((it) => it.stockId === id);
      setOwned(item?.quantity ?? 0);
      setTimeout(() => router.push("/wallet"), 1200);
    } catch (e) {
      setError(e);
      if (e instanceof ApiError && e.status === 401) router.push("/login");
    }
  }

  return (
    <AuthGuard>
      <Shell>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6 flex flex-col gap-4">
            <span className="text-xs bg-[#e8f1eb] text-[#174f3d] px-3 py-1 rounded-full w-fit">{stock.symbol} · {stock.sector}</span>
            <h2 className="text-2xl font-bold">{stock.name}</h2>
            <div className="text-3xl font-bold">{formatMoney(stock.currentPrice)}</div>
            <p className="text-sm text-[#596b63]">{stock.description}</p>
            <hr />
            <p className="text-sm">Na carteira: <strong>{owned} ações</strong></p>
            <p className="text-sm">Saldo: <strong>{formatMoney(balance)}</strong></p>
          </div>
          <div className="bg-white rounded-xl border p-6 flex flex-col gap-4">
            <div className="flex bg-[#f5f7f3] rounded-lg p-1">
              <button onClick={() => onTabChange("buy")} className={`flex-1 py-2 rounded-lg font-semibold ${tab === "buy" ? "bg-[#174f3d] text-white" : "text-[#596b63]"}`}>Comprar</button>
              <button onClick={() => onTabChange("sell")} className={`flex-1 py-2 rounded-lg font-semibold ${tab === "sell" ? "bg-[#174f3d] text-white" : "text-[#596b63]"}`}>Vender</button>
            </div>
            <h3 className="font-semibold">Nova {tab === "buy" ? "compra" : "venda"}</h3>
            <ApiErrorAlert error={error} onClose={() => setError(null)} />
            {success && <div className="bg-[#e8f1eb] text-[#174f3d] p-3 rounded-lg">{success}</div>}
            <label className="flex flex-col gap-2">
              Quantidade
              <input type="number" min={1} value={qty} onChange={(e) => onQtyChange(Number(e.target.value))} className="border border-[#9bada1] rounded-lg p-3" />
              <span className="text-xs text-[#596b63]">{tab === "sell" ? `Você possui ${owned} ações.` : "Informe quantidade inteira >0"}</span>
            </label>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span>Preço unitário</span><strong>{formatMoney(stock.currentPrice)}</strong></div>
              <div className="flex justify-between"><span>Saldo disponível</span><span>{formatMoney(balance)}</span></div>
              <div className="flex justify-between font-bold border-t pt-3"><span>Total</span><span>{formatMoney(total)}</span></div>
              <div className="flex justify-between"><span>Saldo após</span><strong>{tab === "buy" && canBuy ? "—" : formatMoney(after)}</strong></div>
            </div>
            {(canBuy || canSell) && <div className="bg-[#fbece9] text-[#9c2e26] p-3 rounded-lg text-sm">{canBuy ? "Saldo insuficiente. Reduza a quantidade." : "Quantidade indisponível."}</div>}
            <button onClick={handle} className="bg-[#174f3d] text-white py-3 rounded-lg font-semibold">Confirmar {tab === "buy" ? "compra" : "venda"}</button>
            {success && <div className="text-sm text-[#174f3d]">Redirecionando para carteira...</div>}
          </div>
        </div>
      </Shell>
    </AuthGuard>
  );
}
