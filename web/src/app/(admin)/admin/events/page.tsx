"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Shell } from "@/components/Shell";
import { adminListEvents, adminDeleteEvent } from "@/services/api/admin";
import { MarketEventResponse } from "@/types/api";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<MarketEventResponse[]>([]);
  useEffect(() => { adminListEvents().then(setEvents).catch(() => {}); }, []);
  return (
    <AuthGuard requireAdmin>
      <Shell>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Eventos de mercado</h1>
            <Link href="/admin/events/new" className="bg-[#174f3d] text-white px-4 py-2 rounded-lg">+ Novo evento</Link>
          </div>
          <div className="flex flex-col gap-3">
            {events.map((e) => (
              <div key={e.id} className="bg-white rounded-xl border p-6 flex flex-col gap-2">
                <div className="flex justify-between"><span className="bg-[#e8f1eb] text-[#174f3d] px-2 py-1 rounded-full text-xs">{e.impact}</span><span className="text-xs text-[#596b63]">{new Date(e.startDate).toLocaleDateString()} → {new Date(e.endDate).toLocaleDateString()}</span></div>
                <h3 className="font-bold">{e.title}</h3>
                <p className="text-sm text-[#596b63]">{e.description}</p>
                <button onClick={() => adminDeleteEvent(e.id).then(() => setEvents(events.filter((x) => x.id !== e.id)))} className="text-xs text-[#ad342c] underline self-start">Excluir</button>
              </div>
            ))}
            {events.length === 0 && <p className="text-sm text-[#596b63]">Nenhum evento.</p>}
          </div>
        </div>
      </Shell>
    </AuthGuard>
  );
}
