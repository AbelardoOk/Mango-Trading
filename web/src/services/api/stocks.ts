import { apiFetch } from "./client";
import { PricePoint, StockResponse } from "@/types/api";

export function listStocks() {
  return apiFetch<StockResponse[]>("/api/stocks");
}
export function listAllStocks() {
  return apiFetch<StockResponse[]>("/api/stocks/all");
}
export function getStock(id: number) {
  return apiFetch<StockResponse>(`/api/stocks/${id}`);
}
export function getStockHistory(id: number, range: string) {
  return apiFetch<PricePoint[]>(
    `/api/stocks/${id}/history?range=${encodeURIComponent(range)}`
  );
}
