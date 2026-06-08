# FINDINGS — Advisor Comp Studio, Phase-0 plan-hardening (reconciled evidence)

---

## ⚑ POST-GATE DECISION UPDATE (2026-06-08)

> **Robin reviewed the Phase-0 recommendation and the two screenshots and chose to ADOPT `frappe-ui`
> as-is (Espresso / Inter)** for clean, consistent UI/UX via the **Frappe UI Starter / Gameplan /
> Helpdesk layout templates**. **This SUPERSEDES decisions D2 (do NOT adopt `frappe-ui`) and D3
> (build UI hand-rolled).** The accepted design tradeoff: Inter/Espresso **replaces** the bespoke
> Fraunces/IBM-Plex editorial look (optional Raiku brand accents via `theme.extend` tokens /
> CSS-variable overrides — light, not a fight).
>
> **The rest of this document remains valid and is now the ADOPTION GUIDE, not a rejection.** It is the
> honest audit trail — `frappe-ui` was evaluated, recommended against, and then adopted by leadership
> with eyes open. Read it as follows:
> - **§2 (use/avoid matrix)** → now a **"use" matrix**: import the listed `frappe-ui` components by name.
> - **§6 + §7 (corrected integration recipe)** → the **primary integration path**, now **wired into
>   `scaffold/` and BUILD-GREEN this session** (`frappeui({ frappeProxy:false, jinjaBootData:false,
>   buildConfig:false })` + `optimizeDeps:{include:['feather-icons']}`; ESM `tailwind.config.js` with
>   `import frappeUIPreset from 'frappe-ui/tailwind'`; `import 'frappe-ui/style.css'`; **named** component
>   imports; **NEVER `app.use(FrappeUI)`** — it opens socket.io + installs the Frappe RPC/resource layer).
> - **§4 (version matrix) + §5 (licensing)** → unchanged and binding: **`frappe-ui` 0.1.278 pinned exact**,
>   **`frappe-charts` 1.6.2 exact**, Vue `^3.5`, Tailwind `^3.4` (preset is v3-only — NOT v4); all MIT.
> - **§3 + §6 (chart decisions)** → unchanged: **`frappe-charts` 1.6.2 stays PRIMARY** (+ custom SVG for
>   waterfall / scatter / football-field / vesting / DilutionPath). `frappe-ui`'s own AxisChart/DonutChart
>   (echarts ~1MB) noted as an OPTION for full design consistency only.
>
> **Accepted cost** (eyes open): ~148 KB gz JS + 561 KB Inter fonts + Espresso CSS — the price of clean,
> consistent UI/UX via Frappe templates, prioritised over bundle weight and the editorial design.
>
> **The original Phase-0 analysis below is NOT deleted** — the "reject" framing in §1/§7 and D2/D3 is
> preserved deliberately as the evaluation record. The `frappe-ui` data layer
> (`createResource`/`useList`/`frappeRequest`/`call`/`initSocket`, §2b) stays **OUT OF SCOPE**; state is
> local over the frozen engine. The 5 OPEN PRODUCT DECISIONS in §9 remain **open** (do not invent answers).
> New decisions logged as **D17 / D18** in §8.

---

> **Status: settled.** This is the single reconciled evidence document for the Advisory Board
> Compensation Studio. It fuses the four research lanes (A frappe-ui, B frappe-charts, C ecosystem/
> licensing, D feature-inventory) with the orchestrator's **live sandbox** (`research/EMPIRICAL.md`,
> run 2026-06-08). Where any lane disagreed with the sandbox, **the sandbox wins** and the
> disagreement is logged. The decisions below are locked; downstream M0->M5 issue docs build on them.
>
> Source files: `research/_CONTEXT.md`, `research/A-frappe-ui.md`, `research/B-frappe-charts.md`,
> `research/C-ecosystem.md`, `research/D-feature-inventory.md`, `research/EMPIRICAL.md`,
> `research/sandbox-frappe-ui.png`.

---

## 1. CENTRAL VERDICT

**Frontend-only on Vercel is confirmed and unavoidable, and we will NOT adopt `frappe-ui`.** Frappe
Framework's backend is a stateful Python(Gunicorn)+MariaDB+Redis+Node-Socket.IO+background-worker
monolith run under `bench` — Vercel hosts static assets and stateless functions and cannot run it — but
`frappe-charts` (and any headless-UI primitives) compile to static JS/CSS and deploy fine, so the split
is clean: take the *view* libraries, leave the *server*. We reject `frappe-ui` because adopting it is
all-or-nothing theming that destroys the studio's Fraunces/IBM-Plex warm-paper editorial design (its
preset forcibly replaces `theme.colors`, forces Inter via `InterVar`/`cv11`/`opsz`, and resets
`fontSize`/`borderRadius`/`boxShadow`), it ships as raw TS/Vue source with no `dist/`, it needs a fiddly
corrected recipe just to build (its Vite plugin is *required* even standalone), and a 4-component import
already costs ~148 KB gz JS + 174 KB CSS + 561 KB Inter fonts while dragging reka-ui/@vueuse/TipTap —
all to obtain interactive primitives that are thin wrappers over `@headlessui/vue`/`@floating-ui/vue` we
can use directly. **Charts:** keep `frappe-charts@1.6.2` (MIT) for the line/area/percentage/grouped-bar
families (including the valuation **staircase**, which is a grouped bar, not custom SVG), and hand-roll
small **custom SVG** for waterfall, scatter (frappe-charts scatter is *not implemented* in 1.6.2),
football-field ranges, and the vesting timeline. Build the UI hand-rolled with Tailwind exactly as the
already-working `scaffold/src/views/Overview.vue` does, reaching for `@headlessui/vue` (+ optionally
`@floating-ui/vue`) only where real interaction is needed. **frappe-ui DOES render standalone (proven in
the sandbox)** — so its corrected recipe is documented in section 7 as a **reversible on-ramp**, not the
chosen path.

---

## 2. frappe-ui USE / AVOID MATRIX

Legend — **Standalone-safe?** = renders on a static SPA with no Frappe server. **Decision** is for *this*
project. Across the board the recommendation is *reproduce / use the headless lib directly* rather than
import from frappe-ui, because importing any styled frappe-ui component drags its preset (semantic
tokens `bg-surface-gray-2`, `text-ink-gray-8`, `border-outline-gray-3`, ...) and, via the barrel + raw
source, risks pulling transitive weight. Source: Lane A section 4 (tarball `0.1.278` unpacked), confirmed
by EMPIRICAL.

### 2a. Components

| Component | Standalone-safe? | Where it'd fit in the 6 views | Decision & fallback |
|---|---|---|---|
| **Button** | Yes (plain `<button>` + classes) | Everywhere (Configure actions, Compare, Proposition export/print) | **Reproduce** (~30-line SFC on our Tailwind tokens). Importing drags the preset for `bg-surface-*`/`ink-*`. |
| **Dialog** | Yes (wraps `@headlessui/vue` Dialog) | Configure edit-modals (round/tier/objective), confirm destructive actions | **Use `@headlessui/vue` Dialog directly** (frappe-ui's own dep). Same a11y, our styling. |
| **ConfirmDialog / `confirmDialog()` / `dialog`** | Yes (imperative over Dialog) | "Reset to baseline?", "Discard CSV?" | Hand-roll over Headless UI Dialog; trivial. |
| **FormControl** (label+input+error switch) | Yes | Configure forms (rounds, scenarios, tiers, milestones, pools) | **Reproduce** — convenience switch over Input/Select/Textarea/Checkbox/Switch; own version = consistent editorial form styling. |
| **Input / TextInput** | Yes | All numeric/text fields in Configure | **Reproduce** (`<input>` + our classes). Preset's `.form-input` is what styles frappe-ui's — not free. |
| **Select** | Yes (native `<select>` + chevron from preset) | Tier/profile/scenario pickers | **Reproduce** / styled native `<select>`. |
| **Textarea** | Yes | Notes / objective descriptions | Reproduce. |
| **Checkbox** | Yes | Toggle objectives, gating flags | Reproduce. |
| **Switch** | Yes (wraps Headless UI Switch) | Net-of-strike toggles, performance gating on/off | **`@headlessui/vue` Switch** fallback. |
| **Badge** | Yes (presentational) | Status pills ("draft", tier labels), Board table tags | **Reproduce** (~10-line span). |
| **Tooltip** | Yes (wraps tippy.js / floating-ui) | Chart legends, net-vs-gross explainers, FDV caveats | **`@floating-ui/vue`** (or tiny tippy wrapper) fallback. |
| **Dropdown** | Yes (Headless UI Menu + floating-ui) | Row actions, "export as...", scenario menu | **`@headlessui/vue` Menu** fallback. |
| **Tabs / TabButtons** | Yes | Advisors view sections; Compare sub-views | **`@headlessui/vue` TabGroup** fallback, or `v-if` + button row. |
| **Avatar** | Yes | Advisor identity (if shown) | Reproduce (img/initials). Low value. |
| **Combobox / Autocomplete / MultiSelect** | Yes (Headless UI Combobox + `fuzzysort`) | Advisor/tier search-select, objective multi-pick (if needed) | **`@headlessui/vue` Combobox** fallback. Importing from frappe-ui pulls `fuzzysort`. |
| **Toast / `toast()` / ToastProvider** | Yes (wraps `vue-sonner`) | "Saved", "CSV imported", "Copied" | **`vue-sonner` directly** (or ~40-line custom). frappe-ui's `toast` drags vue-sonner regardless. |
| **DatePicker / Calendar / Month/TimePicker** | Yes (uses `dayjs`) | **Low/none** — vesting is computed, not picked | Skip; native `<input type=date>` if a date field appears (only Configure `tgeDate`, advisor `startDate`). |
| **ListView / List + List\*** | PARTIAL — renders, but built around the **Frappe list/resource model** (selection banners, server pagination) | Board table, Compare matrix | **AVOID.** Our tables are fixed/computed — plain `<table>` + Tailwind (as Overview already does) is lighter and on-brand. |
| **TextEditor** (TipTap 3.11 + ProseMirror, ~35 deps) | Yes technically | **None** — no rich text | **AVOID.** Biggest bundle risk; sandbox still emitted TipTap async chunks (`FontColor`, `InsertIframe`) even when unused. |
| **Tree** | Yes | None | Skip. |
| **FileUploader** | PARTIAL — renders, but `FileUploadHandler`/`useFileUpload` target Frappe's `/api/method/upload_file` | CSV import (roadmap) | **AVOID the handler.** Use `<input type=file>` + `FileReader` + own parser. |
| **Chart components: AxisChart / DonutChart / ECharts / FunnelChart / NumberChart** | Yes render, but wrap **echarts** (~1 MB) | The 9 studio charts | **AVOID — wrong stack.** We use `frappe-charts` + custom SVG; importing these adds a *second* engine. |
| **Breadcrumbs, Card, Divider, Spinner/LoadingIndicator, Progress, Alert, Popover, CommandPalette, Sidebar, GridLayout, ...** | Yes mostly presentational | Misc (Card/Divider/Spinner could appear) | Reproduce the 2-3 we want (Card, Spinner, Divider) in a few lines. App-shell ones (CommandPalette/Sidebar/GridLayout) not needed. |

### 2b. Data layer — **ALL backend-bound, OUT OF SCOPE (confirmed)**

`utils/call.js` / `utils/frappeRequest.js` hardcode `POST /api/method/${method}` with headers
`X-Frappe-Site-Name: window.location.hostname` + `X-Frappe-CSRF-Token: window.csrf_token`; `frappeRequest`
unwraps Frappe's `message`/`exc` envelope. None of this has any meaning on a backend-less SPA. Our state
is local (a `reactive`/Pinia store over `engine/engine.ts`). Confirmed by Lanes A & C.

| API | Standalone-safe? | Reason |
|---|---|---|
| `createResource` / `createListResource` / `createDocumentResource` / `createListManager` | No | Built on `frappeRequest` -> `/api/method/...` + Frappe headers. |
| `useList` / `useDoc` / `useDoctype` / `useNewDoc` / `useFrappeFetch` | No | Frappe **doctype**/REST concepts + `idb-keyval` caching of Frappe docs. |
| `call` / `createCall` | No | Hardcodes `/api/method/${method}` + Frappe headers. |
| `frappeRequest` / `request` | No | Frappe REST envelope. |
| `initSocket` / `resourcesPlugin` / `FrappeUIProvider` / `Resource.vue` | No | socket.io to a Frappe site + wires the resource layer into the tree. |

### 2c. Theming / tooling exports

| Item | Standalone-safe? | Correct path (verified) | Decision |
|---|---|---|---|
| Tailwind preset | Yes (invasive by design) | `import frappeUIPreset from 'frappe-ui/tailwind'` (NOT `frappe-ui/src/utils/tailwind.config`) | **USE (ADOPTED)** — it sets the Espresso palette/fonts/radius/shadows; this IS the design system now (section 7 detail = adoption guide). *(Audit trail: Phase-0 read AVOID.)* |
| `style.css` | Yes | `import 'frappe-ui/style.css'` (NOT `dist/style.css`) | **USE (ADOPTED)** — `@import`s Inter + emits the preset-keyed base layer; components render unstyled without it. *(Audit trail: Phase-0 read AVOID.)* |
| `frappe-ui/vite` plugin | Yes | `frappe-ui/vite` | **USE (ADOPTED)** — required to build (source uses `~icons/lucide/*` virtual imports). Run `frappeProxy:false, jinjaBootData:false, buildConfig:false`. |
| `frappe-ui/icons`, `FeatherIcon`, Lucide plugin | Yes | `frappe-ui/icons` | **USE** frappe-ui's icons for consistency (or Lucide standalone / inline SVG where convenient). |
| `useShortcut`, `usePageMeta`, `debounce`, `fileSize`, `dayjs` re-export | Yes (backend-free helpers) | named from `frappe-ui` | Minor; not worth the dep — one-liners / own installs. |

---

## 3. CHART DECISION TABLE

Reconciled with EMPIRICAL: **scatter is NOT implemented in 1.6.2** (the string `scatter` does not appear
anywhere in the installed `dist/frappe-charts.min.esm.js` runtime), and the **valuation staircase is a
grouped bar** (Raiku vs benchmark median), not a stepped SVG — the old plan's "staircase = custom SVG"
note conflated it with the waterfall. Real, usable `frappe-charts` types: `line`, `bar`, `axis-mixed`,
`percentage`, `pie`, `donut`, `heatmap`. No native waterfall, range/floating-bar, stepped line, or
Gantt/timeline.

| # | Studio chart (view) | Decision | Why (evidence) | Interactivity / notes |
|---|---|---|---|---|
| 1 | **Valuation / dilution staircase** — Board (COM-26) | **frappe-charts grouped `bar`** (Raiku vs Median per stage) | Reference `ValuationStaircase` is a recharts **grouped bar**, not a step outline (Lane D). frappe-charts grouped bar is a core competency. *Optional:* render a **true-step outline as custom SVG** only if the editorial design demands a stepped line — that is a Robin decision (section 9). | `isNavigable:1` -> `data-select` to click a stage; `formatTooltipY` for $; TGE-FDV caption; `colors` = palette; `role="img"` aria-label. |
| 2 | **Net-vs-gross line** — Advisors/Board | **frappe-charts `line`** (2 datasets) | Core competency; two line datasets, distinct `colors`. | Tooltips via `formatTooltipY` for net-of-strike $; `yMarkers` for a strike/target line. |
| 3 | **Upside curve (line/area)** — Advisors (COM-28) | **frappe-charts `line` + `lineOptions.regionFill:1`** (area), optional `spline:1` | Native area via `regionFill`; spline for smoothing. Token sub-chart is the **right half of UpsideCurve**, not a separate component (Lane D). | Hover tooltip; `$1B` caution band via `yRegions`/`yMarkers`; explicit `height`. |
| 4 | **Comp mix (percentage)** — Advisors/Board (COM-29) | **frappe-charts `percentage`** (or `donut`) | Exactly the single 100%-stacked-bar `percentage` chart. Native. | Hover shows `value %`; cap with `maxSlices`/`maxLegendPoints`. Watch legend truncation on narrow widths (#395/#374) -> may need a custom legend on mobile. |
| 5 | **Scenario grouped bar** — Compare (COM-19) | **frappe-charts grouped `bar`** (or `axis-mixed`) | Core competency: N datasets -> side-by-side bars (one per scenario). **This grouped bar lives in Compare, not Board** (Lane D mis-map fix). | `data-select` to click a scenario; `formatTooltipY` for $; `colors` = `SCEN_COLORS`. |
| 6 | **Growth waterfall** — Advisors (COM-17 + COM-27) | **Custom SVG** | **No native waterfall.** Faking it with a transparent-base stacked bar makes labels/connectors/sign-coloring fragile. Custom = floating rects + connectors + +/- coloring; matches editorial palette. | Hand-rolled hover/tooltip; Current + Ceiling reference lines; hover-sync with the objectives tri-state list. The single biggest "don't fight the library" call. |
| 7 | **Potential scatter** — Board (COM-26 + COM-27) | **Custom SVG (mandatory)** | **Scatter is a no-op in 1.6.2** — `type:'scatter'` returns `undefined`; as a dataset type it's coerced to line and renders nothing; the string is absent from the runtime (EMPIRICAL). Supersedes the stale #188 framing. | Plot `<circle>`s on linear x/y; z = capital bubble; tier colours; click->select; `role="img"`; own `<title>`/tooltip + quadrant labels. |
| 8 | **Football-field ranges** — single-advisor (COM-29) **and** Board per-advisor multi-row (COM-15/26) | **Custom SVG** | Floating min-max range bars = a bar with a non-zero start; frappe-charts bars are zero-anchored, and `yRegions` shades full-width bands, not per-category ranges. **Two distinct components share the name** — both must be built (Lane D). | Per-bar `<title>` or hand-rolled tooltip; base tick overlay. Low effort, full control. |
| 9 | **Vesting timeline** — Advisors (COM-29) | **Custom SVG** | Gantt-like horizontal timeline (cliff + linear vest, 0-48 mo) with cliff/Bad-Leaver/TGE/today/CoC reference lines. No timeline/Gantt type in frappe-charts (that's the sibling `frappe-gantt`, out of scope). Positioned `<rect>`s + tick labels. | Static is fine; add hover if wanted. Carries legal tooltips (CoC "Board discretion", 9-yr/90-day backstop, Bad-Leaver). |
| 10 | **DilutionPath mini-chart** — Advisors detail | **Custom SVG / CSS bars** | Reference is a CSS flex bar chart of base-path retention; small. **Currently UNOWNED by any COM issue** (Lane D) — flag for scoping. | Static; per-step `<title>`. |
| — | **PotentialStrip / PoolAllocation bars** — Overview/Advisors/Board | **CSS divs (not a chart lib)** | Reference renders these as CSS `<div>` bars; no chart engine needed. | Static; matches Overview's existing approach. |

**Wrapper contract (`FrappeChart.vue`, COM-16) — mandatory:** create with `new Chart(el, opts)`, **guard
the `undefined` return** (bad type -> undefined); store the instance; `watch` data -> `chart.update(plainSnapshot)`
(pass `toRaw`/`JSON.parse(JSON.stringify())` — `update` deep-clones, and *mutating reactive data in place
will NOT update the chart*); **`destroy()` + `new Chart()` on type/colors/option changes** (`update` swaps
data only); `chart.destroy()` in `onBeforeUnmount` (leaks `resize`/`orientationchange` listeners
otherwise). **Add the wrapper's own `ResizeObserver` -> `chart.draw()`** — frappe-charts' internal
`ResizeObserver` is commented out; only `window.resize` is handled, so container-only resizes (sidebar,
grid reflow) won't refit. **Redraw on route/tab show** — `draw()` early-returns when the parent
`isHidden()`, so charts built inside a `display:none` view render at **0 width**. Keep `showLegend`
consistent across updates (#409: legend-less update can throw). Give each chart its own dedicated `<div>`
(construct wipes `parent.innerHTML`). Animation is off by default (no rapid-update race). Export is
**SVG-only** (`chart.export()`) — no PNG; for print use SVG export + browser print.

---

## 4. VERSION-COMPATIBILITY MATRIX & RECOMMENDED PINS

Verified against npm registry + GitHub source on 2026-06-08 (Lane C), reconciled with what the sandbox
actually installed (EMPIRICAL).

> **POST-GATE (2026-06-08): this matrix is now BINDING with frappe-ui ADOPTED.** Per the banner at the
> top, `frappe-ui@0.1.278` (exact) is a real dependency, so its two constraints — the Vue **`>=3.5`**
> floor and the **Tailwind-v3** preset lock — **DO bind** (the scaffold already honours them: Vue
> `^3.5.13` / Tailwind `^3.4.3`). The "dropping frappe-ui / floor no longer binds / DO NOT add" wording
> retained in the rows + the §4 pins block below is the **Phase-0 audit trail** — superseded; read the
> adopted pins as those in TECH_BRIEF §4 (the source of truth for the stack).

The scaffold's Vue-3/Vite-5/Tailwind-3 set is internally consistent and **builds green this session with
frappe-ui added**. We stay current within the Vite-5 line.

| Package | Scaffold pin | Latest (`dist-tags.latest`) | Sandbox resolved | Mutual compatibility / notes |
|---|---|---|---|---|
| `vue` | `^3.5.13` | **3.5.35** (`3.6.0-beta`) | **3.5.35** | **frappe-ui's `>=3.5.0` peer floor BINDS** (frappe-ui adopted) -> pin **`^3.5`**. 3.5 is backward-compatible with 3.4 app code. (Committed scaffold already `^3.5.13`.) *(Audit trail: Phase-0 said the floor "no longer binds" because frappe-ui was being dropped — superseded by the gate.)* |
| `vue-router` | `^4.3.0` | **5.1.0** (`5.0.0-beta`) | — | Stay on **v4** (`^4.x`). Do NOT go to vue-router 5. |
| `vite` | `^5.2.10` | **8.0.16** (Rolldown) | **8.0.16** \! | `npm create vite@latest` now scaffolds **Vite 8 (Rolldown)**; the **real scaffold pins Vite 5 — keep it** (`^5.x`). frappe-ui dev-builds on Vite 7 but doesn't force our major (it's a dep, not a peer). |
| `@vitejs/plugin-vue` | `^5.0.4` | **6.0.7** | — | plugin-vue **5 <-> Vite 5**. Do NOT jump to 6 unless Vite >=6. Pin **`^5.x`**. |
| `tailwindcss` | `^3.4.3` | **4.3.0** (`4.0.0` next) | **3.4.19** | **STAY on v3.4** (`^3.4`). v4 drops the JS-preset/`content` model for CSS-first `@theme`/`@import "tailwindcss"`. (This was a hard lock *only because of* frappe-ui's v3 preset; we keep v3 anyway — v4's migration is unrelated churn we don't want now.) |
| `typescript` | `^5.4.5` | **6.0.3** (`6.0.0-beta`) | — | Stay on **5.x** (`^5.x`). TS 6 needs vue-tsc 3. |
| `vue-tsc` | `^2.0.13` | **3.3.4** | — | **v2** OK on TS 5.x + Vue 3.5. Pin **`^2.x`**. (TS 6 later => vue-tsc 3.) |
| `autoprefixer` | `^10.4.19` | **10.5.0** | — | Within v10; keep. |
| `postcss` | `^8.4.38` | **8.5.15** | — | Within v8; keep. |
| `frappe-charts` | `1.6.2` (exact) | **1.6.2** (`2.0.0-rc27` next) | **1.6.2** | **Pin EXACT `1.6.2`.** `^1.6.2` already resolves to exactly 1.6.2 (no 1.6.3 on npm; only `2.0.0-rc`s above), but pin exact to dodge the missing-CSS variance between 1.6.x publishes; the committed scaffold already pins it exact. MIT, zero deps, framework-agnostic. |
| `frappe-ui` | **`0.1.278` (exact)** | **0.1.278** (`1.0.0-beta.4` on GitHub `main`) | 0.1.278 | **ADOPTED — pin EXACT `0.1.278`** (mid-major churn: 0.1.278 `latest` vs `1.0.0-beta.4` shipped same day). MIT. Now a **real dependency** in the committed scaffold; requires the §6 recipe (Vite plugin + ESM preset + `style.css`). *(Audit trail: Phase-0 read "DO NOT add to `package.json`" — superseded by Robin's gate.)* |
| `@headlessui/vue` | *(not added — frappe-ui provides it)* | — | — | **Do NOT add separately.** frappe-ui bundles `@headlessui/vue` + `@floating-ui/vue` + reka-ui + vue-sonner; its Dialog/Menu/Switch/Combobox/Tooltip come through frappe-ui's own components. *(Audit trail: the Phase-0 hand-rolled path would have added it on first interaction — superseded.)* |

### Recommended exact pins (frontend-only, frappe-ui ADOPTED)
This is the binding set (matches the committed scaffold + TECH_BRIEF §4):
```jsonc
{
  "dependencies": {
    "vue": "^3.5",            // frappe-ui peer floor >=3.5 BINDS
    "vue-router": "^4.x",     // keep on v4 — do NOT go to 5.x (frappe-ui peers ^4.1.6)
    "frappe-ui": "0.1.278",   // pin EXACT; recipe in section 6 (Vite plugin + ESM preset + style.css)
    "frappe-charts": "1.6.2"  // pin EXACT (MIT, zero deps); corrected import (see section 3 / 6)
    // @headlessui/vue: NOT added — frappe-ui already bundles it
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.x",  // pairs with Vite 5
    "vite": "^5.x",                // stay on the Vite 5 line; do NOT jump to 6/7/8
    "tailwindcss": "^3.4",         // STAY on v3 — the Espresso preset is v3-only
    "typescript": "^5.x",          // stay on 5.x (TS 6 needs vue-tsc 3)
    "vue-tsc": "^2.x",             // v2 OK on TS 5.x + Vue 3.5
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38"
  }
}
```
*(Audit trail — the Phase-0 "no frappe-ui" pin set, superseded by the gate: it omitted `frappe-ui`,
treated the Vue `>=3.5` floor as non-binding, and added `@headlessui/vue` only on first interaction.)*
**`vp` / Vite+ is alpha -> local dev convenience only, NEVER a build/deploy dependency.** The committed
`package.json` scripts (`dev`/`build`/`preview`) stay plain `vite`; Vercel builds `npm run build` -> `dist`
with the `vercel.json` SPA rewrite. Already true in the scaffold — do not regress.

---

## 5. LICENSING

All-clear; **zero copyleft risk** for an internal proprietary tool. Verified from each repo's LICENSE +
manifest `"license"` (Lane C).

| Package / project | Version checked | License | Evidence |
|---|---|---|---|
| **frappe-ui** | `0.1.278` (npm `latest`) & `1.0.0-beta.4` (GitHub `main`) | **MIT** | `license.md` (MIT) + `package.json "license":"MIT"` — github.com/frappe/frappe-ui |
| **frappe-charts** | `1.6.2` (npm `latest`), `v1.6.3` (GitHub `main`) | **MIT** | `LICENSE` (MIT, (c) 2017 Prateeksha Singh) + manifest — github.com/frappe/charts |
| **Frappe Framework** (`frappe/frappe`) | `develop` | **MIT** | `LICENSE` = "The MIT License", (c) 2016-2021 Frappe Technologies — github.com/frappe/frappe/blob/develop/LICENSE |
| **ERPNext** (NOT used) | — | **GPLv3** | for contrast only; we depend on neither ERPNext nor any Frappe backend |

MIT is permissive: use/modify/ship in proprietary software, sole obligation = retain the copyright +
permission notice. No source-disclosure (unlike GPL), no network-use trigger (unlike AGPL). The only
copyleft in the ecosystem (GPLv3) attaches to **ERPNext**, which the plan never touches. **Action (POST-GATE):**
ship a `THIRD-PARTY-NOTICES` retaining the MIT notices for **`frappe-ui` AND `frappe-charts`** (the two
Frappe libs we now bundle); frappe-ui's deep tree is overwhelmingly MIT/permissive. `echarts` is
**Apache-2.0** — relevant only if a frappe-ui chart component (`AxisChart`/`DonutChart`) is imported; add
its notice then. *(Audit trail: Phase-0 said "frappe-charts only" since frappe-ui was not bundled — superseded.)*

---

## 6. SANDBOX VERIFICATION RESULTS (authoritative — overrides docs)

A throwaway Vite + Vue 3 + Tailwind app (`/tmp/claude/comp-studio-sandbox/app`) with `frappe-ui` +
`frappe-charts` installed and rendered **with no Frappe backend**, run by the orchestrator 2026-06-08.
Render proof: **`research/sandbox-frappe-ui.png`** — shows frappe-ui Button/Badge/FormControl/Select/
Checkbox/Dialog **and** frappe-charts line + grouped bar all rendering standalone (no backend, no FrappeUI
plugin); note the **Inter** typography + frappe styling, i.e. the design language is frappe's, not the
studio's Fraunces/IBM-Plex editorial look. Install footprint: `frappe-ui` = **26 MB / 218 packages** added
(pulls reka-ui, @vueuse, ~35 @tiptap/*, echarts, @headlessui/vue, vue-sonner, socket.io-client,
feather-icons...).

### Corrected standalone recipe (all four pieces required to build — the PREVIOUS brief's recipe did NOT build)
```ts
// vite.config.ts — the frappe-ui Vite plugin is REQUIRED just to build (components' source
// uses `~icons/lucide/*` virtual imports). Disable the Frappe-site bits.
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import frappeui from 'frappe-ui/vite'
export default defineConfig({
  plugins: [ frappeui({ frappeProxy: false, jinjaBootData: false, buildConfig: false }), vue() ],
  optimizeDeps: { include: ['feather-icons'] }, // else DEV throws: feather-icons has no default export
})
```
```js
// tailwind.config.js  (ESM — the preset is ESM-only; a .cjs require() fails)
import frappeUIPreset from 'frappe-ui/tailwind'
export default { presets: [frappeUIPreset],
  content: ['./index.html','./src/**/*.{vue,js,ts}','./node_modules/frappe-ui/src/**/*.{vue,js,ts}'] }
```
```ts
// main.ts — import the stylesheet; do NOT app.use(FrappeUI)
import 'frappe-ui/style.css'   // NOT 'frappe-ui/dist/style.css'  (also @imports Inter + runs @tailwind)
// components are named imports: import { Button, Dialog, FormControl, Badge } from 'frappe-ui'
```

### The 5 things that broke (all contradict TECH_BRIEF / scaffold)
1. **`vue ^3.4.21` is below frappe-ui's floor** (`peerDependencies.vue: ">=3.5.0"`) -> bump to `^3.5`.
2. **`import 'frappe-ui/dist/style.css'` -> no such file.** frappe-ui ships **no `dist/`**; `.` resolves to
   raw `src/index.ts`. Correct: **`import 'frappe-ui/style.css'`** (which `@import`s the Inter font + runs
   `@tailwind` with the preset).
3. **Preset path `require('frappe-ui/src/utils/tailwind.config')` is wrong** (deprecated shim, ESM-only,
   not in `exports`). Correct: **`import frappeUIPreset from 'frappe-ui/tailwind'`** in an **ESM**
   `tailwind.config.js`.
4. **`import 'frappe-charts/dist/frappe-charts.min.css'` -> no such file in 1.6.2.** frappe-charts ships
   **zero CSS**; the ESM bundle **self-injects** styles (`styleInject`). **Delete the CSS import line** (it
   breaks the Vite build). Bare `import { Chart } from 'frappe-charts'` is correct (resolves via `module` ->
   `dist/frappe-charts.min.esm.js`).
5. **`app.use(FrappeUI)` is backend-bound and dangerous on a static SPA.** The plugin defaults
   `{resources:true, call:true, socketio:true}` -> installs the Frappe RPC/resource layer and **calls
   `initSocket()`** (opens a socket.io connection that will fail/retry against the static origin).
   Standalone apps **skip the plugin** and import components by name.

### Bundle cost (production `vite build`, importing only Button/Badge/FormControl/Dialog)
| asset | raw | gzip |
|---|---|---|
| index.js | **510 KB** | **~148 KB** |
| index.css | **174 KB** | **~21 KB** |
| Inter.var + Inter-Italic.var (woff2) | **561 KB** | — (forced by `frappe-ui/style.css`) |

Tree-shaking **did** drop echarts / socket.io / vue-sonner / fuzzysort (grep = 0 in the bundle), but
TextEditor/TipTap still emitted async chunks (`FontColor`, `InsertIframe`) and the core still drags
**reka-ui + @vueuse**. For an app whose only built view (`Overview.vue`) uses **zero** frappe-ui, this is a
poor trade.

### frappe-charts — confirmed behaviour
- **Renders standalone** (line + grouped bar, custom `colors`, tooltips, legend, axes) with **no CSS
  import** (styles self-inject). See screenshot.
- **`scatter` is NOT implemented in 1.6.2** — the string `scatter` does not appear anywhere in the
  installed `dist/frappe-charts.min.esm.js` runtime (only `"Undefined chart type"` + `getChartByType`).
  -> scatter must be **custom SVG**.
- No native **waterfall**, **football-field/range bar**, **stepped/staircase line**, or **vesting/Gantt** ->
  custom SVG (the frozen engine already supplies coordinates).
- **Resize gotcha:** internal `ResizeObserver` is commented out; only `window.resize` is handled -> the Vue
  wrapper must add its own `ResizeObserver` -> `chart.draw()` and redraw on tab/route show (hidden-view
  charts render at 0 width). `chart.update(data)` swaps data only; type/colors changes need
  `destroy()` + `new Chart()`; `destroy()` on unmount.

### Verdict implication
The **facts** here stand (and now read as the adoption guide): frappe-ui **runs frontend-only** (proven)
via the corrected recipe above, at the accepted cost of ~148 KB gz JS + 561 KB Inter + Espresso CSS +
heavy transitive deps (reka-ui/@vueuse), while **replacing** the studio's design tokens and fonts with
Espresso/Inter. The recipe above is **THE wired, build-green path** — not an on-ramp.

> **AUDIT TRAIL — SUPERSEDED (banner at top).** The Phase-0 verdict that closed this sub-block —
> *"-> Do NOT adopt frappe-ui; keep `frappe-charts` + custom SVG + headless-UI/Tailwind. Decision is
> reversible — the recipe above is the on-ramp if Robin wants frappe-ui later."* — was **reversed by
> Robin's gate (D17/D18)**: frappe-ui is ADOPTED, the "on-ramp" recipe is now primary, and
> `@headlessui/vue` is **not** added separately (frappe-ui provides it). The chart half is unchanged:
> `frappe-charts` (corrected import) stays PRIMARY + custom SVG for the rest.

---

## 7. WHY frappe-ui IS REJECTED (theming detail) + the reversible on-ramp

> **AUDIT TRAIL — SUPERSEDED by the POST-GATE decision (banner at top).** This whole section is the
> Phase-0 evaluation record; frappe-ui is now **ADOPTED**. What §7 frames as the "reversible on-ramp" IS
> the **primary, wired recipe** (§6); the theming detail below is the **adoption guide** (exactly what we
> accept by taking the Espresso preset). Do **not** read §7 as current direction.

The rejection is **structural, not cosmetic.** The preset (`tailwind/preset.js` -> `tailwind/plugin.js`,
verified in Lane A section 2):
- **Forces Inter globally** via `addBase({ html: { 'font-family': 'InterVar, ...' }, '...': { fontVariationSettings: "'opsz' 24, 'cv11' 1" } })` (Inter-specific OpenType features), applied through `@tailwind base` -> overrides our `<html>` Fraunces/IBM-Plex font unless re-overridden after.
- **Replaces the entire color scale** (`theme.colors = colorPalette` from Frappe's Figma tokens) -> wipes Tailwind defaults and any palette in the same slot; our `ink/paper/amber/teal` would collide with frappe's semantic `surface-*`/`ink-gray-*`/`outline-*` names that every component consumes.
- **Overrides `fontSize` (base 14px, `fontWeight: 420`), `borderRadius` (DEFAULT 8px), `boxShadow`, `container`** — the "Espresso" look, fighting an editorial layout.
- **Components are hard-wired to the preset's tokens** (`bg-surface-gray-2`, `text-ink-gray-8`, `border-outline-gray-3`, `focus-visible:ring-outline-gray-3`) -> **without the preset they render unstyled/broken.** It is all-or-nothing: you cannot take Button's markup but keep your palette without reproducing ~40 semantic tokens.

So "adopt frappe-ui components" effectively means "adopt the Espresso/Inter design system, then fight it
back toward editorial" — strictly more work than building the ~6 primitives we need against our existing
Tailwind config, which `Overview.vue` already proves works and looks right.

**Reversible on-ramp (if leadership ever insists on frappe-ui for ecosystem consistency):** use the
corrected recipe in section 6 (frappe-ui Vite plugin with Frappe bits disabled; ESM `tailwind.config.js`
with `frappe-ui/tailwind`; `import 'frappe-ui/style.css'`; named component imports; **never**
`app.use(FrappeUI)`), pin **`frappe-ui@0.1.278`** exactly, bump Vue to `^3.5`, lock Tailwind v3, and import
**only named components**. Minimum-damage form: don't import `frappe-ui/style.css` (copy the ~3
component-class rules you need, e.g. `.form-input`), don't apply the preset — at which point you're using
frappe-ui as a heavier Headless UI, which is exactly why we skip it.

### Recommended fallback stack (Phase-0 path — SUPERSEDED; the adopted path is frappe-ui per §6)
- **Interactive primitives:** `@headlessui/vue` (Dialog, Menu->Dropdown, Switch, TabGroup, Combobox, Listbox, Popover) + optionally **`@floating-ui/vue`** for Tooltip/positioning — both are frappe-ui's own deps; proven, tiny, unstyled (we bring editorial Tailwind).
- **Toasts:** `vue-sonner` directly (or ~40-line custom).
- **Presentational** (Button, Badge, Input, Select, Textarea, Checkbox, Card, Divider, Spinner, FormControl): hand-rolled SFCs against `tailwind.config.cjs` tokens, matching `Overview.vue`. ~1 day in a `components/ui/` folder.
- **Icons:** Lucide (`lucide-vue-next`) or inline SVG.
- **Charts:** `frappe-charts@1.6.2` (corrected import) + small custom-SVG kit.

### Scaffold state — POST-GATE: RE-WIRED to frappe-ui + BUILD-GREEN (guard against regression)
> **POST-GATE update:** the scaffold has since been **re-wired to the adopted recipe** (§6) and **builds
> green this session.** The current committed state (the one to guard) is:
> - `package.json` — **`frappe-ui@0.1.278` installed + pinned exact** alongside `frappe-charts 1.6.2`.
> - `tailwind.config.js` is **ESM** with `presets:[frappeUIPreset]` from `frappe-ui/tailwind` and a content
>   glob that **includes `./node_modules/frappe-ui/src/**/*`**; the stale `tailwind.config.cjs` was removed.
> - `vite.config.ts` runs `frappeui({ frappeProxy:false, jinjaBootData:false, buildConfig:false })` +
>   `optimizeDeps:{ include:['feather-icons'] }`.
> - `main.ts` **imports `frappe-ui/style.css`** (then app `./style.css`); **no `app.use(FrappeUI)`.**
> - `FrappeChart.vue` keeps the bare `import { Chart } from 'frappe-charts'` with **no CSS import** (below).
> - Engine **22/22**.
>
> The **still-valid** charts correction (unchanged before and after the gate):
> - `FrappeChart.vue` uses bare `import { Chart } from 'frappe-charts'` with **no** `frappe-charts/dist/frappe-charts.min.css` import (that line 404s in 1.6.2 + is redundant — styles self-inject). This was the most likely first build blocker.
>
> *(Audit trail — the Phase-0 hand-rolled cleanups, now SUPERSEDED by the gate: `main.ts` had dropped the
> `frappe-ui/dist/style.css` line entirely; `tailwind.config.cjs` did not glob `node_modules/frappe-ui/src`
> and added no preset. The gate reversed both — the scaffold now carries the full frappe-ui wiring above.)*

---

## 8. DECISION LOG

| # | Decision | Rationale | Source / lane |
|---|---|---|---|
| D1 | **Frontend-only static SPA on Vercel** | Frappe backend is a stateful Python+MariaDB+Redis+Socket.IO+worker monolith under `bench`; Vercel runs static assets + stateless functions (it *can* run Python funcs, but not a stateful always-on monolith). The blocker is topology, not language. The *view* libs compile to static JS/CSS and deploy fine. | C; _CONTEXT |
| D2 | **Do NOT adopt frappe-ui** | All-or-nothing preset destroys the Fraunces/IBM-Plex editorial design; raw-source package needs a corrected recipe + its own Vite plugin to build; ~148 KB gz JS + 174 KB CSS + 561 KB Inter for 4 components; useful parts are thin wrappers over `@headlessui/vue`. | A; EMPIRICAL |
| D3 | **Build UI hand-rolled with Tailwind**, headless primitives only where interaction is real | The only built view (`Overview.vue`) already does this with zero frappe-ui and looks right; headless libs give the same a11y at a fraction of the surface. | A; D; EMPIRICAL |
| D4 | **Keep `frappe-charts@1.6.2` (pin exact)** | MIT, zero-dep, framework-agnostic; covers line/area/percentage/grouped-bar cleanly; renders standalone in the sandbox. | B; C; EMPIRICAL |
| D5 | **Corrected charts import**: bare `import { Chart } from 'frappe-charts'`, **no CSS import** | `dist/frappe-charts.min.css` 404s in 1.6.2; ESM self-injects styles (`styleInject`). The previous scaffold/brief CSS line broke the build — now removed. | B; C; EMPIRICAL #4 |
| D6 | **Staircase = frappe-charts grouped bar** (Raiku vs Median), NOT custom SVG | Reference `ValuationStaircase` is a recharts grouped bar; the old "no native waterfall/staircase" risk conflated it with the waterfall. | D; B |
| D7 | **Scatter = custom SVG (mandatory)** | Scatter is a no-op in 1.6.2 — absent from the runtime entirely (sandbox), coerced to line as a dataset type. Supersedes the stale #188 framing. | EMPIRICAL; B |
| D8 | **Custom SVG for waterfall, football-field (x2), vesting timeline** (+ DilutionPath, true-step staircase if chosen) | No native waterfall / range bar / stepped line / Gantt in frappe-charts; faking them is fragile. Engine already supplies coordinates. | B; C; D |
| D9 | **Chart wrapper must add ResizeObserver->draw(), redraw-on-route/tab-show, destroy() on unmount; update() swaps data only** | frappe-charts' internal `ResizeObserver` is commented out; `draw()` early-returns when hidden (0-width); listeners leak without `destroy()`; `update()` deep-clones and ignores in-place mutation. | B; EMPIRICAL |
| D10 | **Pins: frappe-ui `0.1.278` (exact), vue `^3.5`, vue-router `^4.x`, vite `^5.x`, @vitejs/plugin-vue `^5.x`, tailwindcss `^3.4`, typescript `^5.x`, vue-tsc `^2.x`, frappe-charts `1.6.2`** *(updated for adoption per D17 — see TECH_BRIEF §4)* | frappe-ui's `>=3.5` Vue floor + v3 Tailwind preset lock **BIND** (frappe-ui adopted); `@headlessui/vue` is **not** added separately (frappe-ui provides it); Vite-5 line is current-but-stable; vue-router 5 / TS 6 / Vite 6+ are unneeded churn. *(Audit trail: the Phase-0 form of D10 omitted frappe-ui, said the Vue floor "no longer binds," and added @headlessui/vue on first interaction — superseded by the gate.)* | C; EMPIRICAL; _CONTEXT; D17 |
| D11 | **Tailwind stays v3.4 (NOT v4)** | v4 removes the JS-preset/`content` model for CSS-first `@theme`; unrelated migration churn we don't want mid-project. | C; EMPIRICAL |
| D12 | **`vp` (Vite+) = local dev only, never build/deploy** | Alpha; committed scripts stay plain `vite`; Vercel builds `npm run build` -> `dist`. | C; _CONTEXT |
| D13 | **Licensing clear: frappe-ui / frappe-charts / Frappe = MIT; ERPNext GPLv3 (unused)** | Permissive; no source-disclosure or network-use trigger; ship a THIRD-PARTY-NOTICES with the **frappe-ui + frappe-charts** MIT notices (both bundled post-gate; echarts Apache-2.0 only if a frappe-ui chart is used). | C |
| D14 | **frappe-ui data layer (createResource/.../initSocket/frappeRequest/call) is out of scope** | Hardcodes `/api/method/...` + Frappe site/CSRF headers + socket.io; our state is local over `engine/engine.ts`. | A; C |
| D15 | **Engine frozen; reference is UX source of truth; preserve internal/confidential + net-of-strike + "discussion draft, not a binding offer" framing; ≤ 450 LOC per Linear (COM-*) issue (split the issue if larger)** | Non-negotiables from the brief; 22/22 tests pass; legal corpus must port verbatim; one issue = one PR linking its issue, tests ship with the code, QA gate green before merge to `main`. | _CONTEXT; D |
| D16 | **Fold in the feature-inventory gaps** (named multi-board `Mgr`, localStorage schema collision, clipboard Copy/Paste vs URL-hash, reducer DELETE cascades, DilutionPath / board-CSV / paste-state, legal corpus, NumIn/DField) | Lane D graded the plan ~85% complete; these classes will bite at build time if not scoped. See section 9. | D |
| D17 | **ADOPT `frappe-ui` as-is** (Espresso/Inter + Frappe UI Starter/Gameplan/Helpdesk templates) — **OVERRIDES D2 & D3** | Robin, post-gate (2026-06-08): clean/consistent UI-UX via Frappe templates is prioritised over bundle weight (~148 KB gz JS + 561 KB Inter + Espresso CSS) and the bespoke Fraunces/IBM-Plex editorial design. Integration via the corrected §6/§7 recipe (wired + build-green this session); pin `frappe-ui@0.1.278` exact, Vue `^3.5`, Tailwind `^3.4`; import components by name; **never** `app.use(FrappeUI)`; data layer stays out of scope. | Robin (post-gate); §4; §6; §7 |
| D18 | **Charts unchanged** — `frappe-charts@1.6.2` (PRIMARY) + custom SVG remain | Adopting `frappe-ui` does not change the chart stack: `frappe-charts` stays for line/area/percentage/grouped-bar incl. the valuation staircase; custom SVG (styled with Espresso tokens) for waterfall / scatter / football-field / vesting / DilutionPath. `frappe-ui`'s own echarts wrappers (AxisChart/DonutChart, ~1MB) noted as an OPTION for full design consistency, but `frappe-charts` stays primary (lighter, verified). Wrapper contract (COM-16) unchanged. | Robin (post-gate); §3; D4-D9 |

---

## 9. OPEN DECISIONS FOR ROBIN (product calls, not technical)

Surfaced by Lane D's gap analysis and the staircase reconciliation; only Robin can settle them:
1. **Named multi-board persistence (`Mgr`).** The reference has a whole subsystem — save many named boards,
   switch/load/delete, via an `io` layer storing a `{scenarios, last}` map (ref lines 514, 1280, 458). **No
   COM issue owns it.** Decision: **port it as a new M0/M1 issue, or descope to single-state for v1?**
2. **localStorage schema collision (COM-11 must reconcile).** Key `'raiku-advisor-comp-v5'` is shared, but
   the **reference stores `{scenarios, last}`** while the **scaffold stores raw `State`**. These are
   incompatible under the same key. Decision: adopt the reference's `{scenarios,last}` wrapper (implies #1)
   or formalize the scaffold's raw-state shape (implies descope of #1)?
3. **Share mechanism.** The reference shares via **clipboard Copy/Paste** (`io.copy` / `clipboard.readText`
   -> `LOAD`); the `#s=` base64 URL-hash is a **scaffold-only enhancement**, not parity. Decision: keep
   both, or scope COM-11 to clipboard-only (the actual reference behaviour) + treat URL-hash as a stretch?
4. **Valuation staircase rendering.** Settled as a **grouped bar** (D6). Decision: accept the bar (free
   frappe-charts tooltips + `data-select`), **or** spend custom-SVG effort on a true-step outline if the
   editorial design wants the stepped look?
5. **Section numbering.** The reference has a self-contradiction — two components both claim "Section I"
   (Overview and Package), and eyebrow numerals disagree with the nav (I-VI). Decision: adopt the nav order
   (I Overview ... VI Configure) and fix the eyebrows? Unowned by any COM issue.

**Also fold into M1 issue text (engineering correctness, not Robin calls, but currently under-specified):**
reducer **DELETE cascades** must be explicit — `DEL_MS` reassigns `currentStage`/`capitalUplift.gate`/
objective gates; `DEL_ROUND` fixes `tgeAnchor` + advisor `grantRound`->bridge; `DEL_TIER` clamps
`advisor.tier`; `DEL_OBJ` scrubs `achieved/targeted` refs across advisors (skipping these corrupts state).
Smaller unowned items to assign an owner: **DilutionPath** mini-chart, **board-summary CSV export**
(distinct from roadmap CSV), **paste-state**, header **budget/storage Banners**, and the **NumIn/DField**
inline numeric-editor primitives (load-bearing — every Configure + Package number depends on them). The
**legal-caveat corpus must port verbatim** (net-of-strike; "discussion draft / not a binding offer";
non-voting shares; RTA; deed of adherence; net exercise; CoC at Board discretion; UK s431 / US 409A by
residency; HMRC SAV; 9-yr / 90-day exercise window; "subject to required investor consents"; Bad-Leaver
2-yr) and the **benchmark source strings** (Carta State of Pre-Seed 2025 / ValueAdd VC; Memento Research /
The Defiant / MEXC; Founder Institute FAST ~5% pool) — none are currently enumerated as acceptance criteria.

---

## 10. WHERE LANES DISAGREED — and how the sandbox settled it

**frappe-charts `scatter`.** **Lane B** read the public type dispatch (`getChartByType` in `src/js/chart.js`)
and concluded scatter is a **no-op** (not a key in `chartTypes`; as a dataset type it's coerced to line and
renders nothing), while noting that `src/js/utils/constants.js` lists `scatter` in `ALL_CHART_TYPES` —
making it *look* supported. **Lane C** took the `constants.js` listing (plus issue #188 being CLOSED) at
face value and concluded **scatter works as a first-class type**. These directly conflict. **The sandbox
settled it in Lane B's favour:** in the installed `dist/frappe-charts.min.esm.js`, the string `scatter`
**does not appear anywhere in the runtime** (only `"Undefined chart type"` + `getChartByType`). The
`constants.js` entry is dead — never wired into the public `Chart` dispatch. **Resolution: scatter is
unavailable -> custom SVG (D7).** Both lanes also agreed (correctly) that issue **#188 is CLOSED** and is
*not* the live tracker the older plan implied; scatter wasn't fixed, it was dropped from the
documented/dispatched API.

(Secondary, non-conflicting corrections all three lanes + the sandbox agreed on: the frappe-ui
`dist/style.css` and frappe-charts `dist/*.min.css` paths are wrong — no `dist/` CSS exists in either;
the frappe-ui Tailwind preset path is the deprecated shim, use `frappe-ui/tailwind`; frappe-ui's Vue floor
is `>=3.5`.)

---

## 11. SOURCES (deduped across all lanes)

**npm / registry / CDN (package metadata, dist listings, license):**
- `https://registry.npmjs.org/frappe-ui` (dist-tags + per-version `time`: `0.1.278` latest 2026-04-25; `1.0.0-beta.4` 2026-06-08)
- `https://registry.npmjs.org/frappe-charts` (`1.6.2` latest; MIT; `module=dist/frappe-charts.min.esm.js`, `main=...cjs.js`; no `exports`; zero deps; `2.0.0-rc*` pre-releases)
- npm `dist-tags`/manifests fetched 2026-06-08 for `vue` (3.5.35), `vite` (8.0.16), `@vitejs/plugin-vue` (6.0.7), `tailwindcss` (4.3.0), `typescript` (6.0.3), `vue-tsc` (3.3.4), `vue-router` (5.1.0), `autoprefixer` (10.5.0), `postcss` (8.5.15)
- `https://cdn.jsdelivr.net/npm/frappe-charts@1.6.2/dist/*` and `https://unpkg.com/frappe-charts@1.6.2/dist/frappe-charts.min.css` (404) vs `@1.6.1/.../frappe-charts.min.css` (200) — proves no CSS in 1.6.2
- jsdelivr file listing for `frappe-ui@0.1.278` (`/src/index.ts`, `/src/style.css`, `/tailwind/index.js`, `/tailwind/preset.js`, legacy `/src/utils/tailwind.config.js`; no `/dist`)

**GitHub source / issues / licenses:**
- `https://github.com/frappe/frappe-ui` — `package.json` (`exports`, peerDeps `vue >=3.5.0` / `vue-router ^4.1.6`, `sideEffects:false`), `src/utils/plugin.js`, `src/utils/call.js`, `src/utils/frappeRequest.js`, `src/data-fetching/*`, `src/resources/*`, `tailwind/preset.js`, `tailwind/plugin.js`, `tailwind/colorPalette.js`, `src/style.css`, `license.md`
- `https://github.com/frappe/charts` — `src/js/chart.js` (dispatch + `import '../css/charts.scss'`), `src/js/utils/constants.js`, `src/js/utils/axis-chart-utils.js`, `src/js/charts/{AxisChart,BaseChart,PieChart}.js`, `rollup.config.js`, README, `LICENSE`
- `https://github.com/frappe/charts/issues/188` (CLOSED/completed 2020-06-29); open issues #409, #422, #423, #430/#395/#374/#308, #373 (stepped-line FR)
- `https://github.com/frappe/frappe` (repo tree; `pyproject.toml`, `socketio.js`, `realtime/`), `https://github.com/frappe/frappe/blob/develop/LICENSE` (MIT)
- `https://github.com/frappe/frappe_docker/blob/main/docs/getting-started.md` (Docker/VM deploy topology)
- `https://github.com/NagariaHussain/doppio` and `https://github.com/NagariaHussain/doppio_frappeui_starter` (blessed frontend path is backend-coupled — proxy to Frappe :8000, CSRF embedded in Frappe-rendered HTML)

**Docs:**
- context7 `/frappe/frappe-ui` (readme quick-start; `data-fetching/resource.md`); `/frappe/frappe` / `/websites/frappe_io_framework`
- `https://frappe.io/charts` + `https://frappe.io/charts/docs` (documented types `axis-mixed,bar,line,pie,percentage,donut,heatmap` — no scatter; option groups, `isNavigable`, `data-select`)
- `https://docs.frappe.io/framework/user/en/tutorial/install-and-setup-bench` (bench/supervisor process model)
- `https://deepwiki.com/frappe/frappe/2.6-real-time-communication-and-background-jobs`; `https://gavv.in/blog/how-does-frappe-work/`

**Repo-local artifacts (this run):**
- `research/sandbox-frappe-ui.png` (standalone render proof), `research/EMPIRICAL.md` (sandbox ground truth)
- `scaffold/` (`package.json`, `src/views/Overview.vue`, `src/components/FrappeChart.vue`, `main.ts`, `tailwind.config.cjs`, `vercel.json`)
- `reference/advisor-comp-studio.tsx` (1529-line UX source of truth); `engine/engine.ts` + `engine/engine.test.mjs` (frozen, 22/22)
