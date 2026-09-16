# Implementation Plan: 002 Prototype to MVP Frontend

> Spec: `spec.md` | SDD: `docs/sdd/07-frontend.md` + `assets/prototype/` | Status: Draft

## Technical Design Pointers
- **Routes:** `docs/sdd/07-frontend.md#routes` — map 25 png to Next App Router.
- **Design tokens:** `docs/sdd/07-frontend.md#design-system` + `mango-trading.html:5` CSS vars.
- **API:** `docs/sdd/openapi.yaml` (reuse 001, no new endpoints).
- **A11y:** `docs/sdd/08-testing-quality.md` (axe, semantic, responsive).
- **Assets:** `docs/sdd/assets/prototype/README.md` ingestion order.

## Route Map (png → Next route)
| Screen(s) | Route | Role | API |
|---|---|---|---|
| `00-capa.png` | `app/page.tsx` (cover) | Public | — |
| `01-login.png`, `02-cadastro-usuario.png` | `app/(auth)/login|register` | Visitor | `POST /api/auth/*` |
| `03-visao-geral.png` | `app/(app)/page.tsx` | USER | `GET /portfolio`, `GET /ranking` |
| `04-mercado.png`, `23-mobile-mercado.png` | `app/(app)/market/page.tsx` | USER | `GET /stocks` |
| `05-compra.png`, `06-venda.png`, `18-saldo-insuficiente.png`, `24-mobile-compra.png` | `app/(app)/market/[symbol]/page.tsx` (buy/sell) + `components/TradeForm.tsx` | USER | `POST /trades/buy|sell` |
| `07-compra-concluida.png` | `app/(app)/market/success` + toast | USER | — |
| `08-carteira.png`, `19-carteira-vazia.png` | `app/(app)/wallet/page.tsx` | USER | `GET /portfolio` |
| `09-historico.png` | `app/(app)/history/page.tsx` | USER | `GET /trades/history` |
| `10-ranking.png` | `app/(app)/ranking/page.tsx` | USER | `GET /ranking` |
| `11-admin-listagem.png..14-admin-exclusao.png` | `app/(admin)/admin/stocks/*` | ADMIN | `GET/POST/PUT/DELETE /api/admin/stocks` |
| `15-eventos.png`, `16-evento-formulario.png` | `app/(admin)/admin/events/*` | ADMIN | `GET /api/events`, `POST/.../admin/events` |
| `17-usuarios.png` | `app/(admin)/admin/users/page.tsx` | ADMIN | `GET /api/admin/users` |
| `20-guia.png`, `21-acessibilidade.png`, `22-mapa-requisitos.png` | `app/guide` (info) | All | — |

## Data Model Changes
None. Store `token` in `localStorage` or `httpOnly cookie` (decide: prototype uses local; recommend `localStorage` for MVP).

## API Changes
None. Add `services/api/client.ts` Axios/fetch with `Authorization: Bearer` interceptor, `NEXT_PUBLIC_API_URL`.

## Frontend Stack Details
- `web/` Next 16 App Router, `src/app/*`, `src/components/{AuthForm,StockTable,StockCard,TradeForm,PortfolioTable,MetricCard,Dialog}`, `src/contexts/AuthContext`, `src/hooks/usePortfolio`, `src/types/api.ts` (generated from `openapi.yaml`), `src/lib/money.ts` (`M$` formatter `pt-BR`).
- Tailwind `globals.css` tokens from `mango-trading.html:5` → `tailwind.config.mjs` `colors: {ink, green, orange, bg, soft, muted, line, red}`.
- Semantic: `header/nav/main/section/table/form/dialog`, `aria-*`, `skip link`.

## Security
- Guard `app/(admin)` by `role` from `JwtResponse`; `middleware.ts` redirects unauth to `/login`, non-admin to `/`.

## Testing
- `axe-core` on login/market/wallet/admin; keyboard navigation; contrast check `21-acessibilidade.png`.
- Mock API with `openapi.yaml` + MSW for visual parity tests (pixel compare against `png`).

## Rollout
- Phase 1: auth + layout (sidebar + mobilebar) per `mango-trading.html` `side`/`mobilebar`.
- Phase 2: market→trade→portfolio→history→ranking.
- Phase 3: admin CRUD.
- Keep `server/` unchanged except optional no-delete guard.

## Risks
- HTML prototype balance `4200` vs real `10000` — do not hardcode; always fetch.
- 25 png × svg — keep `assets/` read-only; components clone, not import raw HTML.

## Traceability
Extend `docs/sdd/09-traceability.md` with `Prototype Screen` column (done for 002).
