"use client";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { adminListUsers, adminGetUser } from "@/services/api/admin";
import { UserResponse } from "@/types/api";
import { ApiErrorAlert } from "@/components/ApiError";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [detail, setDetail] = useState<UserResponse | null>(null);
  useEffect(() => { adminListUsers().then(setUsers).catch(setError); }, []);
  return (
    <AuthGuard requireAdmin>
      <Shell>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Usuários cadastrados</h1>
          <p className="text-sm text-[#4a5a52]">Consulte os perfis e papéis de acesso. Toque na linha para ver detalhes.</p>
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[#4a5a52]"><tr><th className="p-4 text-left">NOME</th><th className="p-4 text-left">E-MAIL</th><th className="p-4">PERFIL</th><th className="p-4">CADASTRO</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-[#f5f7f3] cursor-pointer" onClick={() => adminGetUser(u.id).then(setDetail).catch(setError)}><td className="p-4 font-semibold">{u.name}</td><td className="p-4">{u.email}</td><td className="p-4 text-center"><span className={`px-2 py-1 rounded-full text-xs ${u.role === "ADMIN" ? "bg-[#fff0d6] text-[#754600]" : "bg-[#e8f1eb] text-[#174f3d]"}`}>{u.role === "ADMIN" ? "Administrador" : "Usuário comum"}</span></td><td className="p-4">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#4a5a52]">Dados fictícios. Esta tela permite consulta; o CRUD do escopo se aplica às ações e empresas.</p>
        </div>
        {detail && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold">{detail.name}</h3>
              <p className="text-sm"><strong>E-mail:</strong> {detail.email}</p>
              <p className="text-sm"><strong>Perfil:</strong> {detail.role}</p>
              <p className="text-sm"><strong>Saldo:</strong> M$ {detail.balance.toFixed(2)}</p>
              <p className="text-xs text-[#4a5a52]">Cadastro: {new Date(detail.createdAt).toLocaleString("pt-BR")}</p>
              <button onClick={() => setDetail(null)} className="bg-[#e8f1eb] py-2 rounded-lg">Fechar</button>
            </div>
          </div>
        )}
      </Shell>
    </AuthGuard>
  );
}
