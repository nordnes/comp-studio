# Advisor Comp Studio — build-run handoff (state + workflow reference)

This supersedes the original v1 "build & ship" prompt (preserved in git history). It is the durable
build-run reference. **`memory.md` (repo root) is the detailed dated log — read it first.** Then `CLAUDE.md`.

## Current state (2026-06-09)
- **v1 SHIPPED + live** (`comp-studio-one.vercel.app`), **M7 COMPLETE** (a11y/control floor), **M8 COMPLETE**
  (UX/UI uplift — all 23 issues Done). v1 prod deploys from **`claude/frosty-pasteur-8cf1db`**.
- **M8 final batch (this branch `claude/relaxed-faraday-a9f377`, PR #2 → frosty, READY):** COM-65 (pending
  chip) · 60 (chart-mount flash) · 64 (Proposition band) · 59 (print confidentiality mark) · 48 (scatter
  declutter) · 57 (UpsideCurve breakeven) · 58 (Compare delta/sticky) · 47 (exit slider) · 66 (Share/Reset
  menu) · 69 (vp-check green) · 62 (left-sidebar shell, absorbs 67 + 63 board-switcher) · 72 (lighten
  Configure + FormControl) · 63 (⌘K palette). Prior 11 M8 issues were PR #1 (merge 9ba086d).
- **Gate is green:** `( cd scaffold && npm run build )` exit 0 · `node scaffold/engine.test.mjs` +
  `node engine/engine.test.mjs` → 22/22 · `vp check` EXIT 0 (11 advisory unused-var warnings on the FROZEN
  engine.ts/engine.test.mjs — unfixable, non-failing).

## Immediate next step (Robin's call — outward-facing)
**Merge PR #2 (`relaxed-faraday-a9f377` → `frosty-pasteur`) — this DEPLOYS PROD.** A Copilot review is
requested; review the Vercel preview, resolve threads, then `merge_method: merge`. Not auto-merged.

## Remaining roadmap (post-M8, out of M8 scope)
- **COM-36** — merge `frosty-pasteur` → `main` + point Vercel prod at the chosen branch.
- **COM-71** — re-auth the Vercel `nordnes-personal` connector (human; unblocks API deploy checks).
- **M6 (COM-34/35)** — auth + DB. NEW phase (backend) — needs Robin's product decisions before scoping;
  conflicts with the current "frontend-only, no Frappe data layer" lock until then.

## Locked stack (do NOT re-litigate)
- **frappe-ui 0.1.278 (exact) ADOPTED as-is** (Espresso/Inter); import components by name; **NEVER
  `app.use(FrappeUI)`**; frappe-ui data layer OUT of scope (state is local in `store.ts` over the engine).
- **frappe-charts 1.6.2 (exact)**, bare import, NO css; scatter NOT implemented (custom SVG); staircase =
  grouped bar. Custom SVG for waterfall / scatter / football / vesting / DilutionPath / UpsideCurve-equity.
- **`engine/engine.ts` + `scaffold/src/engine.ts` FROZEN** — only place money is computed; type-only tweaks,
  NO logic changes; both test copies stay **22/22**. Views never recompute money inline.
- Pins: vue ^3.5 · vue-router ^4 · vite ^5 · tailwind ^3.4 (NOT v4, ESM config) · ts ^5 · vue-tsc ^2.
- **Confidential + net-of-strike; "discussion draft, not a binding offer."** Legal/benchmark strings VERBATIM.
  `reference/advisor-comp-studio.tsx` = UX/behaviour/legal/IA truth (visual = Espresso).

## Per-issue workflow (≤450 LOC/issue, one issue = one push)
1. Linear COM issue → **In Progress** (state `4a7e54ac-…`). 2. Implement, presentation-only. 3. **Gate:**
`( cd scaffold && npm run build )` exit 0 · `node scaffold/engine.test.mjs` 22/22 · `vp check` EXIT 0 (local;
revert engine.ts + `*.d.ts` after `--fix`) · **live preview pass** (see below). 4. Linear → **Done**
(`03cc9c60-…`). 5. Commit `feat|fix(COM-XX)` + `Co-Authored-By: Claude Opus 4.8 (1M context)` → push the dev
branch (preview redeploys). 6. Append a dated `memory.md` entry (own `docs(memory):` commit).
- **Batch-merge to frosty at the MILESTONE GATE only** (PR review + Copilot + Robin's go — it deploys prod).
- Git/gh/push need `dangerouslyDisableSandbox: true` + `git -c core.fsmonitor=false …` (sandbox denies
  `engine/engine.ts` reads → the root engine test also needs sandbox off).
- **Before every commit revert generated churn:** `git -c core.fsmonitor=false checkout
  scaffold/package-lock.json scaffold/components.d.ts scaffold/auto-imports.d.ts`. Commit source only.

## Local preview (when equipped — this session was)
- `.claude/launch.json` has `comp-studio` (vite preview over built `dist/`, :4173 — STABLE) and
  `comp-studio-dev` (vite dev :5173 — CRASHES under the preview MCP). Use `comp-studio`; the loop is
  **edit → `npm run build` (~3s) → reload :4173 → verify** (aligns with the build gate). The server can drop
  mid-session → `preview_start` again (new serverId). Desktop route nav via `location.href='/route'` works.
- **`preview_eval` does NOT await Promises** (async evals hang 30s) → do post-Vue-flush checks as TWO sync
  evals. Programmatic `.focus()` on SVG `<g>` won't trigger `:focus-visible`; mouse paths: dispatch
  `new MouseEvent('mouseenter')`. Screenshots can blank after a window scroll → resize the viewport TALL so
  the page fits at scroll 0. Preview can emulate `prefers-color-scheme: dark` → use `colorScheme:'light'`.

## Reusable facts (this codebase)
- **lucide icons = a FIXED 46-class set baked into frappe-ui's CSS** (`lucide-<name>`). NOT on-demand — an
  arbitrary `lucide-foo` is an invisible empty span. The 46: archive, arrow-right, bell, building-2, check,
  check-circle, chevron-down, clipboard-paste, copy, edit, ellipsis, eye, file-json, file-text, folder-input,
  folder-open, inbox, info, layers, layout-grid, link, list-restart, log-out, mail, message-circle, moon,
  more-horizontal, pen, plus, printer, rotate-ccw, save, settings, share-2, sliders-horizontal, smile, target,
  trash-2, trending-down, trending-up, triangle-alert, upload, user, user-plus, users, zap. (No clock/hourglass.)
- **Chart palette = one source of truth (COM-56):** `--chart-*` tokens in `style.css`; `constants.ts`
  `CAT`/`TIER_COLOR` = `var(--chart-*)`, `chartHex(token)` resolves token→hex (light-literal fallback). DOM/
  custom-SVG fills use `var(--chart-*)` in `:style`/`style` (NEVER as an SVG presentation attr); frappe-charts
  `:colors` use `chartHex()`. `.prettierignore` excludes engine.ts + `*.d.ts` from `vp` format; vp's oxlint
  does NOT honor `.oxlintrc.json` ignorePatterns (frozen-engine lint warnings stay advisory).
- **App shell (COM-62):** App.vue = left sidebar (workflow groups Board/Advisor + Configure footer +
  board-switcher + ⌘K trigger) + a thin `#app-header` (breadcrumb + PageHeader actions teleported on lg,
  in-body <lg). `CommandPalette.vue` = ⌘K (Cmd/Ctrl+K or `open-command-palette` window event).

## Open follow-ups noted (Robin's call)
- **`color-scheme: light`** is NOT set on `:root` → on a dark-OS browser, native scrollbars/date-pickers
  render dark on the light app. 1-line `style.css` lock; out of M8 scope. (See COM-64 memory entry.)
- COM-50 `--chart-tint` (DilutionPath mid bars) + COM-51 tier-ramp luminance / VestingTimeline hatch were
  deferred-visual; revisit if desired. Dark `[data-theme=dark]` chart tokens are untuned (charts light-only).

## Where things live
`CLAUDE.md` (standing rules) · `memory.md` (dated log) · `IMPLEMENTATION_PLAN.md` · `TECH_BRIEF.md` ·
`research/EMPIRICAL.md` (verified frappe-ui recipe) · `engine/` (frozen maths + spec) · `scaffold/` (the app).
Linear: COM project, **M8 milestone `d67cd073-…`** (now complete). Use the **frappe-ui Skill** for UI work.
