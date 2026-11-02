"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Medal, Search, Trophy } from "lucide-react";
import { getRanking } from "@/services/api/ranking";
import { RankingResponse } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { useAuth } from "@/hooks/useAuth";
import { markOnboarding } from "@/lib/onboarding";
import { ExportMenu } from "@/components/ExportMenu";
import { ApiErrorAlert } from "@/components/ApiError";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

function PodiumCard({ row, place }: { row: RankingResponse; place: 1 | 2 | 3 }) {
  const styles = {
    1: "order-2 border-orange/50 bg-[#fff7e8] sm:pb-10",
    2: "order-1 sm:mt-6",
    3: "order-3 sm:mt-6",
  } as const;
  const icon = place === 1 ? <Crown className="h-5 w-5 text-[#a96900]" aria-hidden="true" /> : <Medal className="h-5 w-5 text-muted" aria-hidden="true" />;

  return (
    <Card className={`flex flex-col items-center gap-2 p-5 text-center ${styles[place]}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">{icon}</span>
      <Badge tone={place === 1 ? "orange" : "neutral"}>{place}º lugar</Badge>
      <p className="max-w-full truncate text-sm font-bold text-ink">{row.userName}</p>
      <p className="money text-lg font-bold text-ink">{formatMoney(row.totalPatrimony)}</p>
    </Card>
  );
}

export default function RankingPage() {
  const [rows, setRows] = useState<RankingResponse[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const { user } = useAuth();

  useEffect(() => {
    markOnboarding("ranking");
    getRanking()
      .then(setRows)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const me = rows.find((row) => row.userId === user?.id);
  const ahead = me && me.position > 1 ? rows.find((row) => row.position === me.position - 1) : null;
  const gap = ahead && me ? ahead.totalPatrimony - me.totalPatrimony : 0;
  const filtered = useMemo(
    () => rows.filter((row) => row.userName.toLowerCase().includes(query.trim().toLowerCase())),
    [rows, query]
  );
  const podium = rows.slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="RANKING"
        title="Ranking de jogadores"
        description="Classificação pelo patrimônio total. Quanto melhor suas decisões, mais alto você chega."
        actions={<ExportMenu kind="ranking" label="Exportar ranking" />}
      />

      {error ? <ApiErrorAlert error={error} onClose={() => setError(null)} /> : null}

      {me ? (
        <Card className="border-ink bg-ink p-5 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-[#9fb5a8]">
                <Trophy className="h-4 w-4 text-orange" aria-hidden="true" />
                SUA POSIÇÃO
              </div>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <span className="text-3xl font-bold">{me.position}º lugar</span>
                <span className="money pb-1 text-sm text-[#c7d7cc]">{formatMoney(me.totalPatrimony)}</span>
              </div>
              <p className="mt-1 text-xs text-[#9fb5a8]">
                {ahead
                  ? `Faltam ${formatMoney(Math.max(0, gap))} para alcançar ${ahead.userName}.`
                  : "Você está no topo do ranking. Continue evoluindo."}
              </p>
            </div>
            <Badge tone={me.position <= 10 ? "orange" : "neutral"}>
              {me.position <= 10 ? "Top 10" : "Fora do top 10"}
            </Badge>
          </div>
        </Card>
      ) : null}

      {loading ? (
        <Card className="p-8" role="status" aria-label="Carregando ranking">
          <div className="flex flex-col gap-3">
            <div className="h-8 w-48 animate-pulse rounded bg-soft" />
            <div className="h-16 animate-pulse rounded bg-soft" />
            <div className="h-16 animate-pulse rounded bg-soft" />
          </div>
        </Card>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="Ranking vazio"
          description="Assim que os jogadores fizerem operações, a classificação aparece aqui."
        />
      ) : (
        <>
          {podium.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {podium.map((row, index) => (
                <PodiumCard key={row.userId} row={row} place={(index + 1) as 1 | 2 | 3} />
              ))}
            </div>
          ) : null}

          <Card className="p-4">
            <label className="relative block max-w-md">
              <span className="sr-only">Buscar jogador</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar jogador"
                className="w-full rounded-xl border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted"
              />
            </label>
          </Card>

          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Classificação dos jogadores por patrimônio total</caption>
                <thead className="border-b border-line bg-bg/60 text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th scope="col" className="p-4 text-left font-bold">Posição</th>
                    <th scope="col" className="p-4 text-left font-bold">Jogador</th>
                    <th scope="col" className="p-4 text-right font-bold">Patrimônio total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.userId} className={`border-t border-line ${row.userId === user?.id ? "bg-soft" : "hover:bg-bg/60"}`}>
                      <td className="p-4 font-bold text-ink">{String(row.position).padStart(2, "0")}</td>
                      <td className="p-4">
                        <span className="font-semibold text-ink">{row.userName}</span>
                        {row.userId === user?.id ? <Badge tone="green" className="ml-2">Você</Badge> : null}
                      </td>
                      <td className="money p-4 text-right font-bold text-ink">{formatMoney(row.totalPatrimony)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex flex-col gap-2 md:hidden">
            {filtered.map((row) => (
              <Card key={row.userId} className={`flex items-center gap-3 p-4 ${row.userId === user?.id ? "border-green/40 bg-soft" : ""}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-ink">
                  {row.position}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{row.userName}</p>
                  <p className="text-[11px] text-muted">{row.userId === user?.id ? "Você" : "Jogador"}</p>
                </div>
                <span className="money text-sm font-bold text-ink">{formatMoney(row.totalPatrimony)}</span>
              </Card>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="Nenhum jogador encontrado"
              description="Tente outro nome para encontrar quem você procura."
            />
          ) : null}
        </>
      )}
    </>
  );
}
