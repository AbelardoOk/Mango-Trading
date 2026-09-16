# 04 — API Contracts

> Source: `readme.md:99` API Ref + `controller/*.java` | Machine: `openapi.yaml` | Prototype: market/trade/portfolio screens

## 4.1 Base & Auth

- **Base URL:** `http://localhost:8080`
- **Auth:** `Authorization: Bearer <JWT>` (except `POST /api/auth/*`). Stateless HS256, 24h (`application.properties:18`).
- **Frontend header:** `services/api/client.ts` interceptor reads `localStorage.token`.
- **userId:** inferred from `@AuthenticationPrincipal`, never sent by frontend.

## 4.2 Endpoints (22 total)

### Auth — Public
| Method | Path | Request | Response | Codes |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | `RegisterRequest {name,email,password}` | `201 UserResponse {id,name,email,balance:10000,role,createdAt}` | `201,400 dup/validation` |
| `POST` | `/api/auth/login` | `LoginRequest {email,password}` | `200 JwtResponse {token,type:Bearer,id,name,email,role}` | `200,401` |

### Stocks — Authenticated (`ROLE_USER`+`ADMIN`)
| Method | Path | Response | Codes |
|---|---|---|---|
| `GET` | `/api/stocks` | `200 [StockResponse]` active only | `401` |
| `GET` | `/api/stocks/all` | `200 [StockResponse]` all | `401` |
| `GET` | `/api/stocks/{id}` | `200 StockResponse` | `404,401` |
| `GET` | `/api/events` | `200 [MarketEventResponse]` | `401` |

### Trading — Authenticated
| Method | Path | Request | Response | Codes |
|---|---|---|---|---|
| `POST` | `/api/trades/buy` | `TradeRequest {stockId,quantity}` | `200 TransactionResponse {id,userId,stockId,stockSymbol,stockName,type:BUY,quantity,price,createdAt}` | `400 inactive/balance,404` |
| `POST` | `/api/trades/sell` | `TradeRequest` | `200 TransactionResponse type:SELL` | `400 qty,404 not owned` |
| `GET` | `/api/trades/history` | — | `200 [TransactionResponse]` `createdAt DESC` | `401` |

### Portfolio & Ranking — Authenticated
| Method | Path | Response | Codes |
|---|---|---|---|
| `GET` | `/api/portfolio` | `200 PortfolioResponse {portfolioId,userId,userName,balance,items[],totalInvested,totalCurrentValue,totalPatrimony,totalProfitLoss}` + `PortfolioItemResponse {stockId,symbol,name,sector,currentPrice,quantity,averagePrice,totalInvested,currentValue,profitLoss,profitLossPercent}` | `404,401` |
| `GET` | `/api/ranking` | `200 [RankingResponse {position,userId,userName,balance,stockValue,totalPatrimony}] DESC` | `401` |

### Admin — `ROLE_ADMIN` only
| Method | Path | Request | Response | Codes |
|---|---|---|---|---|
| `GET` | `/api/admin/stocks` | — | `200 [StockResponse]` | `401,403` |
| `GET` | `/api/admin/stocks/{id}` | — | `200` | `404` |
| `POST` | `/api/admin/stocks` | `StockRequest` | `201 StockResponse` | `400 dup` |
| `PUT` | `/api/admin/stocks/{id}` | `StockRequest` | `200` | `404` |
| `DELETE` | `/api/admin/stocks/{id}` | — | `204` | `404` |
| `GET` | `/api/admin/events` | — | `200 [MarketEventResponse]` | `401,403` |
| `GET` | `/api/admin/events/{id}` | — | `200` | `404` |
| `POST` | `/api/admin/events` | `MarketEventRequest` | `201` | `400` |
| `PUT` | `/api/admin/events/{id}` | `MarketEventRequest` | `200` | `404` |
| `DELETE` | `/api/admin/events/{id}` | — | `204` | `404` |
| `GET` | `/api/admin/users` | — | `200 [UserResponse]` | `401,403` |
| `GET` | `/api/admin/users/{id}` | — | `200` | `404` |

Total `22` endpoints (grep `controller/*.java` 25 lines including `/register`+`/login`).

## 4.3 DTO Schemas

**Request:**
- `RegisterRequest`: `name (@NotBlank)`, `email (@Email)`, `password (@NotBlank min 6)`
- `LoginRequest`: `email,password`
- `TradeRequest`: `stockId (@NotNull)`, `quantity (@NotNull >0)`
- `StockRequest`: `name (@NotBlank)`, `symbol (@NotBlank) 3-10 alphanum UPPER`, `description`, `sector`, `currentPrice (@NotNull >0)`, `volatility (>=0)`, `active (bool)`
- `MarketEventRequest`: `title (@NotBlank)`, `description`, `impact (@NotBlank LOW|MEDIUM|HIGH)`, `startDate, endDate (LocalDateTime)`

**Response:** See `openapi.yaml` components for full schemas (types, examples).

## 4.4 Error Envelope — `GlobalExceptionHandler.java:1`

**Business error (400/404/401):**
```json
{"timestamp":"2026-09-14T22:00:00","status":400,"message":"Saldo insuficiente. Necessário: 500.00, Disponível: 100.00"}
```

**Validation (400):**
```json
{"timestamp":"...","status":400,"errors":{"email":"Email inválido","password":"Senha deve ter no mínimo 6 caracteres"}}
```

**Unauthenticated (401):** `"Acesso não autorizado"` via `JwtAuthenticationEntryPoint`.

## 4.5 Examples

```ts
// Axios client — web/src/services/api/client.ts
export const api = axios.create({ baseURL: import.meta.env.NEXT_PUBLIC_API_URL });
api.interceptors.request.use(c => { const t=localStorage.getItem("token"); if(t) c.headers.Authorization=`Bearer ${t}`; return c; });
```

```bash
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"ana@email.com","password":"123456"}'
TOKEN=eyJhbG...
curl http://localhost:8080/api/stocks -H "Authorization: Bearer $TOKEN"
```

## 4.6 OpenAPI
`openapi.yaml` is authoritative machine file. Frontend `types/api.ts` should be generated from it. Contract tests should validate against it.
