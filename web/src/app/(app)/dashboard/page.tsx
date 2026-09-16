"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { getPortfolio } from "@/services/api/portfolio";
import { getRanking } from "@/services/api/ranking";
import { PortfolioResponse, RankingResponse } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { ApiErrorAlert } from "@/components/ApiError";

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [ranking, setRanking] = useState<RankingResponse[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    getPortfolio().then(setPortfolio).catch(setError);
    getRanking().then(setRanking).catch(setError);
  }, []);

  return (
    <AuthGuard>
      <Shell>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Seu próximo movimento começa aqui.</h1>
            <p className="text-[#4a5a52] text-sm">Acompanhe seu patrimônio e explore o mercado fictício.</p>
          </div>
          {error ? <ApiErrorAlert error={error} onClose={() => setError(null)} /> : null}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#172e27] text-white rounded-xl p-6">
              <div className="text-xs text-[#c7d7cc]">Patrimônio total</div>
              <div className="text-2xl font-bold">{portfolio ? formatMoney(portfolio.totalPatrimony) : "—"}</div>
              <div className="text-xs text-[#f5ac45]">Saldo + ações</div>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <div className="text-xs text-[#4a5a52]">Saldo disponível</div>
              <div className="text-2xl font-bold">{portfolio ? formatMoney(portfolio.balance) : "—"}</div>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <div className="text-xs text-[#4a5a52]">Valor das ações</div>
              <div className="text-2xl font-bold">{portfolio ? formatMoney(portfolio.totalCurrentValue) : "—"}</div>
              <div className="text-xs text-[#4a5a52]">{portfolio?.items.length ?? 0} empresas</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <div className="bg-white rounded-xl p-6 border">
              <h3 className="font-semibold">Evolução do patrimônio</h3>
              <p className="text-xs text-[#4a5a52]">Últimos 7 dias · M$</p>
              <div className="h-32 bg-[#e8f1eb] rounded mt-4 flex items-end gap-1 p-2">
                {[40, 55, 50, 70, 65, 85, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#174f3d] rounded" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="bg-[#e8f1eb] rounded-xl p-6 flex flex-col gap-3">
              <span className="text-xs font-bold tracking-widest text-[#174f3d]">SEU LUGAR NO JOGO</span>
              <div className="text-3xl font-bold">{ranking?.find((r) => r.position) ? `${ranking?.find((r) => r.userName === portfolio?.userName)?.position ?? "?"}º lugar` : "—"}</div>
              <Link href="/ranking" className="bg-[#174f3d] text-white rounded-lg py-3 text-center font-semibold">Ver ranking →</Link>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-semibold">O mercado está em movimento.</h3>
              <p className="text-sm text-[#4a5a52]">Descubra empresas e encontre sua próxima ação.</p>
            </div>
            <Link href="/market" className="bg-[#174f3d] text-white px-6 py-3 rounded-lg">Explorar mercado →</Link>
          </div>
        </div>
      </Shell>
    </AuthGuard>
  );
}
