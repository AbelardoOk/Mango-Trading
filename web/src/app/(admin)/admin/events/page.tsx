"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { adminListEvents, adminDeleteEvent, adminTriggerEvent } from "@/services/api/admin";
import { MarketEventResponse } from "@/types/api";
import { ApiErrorAlert } from "@/components/ApiError";

function formatNextRun(e: MarketEventResponse) {
  if (!e.nextRunAt) return "—";
  const d = new Date(e.nextRunAt);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function recurrenceBadge(e: MarketEventResponse) {
  if (e.recurrenceType === "DAILY") return `Diário ${e.dailyTime || "09:00"}${e.daysOfWeek && !e.daysOfWeek.includes("MONDAY") ? ` (${e.daysOfWeek})` : ""}`;
  if (e.recurrenceType === "RANDOM") {
    const min = e.randomMinMinutes ?? 30;
    const max = e.randomMaxMinutes ?? 120;
    const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h` : `${m}m`);
    return `Aleatório ${fmt(min)}–${fmt(max)}`;
  }
  return "Único";
}

function statusPill(e: MarketEventResponse) {
  const s = e.status;
  if (s === "ACTIVE") return { label: "Em andamento", cls: "bg-[#e8f1eb] text-[#174f3d]" };
  if (s === "UPCOMING") return { label: `Em breve ${e.secondsToStart != null ? `(${Math.floor(e.secondsToStart / 60)}m ${e.secondsToStart % 60}s)` : ""}`, cls: "bg-[#fff0d6] text-[#754600] animate-pulse" };
  if (s === "SCHEDULED") return { label: "Programado", cls: "bg-[#fff0d6] text-[#754600]" };
  return { label: "Encerrado", cls: "bg-gray-100 text-[#4a5a52]" };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<MarketEventResponse[]>([]);
  const [error, setError] = useState<unknown>(null);

  const load = () => adminListEvents().then(setEvents).catch(setError);
  useEffect(() => { load(); }, []);

  return (
    <AuthGuard requireAdmin>
      <Shell>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Eventos de mercado</h1>
              <p className="text-sm text-[#4a5a52]">Planeje acontecimentos fictícios — diário ou aleatório (30m/2h) — com impacto no preço.</p>
            </div>
            <Link href="/admin/events/new" className="bg-[#174f3d] text-white px-4 py-2 rounded-lg">+ Novo evento</Link>
          </div>
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <div className="flex flex-col gap-3">
            {events.map((e) => {
              const st = statusPill(e);
              return (
                <div key={e.id} className="bg-white rounded-xl border p-6 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${st.cls}`}>{st.label}</span>
                    <span className="text-xs text-[#4a5a52]">Próxima: {formatNextRun(e)} {e.enabled === false && "(desativado)"}</span>
                  </div>
                  <h3 className="font-bold">{e.title}</h3>
                  <p className="text-sm text-[#4a5a52]">{e.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-[#f5f7f3] px-2 py-1 rounded">Impacto: {e.impact} {e.priceDeltaPercent ? `(${e.priceDeltaPercent}%)` : ""}</span>
                    <span className="bg-[#f5f7f3] px-2 py-1 rounded">Direção: {e.direction}</span>
                    <span className="bg-[#f5f7f3] px-2 py-1 rounded">Escopo: {e.scope}{e.sector ? ` (${e.sector})` : ""}</span>
                    <span className="bg-[#f5f7f3] px-2 py-1 rounded">{recurrenceBadge(e)}</span>
                    <span className="bg-[#f5f7f3] px-2 py-1 rounded">Duração: {e.durationMinutes ?? 60}m</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/admin/events/${e.id}/edit`} className="bg-[#e8f1eb] text-[#174f3d] px-3 py-1 rounded text-xs">Editar evento</Link>
                    <button onClick={() => adminTriggerEvent(e.id).then(load).catch(setError)} className="bg-[#172e27] text-white px-3 py-1 rounded text-xs">Disparar agora</button>
                    <button onClick={() => adminDeleteEvent(e.id).then(() => setEvents(events.filter((x) => x.id !== e.id))).catch(setError)} className="text-[#ad342c] text-xs underline">Excluir</button>
                  </div>
                </div>
              );
            })}
            {events.length === 0 && <p className="text-sm text-[#4a5a52]">Nenhum evento. Crie o primeiro — ex: quebra geral diária às 09:00 ou aleatório 30m–2h por setor.</p>}
          </div>
        </div>
      </Shell>
    </AuthGuard>
  );
}
