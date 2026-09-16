# 05 — Business Rules

> Source: ERS §3.1 RF01-12 + readme.md:371 | Code: `service/TradingService.java`, `PortfolioService.java`, `RankingService.java`, `StockService.java`

## RB01 — Initial Balance
- On `AuthService.register` create `User {balance=10000.00, role=USER}` + empty `Portfolio`.
- Code: `User.java:54` + `AuthService.java:20`.

## RB02 — Buy
**Service:** `TradingService.java:22` `@Transactional`
1. Validate `quantity >0` integer, else `BadRequestException`.
2. Validate `stock.active == true`, else `BadRequestException "Ação inativa"`.
3. Validate `stock exists`, else `ResourceNotFoundException 404`.
4. Compute `cost = currentPrice * quantity` (scale 4).
5. Validate `user.balance >= cost`, else `InsufficientBalanceException 400 "Saldo insuficiente. Necessário: X, Disponível: Y"`.
6. Debit `user.balance -= cost`, save.
7. Weighted avg: `newAvg = (oldQty*oldAvg + qty*price)/newQty` scale 4 `HALF_UP`. If no existing `PortfolioItem`, `averagePrice = price`.
8. Create/update `PortfolioItem`, save.
9. Persist `Transaction {type:BUY, quantity, price:currentPrice, user, stock}`.

## RB03 — Sell
**Service:** `TradingService.java:73`
1. Validate `quantity>0`, `stock exists`.
2. Load `PortfolioItem` by `portfolioId+stockId`, else `404 "Não possui ação"`.
3. Validate `quantity <= owned`, else `InsufficientQuantityException 400`.
4. Credit `user.balance += price*quantity`.
5. Decrement `PortfolioItem.quantity`; if `0` delete item.
6. Persist `Transaction SELL`.

> All buy/sell are atomic (`@Transactional`). No partial commit.

## RB04 — Portfolio & Patrimony
**Service:** `PortfolioService.java:30`
```java
totalInvested = Σ averagePrice * qty
totalCurrentValue = Σ currentPrice * qty
totalPatrimony = balance + totalCurrentValue
totalProfitLoss = totalCurrentValue - totalInvested
profitLoss = currentValue - totalInvested
profitLossPercent = (profitLoss / totalInvested *100) scale2 HALF_UP else 0
```

## RB05 — Ranking
**Service:** `RankingService.java:25`
- Load all `User`s, compute `stockValue = Σ currentPrice*qty` via `PortfolioItemRepository`, `totalPatrimony = balance + stockValue`, sort `DESC`, assign `position = index+1`. `GET /api/ranking`.

## RB06 — Price History
**Service:** `StockService.java:60`
- On `create`/`update` if `currentPrice` changed, persist `StockPriceHistory {stock, price, createdAt}`.

## RB07 — Stock Symbol
- Normalized `UPPERCASE` in `StockService`; unique constraint; validated `3-10 alphanum` (`^[A-Z0-9]{3,10}$` proposed from prototype `stockform`).

## RB08 — Market Event & Volatility
- Informational only. `volatility` stored `5,4` but does not auto-adjust price. Future: engine planned per `LEIA-ME:29` differential.

## RB09 — Proposed Rule (from prototype LEIA-ME:59, to validate)
- **Prevent delete** of `Stock` with linked `PortfolioItem` or `Transaction`. Throw `400` and suggest deactivation (`active=false`). Preserves history. To codify in `StockService.delete`.
