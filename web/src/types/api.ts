// Generated from docs/sdd/openapi.yaml — manual transcription for maintenance
// To regenerate via openapi-typescript: npx openapi-typescript docs/sdd/openapi.yaml -o web/src/types/api.ts

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TradeRequest {
  stockId: number;
  quantity: number;
}

export interface StockRequest {
  name: string;
  symbol: string;
  description?: string;
  sector?: string;
  currentPrice: number;
  volatility?: number;
  active?: boolean;
}

export interface MarketEventRequest {
  title: string;
  description?: string;
  impact: "LOW" | "MEDIUM" | "HIGH";
  startDate?: string; // ISO date-time
  endDate?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  balance: number;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface JwtResponse {
  token: string;
  type: string; // Bearer
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface StockResponse {
  id: number;
  name: string;
  symbol: string;
  description: string;
  sector: string;
  currentPrice: number;
  volatility: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketEventResponse {
  id: number;
  title: string;
  description: string;
  impact: "LOW" | "MEDIUM" | "HIGH";
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface TransactionResponse {
  id: number;
  userId: number;
  stockId: number;
  stockSymbol: string;
  stockName: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  createdAt: string;
}

export interface PortfolioItemResponse {
  id: number;
  stockId: number;
  stockSymbol: string;
  stockName: string;
  sector: string;
  currentPrice: number;
  quantity: number;
  averagePrice: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface PortfolioResponse {
  portfolioId: number;
  userId: number;
  userName: string;
  balance: number;
  items: PortfolioItemResponse[];
  totalInvested: number;
  totalCurrentValue: number;
  totalPatrimony: number;
  totalProfitLoss: number;
}

export interface RankingResponse {
  position: number;
  userId: number;
  userName: string;
  balance: number;
  stockValue: number;
  totalPatrimony: number;
}

export interface ErrorEnvelope {
  timestamp?: string;
  status: number;
  message?: string;
  errors?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;
  timestamp?: string;
  constructor(envelope: ErrorEnvelope) {
    super(envelope.message || "Erro na requisição");
    this.status = envelope.status;
    this.errors = envelope.errors;
    this.timestamp = envelope.timestamp;
  }
}
