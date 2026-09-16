# 07 — Frontend

> Source: ERS §2.1, §3.3 Interfaces, RNF07-08 + `LEIA-ME.md` + `mango-trading.html` | Code: `web/src/app/*` (skeleton) | Assets: `assets/prototype/`

## 7.1 Stack & Tokens

- **Stack:** Next 16.3.5, React 19, TS 5, Tailwind 4, `bun` (`web/package.json:8`).
- **Design tokens** from `mango-trading.html:5` CSS vars:
```css
--ink:#172e27; --green:#174f3d; --orange:#f5ac45; --bg:#f5f7f3;
--soft:#e8f1eb; --muted:#596b63; --line:#d4dfd7; --red:#ad342c;
--focus: #a95700 (3px outline)
```
Map to `tailwind.config.mjs` `theme.colors`.

## 7.2 Structure (ERS §2.1)

```
web/src/
├── app/
│   ├── page.tsx              # 00-capa.svg/png (cover)
│   ├── layout.tsx            # Geist fonts, html lang="pt-BR", skip link
│   ├── globals.css           # tokens + focus-visible outline 3px #a95700
│   ├── (auth)/login/page.tsx | register/page.tsx
│   ├── (app)/page.tsx        # dashboard 03
│   ├── (app)/market/page.tsx # 04 + 23-mobile
│   ├── (app)/market/[symbol]/page.tsx  # 05,06,18,24 buy/sell
│   ├── (app)/wallet/page.tsx # 08,19
│   ├── (app)/history/page.tsx # 09
│   ├── (app)/ranking/page.tsx # 10
│   ├── (admin)/admin/stocks/... # 11-14
│   ├── (admin)/admin/events/... # 15,16
│   ├── (admin)/admin/users/page.tsx #17
│   └── guide/page.tsx        # 20,21,22
├── components/ {Sidebar, MobileBar, Topbar, StockTable, StockCard, TradeForm, MetricCard, Dialog, Pill, Chart}
├── services/api/client.ts    # Axios/fetch NEXT_PUBLIC_API_URL + Bearer
├── contexts/AuthContext.tsx
├── hooks/ {useAuth, usePortfolio}
└── types/api.ts              # generated from openapi.yaml
```

**Layout parity:** `mango-trading.html` `side` (232px fixed, `background: var(--ink)`, nav `active=var(--green)`) + `mobilebar` (hidden `>800px`, flex `≤800px`, `min-height:48px`).

## 7.3 Route → Screen → RF Map

| Route | Screens | RF | API |
|---|---|---|---|
| `/` | `00-capa.png/svg` | — | — |
| `/login` | `01-login.png/svg` | RF02 | `POST /auth/login` |
| `/register` | `02-cadastro-usuario.png/svg` | RF01 | `POST /auth/register` |
| `/(app)/` | `03-visao-geral.png/svg` | RF09-11 | `GET /portfolio`, `GET /ranking` |
| `/market` | `04-mercado.png/svg` + `23-mobile-mercado.png/svg` | RF05 | `GET /stocks` (+search `/sector` client filter) |
| `/market/[symbol]` | `05-compra.png/svg`, `06-venda.png/svg`, `18-saldo-insuficiente.png/svg`, `24-mobile-compra.png/svg` | RF06-08 | `POST /trades/buy|sell` |
| `/market/success` | `07-compra-concluida.png/svg` | RF06 | — |
| `/wallet` | `08-carteira.png/svg`, `19-carteira-vazia.png/svg` | RF09-11 | `GET /portfolio` |
| `/history` | `09-historico.png/svg` | RF10 | `GET /trades/history` |
| `/ranking` | `10-ranking.png/svg` | RF12 | `GET /ranking` |
| `/admin/stocks` | `11-admin-listagem.png/svg` | RF04 | `GET /admin/stocks` |
| `/admin/stocks/new` | `12-admin-cadastro.png/svg` | RF04 | `POST /admin/stocks` |
| `/admin/stocks/[id]/edit` | `13-admin-edicao.png/svg` | RF04 | `PUT /admin/stocks/{id}` |
| `/admin/stocks/delete` | `14-admin-exclusao.png/svg` | RF04 (RB09) | `DELETE /admin/stocks/{id}` |
| `/admin/events` | `15-eventos.png/svg` | Events | `GET /events` + `GET/POST/PUT/DELETE /admin/events` |
| `/admin/events/new` | `16-evento-formulario.png/svg` | Events | `POST /admin/events` |
| `/admin/users` | `17-usuarios.png/svg` | Users | `GET /admin/users` |
| `/guide` (+a11y) | `20-guia.png/svg`, `21-acessibilidade.png/svg`, `22-mapa-requisitos.png/svg` | RNF07-08 | — |

## 7.4 UX Rules (from LEIA-ME:32-36 demo flow)

1. Cover explains fictitious market.
2. Player: `login → dashboard → market → buy 10 AURA3`. Balance `M$ 4200→3780`, wallet `80→90 AURA3, avg M$ 40,22`, patrimony stays `12480`.
3. Show `wallet`, `history`, `ranking`.
4. Admin: create `SOLR3`, edit, delete; toggle active/inactive.
5. Guide: insufficient balance, empty wallet. End with `21,22`.

Short presentation set: `03,04,05,08,11,12,13,14,21`.

## 7.5 A11y & Responsive (RNF07/RNF08, `21-acessibilidade.png`)

- **Contrast** planned for WCAG AA (green `#174f3d` on `#f5f7f3`).
- **Semantic:** `header`, `nav`, `main`, `section`, `form`, `table`, `dialog`.
- **Focus:** `outline 3px solid #a95700` `outline-offset:4px` (see `mango-trading.html:5` `:focus-visible`).
- **Labels:** persistent `<label>`, `aria-describedby` for help/error, `aria-current="page"` for active nav, `role=alert` for errors.
- **States:** `↑ +` green vs `↓ −` red + text, not color only.
- **Responsive:** `grid.three → 1fr` at `≤800px`, `side {display:none}`, `mobilebar {display:flex}`, no horizontal scroll `23`, `mobilecards` vs `datawrap.desktoponly`.
- **Tokens:** buttons `min-height:48px`, `border-radius:10px`, `pill` style.

## 7.6 Implementation Notes

- **Formatting:** `M$` prefix `pt-BR` `Number.toLocaleString('pt-BR',{minimumFractionDigits:2})` (prototype style).
- **Validation:** match `mango-trading.html` trade form: integer `>0`, insufficient vs not-owned messages, `stock.active` check.
- **State:** read-only assets; components clone visuals, not import raw HTML. `web/middleware.ts` guards admin via JWT role.
- **Images:** reference `assets/prototype/images/pages/*.png` for pixel parity, `svg` for vectors.
