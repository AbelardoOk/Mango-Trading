"use client";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { getRanking } from "@/services/api/ranking";
import { RankingResponse } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { useAuth } from "@/hooks/useAuth";

export default function RankingPage() {
  const [rows, setRows] = useState<RankingResponse[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    getRanking().then(setRows).catch(() => {});
  }, []);

  const me = rows.find((r) => r.userId === user?.id);

  return (
    <AuthGuard>
      <Shell>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">Ranking de jogadores</h1>
            <p className="text-sm text-[#596b63]">Classificação pelo patrimônio total.</p>
          </div>
          {me && (
            <div className="bg-[#172e27] text-white rounded-xl p-6 flex justify-between items-center">
              <div>
                <div className="text-xs text-[#c7d7cc]">SEU LUGAR</div>
                <div className="text-xl font-bold">{me.position}º lugar · {formatMoney(me.totalPatrimony)}</div>
              </div>
              <span className="bg-[#315446] px-3 py-1 rounded-full text-xs">Top 10</span>
            </div>
          )}
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[#596b63]">
                <tr><th className="p-4 text-left">POSIÇÃO</th><th className="p-4 text-left">JOGADOR</th><th className="p-4 text-left">PATRIMÔNIO TOTAL</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.userId} className={`border-t ${r.userId === user?.id ? "bg-[#e8f1eb]" : ""}`}>
                    <td className="p-4 font-bold">{String(r.position).padStart(2, "0")}</td>
                    <td className="p-4"><span className="font-semibold">{r.userName}</span> {r.userId === user?.id && <span className="bg-[#e8f1eb] text-[#174f3d] px-2 py-1 rounded-full text-xs ml-2">Você</span>}</td>
                    <td className="p-4 font-bold">{formatMoney(r.totalPatrimony)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Shell>
    </AuthGuard>
  );
}
