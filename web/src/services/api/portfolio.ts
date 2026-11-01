import { apiFetch } from "./client";
import { PortfolioHistoryPoint, PortfolioResponse } from "@/types/api";

export function getPortfolio() {
  return apiFetch<PortfolioResponse>("/api/portfolio");
}

export function getPortfolioHistory(range: string) {
  return apiFetch<PortfolioHistoryPoint[]>(
    `/api/portfolio/history?range=${encodeURIComponent(range)}`
  );
}
