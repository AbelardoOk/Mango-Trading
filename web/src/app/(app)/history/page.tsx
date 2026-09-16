"use client";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { history } from "@/services/api/trades";
import { TransactionResponse } from "@/types/api";
import { formatMoney } from "@/lib/money";

export default function HistoryPage() {
  const [rows, setRows] = useState<TransactionResponse[]>([]);
  const [filter, setFilter] = useState<"Todas" | "BUY" | "SELL">("Todas");

  useEffect(() => {
    history().then(setRows).catch(() => {});
  }, []);

  const filtered = rows.filter((r) => filter === "Todas" || r.type === filter);

  return (
    <AuthGuard>
      <Shell>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">Histórico de transações</h1>
            <p className="text-sm text-[#596b63]">Consulte suas compras e vendas.</p>
          </div>
          <div className="flex gap-4 items-end">
            <label className="flex flex-col gap-1 text-sm">
              Tipo
              <select value={filter} onChange={(e) => setFilter(e.target.value as never)} className="border border-[#9bada1] rounded-lg p-2">
                <option>Todas</option>
                <option value="BUY">Compra</option>
                <option value="SELL">Venda</option>
              </select>
            </label>
            <span className="text-xs text-[#596b63]">{filtered.length} registros</span>
          </div>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[#596b63]">
                <tr><th className="p-4 text-left">DATA E HORA</th><th className="p-4">OPERAÇÃO</th><th className="p-4">ATIVO</th><th className="p-4">QTD.</th><th className="p-4">PREÇO</th><th className="p-4">TOTAL</th></tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="p-4 text-xs">{new Date(t.createdAt).toLocaleString("pt-BR")}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${t.type === "BUY" ? "bg-[#e8f1eb] text-[#174f3d]" : "bg-[#fff0d6] text-[#754600]"}`}>{t.type === "BUY" ? "Compra" : "Venda"}</span></td>
                    <td className="p-4 font-bold">{t.stockSymbol}</td>
                    <td className="p-4 text-center">{t.quantity}</td>
                    <td className="p-4">{formatMoney(t.price)}</td>
                    <td className="p-4 font-bold">{formatMoney(t.price * t.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="p-8 text-center text-sm text-[#596b63]">Nenhuma transação ainda.</p>}
          </div>
        </div>
      </Shell>
    </AuthGuard>
  );
}
