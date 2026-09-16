# Tasks: 002 Prototype to MVP Frontend

> Spec: `spec.md` | Plan: `plan.md` | Mark `[x]` when done

## Phase 1 — Setup & Design System
- [ ] T001 Copy prototype tokens: `mango-trading.html:5` → `web/src/app/globals.css` + `tailwind.config.mjs` (`ink,green,orange,bg,soft,muted,line,red`)
- [ ] T002 Create `web/src/types/api.ts` from `docs/sdd/openapi.yaml` (or hand-type DTOs)
- [ ] T003 Create `web/src/services/api/client.ts` with `NEXT_PUBLIC_API_URL` + `Authorization: Bearer` interceptor
- [ ] T004 Create `web/src/contexts/AuthContext.tsx` + `web/src/hooks/*` (`useAuth`, `usePortfolio`)
- [ ] T005 Build layout components: `Sidebar`, `MobileBar`, `Topbar`, `SkipLink` matching `html` `side`/`mobilebar` classes
- [ ] T006 Cover `00-capa.png` → `web/src/app/page.tsx`

## Phase 2 — Player Flows
- [ ] T010 Auth: `01-login.png` + `02-cadastro-usuario.png` → `app/(auth)/login|register` + validation + `POST /api/auth/*`
- [ ] T011 Dashboard `03-visao-geral.png` → `app/(app)/page.tsx` (cards + chart + ranking teaser) `GET /portfolio` `GET /ranking`
- [ ] T012 Market `04-mercado.png` + `23-mobile-mercado.png` → `app/(app)/market` table desktop + mobile cards + search/sector filter `GET /stocks`
- [ ] T013 Trade `05/06/18/24` → `app/(app)/market/[symbol]` `TradeForm` live totals + `POST /trades/buy|sell` → `07-compra-concluida.png` success
- [ ] T014 Wallet `08-carteira.png` + `19-carteira-vazia.png` → `app/(app)/wallet` + empty state `GET /portfolio`
- [ ] T015 History `09-historico.png` → `app/(app)/history` filter `Todas/Compra/Venda` `GET /trades/history`
- [ ] T016 Ranking `10-ranking.png` → `app/(app)/ranking` highlight self `GET /ranking`

## Phase 3 — Admin
- [ ] T020 Stocks list `11-admin-listagem.png` → `app/(admin)/admin/stocks` `GET /api/admin/stocks`
- [ ] T021 Create `12-admin-cadastro.png` → `POST /api/admin/stocks`
- [ ] T022 Edit `13-admin-edicao.png` → `PUT /api/admin/stocks/{id}`
- [ ] T023 Delete `14-admin-exclusao.png` → `DELETE` + dialog `vinculos → Desativar` guard
- [ ] T024 Events `15/16` → `app/(admin)/admin/events` `GET /events` + `POST/PUT/DELETE /api/admin/events`
- [ ] T025 Users `17-usuarios.png` → `GET /api/admin/users`

## Phase 4 — Guide & Polish
- [ ] T030 Guide `20-guia.png` + a11y `21-acessibilidade.png` + coverage `22-mapa-requisitos.png` → `app/guide` info pages
- [ ] T031 Money helper `M$ pt-BR` + `variation` ↑/↓ + `pill` components parity with `html`
- [ ] T032 Responsive 375/800/1440 per `mango-trading.html` `@media(max-width:800px)`

## Phase 5 — Quality
- [ ] T040 `web: bun run lint` + `tsc --noEmit`
- [ ] T041 axe audit 0 critical on auth/market/wallet/admin
- [ ] T042 Keyboard + skip link + focus `outline 3px #a95700` + contrast AA
- [ ] T043 E2E: `register→login→market→buy→wallet→ranking` via real `server`

## Phase 6 — Traceability
- [ ] T050 Update `docs/sdd/09-traceability.md` with `Prototype Screen` column for 002
- [ ] T051 Verify `docs/sdd/assets/prototype/README.md` links (pdf/html/png/svg)

## Done Criteria
- [ ] 25 png screens reachable via routes, visual parity (no horizontal scroll mobile)
- [ ] All `spec.md` US1-US11 acceptance criteria GWT pass
- [ ] No `server/` contract break (openapi stays 22 endpoints)
