"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminGetEvent, adminUpdateEvent } from "@/services/api/admin";
import { MarketEventRequest } from "@/types/api";
import { ApiErrorAlert } from "@/components/ApiError";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";

type FormState = {
  title: string;
  description: string;
  impact: "LOW" | "MEDIUM" | "HIGH";
  priceDeltaPercent: string;
  direction: "POSITIVE" | "NEGATIVE" | "RANDOM";
  scope: "ALL" | "SECTOR";
  sector: string;
  recurrenceType: "NONE" | "DAILY" | "RANDOM";
  dailyTime: string;
  randomMin: string;
  randomMax: string;
  durationMinutes: number;
  enabled: boolean;
  visibilityMinutes: number;
  startDate: string;
  endDate: string;
};

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function minutesToText(minutes?: number) {
  if (minutes == null) return "";
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  return `${minutes}m`;
}

const emptyForm: FormState = {
  title: "",
  description: "",
  impact: "LOW",
  priceDeltaPercent: "",
  direction: "RANDOM",
  scope: "ALL",
  sector: "",
  recurrenceType: "NONE",
  dailyTime: "09:00",
  randomMin: "30m",
  randomMax: "2h",
  durationMinutes: 60,
  enabled: true,
  visibilityMinutes: 3,
  startDate: "",
  endDate: "",
};

export default function AdminEventEditPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    adminGetEvent(id)
      .then((event) => {
        setForm({
          title: event.title,
          description: event.description ?? "",
          impact: event.impact,
          priceDeltaPercent: event.priceDeltaPercent != null ? String(event.priceDeltaPercent) : "",
          direction: event.direction ?? "RANDOM",
          scope: event.scope ?? "ALL",
          sector: event.sector ?? "",
          recurrenceType: event.recurrenceType ?? "NONE",
          dailyTime: event.dailyTime ?? "09:00",
          randomMin: minutesToText(event.randomMinMinutes) || "30m",
          randomMax: minutesToText(event.randomMaxMinutes) || "2h",
          durationMinutes: event.durationMinutes ?? 60,
          enabled: event.enabled ?? true,
          visibilityMinutes: event.visibilityMinutes ?? 3,
          startDate: toLocalInput(event.startDate),
          endDate: toLocalInput(event.endDate),
        });
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload: MarketEventRequest = {
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
    };
    try {
      await adminUpdateEvent(id, payload);
      router.push("/admin/events");
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageSkeleton />;

  return (
    <>
      <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-green">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para eventos
      </Link>
      <PageHeader
        eyebrow="ADMINISTRAÇÃO"
        title="Editar evento"
        description="Ajuste impacto, recorrência e visibilidade do evento de mercado."
      />
      <ApiErrorAlert error={error} onClose={() => setError(null)} />
      <Card className="max-w-3xl p-5">
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <Field label="Título *">
            <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </Field>
          <Field label="Descrição">
            <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Impacto *">
              <Select value={form.impact} onChange={(event) => setForm({ ...form, impact: event.target.value as FormState["impact"] })}>
                <option value="LOW">LOW (1%)</option>
                <option value="MEDIUM">MEDIUM (2.5%)</option>
                <option value="HIGH">HIGH (5%)</option>
              </Select>
            </Field>
            <Field label="Delta custom %" hint="Vazio usa o impacto">
              <Input type="number" step="0.1" value={form.priceDeltaPercent} onChange={(event) => setForm({ ...form, priceDeltaPercent: event.target.value })} placeholder="3.5" />
            </Field>
            <Field label="Direção *">
              <Select value={form.direction} onChange={(event) => setForm({ ...form, direction: event.target.value as FormState["direction"] })}>
                <option value="RANDOM">Aleatória</option>
                <option value="POSITIVE">Positiva</option>
                <option value="NEGATIVE">Negativa</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Escopo *">
              <Select value={form.scope} onChange={(event) => setForm({ ...form, scope: event.target.value as FormState["scope"] })}>
                <option value="ALL">Todas as empresas</option>
                <option value="SECTOR">Por setor</option>
              </Select>
            </Field>
            <Field label={`Setor${form.scope === "SECTOR" ? " *" : ""}`}>
              <Input value={form.sector} onChange={(event) => setForm({ ...form, sector: event.target.value })} disabled={form.scope !== "SECTOR"} required={form.scope === "SECTOR"} />
            </Field>
          </div>
          <Field label="Recorrência *">
            <Select value={form.recurrenceType} onChange={(event) => setForm({ ...form, recurrenceType: event.target.value as FormState["recurrenceType"] })}>
              <option value="NONE">Única</option>
              <option value="DAILY">Diária</option>
              <option value="RANDOM">Aleatória</option>
            </Select>
          </Field>
          {form.recurrenceType === "DAILY" ? (
            <div className="grid gap-4 rounded-xl bg-bg p-4 md:grid-cols-2">
              <Field label="Horário diário *">
                <Input type="time" value={form.dailyTime} onChange={(event) => setForm({ ...form, dailyTime: event.target.value })} required />
              </Field>
              <Field label="Duração (min)">
                <Input type="number" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })} />
              </Field>
            </div>
          ) : null}
          {form.recurrenceType === "RANDOM" ? (
            <div className="grid gap-4 rounded-xl bg-bg p-4 md:grid-cols-3">
              <Field label="Mínimo *" hint="Ex.: 30m">
                <Input value={form.randomMin} onChange={(event) => setForm({ ...form, randomMin: event.target.value })} required />
              </Field>
              <Field label="Máximo *" hint="Ex.: 2h">
                <Input value={form.randomMax} onChange={(event) => setForm({ ...form, randomMax: event.target.value })} required />
              </Field>
              <Field label="Duração (min)">
                <Input type="number" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })} />
              </Field>
            </div>
          ) : null}
          {form.recurrenceType === "NONE" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Início">
                <Input type="datetime-local" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
              </Field>
              <Field label="Fim">
                <Input type="datetime-local" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
              </Field>
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-ink">
              <input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} className="h-4 w-4 accent-[#174f3d]" />
              Evento ativo
            </label>
            <Field label="Visibilidade prévia (min)">
              <Input type="number" value={form.visibilityMinutes} onChange={(event) => setForm({ ...form, visibilityMinutes: Number(event.target.value) })} />
            </Field>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/admin/events")}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
