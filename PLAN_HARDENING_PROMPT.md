# Claude Code prompt — Phase 0: research & harden the Advisor Comp Studio plan (ultracode, dynamic workflows)

Paste everything below into Claude Code with **ultracode**, working in **`~/dev/comp-studio`** (the build kit is unzipped at the repo root: `engine/`, `scaffold/`, `reference/`, `IMPLEMENTATION_PLAN.md`, `TECH_BRIEF.md`, `DEV_WORKFLOW.md`, `ULTRACODE_PROMPT.md`, `README.md`).

**This run hardens the PLAN — it does not build features.** It ends at a review gate.

---

You are the lead architect for Raiku Labs' **Advisory Board Compensation Studio** web app. Before any feature build, run a **research-driven hardening pass** so the implementation plan is as good as it can possibly be. Research and analyse **all relevant Frappe resources — especially `frappe-ui`** — **empirically verify** the central "frontend-only on Vercel" assumption, then rewrite the plan docs and reconcile the Linear **COM** issues to match what you learned. **Then stop for Robin's review. Do not start M0 feature work.**

## Context & non-negotiables
- **`engine/engine.ts` is the frozen maths** (reconciles the dilution model: bridge 57,217 FD → Series C 118,707; strike $1,572.95; base TGE FDV $600M; board net base ~$23M). Don't change it except type-only tweaks; keep `engine.test.mjs` 22/22.
- **`reference/advisor-comp-studio.tsx` is the behavioural/UX source of truth.**
- **Frontend-only, static SPA on Vercel — no Frappe/Python backend, no ERPNext.** Whether `frappe-ui` delivers enough value under that constraint is the question this pass must answer with evidence.
- Internal & confidential tool — keep net-of-strike framing and "discussion draft, not a binding offer" caveats.
- **Deliverable of this run = a better plan + reconciled Linear, not the app.**

## Tooling
- **Docs MCP (context7):** `resolve-library-id` → `query-docs` for `frappe-ui`, `frappe`, `frappe-charts`. Prefer it over guessing — your training data predates recent Frappe changes.
- **Web search + fetch** for GitHub, Storybook/Espresso, the docs sites, issue trackers, licences.
- **Throwaway sandbox** for empirical checks: scaffold in **`/tmp`** with Vite (use `vp` locally), `npm i frappe-ui frappe-charts`. **Never pollute the real `scaffold/`** with experiments.
- **Linear MCP (COM project "Advisor Comp Studio — Web App (Frappe/Vercel)"):** update milestones/issues directly.

## Dynamic workflow
Fan out **four research lanes as parallel sub-agents** (A/B/C are web+docs+sandbox; D is repo-internal — all independent). Each writes a structured findings file under `research/`. A **synthesis** step waits on all four. Then **plan rewrite** (split into two parallel sub-agents: one for `TECH_BRIEF.md`, one for `IMPLEMENTATION_PLAN.md`, then reconcile). **Empirical verification** may start alongside the rewrite but must finish before DoD. **Linear reconciliation** runs after synthesis. End at the gate.

### Lane A — `frappe-ui` inventory & standalone-safety  *(the crux)*
Catalogue the library and, for **every** component/composable, classify **standalone-safe** (renders on a static SPA with no Frappe server) vs **backend-bound** (assumes Frappe's data/resource layer or auth).
- Components: Button, Dialog, FormControl/Input/Select/Textarea/Checkbox, Badge, Tooltip, Dropdown, Tabs, Avatar, ListView/table, etc.
- Data layer: `createResource`, `createListResource`, `createDocumentResource`, `createListManager`, `useList` — confirm these assume a Frappe REST/RPC server (they almost certainly do) and are therefore **out of scope** for us.
- Theming: the Tailwind **preset/plugin**, design tokens, dark mode, icon set, fonts (Inter). Record the **exact** import paths + preset/config that actually work standalone.
- Distribution: usage **outside a Frappe app** (vs the Doppio "frontend-in-Frappe" pattern); peer deps (Vue 3 minor, **Tailwind v3 vs v4**), package exports, tree-shaking/bundle weight.
- Sources: `frappeui.com`, `github.com/frappe/frappe-ui`, the Storybook/Espresso showcase, the "Frappe UI Starter" template.
→ `research/A-frappe-ui.md` with a **use/avoid matrix**: component → standalone-safe? → where we'd use it → fallback if not.

### Lane B — `frappe-charts` capabilities & gaps
Per chart **we need** (dilution **staircase**, net-vs-gross line, **upside curve**, **vesting** timeline, **football-field** ranges, comp **mix**, **waterfall**, **scatter**, **grouped bar**), decide **frappe-charts vs custom SVG** with evidence.
- Confirm supported types (line/area, grouped/stacked bar, percentage, heatmap), interactivity/tooltips/events, theming, responsiveness, SVG export.
- Confirm the **gaps**: scatter broken (issue #188), no native waterfall, stacked-with-negative behaviour — and anything else you find.
- Sources: `github.com/frappe/charts` (README, demos, open issues).
→ `research/B-frappe-charts.md` with a **chart decision table**: chart → library or custom SVG → why → interactivity notes.

### Lane C — Frappe ecosystem & stack-currency check
- What Frappe/ERPNext are and **why the backend can't deploy to Vercel** (Python + MariaDB + Redis monolith) — state it crisply so the frontend-only decision is well-grounded.
- Frontend patterns: Doppio / frontend bundling, Builder, "Frappe UI + standalone" setups.
- **Licensing** of `frappe-ui` and `frappe-charts` (confirm permissive/MIT and note it).
- **Maintenance health** + current versions; verify our pins (Vue 3.4.x, Vite 5, Tailwind 3.4, `frappe-charts` 1.6.x) are current and mutually compatible; flag any Tailwind v4 / Vite 6 / `vp` (alpha) considerations.
→ `research/C-ecosystem.md` with a **version-compatibility matrix** + licensing + the frontend-only justification.

### Lane D — Reference-app feature reconciliation  *(repo-internal)*
Read **all** of `reference/advisor-comp-studio.tsx` and `engine/engine.ts`. Produce the **authoritative feature/IA inventory** the plan must cover: every view, control, chart, benchmark/source, caveat, print path, share/persist behaviour, dynamic rounds/scenarios/tiers/milestones. Cross-check against the current `IMPLEMENTATION_PLAN.md` **and** the Linear COM issues; list **anything missing or mis-mapped**.
→ `research/D-feature-inventory.md` (the checklist the rest of the plan is graded against).

## Synthesis & the central decision
Reconcile A–D into `research/FINDINGS.md`:
- The **`frappe-ui` use/avoid matrix** and the **chart decision table**, finalised.
- **Decide, with evidence:** is `frappe-ui` worth the dependency for our static SPA, and **on which subset**? For anything needed that turns out backend-bound, specify the **standalone fallback** (e.g. headless component + Tailwind). If `frappe-ui`'s net value is low, say so plainly and document the **headless-UI + Tailwind fallback** instead of forcing it. Be decisive — this verdict drives the build.
- A short **decision log** (each choice → rationale → source) and a **sources** list.

## Empirical verification (adversarial — don't trust docs alone)
In **`/tmp`**, scaffold a throwaway Vite + Vue 3 + Tailwind app, install `frappe-ui` + `frappe-charts`, wire the Tailwind preset, and **render without any Frappe backend**: Button, Dialog, FormControl/Input, Select, Badge, an icon, a table/ListView, plus a `frappe-charts` line + grouped bar. Record **what renders, what throws or demands a server, console errors, bundle size**, and the **exact working import paths + preset config**. **Screenshot it.** This empirical result **overrides any doc claim** and feeds the use/avoid matrix and the version pins. Keep this sandbox out of the real repo.

## Rewrite the plan (the actual output)
- **`TECH_BRIEF.md`** — verified stack rationale; `frappe-ui` use/avoid matrix; chart decision table; the **working Tailwind-preset + import recipe** (copy-paste exact); bundle/perf notes; licensing; every fallback decision.
- **`IMPLEMENTATION_PLAN.md`** — verified architecture; **view → component map using only standalone-safe pieces**; per-chart approach; milestone/issue breakdown still **≤450 LOC each**; dependencies; **risks + mitigations**.
- **`scaffold/`** — pin `package.json` to the **exact versions verified to work together**; wire the verified `frappe-ui` Tailwind preset + enable the FrappeUI lines in `src/main.ts` **only enough that `vp dev` boots with `frappe-ui` for real**. **Do not build feature views.**
- **`ULTRACODE_PROMPT.md`** — refresh it so the build run consumes the hardened plan (corrected component choices, chart approach, version pins, the working preset recipe).
- Leave `research/FINDINGS.md` + the lane files + the screenshot as the evidence trail.

## Reconcile Linear (COM) — directly
Update milestones/issues in place to match the findings: add/split/rescope issues for newly-found components or fallbacks; fix any view→component references; ensure **every** feature in `research/D-feature-inventory.md` has an issue; keep **≤450 LOC** and the existing milestone staging (M0→M5). Add a one-line **"research basis"** note (pointing at the relevant `FINDINGS.md` section) on each issue you change.

## Definition of Done (this pass)
1. `research/FINDINGS.md` exists with: `frappe-ui` use/avoid matrix, chart decision table, version-compat matrix, licensing, **sandbox verification results + screenshot**, decision log, sources.
2. `TECH_BRIEF.md` + `IMPLEMENTATION_PLAN.md` rewritten, internally consistent, every reference-app feature mapped; the **frontend-only assumption explicitly confirmed or its fallback documented**.
3. `scaffold/` boots (`vp dev`) with the verified `frappe-ui` + Tailwind preset wired; **engine spec 22/22** and **`vp build` green**; **no feature views built**.
4. Linear COM milestones/issues reconciled to the feature inventory; ≤450 LOC each; nothing missing.
5. **STOP at the gate:** post a concise summary — the central frontend-only/`frappe-ui` verdict, what changed in the plan, version pins locked, and any open questions for Robin — then **halt. Do not begin M0.**

## Guardrails
- Don't build feature views; don't change `engine.ts` beyond types.
- Keep all experiments in `/tmp`; keep the real `scaffold/` clean.
- Cite sources; prefer empirical evidence over docs; if `frappe-ui` underdelivers, pivot the plan rather than forcing it.
- ≤450 LOC per Linear issue — split and add a sub-issue under the same milestone if anything grows.
