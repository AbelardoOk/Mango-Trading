"use client";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { adminListUsers } from "@/services/api/admin";
import { UserResponse } from "@/types/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  useEffect(() => { adminListUsers().then(setUsers).catch(() => {}); }, []);
  return (
    <AuthGuard requireAdmin>
      <Shell>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Usuários cadastrados</h1>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[#596b63]"><tr><th className="p-4 text-left">NOME</th><th className="p-4 text-left">E-MAIL</th><th className="p-4">PERFIL</th><th className="p-4">CADASTRO</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t"><td className="p-4 font-semibold">{u.name}</td><td className="p-4">{u.email}</td><td className="p-4"><span className="bg-[#e8f1eb] px-2 py-1 rounded-full text-xs">{u.role}</span></td><td className="p-4">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Shell>
    </AuthGuard>
  );
}
