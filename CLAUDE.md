# CLAUDE.md — Advisor Comp Studio (Raiku Labs)

Standing rules for any agent working in this repo. Read this first, every session.

## What this is
Raiku Labs' **Advisory Board Compensation Studio** — an **internal & confidential** web app that models
advisory-board equity + token compensation **net of strike**. Output is a **discussion draft, not a binding
offer**. Re-implementation of the single-file React artifact in `reference/advisor-comp-studio.tsx` as a
**Vue 3 + Vite static SPA on Vercel**.

## The stack (LOCKED — decided in Phase-0 + Robin's post-gate call; do not re-litigate)
- **UI: `frappe-ui` is ADOPTED as-is (Espresso/Inter).** Use its components + the **Espresso preset** +
  **Frappe UI layout templates** (Frappe UI Starter / Gameplan / Helpdesk patterns) for clean, consistent
  UI/UX. **Use the `frappe-ui` Skill** for component/UI work.
- **Frontend-only — no Frappe/Python backend.** Wire frappe-ui via the verified recipe (already in the
  scaffold, build-green): `frappeui({frappeProxy:false,jinjaBootData:false,buildConfig:false})` + `vue()` in
  `vite.config.ts`, `optimizeDeps:{include:['feather-icons']}`, ESM `tailwind.config.js` with
  `import frappeUIPreset from 'frappe-ui/tailwind'`, `import 'frappe-ui/style.css'` in `main.ts`, import
  components **by name**. **NEVER `app.use(FrappeUI)`** — it opens socket.io + installs the Frappe
  RPC/resource layer (backend-bound). The frappe-ui data layer (createResource/useList/frappeRequest/call/
  initSocket) is **out of scope**; state is local over the engine.
- **Charts: `frappe-charts@1.6.2`** (bare `import { Chart } from 'frappe-charts'`, **NO css import** — 1.6.2
  ships none; styles self-inject) for line/area/percentage/grouped-bar incl. the valuation **staircase
  (grouped bar)**. **Custom SVG** for waterfall, scatter (frappe-charts scatter is NOT implemented),
  football-field, vesting timeline, DilutionPath. (frappe-ui's echarts charts are an option but ~1 MB —
  frappe-charts stays primary.)
- **Engine: `engine/engine.ts` is FROZEN** — the only place money is computed. Type-only tweaks allowed; no
  logic changes. `node engine/engine.test.mjs` must stay **22/22** (bridge 57,217 → Series C 118,707; strike
  $1,572.95; base TGE FDV $600M; board net base ~$23M). Views never recompute money inline.
- **Pins:** vue ^3.5 · vue-router ^4 · vite ^5 · @vitejs/plugin-vue ^5 · tailwindcss ^3.4 (NOT v4) ·
  typescript ^5 · vue-tsc ^2 · **frappe-ui 0.1.278 (exact)** · **frappe-charts 1.6.2 (exact)**.

## Dev workflow
- Local: **Vite+ (`vp`)** — `vp dev` / `vp check` (lint+format+typecheck) / `vp build` / `vp test`. `vp` is
  alpha → **local only, never a build/deploy dependency.**
- CI/Vercel: plain `vite` scripts — build `npm run build` → `dist`, framework preset Vite, `vercel.json` SPA
  rewrite. Deploy via the Vercel connector (`deploy_to_vercel`).
- Per-issue DoD (≤450 LOC): `vp check` clean → functional pass (`vp dev`) → visual pass (screenshot vs the
  reference) → `npm run build` + engine 22/22 → commit on the issue branch → Linear issue **Done**.
- Milestone gate (M0→M5): `npm run build` + engine green → `deploy_to_vercel` preview → visual smoke → advance.

## Record progress to `memory.md`
At the end of each issue/milestone, **append a dated entry to `memory.md`** at the repo root: what you
built, decisions made, anything surprising, and the next step. It is the durable cross-session log — keep it
current.

## Non-negotiables
- Engine frozen (above). `reference/advisor-comp-studio.tsx` is the **UX source of truth** for
  features/labels/legal copy/IA (the *visual* design is now Espresso, but behaviour + the legal corpus match
  the reference, ported **verbatim**).
- **Internal & confidential**; every equity figure **net of strike**; **"discussion draft, not a binding
  offer."**
- **≤ 450 LOC per Linear (COM-*) issue** — split the issue if larger. One issue = one PR linking its issue;
  tests ship with the code; QA gate green before merge to `main`.

## Where things live
- `IMPLEMENTATION_PLAN.md` — architecture, view→component map, M0→M5 issue breakdown.
- `TECH_BRIEF.md` — the adopted stack rationale + frappe-ui integration recipe + chart decisions.
- `research/FINDINGS.md` — the reconciled Phase-0 evidence (+ the post-gate adoption banner).
- `research/EMPIRICAL.md` — the verified frappe-ui standalone recipe (sandbox ground truth).
- `DEV_WORKFLOW.md` — commands + the per-issue loop. `ULTRACODE_PROMPT.md` — the build-run prompt.
- `engine/` — frozen maths + spec. `scaffold/` — the wired, build-green project root.
- Linear: **COM** project "Advisor Comp Studio — Web App (Frappe/Vercel)" — https://linear.app/raiku/team/COM/overview

## Open product decisions (resolve before/at M0–M1 — see research/FINDINGS.md §9)
1. Named multi-board `Mgr` ([COM-32]) — port or descope for v1? (Sets the localStorage schema.)
2. localStorage schema collision (`raiku-advisor-comp-v5`: `{scenarios,last}` vs raw `State`).
3. Share: clipboard Copy/Paste (reference) vs the scaffold-only `#s=` URL hash.
4. Valuation staircase: frappe-charts grouped bar vs a custom true-step SVG.
5. Section numbering: adopt the nav order (I–VI) and fix the duplicate "Section I".
