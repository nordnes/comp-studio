# Lane B — frappe-charts capabilities & gaps (Advisor Comp Studio)

> Verdict: **frappe-charts is a thin, zero-dependency SVG line/bar/pie engine that covers ~4 of the 9 studio charts cleanly.** It has a genuinely simple API, real interactivity (tooltips, hover, click→`data-select`, keyboard nav), runtime-injected CSS, and SVG export. But it has **hard gaps** (scatter is a no-op, no waterfall, no native ranges/steps/timeline) and **two concrete packaging bugs in the pinned `1.6.2`** that the scaffold currently trips over. Recommendation: keep frappe-charts for the 4 chart families it does well, build the other 5 as small custom SVG, and fix the two import lines.

All claims below are from the **published npm package `frappe-charts@1.6.2`** (the version pinned in `scaffold/package.json` as `^1.6.2`) and the `frappe/charts` source. Where source is read from a git tag it is noted; the type system and entry dispatch are unchanged between 1.6.1→HEAD.

---

## 0. Package facts (verified)

- **Latest npm version: `1.6.2`** · **License: MIT** (`npm view frappe-charts version license`).
- `package.json` (published 1.6.2, via `npm view`): `main = dist/frappe-charts.min.cjs.js`, `module = dist/frappe-charts.min.esm.js`. **No `exports` field** (`npm view frappe-charts exports` → empty). **Zero runtime dependencies, zero peer deps** (`dependencies`/`peerDependencies` empty). → Vue-3-agnostic, Tailwind-agnostic, framework-agnostic. No TipTap/Headless-UI baggage (that risk is a frappe-**ui** concern, not frappe-**charts**).
- **No `2.x` stable** — only `2.0.0-rc2 … rc27` pre-releases exist (`npm view ... versions`). `^1.6.2` will **not** pull an rc. There is **no `1.6.3` on npm** (it's a git tag only), so `^1.6.2` resolves to **exactly `1.6.2`**.
- **Published `1.6.2` `dist/` contents** (HTTP-probed on jsDelivr **and** unpkg):
  | file | status |
  |---|---|
  | `frappe-charts.min.esm.js` | 200 ✅ |
  | `frappe-charts.min.cjs.js` | 200 ✅ |
  | `frappe-charts.min.umd.js` | 200 ✅ |
  | `frappe-charts.esm.js` (non-min) | 200 ✅ |
  | **`frappe-charts.min.css`** | **404 ❌** (missing in 1.6.2; present in 1.6.1 and 1.6.3) |
  | `frappe-charts.css` | 404 ❌ |
  | `src/css/charts.scss` | 200 (source SCSS ships, not importable as CSS without sass) |

---

## 1. RESOLVING THE TWO IMPORT-PATH CLAIMS (both scaffold lines are wrong for 1.6.2)

The scaffold's `FrappeChart.vue` does:
```js
import { Chart } from 'frappe-charts'                       // (A)
import 'frappe-charts/dist/frappe-charts.min.css'           // (B)
```
TECH_BRIEF instead proposes `frappe-charts/dist/frappe-charts.min.esm` for (A).

### (A) JS import — bare specifier is CORRECT; the `.min.esm` path also works
- Bare **`'frappe-charts'`** resolves through the `module` field → `dist/frappe-charts.min.esm.js`. Vite/Rollup honour `module` for ESM, so the bare import gives you the **ESM build** (tree-shakeable, no UMD global). ✅ **This is the right one for a Vite SPA.**
- The explicit **`'frappe-charts/dist/frappe-charts.min.esm'`** (TECH_BRIEF) — note **no `.js`** — relies on Vite's extension resolution; `dist/frappe-charts.min.esm.js` does exist (200), so it resolves, but it's needlessly brittle (depends on extensionless resolution + exact filename). **Prefer the bare import.**
- The README (HEAD) documents a *third* spelling, `'frappe-charts/dist/frappe-charts.esm.js'` — that file also exists in 1.6.2 (200) but is the **non-minified** ESM. Works, but larger.
- **Conclusion:** bare `import { Chart } from 'frappe-charts'` is the verified-correct, smallest-surface choice. The TECH_BRIEF `.min.esm` variant is not "more correct" than bare — it's the same bundle reached a more fragile way.

### (B) CSS import — BROKEN in 1.6.2 **and** redundant → DELETE the line
- `dist/frappe-charts.min.css` returns **404** on both jsDelivr and unpkg for `1.6.2` (it ships in 1.6.1/1.6.3 but the untagged 1.6.2 publish omitted it). With `^1.6.2` resolving to 1.6.2, **Vite will throw "Failed to resolve import 'frappe-charts/dist/frappe-charts.min.css'" at build/dev.** This is almost certainly what the orchestrator's render sandbox will hit first.
- It is **also unnecessary**: the ESM/CJS/UMD bundles are built from `src/js/chart.js`, whose first line is `import '../css/charts.scss'`. `rollup-plugin-postcss` (no `extract` on those outputs) **inlines the CSS and injects it at runtime**. Verified in the *actual published 1.6.2 ESM*: it contains `var css_248z='.chart-container{position:relative;font-family:…}…'` plus a `styleInject()` that does `document.createElement("style")` → `head.appendChild`. So **importing `{ Chart }` already injects all chart styling.**
- **Fix:** remove line (B) entirely. (If you ever need to *override* styles, target `.chart-container`, `.axis`, `.chart-label`, `.graph-svg-tip` in your own CSS — the injected sheet is low-specificity.)
- ⚠️ Watch-out for the sandbox: if it `npm install`s and somehow lands a different 1.6.x, behaviour differs — but with the current lockfile-free `^1.6.2`, 1.6.2 is what installs.

---

## 2. SUPPORTED CHART TYPES (verified against the public dispatch, not just docs)

The **public type dispatch** is `getChartByType()` in `src/js/chart.js`:
```js
const chartTypes = { bar: AxisChart, line: AxisChart, percentage: PercentageChart,
                     heatmap: Heatmap, pie: PieChart, donut: DonutChart };
// 'axis-mixed'  -> AxisChart with options.type='line'  (multi-dataset bar+line)
// anything else -> console.error("Undefined chart type: <x>"); return undefined
```
So the **real, usable types** are: **`line`, `bar`, `axis-mixed`, `percentage`, `pie`, `donut`, `heatmap`**. README/docs (frappe.io/charts/docs) confirm exactly this set.

| Capability | Supported? | Evidence |
|---|---|---|
| **Line** (incl. **spline**, **area/`regionFill`**, **heatline**, **hideDots/hideLine**, dotSize) | ✅ | `lineOptions: { spline, regionFill, heatline, hideDots, hideLine, dotSize }` consumed in `AxisChart.setupComponents` |
| **Area** (filled line) | ✅ via `lineOptions.regionFill: 1` | README "Area and Trends"; line component `regionFill` |
| **Grouped (multi-dataset) bar** | ✅ | `AxisChart` lays out N bar datasets side-by-side; `barOptions.spaceRatio`; per-dataset `chartType:'bar'` |
| **Stacked bar** | ✅ | `barOptions.stacked` → `getAllYValues` builds `cumulativeYs` |
| **axis-mixed (bar+line together)** | ✅ | `type:'axis-mixed'`; each dataset sets its own `chartType` |
| **Multiple Y axes** | ✅ (rough) | `axisOptions.yAxis: [{id,position,...}]`, `axisID` per dataset; code path is fiddly (see `calcYAxisParameters` two-axis branch) |
| **Percentage** (single horizontal 100% bar) | ✅ | `PercentageChart` |
| **Pie / Donut** | ✅ | `PieChart`/`DonutChart`; hover lightens slice, tooltip shows `value %` |
| **Heatmap** (GitHub calendar) | ✅ | `Heatmap`; `discreteDomains`, `countLabel` |
| **Scatter** | ❌ **NO-OP** | not a key in `chartTypes` → `new Chart({type:'scatter'})` logs `"Undefined chart type: scatter"` and **returns undefined**. As a *dataset* `chartType` inside an axis chart it's silently coerced: `dataPrep()` forces non-`['line','bar']` types to `'line'`, and `setupComponents` only builds graph components for `chartType==='bar'\|\|'line'` — a scatter dataset renders **nothing**. |
| **Waterfall** | ❌ none | no type, no option |
| **Bubble / Radar / Gauge / Candlestick** | ❌ none | not in `ALL_CHART_TYPES` |
| **MultiAxisChart** | ❌ commented out | `// import MultiAxisChart` in `chart.js` |

> ⚠️ **Plan-contradiction:** `src/js/utils/constants.js` lists `ALL_CHART_TYPES = ["line","scatter","bar","percentage","heatmap","pie"]` and `COMPATIBLE_CHARTS` references scatter — so scatter *looks* supported from constants. It is **not wired into the public `Chart` dispatch** and is **not** in the documented type list (`axis-mixed,bar,line,pie,percentage,donut,heatmap`). Treat scatter as **unavailable**.

---

## 3. INTERACTIVITY (verified in source)

- **Tooltips:** on by default (`config.showTooltip = 1`). Axis charts bind `mousemove` on the container → nearest-x tooltip (`SvgTip`); pie/donut bind `mousemove`+`mouseleave` per slice. Formatters: `tooltipOptions.formatTooltipX`, `tooltipOptions.formatTooltipY`. ✅ Good for net-of-strike $ formatting.
- **Hover:** pie/donut slices lighten on hover (`lightenDarkenColor(color,50)`).
- **Click / selection events:** with `isNavigable: 1`, clicking a data unit (or arrow keys 37/39, Enter) fires a **`'data-select'`** CustomEvent on `chart.parent` with `{index, label, values}`. Subscribe via `chart.parent.addEventListener('data-select', …)`. ✅ This is the hook for "click a year on the staircase → update the panel".
- **Keyboard nav:** `isNavigable` wires arrows/Enter globally (only when the chart is in viewport). a11y caveat: it's `keydown` on `document`, not focus-scoped — fine for a single hero chart, noisy if several navigable charts coexist.
- **Annotations:** `data.yMarkers` (horizontal threshold lines) and `data.yRegions` (shaded bands) — **useful for football-field-ish thresholds and "target" lines** on axis charts.

---

## 4. THEMING / COLORS (verified)

- **`colors: ['#hex', …]`** option, one per dataset (axis/bar/line) or per label (pie/percentage). Accepts hex or a small set of named colors (`getColor`/`isValidColor`; invalid → `console.warn`). ✅ You can pass the studio's editorial palette (`amber #9C4A0C`, `teal #2F6E63`, …) directly.
- **No CSS-variable theming API.** Styling is the runtime-injected `css_248z` sheet (low specificity). Override by writing your own rules for `.chart-container`, `.axis`, `.chart-label`, `.graph-svg-tip`. The default `font-family` is the system stack — to get **IBM Plex** on chart labels you must override `.chart-container { font-family: … }` yourself (the chart will NOT inherit Fraunces/Plex automatically beyond the system stack). Minor but real for editorial consistency.
- Heatmap has its own fixed 5-step palettes (green/blue/yellow).

---

## 5. RESPONSIVENESS / RESIZE (verified — important caveat)

- README claims "responsive". In practice (`BaseChart.configure`): **`ResizeObserver` is commented out**; resize is handled only by `window` `resize` + `orientationchange` listeners → `draw(true)`.
- **Consequence:** the chart re-fits on **window** resize, but **not** when only its *container* changes size (e.g., a sidebar opening, a CSS grid reflow, a tab becoming visible) without a window resize. For a responsive Vue layout you will likely need to **call `chart.draw()` (or re-create) on container resize yourself** (wrap the parent in your own `ResizeObserver`). Also `draw()` early-returns if the parent `isHidden()` — charts created inside `display:none` tabs render at 0 width; re-draw on show.
- Width comes from the parent element's content width; **set an explicit `height`** (px) in options (no intrinsic aspect-ratio).

---

## 6. SVG EXPORT (verified)

- **`chart.export()`** exists (`BaseChart.export`) → `prepareForExport(this.svg)` + `downloadFile(title, [svg])` → triggers a **download of an `.svg` file**. ✅ Good for "export this chart" / print-to-PDF source. **Note: SVG only, not PNG/JPEG** — no rasterization. For the Proposition print view, SVG export + browser print is the path; PNG would need a custom canvas rasterizer.

---

## 7. VUE-3 REACTIVITY / UPDATE GOTCHAS (this is where the scaffold pattern matters)

The scaffold wraps `new Chart()` in `onMounted` + calls `chart.update()`. Verified behaviours of the update path (`BaseChart.update`):

1. **`new Chart(parent, opts)` returns the concrete chart instance** (the `Chart` constructor `return`s `getChartByType(...)`). Keep that return value; call methods on it. If `type` is bad it returns **`undefined`** → guard before calling `.update()`.
2. **`chart.update(newData)`** is the supported reactive path. It **`deepClone`s** the incoming data (unless internal `drawing=true`), so passing a Vue **reactive/proxy** object is safe — it won't keep a live reference and won't choke on proxies (it clones to plain objects). But it also means **mutating your reactive data in place will NOT update the chart**; you must call `chart.update()` explicitly. Pair with a `watch(..., () => chart.update(newData), { deep:true })`. Pass a **plain snapshot** (`JSON.parse(JSON.stringify(...))` or `toRaw`) to avoid cloning overhead/proxy edge cases.
3. **Animation is OFF by default** (`config.animate = 0`); `update()` only animates if you opted in. Good — no animation/timeout race on rapid reactive updates. (There is a legacy `INIT_CHART_UPDATE_TIMEOUT`/`CHART_POST_ANIMATE_TIMEOUT` path, but it's gated behind `animate`.)
4. **Granular API:** `addDataPoint(label, valuesPerDataset, index)`, `removeDataPoint(index)`, `updateDataset(values, index)`, `updateDatasets([...])`. For the studio's whole-recompute model, a single `chart.update({labels, datasets})` is simplest.
5. **Re-config is NOT supported by `update()`** — `update()` only swaps **data**, not `type`/`colors`/`axisOptions`. To change chart *type* or options you must **`chart.destroy()` (removes window listeners) and `new Chart()` again.** In Vue, `destroy()` + recreate in a `watch`, and `destroy()` in `onBeforeUnmount` to avoid leaking the `resize`/`orientationchange` listeners.
6. **Known update bug to avoid:** open issue **#409 "Missing legend causes uncaught errors when updating data"** — updating data on a chart rendered without a legend can throw. Mitigation: keep `showLegend` consistent across updates (don't toggle legend between renders); or recreate on legend changes.
7. Parent element is wiped on construct (`this.parent.innerHTML = ""`) — give each chart its own dedicated `<div>` ref, never share a node.

---

## 8. OPEN-ISSUE STATUS (verified via GitHub MCP, `frappe/charts`, OPEN issues)

- **#188 "Scatter seems to be broken"** is **CLOSED as completed** (2020-06-29, milestone "Close 25") — *not* currently open. ⚠️ **Plan-contradiction:** _CONTEXT/TECH_BRIEF imply #188 is the live tracker for scatter. It's closed; scatter wasn't fixed, it was **dropped from the documented/dispatched API** (see §2). So "scatter via frappe-charts" is a dead end regardless of #188's state.
- 60 OPEN issues total; **none** are active scatter/waterfall regressions. The only chart-shape-relevant open item is **#422** (feature request: total-in-tooltip for area `regionFill`). Other notable open issues touching our usage: **#409** (legend-less update errors — see §7), **#423** ("Stacked and Adjacent bars?" — you can't combine stacked + grouped in one axis chart), **#430/#395/#374/#308** (legend truncation/overlap on small widths → relevant to mobile/print, COM-31/COM-21).
- **No native waterfall** — confirmed by absence from `ALL_CHART_TYPES`, `chartTypes`, docs, and issues. Must be custom.

---

## 9. CHART DECISION TABLE (the deliverable)

For each studio chart: **library vs custom SVG**, **why**, **interactivity notes**.

| # | Studio chart (view) | Decision | Why (evidence) | Interactivity / notes |
|---|---|---|---|---|
| 1 | **Dilution / valuation staircase (steps)** — Board/Overview | **Custom SVG** (small) | No "step"/stepped-line type; line is straight-segment or spline only. Faking steps needs duplicated x-points and looks hacky. Staircase is ~10 `<rect>`/`<path>` steps — trivial custom. | Add your own hover/`title` per step; or render as **`bar`** if a stepped bar reading is acceptable (then you get frappe tooltips + `data-select` for free). Recommend bar-as-staircase if click-to-select a round is wanted; custom SVG if true step outline is the design. |
| 2 | **Net-vs-gross line** — Advisors/Board | **frappe-charts `line` (2 datasets)** | Core competency. Two line datasets, distinct `colors`. | Tooltips with `formatTooltipY` for $ net-of-strike; `yMarkers` for a strike/target line. |
| 3 | **Upside curve (line / area)** — Advisors (COM-28) | **frappe-charts `line` + `lineOptions.regionFill:1`** (area), optional `spline:1` | Native area via `regionFill`; spline for a smooth curve. | Hover tooltip; consider `valuesOverPoints` off (cleaner). Set explicit `height`. |
| 4 | **Vesting timeline** — Advisors (COM-29) | **Custom SVG** | It's a Gantt-like horizontal timeline (cliff + linear vest). No timeline/Gantt type here (that's a *different* package, `frappe/gantt`, out of scope). Easy as positioned `<rect>`s + tick labels. | Custom hover/tooltip if needed; static is fine. (If a real Gantt is ever wanted, `frappe-gantt` is the sibling lib — not frappe-charts.) |
| 5 | **Football-field ranges** — Compare/Proposition | **Custom SVG** | Floating min–max range bars per scenario = a "bar with a non-zero start" (range/floating bar). frappe-charts bars are zero-anchored; no floating-bar/range type. `yRegions` shades full-width bands, not per-category ranges. Custom is ~N `<rect>`s. | Add per-bar `<title>` or a hand-rolled tooltip. Low effort, full control over the editorial look. |
| 6 | **Comp mix (percentage)** — Advisors/Board | **frappe-charts `percentage`** (or `pie`/`donut`) | Exactly the `percentage` chart (single 100% stacked bar) or donut. Native. | Hover shows `value %` (pie/donut). `maxSlices`/`maxLegendPoints` to cap. Watch legend truncation on narrow widths (#395/#374) → may need custom legend on mobile. |
| 7 | **Growth waterfall** — Advisors (COM-17) | **Custom SVG** | **No native waterfall** (confirmed). Could fake with a stacked bar + transparent "base" dataset, but labels/connectors/coloring-by-sign are painful and fragile. Custom SVG (floating rects + connectors + +/- coloring) is cleaner and matches the editorial palette. | Hand-rolled hover/tooltip. This is the single biggest "don't fight the library" call. |
| 8 | **Potential scatter** — Board (COM-26) | **Custom SVG** (mandatory) | **Scatter is a no-op** in 1.6.x: `type:'scatter'` returns undefined; as a dataset type it's coerced to line and renders nothing (§2). #188 closed without a real fix. | Plot `<circle>`s on linear x/y scales; add `<title>` tooltips or reuse your own tooltip component. Small, and you control quadrant labels. |
| 9 | **Scenario grouped bar** — Compare (COM-19) | **frappe-charts grouped `bar`** (or `axis-mixed`) | Core competency: multiple datasets → side-by-side grouped bars; or `axis-mixed` to overlay a line (e.g., a reference value). | `data-select` (set `isNavigable:1`) to click a scenario; `formatTooltipY` for $; `colors` = palette. |

**Summary split:** frappe-charts handles **#2 net-vs-gross, #3 upside area, #6 comp mix, #9 scenario grouped bar** cleanly (and #1 staircase *if* rendered as a bar). Custom SVG for **#4 vesting, #5 football-field, #7 waterfall, #8 scatter** (and #1 if a true step outline). That's **~4–5 library / ~4–5 custom** — frappe-charts earns its place but is **not** sufficient alone; the FrappeChart.vue wrapper (COM-16) + a small custom-SVG kit (COM-27) is the right architecture, exactly as the COM map already splits them.

---

## 10. RECOMMENDATIONS (actionable)

1. **Keep `frappe-charts@^1.6.2`** — MIT, zero-dep, framework-agnostic, no bundle bloat. It is genuinely worth it for line/bar/area/percentage/pie/donut/heatmap.
2. **Fix `FrappeChart.vue` imports now (COM-8/COM-16):**
   - Keep `import { Chart } from 'frappe-charts'` (bare = ESM via `module`). ✅
   - **Delete `import 'frappe-charts/dist/frappe-charts.min.css'`** — it 404s in 1.6.2 and is redundant (ESM self-injects CSS). This is the most likely blocker for the orchestrator's render test.
3. **Wrapper contract (Vue):** create with `new Chart(el, opts)`, **guard the undefined return**, store the instance; `watch` data → `chart.update(plainSnapshot)`; **destroy + recreate** on type/option changes; `chart.destroy()` in `onBeforeUnmount`; add a `ResizeObserver` on the wrapper that calls `chart.draw()` (don't rely on the library — its `ResizeObserver` is commented out); re-draw when a hidden tab becomes visible.
4. **Theming:** pass `colors:[…studio palette…]`; add a global CSS override for `.chart-container{font-family:'IBM Plex Sans',…}` and tweak `.axis`/`.chart-label` fills to match `ink`.
5. **Build the custom-SVG kit (COM-27)** for waterfall, football-field, vesting timeline, scatter (and optionally true-step staircase). These are small, fully themeable, and avoid fighting the library.
6. **Don't** plan on PNG export from the library — `export()` is SVG-only.
7. Re-test the CSS import assumption inside the orchestrator sandbox (it installs deps) — but expectation is firm: **1.6.2 has no `dist/*.css`.**

---

### Sources
- npm metadata: `npm view frappe-charts version license main module exports dependencies peerDependencies versions` → 1.6.2, MIT, module=`dist/frappe-charts.min.esm.js`, main=`dist/frappe-charts.min.cjs.js`, no exports, no deps.
- Published dist probes (HTTP status): `https://cdn.jsdelivr.net/npm/frappe-charts@1.6.2/dist/*` and `https://unpkg.com/frappe-charts@1.6.2/dist/frappe-charts.min.css` (404) vs `@1.6.1/.../frappe-charts.min.css` (200, returns CSS).
- Source (frappe/charts via GitHub MCP): `src/js/chart.js` (dispatch + `import '../css/charts.scss'`), `src/js/utils/constants.js` (`ALL_CHART_TYPES`, `AXIS_DATASET_CHART_TYPES`), `src/js/utils/axis-chart-utils.js` (`dataPrep` type-coercion), `src/js/charts/AxisChart.js` (bar/line components, `data-select`, tooltips, `export`), `src/js/charts/BaseChart.js` (`update`/`deepClone`, `export()`, resize via window only, `ResizeObserver` commented out), `src/js/charts/PieChart.js` (hover/tooltip/`data-select`), `rollup.config.js@v1.6.1` (postcss inject vs `extract` of `dist/frappe-charts.min.css`).
- Published 1.6.2 ESM CSS injection: `dist/frappe-charts.min.esm.js` contains `var css_248z='.chart-container{…}'` + `styleInject()` creating a `<style>` in `<head>`.
- README (`frappe/charts` HEAD): documented import paths, `type:'axis-mixed'|'bar'|'line'|'scatter'|'pie'|'percentage'`, methods `update/addDataPoint/removeDataPoint/updateDataset/export/destroy`, `data-select` event; example dataset includes negative values in mixed bar+line.
- Docs (frappe.io/charts/docs via WebFetch): documented types `axis-mixed,bar,line,pie,percentage,donut,heatmap` (no scatter); option groups `barOptions/lineOptions/axisOptions/tooltipOptions`, `isNavigable`, `valuesOverPoints`.
- Issues (GitHub MCP, frappe/charts): **#188 CLOSED/completed 2020-06-29**; 60 open issues, relevant: #409 (legend-less update error), #423 (stacked+adjacent bars), #422 (area tooltip total), #430/#395/#374/#308 (legend truncation/overlap).
