# Advisor Comp Studio — web app build kit

Everything needed to ship the Advisory Board Compensation Studio as a real, Vercel-hosted web app (Vue 3 + Vite + Frappe frontend stack), replacing the single-file React artifact that won't load reliably.

## What's here
- **`ULTRACODE_PROMPT.md`** — paste into Claude Code to build & deploy the whole app. Start here.
- **`IMPLEMENTATION_PLAN.md`** — architecture, view→component map, milestones to go live today.
- **`TECH_BRIEF.md`** — why Vue 3 + frappe-ui + frappe-charts on Vercel (frontend-only); chart mapping.
- **`engine/engine.ts`** — the canonical, verified maths (cap-table walk, net-of-strike, scenarios, gating, pools). Reuse verbatim.
- **`engine/engine.test.mjs`** — 22-assertion regression spec. Run: `node engine/engine.test.mjs`.
- **`scaffold/`** — a ready-to-run Vite + Vue 3 + Tailwind project: the store is wired to the engine and the **Overview page renders real numbers** out of the box. Other views are stubs for Claude Code to fill in.
- **`reference/advisor-comp-studio.tsx`** — the current React app; behavioural/UX source of truth.

**Repo:** github.com/nordnes/comp-studio · **Linear:** COM project. **Tooling:** local dev via **Vite+** (`vp`); plain `vite` scripts for CI/Vercel; deploy via the Claude Code **Vercel connector** (`deploy_to_vercel`). See `DEV_WORKFLOW.md`.

## Quickstart (manual)
```bash
cp -r scaffold/* .          # use scaffold as the project root (engine.ts + engine.test.mjs included)
npm install
vp dev                      # (or npm run dev) — Overview renders the default board (~$23M net base, 4 advisors)
node engine.test.mjs        # 22/22
```
Then add the Frappe libs (per ULTRACODE_PROMPT step 1): `npm i frappe-ui frappe-charts`, enable the two FrappeUI lines in `src/main.ts`, add the frappe-ui Tailwind preset. Use `vp check` / `vp build` / `vp test` locally; Vercel builds with `npm run build` → `dist`.

## Fast-track (recommended)
Unzip, open the folder in Claude Code, paste `ULTRACODE_PROMPT.md`, and let it build the remaining views, charts, and the Vercel deploy. The engine is locked and verified, so the maths can't regress.

## Deploy (Vercel)
Framework preset **Vite** · build `npm run build` · output `dist`. `vercel.json` (SPA rewrite) is included. No backend, no env vars for v1.

## Status verified in this kit
- `engine.ts` reconciles to the Raiku dilution model: bridge **57,217** FD → Series C **118,707**; strike **$1,572.95**; base TGE FDV **$600M**; board net base **~$23M**. (22/22 tests.)
- `store.ts` + `engine.ts` bundle clean (TypeScript).
- Internal & confidential — keep the net-of-strike framing and "discussion draft, not a binding offer" caveats.
