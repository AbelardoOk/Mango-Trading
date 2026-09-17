"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { getPortfolio } from "@/services/api/portfolio";
import { PortfolioResponse } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { ApiErrorAlert } from "@/components/ApiError";
import { GrowthTag } from "@/components/GrowthTag";

export default function WalletPage() {
  const [p, setP] = useState<PortfolioResponse | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    getPortfolio().then(setP).catch(setError);
    const id = setInterval(() => getPortfolio().then(setP).catch(() => {}), 5000);
    return () => clearInterval(id);
  }, []);

  if (error) return <AuthGuard><Shell><ApiErrorAlert error={error} /></Shell></AuthGuard>;
  if (!p) return <AuthGuard><Shell><div className="p-8">Carregando...</div></Shell></AuthGuard>;

  const isEmpty = p.items.length === 0;
  return (
    <AuthGuard>
      <Shell>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Minha carteira</h1>
            <p className="text-sm text-[#4a5a52]">Acompanhe suas posições e patrimônio.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#172e27] text-white rounded-xl p-6"><div className="text-xs text-[#c7d7cc]">Patrimônio total</div><div className="text-xl font-bold">{formatMoney(p.totalPatrimony)}</div></div>
            <div className="bg-white rounded-xl p-6 border"><div className="text-xs text-[#4a5a52]">Saldo disponível</div><div className="text-xl font-bold">{formatMoney(p.balance)}</div></div>
            <div className="bg-white rounded-xl p-6 border"><div className="text-xs text-[#4a5a52]">Valor das ações</div><div className="text-xl font-bold">{formatMoney(p.totalCurrentValue)}</div></div>
          </div>
          {isEmpty ? (
            <div className="bg-white rounded-xl border p-12 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-[#e8f1eb] rounded-full flex items-center justify-center text-[#174f3d] text-2xl">↗</div>
              <h3 className="font-semibold">Sua primeira ação espera por você.</h3>
              <p className="text-sm text-[#4a5a52]">Explore o mercado para começar sua carteira virtual.</p>
              <Link href="/market" className="bg-[#174f3d] text-white px-6 py-3 rounded-lg">Explorar mercado</Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-[#4a5a52]">
                  <tr><th className="p-4 text-left">ATIVO</th><th className="p-4">QTD.</th><th className="p-4">PREÇO MÉDIO</th><th className="p-4">ATUAL</th><th className="p-4">VALOR ATUAL</th><th className="p-4">RESULTADO</th><th className="p-4"></th></tr>
                </thead>
                <tbody>
                    {p.items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="p-4"><div className="font-bold">{it.stockSymbol}</div><div className="text-xs text-[#4a5a52]">{it.stockName}</div></td>
                      <td className="p-4 text-center">{it.quantity}</td>
                      <td className="p-4">{formatMoney(it.averagePrice)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>{formatMoney(it.currentPrice)}</span>
                          <GrowthTag current={it.currentPrice} average={it.averagePrice} quantity={it.quantity} />
                        </div>
                      </td>
                      <td className="p-4 font-bold">{formatMoney(it.currentValue)}</td>
                      <td className={`p-4 ${it.profitLoss >= 0 ? "text-[#174f3d]" : "text-[#ad342c]"}`}>{it.profitLoss >= 0 ? "+" : "−"}{formatMoney(Math.abs(it.profitLoss))} <span className="text-xs">({it.profitLossPercent.toFixed(2)}%)</span></td>
                      <td className="p-4"><Link href={`/market/${it.stockId}`} className="bg-[#e8f1eb] text-[#174f3d] px-3 py-1 rounded text-xs">Vender</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-[#4a5a52]">Patrimônio = saldo + valor atual das ações. Resultado = (preço atual − preço médio) × quantidade.</p>
        </div>
      </Shell>
    </AuthGuard>
  );
}
