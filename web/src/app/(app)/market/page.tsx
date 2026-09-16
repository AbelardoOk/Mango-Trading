"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { listStocks } from "@/services/api/stocks";
import { listEvents } from "@/services/api/events";
import { MarketEventResponse, StockResponse } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { ApiErrorAlert } from "@/components/ApiError";

export default function MarketPage() {
  const [stocks, setStocks] = useState<StockResponse[]>([]);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("Todos os setores");
  const [error, setError] = useState<unknown>(null);
  const [events, setEvents] = useState<MarketEventResponse[]>([]);

  useEffect(() => {
    listStocks().then(setStocks).catch(setError);
    listEvents().then(setEvents).catch(() => {});
    const id = setInterval(() => listEvents().then(setEvents).catch(() => {}), 30000);
    return () => clearInterval(id);
  }, []);

  const sectors = useMemo(() => ["Todos os setores", ...Array.from(new Set(stocks.map((s) => s.sector).filter(Boolean)))], [stocks]);
  const filtered = stocks.filter((s) => {
    const matchQ = (s.name + " " + s.symbol).toLowerCase().includes(q.toLowerCase());
    const matchSector = sector === "Todos os setores" || s.sector === sector;
    return matchQ && matchSector;
  });

  const upcoming = events.filter((e) => e.status === "UPCOMING");
  const active = events.filter((e) => e.status === "ACTIVE");
  function formatNext(iso?: string) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <AuthGuard>
      <Shell>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">Mercado de ações</h1>
            <p className="text-sm text-[#4a5a52]">Explore empresas fictícias e encontre seu próximo movimento.</p>
          </div>
          {upcoming.length > 0 && (
            <div className="bg-[#fff0d6] border border-[#f5ac45] rounded-xl p-4 flex flex-col gap-1">
              <span className="text-xs font-bold tracking-widest text-[#754600]">EVENTO IMINENTE • visível 3 min antes</span>
              {upcoming.map((e) => (
                <div key={e.id} className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{e.title} ({e.impact} {e.direction} {e.scope === "SECTOR" ? `• ${e.sector}` : "• Geral"})</span>
                  <span className="text-xs bg-white px-2 py-1 rounded-full">
                    {e.secondsToStart != null ? `${Math.floor(e.secondsToStart / 60)}m ${e.secondsToStart % 60}s` : formatNext(e.nextRunAt)} para iniciar
                  </span>
                </div>
              ))}
            </div>
          )}
          {active.length > 0 && (
            <div className="bg-[#e8f1eb] border border-[#174f3d] rounded-xl p-4 flex flex-col gap-1">
              <span className="text-xs font-bold tracking-widest text-[#174f3d]">EVENTO ATIVO</span>
              {active.map((e) => (
                <div key={e.id} className="text-sm">
                  <strong>{e.title}</strong> — impacto {e.impact} {e.priceDeltaPercent ? `(${e.priceDeltaPercent}%)` : ""} {e.scope === "SECTOR" ? `em ${e.sector}` : "geral"} • até {e.endDate ? new Date(e.endDate).toLocaleTimeString("pt-BR") : "—"}
                </div>
              ))}
            </div>
          )}
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <div className="flex flex-col md:flex-row gap-4">
            <input placeholder="Buscar empresa ou símbolo" value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 border border-[#6d7f75] rounded-lg p-3" />
            <select value={sector} onChange={(e) => setSector(e.target.value)} className="border border-[#6d7f75] rounded-lg p-3 md:w-64">
              {sectors.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="hidden md:block bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[#4a5a52]">
                <tr>
                  <th className="text-left p-4">EMPRESA / SÍMBOLO</th>
                  <th className="text-left p-4">PREÇO ATUAL</th>
                  <th className="text-left p-4">VARIAÇÃO</th>
                  <th className="p-4">AÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-9 h-9 bg-[#e8f1eb] rounded-lg flex items-center justify-center text-xs font-bold text-[#174f3d]">{s.symbol.slice(0, 2)}</div>
                        <div>
                          <div className="font-semibold">{s.name}</div>
                          <div className="text-xs text-[#4a5a52]">{s.symbol} · {s.sector}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{formatMoney(s.currentPrice)}</td>
                    <td className="p-4">{s.volatility ? `${(s.volatility * 100).toFixed(2).replace(".", ",")}%` : "—"}</td>
                    <td className="p-4">
                      <Link href={`/market/${s.id}`} className="bg-[#e8f1eb] text-[#174f3d] px-4 py-2 rounded-lg text-xs">Negociar →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="p-8 text-center text-sm text-[#4a5a52]">Nenhuma empresa encontrada.</p>}
          </div>
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border p-4 flex flex-col gap-3">
                <div className="flex gap-3 items-center">
                  <div className="w-9 h-9 bg-[#e8f1eb] rounded-lg flex items-center justify-center text-xs font-bold text-[#174f3d]">{s.symbol.slice(0, 2)}</div>
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-[#4a5a52]">{s.symbol} · {s.sector}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">{formatMoney(s.currentPrice)}</span>
                  <span className="text-sm text-[#4a5a52]">{s.volatility ? `${(s.volatility * 100).toFixed(2)}%` : ""}</span>
                </div>
                <Link href={`/market/${s.id}`} className="bg-[#e8f1eb] text-[#174f3d] py-3 rounded-lg text-center">Negociar →</Link>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#4a5a52]">Todas empresas e cotações são fictícias. Operações usam saldo virtual.</p>
        </div>
      </Shell>
    </AuthGuard>
  );
}
