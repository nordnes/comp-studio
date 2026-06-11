# PRODUCT.md — Advisor Comp Studio

Strategic design context for impeccable and design tooling. Generated 2026-06-11 from
`CLAUDE.md` · `COMP_STUDIO_SPEC_v2.md` · `DESIGN_SYSTEM.md` (the authoritative sources — on conflict, they win).

## Register

product — app UI / internal tool. Design serves the task. (One exception surface: the **Proposition**
is the advisor-facing document and carries the brand serif moment — still product register, never marketing.)

## Users

- **Primary:** Robin (founder/CEO, Raiku Labs) — the sole operator. Models advisory-board equity + token
  compensation, prepares discussion drafts, runs governance checks.
- **Secondary:** advisors receiving a Proposition (read-only, often print/PDF), and board/investor
  counterparties reviewing the board pack. Not crypto-native; fiat-first framing.

## Purpose

Internal & confidential studio that models advisory-board compensation **net of strike** across scenarios
(Conservative/Base/Aggressive), trajectories, and governance constraints. Every output is a
**"discussion draft, not a binding offer."** The job: honest numbers, legible at a glance, defensible
in a board conversation.

## Brand personality

Calm, precise, confidential. A financial instrument, not a pitch. Quiet authority: Inter for UI,
Fraunces only for page titles / hero figures / the Proposition. One accent (amber) meaning exactly one
thing — the active case or the brand moment. Numbers lead; chrome recedes.

## Anti-references (do NOT copy)

- Color-only multi-series charts (COM-51: every series needs a non-color channel)
- Gross-value headlines (net-of-strike is non-negotiable)
- Unbounded sliders; manual completion state (the Forgd anti-pattern)
- 13-color chart stacks, narrative/essay surfaces, glassmorphism, gradient hero text
- Anything that makes a confidential discussion draft read like a marketing page

## Strategic design principles

1. **The legal corpus is verbatim and load-bearing** — design around it, never rewrite it.
2. **Borders earn their place** (DESIGN_SYSTEM §2): frames only for interactive/conclusion/form surfaces.
3. **Reading column by default** (`max-w-reading`), wide canvas only for genuinely horizontal data.
4. **Tabular-nums everywhere figures appear**; big figures `font-display` weight 350.
5. **WCAG 2.1 AA floor** (M7): contrast, focus rings, ≥32px targets, chart text alternatives.
6. **Print is a first-class surface** (board pack, Proposition) — grayscale-safe, running confidentiality footers.
7. Semantic tokens only (`surface-*`, `ink-*`, `outline-*`); the chart palette lives in `--chart-*`.

## Tech constraints

Vue 3 + Vite SPA · frappe-ui 0.1.278 Espresso (components only, never `app.use(FrappeUI)`) ·
Tailwind v3 + frappe-ui preset · frappe-charts 1.6.2 + custom SVG · engine gated (RFC §7) —
views never recompute money. ≤450 LOC per issue.

## Pointers

- Visual system: `DESIGN_SYSTEM.md` (tokens, layout grammar, component idioms, chart + print rules)
- Product spec: `COMP_STUDIO_SPEC_v2.md` · Standing rules: `CLAUDE.md`
