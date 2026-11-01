import { apiDownload } from "./client";
import { ReportFormat, ReportKind } from "@/types/api";

type ReportParams = {
  from?: string;
  to?: string;
  type?: "BUY" | "SELL" | "";
};

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadReport(
  kind: ReportKind,
  format: ReportFormat,
  params: ReportParams = {}
) {
  const query = new URLSearchParams({ format });
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.type) query.set("type", params.type);

  const { blob, filename } = await apiDownload(`/api/reports/${kind}?${query.toString()}`);
  saveBlob(blob, filename);
}
