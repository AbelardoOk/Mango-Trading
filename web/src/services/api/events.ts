import { apiFetch } from "./client";
import { MarketEventResponse } from "@/types/api";

export function listEvents() {
  return apiFetch<MarketEventResponse[]>("/api/events");
}
