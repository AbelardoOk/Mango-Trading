import { apiFetch } from "./client";
import { MarketEventRequest, MarketEventResponse, StockRequest, StockResponse, UserResponse } from "@/types/api";

export function adminListStocks() {
  return apiFetch<StockResponse[]>("/api/admin/stocks");
}
export function adminGetStock(id: number) {
  return apiFetch<StockResponse>(`/api/admin/stocks/${id}`);
}
export function adminCreateStock(data: StockRequest) {
  return apiFetch<StockResponse>("/api/admin/stocks", { method: "POST", body: JSON.stringify(data) });
}
export function adminUpdateStock(id: number, data: StockRequest) {
  return apiFetch<StockResponse>(`/api/admin/stocks/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export function adminDeleteStock(id: number) {
  return apiFetch<void>(`/api/admin/stocks/${id}`, { method: "DELETE" });
}

export function adminListEvents() {
  return apiFetch<MarketEventResponse[]>("/api/admin/events");
}
export function adminCreateEvent(data: MarketEventRequest) {
  return apiFetch<MarketEventResponse>("/api/admin/events", { method: "POST", body: JSON.stringify(data) });
}
export function adminUpdateEvent(id: number, data: MarketEventRequest) {
  return apiFetch<MarketEventResponse>(`/api/admin/events/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export function adminDeleteEvent(id: number) {
  return apiFetch<void>(`/api/admin/events/${id}`, { method: "DELETE" });
}

export function adminListUsers() {
  return apiFetch<UserResponse[]>("/api/admin/users");
}
export function adminGetUser(id: number) {
  return apiFetch<UserResponse>(`/api/admin/users/${id}`);
}
