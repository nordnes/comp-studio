# Advisor Comp Studio → Web App — Implementation Plan

*Raiku Labs · Internal & confidential. Move the studio off the single-file React artifact (which struggles to load) onto a real, Vercel-hosted web app. Reuse the frozen engine; build the UI on **frappe-ui** (Espresso/Inter). Target: live this week.*

> **Status of the stack: settled — POST-GATE.** Robin's decision (2026-06-08, after the Phase-0 gate) is to
> **ADOPT `frappe-ui` as-is (Espresso preset + Inter)** as the UI system, built **frontend-only** via the
> verified recipe. This **supersedes** the Phase-0 "reject frappe-ui" verdict (`research/FINDINGS.md` D2/D3).
> The Phase-0 evidence — the use/avoid matrix, the corrected build recipe, the bundle numbers, the licensing,
> the chart decisions — **remains valid and correct; it is now the ADOPTION GUIDE, not a rejection.** Do not
> re-litigate the decision; this plan builds around adoption.
>
> Basis: the four research lanes (A frappe-ui, B frappe-charts, C ecosystem/licensing, D feature-inventory)
> reconciled in `research/FINDINGS.md`, the parity inventory in `research/D-feature-inventory.md`, and the
> orchestrator's **live sandbox** in `research/EMPIRICAL.md` (run 2026-06-08) — which **proved frappe-ui
> renders frontend-only** (`research/sandbox-frappe-ui.png`). Where any source disagrees with the sandbox, the
> sandbox wins. **The scaffold (`scaffold/`) is already re-wired to this recipe and is BUILD-GREEN this
> session** (`frappe-ui` 0.1.278 installed, ESM `tailwind.config.js` with the preset, the `frappe-ui/vite`
> plugin + `optimizeDeps`, `main.ts` imports `frappe-ui/style.css`, the stale `tailwind.config.cjs` removed,
> `style.css` de-duped, engine 22/22). **The six views are NOT yet converted to frappe-ui — that is the build
> agents' job** (COM-14/COM-17/etc.), now built from frappe-ui components + Frappe UI layout templates.

---

## 1. Why we're doing this

The studio is a ~150 KB single-file React + recharts artifact. It is functionally complete and *renders
correctly* (verified by server-side render), but it strains the artifact runtime — paste-truncation plus
the weight of nine charts mounting at once. The fix is to ship it as a normal web app: a static SPA on
Vercel, with the six views split across routes so each page loads light and only mounts the two or three
charts it actually shows.

We **reuse two things wholesale**, and **adopt one design system**:

1. The verified pure **engine** (`engine/engine.ts`) — the cap-table walk, net-of-strike valuation,
   scenario dilution, TGE-FDV multiplier, gating, channel capital, pools, roadmap CSV. It is
   framework-agnostic TypeScript, **frozen**, and reconciles to the dollar: defaults walk bridge **57,217**
   FD → Series C **118,707**, strike **$1,572.95**, base TGE FDV **$600M**, board net base **~$23M**.
   `node engine/engine.test.mjs` is **22/22 green** (re-verified this run).
2. The **information architecture + behaviour + copy + legal corpus** from the reference: Overview →
   Advisors → Board → Compare → Proposition → Configure. The *features, labels, caveats, and IA* still match
   `reference/advisor-comp-studio.tsx` exactly.
3. **The `frappe-ui` design system (Espresso/Inter)** for the *look and the building blocks*: its components,
   its Tailwind preset, and the Frappe UI layout templates (Starter / Gameplan / Helpdesk app-shell + page
   patterns). **Design tradeoff accepted:** Inter/Espresso **replaces** the bespoke Fraunces/IBM-Plex
   editorial look from the original artifact. Optional Raiku brand accents are layered lightly via
   `theme.extend` tokens / CSS-variable overrides (e.g. `font-display: Fraunces` for hero headings) — a light
   touch, not a fight against the preset.

---

## 2. The stack (decided — locked, POST-GATE)

A standalone **Vue 3 + Vite** SPA built on **frappe-ui (Espresso/Inter)**, deployed static on Vercel. **No
Frappe/Python backend for v1.** We ship `frappe-ui` (components + preset + templates) **and** `frappe-charts`
(charts engine), both MIT. Full rationale + the verified recipe below and in `research/FINDINGS.md` §6–§7 /
`research/EMPIRICAL.md`.

### 2.1 The central verdict — ADOPT frappe-ui as-is (Espresso/Inter)

`frappe-ui` **renders frontend-only** (the sandbox proved it — `research/sandbox-frappe-ui.png`), and we
adopt it wholesale for UI consistency and build speed:

- **Adopt the Espresso preset and Inter** — accept the design system as shipped. Its Tailwind preset sets
  `theme.colors` to Frappe's Figma palette, loads **Inter** (`InterVar` + `cv11`/`opsz` OpenType features),
  and sets `fontSize` (14px / weight 420), `borderRadius` (8px), `boxShadow`, and `container`. Components are
  wired to semantic tokens (`bg-surface-*`, `text-ink-*`, `border-outline-*`). We **keep** all of this rather
  than reproduce ~40 tokens by hand. The old editorial Fraunces/IBM-Plex palette is **retired** (optional
  Fraunces accent only, via `theme.extend`).
- **Build UI from frappe-ui components + Frappe UI layout templates.** Reach for `Button`, `Badge`,
  `FormControl`/`TextInput`/`Textarea`/`Select`/`Checkbox`/`Switch`, `Dialog`, `Dropdown`, `Tabs`/`TabButtons`,
  `Tooltip`/`Popover`, `Divider`, `Spinner`/`LoadingIndicator`, `Alert`, `Breadcrumbs` — and the Frappe UI
  Starter / Gameplan / Helpdesk **app-shell, sidebar, and page templates** for layout. **Invoke the
  `frappe-ui` Skill** for the component catalog, tokens, and patterns (it is installed and available).
- **Frontend-only is preserved via the verified recipe** (§2.4). The wiring is already in `scaffold/`.
- **The frappe-ui data layer stays OUT OF SCOPE.** `createResource` / `createListResource` / `useList` /
  `useDoc` / `useCall` / `frappeRequest` / `call` / `initSocket` all hardcode `/api/method/...` + Frappe
  CSRF/site headers + socket.io and are meaningless on a backendless SPA. **State is local** over the frozen
  engine (`src/store.ts`). A real Frappe backend stays an **optional later add** with no UI change.

> **This decision supersedes FINDINGS D2/D3** ("do NOT adopt frappe-ui"). The Phase-0 rejection reasoning
> (all-or-nothing theming, raw-source package, bundle cost, backend-bound plugin) is **still factually
> correct** — it is now the *adoption guide*: it tells the build agents exactly what they are accepting
> (Inter/Espresso, the build recipe) and exactly what to avoid (the plugin / data layer).

### 2.2 The chosen stack

- **UI system:** **`frappe-ui` 0.1.278 (pinned exact)** — components + the **Espresso Tailwind preset** +
  **Frappe UI Starter / Gameplan / Helpdesk layout templates** (app-shell, sidebar, page header, list/table,
  settings panels, empty states). Styling uses the preset's **semantic tokens** (`bg-surface-*`, `text-ink-*`,
  `border-outline-*`) — never raw `bg-gray-*`. Icons are **lucide CSS classes** (`<span class="lucide-edit
  size-4" aria-hidden="true" />`), never per-icon Vue imports.
- **Tables:** for our **fixed / engine-computed** tables (Board roster, Compare matrix), prefer a plain
  `<table>` styled with Espresso tokens over `ListView` — `ListView` is built around the Frappe
  list/resource model (server pagination, selection banners) we don't have. (FINDINGS §2a.)
- **Surfaces:** compose with `bg-surface-white rounded border border-outline-gray-1 p-4` rather than a `Card`
  component (per the Skill's guidance), and follow the Frappe spacing rhythm (`px-3 sm:px-5` gutters, centered
  content column, `space-y-5` between sections).
- **Charts:** `frappe-charts@1.6.2` (MIT) for the line / area / percentage / grouped-bar families
  **including the valuation staircase (it is a grouped bar)**, behind one `FrappeChart.vue` wrapper. Small
  **custom SVG** components (styled with Espresso tokens) for waterfall, scatter, football-field ranges,
  vesting timeline, and DilutionPath (see §3 / §4). `frappe-ui`'s own `AxisChart`/`DonutChart` (echarts, ~1 MB)
  are noted as an **option** for full design consistency but are **not** primary (heavier; double chart engine).
- **State:** a client-side `reactive` store (`src/store.ts`) wrapping the engine + `localStorage`
  persistence + clipboard share + URL-hash share. (Pinia optional; not required.)
- **Routing:** `vue-router` v4 (history mode) + the `vercel.json` SPA rewrite (already present).
- **Deploy:** Vercel, framework preset "Vite", build `npm run build`, output `dist`. Ship a
  `THIRD-PARTY-NOTICES` carrying the `frappe-ui` **and** `frappe-charts` MIT notices.

### 2.3 Version pins (the real scaffold — current-but-stable, Vite-5 line)

These match `scaffold/package.json` today (re-wired + build-green this session). `frappe-ui`'s adoption sets
two hard floors — **Vue ≥3.5** and **Tailwind v3** (the preset is v3-only).

| Package | Pin | Why |
|---|---|---|
| `vue` | `^3.5` | **frappe-ui peerDep floor is `>=3.5.0`** — required. 3.5 is backward-compatible with 3.4 app code. |
| `vue-router` | `^4.x` | Stay on v4 (frappe-ui peers `vue-router ^4.1.6`). Do **not** go to vue-router 5. |
| `vite` | `^5.x` | Stay on the Vite-5 line. Do **not** jump to 6/7/8 (`npm create vite@latest` now scaffolds Vite 8/Rolldown — ignore it). frappe-ui dev-builds on Vite 7 but doesn't force our major. |
| `@vitejs/plugin-vue` | `^5.x` | Pairs with Vite 5. Do not jump to 6 unless Vite ≥6. |
| `tailwindcss` | `^3.4` | **Stay on v3 — the frappe-ui preset is v3-only.** v4 drops the JS preset / `content` model for CSS-first `@theme`. Hard lock. |
| `typescript` | `^5.x` | TS 6 needs vue-tsc 3. |
| `vue-tsc` | `^2.x` | v2 OK on TS 5.x + Vue 3.5. |
| `frappe-ui` | **`0.1.278` (exact)** | **ADOPTED.** Pin exact — mid-major churn (`0.1.278` `latest` vs `1.0.0-beta.4` shipped the same day on GitHub). MIT. The committed scaffold pins it exact. |
| `frappe-charts` | `1.6.2` (exact) | MIT, zero deps, framework-agnostic. Pin exact to dodge the missing-CSS variance between 1.6.x publishes. |

**`@headlessui/vue` is NOT needed** — frappe-ui already bundles it (and `@floating-ui/vue`, reka-ui, vue-sonner);
its Dialog/Menu/Switch/Combobox/Tooltip come through frappe-ui's own components. Do **not** add it separately.

**`vp` (Vite+) is alpha → local-dev convenience only, NEVER a build/deploy dependency.** The committed
`package.json` scripts (`dev`/`build`/`preview`/`test`) stay plain `vite`/`node`; Vercel builds
`npm run build` → `dist` with the SPA rewrite. Already true in the scaffold — do not regress.

### 2.4 The verified frontend-only recipe (already wired in `scaffold/`, build-green)

All four pieces are required to build; the scaffold already carries them — **guard against regression.**

```ts
// vite.config.ts — the frappe-ui Vite plugin is REQUIRED just to build (its components' source uses
// `~icons/lucide/*` virtual imports). Disable the Frappe-site bits (we are backendless).
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import frappeui from 'frappe-ui/vite'
export default defineConfig({
  plugins: [ frappeui({ frappeProxy: false, jinjaBootData: false, buildConfig: false }), vue() ],
  build: { outDir: 'dist', target: 'es2020' },
  optimizeDeps: { include: ['feather-icons'] }, // else DEV throws: feather-icons has no default export
})
```
```js
// tailwind.config.js  (ESM — the preset is ESM-only; a .cjs require() fails). ADOPT the Espresso preset.
import frappeUIPreset from 'frappe-ui/tailwind'
export default {
  presets: [frappeUIPreset],
  content: ['./index.html','./src/**/*.{vue,js,ts}','./node_modules/frappe-ui/src/**/*.{vue,js,ts}'],
  theme: { extend: { fontFamily: { display: ['Fraunces','Georgia','serif'] } } }, // optional Raiku accent
}
```
```ts
// main.ts — import the stylesheet (Inter + preset base/components/utilities); import components BY NAME.
import 'frappe-ui/style.css'   // NOT 'frappe-ui/dist/style.css'
import './style.css'           // app overrides — imported AFTER frappe-ui so our rules win
// e.g. import { Button, Dialog, FormControl, Badge } from 'frappe-ui'
```

**NEVER `app.use(FrappeUI)`.** The plugin defaults `{resources:true, call:true, socketio:true}` → it
installs the Frappe RPC/resource layer and **calls `initSocket()`** (a socket.io connection that will
fail/retry against a static origin). Standalone apps skip the plugin and import components by name.

> **⚠️ Where the `frappe-ui` Skill's `SETUP.md` differs from THIS repo — the repo wins.** The Skill's generic
> setup (rule 11 / `SETUP.md`/`PATTERNS.md`) is written for a **Frappe-backed** app and prescribes
> `app.use(FrappeUI)`, mounting `<FrappeUIProvider>` for the resource layer, and
> `optimizeDeps.exclude:['frappe-ui']`. **This project is backendless**, so the **verified recipe above wins**:
> `optimizeDeps.include:['feather-icons']` (not exclude), **no `app.use(FrappeUI)`**, and **no data-layer
> provider for resources**. Use the Skill for its **component catalog, tokens, and UI patterns** (its real
> value here); ignore its backend wiring. *(If imperative `dialog.*`/`toast.*` are wanted, `<FrappeUIProvider>`
> may be mounted for **display only** — it is safe without `resources/call/socketio` — but the data-fetching
> composables stay out of scope. Otherwise use the `<Dialog>` component directly.)*

### 2.5 The corrected `frappe-charts` import (a likely first blocker — already fixed)

- **Bare** `import { Chart } from 'frappe-charts'` (resolves via the package `module` field to
  `dist/frappe-charts.min.esm.js`).
- **NO CSS import.** `frappe-charts/dist/frappe-charts.min.css` **does not exist in 1.6.2** (it 404s; it
  exists in 1.6.1) — the ESM bundle self-injects styles via `styleInject`. The old CSS line **broke the Vite
  build**; the scaffold's `FrappeChart.vue` is **already fixed** (bare import, no CSS) — keep it.

### 2.6 Licensing — zero copyleft risk

`frappe-ui` MIT, `frappe-charts` MIT, **Frappe Framework itself MIT** — only **ERPNext is GPLv3**, and we
depend on neither ERPNext nor any Frappe backend. MIT's only obligation is retaining the notice; ship a
`THIRD-PARTY-NOTICES` for **`frappe-ui` and `frappe-charts`** (the two Frappe libs we bundle).
**`echarts` is Apache-2.0** — relevant only if a frappe-ui chart component (`AxisChart`/`DonutChart`) is
imported; if we use one, add its Apache-2.0 notice too.

### 2.7 Why frontend-only is correct and unavoidable

Frappe Framework / ERPNext is a stateful Python(Gunicorn) + MariaDB + Redis + Node-Socket.IO +
background-worker monolith run under `bench`. Vercel hosts static assets + stateless serverless/Fluid
functions (it *can* run Python functions, but not a stateful always-on monolith). The blocker is topology,
not language. `frappe-ui` (components + preset) and `frappe-charts` compile to static JS/CSS and deploy fine
once the data/socket layer is left off — so the split is clean: take the *view* system, leave the *server*.

---

## 3. Architecture

```
main.ts → App.vue (frappe-ui app-shell: header + nav + <router-view>)   [import 'frappe-ui/style.css' first]
  store.ts  ── reactive State (engine.reconcile) ── computed board/selected ── localStorage + clipboard + URL
  router    ── /overview /advisors /board /compare /proposition /configure
  views     ── one Vue SFC per route, composed from frappe-ui components + Frappe UI layout templates;
               charts are <FrappeChart> or custom SVG components
  engine.ts ── pure functions; the ONLY place numbers are computed
```

**Single-source-of-truth rule (non-negotiable):** the engine is the only place money is computed. Views
**never recompute** value, dilution, strike, gating, or pools inline — they read engine outputs. Key
entrypoints (verified exports of `engine/engine.ts`): `DEFAULT()`, `reconcile()`, `computeBoard()`
(line 283), `computeAdvisor()` (216), `walkScenario()` (187), `tgeFdvFor()` (210), `vestedFrac()` (307),
`stageReached()` (208); formatters `fUSD/fPct/fNum/fMult/fTok/fDate`; helpers `roundList/roundLabel/
scenKeys/baseScenKey/benchLevelForTier`; constants `SCEN_COLORS`, `BENCH`, `SECTORS`, `SCHEMA`.

**State flow:** every mutation goes through a store action so persistence + share stay consistent. The
store owns the reducer surface that mirrors `reference/advisor-comp-studio.tsx`: `LOAD`, `SET`,
`ADD_ADV/DEL_ADV`, `ADD_OBJ/DEL_OBJ`, `ADD_TIER/DEL_TIER`, `ADD_MS/DEL_MS`, `ADD_ROUND/DEL_ROUND`,
`ADD_SCENARIO/DEL_SCENARIO`, `SET_ROADMAP`. The scaffold store today has `setPath/loadState/reset/select/
addAdvisor/delAdvisor` plus localStorage + `#s=` URL hash — the structural add/remove + **delete-cascade**
actions are the M1 build (§4, §6.4). **The store does NOT use frappe-ui's data layer** (no `createResource`/
`useList`/`useCall`) — it is plain `reactive` over the engine.

**Engine is frozen.** Type-only tweaks are allowed; behaviour changes are not. If a view seems to need a
new number, add it to the engine behind a test, not inline in a component.

**Reference is the UX source of truth (behaviour/copy/legal).** `reference/advisor-comp-studio.tsx` (1529
lines, React + recharts) defines behaviour, copy, and the legal corpus. The **visual** design is now
Espresso/Inter, but **features, labels, caveats, and IA still match the reference** — we re-skin it in
frappe-ui; we do not redesign the product.

---

## 4. View → component map (frappe-ui components + layout templates)

Tab ids in the reference are `overview / package / board / compare / proposition / configure`; the route
label for `package` is **"Advisors"** (so **"Advisors view" == `PackageTab`**). Numbering note: the
reference has two components both labelled "Section I" (Overview and Package) and eyebrow numerals that
disagree with the nav — **adopt the nav order (I Overview … VI Configure) and fix the eyebrows** during the
port (unowned cleanup, fold into the relevant view issue; open decision §6.1).

**This is the biggest change from the pre-gate plan:** each of the six views is now **built from frappe-ui
components + Frappe UI layout templates**, not hand-rolled SFCs. Use the app-shell/sidebar/page-header
templates for chrome; `Button`/`FormControl`/`Select`/`Dialog`/`Tabs`/`Badge`/`Tooltip`/`Dropdown` for
controls; a token-styled `<table>` (not `ListView`) for the computed tables. **The per-chart mapping below is
UNCHANGED** (frappe-charts + custom SVG). **Invoke the `frappe-ui` Skill** when building any view.

Legend for the chart column: **FC** = `frappe-charts` via `FrappeChart.vue` · **SVG** = custom SVG/CSS
(Espresso-token styled) · **CSS** = plain `<div>` bars, no chart engine.

| Route | frappe-ui building blocks (controls + layout) | Charts (mapping — unchanged) |
|---|---|---|
| **Overview** (`OverviewTab`) | App-shell page template + page header; KPI band as token surfaces (`bg-surface-white rounded border`); roster cards as `Button route=` cards (click→Advisors); `Badge` tier/$-pills; `Alert` for the "to confirm / alerts" panel (budget warnings + notes-regex `/confirm/i` + TGE-unvalidated + ESOP-at-adoption); benchmark card (FAST band + **source strings**); the **empty state** uses the Frappe empty-state pattern (`lucide-inbox` + `Button` "Add advisor"). **PoolAllocation** shared. | **none** — numbers + **CSS** bars only. |
| **Advisors** (`PackageTab`, hero/live-edit) | Two-pane page (left controls `no-print` / right hero `print-area`). Left: `FormControl` (`type="text"/"select"/"date"`) for profile; `Select` tier/sector/grant-round; `TabButtons` or token tier-grid; `Switch`/`Checkbox` for cash + objective tri-state; `Slider` for options/token split; the **`NumIn`** light inline numeric editor (COM-18 primitive — wraps `TextInput`); `Badge` StageBadge; `Tooltip` for net-vs-gross + caveats; `Button` "View proposition" CTA. Right hero: chart components below + `Dialog`/expander for "show detail". | **GrowthWaterfall = SVG** · **UpsideCurve equity (area) + token (line) = FC** (one component, two halves) · **VestingTimeline = SVG** · **FootballField = SVG** · **MixBreakdown = FC `percentage`** · **DilutionPath = SVG/CSS** · PotentialStrip = **CSS**. |
| **Board** (`BoardTab`) | Page header + `Button` "Board pack" (print) + `Button` "Add advisor"; `Badge` StageBadge; ContextStrip; token-styled roster `<table>` (row click→select, board-total row, delete via `Dropdown`/`Button` + `dialog.confirm` or `<Dialog>`); **per-advisor scenario-range** football-field list; **PoolAllocation** shared; company-cost panel (per-scenario net + annual cash) as token surfaces. | **ValuationStaircase = FC grouped `bar`** (Raiku vs benchmark Median per stage) · **PotentialScatter = SVG (mandatory)** · per-advisor range = **SVG/CSS**. |
| **Compare** (`CompareTab`) | Token-styled comparison matrix `<table>` (Advisor, Tier, Base eq, Earned, Ceiling, one Net-`<scenario>` col each, Cash/yr; base-scenario col bolded; board-total row; row click→select). `Badge` tier pills. | **Net-across-scenarios grouped `bar` = FC** (one series per scenario, `SCEN_COLORS`). *The grouped comparison bar lives **here**, not Board.* |
| **Proposition** (`PropositionTab`, legal-dense) | Header (`Select` AdvisorPicker + `Button` Print + `Button` Copy `propText()`); print-area doc (Confidential · Discussion Draft) composed as token surfaces + `font-display` hero headline; "How to read this"; 3 PCells; net-value-across-outcomes scenario cells; **legal footer block** (full caveat corpus — §6.6). | **none** (print-ready). |
| **Configure** (`ConfigureTab`) | Settings-panel template (the dark full-bleed look is now an Espresso surface — `[data-theme="dark"]` or a dark token surface, builder's call). Roadmap CSV import (`<input type=file>` + `FileReader`, **not** frappe-ui `FileUploader`) / export; Bridge, Rounds (add/rename/delete), Scenario paths (add/delete, set-base ★, per-round post+ESOP, TGE×), TGE anchor, exit multiple, `showBenchmarks`, uniform base/tokens/pools, capital schedule, Objectives, Tiers, Milestones — all via `FormControl`/`Select`/`Checkbox` + the **`DField`** dark inline numeric editor (COM-25 primitive). | **none.** |

**Shared components** (build once, reuse, all on frappe-ui + Espresso tokens): `PoolAllocation` (Overview +
Board), `ContextStrip` (Advisors + Board), `StageBadge` (a `Select` or `Badge`), `AdvisorPicker` (`Select`),
`EquityBenchmark` (FAST gauge — custom SVG/CSS), `ChipRow` (UpsideCurve presets — `TabButtons`/`Button` row),
`PotentialStrip`, `EmptyState` (Frappe empty-state pattern), plus layout helpers (`Field`/`Row`/`SectionHead`/
`Kpi`/`PCell`/`Banner`→`Alert`/`IconBtn`→`Button icon`). The **load-bearing numeric editors** `NumIn` (light,
click-to-edit, 5 formats usd/pct/pps/mult/num, clamp, Enter/Escape) and `DField` (dark Configure variant) are
primitives every Configure + Package number depends on — they wrap frappe-ui `TextInput` and need an explicit
owner (§4 issues COM-18 / COM-25). **Do not hand-roll buttons/inputs/dialogs** — pick the frappe-ui component
first (Skill rule 1).

### Chart wrapper contract (`FrappeChart.vue`, COM-16) — mandatory

The scaffold wrapper is already close; the contract it must satisfy:

- Create with `new Chart(el, opts)` and **guard the `undefined` return** (a bad/unknown type returns
  `undefined`).
- `watch(data)` → `chart.update(plainSnapshot)`, passing a **raw clone** (`toRaw` /
  `JSON.parse(JSON.stringify(...))`) — `update` deep-clones and **mutating reactive data in place will NOT
  update the chart**.
- **`destroy()` + `new Chart()` on type/colors/option changes** (`update` swaps data only); `chart.destroy()`
  in `onBeforeUnmount` (otherwise `resize`/`orientationchange` listeners leak).
- **Add the wrapper's own `ResizeObserver` → `chart.draw()`** — frappe-charts' internal `ResizeObserver` is
  commented out; only `window.resize` is handled, so sidebar/grid-reflow container resizes won't refit.
- **Redraw on route/tab show** — `draw()` early-returns when the parent is hidden, so a chart built inside a
  `display:none` view renders at **0 width**. Keep `showLegend` consistent across updates. Give each chart
  its own dedicated `<div>` (construct wipes `parent.innerHTML`). Export is **SVG-only** (`chart.export()`)
  — for print use SVG export + browser print.

### Why these custom-SVG calls (unchanged from Phase 0)

- **Scatter is a no-op in 1.6.2** — the string `scatter` is **absent from the installed runtime**
  (`dist/frappe-charts.min.esm.js`); as a dataset type it coerces to line and renders nothing. This is the
  sandbox-confirmed truth and **supersedes the stale issue #188 framing** (which is CLOSED, not a live
  tracker). → PotentialScatter **must** be custom SVG.
- **No native waterfall, range/floating bar, stepped line, or Gantt** in frappe-charts → GrowthWaterfall,
  FootballField (both the single-advisor and the Board per-advisor variants), VestingTimeline, and
  DilutionPath are custom SVG. The frozen engine already supplies every coordinate. Style them with Espresso
  tokens (`text-ink-*`, `surface-*`, the preset palette) so the SVG reads as part of the frappe-ui design.
- **The staircase is NOT a custom SVG** — the reference `ValuationStaircase` is a recharts **grouped bar**
  (Raiku vs Median); build it as a `frappe-charts` grouped bar. (Optional: a true-step outline as custom SVG
  only if the design demands it — a Robin call, §6.1 open decisions.)
- **frappe-ui's `AxisChart`/`DonutChart` are an OPTION, not primary.** They wrap echarts (~1 MB) and would
  give full visual consistency with the Espresso design, but `frappe-charts` stays PRIMARY (lighter, verified,
  already wired). If a builder reaches for them anywhere, see the §6.3 double-engine risk.

---

## 5. Milestones → issues (M0 → M5, mirroring Linear COM-8…COM-32)

Project: **Advisor Comp Studio — Web App (Frappe/Vercel)**. Every issue is **≤ 450 LOC**; split the *issue*
if a unit won't fit (pure renames reviewed as rename-only diffs are exempt). One issue = one PR, branched
from the issue's branch, body closes the issue id, tests ship with the code, QA gate green before merge to
`main`. **Build agents: invoke the `frappe-ui` Skill for every UI issue, and APPEND progress + decisions to
`memory.md` each session ("record to local memory.md").** Harness context (`CLAUDE.md`, `.claude/settings.json`)
is loaded each session — see §8.

### M0 — Foundation (Epic COM-1, COM-2)
- **COM-8 — Install + wire frappe-ui (Espresso/Inter), frontend-only — already done in scaffold; VERIFY GREEN.**
  *(Re-scoped for adoption.)* Confirm `package.json` pins (§2.3): `frappe-ui 0.1.278` exact + `frappe-charts
  1.6.2` exact, Vue `^3.5`, Tailwind `^3.4`. Confirm the verified recipe is intact (§2.4): `vite.config.ts`
  `frappeui({frappeProxy:false,jinjaBootData:false,buildConfig:false})` + `optimizeDeps.include:['feather-icons']`;
  ESM `tailwind.config.js` with `frappe-ui/tailwind` preset + content glob incl `node_modules/frappe-ui/src`;
  `main.ts` imports `frappe-ui/style.css`; **no `app.use(FrappeUI)`**; the corrected bare `frappe-charts`
  import with **no CSS line** in `FrappeChart.vue`. **`@headlessui/vue` is NOT needed (frappe-ui provides it)
  — do not add it.** `npm i && npm run build` is green. Deliver `THIRD-PARTY-NOTICES` (frappe-ui + frappe-charts
  MIT).
- **COM-10 — Reuse the frozen engine + spec.** Wire `engine/engine.ts` into the build; `npm run test` runs
  `engine.test.mjs` **22/22**. No engine behaviour changes (type-only tweaks allowed).
- **COM-11 — Store: persistence, schema reconciliation, clipboard + URL share.** *(Expanded — see §6.4.)*
  Reactive store over the engine (NOT frappe-ui's data layer); mutations `setPath/loadState/reset/select`.
  **Reconcile the localStorage schema collision** under key `raiku-advisor-comp-v5`: the reference stores
  `{scenarios, last}` (a named-board map), the scaffold stores **raw `State`** — incompatible under the same
  key. Pick one (tied to COM-32) and **version/migrate** so old payloads don't crash `reconcile`. Port the
  reference's **clipboard Copy/Paste** as the primary share (`io.copy(JSON.stringify(S))` /
  `clipboard.readText → LOAD`); keep the `#s=` base64 URL-hash as a **scaffold-only enhancement** (not
  reference parity). JSON export/import via `FileReader`.
- **COM-32 — Named multi-board persistence (`Mgr`) — DECISION REQUIRED.** *(Linear: M1, parent COM-2,
  related COM-11, priority Medium.)* The reference has a whole subsystem (the `Mgr` panel + an `io` layer
  storing `{scenarios, last}`: save many named boards, switch/load/delete, "Save as", header "Saved" badge =
  #saved). **No prior COM issue owned it.** Product decision (§6.1): **(a)** port it (implies the
  `{scenarios, last}` wrapper in COM-11), or **(b)** descope to single-state for v1 (implies COM-11
  formalises the raw-`State` shape). The `Mgr` panel, if ported, is built from the Frappe settings/dialog
  templates. Settle before/at M0 store work.
- **COM-9 — Git + Vercel preview.** First preview deploy proving the pipeline (`npm run build` → `dist`, SPA
  rewrite). Push to `https://github.com/nordnes/comp-studio` (origin/main). `vp` never enters the build path.

### M1 — Configure / the editing surface (Epic COM-3)
- **COM-25 — Configure baseline shell + `DField`.** Settings-panel template (dark Espresso surface);
  header + `Button` Done; Bridge controls (`FormControl`/`Select`); uniform base/tokens block; **the `DField`
  dark inline numeric editor** (load-bearing primitive — wraps frappe-ui `TextInput`; owner here). Header
  chrome (brand, Internal `Badge`, `Button`-icon row, status flash, storage/budget `Alert` banners) lands here
  or COM-14 — name it.
- **COM-12 — Rounds + Scenarios (with delete-cascade).** Add/rename/delete rounds; add/delete scenarios +
  set-base ★; per-round post+ESOP `DField`; TGE× `DField`; TGE anchor; exit multiple. **Cascade integrity is
  load-bearing, not trivial add/remove (§6.4):** `ADD_ROUND` seeds scenarios from the last round (×1.5 post)
  or defaults; `DEL_ROUND` deletes the per-scenario round, fixes `tgeAnchor`, remaps advisor
  `grantRound`→bridge; `ADD_SCENARIO` clones base; `DEL_SCENARIO` fixes `baseScenario`; **min 1** each.
  Destructive deletes use `dialog.confirm` (or a `<Dialog>`).
- **COM-23 — Tiers + Milestones (with delete-cascade).** Add/delete tiers (name, multiplier `DField`,
  derived eq); add/delete milestones (label, gating note). **Cascade:** `DEL_TIER` clamps `advisor.tier`;
  `DEL_MS` reassigns `currentStage` + `capitalUplift.gate` + objective gates to the first milestone; **min 1**
  each. Also lands `cocAccelPct`, equity vest yrs/cliffs, `tgeDate`, `tokenSupply` (straddle fields — ensure
  each has a home).
- **COM-24 — Objectives + Pools + Capital-uplift schedule.** Add/delete objectives (label, category, trigger,
  uplift `DField`, gate); **`DEL_OBJ` scrubs `achieved/targeted` across all advisors (§6.4)**; pools (advisor
  pool, committed/ecosystem, board bucket); capital-introduced schedule (per/pct/cap/gate); `showBenchmarks`
  toggle (`Switch`).
- **COM-13 — Roadmap CSV.** Import (`parseRoadmapCSV` → `SET_ROADMAP`) + download (`roadmapToCSV`), columns
  hint. Use `<input type=file>` + `FileReader` (NOT frappe-ui `FileUploader`, which targets Frappe's
  `/api/method/upload_file`). Engine functions exist (`engine` 157/177). **Distinct from the board-summary
  CSV** (folded into COM-15).

### M2 — Read views (Epic COM-4)
- **COM-14 — Overview parity.** KPI band (token surfaces), roster cards (`Button route=`), base-path caption,
  PoolAllocation (shared), benchmark card, alerts panel (`Alert`, incl. the `/confirm/i` notes regex),
  empty state (Frappe pattern). **Itemise the benchmark source strings** (§6.6) as acceptance criteria.
  (`Overview.vue` exists hand-rolled — **rebuild it on frappe-ui components**, then bring to full parity.)
- **COM-15 — Board table.** Token-styled roster `<table>` (row click→select, board-total row, delete via
  `Dropdown`/`dialog.confirm`), company-cost panel, PoolAllocation reuse, ContextStrip, `Button` Add-advisor.
- **COM-26 — Board charts: staircase + scatter.** **Staircase = `frappe-charts` grouped bar** (Raiku vs
  Median, TGE-FDV caption, `role="img"`); **PotentialScatter = custom SVG** (delegates the SVG kit to
  COM-27); the **per-advisor scenario-range** football-field list (SVG/CSS) lives here. Preserve the
  benchmark Median source string.

### M3 — Advisors hero & charts (Epic COM-5)
- **COM-16 — `FrappeChart.vue` wrapper.** The full contract in §4 (undefined-guard, raw-clone `update`,
  `destroy`+rebuild on type/colors, own `ResizeObserver`→`draw`, redraw-on-show, `destroy` on unmount).
- **COM-27 — Custom-SVG chart kit (Espresso-token styled).** GrowthWaterfall (floating rects + connectors +
  ±coloring + Current/Ceiling reference lines + hover-sync with the objectives list), PotentialScatter, both
  FootballField variants. (VestingTimeline + DilutionPath SVG land with COM-29.)
- **COM-18 — Advisors controls: profile + tier + `NumIn`.** Profile card (`FormControl`), base/tier card,
  tier picker, EquityBenchmark FAST gauge, StageBadge (`Select`/`Badge`), AdvisorPicker (`Select`); **the
  `NumIn` light inline numeric editor** (load-bearing primitive wrapping `TextInput` — owner here). Tax-residency
  `Select` here; its *legal-line* consequence is COM-20.
- **COM-30 — Advisors controls: performance.** Capital-by-channel `NumIn`s + live "+X% ⏳"; capital schedule
  caption; objectives tri-state (off/target/earned) list with hover-sync (`Switch`/`Checkbox`/`Button`);
  earned/pending/ceiling summary.
- **COM-17 — Advisors layout + PotentialStrip + GrowthWaterfall placement.** Two-pane layout
  (`no-print`/`print-area`) from the page template; ContextStrip; PotentialStrip (CSS). Consumes the COM-27
  waterfall.
- **COM-28 — UpsideCurve (both halves).** Equity net-vs-exit **area** (`regionFill`) + Tokens-vs-FDV
  **line**, in **one** component, with breakeven + `$1B` caution band (`yRegions`/`yMarkers`) + per-scenario
  + selected markers + `ChipRow` presets (`TabButtons`/`Button` row). *Do not spawn a separate token-line chart.*
- **COM-29 — Vesting + Football + Mix + Instruments + DilutionPath.** VestingTimeline (SVG, 0–48 mo, cliff/
  Bad-Leaver/TGE/today/CoC reference lines + legal tooltips via `Tooltip`), single-advisor FootballField
  (SVG), MixBreakdown (FC `percentage`), Instruments panel (net-of-strike rows + HMRC SAV/409A), **DilutionPath
  mini-chart** (SVG/CSS — owned here), and the "show detail" expander mechanic.

### M4 — Compare + Proposition (Epic COM-6)
- **COM-19 — Compare matrix + grouped bar.** Token-styled matrix `<table>` (base-scenario col bolded,
  board-total row, row click→select) + the **grouped comparison bar** (FC, one series per scenario,
  `SCEN_COLORS`) — this is where the grouped bar lives, *not* Board.
- **COM-20 — Proposition + print + the legal corpus.** Print-ready doc (token surfaces, `font-display` hero),
  "how to read this", 3 PCells, net-across-outcomes cells, the `propText()` plain-text clipboard export, and
  the **full legal footer block.** **Enumerate every caveat clause (§6.6) as acceptance criteria**
  (residency-branched s431/409A, RTA, deed of adherence, net exercise, non-voting, CoC-discretion, HMRC SAV,
  9-yr/90-day backstop, consents, Bad-Leaver, entity/jurisdiction). The global Footer legal note (net-of-strike
  summary, $1B caution, "discussion draft") is shell-level — name its owner (COM-20 or the shell).

### M5 — QA, polish & ship (Epic COM-7)
- **COM-21 — Colour-blind safety + a11y.** Chart `role="img"` + aria-labels; non-colour encodings; `Alert`
  banner a11y; focus states (frappe-ui components ship focus rings — verify they survive); **dark-mode check**
  (toggle `[data-theme="dark"]`; semantic-token-only styling should just work — Skill PATTERNS).
- **COM-31 — Mobile + print.** Port the exact `@media print` rules (`.no-print`/`.print-area` + `@page
  {margin:14mm}`); **drop the dead `.print-only` rule** (defined but never applied in the reference); verify
  all three print paths (Advisors "Print", Board "Board pack", Proposition "Print"); responsive nav + Frappe
  spacing rhythm (`px-3 sm:px-5`); frappe-charts legend can clip on narrow widths — custom legend if needed.
- **COM-22 — Production deploy.** Final Vercel production build, share the URL.

### New / folded issues (currently unowned — from the feature inventory §12a) — reconciled with Linear
- **COM-32 — Named multi-board `Mgr` — DECISION: port or descope** — **created in Linear** (M1, parent
  COM-2, related to COM-11). §6.1 decision.
- **Board-summary CSV export** (`exportCSV`: roster + company-cost rows; **distinct** from the roadmap CSV
  in COM-13) — **folded into COM-15** (noted in that issue).
- **Paste-state-from-clipboard** (the reference's actual share-*in* mechanism; `clipboard.readText → LOAD`;
  pairs with COM-11's clipboard Copy) — **folded into COM-11**.
- *(Also folded, called out as acceptance criteria where they land:)* **DilutionPath** → COM-29; **header
  budget/storage banners** (`Alert`) → COM-25/COM-14; **section-numbering fix** → the relevant view issue.

---

## 6. Dependencies, risks, correctness, open decisions, acceptance

### 6.1 Open product decisions for Robin (still OPEN — do not invent answers; settle before/at M0–M1)
1. **Named multi-board (`Mgr`)** — port as COM-32 or descope to single-state for v1? Drives COM-11's
   localStorage shape.
2. **localStorage schema** — adopt the reference `{scenarios, last}` wrapper (implies #1=port) or formalise
   the scaffold's raw-`State` shape (implies #1=descope)? Either way COM-11 must **version + migrate** off
   the colliding `raiku-advisor-comp-v5` key.
3. **Share mechanism** — keep both clipboard Copy/Paste (reference parity) and the `#s=` URL hash (scaffold
   enhancement), or scope COM-11 to clipboard-only + treat URL-hash as stretch?
4. **Valuation staircase rendering** — accept the `frappe-charts` grouped bar (free tooltips + `data-select`)
   or spend custom-SVG effort on a true-step outline for a stepped look?
5. **Section numbering** — adopt the nav order (I Overview … VI Configure) and fix the contradictory
   eyebrows (two "Section I")? Unowned cleanup.

*(The frappe-ui adoption itself is LOCKED, not open — these five are the only open product calls.)*

### 6.2 Dependencies between issues
- **COM-10 (engine) + COM-11 (store) gate everything** — every view reads `computeBoard`/`computeAdvisor`
  through the store.
- **COM-8 (frappe-ui wired) gates all UI + COM-16** (chart wrapper) which gates **all chart issues** (COM-26,
  COM-28, COM-29, COM-19); **COM-27** (SVG kit) gates **COM-26** (scatter) + **COM-17** (waterfall) +
  **COM-29** (vesting/football/dilution).
- **COM-18's `NumIn` + COM-25's `DField`** (both wrap frappe-ui `TextInput`) gate every numeric control in
  **COM-12/23/24/30** and the Configure surface — build the primitives first within their issues.
- **COM-11's schema decision** gates **COM-32 (Mgr)**; board-summary CSV is folded into **COM-15** and
  paste-state into **COM-11**.
- **Shared components** (`PoolAllocation`, `ContextStrip`, `StageBadge`, `AdvisorPicker`, `EquityBenchmark`)
  are first needed in M2/M3 — build once on frappe-ui, reuse; whoever lands them first owns them.
- Milestone order **M0 → M5** is the critical path; within a milestone, primitives precede the views that
  consume them.

### 6.3 Risks + mitigations
| Risk | Mitigation |
|---|---|
| **frappe-charts CSS import 404 breaks the build** (a likely first blocker). | Bare `import { Chart } from 'frappe-charts'`, **no CSS line** (§2.5). Already correct in the scaffold — guard against regression in COM-8/16. |
| **`app.use(FrappeUI)` opens socket.io / installs the Frappe RPC layer** on a backendless origin. | **Never call it** (§2.4). Import components by name. Provider only for display-only `dialog`/`toast` if wanted. |
| **Following the frappe-ui Skill's generic SETUP** (`app.use(FrappeUI)`, `optimizeDeps.exclude:['frappe-ui']`, resource provider). | The Skill is Frappe-backend-oriented; **the verified repo recipe wins** (§2.4: `optimizeDeps.include:['feather-icons']`, no plugin, no data layer). Use the Skill for components/tokens/patterns only. |
| **frappe-ui data layer creeps in** (`createResource`/`useList`/`useCall`/`useDoc`/`initSocket`) — backend-bound. | Out of scope (§2.1). State is local `reactive` over the engine. No `/api/method/...` calls anywhere. |
| **echarts double-engine** if a builder uses frappe-ui's `AxisChart`/`DonutChart` alongside `frappe-charts`. | `frappe-charts` is PRIMARY for all 9 charts; frappe-ui charts are an OPTION only. If one is used, it pulls echarts (~1 MB, Apache-2.0) — add the notice and accept the second engine deliberately, or keep to frappe-charts. |
| **Inter/Espresso fonts + CSS weight** (`frappe-ui/style.css` loads Inter ~561 KB; preset CSS ~174 KB raw). | Accepted tradeoff of adoption. It is the design system now; do not strip `style.css` (components render unstyled without the preset). |
| **Charts render at 0 width** inside hidden routes/tabs. | Wrapper `ResizeObserver`→`draw()` + redraw-on-route/tab-show (COM-16 contract). |
| **In-place reactive mutation doesn't update a chart.** | Pass a raw clone to `chart.update()`; rebuild on type/colors change (COM-16). |
| **Scatter silently renders nothing** (no-op in 1.6.2). | Custom SVG, mandatory (COM-27). Do not attempt `type:'scatter'`. |
| **Staircase mis-built as custom SVG** (old-plan error). | It is a `frappe-charts` grouped bar (COM-26); reserve SVG for waterfall/scatter/football/vesting/dilution. |
| **Reducer delete-cascades skipped → corrupt state.** | Explicit cascade acceptance criteria in COM-12/23/24 (§6.4). |
| **localStorage schema collision** (reference `{scenarios,last}` vs scaffold raw `State`, same key). | COM-11 reconciles + versions + migrates (§6.1 #2). |
| **Using `ListView` for the computed tables** (drags the Frappe resource model). | Use a token-styled `<table>` for Board/Compare; `ListView` is for server-paginated Frappe lists (FINDINGS §2a). |
| **Legal corpus dropped in port.** | Verbatim porting enumerated as COM-20 acceptance criteria (§6.6). |
| **Unowned features slip** (Mgr, board CSV, paste, DilutionPath, banners). | Tracked as COM-32 + folded acceptance criteria (§5). |
| **`vp`/Vite+ leaks into the build.** | Committed scripts stay plain `vite`; Vercel builds `npm run build`. |
| Tailwind v4 / vue-router 5 / Vite 6+ churn. | Pins locked (§2.3): Tailwind ^3.4 (preset is v3-only), vue-router ^4, Vite ^5. |

### 6.4 Reducer delete-cascade integrity (engineering, must be explicit in M1)
These are correctness requirements, not "add/remove" niceties — skipping any corrupts state:
- **`DEL_MS`** → reassign `currentStage`, `capitalUplift.gate`, and every objective `gate` to the first
  remaining milestone; min 1.
- **`DEL_ROUND`** → delete the per-scenario round entries, fix `tgeAnchor`, remap each advisor's `grantRound`
  → bridge; min 1. (`ADD_ROUND` seeds new scenario values from the last round ×1.5 post, or defaults.)
- **`DEL_TIER`** → clamp every `advisor.tier` into range; min 1.
- **`DEL_OBJ`** → scrub the objective id from `performance.achieved` and `performance.targeted` across **all**
  advisors.
- **`DEL_SCENARIO`** → fix `baseScenario`; min 1. **`ADD_SCENARIO`** → clone the base scenario.

### 6.5 Non-negotiables to preserve (every issue)
- **Engine frozen** (`engine/engine.ts`, 22/22; type-only tweaks).
- **Reference is the UX source of truth for behaviour/copy/legal** (`reference/advisor-comp-studio.tsx`) —
  the **visual** design is now Espresso/Inter, but features/labels/caveats/IA still match.
- **Internal & confidential** framing; **net-of-strike** on every equity value; **"discussion draft, not a
  binding offer."**
- **≤ 450 LOC per Linear issue** (split the issue if larger); one issue = one PR linking its issue; tests
  ship with the code; QA gate green before merge to `main`.
- **Invoke the `frappe-ui` Skill** for UI work; **APPEND to `memory.md`** each session.

### 6.6 Legal-caveat corpus + benchmark sources (port verbatim — COM-20 / COM-14 / shell)
Must survive the port near-verbatim; enumerate as acceptance criteria:
- **Caveats:** net-of-strike ("all equity values net of strike"); "Discussion draft, not a binding offer" /
  "Confidential · Discussion Draft"; **non-voting** ordinary shares (ESOP); Tokens via **Restricted Token
  Award (RTA)**; exercise binds a **deed of adherence**; **net exercise permitted**; Change-of-control
  acceleration **at Board discretion (not contractual)**; **UK s431 / US 409A by residency** (UK→s431 within
  14 days; US→s83(b)/409A; else "depends on residency"); strike subject to **HMRC SAV / 409A** valuation;
  **9-yr / ≥90-day** exercise-window backstop (Option Certificate 3.6); "**Subject to required investor
  consents.**"; **Bad-Leaver** 2-yr forfeiture; entity **Ackermann Systems Engineering Ltd (t/a Raiku),
  Cayman Islands**; **TGE multipliers unvalidated** — validate before sharing externally.
- **Benchmark source strings:** post-money medians "Carta State of Pre-Seed 2025 · ValueAdd VC 2025"; $1B
  FDV caution "Memento Research / The Defiant; MEXC — 2025 TGE performance"; advisor pool "Founder Institute
  FAST matrix; ~5% advisory-pool norm (2025)".

### 6.7 Acceptance criteria (ship gate)
- **Defaults reconcile** & **engine 22/22:** `node engine/engine.test.mjs` passes (bridge 57,217 → Series C
  118,707; strike $1,572.95; base TGE FDV $600M; board net base ~$23M). Views recompute nothing.
- **6 routes** live (`/overview /advisors /board /compare /proposition /configure`), Overview the default
  landing; no page mounts more than ~3 charts before interaction.
- **Built on frappe-ui:** views use frappe-ui components + layout templates + Espresso semantic tokens;
  `frappe-ui/style.css` imported; **no `app.use(FrappeUI)`**; **no frappe-ui data layer**; `@headlessui/vue`
  absent (frappe-ui provides it). Dark-mode toggle does not break the UI.
- **Persistence:** state persists in `localStorage` (schema reconciled + versioned), clipboard Copy/Paste
  works, URL-hash share works (if kept). Mgr decision (§6.1) honoured.
- **Print paths:** all three (`Advisors`, `Board pack`, `Proposition`) print cleanly under the ported
  `@media print` rules; dead `.print-only` removed.
- **Parity with the reference (behaviour/copy/legal):** net-of-strike, scenario dilution, gating,
  TGE-multiplier, pools, every structural list **add/remove/rename with cascades** (§6.4), the **legal corpus
  + benchmark sources** (§6.6), and the chart mapping (§4) all match `reference/advisor-comp-studio.tsx`.
- **Deploy:** Vercel SPA (`npm run build` → `dist`, SPA rewrite); `vp` absent from the build path; ship
  `THIRD-PARTY-NOTICES` (frappe-ui + frappe-charts MIT).

---

## 7. Asset bundle

```
comp-studio/
  IMPLEMENTATION_PLAN.md   ← this file (frappe-ui ADOPTED, Espresso/Inter)
  TECH_BRIEF.md            ← original Frappe research
  ULTRACODE_PROMPT.md      ← Claude Code build prompt
  README.md · DEV_WORKFLOW.md · PLAN_HARDENING_PROMPT.md
  CLAUDE.md · memory.md · THIRD-PARTY-NOTICES · .gitignore · .claude/settings.json   ← dev harness (§8)
  engine/
    engine.ts              ← canonical maths (FROZEN; reuse verbatim)
    engine.test.mjs        ← 22-assertion regression spec (node engine/engine.test.mjs → 22/22)
  reference/
    advisor-comp-studio.tsx ← the React app (UX source of truth for behaviour/copy/legal; 1529 lines)
  research/
    FINDINGS.md            ← reconciled evidence (now the ADOPTION GUIDE; D2/D3 superseded by Robin's gate call)
    D-feature-inventory.md ← parity inventory + gap table (the basis for §4–§6)
    EMPIRICAL.md           ← live sandbox ground truth (proves frontend-only render; overrides docs)
    A/B/C lane files · _CONTEXT.md · sandbox-frappe-ui.png
  scaffold/                ← Vite/Vue/Vercel skeleton — RE-WIRED to frappe-ui + BUILD-GREEN this session
    package.json (frappe-ui 0.1.278 exact + frappe-charts 1.6.2 exact) · vite.config.ts (frappeui plugin +
      optimizeDeps feather-icons) · vercel.json
    tailwind.config.js (ESM, frappe-ui/tailwind preset, v3) · postcss.config.cjs · index.html · tsconfig.json
    src/{main.ts (imports frappe-ui/style.css; no app.use(FrappeUI)),style.css,router.ts,store.ts,App.vue}
    src/components/FrappeChart.vue (corrected import) · src/views/{Overview.vue (hand-rolled — to rebuild on
      frappe-ui) + Stub.vue}
```

---

## 8. Dev environment / harness (created alongside)

Built so every build-agent session is consistent and recorded:

- **`CLAUDE.md`** (repo root) — project rules + context, loaded each session: engine-frozen, internal/
  confidential + net-of-strike + "discussion draft", ≤450 LOC per issue, frappe-ui adoption + the verified
  recipe (never `app.use(FrappeUI)`, no data layer), invoke the `frappe-ui` Skill, append to `memory.md`.
- **`memory.md`** (repo root) — a running log; **build agents MUST APPEND progress + decisions each session**
  ("record to local memory.md") so context carries across sessions.
- **`.claude/settings.json`** — permission rails for the agents.
- **`.gitignore`** — node_modules, dist, local cruft.
- **`THIRD-PARTY-NOTICES`** — frappe-ui + frappe-charts MIT (and echarts Apache-2.0 if a frappe-ui chart is used).
- **The `frappe-ui` Skill** is installed and available — agents invoke it for frappe-ui UI/component/token
  work (catalog in `COMPONENTS.md`, tokens in `TOKENS.md`, recipes in `PATTERNS.md`). **Caveat:** its
  `SETUP.md` assumes a Frappe backend — for this backendless app the §2.4 recipe overrides it.
- **Repo:** pushed to `https://github.com/nordnes/comp-studio` (origin/main).
