# Feature Spec: 004 Player UX Improvements

> Source: approved UX plan + `docs/sdd/07-frontend.md`, `08-testing-quality.md`, `11-realtime.md` | Status: Implemented (phases 0–2) | Language: English

## Overview
Improve the player-facing experience of Mango Trading without changing the server contract: consistent visual language, clearer navigation, onboarding, better market/trade flows, responsive tables, accessible states, and fixes for misleading data.

## User Stories

### US1: Visual foundation
**As a** player **I want** a consistent, modern interface **so that** I can focus on decisions instead of decoding the UI.
- Semantic design tokens (`ink`, `green`, `orange`, `bg`, `soft`, `muted`, `line`, `red`, `focus`) are exposed to Tailwind and used by shared UI primitives.
- `Button`, `Card`, `Badge`, `StatCard`, `PageHeader`, `Input`, `Modal`, `Toast`, `Skeleton`, `EmptyState` form the UI kit.
- Geist is the body font; money values use tabular numbers.
- The Shell provides icons, page title, global balance chip, user menu, accessible skip link, and responsive bottom navigation.

### US2: Player flows
- **Dashboard:** patrimony hero with period delta, stat cards, ranking position by `userId`, market movers, event agenda, onboarding checklist.
- **Market:** search/sector/“only my stocks” filters, sortable columns, real daily variation (`priceChangePercent`/`previousPrice`), owned badge, event banners, mobile cards, empty state.
- **Trade:** breadcrumb/back, chart with 1H/1D/7D/30D and average-price reference, quick quantities, max button, inline validation, disabled submit, confirmation modal, success feedback/toast, deep link `?tab=sell`.
- **Wallet:** P/L and allocation, patrimony chart with invested baseline, concentration warning, sortable positions, mobile cards, sell deep link.
- **History:** bought/sold/operations summary, type/date filters, clear filters, load more, mobile cards, filtered export.
- **Ranking:** podium, sticky self card with gap to next, search, conditional Top 10 badge, mobile list.

### US3: Onboarding and help
- Dismissible first-steps checklist persisted in `localStorage`, auto-completed by market/wallet/ranking visits and first position.
- `/guide` public page explains rules, glossary, accessibility, and demo credentials.
- Login/register provide inline validation, password visibility, demo credentials, and accessible errors.
- Public home explains the product in three steps and three benefits.

### US4: Quality
- No horizontal overflow on mobile for wallet/history/ranking.
- Charts retain textual fallback tables and `aria-label`.
- Tables use `caption`/`scope`; sortable headers expose `aria-sort`.
- `bun run lint`, `npx tsc --noEmit`, and `bun run build` pass.

## Out of Scope
- Phase 3 gamification (missions, streaks, achievements, notification center).
- Backend changes.
- URL persistence of filters/ranges (follow-up).
- Prototype asset changes (`docs/sdd/assets/prototype/` remains read-only).

## Success Criteria
- Player routes `/dashboard`, `/market`, `/market/[id]`, `/wallet`, `/history`, `/ranking`, `/guide` render with the new Shell and responsive layouts.
- P0 defects fixed: variation uses price change, ranking uses `userId`, Top 10 is conditional, sell deep link works, invalid orders cannot submit, `/guide` exists, success feedback replaces abrupt redirect.

## Open Questions
- [ ] Add URL state for filters/ranges in a follow-up?
- [ ] Proceed with phase 3 gamification after player feedback?
