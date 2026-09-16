# 08 — Testing & Quality

> Source: ERS §1.2 Benefits + `readme.md:56`, `LEIA-ME:64` | Prototype validation | Code: `server/src/test/`, `web/` lint

## 8.1 Backend

- **Test profile:** `src/test/resources/application.properties` + `application-test.properties` uses H2 in-memory (no PostgreSQL needed for `./mvnw test`).
- **H2 vs PG:** Hibernate `format_sql`, `open-in-view=false` consistent.
- **Unit:**
  - `TradingService`: buy `ok`, `inactive`, `insufficientBalance`, `sell ok`, `insufficientQuantity`, `zero qty`, `not owned`, `avg weighted`.
  - `PortfolioService`: `totalInvested/currentValue/patrimony/profitPercent` math, `HALF_UP`.
  - `RankingService`: ordering `DESC`, position calc.
  - `StockService`: symbol upper, duplicate `400`, `StockPriceHistory` on price change.
- **Integration:**
  - `AuthController`: `POST /register 201/400`, `POST /login 200/401`.
  - `StockController` + `TradingController` + `PortfolioController` + `RankingController` + `Admin*` with `MockMvc` + JWT.
- **Contract:** Validate `openapi.yaml` via `swagger-cli validate` or `springdoc` endpoint (future). `controllers` grep shows 22 endpoints vs `openapi.yaml` 22.

## 8.2 Frontend

- **Lint:** `web: bun run lint` (`eslint.config.mjs` + `eslint-config-next`), `tsc --noEmit`.
- **A11y:** `axe-core` (already in `web/node_modules/axe-core`) on `login, market, wallet, admin` — 0 critical; check `21-acessibilidade.png` items: labels, focus `outline 3px #a95700`, `aria-*`, semantic.
- **Responsive:** Manual `375px (mobile), 768px, 1440px` — verify `mobilebar` appears `≤800px`, `side` hides, `mobilecards` vs `datawrap`, no horizontal scroll (`23,24` screens).
- **E2E:** `register → login → GET /stocks → POST /buy → GET /portfolio → GET /ranking` against real `server:8080`.
- **Visual:** Pixel parity against `assets/prototype/images/pages/*.png` (optional Chromatic/Agro).

## 8.3 Prototype Validation Already Done (LEIA-ME:64)

- Insufficient balance, valid buy + avg, insufficient sell, valid sell, create/edit/delete stock, block delete with links, no JS errors, no mobile horizontal scroll, visual SVG/PNG inspection.

## 8.4 Quality Gates (for agents)

```
server: ./mvnw test                 # H2, must be green
web:    bun run lint && tsc --noEmit
web:    axe audit (0 critical)
openapi: swagger-cli validate docs/sdd/openapi.yaml
trace:  docs/sdd/09-traceability.md 100% RF/RNF
assets: ls docs/sdd/assets/prototype/images/pages | wc -l == 25
```

## 8.5 Non-Functional Verification

| RNF | How verified |
|---|---|
| RNF03 real persistence | PostgreSQL `mango_trading` exists, `GET /portfolio` survives restart |
| RNF05 REST | `curl` examples in `04-api-contracts.md` |
| RNF07 A11y | axe + keyboard + screen reader sample |
| RNF08 responsive | `23,24-mobile-*.png` vs actual 375px |
| RNF09 layered | no `entity` leakage in `controller` return types |

## 8.6 CI Suggestion (future)
- GitHub Actions: `mvn test` + `swagger validate` + `bun lint` + `axe` on PRs touching `specs/` or `docs/sdd/`.
