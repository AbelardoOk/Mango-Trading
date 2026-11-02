# Tasks: 004 Player UX Improvements

> Spec: `spec.md` | Plan: `plan.md` | Mark `[x]` when done

## Phase 0 — Quick wins
- [x] T001 Fix market variation to use price change
- [x] T002 Fix dashboard ranking lookup by `userId`
- [x] T003 Make ranking “Top 10” conditional
- [x] T004 Deep-link wallet “Vender” to sell tab
- [x] T005 Disable trade submit while invalid and validate quantity
- [x] T006 Create `/guide` route
- [x] T007 Replace abrupt trade redirect with success feedback + toast
- [x] T008 Use Geist body font and tabular money
- [x] T009 Clarify `LiveBadge` polling state
- [x] T010 Add mobile cards to wallet/history/ranking

## Phase 1 — Foundation
- [x] T020 Extend semantic tokens in `globals.css`
- [x] T021 Add UI kit (`Button`, `Card`, `Badge`, `StatCard`, `PageHeader`, `Input`, `Modal`, `Toast`, `Skeleton`, `EmptyState`)
- [x] T022 Add `PortfolioContext` shared stream
- [x] T023 Refactor `Shell` with icons, balance chip, user menu, responsive nav
- [x] T024 Add `(app)` and `(admin)` layouts
- [x] T025 Add accessible skip link/focus states

## Phase 2 — Player flows
- [x] T030 Dashboard hero, stats, movers, events, onboarding
- [x] T031 Market filters, sorting, daily variation, owned badge, event banners
- [x] T032 Trade chart ranges, quick quantities, max, confirmation, success
- [x] T033 Wallet P/L, allocation donut, concentration warning, sorting
- [x] T034 History summary, filter chips, load more
- [x] T035 Ranking podium, self gap, search, conditional badge
- [x] T036 Auth inline validation, password visibility, demo credentials
- [x] T037 Home steps/benefits and guide content
- [x] T038 Onboarding checklist persisted in `localStorage`

## Phase 3 — Follow-ups
- [ ] T040 Persist market/history filters and chart ranges in URL
- [ ] T041 Gamification (missions, streaks, achievements)
- [ ] T042 Automated visual regression/axe checks
