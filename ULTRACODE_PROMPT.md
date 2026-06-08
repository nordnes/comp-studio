# Claude Code prompt — build & ship the Advisor Comp Studio web app (continuous run)

Paste everything below into a fresh Claude Code session, working in a clone of **https://github.com/nordnes/comp-studio** (origin/main) with this build-kit at the repo root. Run it as **one continuous goal** until the production URL is live.

> **Stack direction (POST-GATE, 2026-06-08):** we **ADOPT `frappe-ui` as-is** — its components + the **Espresso preset** (Inter typography) + the **Frappe UI Starter / Gameplan / Helpdesk layout templates** — as the UI system, for clean, consistent UI/UX. This is Robin's locked leadership decision and it **supersedes** the Phase-0 "reject frappe-ui" recommendation. The Phase-0 evidence (use/avoid matrix, the corrected standalone recipe, bundle numbers, licensing) is still **valid and correct** — it is now the **ADOPTION GUIDE**, not a rejection. Do **not** re-open or re-litigate the adopt/skip question. Design tradeoff is **accepted**: Inter/Espresso replaces the bespoke Fraunces/IBM-Plex editorial look (optional, light Raiku brand accents via `theme.extend` tokens / CSS-variable overrides — not a fight).

---

You are building and shipping a production web app for Raiku Labs — the **Advisory Board Compensation Studio** — as one continuous effort. It exists today as a single-file React artifact (`reference/advisor-comp-studio.tsx`) that works but won't load reliably. Re-implement it as a **Vue 3 + Vite static SPA** styled with **frappe-ui (Espresso/Inter)**, deploy it to **Vercel**, and drive the work through the **Linear `comp-studio` (COM)** project, milestone by milestone.

## The adopted stack (locked — do not re-litigate)
- **UI = `frappe-ui` 0.1.278 (pinned EXACT), adopted as-is.** Use its **components** (import **by name**), the **Espresso preset** (colour/font/radius/shadow scale + Inter), and the **Frappe UI Starter / Gameplan / Helpdesk layout templates** for shell, panels, lists, forms, dialogs. Espresso/Inter is the design language now.
- **Charts = `frappe-charts` 1.6.2 (pinned EXACT)** for line / area / percentage / grouped-bar **including the valuation staircase (grouped bar, Raiku vs median)**; **custom SVG** (styled with frappe-ui/Espresso tokens) for growth waterfall, potential scatter, football-field ranges (two variants), vesting timeline, DilutionPath. frappe-charts stays **primary** (lighter, verified); frappe-ui's own `AxisChart`/`DonutChart` (echarts, ~1 MB) are an **option** for full design consistency but **not** the default.
- **`engine/engine.ts` is FROZEN** — canonical maths, reuse verbatim, type-only tweaks allowed, `engine.test.mjs` stays **22/22**.
- **Frontend-only.** No Frappe / Python backend, no ERPNext, no socket.io. The frappe-ui **data layer** (`createResource` / `useList` / `frappeRequest` / `call` / `initSocket`) is **OUT OF SCOPE**; state is local over the frozen engine.
- **NEVER `app.use(FrappeUI)`.** That plugin opens a socket.io connection and installs the Frappe RPC/resource layer (backend-bound). Import components by name only.

## The scaffold is ALREADY wired & BUILD-GREEN (do not redo this — extend it)
The committed `scaffold/` was re-wired to the **verified adoption recipe** this session and builds green; `engine.test.mjs` is **22/22**. What is already done:
- `package.json` — pins match: `vue ^3.5`, `vue-router ^4`, `vite ^5`, `@vitejs/plugin-vue ^5`, `tailwindcss ^3.4` (v3 only — **NOT v4**, the preset is v3), `typescript ^5`, `vue-tsc ^2`, **`frappe-ui 0.1.278` exact**, **`frappe-charts 1.6.2` exact**.
- `vite.config.ts` — `frappeui({ frappeProxy:false, jinjaBootData:false, buildConfig:false })` + `vue()`, `build.outDir:'dist'`, `optimizeDeps:{ include:['feather-icons'] }`.
- `tailwind.config.js` — **ESM**, `import frappeUIPreset from 'frappe-ui/tailwind'`, `presets:[frappeUIPreset]`, content glob **including `./node_modules/frappe-ui/src/**/*`**. Stale `tailwind.config.cjs` removed.
- `main.ts` — `import 'frappe-ui/style.css'` (Inter + preset base) **before** `./style.css`; mounts router; **no** `app.use(FrappeUI)`.
- `src/style.css` — de-duped (no repeated `@tailwind` layers; app-only overrides).

**Your job:** `npm install` and confirm green (`npm run build` + `node engine.test.mjs` → 22/22), then **convert the views to frappe-ui** (`src/views/Overview.vue`, `src/App.vue`, and the rest). The views are **not yet** on frappe-ui — that is the build work (COM-14 / COM-17 / etc.), now using frappe-ui components + templates.

## Read these first (your sources of truth)
- **The verified recipe + the 5 things that break** → `research/EMPIRICAL.md` (authoritative; overrides any doc that disagrees). Mirrored in `TECH_BRIEF.md` §2c and `research/FINDINGS.md` §6.
- **Stack rationale, chart decision table, wrapper contract, pins, licensing** → `TECH_BRIEF.md` (§2 use/avoid → now a **"use"** matrix; §3 charts; §4 pins) and `research/FINDINGS.md` (note the ADOPTION banner at top — §1/§7/D2/D3 keep the "reject" framing as the audit trail; the rest is the adoption guide).
- **Behaviour / copy / IA / legal corpus** → `reference/advisor-comp-studio.tsx` is the UX source of truth. The **visual** design is now Espresso, but **features, labels, caveats, IA still match the reference**. Parity checklist: `research/D-feature-inventory.md` — grade against it.
- **Milestones → issues, dependencies, delete-cascades, open decisions** → `IMPLEMENTATION_PLAN.md` (§5 milestones, §6 dependencies/risks/decisions).

## Use the `frappe-ui` Skill for all component/UI work
The **`frappe-ui` Skill is available** in this session. **Invoke it** whenever you scaffold a page, shell, form, dialog, list, or any UI surface, and whenever you pick or wire a frappe-ui component or design token. Reach for the **Starter / Gameplan / Helpdesk layout templates** through it for the app shell and panels. Default to frappe-ui components + Espresso tokens over hand-rolled markup.

## RECORD progress to `memory.md` (hard requirement)
A running **`memory.md` at the repo root** is the cross-session log. **At the end of every issue and every milestone, APPEND** to `memory.md`: what you built, decisions you made (especially any of the 5 open product decisions you resolved), and anything that surprised you (build gotchas, parity mismatches, recipe deviations). A later agent session relies on this — **"record to local `memory.md`"** is not optional. If `memory.md` does not exist yet, create it.

## Standing rules & rails
- **`CLAUDE.md`** at the repo root carries the standing rules/context — read it at session start and follow it.
- **`.claude/settings.json`** carries the permission rails — operate within them.
- **`THIRD-PARTY-NOTICES`** records the frappe-ui + frappe-charts MIT attributions — keep it accurate if deps change.
- **`.gitignore`** excludes `node_modules` / `dist` / local cruft.

## Non-negotiables (preserve in every issue)
- **`engine/engine.ts` (→ `src/engine.ts`) is the canonical maths — reuse verbatim, never reimplement formulas.** It reconciles to the dilution model (bridge 57,217 FD → Series C 118,707; strike $1,572.95; base TGE FDV $600M; board net base ~$23M). Type-only tweaks; keep `engine.test.mjs` **22/22**.
- **Internal & confidential tool** — keep **net-of-strike** framing and **"discussion draft, not a binding offer"** caveats; port the legal corpus + benchmark source strings **verbatim** (enumerated in `IMPLEMENTATION_PLAN.md` §6.6).
- **`reference/advisor-comp-studio.tsx`** = behaviour/labels/caveats/IA source of truth; **Espresso** = the visual layer.
- **NEVER `app.use(FrappeUI)`**; frappe-ui data layer stays out of scope.

## Open product decisions to resolve before/at M0–M1 (do NOT invent answers — flag for Robin)
These 5 remain **open** from the gate. Surface them, get the call, then record the resolution in `memory.md`:
1. **(COM-32)** Named multi-board `Mgr` subsystem — **port** or **descope to single-board** for v1. This sets COM-11's localStorage schema.
2. **localStorage schema** — the reference's `{scenarios, last}` map vs the scaffold's raw `State` collide on key `raiku-advisor-comp-v5`; COM-11 must **version + migrate** so old payloads don't crash `reconcile`.
3. **Share mechanism** — clipboard Copy/Paste only (reference) or keep the URL-hash `#s=` too.
4. **Valuation staircase** — grouped **bar** (default, frappe-charts) or custom **step**-SVG.
5. **Section numbering** fix.

## Chart wrapper contract (`src/components/FrappeChart.vue`, COM-16) — mandatory
Bare `import { Chart } from 'frappe-charts'`, **NO css import** (1.6.2 ships none; styles self-inject — a css import 404s the build). Then: **guard the `undefined` return**; `update(plainSnapshot)` for data only; **`destroy()` + `new Chart()`** on type/colour change; own **`ResizeObserver` → `chart.draw()`** and **redraw on route/tab show** (hidden views render at 0 width); **`chart.destroy()`** on unmount. **`scatter` is NOT implemented in 1.6.2** — do not pass `type:'scatter'`; use custom SVG. The **staircase is a grouped bar**, not SVG.

## Tooling
- **Vite+ (`vp`)** is **local dev only** (alpha): `vp dev` / `vp check` / `vp build` / `vp test`. Keep **plain `vite` scripts** in `package.json`; Vercel/CI build = `npm run build` → `dist`. Never make `vp` a build/deploy dependency.
- **Deploy via the Vercel connector** (`deploy_to_vercel`). `vercel.json` (SPA rewrite) is included.
- **Linear** COM project: move issues **In Progress → Done**; respect milestone order. Issue descriptions carry Phase-0 "research basis" notes — read them.
- **Git/GitHub** `nordnes/comp-studio` (origin/main): branch per issue (Linear branch name); small PRs/commits; conventional commits.

## Definition of Done — apply to EVERY issue
1. **≤ 450 LOC** of change (if it grows, split + add a Linear sub-issue under the same milestone). 2. `vp check` clean. 3. **Functional pass:** `vp dev`, exercise the route/feature. 4. **Visual pass:** screenshot the route; check it reads as a coherent Espresso/frappe-ui surface and matches the reference's **features/labels/IA** (not its old fonts). 5. `npm run build` succeeds **and** engine spec green (`node engine.test.mjs`, **22/22**). 6. Commit on the issue's branch; set the Linear issue → **Done**. 7. **Append to `memory.md`.**

## Milestone gate
Milestones gate each other: do **not** start M(n+1) until M(n)'s **Vercel preview** is green (`deploy_to_vercel`). Append the milestone outcome to `memory.md`.

## Dynamic workflow (parallelise within a milestone)
Issues touching different files are independent — spin up parallel sub-agents, then integrate + run the milestone gate. Suggested concurrency (mirrors Linear COM):
- **M0** sequential: COM-8 (boot the wired scaffold — already pinned/wired/green; just `npm install` + confirm) → COM-10 (engine + spec) → COM-11 (store: reducer parity **incl. delete cascades**, schema reconcile/version/migrate, clipboard share) → COM-9 (git + Vercel preview). Resolve open decisions **#1–#3** here.
- **M1** Configure: COM-25 (shell + baseline + `DField`, use a frappe-ui layout template) first, then COM-12 / COM-23 / COM-24 / COM-13 in parallel (each carries its **DELETE-cascade fixups**). Settle **COM-32 (Mgr)**.
- **M2**: COM-14 (Overview parity, verbatim benchmark sources) ∥ COM-15 (Board table + board-CSV export) → COM-26 (staircase **grouped bar** + scatter **custom SVG**). Decide **#4 (staircase)**.
- **M3**: COM-16 (FrappeChart wrapper — contract above) + COM-27 (custom SVG: waterfall, scatter, football) first, then COM-18 / COM-30 (controls; `NumIn` primitive) ∥ COM-17 (layout + waterfall + **DilutionPath**) / COM-28 (upside curve) / COM-29 (vesting + football + mix + instruments + DilutionPath) in parallel.
- **M4**: COM-19 (Compare matrix + grouped bar — the grouped scenario bar lives HERE, not Board) ∥ COM-20 (Proposition + print + **legal corpus verbatim**). Fix **#5 (section numbering)** in the relevant view.
- **M5**: COM-21 (colour-blind + a11y) ∥ COM-31 (mobile + print paths) → COM-22 (production deploy + share, final gate).

## Acceptance (project done)
- All COM leaf issues Done; `npm run build` + `node engine.test.mjs` (**22/22**) green; no console errors across the 6 routes.
- Defaults reconcile to the dilution model; **full feature parity** with the React reference per `research/D-feature-inventory.md` (net-of-strike, scenario dilution, gated uplift, channel capital, grant round, dynamic rounds/scenarios/tiers/milestones, benchmarks with verbatim sources, print for package/board/proposition, legal corpus) — delivered through the **Espresso/frappe-ui** design language.
- Deployed at a production **Vercel** URL; Overview is the fast default; state persists (localStorage) + shareable. **Report the URL** and record it in `memory.md`.

## Guardrails
- Engine untouched except type-only tweaks. Pins are locked (frappe-ui **exact 0.1.278**, frappe-charts **exact 1.6.2**, tailwind **v3.4**). Do **not** add a Frappe backend / `app.use(FrappeUI)` / the data layer.
- ≤ 450 LOC per issue — split if it grows.
- The adopt-frappe-ui decision is **final**; the Phase-0 "reject" sections in `FINDINGS.md` §1/§7 are the **audit trail**, not current direction.
