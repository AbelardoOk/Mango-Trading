"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { adminGetStock, adminUpdateStock } from "@/services/api/admin";
import { ApiErrorAlert } from "@/components/ApiError";

export default function AdminStockEditPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const [form, setForm] = useState({ name: "", symbol: "", sector: "", currentPrice: 0, volatility: 0, active: true, description: "" });
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    adminGetStock(id).then((s) => setForm({ name: s.name, symbol: s.symbol, sector: s.sector, currentPrice: s.currentPrice, volatility: s.volatility, active: s.active, description: s.description })).catch(setError);
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await adminUpdateStock(id, { ...form, symbol: form.symbol.toUpperCase() });
      router.push("/admin/stocks");
    } catch (err) { setError(err); }
  }

  return (
    <AuthGuard requireAdmin>
      <Shell>
        <div className="max-w-2xl flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Editar ação</h1>
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <form onSubmit={submit} className="bg-white rounded-xl border p-6 flex flex-col gap-4">
            <label>Nome<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="border rounded-lg p-3 w-full" /></label>
            <label>Símbolo<input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} required className="border rounded-lg p-3 w-full" /></label>
            <label>Setor<input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="border rounded-lg p-3 w-full" /></label>
            <label>Preço<input type="number" step="0.01" value={form.currentPrice} onChange={(e) => setForm({ ...form, currentPrice: Number(e.target.value) })} required className="border rounded-lg p-3 w-full" /></label>
            <label>Volatilidade<input type="number" step="0.01" value={form.volatility} onChange={(e) => setForm({ ...form, volatility: Number(e.target.value) })} className="border rounded-lg p-3 w-full" /></label>
            <label>Status<select value={form.active ? "true" : "false"} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })} className="border rounded-lg p-3 w-full"><option value="true">Ativa</option><option value="false">Desativada</option></select></label>
            <label>Descrição<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border rounded-lg p-3 w-full" /></label>
            <button type="submit" className="bg-[#174f3d] text-white py-3 rounded-lg">Salvar alterações</button>
          </form>
        </div>
      </Shell>
    </AuthGuard>
  );
}
