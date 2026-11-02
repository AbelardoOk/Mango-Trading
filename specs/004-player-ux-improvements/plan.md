# Implementation Plan: 004 Player UX Improvements

> Spec: `spec.md` | SDD: `docs/sdd/07-frontend.md`, `11-realtime.md` | Status: Implemented (phases 0–2)

## Technical Design
- **Tokens:** extend `globals.css` `@theme inline` with semantic colors; body uses Geist and `--bg`/`--ink`.
- **UI kit:** `web/src/components/ui/*` (Button, Card, Badge, StatCard, PageHeader, Input/Field/Select/Textarea, Modal, Toast, Skeleton, EmptyState).
- **Shared state:** `PortfolioContext` owns the per-user SSE stream and polling fallback; `usePortfolioStream` re-exports it. Shell consumes the balance from the same provider.
- **Layouts:** `(app)/layout.tsx` and `(admin)/layout.tsx` centralize `AuthGuard` + `Shell`; pages return content only.
- **Onboarding:** `lib/onboarding.ts` + `OnboardingChecklist` use `localStorage` and a custom event; no backend.
- **Charts:** Recharts; patrimony range 1H/1D/7D/30D, delta badge, invested baseline; price chart 1H/1D/7D/30D with average baseline; allocation donut.
- **Icons:** `lucide-react` added to `web/package.json`.

## Files
| Area | Files |
|---|---|
| Foundation | `web/src/app/globals.css`, `web/src/app/layout.tsx`, `web/src/lib/cn.ts`, `web/src/components/ui/*` |
| Shell | `web/src/components/Shell.tsx`, `web/src/app/(app)/layout.tsx`, `web/src/app/(admin)/layout.tsx` |
| Player | `web/src/app/(app)/{dashboard,market,wallet,history,ranking}/page.tsx`, `market/[id]/page.tsx` |
| Public | `web/src/app/{page,login,register}/page.tsx`, `web/src/app/guide/page.tsx` |
| Charts | `web/src/components/charts/*` |
| State | `web/src/contexts/PortfolioContext.tsx`, `web/src/hooks/usePortfolioStream.ts` |
| Admin | wrapper removal in `(admin)` pages; event edit form aligned to UI kit |

## Corrections
- Market variation uses `priceChangePercent`/`previousPrice` instead of `volatility`.
- Dashboard ranking matches by `userId`.
- Ranking “Top 10” badge is conditional.
- Wallet “Vender” links to `/market/{id}?tab=sell`.
- Trade submit is disabled while invalid; confirmation modal prevents accidental orders.
- `/guide` route created; login link no longer 404s.
- `LiveBadge` distinguishes real-time from periodic updates.
- Body font is Geist; money uses tabular numerals.

## Testing
- `cd web && bun run lint`
- `cd web && npx tsc --noEmit`
- `cd web && bun run build`
- Manual: 375/768/1440 widths; keyboard focus; screen reader labels on charts/tables; SSE fallback messaging.

## Rollout
1. Foundation + Shell.
2. Player pages.
3. Public/auth/help.
4. Documentation/traceability.
