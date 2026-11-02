"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";

export function usePortfolioStream() {
  const { portfolio, point, connected, setPortfolio } = usePortfolio();
  return { portfolio, point, connected, setPortfolio };
}
