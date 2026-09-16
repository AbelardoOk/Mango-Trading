import { apiFetch } from "./client";
import { StockResponse } from "@/types/api";

export function listStocks() {
  return apiFetch<StockResponse[]>("/api/stocks");
}
export function listAllStocks() {
  return apiFetch<StockResponse[]>("/api/stocks/all");
}
export function getStock(id: number) {
  return apiFetch<StockResponse>(`/api/stocks/${id}`);
}
