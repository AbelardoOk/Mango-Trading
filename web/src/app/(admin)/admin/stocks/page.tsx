"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { adminListStocks, adminDeleteStock } from "@/services/api/admin";
import { StockResponse } from "@/types/api";
import { formatMoney } from "@/lib/money";
import { ApiErrorAlert } from "@/components/ApiError";

export default function AdminStocksPage() {
  const [stocks, setStocks] = useState<StockResponse[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [confirm, setConfirm] = useState<StockResponse | null>(null);

  const load = () => adminListStocks().then(setStocks).catch(setError);
  useEffect(() => { load(); }, []);

  async function del() {
    if (!confirm) return;
    try {
      await adminDeleteStock(confirm.id);
      setConfirm(null);
      load();
    } catch (e) { setError(e); setConfirm(null); }
  }

  return (
    <AuthGuard requireAdmin>
      <Shell>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Ações e empresas</h1>
              <p className="text-sm text-[#596b63]">Gerencie o catálogo de ações fictícias.</p>
            </div>
            <Link href="/admin/stocks/new" className="bg-[#174f3d] text-white px-4 py-2 rounded-lg">+ Cadastrar ação</Link>
          </div>
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[#596b63]"><tr><th className="p-4 text-left">EMPRESA / SÍMBOLO</th><th className="p-4">PREÇO</th><th className="p-4">STATUS</th><th className="p-4">AÇÕES</th></tr></thead>
              <tbody>
                {stocks.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-4"><div className="font-semibold">{s.name}</div><div className="text-xs text-[#596b63]">{s.symbol} · {s.sector}</div></td>
                    <td className="p-4">{formatMoney(s.currentPrice)}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${s.active ? "bg-[#e8f1eb] text-[#174f3d]" : "bg-[#fff0d6] text-[#754600]"}`}>{s.active ? "Ativa" : "Desativada"}</span></td>
                    <td className="p-4 flex gap-2">
                      <Link href={`/admin/stocks/${s.id}/edit`} className="bg-[#e8f1eb] text-[#174f3d] px-3 py-1 rounded text-xs">Editar</Link>
                      <button onClick={() => setConfirm(s)} className="text-[#ad342c] text-xs underline">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#596b63]">Ações desativadas ficam indisponíveis para novas negociações.</p>
        </div>
        {confirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full flex flex-col gap-4">
              <h3 className="font-bold">Excluir {confirm.name}?</h3>
              <p className="text-sm text-[#596b63]">Ação {confirm.symbol} será removida. Ações com vínculos devem ser desativadas para preservar histórico.</p>
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
