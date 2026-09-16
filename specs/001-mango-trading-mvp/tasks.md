# Tasks: 001 Mango Trading MVP

> Source: `spec.md` + `plan.md` + `docs/sdd/` | Mark `[x]` when done

## Phase 1 — SDD & Contract (done in this PR)
- [x] T001 Create `.specify/memory/constitution.md` (7 principles, tech stack, governance)
- [x] T002 Create `.specify/templates/{spec,plan,tasks}-template.md`
- [x] T003 Create `specs/001/spec.md` (12 US, RF/RNF mapping)
- [x] T004 Create `specs/001/plan.md` (pointer to `docs/sdd/`)
- [x] T005 Create `docs/sdd/` modular 01-10 + `openapi.yaml` (22 endpoints)
- [x] T006 Copy prototype assets to `docs/sdd/assets/prototype/` (25 png, 26 svg, 1 pdf, 1 html)
- [x] T007 Update `AGENTS.md` root pointer

## Phase 2 — Backend Verification (already implemented, verify)
- [x] T010 Verify `AuthService` register `10000.00` + `Portfolio` creation
- [x] T011 Verify `TradingService` buy/sell guards + weighted `averagePrice`
- [x] T012 Verify `PortfolioService` patrimony math + `RankingService` ordering
- [x] T013 Validate `openapi.yaml` against `controller/*.java` (swagger-cli)
- [ ] T014 Decide: adopt `no-delete-with-links` rule (LEIA-ME:59) → `StockService` guard
- [ ] T015 Run `server: ./mvnw test` (H2) — must be green

## Phase 3 — Frontend (pending, see 002)
- [ ] T020 Scaffold `web/` App Router per `docs/sdd/07-frontend.md` routes
- [ ] T021 Implement `services/api/client.ts` `Bearer` interceptor
- [ ] T022 Implement auth/market/wallet/history/ranking/admin pages (parity with prototype)
- [ ] T023 Add a11y: semantic tags, labels, ARIA, focus, contrast

## Phase 4 — Quality
- [ ] T030 `web: bun run lint` green
- [ ] T031 Axe audit on prototype-parity pages
- [ ] T032 Responsive check 375px/768px/1440px (mobile bottom nav)

## Phase 5 — Traceability
- [ ] T040 Update `docs/sdd/09-traceability.md` 100% RF01-12 / RNF01-09
- [ ] T041 Add prototype screen refs to traceability col

## Done Criteria
- [ ] `openapi.yaml` matches 22 implemented endpoints
- [ ] `./mvnw test` green, `09-traceability.md` 100%, assets links valid
