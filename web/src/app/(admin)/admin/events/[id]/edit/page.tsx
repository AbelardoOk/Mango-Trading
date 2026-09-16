"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { apiFetch } from "@/services/api/client";
import { adminUpdateEvent } from "@/services/api/admin";
import { MarketEventResponse } from "@/types/api";
import { ApiErrorAlert } from "@/components/ApiError";

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function minutesToText(m?: number) {
  if (m == null) return "";
  if (m % 60 === 0) return `${m / 60}h`;
  return `${m}m`;
}

export default function AdminEventEditPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    impact: "LOW" as "LOW" | "MEDIUM" | "HIGH",
    priceDeltaPercent: "",
    direction: "RANDOM" as "POSITIVE" | "NEGATIVE" | "RANDOM",
    scope: "ALL" as "ALL" | "SECTOR",
    sector: "",
    recurrenceType: "NONE" as "NONE" | "DAILY" | "RANDOM",
    dailyTime: "09:00",
    randomMin: "30m",
    randomMax: "2h",
    durationMinutes: 60,
    enabled: true,
    visibilityMinutes: 3,
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    apiFetch<MarketEventResponse>(`/api/admin/events/${id}`).then((e) => {
      setForm({
        title: e.title,
        description: e.description || "",
        impact: e.impact,
        priceDeltaPercent: e.priceDeltaPercent != null ? String(e.priceDeltaPercent) : "",
        direction: (e.direction as never) || "RANDOM",
        scope: (e.scope as never) || "ALL",
        sector: e.sector || "",
        recurrenceType: (e.recurrenceType as never) || "NONE",
        dailyTime: e.dailyTime || "09:00",
        randomMin: e.randomMinMinutes != null ? minutesToText(e.randomMinMinutes) : "30m",
        randomMax: e.randomMaxMinutes != null ? minutesToText(e.randomMaxMinutes) : "2h",
        durationMinutes: e.durationMinutes ?? 60,
        enabled: e.enabled ?? true,
        visibilityMinutes: e.visibilityMinutes ?? 3,
        startDate: toLocalInput(e.startDate),
        endDate: toLocalInput(e.endDate),
      });
    }).catch(setError);
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await adminUpdateEvent(id, {
        title: form.title,
        description: form.description,
        impact: form.impact,
        priceDeltaPercent: form.priceDeltaPercent ? Number(form.priceDeltaPercent) : undefined,
        direction: form.direction,
        scope: form.scope,
        sector: form.scope === "SECTOR" ? form.sector : undefined,
        recurrenceType: form.recurrenceType,
        dailyTime: form.recurrenceType === "DAILY" ? form.dailyTime : undefined,
        randomMin: form.recurrenceType === "RANDOM" ? form.randomMin : undefined,
        randomMax: form.recurrenceType === "RANDOM" ? form.randomMax : undefined,
        durationMinutes: form.durationMinutes,
        enabled: form.enabled,
        visibilityMinutes: form.visibilityMinutes,
        startDate: form.recurrenceType === "NONE" && form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.recurrenceType === "NONE" && form.endDate ? new Date(form.endDate).toISOString() : undefined,
      });
      router.push("/admin/events");
    } catch (err) { setError(err); }
  }

  return (
    <AuthGuard requireAdmin>
      <Shell>
        <div className="max-w-2xl flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Editar evento</h1>
          <p className="text-sm text-[#4a5a52]">Eventos de mercado / Edição • Recorrência diária ou aleatória 30m/2h</p>
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <form onSubmit={submit} className="bg-white rounded-xl border p-6 flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1 text-sm font-semibold">Título *
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="border border-[#6d7f75] rounded-lg p-3 w-full" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Descrição
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-[#6d7f75] rounded-lg p-3 w-full" rows={3} />
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-1 text-sm font-semibold">Impacto *
                <select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value as never })} className="border border-[#6d7f75] rounded-lg p-3 w-full">
                  <option value="LOW">LOW (1%)</option><option value="MEDIUM">MEDIUM (2.5%)</option><option value="HIGH">HIGH (5%)</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">Delta custom %
                <input type="number" step="0.1" value={form.priceDeltaPercent} onChange={(e) => setForm({ ...form, priceDeltaPercent: e.target.value })} placeholder="3.5" className="border border-[#6d7f75] rounded-lg p-3 w-full" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">Direção *
                <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value as never })} className="border border-[#6d7f75] rounded-lg p-3 w-full">
                  <option value="RANDOM">Neutro (±)</option><option value="POSITIVE">Positivo (+)</option><option value="NEGATIVE">Negativo (-)</option>
                </select>
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm font-semibold">Escopo *
                <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as never })} className="border border-[#6d7f75] rounded-lg p-3 w-full">
                  <option value="ALL">Todas (geral)</option><option value="SECTOR">Por setor</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">Setor
                <input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} disabled={form.scope !== "SECTOR"} placeholder="Tecnologia" className="border border-[#6d7f75] rounded-lg p-3 w-full disabled:bg-gray-100" />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-semibold">Recorrência *
              <select value={form.recurrenceType} onChange={(e) => setForm({ ...form, recurrenceType: e.target.value as never })} className="border border-[#6d7f75] rounded-lg p-3 w-full">
                <option value="NONE">Nenhuma (único)</option><option value="DAILY">Diária (todo dia)</option><option value="RANDOM">Aleatória (min..max)</option>
              </select>
            </label>
            {form.recurrenceType === "DAILY" && (
              <div className="grid md:grid-cols-2 gap-4 bg-[#f5f7f3] p-4 rounded-lg">
                <label className="flex flex-col gap-1 text-sm font-semibold">Horário *
                  <input type="time" value={form.dailyTime} onChange={(e) => setForm({ ...form, dailyTime: e.target.value })} required className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-semibold">Duração (min)
                  <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                </label>
              </div>
            )}
            {form.recurrenceType === "RANDOM" && (
              <div className="grid md:grid-cols-3 gap-4 bg-[#f5f7f3] p-4 rounded-lg">
                <label className="flex flex-col gap-1 text-sm font-semibold">Mín *
                  <input value={form.randomMin} onChange={(e) => setForm({ ...form, randomMin: e.target.value })} required placeholder="30m" className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-semibold">Máx *
                  <input value={form.randomMax} onChange={(e) => setForm({ ...form, randomMax: e.target.value })} required placeholder="2h" className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-semibold">Duração (min)
                  <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                </label>
              </div>
            )}
            {form.recurrenceType === "NONE" && (
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm font-semibold">Início
                  <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-semibold">Fim
                  <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                </label>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> Ativo</label>
              <label className="flex flex-col gap-1 text-sm font-semibold">Visibilidade prévia (min)
                <input type="number" value={form.visibilityMinutes} onChange={(e) => setForm({ ...form, visibilityMinutes: Number(e.target.value) })} className="border border-[#6d7f75] rounded-lg p-3 w-full" />
              </label>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.push("/admin/events")} className="flex-1 bg-[#e8f1eb] py-3 rounded-lg">Cancelar</button>
              <button type="submit" className="flex-1 bg-[#174f3d] text-white py-3 rounded-lg">Salvar alterações</button>
            </div>
          </form>
        </div>
      </Shell>
    </AuthGuard>
  );
}
