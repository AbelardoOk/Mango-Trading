"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { adminCreateStock } from "@/services/api/admin";
import { ApiErrorAlert } from "@/components/ApiError";
import { ApiError } from "@/types/api";

export default function AdminStockNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", symbol: "", sector: "", currentPrice: 42.5, volatility: 0.02, active: true, description: "" });
  const [error, setError] = useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    if (!form.symbol.trim()) e.symbol = "Símbolo é obrigatório";
    else if (!/^[A-Z0-9]{3,10}$/.test(form.symbol.toUpperCase())) e.symbol = "Símbolo deve ter 3-10 letras/números maiúsculos";
    if (!form.sector.trim()) e.sector = "Setor é obrigatório";
    if (form.currentPrice <= 0 || Number.isNaN(form.currentPrice)) e.currentPrice = "Preço deve ser > 0";
    if (form.volatility < 0 || Number.isNaN(form.volatility)) e.volatility = "Volatilidade ≥ 0";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setError(null);
    try {
      await adminCreateStock({ ...form, symbol: form.symbol.toUpperCase().trim(), name: form.name.trim(), sector: form.sector.trim() });
      router.push("/admin/stocks");
    } catch (err) {
      if (err instanceof ApiError && err.errors) setFieldErrors(err.errors);
      setError(err);
    }
  }

  return (
    <AuthGuard requireAdmin>
      <Shell>
        <div className="max-w-2xl flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Cadastrar ação</h1>
          <p className="text-sm text-[#4a5a52]">Ações e empresas / Novo cadastro</p>
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <form onSubmit={submit} className="bg-white rounded-xl border p-6 flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1 text-sm font-semibold">Nome da empresa *
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required aria-describedby={fieldErrors.name ? "name-error" : undefined} aria-invalid={!!fieldErrors.name} className={`border rounded-lg p-3 w-full ${fieldErrors.name ? "border-[#ad342c]" : "border-[#6d7f75]"}`} />
              {fieldErrors.name && <span id="name-error" className="text-xs text-[#ad342c]" role="alert">{fieldErrors.name}</span>}
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Símbolo *
              <input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })} required pattern="^[A-Z0-9]{3,10}$" aria-describedby={fieldErrors.symbol ? "symbol-error symbol-help" : "symbol-help"} aria-invalid={!!fieldErrors.symbol} className={`border rounded-lg p-3 w-full ${fieldErrors.symbol ? "border-[#ad342c]" : "border-[#6d7f75]"}`} placeholder="MANG3" />
              <span id="symbol-help" className="text-xs text-[#4a5a52]">3-10 letras/números maiúsculos, único.</span>
              {fieldErrors.symbol && <span id="symbol-error" className="text-xs text-[#ad342c]" role="alert">{fieldErrors.symbol}</span>}
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Setor *
              <input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} required aria-invalid={!!fieldErrors.sector} className={`border rounded-lg p-3 w-full ${fieldErrors.sector ? "border-[#ad342c]" : "border-[#6d7f75]"}`} placeholder="Tecnologia" />
              {fieldErrors.sector && <span className="text-xs text-[#ad342c]" role="alert">{fieldErrors.sector}</span>}
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm font-semibold">Preço atual (M$) *
                <input type="number" step="0.01" value={form.currentPrice} onChange={(e) => setForm({ ...form, currentPrice: Number(e.target.value) })} required aria-invalid={!!fieldErrors.currentPrice} className={`border rounded-lg p-3 w-full ${fieldErrors.currentPrice ? "border-[#ad342c]" : "border-[#6d7f75]"}`} />
                {fieldErrors.currentPrice && <span className="text-xs text-[#ad342c]" role="alert">{fieldErrors.currentPrice}</span>}
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">Volatilidade (%)
                <input type="number" step="0.01" value={form.volatility} onChange={(e) => setForm({ ...form, volatility: Number(e.target.value) })} aria-describedby="vol-help" className="border border-[#6d7f75] rounded-lg p-3 w-full" />
                <span id="vol-help" className="text-xs text-[#4a5a52]">Parâmetro de oscilação simulada.</span>
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-semibold">Situação
              <select value={form.active ? "true" : "false"} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })} className="border border-[#6d7f75] rounded-lg p-3 w-full">
                <option value="true">Ativa</option>
                <option value="false">Desativada</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Descrição
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-[#6d7f75] rounded-lg p-3 w-full" rows={3} />
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.push("/admin/stocks")} className="flex-1 bg-[#e8f1eb] py-3 rounded-lg">Cancelar</button>
              <button type="submit" className="flex-1 bg-[#174f3d] text-white py-3 rounded-lg">Cadastrar ação</button>
            </div>
          </form>
        </div>
      </Shell>
    </AuthGuard>
  );
}
