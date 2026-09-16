import { apiFetch } from "./client";
import { TradeRequest, TransactionResponse } from "@/types/api";

export function buy(req: TradeRequest) {
  return apiFetch<TransactionResponse>("/api/trades/buy", { method: "POST", body: JSON.stringify(req) });
}
export function sell(req: TradeRequest) {
  return apiFetch<TransactionResponse>("/api/trades/sell", { method: "POST", body: JSON.stringify(req) });
}
export function history() {
  return apiFetch<TransactionResponse[]>("/api/trades/history");
}
