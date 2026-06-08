# Dev workflow — Advisor Comp Studio web app

Repo: **github.com/nordnes/comp-studio** · Linear: **COM** project "Advisor Comp Studio — Web App (Frappe/Vercel)".

## Commands (Vite+ local, plain Vite for CI/Vercel)
| Task | Local (Vite+) | Repo script / CI |
|---|---|---|
| Dev server | `vp dev` | `npm run dev` (`vite`) |
| Lint + format + typecheck | `vp check` | — |
| Build | `vp build` | `npm run build` (`vite build`) → `dist` |
| Engine tests | `vp test` | `npm run test` (`node engine.test.mjs`) |
| Preview | `vp preview` | `npm run preview` |

Vercel build settings: **Build `npm run build` · Output `dist`** · SPA rewrite in `vercel.json`. Deploy with the Claude Code **Vercel connector** (`deploy_to_vercel`).

## Per-issue loop (≤450 LOC)
1. Move the Linear issue → **In Progress**; create its branch.
2. Implement only that issue's scope (read the matching part of `reference/advisor-comp-studio.tsx`).
3. `vp check` → clean.
4. **Functional pass:** `vp dev`, exercise the route/feature.
5. **Visual pass:** screenshot the route; compare to the reference; fix drift.
6. `vp build` + `vp test` (engine 22/22) green.
7. Commit; move the issue → **Done**.

## Milestone gate (between M0…M5)
`vp build` + engine spec green → `deploy_to_vercel` preview → visual smoke of every built route → advance. **Don't start the next milestone until the current preview is green.**

## Dynamic / parallel work
Within a milestone, run independent issues as parallel sub-agents (they touch different files); integrate, then run the gate. See the concurrency map in `ULTRACODE_PROMPT.md`.

## Guardrails
- `engine.ts` is the maths — reuse verbatim; keep `engine.test.mjs` green.
- Frontend-only; no Frappe/Python backend.
- ≤450 LOC per issue — if it grows, split and add a Linear sub-issue in the same milestone.
- Internal/confidential framing + net-of-strike caveats stay.
