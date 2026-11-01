"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { getRanking } from "@/services/api/ranking";
import { RankingResponse } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { ApiErrorAlert } from "@/components/ApiError";
import { usePortfolioStream } from "@/hooks/usePortfolioStream";
import { usePortfolioHistory } from "@/hooks/usePortfolioHistory";
import { PatrimonyChart } from "@/components/charts/PatrimonyChart";
import { ExportMenu } from "@/components/ExportMenu";

export default function DashboardPage() {
  const { portfolio, point, connected } = usePortfolioStream();
  const [range, setRange] = useState("7D");
  const { points, loading } = usePortfolioHistory(range, point);
  const [ranking, setRanking] = useState<RankingResponse[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    getRanking().then(setRanking).catch(setError);
    const id = setInterval(() => {
      getRanking().then(setRanking).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const myPosition = ranking?.find((r) => r.userName === portfolio?.userName)?.position;

  return (
    <AuthGuard>
      <Shell>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Seu próximo movimento começa aqui.</h1>
              <p className="text-[#4a5a52] text-sm">
                Acompanhe seu patrimônio e explore o mercado fictício.
              </p>
            </div>
            <ExportMenu kind="portfolio" label="Relatório da carteira" />
          </div>
          {error ? <ApiErrorAlert error={error} onClose={() => setError(null)} /> : null}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#172e27] text-white rounded-xl p-6">
              <div className="text-xs text-[#c7d7cc]">Patrimônio total</div>
              <div className="text-2xl font-bold">
                {portfolio ? formatMoney(portfolio.totalPatrimony) : "—"}
              </div>
              <div className="text-xs text-[#f5ac45]">Saldo + ações</div>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <div className="text-xs text-[#4a5a52]">Saldo disponível</div>
              <div className="text-2xl font-bold">
                {portfolio ? formatMoney(portfolio.balance) : "—"}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <div className="text-xs text-[#4a5a52]">Valor das ações</div>
              <div className="text-2xl font-bold">
                {portfolio ? formatMoney(portfolio.totalCurrentValue) : "—"}
              </div>
              <div className="text-xs text-[#4a5a52]">{portfolio?.items.length ?? 0} empresas</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <PatrimonyChart
              points={points}
              loading={loading}
              range={range}
              onRangeChange={setRange}
              connected={connected}
            />
            <div className="bg-[#e8f1eb] rounded-xl p-6 flex flex-col gap-3">
              <span className="text-xs font-bold tracking-widest text-[#174f3d]">
                SEU LUGAR NO JOGO
              </span>
              <div className="text-3xl font-bold">
                {myPosition ? `${myPosition}º lugar` : "—"}
              </div>
              <Link
                href="/ranking"
                className="bg-[#174f3d] text-white rounded-lg py-3 text-center font-semibold"
              >
                Ver ranking →
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-semibold">O mercado está em movimento.</h3>
              <p className="text-sm text-[#4a5a52]">
                Descubra empresas e encontre sua próxima ação.
              </p>
            </div>
            <Link href="/market" className="bg-[#174f3d] text-white px-6 py-3 rounded-lg">
              Explorar mercado →
            </Link>
          </div>
        </div>
      </Shell>
    </AuthGuard>
  );
}
