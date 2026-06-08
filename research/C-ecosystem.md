# Lane C — Frappe ecosystem context, stack currency & licensing

> Scope: justify FRONTEND-ONLY on Vercel; survey Frappe frontend patterns; nail down
> licensing (frappe-ui, frappe-charts, frappe framework); produce a version-compatibility
> matrix vs. current latest and recommend exact pins. Every external claim is cited.
> Verified empirically against published npm manifests + GitHub source on 2026-06-08.

---

## 0. TL;DR (decision-relevant)

- **Frontend-only on Vercel is correct and unavoidable.** Frappe Framework's backend is a
  stateful Python (Gunicorn/Werkzeug) + **MariaDB** + **Redis** + **Node Socket.IO** + background-worker
  monolith orchestrated by `bench`. Vercel hosts static assets + stateless serverless/Edge
  ("Fluid") functions — it cannot run that monolith. **But** `frappe-ui` and `frappe-charts`
  are plain npm packages that compile to static JS/CSS and deploy to Vercel fine. The split is
  clean: take the *view* libraries, leave the *server*.
- **Licensing is all-clear.** frappe-ui = **MIT**, frappe-charts = **MIT**, **and Frappe Framework
  itself = MIT** (verified from each repo's LICENSE + `package.json`). **No GPL/AGPL contagion**
  for an internal proprietary tool. (GPLv3 only attaches to **ERPNext**, the business app we do
  not use.)
- **Three plan claims are WRONG against the published packages** and will break the build if
  copied verbatim: (1) the frappe-ui style import path, (2) the frappe-ui Tailwind preset path,
  (3) the frappe-charts CSS import — **there is no CSS file in frappe-charts' dist at all**.
- **One plan claim is STALE:** "frappe-charts scatter is broken (#188)". Issue #188 is **CLOSED**
  (it was a v1.1.0 / 2018 bug). Scatter is a first-class supported chart type in 1.6.x.
- **Hard version constraint discovered:** frappe-ui (both the stable `0.1.x` line **and** the
  `1.0.0-beta` line) declares **`peerDependencies.vue: ">=3.5.0"`**. The scaffold pins `vue ^3.4.21`,
  which is **below frappe-ui's floor**. Installing frappe-ui forces a Vue **3.4 → 3.5** bump.
- **`vp` (Vite+) is alpha** and must stay out of the build/deploy path — confirmed already true in
  the scaffold (npm scripts are plain `vite`). Keep it that way.

---

## 1. Why FRONTEND-ONLY — what Frappe is, and why the backend can't go on Vercel

### 1.1 What Frappe Framework / ERPNext actually are
- **Frappe Framework** is a full-stack, batteries-included **web framework written in Python and
  JavaScript** ("Low code web framework for real world applications, in Python and Javascript").
  It is a *server* framework: it owns the database schema (DocTypes), an ORM, auth/session, a REST
  + RPC API, server-side rendering (Jinja), background jobs, realtime, and an admin UI ("Desk").
  Source: repo description + tree, https://github.com/frappe/frappe.
- **ERPNext** is the large business application (accounting, inventory, HR, …) **built on top of**
  Frappe Framework. It is a separate app and is **GPLv3** (the framework is not). We use neither
  ERPNext nor any Frappe backend.

### 1.2 The backend is a stateful, multi-process monolith
Verified directly from the `frappe/frappe` repo root (https://github.com/frappe/frappe):
- `pyproject.toml` → it's a **Python** package (Gunicorn/Werkzeug WSGI app).
- `socketio.js` + `realtime/` → a long-running **Node.js Socket.IO** service for realtime, backed by
  **Redis pub/sub**.
- Runtime dependencies (corroborated by Frappe docs + community write-ups): **MariaDB/MySQL** for
  data, **Redis** for cache + queue + socketio pub/sub, **background workers** consuming a Redis
  queue (`frappe.enqueue`), and **Nginx** as reverse proxy in production. The dev stack alone boots
  "a Python web server (Gunicorn), redis servers for caching, job queuing and socketio pub-sub,
  background workers, a node server for socketio and a node server for compiling JS/CSS."
  Sources: https://github.com/frappe/frappe ; https://deepwiki.com/frappe/frappe/2.6-real-time-communication-and-background-jobs ; https://gavv.in/blog/how-does-frappe-work/
- It is orchestrated by **`bench`** (a Python CLI/process manager via Procfile/supervisor). This is
  the canonical install path. Source: https://docs.frappe.io/framework/user/en/tutorial/install-and-setup-bench

### 1.3 Why Vercel cannot host it (precise version — don't overstate)
- **Vercel runs:** (a) static assets/CDN, and (b) **stateless** Serverless / Edge / "Fluid Compute"
  functions that scale to zero and **do not retain local state or long-lived connections**. Vercel
  *does* run **Python** serverless functions — so "Vercel can't do Python" would be **wrong**.
- **The blocker is not the language; it's the topology.** Frappe needs:
  - a **persistent MariaDB** server (Vercel has no managed MariaDB; serverless funcs can't be one),
  - a **persistent Redis** for queue/cache/pub-sub (stateful, always-on),
  - **always-on background workers** (no scale-to-zero; Vercel functions are request-scoped — Cron
    Jobs are scheduled invocations, not resident workers),
  - a **long-lived WebSocket/Socket.IO** server with Redis pub-sub (incompatible with stateless,
    short-lived function invocations),
  - `bench`/supervisor managing several resident processes (a VM/container concern, not a
    function-host concern).
  None of these map onto Vercel's stateless function + static-CDN model. Frappe is deployed via
  Docker/VM/k8s (`frappe_docker`), not a function host. Source: https://github.com/frappe/frappe_docker/blob/main/docs/getting-started.md
- **What DOES deploy to Vercel:** `frappe-ui` and `frappe-charts` are ordinary npm libraries. Under
  Vite they compile to static **JS/CSS** with **no server runtime**. `frappe-ui` is `"type":"module"`,
  `"sideEffects": false`, ESM source — i.e. tree-shakeable static output. So the *frontend* half is a
  perfect Vercel fit; only the *backend* half is impossible. This is exactly the project's plan.

**Verdict:** FRONTEND-ONLY is not a compromise, it's the only coherent option. Reuse Frappe's view
libraries (MIT), re-implement the maths in `engine.ts` (already done), and never stand up a Frappe
server. Vercel build stays `npm run build` → `dist` with an SPA rewrite.

---

## 2. Frappe frontend patterns survey (Doppio / Builder / standalone)

### 2.1 The blessed path is backend-coupled
Frappe's official way to ship a Vue/React SPA inside the ecosystem is **Doppio**
(https://github.com/NagariaHussain/doppio) — a *Frappe app/CLI* (`bench add-spa --app <app>
[--tailwindcss] [--typescript]`, `bench ... add-desk-page`) that scaffolds a Vite + Vue/React
frontend **inside a Frappe app** and wires Vite's dev proxy to the Frappe site. It also has a
one-command `frappe-ui` starter. By construction it assumes a running Frappe backend.
Sources: https://github.com/NagariaHussain/doppio ; https://github.com/NagariaHussain/doppio_frappeui_starter

The official **`doppio_frappeui_starter`** (Vue 3 + Vite + Tailwind + frappe-ui) README is explicit:
*"This template is meant to be cloned inside an existing Frappe App"*, the dev server *"is configured
to proxy your frappe app (usually running on port 8000)"*, and in production the **CSRF token is
embedded in the Frappe-rendered HTML**. So the *blessed* frontend path is **not** standalone — it
presumes Frappe serves the shell and the API. Source: https://github.com/NagariaHussain/doppio_frappeui_starter

### 2.2 Frappe Builder
**Frappe Builder** is a no-code/low-code *visual website builder* that is itself a Frappe app (built
*with* frappe-ui) — it generates pages served by Frappe. It is **not** a way to export a standalone
SPA and is irrelevant to a Vercel-hosted, hand-coded tool. (Listed here only to close the loop on
"frontend patterns"; not a fit.)

### 2.3 The "frappe-ui standalone (no backend)" path — how supported?
- **Technically supported, officially under-documented.** The frappe-ui README's own quick-start is
  backend-agnostic: `npm install frappe-ui`, then `app.use(FrappeUI)` and import the stylesheet — no
  backend required to render components. Source (via context7, frappe-ui readme):
  `import { FrappeUI } from 'frappe-ui'; app.use(FrappeUI)`.
- **The split is by *layer*, not by package:** the **component layer** (Button, Dialog, FormControl,
  ListView, TextEditor, etc.) is pure Vue + Tailwind and renders with no server. The **data layer**
  (`createResource`, `createListResource`, `createDocumentResource`, `createListManager`, `useList`,
  and `frappeRequest`/`setConfig('resourceFetcher', frappeRequest)`) is **built for a Frappe REST/RPC
  backend** — `frappeRequest` literally unwraps Frappe's `message`/`exc` response envelope and lets
  you drop the `/api/method` prefix. Source: frappe-ui docs `data-fetching/resource.md` (via context7).
  → **Confirms plan claim #5:** the data composables are out of scope for a static SPA. Use only the
  component layer; never import the resource/`frappeRequest` machinery (it would pull socket.io-client
  and assume an API origin).
- **Practical caveat:** because the *blessed* templates all assume a backend, standalone users hit two
  rough edges that this project must own itself: (a) Tailwind **preset + content globs** must be wired
  by hand (frappe-ui ships unbundled `src/` — see §4.4), and (b) you inherit frappe-ui's **Inter/
  "Espresso"** design tokens, which clash with this project's Fraunces/IBM Plex "paper" language
  (noted in `_CONTEXT.md`). Standalone works; it is just not turn-key.

**Bottom line:** standalone frappe-ui (component layer only) is a real, supported configuration, but
you are off the paved road — expect to configure Tailwind/styles manually and to restyle or override
the default theme. This reinforces Lane A's "use a thin subset" thrust.

---

## 3. LICENSING

### 3.1 License table (verified from each repo's LICENSE + manifest `"license"`)

| Package / project | Version checked | License | Evidence |
|---|---|---|---|
| **frappe-ui** | `0.1.278` (npm `latest`) and `1.0.0-beta.4` (GitHub `main`) | **MIT** | `license.md` (MIT text) + `package.json "license":"MIT"` — https://github.com/frappe/frappe-ui |
| **frappe-charts** | `1.6.2` (npm `latest`), `v1.6.3` (GitHub `main`) | **MIT** | `LICENSE` (MIT, © 2017 Prateeksha Singh) + `package.json "license":"MIT"` — https://github.com/frappe/charts |
| **Frappe Framework** (`frappe/frappe`) | `develop` | **MIT** | `LICENSE` = "The MIT License", © 2016-2021 Frappe Technologies — https://github.com/frappe/frappe/blob/develop/LICENSE |
| ERPNext (NOT used) | — | **GPLv3** | for contrast only; we don't depend on it |

### 3.2 Contagion analysis for an internal-but-proprietary tool
- **No copyleft anywhere in our dependency set.** MIT is permissive: use, modify, ship in proprietary
  software; the only obligation is to **retain the copyright + permission notice** in copies/
  substantial portions. There is **no source-disclosure** requirement (unlike GPL) and **no
  network-use** trigger (unlike AGPL).
- Because the tool is **internal** (not "conveyed" to third parties), even a hypothetical GPL dep
  would be low-risk — but it's moot: **everything is MIT.**
- **Does Frappe Framework's license matter to us?** No, for two reasons: (1) we don't ship or run the
  framework at all (frontend-only), and (2) even if we did vendor a snippet, it's MIT. The thing to
  *avoid* is pulling in **ERPNext** code (GPLv3) — which the plan never does.
- **Practical action:** when bundling for production, keep the MIT notices for frappe-ui and
  frappe-charts in a `THIRD-PARTY-NOTICES`/license file. (frappe-ui's deep dep tree — TipTap, Headless
  UI, reka-ui, echarts, etc. — is overwhelmingly MIT/permissive, but if you tree-shake them away they
  don't ship and don't need attribution. echarts is **Apache-2.0**; relevant only if you actually
  import a frappe-ui component that uses it.)

---

## 4. VERSION-COMPATIBILITY MATRIX

### 4.1 Pins vs. current latest (npm registry, 2026-06-08)

| Package | Scaffold pin | Latest (`dist-tags.latest`) | Notable pre-release | Compatible w/ scaffold? | Note |
|---|---|---|---|---|---|
| `vue` | `^3.4.21` | **3.5.35** | `3.6.0-beta.14` | ✅ resolves to 3.5.x | **but** floor must rise — frappe-ui needs `>=3.5.0` (see 4.3) |
| `vite` | `^5.2.10` | **8.0.16** | `8.0.0-beta.18` | ✅ on Vite 5 | frappe-ui dev-builds on Vite 7; does NOT force our Vite major (it's a dep, not a peer) |
| `@vitejs/plugin-vue` | `^5.0.4` | **6.0.7** | — | ✅ v5 ↔ Vite 5 + Vue 3 | plugin-vue 5 pairs with Vite 5; do **not** jump to 6 unless Vite ≥6 |
| `tailwindcss` | `^3.4.3` | **4.3.0** | `4.0.0` (next) | ✅ on v3 | **DO NOT upgrade to v4** — frappe-ui ships a **v3** preset/PostCSS setup (see 4.5) |
| `typescript` | `^5.4.5` | **6.0.3** | `6.0.0-beta` | ✅ on 5.4 | TS 6 is new; vue-tsc 2 won't support it — stay on 5.x |
| `vue-tsc` | `^2.0.13` | **3.3.4** | — | ✅ v2 ↔ Vue 3.4/3.5, TS 5.x | frappe-ui dev-uses vue-tsc 3; for *our* typecheck v2 is fine on TS 5.x. (If you later adopt TS 6 you'd need vue-tsc 3.) |
| `vue-router` | `^4.3.0` | **5.1.0** | `5.0.0-beta.2` | ✅ on v4 | frappe-ui peer = `vue-router ^4.1.6`; **do NOT go to vue-router 5** |
| `autoprefixer` | `^10.4.19` | **10.5.0** | — | ✅ | within v10 |
| `postcss` | `^8.4.38` | **8.5.15** | — | ✅ | within v8 |
| `frappe-charts` | `^1.6.2` | **1.6.2** | `2.0.0-rc27` (next) | ✅ exact latest | a `2.0.0-rc` exists but is unreleased-stable; **stay on 1.6.x** |
| **`frappe-ui`** | *(unpinned — not installed)* | **0.1.278** | `1.0.0-beta.4` (beta) | ⚠️ see 4.3 | `npm i frappe-ui` resolves to **0.1.278**, NOT the beta. Both lines need Vue ≥3.5. |

Evidence: npm registry `dist-tags`/manifests fetched 2026-06-08; frappe-ui `0.1.278` and `1.0.0-beta.4`
manifests; frappe-charts `1.6.2` manifest. (npm `view`/`curl` were blocked locally; values fetched via
the npm registry + jsdelivr over WebFetch.)

### 4.2 Are the scaffold pins mutually compatible? — YES (as a Vue-3/Vite-5/Tailwind-3 set)
The scaffold's own seven-package set (Vue 3.4/3.5 · Vite 5 · plugin-vue 5 · Tailwind 3.4 · TS 5.4 ·
vue-tsc 2 · vue-router 4) is internally consistent and builds today. The conflicts appear **only when
`frappe-ui` is added** (next section). frappe-charts 1.6.2 is framework-agnostic (vanilla JS, no Vue
peer) so it imposes no constraint.

### 4.3 ⚠️ Hard constraint: frappe-ui requires **Vue ≥ 3.5** (contradicts the 3.4 pin)
- **Both** the stable `0.1.278` **and** the `1.0.0-beta.4` manifests declare:
  `"peerDependencies": { "vue": ">=3.5.0", "vue-router": "^4.1.6" }`.
- The scaffold pins `vue ^3.4.21`. `^3.4.21` *can* float up to 3.5.x, but the **committed intent (3.4)
  is below frappe-ui's floor.** On `npm i frappe-ui` you'll get a peer-dependency warning unless Vue is
  ≥3.5. (reka-ui, a frappe-ui dep, only needs `vue >=3.2` — so the binding constraint is frappe-ui's own
  declared peer, not its transitive deps.)
- **Fix:** bump the Vue pin to **`^3.5.0`** (resolves to 3.5.35 today) before/at frappe-ui install.
  Vue 3.5 is backward-compatible with 3.4 app code; vue-tsc 2 and plugin-vue 5 both support 3.5. Low risk.

### 4.4 frappe-ui ships **unbundled `src/`** (no `dist/`) — affects imports & Tailwind
- Verified: frappe-ui `0.1.278` has **no `dist/` directory**. `package.json "exports"` maps `"."` →
  `./src/index.ts`, `"./style.css"` → `./src/style.css`, `"./tailwind"` → `./tailwind/index.js`.
  (jsdelivr file listing confirms `/src/index.ts`, `/src/style.css`, `/tailwind/index.js`,
  `/tailwind/preset.js`, and a legacy `/src/utils/tailwind.config.js` all exist.)
- Consequence: frappe-ui is **compiled by *your* Vite/Tailwind**, not pre-built. That's why the
  scaffold already globs `./node_modules/frappe-ui/src/**/*` in Tailwind `content` — correct and
  necessary. It also means you import from source paths (`frappe-ui/style.css`, `frappe-ui/tailwind`),
  not `dist/...`.

### 4.5 Tailwind v4 is a TRAP for this project
- frappe-ui's manifests pin **`tailwindcss ^3.2.7`** (dev) and its preset is a classic **Tailwind v3
  preset** (`tailwind/preset.js` consumed via `presets: [...]`, plus `@tailwindcss/forms`,
  `@tailwindcss/typography`, `@tailwindcss/line-clamp`). Tailwind **v4** removes the JS-preset/`content`
  model in favor of CSS-first `@theme`/`@import "tailwindcss"` and a new PostCSS/Vite plugin — the v3
  preset will **not** load under v4 unchanged. Source: tailwindcss npm `dist-tags` (`latest=4.3.0`) +
  frappe-ui manifest. → **Stay on Tailwind 3.4.x.** Do not adopt v4 while using frappe-ui's preset.
- Vite 6/7/8 and Vue 3.6: all exist as latest/next, but none are required. **Stay on Vite 5** for now;
  it's the validated pairing with plugin-vue 5. (frappe-ui *develops* on Vite 7, but consumes your Vite
  — no forced major bump.)

### 4.6 Recommended exact pins (frontend-only, frappe-ui component-layer subset)
```jsonc
{
  "dependencies": {
    "vue": "^3.5.0",            // RAISE from ^3.4.21 — frappe-ui peer floor is >=3.5.0
    "vue-router": "^4.3.0",     // keep on v4 (frappe-ui peer ^4.1.6); do NOT go to 5.x
    "frappe-charts": "^1.6.2",  // keep on 1.6.x; ignore the 2.0.0-rc
    "frappe-ui": "0.1.278"      // pin EXACT (no caret). It's the npm `latest`; lock the resolved
                                // version. Do NOT install the 1.0.0-beta unless deliberately testing it.
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",  // pairs with Vite 5
    "vite": "^5.2.10",               // stay on 5; do NOT jump to 6/7/8 yet
    "tailwindcss": "^3.4.3",         // STAY on v3 — v4 breaks frappe-ui's preset
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "typescript": "^5.4.5",          // stay on 5.x (TS 6 needs vue-tsc 3)
    "vue-tsc": "^2.0.13"             // v2 OK on TS 5.x + Vue 3.5
  }
}
```
- **If you decide to skip frappe-ui entirely** (Overview already uses zero frappe-ui components — see
  Lane A/D), then the Vue floor can stay at `^3.4.21` and there is no Tailwind-v3 lock from frappe-ui.
  The only remaining Frappe dep is frappe-charts (vanilla, unconstrained). This is the lowest-risk
  config.
- **`vp` / Vite+:** alpha. Keep it as a *local dev convenience only*; the committed `package.json`
  scripts (`dev`/`build`/`preview`) must remain plain `vite` so Vercel + CI never need `vp`. Already
  true in the scaffold — do not regress.

---

## 5. frappe-charts specifics (corrects two plan claims)

### 5.1 Supported chart types (from source `src/js/utils/constants.js`)
`ALL_CHART_TYPES = ["line", "scatter", "bar", "percentage", "heatmap", "pie"]` (+ `donut` appears in
`DEFAULT_COLORS`; `axis-mixed` is the mixed-axis mode). Source:
https://github.com/frappe/charts/blob/main/src/js/utils/constants.js
→ **No native:** waterfall, football-field/range, stepped/staircase line, grouped-vs-stacked-together,
scatter-with-trend. These map to the project's needs as follows:
  - dilution/valuation **staircase**, **growth waterfall**, **football-field**, **vesting timeline** →
    **custom SVG** (matches `_CONTEXT.md` plan and reference's recharts usage). Stepped-line is an
    *open, unimplemented* feature request (#373) — confirms no native staircase.
  - **net-vs-gross line**, **upside curve** (line/area via `lineOptions.regionFill`), **comp mix**
    (`percentage`), **scenario grouped bar** (`bar`), **potential scatter** (`scatter`) → **frappe-charts
    fits**.

### 5.2 ⚠️ Plan claim #6 is STALE: scatter is NOT broken
Issue **frappe/charts#188 "Scatter seems to be broken"** is **CLOSED** — it was filed against **v1.1.0**
in **2018** (milestone "Close 25"). Scatter is a declared, first-class type in 1.6.x (`scatter` in
`ALL_CHART_TYPES` and in every `COMPATIBLE_CHARTS` entry). Source:
https://github.com/frappe/charts/issues/188 + constants.js above.
→ Treat scatter as usable. (If a *current* rendering edge appears in the orchestrator's live render
test, log a fresh issue number — #188 is not it.)

### 5.3 ⚠️ Plan claim #4 is WRONG: there is NO `frappe-charts.min.css`
The published `frappe-charts@1.6.2` `dist/` contains **only JS** (+ source maps):
`frappe-charts.esm.js`, `frappe-charts.min.esm.js(.map)`, `frappe-charts.min.cjs.js(.map)`,
`frappe-charts.min.umd.js(.map)`. **No `.css` file exists.** Source: jsdelivr flat listing for
`frappe-charts@1.6.2`.
→ The scaffold's `FrappeChart.vue` import `'frappe-charts/dist/frappe-charts.min.css'` **will fail to
resolve** (and the plan's claim #4 CSS path is wrong). frappe-charts **injects its styles from the JS
bundle** (built with rollup-plugin-scss; styles are inlined). **Action:** delete the CSS import; the
chart styles come in with the JS. (If finer control is wanted, copy the SCSS from `src/scss` and compile
it yourself — but it is not required for rendering.)

### 5.4 frappe-charts ESM import path (refines plan claim #4)
- `package.json`: `"main": "dist/frappe-charts.min.cjs.js"`, `"module": "dist/frappe-charts.min.esm.js"`,
  `"browser": "...umd.js"`. **No `"exports"` map.**
- So a **bare** `import { Chart } from 'frappe-charts'` (what the scaffold uses) correctly resolves to
  the **ESM** build via the `"module"` field under Vite. ✅ Keep the bare specifier.
- The plan's alt path `'frappe-charts/dist/frappe-charts.min.esm'` (no extension) is **not reliable** —
  with no `"exports"` map and ESM rules, prefer either the bare specifier or the **full** filename
  `'frappe-charts/dist/frappe-charts.min.esm.js'`. Don't ship the extension-less form.

---

## 6. Plan-claim verdicts (quick reference)

| # | Plan claim | Verdict | Correct fact (source) |
|---|---|---|---|
| 1 | Preset path `require('frappe-ui/src/utils/tailwind.config')` | ⚠️ Works but not canonical | Legacy `src/utils/tailwind.config.js` still exists, but the published export is **`frappe-ui/tailwind`** (→ `tailwind/index.js`). Use the export. (frappe-ui manifest exports + jsdelivr) |
| 2 | `import { FrappeUI } from 'frappe-ui'; app.use(FrappeUI)` | ✅ Correct | Matches frappe-ui README quick-start (context7). Only needed if you actually use frappe-ui components. |
| 3 | Styles `import 'frappe-ui/dist/style.css'` | ❌ Wrong | There is **no `dist/`**. It's **`frappe-ui/style.css`** → `src/style.css` (manifest exports). |
| 4 | frappe-charts ESM `…min.esm` + CSS `…min.css` | ❌ Partly wrong | Use bare `'frappe-charts'` (or full `…min.esm.js`). **No CSS file exists** — remove the CSS import. (jsdelivr listing + manifest) |
| 5 | Data composables assume a Frappe backend → out of scope | ✅ Confirmed | `frappeRequest` unwraps Frappe `message`/`exc`; resource layer is backend-bound. Use component layer only. (frappe-ui docs via context7) |
| 6 | scatter broken (#188); no native waterfall | ⚠️ Half stale / half true | #188 **CLOSED** (2018, v1.1.0) — scatter works. **No native waterfall/football-field/staircase** is **true** → custom SVG. (issue #188 + constants.js) |
| 7 | Peer deps: Vue 3 only? TW v3 vs v4? bundle pulls TipTap/Headless UI? | ✅ Confirmed + sharpened | frappe-ui peer **vue ≥3.5**, **vue-router ^4**; dev on **Tailwind v3** (preset is v3); deps **do** include TipTap 3, @headlessui/vue, reka-ui, echarts, socket.io-client → tree-shake hard, import only the components you use. (frappe-ui 0.1.278 manifest) |

---

## 7. Open questions (only the sandbox / live render or Robin can settle)
- Does the orchestrator's **live Vite render** of frappe-charts show styles applied with the CSS import
  *removed* (confirming styles inject from JS)? Expected: yes.
- Does importing even one frappe-ui component (e.g. `Button`) pull a heavy transitive (echarts/TipTap)
  into the bundle, or does `sideEffects:false` + per-component import keep it lean? Needs a real
  `vite build` + bundle-analyzer pass — affects the "is frappe-ui worth it" decision (Lane A owns the
  subset call; this lane confirms the licensing/version side is clear either way).
- **Decision for Robin:** adopt frappe-ui component layer (accept Vue→3.5 bump + Tailwind-v3 lock +
  restyle to the paper theme), **or** skip frappe-ui entirely and keep frappe-charts + custom SVG +
  hand-rolled Tailwind (lowest-risk; Overview already proves this works with zero frappe-ui). Licensing
  and version-currency do not block either path.
