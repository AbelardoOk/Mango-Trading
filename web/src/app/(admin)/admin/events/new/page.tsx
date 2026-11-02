"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreateEvent } from "@/services/api/admin";
import { ApiErrorAlert } from "@/components/ApiError";

export default function AdminEventNewPage() {
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await adminCreateEvent({
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
    <>
        <div className="max-w-2xl flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Novo evento</h1>
          <p className="text-sm text-[#4a5a52]">Programação estratégica: diário (todo dia às HH:mm) ou aleatório (30m/2h) • Visível 3min antes</p>
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <form onSubmit={submit} className="bg-white rounded-xl border p-6 flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1 text-sm font-semibold">Título *
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="border border-[#6d7f75] rounded-lg p-3 w-full" placeholder="Quebra geral da bolsa" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Descrição
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-[#6d7f75] rounded-lg p-3 w-full" rows={3} placeholder="Alta nos juros afeta mercado" />
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-1 text-sm font-semibold">Impacto *
                <select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value as never })} className="border border-[#6d7f75] rounded-lg p-3 w-full">
                  <option value="LOW">LOW (1%)</option><option value="MEDIUM">MEDIUM (2.5%)</option><option value="HIGH">HIGH (5%)</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">Delta custom % (opcional)
                <input type="number" step="0.1" value={form.priceDeltaPercent} onChange={(e) => setForm({ ...form, priceDeltaPercent: e.target.value })} placeholder="ex: 3.5" className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                <span className="text-xs text-[#4a5a52]">Se vazio usa impacto</span>
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">Direção *
                <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value as never })} className="border border-[#6d7f75] rounded-lg p-3 w-full">
                  <option value="RANDOM">Neutro (aleatório ±)</option><option value="POSITIVE">Positivo (+)</option><option value="NEGATIVE">Negativo (-)</option>
                </select>
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm font-semibold">Escopo *
                <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as never })} className="border border-[#6d7f75] rounded-lg p-3 w-full">
                  <option value="ALL">Todas (quebra geral)</option><option value="SECTOR">Por setor</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">Setor {form.scope === "SECTOR" && "*"}
                <input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} disabled={form.scope !== "SECTOR"} required={form.scope === "SECTOR"} placeholder="Tecnologia" className="border border-[#6d7f75] rounded-lg p-3 w-full disabled:bg-gray-100" />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-semibold">Recorrência *
              <select value={form.recurrenceType} onChange={(e) => setForm({ ...form, recurrenceType: e.target.value as never })} className="border border-[#6d7f75] rounded-lg p-3 w-full">
                <option value="NONE">Nenhuma (único, usar Início/Fim)</option><option value="DAILY">Diária (todo dia)</option><option value="RANDOM">Aleatória (min..max)</option>
              </select>
            </label>
            {form.recurrenceType === "DAILY" && (
              <div className="grid md:grid-cols-2 gap-4 bg-[#f5f7f3] p-4 rounded-lg">
                <label className="flex flex-col gap-1 text-sm font-semibold">Horário diário *
                  <input type="time" value={form.dailyTime} onChange={(e) => setForm({ ...form, dailyTime: e.target.value })} required className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                  <span className="text-xs text-[#4a5a52]">Todo dia às HH:mm (futuro: seleção de dias)</span>
                </label>
                <label className="flex flex-col gap-1 text-sm font-semibold">Duração (min)
                  <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                </label>
              </div>
            )}
            {form.recurrenceType === "RANDOM" && (
              <div className="grid md:grid-cols-3 gap-4 bg-[#f5f7f3] p-4 rounded-lg">
                <label className="flex flex-col gap-1 text-sm font-semibold">Mín (ex 30m) *
                  <input value={form.randomMin} onChange={(e) => setForm({ ...form, randomMin: e.target.value })} required placeholder="30m" className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-semibold">Máx (ex 2h) *
                  <input value={form.randomMax} onChange={(e) => setForm({ ...form, randomMax: e.target.value })} required placeholder="2h" className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-semibold">Duração (min)
                  <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                </label>
                <p className="md:col-span-3 text-xs text-[#4a5a52]">Sorteio uniforme entre min e max. Use formatos 30m, 2h, 90m.</p>
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
                <span className="text-xs text-[#4a5a52]">3 min antes visível ao jogador</span>
              </label>
            </div>
            <button type="submit" className="bg-[#174f3d] text-white py-3 rounded-lg font-semibold">Salvar evento</button>
          </form>
        </div>
    </>
  );
}
