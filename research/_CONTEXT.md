# Shared research context — Advisor Comp Studio (Phase 0 hardening)

> Read this first. It is the single source of verified facts for all research lanes.
> This run **hardens the plan**; it does **not** build features. It ends at a review gate.

## Mission
Raiku Labs' **Advisory Board Compensation Studio** must ship as a **frontend-only static SPA on Vercel** (Vue 3 + Vite), reusing Frappe's open-source *frontend* libraries. **No Frappe/Python backend, no ERPNext.** The open question this research must answer **with evidence**: *is `frappe-ui` actually worth the dependency under the static-SPA constraint, and on which subset?* Be decisive; prefer empirical evidence over docs.

## Non-negotiables
- `engine/engine.ts` is the **frozen** maths (cap-table walk, net-of-strike valuation, scenario dilution, TGE-FDV multiplier, gating, channel capital, pools, roadmap CSV). Verified **22/22** (`node engine/engine.test.mjs`). Reconciles: bridge **57,217** FD → Series C **118,707**; strike **$1,572.95**; base TGE FDV **$600M**; board net base **~$23M**. Do not change except type-only tweaks.
- `reference/advisor-comp-studio.tsx` (1529 lines) is the **behavioural/UX source of truth** (React + recharts). We are re-implementing it in Vue.
- Internal & confidential tool — keep **net-of-strike** framing and **"discussion draft, not a binding offer"** caveats.

## Current repo state (verified this session)
- **Scaffold stack**: Vite `^5.2.10`, Vue `^3.4.21`, vue-router `^4.3.0`, **frappe-charts `^1.6.2`**, Tailwind `^3.4.3`, TypeScript `^5.4.5`, `@vitejs/plugin-vue ^5.0.4`, vue-tsc `^2.0.13`, autoprefixer/postcss. Node v24.16, npm 11.13.
- ⚠️ **`frappe-ui` is NOT in `scaffold/package.json`** — it is asserted in the plan but never installed or verified. This is the crux to settle.
- **Only one view is built** (`scaffold/src/views/Overview.vue`); the other 5 are stubs. The built Overview uses **zero frappe-ui components** — it is hand-rolled HTML + Tailwind utility classes + inline styles.
- **Design language**: bespoke *editorial* — display font **Fraunces**, body **IBM Plex Sans/Mono** (loaded via Google Fonts in `index.html`), warm "paper" palette (`ink #1A1815`, `paper #FBF8F3`, `amber #9C4A0C`, `teal #2F6E63`, etc.). frappe-ui ships an **Inter / Espresso** design language — note the tension: adopting frappe-ui means restyling its components or accepting its look.
- `FrappeChart.vue` currently imports `{ Chart } from 'frappe-charts'` (bare) + `'frappe-charts/dist/frappe-charts.min.css'`.
- `main.ts` has the two FrappeUI lines **commented out** (`import { FrappeUI } from 'frappe-ui'` / `import 'frappe-ui/dist/style.css'`).
- `tailwind.config.cjs` already globs `./node_modules/frappe-ui/src/**/*` in `content` but does **not** add the frappe-ui preset.
- Local dev = **Vite+ (`vp dev`/`vp check`/`vp build`/`vp test`)**; plain `vite` npm scripts stay for Vercel/CI (Vercel build = `npm run build` → `dist`; `vercel.json` SPA rewrite). `vp` is alpha — never a build/deploy dependency.

## Plan claims to VERIFY (do not assume true — these are exactly what tends to drift)
From `TECH_BRIEF.md` / scaffold comments:
1. Tailwind preset path: `presets: [require('frappe-ui/src/utils/tailwind.config')]`
2. Plugin install: `import { FrappeUI } from 'frappe-ui'; app.use(FrappeUI)`
3. Styles: `import 'frappe-ui/dist/style.css'`
4. frappe-charts ESM import: `frappe-charts/dist/frappe-charts.min.esm` vs bare `frappe-charts`; CSS `frappe-charts/dist/frappe-charts.min.css`
5. frappe-ui data composables (`createResource`, `createListResource`, `createDocumentResource`, `createListManager`, `useList`) assume a Frappe REST/RPC backend → **out of scope**; confirm.
6. frappe-charts: **scatter broken (frappe/charts #188)**, **no native waterfall** — confirm current status.
7. Peer deps: Vue 3 only? Tailwind v3 vs v4? frappe-ui package `exports` / tree-shaking / bundle weight (pulls TipTap/Headless UI?).

## The 6 views & their charts (parity target)
Routes: **Overview · Advisors (a.k.a. "package") · Board · Compare · Proposition · Configure**. Charts needed: dilution/valuation **staircase** (steps), **net-vs-gross** line, **upside curve** (line/area), **vesting timeline**, **football-field** ranges, **comp mix** (percentage), **growth waterfall**, **potential scatter**, **scenario grouped bar**. Reference uses recharts; we replace with frappe-charts where it fits + small custom SVG where it doesn't.

## Linear COM map (project `Advisor Comp Studio — Web App (Frappe/Vercel)`, all issues currently `Todo`)
- **M0 Foundation**: COM-8 (boot scaffold + install frappe-ui/charts), COM-10 (reuse engine + spec), COM-11 (store), COM-9 (git + Vercel preview). Epics: COM-1, COM-2.
- **M1 Configure**: COM-25 (baseline shell), COM-12 (rounds+scenarios), COM-23 (tiers+milestones), COM-24 (objectives+pools+uplift), COM-13 (roadmap CSV). Epic COM-3.
- **M2 Read views**: COM-14 (Overview parity), COM-15 (Board table), COM-26 (Board charts staircase+scatter). Epic COM-4.
- **M3 Advisors hero & charts**: COM-16 (FrappeChart wrappers), COM-27 (custom SVG), COM-18 (controls profile/tier), COM-30 (controls performance), COM-17 (layout+waterfall), COM-28 (upside curve), COM-29 (vesting+football+mix+instruments). Epic COM-5.
- **M4 Compare + Proposition**: COM-19 (Compare matrix+bar), COM-20 (Proposition+print). Epic COM-6.
- **M5 QA, polish & ship**: COM-21 (colour-blind+a11y), COM-31 (mobile+print), COM-22 (production deploy). Epic COM-7.

## Tooling for research
- **context7 docs MCP** (load via ToolSearch `select:mcp__context7__resolve-library-id,mcp__context7__query-docs`): frappe-ui ID = `/frappe/frappe-ui`; frappe framework = `/frappe/frappe` or `/websites/frappe_io_framework`; resolve `Frappe Charts` (likely `/frappe/charts`) yourself. Max 3 query calls per agent — prefer it over guessing.
- **WebSearch / WebFetch** (load via ToolSearch): GitHub repos/issues/licences, frappeui.com, ui.frappe.io, Storybook/Espresso showcase, frappe.io/charts, npm.
- **github MCP** (load via ToolSearch `+github`): read `frappe/frappe-ui`, `frappe/charts` source, package.json, issues.
- **Bash**: `npm view <pkg> ...`, `curl` unpkg/jsdelivr for package.json/exports/dist listings. The authoritative *render* test (a real Vite app) is being run separately by the orchestrator — you do **not** need to scaffold Vite; focus on cataloguing from source + package metadata + docs.

## Output discipline
Write your lane file to the path named in your task. Be concrete: exact import paths, exact version numbers, exact file paths in the package, cite every external claim with a URL. Flag anything that contradicts the plan claims above. Prefer "verified via <source>" over "should work".
