# Prototype Assets — Mango Trading

> Source: `~/Downloads/MangoTrading_Entrega_Interface` | Author: Equipe Mango Trading (LEIA-ME:68) | Date: 2026-09-14 | Size: 6.6M, <4M total without duplicates

## How to use (for agents)
- **Read-only.** Never edit files here. Clone visuals into `web/src/components` per `docs/sdd/07-frontend.md`.
- **Order:** `LEIA-ME.md` → `pdf` (caderno) → `html/index.html` (navigable) → `images/pages/*.png` (25 pranchas) → `images/icons/*.svg` (26 vetores editáveis).

## Inventory

| Asset | Path | Details |
|---|---|---|
| Overview | `LEIA-ME.md` | Copy of source LEIA-ME (68 lines) + RF→screen map, demo flow, captions, validation |
| Caderno | `pdf/MangoTrading_Prototipo.pdf` | 24 pages, 1008×684 pts, ReportLab, 3.2M (`pdfinfo` 2026-09-14) |
| Navigable | `html/index.html` | Standalone `pt-BR` HTML+CSS+JS, no install, covers login→market→buy→wallet→ranking→admin CRUD, skip link, mobilebar |
| PNG | `images/pages/*.png` | 25 hi-res: `00-capa`..`24-mobile-compra` (see `../LEIA-ME.md` for legend) |
| SVG | `images/icons/*.svg` | 26 editable vectors + `LEIA-ME.txt` (drag to Figma to import mockup; interactions stay in HTML) |

### PNG/SCV List

```
00-capa
01-login
02-cadastro-usuario
03-visao-geral
04-mercado
05-compra
06-venda
07-compra-concluida
08-carteira
09-historico
10-ranking
11-admin-listagem
12-admin-cadastro
13-admin-edicao
14-admin-exclusao
15-eventos
16-evento-formulario
17-usuarios
18-saldo-insuficiente
19-carteira-vazia
20-guia
21-acessibilidade
22-mapa-requisitos
23-mobile-mercado
24-mobile-compra
```

## Figma

- **Prototype:** https://www.figma.com/design/AYyzDCqYcjkXqJxGQHpaxv — contains overview + market + start of buy. Starter plan hit API limit; full set is in local `png/svg`/`html`. See `figma-link.md` for dev-mode link placeholder.
- **Usage:** `telas-svg-editaveis/*.svg` can be dragged into Figma page (LEIA-ME:8). PNGs can be inserted into Canva/slides/docs (LEIA-ME:54).

## Mapping (LEIA-ME table)

| ERS | Screens |
|---|---|
| RF01-02 | `01,02` |
| RF03 | `20` guia, `11` vs `03` menus separados |
| RF04 | `11,12,13,14` |
| RF05 | `04,23` |
| RF06-08 | `05,06,07,18` |
| RF09-11 | `03,08,09,19` |
| RF12 | `10` |
| RNF07-08 | `21,23,24` |

Plus `15,16` events, `17` users.

## Demo Flow (LEIA-ME:32-36)

1. Cover: explain fictitious market.
2. Player: `visão geral → mercado → buy 10 AURA3`. Balance `4200→3780`, wallet `80→90 AURA3 avg 40.22`, patrimony `12480` unchanged.
3. Show `carteira, histórico, ranking`.
4. Admin: create `SOLR3`, edit, delete; toggle active.
5. Guide: `saldo insuficiente, carteira vazia`, then `21,22`.

Priority images for short demo: `03,04,05,08,11,12,13,14,21`.

## Suggested Captions (LEIA-ME:42-49)
- Visão geral…; Mercado…; Compra e venda…; Carteira após…; Fluxo admin…; Adaptação mobile…

## Validation (LEIA-ME:64)
Insufficient buy, valid buy + avg, insufficient sell, valid sell, CRUD, delete-block with links, no JS errors, no mobile horizontal scroll, SVG/PNG visual inspection — all passed.

## To open

```bash
xdg-open docs/sdd/assets/prototype/html/index.html
xdg-open docs/sdd/assets/prototype/pdf/MangoTrading_Prototipo.pdf
ls docs/sdd/assets/prototype/images/pages | head
```
