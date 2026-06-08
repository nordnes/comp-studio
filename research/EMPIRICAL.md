# Empirical sandbox verification (authoritative — overrides docs)

> **⚑ POST-GATE NOTE (2026-06-08):** Robin chose to **ADOPT `frappe-ui` as-is** (see `research/FINDINGS.md` banner + `TECH_BRIEF.md`). Every **fact** in this file stands and is now the **adoption guide** — the corrected recipe below is the **primary, wired** integration path (already build-green in `scaffold/`). Only the Phase-0 *recommendation* ("Recommend: do NOT adopt", in the Verdict-implication section) is **superseded**; it is kept as the evaluation record.

**What:** a throwaway Vite + Vue 3 + Tailwind app in `/tmp/claude/comp-studio-sandbox/app`, with `frappe-ui` + `frappe-charts` installed and rendered **with no Frappe backend**. Run by the orchestrator, 2026-06-08. This file records ground truth; where it disagrees with `TECH_BRIEF.md` or the research lanes, this wins.

## Versions actually installed (npm `latest`, this date)
| pkg | resolved | notes |
|---|---|---|
| vue | **3.5.35** | had to bump from scaffold's `^3.4.21` — frappe-ui peerDep is `vue >=3.5.0` |
| frappe-ui | **0.1.278** | MIT. npm `latest`. (`1.0.0-beta.4` exists only on GitHub `main`/`beta` tag.) |
| frappe-charts | **1.6.2** | MIT, zero deps |
| tailwindcss | **3.4.19** | v3 (frappe-ui preset is v3-only) |
| vite | **8.0.16** | ⚠️ `npm create vite@latest` now scaffolds **Vite 8 (Rolldown)**. The real scaffold pins Vite 5 — fine, keep it. |

`frappe-ui` install = **26 MB**, **218 packages** added for the two libs (pulls reka-ui, @vueuse, ~35 @tiptap/*, echarts, @headlessui/vue, vue-sonner, socket.io-client, feather-icons…).

## VERIFIED working standalone recipe (if frappe-ui is adopted)
This is the *corrected* recipe — the `TECH_BRIEF.md` one does **not** build. All four pieces are required.

```ts
// vite.config.ts — the frappe-ui Vite plugin is REQUIRED just to build (its components'
// source uses `~icons/lucide/*` virtual imports). Disable the Frappe-site bits.
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import frappeui from 'frappe-ui/vite'
export default defineConfig({
  plugins: [ frappeui({ frappeProxy: false, jinjaBootData: false, buildConfig: false }), vue() ],
  optimizeDeps: { include: ['feather-icons'] }, // else DEV throws: feather-icons has no default export
})
```
```js
// tailwind.config.js  (ESM — the preset is ESM-only; a .cjs `require()` fails)
import frappeUIPreset from 'frappe-ui/tailwind'
export default { presets: [frappeUIPreset],
  content: ['./index.html','./src/**/*.{vue,js,ts}','./node_modules/frappe-ui/src/**/*.{vue,js,ts}'] }
```
```ts
// main.ts — import the stylesheet; do NOT app.use(FrappeUI) (see below)
import 'frappe-ui/style.css'   // NOT 'frappe-ui/dist/style.css'
// components are named imports: import { Button, Dialog, FormControl, Badge } from 'frappe-ui'
```

## The 5 things that broke (all contradict TECH_BRIEF / scaffold)
1. **`vue ^3.4.21` is below frappe-ui's floor** (`peerDependencies.vue: ">=3.5.0"`). Must bump to `^3.5`.
2. **`import 'frappe-ui/dist/style.css'` → no such file.** frappe-ui ships **no `dist/`**; `.` resolves to raw `src/index.ts`. Correct: **`import 'frappe-ui/style.css'`** (which `@import`s the **Inter** font + runs `@tailwind` with our preset).
3. **Preset path `require('frappe-ui/src/utils/tailwind.config')` is wrong** (deprecated shim, ESM-only, not in `exports`). Correct: **`import frappeUIPreset from 'frappe-ui/tailwind'`** in an **ESM** `tailwind.config.js`.
4. **`import 'frappe-charts/dist/frappe-charts.min.css'` → no such file in 1.6.2.** frappe-charts ships **zero CSS**; the ESM bundle **self-injects** its styles (`styleInject`). **Delete the CSS import line** (it breaks the Vite build). Bare `import { Chart } from 'frappe-charts'` is correct (resolves via `module` → `dist/frappe-charts.min.esm.js`).
5. **`app.use(FrappeUI)` is backend-bound and dangerous on a static SPA.** `frappe-ui/src/utils/plugin.js` defaults `{resources:true, call:true, socketio:true}` → it installs the Frappe RPC/resource layer and **calls `initSocket()`** (opens a socket.io connection). Standalone apps **skip the plugin** and import components by name. (Also: build-time, the `frappe-ui` barrel pulls TextEditor's `~icons/*` → needs `frappe-ui/vite`'s lucide resolver; and **`feather-icons` must be in `optimizeDeps`** or DEV renders nothing.)

## Bundle cost (production `vite build`, importing only Button/Badge/FormControl/Dialog)
| asset | raw | gzip |
|---|---|---|
| index.js | **510 KB** | ~148 KB |
| index.css | **174 KB** | ~21 KB |
| Inter.var + Inter-Italic.var (woff2) | **561 KB** | — (forced by `frappe-ui/style.css`) |

Tree-shaking **did** drop echarts / socket.io / vue-sonner / fuzzysort (grep = 0 in bundle), but TextEditor/TipTap still emitted async chunks (`FontColor`, `InsertIframe`), and the core still drags **reka-ui + @vueuse**. For an app whose only built view (`Overview.vue`) uses **zero** frappe-ui, this is a poor trade.

## frappe-charts — confirmed behaviour
- **Renders standalone**, line + grouped bar, with custom `colors`, tooltips, legend, axes — **no CSS import needed** (styles self-inject). See screenshot.
- **`scatter` is NOT implemented** in 1.6.2: the string `scatter` does **not appear anywhere** in the installed `dist/frappe-charts.min.esm.js` runtime (only `"Undefined chart type"` + `getChartByType`). Resolves the Lane B (no-op) vs Lane C (`constants.js` lists it) conflict **in B's favour** → **scatter must be custom SVG.**
- No native **waterfall**, **football-field/range bar**, **stepped/staircase line**, **vesting/Gantt** → custom SVG (engine already supplies coordinates).
- **Resize gotcha** (Lane B, from source): `ResizeObserver` is commented out; only `window.resize` is handled. The Vue wrapper must add its own `ResizeObserver` → `chart.draw()` and redraw on tab/route show (charts built inside a hidden view render at 0-width). `chart.update(data)` swaps data only; changing type/colors needs `destroy()` + `new Chart()`; call `destroy()` on unmount.

## Render proof
`research/sandbox-frappe-ui.png` — the standalone app (Vue 3.5 + Vite 8 + Tailwind 3.4, **no backend, no FrappeUI plugin**) showing frappe-ui Button/Badge/FormControl/Select/Checkbox/Dialog **and** frappe-charts line + grouped bar all rendering. Note the **Inter** typography + frappe styling — i.e. the design language is frappe's, not the studio's Fraunces/IBM-Plex editorial look.

## Verdict implication
frappe-ui **can** run frontend-only (proven) — but only via the corrected recipe above, at ~150 KB gz JS + 561 KB Inter + heavy transitive deps, while **overriding** the studio's design tokens and fonts. Its genuinely useful parts (Dialog/Combobox/Switch/Tooltip) are thin wrappers over `@headlessui/vue` + `@floating-ui/vue` that we can use directly, matching the already-working hand-rolled `Overview.vue`. → **Recommend: do NOT adopt frappe-ui; keep `frappe-charts` (corrected import) + custom SVG + headless-UI/Tailwind.** (Decision is reversible — the recipe above is the on-ramp if Robin wants frappe-ui later.)
