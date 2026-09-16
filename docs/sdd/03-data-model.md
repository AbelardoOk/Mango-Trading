# 03 — Data Model

> Source: ERS §3.4 Data Requirements | Code: `server/src/main/java/.../entity/*.java` | Prototype: `08-carteira.png`, `11-admin-*`

## 3.1 ER Diagram

```
User (1) ── (1) Portfolio (1) ── (N) PortfolioItem (N) ── Stock (1)
 │                                                              │
 │ (N)                                                          │ (N)
 ▼                                                              ▼
Transaction (N) ── Stock (1)                           StockPriceHistory (N)
 │
MarketEvent (standalone)
```

- `User 1:1 Portfolio` (unique `user_id` in `portfolio`)
- `Portfolio 1:N PortfolioItem` (`portfolio_id`)
- `Stock 1:N` → `PortfolioItem`, `Transaction`, `StockPriceHistory`
- `User 1:N Transaction`
- `PortfolioItem` unique `(portfolio_id, stock_id)` — one line per stock per user

## 3.2 Entities & Columns

### User — `entity/User.java`
| Column | Type | Constraints |
|---|---|---|
| `id` | `BIGSERIAL PK` | auto |
| `name` | `VARCHAR` | `NOT NULL` |
| `email` | `VARCHAR` | `UNIQUE, NOT NULL` |
| `password` | `VARCHAR` | `BCrypt, NOT NULL` |
| `balance` | `NUMERIC(19,4)` | default `10000.0000`, populated in `User.java:54` + `AuthService:20` |
| `role` | `ENUM Role (USER,ADMIN)` | default `USER` |
| `createdAt` | `TIMESTAMP` | `@CreationTimestamp` |
| `updatedAt` | `TIMESTAMP` | `@UpdateTimestamp` |

### Stock — `entity/Stock.java`
| Column | Type | Constraints |
|---|---|---|
| `id` | `BIGSERIAL PK` |  |
| `name` | `VARCHAR` | `NOT NULL` |
| `symbol` | `VARCHAR` | `UNIQUE, NOT NULL`, normalized `UPPERCASE` in `StockService` |
| `description` | `TEXT` | nullable |
| `sector` | `VARCHAR` | nullable |
| `currentPrice` | `NUMERIC(19,4)` | `NOT NULL, >0` |
| `volatility` | `NUMERIC(5,4)` | nullable, `>=0`, e.g. `0.0250` |
| `active` | `BOOLEAN` | default `true` |
| `createdAt/updatedAt` | `TIMESTAMP` |  |

### Portfolio — `entity/Portfolio.java`
| Column | Type |
|---|---|
| `id` | `BIGSERIAL PK` |
| `user_id` | `BIGINT FK → User UNIQUE NOT NULL` |
| `createdAt` | `TIMESTAMP` |

### PortfolioItem — `entity/PortfolioItem.java`
| Column | Type | Constraints |
|---|---|---|
| `id` | `BIGSERIAL PK` |  |
| `portfolio_id` | `BIGINT FK → Portfolio` |  |
| `stock_id` | `BIGINT FK → Stock` |  |
| `quantity` | `INTEGER` | `>0` |
| `averagePrice` | `NUMERIC(19,4)` | `HALF_UP` weighted |
| **Unique** | `(portfolio_id, stock_id)` |  |

### Transaction — `entity/Transaction.java`
| Column | Type |
|---|---|
| `id` | `BIGSERIAL PK` |
| `user_id` | `BIGINT FK → User` |
| `stock_id` | `BIGINT FK → Stock` |
| `type` | `ENUM TransactionType (BUY,SELL)` |
| `quantity` | `INTEGER >0` |
| `price` | `NUMERIC(19,4)` snapshot at trade time |
| `createdAt` | `TIMESTAMP` |

### StockPriceHistory — `entity/StockPriceHistory.java`
| Column | Type |
|---|---|
| `id` | `BIGSERIAL PK` |
| `stock_id` | `BIGINT FK → Stock` |
| `price` | `NUMERIC(19,4)` |
| `createdAt` | `TIMESTAMP` |
| Trigger | On `StockService create/update` when `currentPrice` changes (`StockService:60`) |

### MarketEvent — `entity/MarketEvent.java`
| Column | Type |
|---|---|
| `id` | `BIGSERIAL PK` |
| `title` | `VARCHAR NOT NULL` |
| `description` | `TEXT` |
| `impact` | `ENUM MarketImpact (LOW,MEDIUM,HIGH)` |
| `startDate/endDate` | `TIMESTAMP` |
| `createdAt` | `TIMESTAMP` |

## 3.3 Enums
`entity/enums/Role.java`, `TransactionType.java`, `MarketImpact.java`.

## 3.4 Indexes & Constraints
- `users(email)` unique index.
- `stocks(symbol)` unique index (uppercased).
- `portfolio(user_id)` unique.
- `portfolio_item(portfolio_id, stock_id)` unique.

## 3.5 Mapping to Prototype
- `04-mercado.png` Stock fields visible: `name, symbol, sector, currentPrice (+variation%)`.
- `08-carteira.png` derived: `quantity, averagePrice, currentValue, profitLoss`.

## 3.6 Future Migration Note
If proposed rule `no-delete-with-links` adopted, add DB check or service guard before `StockRepository.delete`.
