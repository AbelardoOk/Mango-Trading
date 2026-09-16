import { apiFetch } from "./client";
import { PortfolioResponse } from "@/types/api";

export function getPortfolio() {
  return apiFetch<PortfolioResponse>("/api/portfolio");
}
