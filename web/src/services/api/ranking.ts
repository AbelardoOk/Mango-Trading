import { apiFetch } from "./client";
import { RankingResponse } from "@/types/api";

export function getRanking() {
  return apiFetch<RankingResponse[]>("/api/ranking");
}
