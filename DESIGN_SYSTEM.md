# DESIGN_SYSTEM.md — Advisor Comp Studio design handoff

The working grammar of the app's design system as shipped through **M7 (a11y floor) · M8 (UX uplift) ·
M9 PD1/PD2 + clean-layout cluster** (2026-06-09). For any new surface (M10–M12 build especially: Trajectory,
Governance, scenario sets), build inside this grammar. `reference/advisor-comp-studio.tsx` stays the
behaviour/legal source of truth; `COMP_STUDIO_SPEC_v2.md` the product spec; this file is *how it should look
and feel*. Standing rules (engine frozen, pins, confidentiality) live in `CLAUDE.md`.

## 1 · Foundations

- **Base system:** frappe-ui **0.1.278** Espresso preset, components-only (never `app.use(FrappeUI)`, no data
  layer). Tailwind v3 with `frappe-ui/tailwind` preset; brand extensions live in `tailwind.config.js
  theme.extend` only.
- **Type:** Inter (Espresso default) for UI; **Fraunces** (`font-display`) is the brand serif for page titles,
  hero figures, and the Proposition. Two typefaces, no third. Big figures use `font-display tabular-nums`
  with `font-weight: 350`.
- **Color:** semantic tokens ONLY — `bg-surface-*`, `text-ink-*`, `border-outline-*`. One accent: **amber**,
  and amber means exactly one thing — *the current/active case or the brand moment* (COM-118 direction).
  Status colors: `ink-green-3` earned/up · `ink-red-3` down/destructive/underwater · amber pending/base.
- **Custom tokens** (all defined in `src/style.css` + mapped in `tailwind.config.js`/`src/constants.ts`):
  | Token | Value | Use |
  |---|---|---|
  | `--ink-amber-strong` | `#8A4B08` light / `#E79913` dark | AA-safe amber for LABELS/eyebrows (bright `ink-amber-3` reserved for the Proposition hero italic + graphical fills) |
  | `--chart-capital/customer/partnership/governance/uplift/alt/tint/cash/warning/median` | see `style.css` | THE chart palette — single source of truth |
  | `SCEN_TOKENS` + `chartHex()` (`constants.ts`) | resolves tokens → hex | frappe-charts needs hex; DOM/SVG use `var(--chart-*)` directly |
  | `max-w-reading` | `60rem` (960px) | the reading column (see §2) |

## 2 · Layout grammar (the M9 clean-layout rules)

1. **Reading column vs wide canvas (COM-89).** `<main>` is full-bleed; each view owns its width.
   Prose/single-subject views (Overview, Advisors, Configure, Proposition, the footer) take
   `mx-auto w-full max-w-reading px-3 sm:px-5`. Dense tables (Board, Compare) self-apply `max-w-7xl`.
   New views: default to `max-w-reading`; opt up to 7xl only for genuinely horizontal data.
2. **Borders earn their place (COM-88).** A frame (`bg-surface-white rounded border border-outline-gray-1`)
   is reserved for (a) interactive surfaces (an editor card, a slider, a chart you hover), (b) conclusion
   surfaces (the amber company-cost panel, ScenarioTable), (c) form-field groups (Configure's gray panels).
   Static read-outs render as **section label + content** (`text-sm text-ink-gray-6 mb-3` label, `divide-y`
   for rows) directly on the white canvas. Never nest cards.
3. **Lead with the subject (COM-90).** A page's primary object (the roster on Board, the package on
   Advisors) comes first in reading order; analysis/charts are the supporting read below.
4. **Settings two-column (COM-95).** Long editing surfaces use a left group rail (sticky `lg:top-20`,
   `lg:w-44`; horizontal scroll strip below `lg` with descriptions hidden) + the active group's form on the
   right. Active rail item = `bg-surface-gray-3 text-ink-gray-9 font-medium` (the sidebar idiom).
5. **Rhythm:** `space-y-8` between de-boxed groups, `space-y-6` inside form columns; every section
   label uses **`.section-label`** (text-sm · font-medium · `ink-gray-7`, sentence case — COM-117's one
   treatment; amber is never a heading color per COM-118). Letterhead metadata (the confidentiality
   eyebrow, "Prepared for") stays quiet `text-sm text-ink-gray-6`.

## 3 · Component idioms (verified against frappe-ui 0.1.278 — trust these over docs)

- **Select** is a reka button-dropdown (`role=combobox`), NOT native. `Alert` has NO default slot; themes are
  `yellow|blue|red|green`. `Badge` DOES take `theme="orange"`. `Dialog` = `:options="{title,size}"` +
  `#body-content` + `#actions="{close}"`. `FormControl` has NO `:error` prop/slot — render your own transient
  `<p role="alert" class="text-p-xs text-ink-red-3">` (COM-77 pattern). `Dropdown` takes grouped
  `:options` (a divider renders between groups) and `lucide-*` icon strings. `TabButtons` =
  `:buttons="[{label,value}]"` + model-value (real buttons; no per-segment theming).
- **Vue prop gotcha:** an ABSENT Boolean-typed prop is cast to `false` — default-true booleans need
  `withDefaults`. **Clone gotcha:** `structuredClone` throws on reactive proxies — use the store's
  JSON-clone idiom.
- **Icons:** lucide via CSS classes from a FIXED baked set (~46 names; an unknown name renders an empty
  span — check the list in `memory.md` 2026-06-09 before using a new one).
- **Numbers:** `fUSD/fPct/fNum/fMult` from the engine, always `tabular-nums`, numeric table columns
  right-aligned with right-aligned headers (COM-97). **Round the displayed string, never chart geometry**
  (COM-123).

## 4 · Charts

- frappe-charts 1.6.2 (bare import, no css) for line/area/grouped-bar; **custom SVG** for waterfall, scatter,
  football-field, vesting timeline, DilutionPath (no scatter in 1.6.2). `FrappeChart.vue` wrapper handles the
  first-paint redraw + the COM-60 mount overlay; pass `ariaLabel` (it sets `role="img"`).
- Plot dollar axes in **$M** (no tick formatter exists); tooltips re-multiply.
- SVG text floor **≥11px** at the rendered size (COM-49) — beware viewBox scaling on small screens; value
  labels `ink-gray-7`+. Every series needs a **non-color channel** (position, initial, dash) for
  colour-blind/print safety (COM-51). Colors come only from `--chart-*`/`chartHex`.

## 5 · Accessibility floor (M7 — hold the line)

- Text contrast AA everywhere: default label gray is `ink-gray-6` (never gray-5/gray-4 for information);
  amber labels use `ink-amber-strong`.
- Focus: `focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)]` (Espresso's `ring-ink-*` silently
  doesn't compile; outline-gray-3 rings fail 3:1). SVG focus uses an outline (rings don't render on `<g>`).
- Interactive rows/glyph groups: `tabindex=0 role=button aria-label @keydown.enter/.space`. Touch targets
  ≥32px (icon buttons `size-8`). Charts carry `role="img"` + a data-bearing `aria-label` — but never put
  `role=img` over readable text.
- Destructive actions: confirm dialog for catastrophic (Reset, delete board), single-click + Undo toast for
  light list deletes (COM-43/70).

## 6 · Print & confidentiality

- `no-print` hides; `.print-only` shows only in print (COM-84); `.print-running` is the per-page
  confidentiality footer with the recipient fingerprint (COM-59). The interactive control is no-print, but
  its *conclusion* should survive to paper (the COM-84 target-outcome sentence is the pattern).
- The confidentiality eyebrow is ONE constant (`CONFIDENTIAL_EYEBROW`, COM-126). Legal corpus strings are
  verbatim and locked — presentation copy around them is fair game; the sentences are not (one sanctioned
  correction: COM-139/Δ4).

## 7 · Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Section label + content on the white canvas | Wrap every read-out in a bordered card |
| `max-w-reading` for prose views | One uniform width for every route |
| Tokenise a repeated value (`max-w-reading`, `--chart-*`) | Scatter arbitrary values (`max-w-[960px]`, hex in views) |
| Reuse the rail/sidebar active idiom for nav states | Invent a new selected-state treatment |
| Read engine exports; mirror an existing formula in-view only per PD2 §2 rule 3 | Compute new money quantities in a view |
| Verify on :4173 with computed styles + screenshots | Trust a screenshot for 1px borders or tooltip text |
