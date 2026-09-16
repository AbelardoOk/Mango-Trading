# Implementation Plan: [ID] [TITLE]

> Template: spec-kit `plan-template.md` | Use for `specs/<id>-<slug>/plan.md`

## Link to Spec
`spec.md` — single source of requirements.

## Technical Design (pointer to SDD)
- `docs/sdd/02-architecture.md#...`
- `docs/sdd/03-data-model.md#...`
- `docs/sdd/04-api-contracts.md#...` + `openapi.yaml`
- `docs/sdd/05-business-rules.md#...`
- `docs/sdd/06-security.md#...`
- `docs/sdd/07-frontend.md#...`

## Architecture Decisions
| Decision | Option | Rationale |
|---|---|---|
| ... | ... | ... |

## Data Model Changes
- Entities, migrations, indexes, constraints.

## API Changes
- Endpoints, DTOs, status codes, error envelopes.

## Frontend Changes
- Routes, components, hooks, contexts, types.

## Security & Auth
- Roles, guards, token handling.

## Testing Strategy
- Unit / Integration / e2e, fixtures, H2 vs PostgreSQL, a11y.

## Rollout & Risks
- Migrations, feature flags, rollback, proposed rules (e.g., no-delete-with-links).

## Traceability
Update `docs/sdd/09-traceability.md` row for RFxx.
