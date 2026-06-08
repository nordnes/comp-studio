# Tech Brief — Advisor Comp Studio frontend stack

> **INTERNAL & CONFIDENTIAL.** This document and the tool it describes produce a **discussion
> draft, not a binding offer**. All equity numbers are modelled **net of strike** (net-of-strike
> upside) and are subject to required investor consents and Board approval.

> **Reflects Robin's post-gate decision (2026-06-08): ADOPT `frappe-ui` as-is (Espresso/Inter).**
> This **supersedes** the Phase-0 "reject frappe-ui" verdict. The Phase-0 evidence (the use/avoid
> matrix, the standalone recipe, the bundle/perf numbers, the licensing) is **still valid and
> correct** — it is now the **adoption guide**, not a rejection. We do not re-litigate the call; the
> brief below is built around adoption.

> **Status: settled.** This brief is grounded in the reconciled Phase-0 evidence
> (`research/FINDINGS.md`) and the orchestrator's live sandbox (`research/EMPIRICAL.md`, run
> 2026-06-08). Where any earlier claim disagreed with the sandbox, **the sandbox won**. The
> decisions here are locked — downstream M0→M5 Linear (COM-*) issues build on them. The
> integration recipe in §2c/§6 is **wired into `scaffold/` and build-green this session**; it is the
> **primary** recipe, not a reversible on-ramp. §11 preserves the corrections from the original
> "use frappe-ui" brief — those import paths were wrong then and are still wrong; they are kept as
> "what NOT to do."

**Verdict in one line:** **adopt `frappe-ui@0.1.278` (Espresso preset + Inter) as the UI system** —
its components, the Espresso design tokens, and the **Frappe UI Starter / Gameplan / Helpdesk**
layout templates — for a clean, consistent UI/UX, deployed as a **static SPA on Vercel** via the
**verified frontend-only recipe** (already wired in `scaffold/` and build-green). Accept the design
tradeoff: **Inter/Espresso replaces the bespoke Fraunces/IBM-Plex editorial look** (optional Raiku
brand accents via `theme.extend` tokens / CSS-variable overrides — light touch, not a fight). Keep
**`frappe-charts@1.6.2`** for the line/area/percentage/grouped-bar family (incl. the valuation
staircase) and **custom SVG** (styled with Espresso tokens) for the rest. The only things we
**avoid** in frappe-ui are the **backend-bound data layer**, **`app.use(FrappeUI)`**, and the
**echarts-backed chart components** (unless deliberately chosen for design consistency).

---

## 1. Stack rationale + frontend-only justification

### 1a. The chosen stack
Vue 3 (`<script setup>`) + Vue Router 4 + Vite 5 + Tailwind 3.4 + TypeScript, with **`frappe-ui`
0.1.278** as the UI system (components + the **Espresso** Tailwind preset + the Frappe UI
Starter/Gameplan/Helpdesk layout templates), **`frappe-charts@1.6.2`** for charts, and a small
**custom-SVG** kit (styled with Espresso tokens) for the chart types frappe-charts lacks. The
business maths lives in the **frozen** `engine/engine.ts` (22/22 tests green; type-only tweaks
allowed). `reference/advisor-comp-studio.tsx` (1529 lines) is the **UX source of truth** —
its **features, labels, caveats, legal corpus, and information architecture** still govern; only the
**visual** design moves from Fraunces/IBM-Plex editorial to **Espresso/Inter**.

This is not a greenfield guess. The scaffold is **already re-wired to frappe-ui and builds green
this session**: `frappe-ui` is installed and pinned exact, `tailwind.config.js` is ESM loading the
`frappe-ui/tailwind` preset, `vite.config.ts` runs the `frappe-ui/vite` plugin (Frappe bits off) +
`optimizeDeps:{include:['feather-icons']}`, `main.ts` imports `frappe-ui/style.css`, `style.css` is
de-duped, and the stale `tailwind.config.cjs` was removed. The frozen engine is **22/22**. The
views (`Overview.vue` / `App.vue`) are **not yet converted** to frappe-ui — that is the build
agents' job (COM-14 / COM-17 / etc.), using frappe-ui components + templates.

### 1b. Frontend-only on Vercel — confirmed and unavoidable
Frappe Framework / ERPNext is a **stateful monolith**: Python (Gunicorn) + MariaDB + Redis +
Node Socket.IO + background workers, all orchestrated by `bench` under supervisor. Vercel hosts
**static assets and stateless serverless / Fluid functions** — it *can* run Python *functions*, but
**not** a stateful, always-on monolith with its own database, cache, websocket server and worker
queue. The blocker is **topology, not language**.

The split is therefore clean: **take the view library, leave the server.** `frappe-ui`'s
**components + preset + style.css** and `frappe-charts` compile to plain static JS/CSS and deploy to
Vercel fine — **proven standalone in the sandbox** (`research/sandbox-frappe-ui.png`: Button / Badge
/ FormControl / Select / Checkbox / Dialog + frappe-charts line & grouped bar all rendering with no
backend and no `FrappeUI` plugin). Application state is **local** — a `reactive`/Pinia store over
`engine/engine.ts`, persisted to `localStorage` — with no server round-trip. The frappe-ui
**data-fetching layer** that *would* target a Frappe site is explicitly **out of scope** (§2b).

A backend remains an **optional later add** with **no UI change**: stand up a real Frappe site
(Frappe Cloud or a VM) and point a thin data layer at its REST API. Nothing in v1 depends on that
path.

### 1c. Vercel build config (unchanged from scaffold — do not regress)
Framework preset **Vite** · install `npm install` · build `npm run build` · output `dist`. The only
config is the SPA rewrite, already committed as `scaffold/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

No serverless functions and no env vars for v1. Note: the `frappe-ui/vite` plugin's
**`buildConfig:false`** keeps our `dist/` output (it would otherwise re-target the Frappe app
layout) — do not flip it.

> **`vp` / Vite+ is alpha → local-dev convenience ONLY, never a build/deploy dependency.** The
> committed `package.json` scripts (`dev` / `build` / `preview` / `test`) stay **plain `vite`** so
> Vercel and CI need no `vp`. This is already true in the scaffold — do not regress it.

---

## 2. frappe-ui: **ADOPTED** (with the accepted design tradeoff)

### 2a. The decision — adopted as-is (Espresso/Inter)
`frappe-ui` **was evaluated** (tarball `0.1.278` unpacked in Lane A; rendered standalone in the
sandbox) and is now **adopted as the UI system.** The evidence below is unchanged from Phase-0 — it
now reads as the **adoption guide**:

- **The preset IS the design system, and we take it.** The Tailwind preset (`tailwind/preset.js` →
  `tailwind/plugin.js`) **sets the entire `theme.colors`** to Frappe's Figma **"Espresso"** palette
  (semantic `surface-*` / `ink-gray-*` / `outline-*` tokens), **applies Inter globally** via
  `addBase({ html: { fontFamily: 'InterVar, ...' } })` plus Inter-specific OpenType features
  (`'opsz' 24`, `'cv11' 1`), and **sets `fontSize` (base 14px / weight 420), `borderRadius` (8px),
  `boxShadow`, and `container`.** Components are **wired to those tokens** (`bg-surface-gray-2`,
  `text-ink-gray-8`, `border-outline-gray-3`, `focus-visible:ring-outline-gray-3`) — which is
  exactly why adopting the preset gives every component its intended, consistent look **for free**.
  **Accepted tradeoff:** Espresso/Inter **replaces** the bespoke Fraunces/IBM-Plex editorial look.
  Raiku brand accents are layered **lightly** on top via `theme.extend` tokens / CSS-variable
  overrides (e.g. a `display` font for headings) — a light touch, not a fight back toward a second
  design language.
- **Ships as raw TS/Vue source with no `dist/`.** The package root `.` resolves to `src/index.ts`;
  this is **why the `frappe-ui/vite` plugin is required even standalone** (§2c) — it is part of the
  supported recipe, now wired and green.
- **Accepted bundle cost.** A **4-component** import (Button/Badge/FormControl/Dialog) cost, in a
  production `vite build` (§5): **~148 KB gz JS** (510 KB raw) + **~21 KB gz CSS** (174 KB raw) +
  **561 KB Inter** woff2 (from `frappe-ui/style.css`), while dragging **reka-ui + @vueuse**. We
  accept this as the cost of a consistent design system; mitigations (named imports, lazy-load
  TextEditor if ever used) are in §5. Install footprint: **26 MB / 218 packages** for the two libs.
- **Its plugin is backend-bound → we DO NOT use it.** `app.use(FrappeUI)` defaults `{resources:true,
  call:true, socketio:true}` → it installs the Frappe RPC/resource layer and **calls `initSocket()`**
  (opens a socket.io connection that will fail/retry against a static origin). **NEVER call
  `app.use(FrappeUI)`** — import components **by name** instead (§2c).
- **The interactive components are first-class — use them.** Dialog, Switch, Dropdown, Combobox,
  Tooltip, Tabs, Toast etc. are the very primitives the studio needs, already a11y-correct and
  Espresso-styled. We use frappe-ui's components directly rather than re-deriving them from the
  underlying headless libs.

**`frappe-ui` renders frontend-only — proven in the sandbox** (`research/sandbox-frappe-ui.png`).
The adoption is a *design + consistency* call backed by a *verified* standalone build.

### 2b. USE matrix
**Standalone-safe?** = renders on a static SPA with no Frappe server. **Decision** is for *this*
project. The default is now **USE the frappe-ui component** (with the Espresso preset + `style.css`,
all wired). The only **AVOID**s are the **backend-bound data layer**, **`app.use(FrappeUI)`**, and
the **echarts-backed chart components** (unless deliberately chosen — see §3).

#### Components — USE these
| Component | Standalone-safe? | Decision |
|---|---|---|
| **Button** | Yes | **USE** `frappe-ui` Button (Configure actions, Compare, Proposition export/print). |
| **Dialog** | Yes (wraps Headless UI Dialog) | **USE** `frappe-ui` Dialog (Configure edit-modals, confirms). |
| **ConfirmDialog / `confirmDialog()`** | Yes (imperative over Dialog) | **USE** frappe-ui's `confirmDialog()` ("Reset to baseline?", "Discard CSV?"). |
| **FormControl** (label+input+error) | Yes | **USE** — the convenience switch over Input/Select/Textarea/Checkbox/Switch; gives consistent Espresso form styling. |
| **Input / TextInput** | Yes | **USE** (Espresso `.form-input` styling comes from the preset). |
| **Select** | Yes (native `<select>` + chevron) | **USE** (tier/profile/scenario pickers). |
| **Textarea / Checkbox / Badge** | Yes | **USE** (Badge = status pills, tier labels; Textarea = notes; Checkbox = objective toggles). |
| **Switch** | Yes (wraps Headless UI Switch) | **USE** (net-of-strike toggles, performance-gating on/off). |
| **Tooltip** | Yes (wraps tippy/floating-ui) | **USE** (chart legends, net-vs-gross explainers, FDV caveats). |
| **Dropdown** | Yes (Headless UI Menu) | **USE** (row actions, "export as…", scenario menu). |
| **Tabs / TabButtons** | Yes | **USE** (Advisors sections, Compare sub-views). |
| **Combobox / Autocomplete / MultiSelect** | Yes (Headless UI Combobox + `fuzzysort`) | **USE** (advisor/tier search-select). |
| **Toast / `toast()`** | Yes (wraps `vue-sonner`) | **USE** frappe-ui's `toast()` ("Saved", "CSV imported", "Copied"). |
| **Card / Divider / Spinner / Progress / Alert / Popover / Breadcrumbs** | Yes mostly presentational | **USE** as the design calls for them. |
| **CommandPalette / Sidebar / GridLayout / app-shell pieces** | Yes | **USE** from the **Frappe UI Starter / Gameplan / Helpdesk** templates for the app shell + navigation (see below). |
| **DatePicker / Calendar** | Yes (uses `dayjs`) | **OPTIONAL** — the only date fields are Configure `tgeDate` + advisor `startDate` (vesting is computed, not picked). Use frappe-ui DatePicker or a native `<input type=date>`; either is fine. |
| **ListView / List** | PARTIAL — built around the **Frappe list/resource model** (selection banners, server pagination) | **AVOID for data tables.** Our tables are fixed/computed → plain `<table>` + Tailwind (Espresso tokens). The ListView's server pagination/selection model assumes a Frappe backend we don't have. |
| **TextEditor** (TipTap 3.11 + ProseMirror, ~35 deps) | Yes technically | **AVOID (not needed).** No rich text in the app; biggest bundle risk. If ever used, **lazy-load** it (§5). |
| **FileUploader** | PARTIAL — handler targets Frappe's `/api/method/upload_file` | **AVOID the handler.** CSV import = `<input type=file>` + `FileReader` + own parser (the upload handler is backend-bound). |
| **Chart components** (AxisChart / DonutChart / ECharts / FunnelChart / NumberChart) | Yes render, but wrap **echarts (~1 MB)** | **AVOID by default — frappe-charts is PRIMARY** (lighter, verified). Noted as an **OPTION** for full design consistency (§3); choosing them adds a second chart engine (~1 MB echarts). |

#### Layout templates — USE these for the app shell / IA
For clean, consistent UI/UX, build the app shell (sidebar/nav, page headers, list+detail layouts,
settings panels) from the **Frappe UI Starter**, **Gameplan**, and **Helpdesk** layout templates
(they are the canonical Espresso layouts). Map the studio's six views (Overview, Advisors, Board,
Compare, Proposition, Configure) onto those layouts; the **IA, labels, and copy still come from the
reference** (§9) — the templates supply the *visual scaffolding*, not the content.

#### Data layer — **ALL backend-bound, OUT OF SCOPE (AVOID)**
`utils/call.js` / `utils/frappeRequest.js` hardcode `POST /api/method/${method}` with headers
`X-Frappe-Site-Name` + `X-Frappe-CSRF-Token`, and unwrap Frappe's `message`/`exc` envelope — none of
which has meaning on a backend-less SPA. Our state is **local over `engine/engine.ts`**.

| API | Standalone-safe? | Reason (→ AVOID) |
|---|---|---|
| `createResource` / `createListResource` / `createDocumentResource` / `createListManager` | No | Built on `frappeRequest` → `/api/method/...` + Frappe headers. |
| `useList` / `useDoc` / `useDoctype` / `useNewDoc` / `useFrappeFetch` | No | Frappe **doctype**/REST concepts + `idb-keyval` caching of Frappe docs. |
| `call` / `createCall` / `frappeRequest` / `request` | No | Hardcodes `/api/method/${method}` + Frappe REST envelope. |
| `initSocket` / `resourcesPlugin` / `FrappeUIProvider` / `Resource.vue` | No | socket.io to a Frappe site + wires the resource layer into the tree. |

These stay out of scope: **no `createResource` / `useList` / `frappeRequest` / `call` / `initSocket`.**

#### Theming / tooling exports (correct paths verified — these are the ones we use)
| Item | Correct path (verified) | Decision |
|---|---|---|
| Tailwind preset | `import frappeUIPreset from 'frappe-ui/tailwind'` (**NOT** `frappe-ui/src/utils/tailwind.config`) | **USE** — it sets the Espresso palette/fonts/radius/shadows. This is the design system. |
| `style.css` | `import 'frappe-ui/style.css'` (**NOT** `frappe-ui/dist/style.css`) | **USE** — `@import`s Inter + emits the preset-keyed base layer. |
| `frappe-ui/vite` plugin | `frappe-ui/vite` | **USE** — required to build (components' source uses `~icons/lucide/*` virtual imports). Run with `frappeProxy:false, jinjaBootData:false, buildConfig:false`. |
| `frappe-ui/icons`, `FeatherIcon` | `frappe-ui/icons` | **USE** frappe-ui's icons for consistency (or Lucide / inline SVG where convenient). |

### 2c. The PRIMARY integration recipe (verified standalone — wired + build-green now)
This is the recipe that **actually builds** (the original brief's did **not** — §11). All four pieces
are required, and **all four are already in `scaffold/`**.

```ts
// vite.config.ts — the frappe-ui Vite plugin is REQUIRED just to build (components' source uses
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
// tailwind.config.js  (ESM — the preset is ESM-only; a .cjs require() fails)
import frappeUIPreset from 'frappe-ui/tailwind'
export default {
  presets: [frappeUIPreset],
  content: ['./index.html', './src/**/*.{vue,js,ts}', './node_modules/frappe-ui/src/**/*.{vue,js,ts}'],
  theme: { extend: { /* optional Raiku brand accents on top of Espresso */ } },
}
```
```ts
// main.ts — import the stylesheet; do NOT app.use(FrappeUI)
import 'frappe-ui/style.css'   // NOT 'frappe-ui/dist/style.css' (also @imports Inter + runs @tailwind)
import './style.css'           // app overrides — imported AFTER frappe-ui so our rules win
// components are named imports:
import { Button, Dialog, FormControl, Badge } from 'frappe-ui'
```

Recipe constraints: pin **`frappe-ui@0.1.278`** exactly (mid-major churn — `0.1.278` is npm `latest`
while `1.0.0-beta.4` shipped the same day on GitHub `main`), Vue **`^3.5`** (its peer floor), lock
**Tailwind v3** (the preset is v3-only), import **only named components**, and **never
`app.use(FrappeUI)`** (it opens socket.io + installs the Frappe RPC/resource layer). `style.css` is
imported **before** the app's own `style.css` so app overrides win. The `frappe-ui/vite` plugin's
`buildConfig:false` keeps our `dist/` output for Vercel.

### 2d. The component stack (the chosen path)
- **UI components:** **`frappe-ui`** — Button, Badge, Input, Select, Textarea, Checkbox, Switch,
  FormControl, Dialog/`confirmDialog()`, Dropdown (Menu), Combobox, Tabs, Tooltip, Toast/`toast()`,
  Card, Divider, Spinner, Popover, Alert — all Espresso-styled, a11y-correct, used directly.
- **App shell / IA:** **Frappe UI Starter / Gameplan / Helpdesk** layout templates (sidebar/nav,
  page headers, list+detail, settings) mapped onto the six studio views.
- **Icons:** `frappe-ui/icons` / `FeatherIcon` (or Lucide / inline SVG where convenient).
- **Charts:** `frappe-charts@1.6.2` (corrected import, §3) + a small **custom-SVG** kit styled with
  Espresso tokens. frappe-ui's own **AxisChart / DonutChart (echarts)** are an **option** for full
  design consistency, but frappe-charts stays **primary** (lighter, verified).
- **Tables:** plain `<table>` + Tailwind on Espresso tokens (not ListView — it's resource-model
  bound).
- **Data:** local `reactive`/Pinia store over the frozen `engine/engine.ts` (frappe-ui data layer is
  out of scope, §2b).

---

## 3. Chart decision table + corrected recipe + wrapper contract

### 3a. Corrected `frappe-charts` recipe
```ts
// Bare import — resolves via the package `module` field to dist/frappe-charts.min.esm.js.
import { Chart } from 'frappe-charts'
// NO css import. frappe-charts 1.6.2 ships ZERO css; the ESM bundle self-injects its styles
// (styleInject). `frappe-charts/dist/frappe-charts.min.css` 404s in 1.6.2 and BREAKS the Vite build.
```
This is exactly what `scaffold/src/components/FrappeChart.vue` already does — keep it.

**Real, usable `frappe-charts@1.6.2` types:** `line`, `bar`, `axis-mixed`, `percentage`, `pie`,
`donut`, `heatmap`. **No** native waterfall, range/floating-bar, stepped/staircase line, or
Gantt/timeline. **`scatter` is NOT implemented** — the string `scatter` does not appear anywhere in
the installed runtime (`dist/frappe-charts.min.esm.js`); the `constants.js` `ALL_CHART_TYPES` entry
is dead and never wired into the public `Chart` dispatch (it only knows `getChartByType` +
`"Undefined chart type"`). This **supersedes the stale "scatter broken / #188" framing** (issue #188
is CLOSED and was never the live tracker the old plan implied — scatter was dropped from the
dispatched API, not "broken").

> **frappe-ui AxisChart/DonutChart as an option.** For full design consistency you *could* use
> frappe-ui's own chart components (AxisChart / DonutChart) for the line/area/percentage families —
> they share the Espresso look. But they wrap **echarts (~1 MB)**, so adopting them adds a **second
> chart engine** alongside frappe-charts. **frappe-charts stays PRIMARY** (lighter, zero-dep,
> verified). Treat the echarts components as an opt-in only where the design demands it.

### 3b. The 10 studio charts
Custom-SVG charts are styled with **frappe-ui / Espresso tokens** (colours, radius, type) so they
read as part of the same design system.

| # | Studio chart (view / issue) | Decision | Why (evidence) | Interactivity / notes |
|---|---|---|---|---|
| 1 | **Valuation / dilution staircase** — Board (COM-26) | **frappe-charts grouped `bar`** (Raiku vs Median per stage) | Reference `ValuationStaircase` is a recharts **grouped bar**, not a step outline. frappe-charts grouped bar is a core competency. *Optional:* a true-step outline as custom SVG only if the editorial design demands it (Robin call — §8.4). | `isNavigable:1` → `data-select` to click a stage; `formatTooltipY` for $; TGE-FDV caption; `colors` = Espresso palette; `role="img"` aria-label. |
| 2 | **Net-vs-gross line** — Advisors/Board | **frappe-charts `line`** (2 datasets) | Core competency; two line datasets, distinct `colors`. | Tooltips via `formatTooltipY` for net-of-strike $; `yMarkers` for a strike/target line. |
| 3 | **Upside curve (line/area)** — Advisors (COM-28) | **frappe-charts `line` + `lineOptions.regionFill:1`** (area), optional `spline:1` | Native area via `regionFill`; spline for smoothing. The "token" sub-chart is the **right half of UpsideCurve**, not a separate component. | Hover tooltip; `$1B` caution band via `yRegions`/`yMarkers`; explicit `height`. |
| 4 | **Comp mix (percentage)** — Advisors/Board (COM-29) | **frappe-charts `percentage`** (or `donut`) | The single 100%-stacked-bar `percentage` chart. Native. | Hover shows `value %`; cap with `maxSlices`/`maxLegendPoints`. Legend truncates on narrow widths (#395/#374) → may need a custom legend on mobile. |
| 5 | **Scenario grouped bar** — Compare (COM-19) | **frappe-charts grouped `bar`** (or `axis-mixed`) | Core competency: N datasets → side-by-side bars (one per scenario). Lives in **Compare**, not Board (mis-map fix). | `data-select` to click a scenario; `formatTooltipY` for $; `colors` = `SCEN_COLORS`. |
| 6 | **Growth waterfall** — Advisors (COM-17 + COM-27) | **Custom SVG** (Espresso-styled) | **No native waterfall.** Faking it with a transparent-base stacked bar makes labels/connectors/sign-colouring fragile. Custom = floating rects + connectors + +/− colouring on the Espresso palette. The single biggest "don't fight the library" call. | Hand-rolled hover/tooltip; Current + Ceiling reference lines; hover-sync with the objectives tri-state list. |
| 7 | **Potential scatter** — Board (COM-26 + COM-27) | **Custom SVG (mandatory)** (Espresso-styled) | **Scatter is a no-op in 1.6.2** (absent from the runtime; coerced to line as a dataset type → renders nothing). Supersedes the stale #188 framing. | Plot `<circle>`s on linear x/y; z = capital bubble; tier colours; click→select; `role="img"`; own `<title>`/tooltip + quadrant labels. |
| 8 | **Football-field ranges** — single-advisor (COM-29) **and** Board per-advisor multi-row (COM-15/26) | **Custom SVG** (Espresso-styled) | Floating min–max range bars = a bar with a non-zero start; frappe-charts bars are zero-anchored and `yRegions` shades full-width bands, not per-category ranges. **Two distinct components share the name** — both must be built. | Per-bar `<title>` or hand-rolled tooltip; base-tick overlay. Low effort, full control. |
| 9 | **Vesting timeline** — Advisors (COM-29) | **Custom SVG** (Espresso-styled) | Gantt-like horizontal timeline (cliff + linear vest, 0–48 mo) with cliff / Bad-Leaver / TGE / today / CoC reference lines. No timeline/Gantt type in frappe-charts (`frappe-gantt` is a separate, out-of-scope lib). Positioned `<rect>`s + tick labels. | Static is fine; carries legal tooltips (CoC "Board discretion", 9-yr/90-day backstop, Bad-Leaver 2-yr). |
| 10 | **DilutionPath mini-chart** — Advisors detail | **Custom SVG / CSS bars** (Espresso-styled) | Reference is a small CSS flex bar chart of base-path retention. **Currently UNOWNED by any COM issue** — flag for scoping (§8). | Static; per-step `<title>`. |
| — | **PotentialStrip / PoolAllocation bars** — Overview/Advisors/Board | **CSS divs (not a chart lib)** | Reference renders these as CSS `<div>` bars; no chart engine needed. | Static. |

**Summary:** `frappe-charts` for #1–5 (line / area / percentage / grouped-bar, incl. the staircase
grouped bar). **Custom SVG** (Espresso-styled) for #6–10 (waterfall, scatter, football-field ×2,
vesting timeline, DilutionPath, and a true-step staircase only if chosen over the bar). The frozen
engine already supplies the coordinates for every custom-SVG chart. frappe-ui's echarts charts are an
opt-in alternative for #1–4 only (§3a) — not the default.

### 3c. Wrapper contract (`FrappeChart.vue`, COM-16) — mandatory
The Vue wrapper around `frappe-charts` **must**:
1. **Create** with `new Chart(el, opts)` and **guard the `undefined` return** (a bad `type` returns
   `undefined`).
2. **Update data only** via `chart.update(plainSnapshot)` on `watch(data)` — pass a **plain
   snapshot** (`toRaw` / `JSON.parse(JSON.stringify(...))`); `update` deep-clones and **mutating
   reactive data in place will NOT update the chart**.
3. **Rebuild** (`destroy()` + `new Chart()`) on **type/colors/option** changes — `update` swaps data
   only.
4. **Add its own `ResizeObserver` → `chart.draw()`.** frappe-charts' internal `ResizeObserver` is
   **commented out**; only `window.resize` is handled, so container-only resizes (sidebar, grid
   reflow) won't refit.
5. **Redraw on route/tab show.** `draw()` early-returns when the parent `isHidden()`, so a chart
   built inside a `display:none` view renders at **0 width**.
6. **`chart.destroy()` in `onBeforeUnmount`** (otherwise `resize`/`orientationchange` listeners
   leak).
7. Give each chart its **own dedicated `<div>`** (construction wipes `parent.innerHTML`), keep
   `showLegend` consistent across updates (#409: a legend-less update can throw), and leave animation
   **off** (no rapid-update race). Export is **SVG-only** (`chart.export()`) — no PNG; for print, SVG
   export + browser print.

The scaffold's `scaffold/src/components/FrappeChart.vue` already implements (1)–(6) — keep and extend
it; do not regress to a CSS import or drop the ResizeObserver.

---

## 4. Version-compatibility matrix + exact pins

Verified against the npm registry + GitHub on 2026-06-08 (Lane C), reconciled with what the sandbox
actually installed (EMPIRICAL). The set below is **internally consistent and builds green this
session** with `frappe-ui` added. frappe-ui's two real constraints — its Vue **`>=3.5`** floor and
its **Tailwind-v3** preset lock — are **honoured** (the scaffold already sits at Vue `^3.5.13` /
Tailwind `^3.4.3`). We stay current within the Vite-5 line.

| Package | Recommended pin | Latest (`dist-tags.latest`) | Sandbox resolved | Notes |
|---|---|---|---|---|
| `vue` | **`^3.5`** | 3.5.35 (`3.6.0-beta`) | 3.5.35 | frappe-ui's `>=3.5.0` peer floor **binds** — Vue must be `^3.5`. 3.5 is backward-compatible with 3.4 app code. (Scaffold already `^3.5.13`.) |
| `vue-router` | **`^4.x`** | 5.1.0 (`5.0.0-beta`) | — | Stay on **v4** (frappe-ui peer is `vue-router ^4.1.6`). Do **NOT** go to vue-router 5. |
| `vite` | **`^5.x`** | 8.0.16 (Rolldown) | 8.0.16 | `npm create vite@latest` now scaffolds **Vite 8 (Rolldown)**; the **real scaffold pins Vite 5 — keep it.** frappe-ui dev-builds on Vite 7 but, as a dep not a peer, doesn't force our major. |
| `@vitejs/plugin-vue` | **`^5.x`** | 6.0.7 | — | plugin-vue **5 ↔ Vite 5**. Do **NOT** jump to 6 unless Vite ≥ 6. |
| `tailwindcss` | **`^3.4`** | 4.3.0 (`4.0.0` next) | 3.4.19 | **STAY on v3.4 — the frappe-ui Espresso preset is v3-only.** v4 drops the JS-preset/`content` model for CSS-first `@theme`, which the preset does not support. |
| `typescript` | **`^5.x`** | 6.0.3 (`6.0.0-beta`) | — | Stay on **5.x**. TS 6 needs vue-tsc 3. |
| `vue-tsc` | **`^2.x`** | 3.3.4 | — | **v2** OK on TS 5.x + Vue 3.5. (TS 6 later ⇒ vue-tsc 3.) |
| `autoprefixer` | `^10.4.19` | 10.5.0 | — | Within v10; keep. |
| `postcss` | `^8.4.38` | 8.5.15 | — | Within v8; keep. |
| `frappe-ui` | **`0.1.278` (exact)** | 0.1.278 (`1.0.0-beta.4` on GitHub) | 0.1.278 | **Pin EXACT `0.1.278`** (npm `latest`; `1.0.0-beta.4` shipped the same day on GitHub `main` — mid-major churn). MIT. Requires the §2c recipe (Vite plugin + ESM preset + `style.css`). Now a **real dependency**. |
| `frappe-charts` | **`1.6.2` (exact)** | 1.6.2 (`2.0.0-rc27` next) | 1.6.2 | **Pin EXACT.** `^1.6.2` already resolves to 1.6.2 (no 1.6.3 on npm; only `2.0.0-rc`s above), but pin exact to dodge the missing-CSS variance between 1.6.x publishes. MIT, zero deps, framework-agnostic. |

### Recommended exact pins (frontend-only, frappe-ui adopted)
```jsonc
{
  "dependencies": {
    "vue": "^3.5",            // frappe-ui peer floor >=3.5 binds
    "vue-router": "^4.3.0",   // keep on v4 — do NOT go to 5.x
    "frappe-ui": "0.1.278",   // pin EXACT; recipe in §2c (Vite plugin + ESM preset + style.css)
    "frappe-charts": "1.6.2"  // pin EXACT (MIT, zero deps); corrected import (see §3)
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",  // pairs with Vite 5
    "vite": "^5.2.10",               // stay on the Vite 5 line; do NOT jump to 6/7/8
    "tailwindcss": "^3.4.3",         // STAY on v3 — the Espresso preset is v3-only
    "typescript": "^5.4.5",          // stay on 5.x (TS 6 needs vue-tsc 3)
    "vue-tsc": "^2.0.13",            // v2 OK on TS 5.x + Vue 3.5
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38"
  }
}
```
The committed `scaffold/package.json` already matches this (Vue `^3.5.13`, vue-router `^4.3.0`,
**`frappe-ui` `0.1.278`**, frappe-charts `1.6.2`, Vite `^5.2.10`, plugin-vue `^5.0.4`, Tailwind
`^3.4.3`, TS `^5.4.5`, vue-tsc `^2.0.13`) — do not regress it.

---

## 5. Bundle / perf notes — the accepted cost

- **frappe-ui is the accepted cost of a consistent design system.** A production `vite build`
  importing only Button/Badge/FormControl/Dialog:

  | asset | raw | gzip |
  |---|---|---|
  | `index.js` | 510 KB | ~148 KB |
  | `index.css` | 174 KB | ~21 KB |
  | `Inter.var` + `Inter-Italic.var` (woff2) | 561 KB | — (from `frappe-ui/style.css`) |

  i.e. **~148 KB gz JS** (once components are imported) **+ ~21 KB gz CSS + 561 KB Inter** + the
  Espresso base layer. We accept this in exchange for a coherent, a11y-correct, template-backed UI.
- **Mitigations (apply these):**
  - **Named imports only** — `import { Button, Dialog } from 'frappe-ui'` (never the whole barrel via
    `app.use`). Tree-shaking **drops** echarts / socket.io / vue-sonner / fuzzysort when unused
    (grep = 0 in the bundle).
  - **Lazy-load `TextEditor`** *if it is ever used* — it is the biggest chunk (TipTap/ProseMirror,
    ~35 deps) and emits async chunks (`FontColor`, `InsertIframe`). Default: don't use it (§2b).
  - **Don't add a second chart engine casually** — frappe-charts is zero-dep; frappe-ui's echarts
    charts add ~1 MB (§3a). Use them only where the design demands.
  - The core still drags **reka-ui + @vueuse** transitively — unavoidable with frappe-ui; accepted.
- **`frappe-charts` stays light.** MIT, **zero-dependency**, framework-agnostic vanilla SVG, with
  self-injecting styles (no CSS asset to ship).
- **Chart perf hygiene:** animation off (set in the wrapper); `update()` for data swaps, full rebuild
  only on type/colour change; one `<div>` per chart; redraw on show to avoid 0-width re-layout
  thrash.

---

## 6. Integration recipe (canonical) — wired + build-green

The §2c recipe is **the** way the app is built and is already committed to `scaffold/`. Restated here
as the canonical reference for the build agents:

1. **`vite.config.ts`** — `frappeui({ frappeProxy:false, jinjaBootData:false, buildConfig:false })`
   **before** `vue()`, plus `optimizeDeps:{ include:['feather-icons'] }` and `build:{ outDir:'dist'
   }`. The plugin is required (lucide `~icons/*` virtual imports); `buildConfig:false` keeps our
   `dist/` for Vercel.
2. **`tailwind.config.js`** (ESM) — `presets:[frappeUIPreset]` from `frappe-ui/tailwind`, `content`
   globbing `./index.html`, `./src/**/*`, **and** `./node_modules/frappe-ui/src/**/*` (frappe-ui ships
   raw source, so its classes must be scanned). Raiku brand accents go in `theme.extend`.
3. **`main.ts`** — `import 'frappe-ui/style.css'` (Inter + Espresso base), then `import './style.css'`
   (app overrides win). Import components **by name**. **Never `app.use(FrappeUI)`.**
4. **Pins** — `frappe-ui@0.1.278` exact, Vue `^3.5`, Tailwind `^3.4` (v3), Vite `^5` (§4).

**Already done this session (guard against regression):** frappe-ui installed + pinned exact;
`tailwind.config.js` is the ESM preset config; `vite.config.ts` runs the frappeui plugin +
optimizeDeps; `main.ts` imports `frappe-ui/style.css`; `style.css` de-duped; stale
`tailwind.config.cjs` removed; engine **22/22**. **Not yet done (build agents' job):** convert
`Overview.vue` / `App.vue` (and the other views) to frappe-ui components + the Starter/Gameplan/
Helpdesk layout templates (COM-14 / COM-17 / etc.).

---

## 7. Fallback decisions (every fallback in one place)

| Need | Primary | Notes / fallback |
|---|---|---|
| **Whole UI kit** | **`frappe-ui`** components + Espresso preset + Starter/Gameplan/Helpdesk templates | accepted tradeoff: Inter/Espresso replaces Fraunces/IBM-Plex; brand accents via `theme.extend` |
| **Dialog / modal** | `frappe-ui` Dialog | `confirmDialog()` for confirms |
| **Dropdown / menu** | `frappe-ui` Dropdown | — |
| **Switch / toggle** | `frappe-ui` Switch | — |
| **Tabs** | `frappe-ui` Tabs | `v-if` + button row if a bespoke layout needs it |
| **Combobox / search-select** | `frappe-ui` Combobox / Autocomplete | — |
| **Tooltip / positioning** | `frappe-ui` Tooltip | — |
| **Toast** | `frappe-ui` `toast()` | — |
| **Button/Badge/Input/Select/Textarea/Checkbox/Card/Divider/Spinner/FormControl** | `frappe-ui` components | — |
| **App shell / nav / layouts** | Frappe UI Starter / Gameplan / Helpdesk templates | IA + copy from the reference (§9) |
| **Icons** | `frappe-ui/icons` / `FeatherIcon` | Lucide (`lucide-vue-next`) or inline SVG |
| **Charts: line / area / percentage / grouped-bar / staircase** | `frappe-charts@1.6.2` | frappe-ui AxisChart/DonutChart (echarts) optional for design consistency (§3a) |
| **Charts: waterfall / scatter / football-field ×2 / vesting / DilutionPath / true-step staircase** | **custom SVG** (Espresso-styled; engine supplies coords) | — |
| **Staircase rendering** | grouped bar (free tooltips + `data-select`) | true-step custom SVG **iff** editorial design wants it (Robin call, §8.4) |
| **PotentialStrip / PoolAllocation** | CSS `<div>` bars | — |
| **Tables (Board, Compare)** | plain `<table>` + Tailwind (Espresso tokens) | **not** ListView (resource-model bound) |
| **CSV import** | `<input type=file>` + `FileReader` + own parser | (frappe-ui FileUploader handler is backend-bound — avoid) |
| **Chart export / print** | `chart.export()` (SVG) + browser print | no PNG path in 1.6.2 |
| **Persistence** | local `reactive`/Pinia store → `localStorage` | optional later Frappe REST backend (no UI change) |
| **Data fetching** | local store over frozen `engine/engine.ts` | frappe-ui `createResource`/`useList`/`call`/`initSocket` **out of scope** (§2b) |
| **Local dev runner** | `vp` (Vite+) for `dev`/`check`/`build`/`test` | committed scripts stay plain `vite` (Vercel/CI never need `vp`) |
| **TS 6 / vue-tsc 3 / Vite 6+ / Tailwind v4 / vue-router 5** | **do not adopt now** | revisit post-v1; Tailwind v4 in particular breaks the Espresso preset |

---

## 8. Open product decisions & engineering correctness to fold into M0/M1

These come from the feature-inventory gap analysis (`research/D-feature-inventory.md`). They are
**not** technical-stack questions — they are scope/ownership calls that will bite at build time if
not settled. **The 5 open product decisions below remain OPEN — keep them flagged; do not invent
answers.** Surfaced here so they land in the right COM issues.

**Robin's product calls (OPEN):**
1. **Named multi-board persistence (`Mgr`).** The reference has a whole subsystem — save many named
   boards, switch/load/delete, via an `io` layer storing a `{scenarios, last}` map. **No COM issue
   owns it.** Decision: **port it as a new M0/M1 issue (COM-32), or descope to single-state for
   v1?** *(OPEN)*
2. **localStorage schema collision (COM-11 must reconcile).** Key `'raiku-advisor-comp-v5'` is shared,
   but the **reference stores `{scenarios, last}`** while the **scaffold stores raw `State`** — these
   are **incompatible under the same key.** Decision: adopt the reference's `{scenarios,last}` wrapper
   (implies #1) or formalise the scaffold's raw-state shape (implies descope of #1)? **COM-11 must
   reconcile the schema regardless.** *(OPEN)*
3. **Share mechanism.** The reference shares via **clipboard Copy/Paste** (`io.copy` /
   `clipboard.readText` → `LOAD`); the `#s=` base64 URL-hash is a **scaffold-only enhancement**, not
   reference parity. Decision: keep both, or scope COM-11 to clipboard-only (the actual reference
   behaviour) and treat URL-hash as a stretch? *(OPEN)*
4. **Valuation staircase rendering.** Settled as a **grouped bar** (free frappe-charts tooltips +
   `data-select`). Decision: accept the bar, **or** spend custom-SVG effort on a true-step outline if
   the editorial design wants the stepped look? *(OPEN)*
5. **Section numbering.** The reference contradicts itself — two components both claim "Section I"
   (Overview and Package), and eyebrow numerals disagree with the nav (I–VI). Decision: adopt the nav
   order (I Overview … VI Configure) and fix the eyebrows? Unowned by any COM issue. *(OPEN)*

**Engineering correctness (not Robin calls, but currently under-specified — make explicit in M1
issue text):**
- **Reducer DELETE cascades** must be explicit: `DEL_MS` reassigns `currentStage` /
  `capitalUplift.gate` / objective gates; `DEL_ROUND` fixes `tgeAnchor` + advisor `grantRound`→bridge;
  `DEL_TIER` clamps `advisor.tier`; `DEL_OBJ` scrubs `achieved`/`targeted` refs across advisors.
  Skipping any of these **corrupts state**.
- **Unowned items needing an owner:** **DilutionPath** mini-chart, **board-summary CSV export**
  (distinct from the roadmap CSV), **paste-state**, header **budget/storage Banners**, and the
  **NumIn / DField** inline numeric-editor primitives — these are **load-bearing** (every Configure +
  Package number depends on them). *(Build these with frappe-ui inputs where applicable, but the
  inline-editor behaviour is bespoke.)*
- **Legal-caveat corpus must port verbatim** (acceptance-criteria, not paraphrase): *net-of-strike*;
  *"discussion draft / not a binding offer"*; *non-voting shares*; *RTA*; *deed of adherence*; *net
  exercise*; *CoC at Board discretion*; *UK s431 / US 409A by residency*; *HMRC SAV*; *9-yr / 90-day
  exercise window*; *"subject to required investor consents"*; *Bad-Leaver 2-yr*. **Benchmark source
  strings** likewise port verbatim (Carta State of Pre-Seed 2025 / ValueAdd VC; Memento Research /
  The Defiant / MEXC; Founder Institute FAST ~5% pool).

---

## 9. Non-negotiables (preserved across every Phase-0 doc)

- **`engine/engine.ts` is frozen** — 22/22 tests pass; **type-only** tweaks allowed, no logic
  changes.
- **`reference/advisor-comp-studio.tsx` is the UX source of truth** (1529 lines) for
  **behaviour, copy, IA, caveats, and the legal corpus.** The **visual** design is now **Espresso/
  Inter** (not Fraunces/IBM-Plex), but **features, labels, and caveats still match the reference.**
- **Internal & confidential** framing throughout; every equity figure is **net of strike**; the
  output is a **discussion draft, not a binding offer**.
- **≤ 450 LOC per Linear (COM-*) issue** — split the issue if larger. One issue = one PR linking its
  issue; tests ship with the code; QA gate green before merge to `main`.
- **Milestone staging M0 → M5.**
- **The frappe-ui Skill is available** — build agents should invoke it for frappe-ui UI/component
  work. The build harness also provides a project `CLAUDE.md` (rules/context, loaded each session),
  a running `memory.md` (append progress + decisions each session — "record to local memory.md"),
  `.claude/settings.json` (permission rails), `.gitignore`, and a `THIRD-PARTY-NOTICES` (frappe-ui +
  frappe-charts MIT). Repo: https://github.com/nordnes/comp-studio (origin/main).

---

## 10. Decision log

| # | Decision | Rationale | Source |
|---|---|---|---|
| D1 | **Frontend-only static SPA on Vercel** | Frappe backend is a stateful Python+MariaDB+Redis+Socket.IO+worker monolith under `bench`; Vercel runs static assets + stateless functions, not a stateful always-on monolith. The blocker is topology, not language; the view libs compile to static assets. | C; sandbox |
| D2 | **ADOPT frappe-ui as-is (Espresso/Inter)** — *post-gate (2026-06-08), supersedes the Phase-0 reject* | A consistent, a11y-correct, template-backed design system (Espresso preset + components + Starter/Gameplan/Helpdesk) outweighs the bespoke editorial look. Renders frontend-only (proven). Accepted tradeoff: Inter/Espresso replaces Fraunces/IBM-Plex. | A; EMPIRICAL; Robin |
| D3 | **Build the UI with frappe-ui components + templates**; custom SVG only for charts frappe-charts lacks | The components are the primitives the studio needs, Espresso-styled and a11y-correct; the templates give a coherent app shell. | A; D; EMPIRICAL; Robin |
| D4 | **Keep `frappe-charts@1.6.2` (pin exact)** as PRIMARY chart engine | MIT, zero-dep, framework-agnostic; covers line/area/percentage/grouped-bar cleanly; renders standalone. frappe-ui echarts charts are an option, not the default (heavier). | B; C; EMPIRICAL |
| D5 | **Corrected charts import**: bare `import { Chart } from 'frappe-charts'`, **no CSS import** | `dist/frappe-charts.min.css` 404s in 1.6.2; ESM self-injects styles. The old CSS line breaks the build. | B; C; EMPIRICAL |
| D6 | **Staircase = frappe-charts grouped bar** (Raiku vs Median), NOT custom SVG | Reference `ValuationStaircase` is a recharts grouped bar; the old "staircase = custom SVG" note conflated it with the waterfall. | D; B |
| D7 | **Scatter = custom SVG (mandatory)** | Scatter is a no-op in 1.6.2 — absent from the runtime; coerced to line as a dataset type. Supersedes the stale #188 framing. | EMPIRICAL; B |
| D8 | **Custom SVG (Espresso-styled) for waterfall, football-field (×2), vesting timeline** (+ DilutionPath, true-step staircase if chosen) | No native waterfall / range bar / stepped line / Gantt in frappe-charts; faking them is fragile. Engine supplies coordinates. | B; C; D |
| D9 | **Chart wrapper: ResizeObserver→draw(), redraw-on-route/tab-show, destroy() on unmount; update() swaps data only; rebuild on type/colour** | Internal `ResizeObserver` is commented out; `draw()` early-returns when hidden (0-width); listeners leak without `destroy()`; `update()` deep-clones and ignores in-place mutation. | B; EMPIRICAL |
| D10 | **Pins: frappe-ui `0.1.278` (exact), vue `^3.5`, vue-router `^4.x`, vite `^5.x`, plugin-vue `^5.x`, tailwindcss `^3.4`, typescript `^5.x`, vue-tsc `^2.x`, frappe-charts `1.6.2`** | frappe-ui's `>=3.5` Vue floor + v3 Tailwind preset lock **bind**; Vite-5 line is current-but-stable; vue-router 5 / TS 6 / Vite 6+ are unneeded churn. | C; EMPIRICAL |
| D11 | **Tailwind stays v3.4 (NOT v4)** | The frappe-ui Espresso preset is v3-only; v4 removes the JS-preset/`content` model for CSS-first `@theme`. | C; EMPIRICAL |
| D12 | **`vp` (Vite+) = local dev only, never build/deploy** | Alpha; committed scripts stay plain `vite`; Vercel builds `npm run build` → `dist`. | C |
| D13 | **Licensing clear: frappe-ui / frappe-charts / Frappe = MIT; ERPNext GPLv3 (unused)** | Permissive; ship a `THIRD-PARTY-NOTICES` with the frappe-ui + frappe-charts MIT notices. | C |
| D14 | **frappe-ui data layer out of scope** | `createResource/.../initSocket/frappeRequest/call` hardcode `/api/method/...` + Frappe headers + socket.io; our state is local over `engine/engine.ts`. **Never `app.use(FrappeUI)`.** | A; C; EMPIRICAL |
| D15 | **Engine frozen; reference is UX truth (behaviour/copy/IA/legal); preserve internal/confidential + net-of-strike + "discussion draft, not a binding offer"** | Non-negotiables; legal corpus ports verbatim; only the visual design moves to Espresso. | _CONTEXT; D; Robin |
| D16 | **Fold in feature-inventory gaps** (`Mgr`=COM-32, localStorage collision, clipboard vs URL-hash, DELETE cascades, DilutionPath / board-CSV / paste-state, legal corpus, NumIn/DField) | Plan graded ~85% complete; these bite at build time if unscoped. The 5 product decisions stay OPEN. See §8. | D; Robin |

---

## 11. Corrections preserved from the previous brief (what NOT to do)

The original "use `frappe-ui`" brief reached the same **adopt** conclusion we hold now, but its
**import paths and setup were wrong** — they do **not** build. Those corrections are still valid and
are preserved here as "what NOT to do," so reviewers can verify the broken forms never creep back in.
The §2c/§6 recipe is the **correct** form.

| # | Old (wrong) form — **do NOT use** | Correct (verified — §2c/§6) |
|---|---|---|
| 1 | `import 'frappe-ui/dist/style.css'` | frappe-ui ships **no `dist/`**; correct stylesheet is **`frappe-ui/style.css`** (`@import`s Inter + runs `@tailwind` with the Espresso preset). |
| 2 | `app.use(FrappeUI)` in `main.ts` | **Never** — it's backend-bound (defaults `socketio:true` → `initSocket()` opens a socket.io connection; installs the Frappe RPC/resource layer). **Import components by name** instead. |
| 3 | Tailwind preset via `require('frappe-ui/src/utils/tailwind.config')` | Deprecated shim, not in `exports`, ESM-only. Correct: **`import frappeUIPreset from 'frappe-ui/tailwind'`** in an **ESM** `tailwind.config.js`. |
| 4 | (missing) the `frappe-ui/vite` plugin | **Required** to build — frappe-ui's source uses `~icons/lucide/*` virtual imports. Use `frappeui({ frappeProxy:false, jinjaBootData:false, buildConfig:false })` + `optimizeDeps:{ include:['feather-icons'] }`. |
| 5 | `import 'frappe-charts/dist/frappe-charts.min.css'` (and "include its `.min.css`") | **No such file in 1.6.2** — it 404s and **breaks the Vite build.** frappe-charts ships **zero CSS**; styles **self-inject**. Use bare `import { Chart } from 'frappe-charts'`, **no CSS import.** |
| 6 | **"Scatter is broken (frappe/charts #188)."** | Scatter is **not implemented** in 1.6.2 — absent from the runtime entirely; #188 is **CLOSED** and was never the live tracker. Scatter → **custom SVG**. |
| 7 | "Valuation staircase → `bar`; custom SVG for true steps" (treated as a step chart). | The reference staircase **is** a grouped bar (Raiku vs median) — use frappe-charts grouped `bar`; a true-step SVG is optional only if the editorial design wants it. (§3b #1) |
| 8 | "Vue **3 only**" with no floor; install via `npm create vite@latest`. | frappe-ui's peer floor is **`>=3.5`** — pin **`vue ^3.5`** (binds). `npm create vite@latest` now scaffolds **Vite 8 (Rolldown)**; the scaffold deliberately **pins Vite 5** — keep it. (§4) |

---

## 12. Sources

- **Reconciled evidence:** `research/FINDINGS.md` (fuses Lanes A–D + sandbox), `research/EMPIRICAL.md`
  (live sandbox ground truth, 2026-06-08), `research/sandbox-frappe-ui.png` (standalone render proof).
- **Lane docs:** `research/A-frappe-ui.md`, `research/B-frappe-charts.md`, `research/C-ecosystem.md`,
  `research/D-feature-inventory.md`, `research/_CONTEXT.md`.
- **Repo artifacts (re-wired + build-green this session):** `scaffold/` (`package.json`,
  `vercel.json`, `vite.config.ts`, `tailwind.config.js`, `src/main.ts`, `src/views/Overview.vue`,
  `src/components/FrappeChart.vue`), `reference/advisor-comp-studio.tsx` (UX source of truth),
  `engine/engine.ts` + `engine/engine.test.mjs` (frozen, 22/22).
- **External (verified 2026-06-08):** npm registry for `frappe-ui` (0.1.278) / `frappe-charts` (1.6.2,
  MIT, zero deps, no `dist` CSS) and the toolchain pins; GitHub `frappe/frappe-ui` (peerDeps `vue
  >=3.5.0` / `vue-router ^4.1.6`, `tailwind/preset.js`, `tailwind/plugin.js`, `utils/plugin.js`,
  `utils/call.js`/`frappeRequest.js`), `frappe/charts` (`src/js/chart.js` dispatch, `constants.js`,
  `LICENSE`; issue #188 CLOSED), `frappe/frappe` LICENSE (MIT); `frappe.io/charts/docs` (documented
  types — no scatter). Frappe UI Starter / Gameplan / Helpdesk are the canonical Espresso layout
  templates referenced for the app shell.
