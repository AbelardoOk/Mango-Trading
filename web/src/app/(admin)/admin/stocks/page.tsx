"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { adminListStocks, adminDeleteStock, adminUpdateStock } from "@/services/api/admin";
import { StockResponse } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { ApiErrorAlert } from "@/components/ApiError";

export default function AdminStocksPage() {
  const [stocks, setStocks] = useState<StockResponse[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [confirm, setConfirm] = useState<StockResponse | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Ativa" | "Desativada">("Todos");
  const [toast, setToast] = useState<string | null>(null);

  const load = () => adminListStocks().then(setStocks).catch(setError);
  useEffect(() => { load(); }, []);

  async function del() {
    if (!confirm) return;
    try {
      await adminDeleteStock(confirm.id);
      setConfirm(null);
      setToast(`${confirm.symbol} excluída`);
      setTimeout(() => setToast(null), 3000);
      load();
    } catch (e) { setError(e); setConfirm(null); }
  }

  async function toggleActive(s: StockResponse) {
    try {
      await adminUpdateStock(s.id, {
        name: s.name,
        symbol: s.symbol,
        description: s.description,
        sector: s.sector,
        currentPrice: s.currentPrice,
        volatility: s.volatility,
        active: !s.active,
      });
      setToast(`${s.symbol} ${!s.active ? "ativada" : "desativada"}`);
      setTimeout(() => setToast(null), 2500);
      load();
    } catch (e) { setError(e); }
  }

  const activeCount = stocks.filter((s) => s.active).length;
  const inactiveCount = stocks.length - activeCount;
  const filtered = useMemo(() => {
    return stocks.filter((s) => {
      const matchQ = (s.name + " " + s.symbol + " " + (s.sector || "")).toLowerCase().includes(q.toLowerCase());
      const matchStatus = statusFilter === "Todos" || (statusFilter === "Ativa" ? s.active : !s.active);
      return matchQ && matchStatus;
    });
  }, [stocks, q, statusFilter]);

  return (
    <AuthGuard requireAdmin>
      <Shell>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Ações e empresas</h1>
              <p className="text-sm text-[#4a5a52]">Gerencie o catálogo de ações fictícias.</p>
            </div>
            <Link href="/admin/stocks/new" className="bg-[#174f3d] text-white px-4 py-2 rounded-lg self-start">+ Cadastrar ação</Link>
          </div>
          {toast && <div role="status" className="bg-[#e8f1eb] text-[#174f3d] px-4 py-2 rounded-lg text-sm">{toast}</div>}
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white rounded-xl border p-4">
            <div className="flex gap-2">
              <span className="bg-[#e8f1eb] text-[#174f3d] px-3 py-1 rounded-full text-xs">{activeCount} ativas</span>
              <span className="bg-[#fff0d6] text-[#754600] px-3 py-1 rounded-full text-xs">{inactiveCount} desativadas</span>
              <span className="text-xs text-[#4a5a52] self-center">{filtered.length} exibidas</span>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input placeholder="Buscar empresa ou símbolo" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar empresa ou símbolo" className="flex-1 border border-[#6d7f75] rounded-lg p-2 text-sm" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as never)} aria-label="Filtrar por status" className="border border-[#6d7f75] rounded-lg p-2 text-sm">
                <option>Todos</option>
                <option>Ativa</option>
                <option>Desativada</option>
              </select>
            </div>
          </div>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[#4a5a52]"><tr><th className="p-4 text-left">EMPRESA / SÍMBOLO</th><th className="p-4">PREÇO</th><th className="p-4">STATUS</th><th className="p-4 text-left">AÇÕES</th></tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-4"><div className="font-semibold">{s.name}</div><div className="text-xs text-[#4a5a52]">{s.symbol} · {s.sector}</div></td>
                    <td className="p-4">{formatMoney(s.currentPrice)}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${s.active ? "bg-[#e8f1eb] text-[#174f3d]" : "bg-[#fff0d6] text-[#754600]"}`}>{s.active ? "Ativa" : "Desativada"}</span></td>
                    <td className="p-4 flex gap-2 flex-wrap">
                      <Link href={`/admin/stocks/${s.id}/edit`} className="bg-[#e8f1eb] text-[#174f3d] px-3 py-1 rounded text-xs">Editar</Link>
                      <button onClick={() => toggleActive(s)} className="bg-white border border-[#6d7f75] px-3 py-1 rounded text-xs">{s.active ? "Desativar" : "Ativar"}</button>
                      <button onClick={() => setConfirm(s)} className="text-[#ad342c] text-xs underline px-2">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="p-8 text-center text-sm text-[#4a5a52]">Nenhuma empresa encontrada.</p>}
          </div>
          <p className="text-xs text-[#4a5a52]">Ações desativadas ficam indisponíveis para novas negociações. Exclusão com vínculos deve ser substituída por desativação (RB09).</p>
        </div>
        {confirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full flex flex-col gap-4">
              <h3 className="font-bold">Excluir {confirm.name}?</h3>
              <p className="text-sm text-[#4a5a52]">Ação {confirm.symbol} será removida. Ações com vínculos devem ser desativadas para preservar histórico.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirm(null)} className="flex-1 bg-[#e8f1eb] py-2 rounded-lg">Cancelar</button>
                <button onClick={del} className="flex-1 bg-[#ad342c] text-white py-2 rounded-lg">Confirmar exclusão</button>
              </div>
            </div>
          </div>
        )}
      </Shell>
    </AuthGuard>
  );
}
