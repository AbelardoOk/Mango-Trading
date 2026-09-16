"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { adminCreateEvent } from "@/services/api/admin";
import { ApiErrorAlert } from "@/components/ApiError";

export default function AdminEventNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", impact: "LOW" as const, startDate: "", endDate: "" });
  const [error, setError] = useState<unknown>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await adminCreateEvent({ ...form, startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined, endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined });
      router.push("/admin/events");
    } catch (err) { setError(err); }
  }

  return (
    <AuthGuard requireAdmin>
      <Shell>
        <div className="max-w-2xl flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Novo evento</h1>
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <form onSubmit={submit} className="bg-white rounded-xl border p-6 flex flex-col gap-4">
            <label>Título<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="border rounded-lg p-3 w-full" /></label>
            <label>Descrição<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border rounded-lg p-3 w-full" /></label>
            <label>Impacto<select value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value as never })} className="border rounded-lg p-3 w-full"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label>
            <label>Início<input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border rounded-lg p-3 w-full" /></label>
            <label>Fim<input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border rounded-lg p-3 w-full" /></label>
            <button type="submit" className="bg-[#174f3d] text-white py-3 rounded-lg">Salvar evento</button>
          </form>
        </div>
      </Shell>
    </AuthGuard>
  );
}
