# CLAUDE.md — Advisor Comp Studio (Raiku Labs)

Standing rules for any agent working in this repo. Read this first, every session.

## What this is
Raiku Labs' **Advisory Board Compensation Studio** — an **internal & confidential** web app that models
advisory-board equity + token compensation **net of strike**. Output is a **discussion draft, not a binding
offer**. Re-implementation of the single-file React artifact in `reference/advisor-comp-studio.tsx` as a
**Vue 3 + Vite static SPA on Vercel**. **Product spec: `COMP_STUDIO_SPEC_v2.md` (adopted 2026-06-09)** —
objectives O1–O16, the Comp Trajectory system, scenario sets, governance scope, and the M10–M12 build
mapping; for NEW scope and the Δ4 legal correction, the spec supersedes the reference artifact.

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
- **Engine: GATED, no longer frozen (COM-140 signed off 2026-06-10).** The live engine is
  `scaffold/src/engine.ts` — still the only place money is computed; views never recompute inline. M10
  engine edits land ONLY under the five-condition unfreeze rule in **`engine/ENGINE_V2_RFC.md` §7**: both
  22-vector suites stay green & unmodified (the v1 anchors hold: bridge 57,217 → Series C 118,707; strike
  $1,572.95; base TGE FDV $600M) · `node engine/engine.v2.test.mjs` 0 failed with the PR's T5 bindings
  flipped live · one issue per PR ≤450 LOC · only COM-171 touches SCHEMA. Root `engine/engine.ts` is the
  v1 historical reference (read-denied in the harness) — never edit it. NEVER run `vp check --fix` (it
  mutates the engine).
- **Pins:** vue ^3.5 · vue-router ^4 · vite ^5 · @vitejs/plugin-vue ^5 · tailwindcss ^3.4 (NOT v4) ·
  typescript ^5 · vue-tsc ^2 · **frappe-ui 0.1.278 (exact)** · **frappe-charts 1.6.2 (exact)**.

## Dev workflow
- Local: **Vite+ (`vp`)** — `vp dev` / `vp check` (lint+format+typecheck) / `vp build` / `vp test`. `vp` is
  alpha → **local only, never a build/deploy dependency.**
- CI/Vercel: plain `vite` scripts — build `npm run build` → `dist`, framework preset Vite, `vercel.json` SPA
  rewrite. Deploy via the Vercel connector (`deploy_to_vercel`).
- Per-issue DoD (≤450 LOC): set the issue **In Progress** → `vp check` clean → functional pass (`vp dev`) →
  visual pass (screenshot vs the reference) → `npm run build` + engine 22/22 → **open a PR that closes the
  issue (`Fixes COM-NNN`) and merge it, or direct-commit to the deploy branch** → mark the Linear issue
  **Done** → append `memory.md`. **Every issue gets BOTH the merge/commit AND the Linear Done flip —
  neither alone counts as closed.** (git/`gh` commits here need `dangerouslyDisableSandbox:true`.)
- Milestone gate (M0→M5): `npm run build` + engine green → `deploy_to_vercel` preview → visual smoke → advance.

## Record progress to `memory.md`
At the end of each issue/milestone, **append a dated entry to `memory.md`** at the repo root: what you
built, decisions made, anything surprising, and the next step. It is the durable cross-session log — keep it
current.

## Non-negotiables
- Engine gated by the RFC §7 rule (above). `reference/advisor-comp-studio.tsx` is the **UX source of truth** for
  features/labels/legal copy/IA (the *visual* design is now Espresso, but behaviour + the legal corpus match
  the reference, ported **verbatim**). **Exception (spec v2 Δ4, corrected in COM-139):** the reference's
  CoC-acceleration sentence was stale — Plan rules v9 deleted Rule 9.2; the shipped corpus states the v9
  position (no automatic/discretionary CoC acceleration; acquirer roll-over possible; vested options remain
  exercisable per the plan rules). On that line **Plan v9 / spec Appendix C is the source of truth**, not
  the reference TSX.
- **Internal & confidential**; every equity figure **net of strike**; **"discussion draft, not a binding
  offer."**
- **≤ 450 LOC per Linear (COM-*) issue** — split the issue if larger. One issue = one PR linking its issue;
  tests ship with the code; QA gate green before merge to `main`.

## Where things live
- `IMPLEMENTATION_PLAN.md` — architecture, view→component map, M0→M5 issue breakdown.
- `TECH_BRIEF.md` — the adopted stack rationale + frappe-ui integration recipe + chart decisions.
- `research/FINDINGS.md` — the reconciled Phase-0 evidence (+ the post-gate adoption banner).
- `research/EMPIRICAL.md` — the verified frappe-ui standalone recipe (sandbox ground truth).
- `COMP_STUDIO_SPEC_v2.md` — **the product spec (v2)**: philosophy, O1–O16, domain model, trajectory +
  governance scope, M10–M12 build mapping, detail appendices A–F (the granular numbers/legal/session register).
- `DESIGN_SYSTEM.md` — **the design handoff**: tokens, layout grammar (reading column · borders earn their
  place · settings two-column), frappe-ui idioms/gotchas, chart + a11y + print rules. Build new surfaces inside it.
- `DEV_WORKFLOW.md` — commands + the per-issue loop. **`ULTRACODE_V2_FINISH.md` — THE live build-run
  prompt** (finish everything: M10 engine v2 under the RFC §7 gate · M10 UI · M11 · M12 · legacy triage ·
  M6 hardening; authorized by Robin 2026-06-10 — "Nothing is blocked"). `engine/ENGINE_V2_RFC.md` = the
  engine-wave contract. `ULTRACODE_M9_FINISH.md` + `ULTRACODE_M9_PD2.md` are completed predecessors.
- `engine/` — the v1 reference engine + BOTH test suites + the v2 RFC. `scaffold/` — the wired,
  build-green project root (`scaffold/src/engine.ts` is the live engine).
- Linear: **COM** project "Advisor Comp Studio — Web App (Frappe/Vercel)" — https://linear.app/raiku/team/COM/overview

## Open product decisions
The five M0-era decisions previously listed here were ALL resolved on 2026-06-08 (Robin's calls — see
`memory.md`). The live open-decision register is now **`COMP_STUDIO_SPEC_v2.md` Part 17**: pool sizing blanks
(10% ≈ 5,368 vs 15% ≈ 8,523), advisor value-band anchors, cash-floor policy, review cadence, advisor-pool
source (ESOP vs the 1.83% token headroom), Robin's own grant sequencing (Pantera consent), the M10
engine-unfreeze gate scope (→ COM-140), and public-URL remediation (→ COM-33/34).
