# ULTRACODE_M9_PD2 — Advisor Comp Studio: M9 PD2 run-prompt (new session)

> **What this is.** A complete, self-contained build-run prompt for the **next session** of **M9 · UX/UI v2**
> (Linear COM, milestone `308fd627-11a5-4893-a19f-28104bc001de`). The **6 quick-wins** and the **5-issue PD1 spine**
> are **done and merged to production (`frosty`)**. This prompt drives **PD2 — per-advisor scenario projection over
> the frozen engine**: COM-82 → 81 → 85 → 83 → 84 → 86. **COM-87 (engine RFC) stays DEFERRED.** Authored 2026-06-09
> after merging the PD1 stack (PRs #9–#13) to `frosty` and flipping all five issues Done.
>
> **First three actions, every session:** (1) read `memory.md` (the dated tail — the live status of record); (2)
> read `CLAUDE.md` (locked rules); (3) read the COM issue you're about to build, **in full**, in Linear.
> `reference/advisor-comp-studio.tsx` is the UX/behaviour/legal/IA source of truth (visual = Espresso),
> **as extended by `COMP_STUDIO_SPEC_v2.md` — the product spec, ADOPTED 2026-06-09** (after this prompt was
> first authored). For NEW scope (M10 Engine v2 · M11 Trajectory & lifecycle · M12 Governance — Linear
> COM-139…170) and the Δ4 legal correction (COM-139), **the spec supersedes the reference**; for everything
> PD2 builds, nothing changes — PD2 remains presentation/state over the frozen engine.

---

## 0. State at handoff (2026-06-09, end of the PD1 session)
- **M8 COMPLETE. M9 in progress: 11 Done / 55 Backlog of 66.** This session shipped the **PD1 spine** as a single
  linear stack and **MERGED all 5 PRs to `frosty` (production)**, then flipped each Linear issue **Done**:
  - **COM-73** (#9) consolidate the package → Identity / Base grant / Performance; moved `upliftStartMonth` in ·
    **COM-77** (#10) FormControl `:description` + transient clamp `role="alert"` feedback · **COM-74** (#11)
    per-advisor Edited/Saved + Revert · **COM-75** (#12) inline roster kebab (change tier / open / remove) ·
    **COM-76** (#13) **Edit package Dialog** (extracted `components/PackageEditor.vue`, Advisors became a
    full-width read view).
  - **`frosty` HEAD = `1d53353`** (Merge PR #13). **Post-merge verified:** `scaffold/src` byte-identical to the
    verified stack tip, both engine tests **22/22**, `npm run build` exit **0** — prod green. 0 open PRs.
- **The Advisors page was RESTRUCTURED by COM-76** — this matters for PD2 line numbers (see §5). `Advisors.vue` is
  now ~222 lines: a header (Edit package button), `ContextStrip`, a read-only **Package summary** card, then a
  single-column **full-width projection** (`PotentialStrip` → `GrowthWaterfall` → `ExitSlider` → `UpsideCurve` →
  "Show detail" expander → `VestingTimeline`/`FootballField`/`MixBreakdown`/`DilutionPath`/Instruments). The
  editable field set now lives in **`components/PackageEditor.vue`** (a global frappe-ui Dialog mounted in App.vue,
  state via `composables/useEditor.ts`). **Several PD2 issues quote pre-COM-76 line numbers — locate by symbol, not line.**
- **Engine FROZEN and green.** PD1 touched no money logic. **NEXT = PD2, starting COM-82 (the state spine).**

---

## 1. Locked non-negotiables (keep in working memory every issue)
- **ENGINE FROZEN.** Money is computed in exactly one place: `computeAdvisor`/`computeBoard`/`walkScenario` in
  `scaffold/src/engine.ts` (the app engine) / `engine/engine.ts` (the canonical root copy). **Type-only tweaks
  allowed; NO money-logic changes.** Both tests stay **22/22**: `node scaffold/engine.test.mjs` AND
  `node engine/engine.test.mjs` (root needs `dangerouslyDisableSandbox`). Anchors: bridge 57,217 → Series C
  118,707/118,708; strike $1,572.95; base TGE FDV $600M; board net base ~$23M. **Views NEVER recompute money
  inline** — read/format engine output. (Exception sanctioned for PD2 view-side arithmetic that *mirrors* an
  existing engine formula over already-exported fields — see §2.)
- **Stack PINNED (do not re-litigate):** frappe-ui **0.1.278 (EXACT)** · frappe-charts **1.6.2 (EXACT)** · vue ^3.5 ·
  vue-router ^4 · vite ^5 · @vitejs/plugin-vue ^5 · tailwindcss ^3.4 (**NOT v4**, ESM config) · typescript ^5 · vue-tsc ^2.
- **frappe-ui is COMPONENTS-ONLY:** import by name; **NEVER `app.use(FrappeUI)`**. The frappe-ui **data layer**
  (createResource/useList/useDoc/useCall/frappeRequest/call/initSocket) is **out of scope**. State is local in
  `scaffold/src/store.ts` (a strict reducer) over the engine; transient UI state may live in a small composable
  (`composables/useEditor.ts` is the precedent). Frontend-only — no Frappe/Python backend.
- **frappe-charts:** bare `import { Chart } from 'frappe-charts'`, **no css import** (1.6.2 ships none). Custom SVG for
  waterfall, scatter, football-field, vesting timeline, DilutionPath.
- **Internal & CONFIDENTIAL.** Every equity figure **net of strike**. The "**discussion draft, not a binding offer**"
  caveat stays. The **legal corpus + benchmark strings are verbatim** — never reword (presentation/eyebrow copy is
  fair game; the locked legal sentences are not). **ONE sanctioned exception — COM-139 (spec v2 Δ4):** the
  reference's "CoC acceleration at Board discretion" sentence is **STALE** (Plan rules v9 deleted Rule 9.2);
  it gets corrected via COM-139 (with GC wording sign-off), and the corrected sentence becomes the new locked
  corpus. PD2's printed target-outcome line (COM-84) must carry the existing
  "**net of strike & dilution · not a forecast**" qualifier verbatim (it's already in `ExitSlider.vue`).
- **`reference/advisor-comp-studio.tsx` = UX source of truth** for features/labels/legal/IA/behaviour. Espresso is the
  visual layer; M9 sanctions deliberate "impeccable" visual polish, but labels/columns/IA/legal corpus stay unchanged.
- **≤ 450 LOC per COM issue · one issue = one PR (`Fixes COM-NNN`) · tests ship with logic · QA gate green.** Append a
  dated `memory.md` entry per issue. (Structural-move exception, used for COM-76: a verbatim relocation may exceed
  the cap as a reviewable move — get Robin's OK first; PD2 issues are small/M, none should need it.)
- **Merge protocol:** default is **STOP at the merge gate** — open the PR and stop. **Robin is the merge actor;
  merging `frosty` deploys prod.** Only merge if Robin explicitly says so — then merge in **stacked order**, retarget
  each child PR's base to `frosty` (`gh pr edit <n> --base claude/frosty-pasteur-8cf1db`) then `gh pr merge <n>
  --merge`, and **flip each Linear issue Done manually** (`save_issue state:"Done"` — the `Fixes` keyword does NOT
  auto-flip here). After merging, re-verify frosty: `git diff origin/frosty <tip> -- scaffold/src` empty + engine
  22/22 + build 0.

---

## 2. PD2 engine-boundary policy (READ BEFORE COM-82 — this is the crux of PD2)
PD2 projects per-advisor scenarios **over the frozen money core**. The realistic v1 need is fully covered by
presentation/state — **COM-87 (a bespoke per-advisor cap-table walk) is the only true engine edit and stays DEFERRED**
(do not build; surface for sign-off only). Three rules:

1. **`engine.ts` edits in PD2 are limited to ADDITIVE optional TYPES + reconcile DEFAULTS — and only in the scaffold
   copy.** COM-82 adds `caseOverride?: string` and `targetExit?: number` to the **`Advisor` interface** and defaults
   them in the **reconcile advisor mapper** (the same additive-normalization pattern reconcile already uses for
   `upliftStartMonth`/`grantRound`/`taxResidency`/etc.). This is permitted, but it MUST be **purely additive** (default
   new optional fields; drop only an *orphan* `caseOverride` whose key is gone from `plan.scenarios`), MUST NOT touch
   any money path, and **22/22 must re-prove**. **Edit ONLY `scaffold/src/engine.ts`** — the root `engine/engine.ts`
   is **read-denied by the sandbox and stays frozen/untouched**; its test stays 22/22 trivially (money unchanged), and
   the scaffold test stays 22/22 because the change is additive. Do NOT attempt to edit the root copy (you can't read
   it, and it doesn't need the PD2 fields).
2. **`pinnedIds` (COM-86) is TRANSIENT UI state on the reactive `Store` interface in `store.ts` — NOT on `State`** —
   so it never enters the `#s=` URL hash or localStorage. Keep it out of `State`/persist.
3. **View-side arithmetic that mirrors an existing engine formula over already-exported fields is allowed** (it is NOT
   a new engine money quantity). Example (COM-85): the per-scenario scatter ceiling has no engine export, so recompute
   it in the view as `s.netEqAt(c.eqPctCeil, s.exitVal) + c.tkPctCeil * s.fdv` — exactly mirroring `engine.ts` line ~277
   (`baseCaseCeil`) but for the selected scenario, using already-exported `s.netEqAt/s.exitVal/s.fdv` + the row's
   `c.eqPctCeil/c.tkPctCeil`. **STOP-and-ask** if any issue seems to require: adding a money field to the engine,
   changing the `Plan`/`State` shape (beyond #1's additive `Advisor` fields), a SCHEMA/version bump, or mutating
   `store.S.plan` in place (clone it). None of COM-82/81/85/83/84/86 should need that.

---

## 3. The per-issue Definition-of-Done (the loop)
1. Pick the issue; **set Linear COM-NNN → In Progress** (state id `4a7e54ac-…`). Read the matching reference slice.
2. Implement **presentation/state-only**, ≤ 450 LOC, scoped to that ONE issue. No money-logic, no `app.use(FrappeUI)`,
   no data layer. (COM-82's additive engine-type/reconcile edit per §2 is the only sanctioned `engine.ts` touch.)
3. **`vp check` clean FOR YOUR DIFF — run it from `scaffold/`** (`cd scaffold && vp check`; from the repo root it
   aborts trying to read the sandbox-denied root `engine/engine.ts`). Judge by whether *your* files are flagged; ignore
   the pre-existing ~26-file prettier drift + the 11 frozen-`engine.ts` oxlint warnings. **`vp fmt <your-files> --write`**
   (Oxfmt) to fix your formatting without touching the drift.
4. **Both engine tests 22/22:** `node scaffold/engine.test.mjs` AND `node engine/engine.test.mjs` (root needs
   `dangerouslyDisableSandbox`). Mandatory for COM-82; a guard for the rest.
5. **`( cd scaffold && npm run build )` → exit 0.**
6. **Preview-verify the CHANGED surface on `:4173`:** `( cd scaffold && npm run build )` (~3s) → reload
   `http://localhost:4173` → DOM/screenshot + **no NEW console errors**. (build→:4173 is the stable path; `:5173` dev
   crashes under the preview MCP.)
7. **`/code-review`** on the diff (`/security-review` only for auth/tenancy/confidential/legal/money — PD2 presentation
   rarely qualifies).
8. **Revert build churn before commit:** `git -c core.fsmonitor=false checkout scaffold/components.d.ts
   scaffold/auto-imports.d.ts scaffold/package-lock.json`.
9. **Commit** `feat|fix(COM-NN): …` + footer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`;
   **branch off the prior PD2 PR tip (single linear stack)**; open a PR **`Fixes COM-NNN`** (base = the prior PD2
   branch; GitHub auto-retargets to frosty as parents land).
10. **Append a dated `memory.md` entry** (own `docs(memory):` commit).
11. **STOP at the merge gate** (unless Robin says merge — then merge + flip Linear Done, see §1).

---

## 4. The goal + PD2 sequence (build in this order — COM-82 is a hard prerequisite)

**COM-82 is the state spine; COM-81 needs its `caseOverride`, COM-84 needs `targetExit`, COM-86 needs `pinnedIds`.**

- **COM-82** (P2 High, **S ~70**) — *State spine: `caseOverride` / `targetExit` / `pinnedIds` + reconcile cascades.*
  Add optional `caseOverride?: string` + `targetExit?: number` to the **`Advisor` interface** and default them in the
  **reconcile advisor mapper** (`scaffold/src/engine.ts` — additive only, per §2). Add transient `pinnedIds: string[]`
  to the reactive **`Store` interface** in `store.ts` (NOT to `State`). Make **`delScenario`** scrub any advisor
  `caseOverride` pointing at the deleted scenario key (cascade parity with `delMilestone`/`delRound`/`delTier`). Add
  **`setAdvisorCase(id, key|null)`** and **`setAdvisorTargetExit(id, v)`** reducers (each `persist()`-wrapped) to
  `useStudio`'s returned actions. No SCHEMA/version bump (optional fields; `reconcile`/`validImport` already tolerate
  them). **Renders/computes nothing itself.** Files: `scaffold/src/engine.ts` (Advisor type + reconcile mapper),
  `scaffold/src/store.ts` (Store interface, delScenario, reducers). **Re-prove BOTH engine tests 22/22.**
- **COM-81** (P2 High, **M ~100**) — *Per-advisor case override (re-base ONE advisor without flipping the board).*
  In `store.ts`'s **`selected` computed**, when `sel.caseOverride` is set, call `computeAdvisor(a, {...store.S.plan,
  baseScenario: a.caseOverride}, store.S.tiers, store.S.objectives)` — a **shallow plan clone, never a mutation** of
  `store.S.plan` (else Board/Compare/Overview leak the override). Surface a small frappe-ui **`Select`** ("This
  advisor's case", default "Match board" → `setAdvisorCase(id, null)`) + a theme-orange **Badge** "Override: <Label>"
  when diverged — in the Advisors header beside `AdvisorPicker`, OR inside `PackageEditor.vue`. Presentation/state
  only; consumes COM-82's `caseOverride`. Files: `store.ts` (selected computed), `Advisors.vue`/`PackageEditor.vue` (UI).
- **COM-85** (P3 Med, **M ~60**) — *Board-local scenario selector.* A **local reactive ref** (NO store mutation, no
  setPath) holding a chosen scenario key (default `baseScenKey(S.plan)`); a frappe-ui `TabButtons`/`Select` over
  `scenKeys(S.plan)`. Re-key the three Board surfaces off `c.scen.find(x => x.key === sel)` (fall back to `c.base`):
  the **scatter** (x=`s.total`, y = per-scenario headroom recomputed in-view per §2 rule 3), the **roster value cell +
  board total** (`s.total`; relabel the "Net base-case" header), and the **company-cost** highlight (move the white
  card to `board.cost[sel]` — already per-scenario). Engine untouched. File: `Board.vue`.
- **COM-83** (P3 Med, **M ~90**) — *"Across scenarios" small-multiples on the Advisors hero.* New
  **`components/ScenarioTable.vue`**: rows = scenarios, cols = Net / Equity / Tokens (tabular-nums, right-aligned), a
  "base" ring where `key === c.base.key`, an underwater badge from `scen.underwater`. Read straight from `c.scen[]`
  (total/equity/token/underwater/key/label all pre-exist — no derivation). Promote `FootballField` out of the
  "Show detail" expander; the now-redundant `PotentialStrip` tiles become table rows (keep `ExitSlider`+`UpsideCurve`).
  Files: `Advisors.vue`, new `ScenarioTable.vue`.
- **COM-84** (P3 Med, **M ~120**) — *Persist a chosen exit as a per-advisor "target outcome" that prints.* **Needs
  COM-82's `targetExit`.** In `ExitSlider.vue` init `pos` from `sel.targetExit` (map $→pos by interpolation over the
  sorted `c.scen` `exitVal`s), else `baseIndex`; on `@change` write `view.exitVal` back via `setAdvisorTargetExit`
  (or `setPath(['advisors', idx, 'targetExit'], v)`). Add a **print-visible** line "At a ~$X exit, this package is
  worth ~$Y net" on Advisors (near `ExitSlider`) and on **Proposition** (print-area + appended to `propText()`),
  reusing `fUSD` and carrying the "net of strike & dilution · not a forecast" qualifier verbatim. Keep the slider
  INPUT no-print; only the sentence prints. X/Y are interpolations of existing per-scenario `exitVal`/`total` — no new
  money. Files: `ExitSlider.vue`, `Proposition.vue`, `Advisors.vue`.
- **COM-86** (P3 Med, **M ~130**) — *Compare: "Spread" column + pin-to-compare panel.* **Needs COM-82's `pinnedIds`.**
  Add a sortable **"Spread"** column = `fUSD(max(scen.total) − min(scen.total))` per row (max/min over existing totals).
  Add a **"Pin"** toggle (cap 3) over `pinnedIds`; when ≥2 pinned, render a transposed panel ABOVE the matrix (rows =
  scenarios, cols = pinned advisors, cells = net + the existing Δ shape) + a grouped bar reusing `FrappeChart` +
  `SCEN_TOKENS`/`chartHex` (`constants.ts`). All from `c.scen.total`. File: `Compare.vue`.
- **COM-87** (P4 Low, L ~200) — **DEFERRED. DO NOT BUILD.** Bespoke per-advisor roadmap overrides genuinely require
  editing the frozen `walkScenario`/`computeAdvisor` + a new `Plan.advisorScenarios` field + new test vectors —
  maximal engine risk. The four PD2 presentation issues cover v1. **Surface for Robin's explicit sign-off; do not
  author a build for it.**

**STOP-FOR-ROBIN tripwire (all PD2):** if an issue needs a NEW money quantity in the engine, a changed
`Plan`/`State` shape (beyond COM-82's additive `Advisor` optional fields), a SCHEMA/version bump, or a logic change in
`computeAdvisor`/`computeBoard`/`walkScenario` → it has crossed the engine boundary → **HALT and ask** (it becomes an
RFC like COM-87). None of the six should.

**After PD2:** ③ clean layout & IA (COM-88 de-box static sections · COM-89 ~940px reading column · COM-90 Board roster-
first · COM-95 Configure two-column) → ④ the **frappe-ui adopt cluster** (decisions already made — see §6): COM-104
Sidebar (adopt + scrim drawer) · COM-105 CommandPalette full rebuild · COM-96 local RosterTable · COM-121 remove dead
mono + sentence-case labels · COM-110 delete dead `[data-theme=dark]` branch → then the visual-system/anti-slop,
charts, editorial, and responsive/print/empty-state hardening sets (remaining COM-* to COM-138).

**After/alongside M9 (spec v2 roadmap — Linear carries it as of 2026-06-09):** **COM-139** (M9 High — the Δ4
legal-corpus correction; small, buildable any time, GC wording sign-off) → **M10 · Engine v2** (COM-140 RFC +
reconciliation gate FIRST; then COM-142–154: value-denominated grants, per-grant strike, dual vesting curves,
scenario sets + walk-forwards, leaver engine, exercise windows/backstop, conversion fallback, capital schedule,
cash-floor — the engine unfreezes ONLY behind COM-140's green parity suite) · **M12 · Governance & compliance**
(COM-141 checklist may start presentation-only ANY time; COM-166–170) · **M11 · Trajectory & lifecycle**
(COM-155–165; depends on M10). **COM-87 is SUPERSEDED by COM-140/143 — still do not build it.** M6 (COM-33/34/35)
remains the most urgent RISK item per spec Part 14 — the live URL is public.

---

## 5. Gotchas (verified this PD1 session — read before you build)
- **STALE LINE NUMBERS:** COM-76 restructured `Advisors.vue` (now ~222 lines, single-column, no left editor; the field
  set moved to `components/PackageEditor.vue`). PD2 issues quote pre-COM-76 lines (e.g. "Advisors.vue:382-407",
  "store.ts:198-206"). **Locate by symbol** (`selected` computed, `ExitSlider`, `propText`, `c.scen`, `setPath`), not
  raw line numbers. The per-advisor compute call is the **`selected` computed in `store.ts`** (~lines 191-194):
  `computeAdvisor(a, store.S.plan, store.S.tiers, store.S.objectives)` — COM-81's override lives HERE.
- **ENGINE COPIES + sandbox:** the app imports `scaffold/src/engine.ts`. The **root `engine/engine.ts` is read-denied**
  (settings deny `Read(./engine/engine.ts)` + sandbox) — **don't try to edit it; it stays frozen.** COM-82 edits only
  the scaffold copy (additive). `node engine/engine.test.mjs` needs `dangerouslyDisableSandbox: true` (it reads the root
  engine). git/`gh`/push also need `dangerouslyDisableSandbox` — prefix git with `git -c core.fsmonitor=false …`.
- **`structuredClone` THROWS on Vue reactive proxies** (`DataCloneError`). For snapshots/clones of `sel`/advisors use
  **`JSON.parse(JSON.stringify(x))`** (the store's proven `clone` idiom). COM-76's `cloneAdv` is the precedent.
- **frappe-ui `FormControl` has NO `:error` slot/prop and no default slot** — only `label` + `description` (prop or
  `#description` slot, rendered `text-p-xs text-ink-gray-5`). For inline errors, render a transient
  `<p role="alert" class="text-p-xs text-ink-red-3">` yourself (COM-77 pattern). `FormLabel` IS exported
  (`text-xs text-ink-gray-5`). `Dialog`: `<Dialog v-model="open" :options="{title,size:'lg'}">` + `#body-content` +
  `#actions="{ close }"` (COM-76 / the Mgr dialog in App.vue are the precedents). `Dropdown`: `:options` (flat or
  grouped, items `{label,icon,onClick,theme,submenu}`), `#trigger` slot, portals to body; `icon` accepts a `lucide-*`
  class string (COM-75 kebab).
- **PREVIEW console buffer is CUMULATIVE across reloads** — old errors persist and reappear. Judge "no NEW errors" by
  whether the **count grows** and which **bundle hash** the stack cites (a stale error cites a deleted bundle hash).
  A frappe-ui **Dialog's teleported content lingers** briefly after close — judge open/closed by the reka
  `role="dialog"` element, not button/title text. `preview_eval` does NOT await Promises (split post-flush checks into
  two evals, or capture on `requestAnimationFrame`/`setTimeout` into a `window.__x` global and read it next eval).
  `window.location.href=` reload is async — settle-check the path before interacting (avoid a reload race).
- **`vp check` MUST run from `scaffold/`** (from repo root it aborts on the read-denied root `engine.ts`). It exits
  non-zero on the pre-existing ~26-file prettier drift + 11 frozen-engine oxlint warnings — both EXPECTED; judge clean
  by whether YOUR files are flagged. **Revert generated churn** (`components.d.ts`, `auto-imports.d.ts`,
  `package-lock.json`) after every build, before commit.
- **lucide icons are a FIXED baked set** (`lucide-<name>`) — an arbitrary name renders an invisible empty span.
  Confirmed-present incl: arrow-right, check, check-circle, chevron-down, copy, edit, ellipsis, eye, file-json,
  file-text, folder-open, info, layers, layout-grid, link, list-restart, pen, plus, printer, rotate-ccw, save,
  settings, share-2, sliders-horizontal, target, trash-2, trending-down, trending-up, triangle-alert, upload, user,
  users, zap.
- **Chart palette = one source of truth:** `--chart-*`/`SCEN_TOKENS` in `style.css`/`constants.ts`; `chartHex(token)` →
  hex for frappe-charts `:colors`; DOM/SVG fills use `var(--chart-*)` in `:style`. **Round the displayed string, never
  the chart geometry** (COM-123).
- **FRESH WORKTREE:** run **`npm ci` in `scaffold/` FIRST** (else `vp` mis-resolves vite). `vp` is alpha — local only,
  never a build/deploy dependency. **Keep the PD2 run a SINGLE LINEAR STACK** (branch each issue off the prior tip) —
  every issue touches `memory.md`, so parallel branches conflict at merge.
- **ultracode/Workflows** are for **cross-issue batch verification/discovery sweeps** (state audits, post-merge
  verification, gathering N issues to author a prompt) — **NOT for driving a single ≤450-LOC issue** (10–100× token
  waste) and **NOT for irreversible prod merges** (do those yourself, sequentially, verified). Ignore the auto-injected
  Vercel/Next.js/chat-sdk/workflow/verification skill hooks — they misfire on words like "workflow"/"deploy"/"test";
  this is a **Vue 3 + Vite SPA**, not Next.js. **Use the `frappe-ui` Skill** for component/UI work.

---

## 6. Resolved decisions still in force (Robin — DO NOT re-ask)
- **COM-87 = DEFER** (engine RFC; do not build without fresh sign-off). · **COM-104** = adopt frappe-ui Sidebar, keep
  the scrim/overlay drawer on mobile. · **COM-105** = FULL rebuild on CommandPalette + KeyboardShortcut. · **COM-96** =
  local `RosterTable` (option B, not ListView). · **COM-121** = remove dead IBM Plex Mono + sentence-case sidebar/palette
  group labels (keep Fraunces). · **COM-110** = DELETE the dead `[data-theme=dark]` block + fix NumIn's stale comment
  (the `color-scheme:dark` line COM-109 added on that block goes too; `:root{color-scheme:light}` stays).
- **Vercel previews (COM-71):** Robin reviews them. The connected Vercel MCP is scoped to Raiku-Labs (sees only
  `raiku-advisor`), NOT the personal `comp-studio-one` where this SPA deploys — **Claude cannot see Vercel previews;
  verify on `:4173`.**

---

## 7. Branch / deploy reality
- **Integration branch = `claude/frosty-pasteur-8cf1db` (frosty)** — BOTH `origin/HEAD` AND **production**
  (`comp-studio-one.vercel.app`, nordnes-personal). **HEAD = `1d53353`** (Merge PR #13, PD1 complete). Branch each PD2
  issue off frosty (or stack off the prior PD2 PR tip), PR back INTO frosty with `Fixes COM-NNN`.
- `main` exists and is behind frosty (older docs); it is NOT the deploy branch and NOT origin/HEAD. Reason against
  `origin/*`, not stale local refs. **Robin is the sole merge actor** by process; merging frosty deploys prod.
- This run-prompt (`ULTRACODE_M9_PD2.md`) is committed to frosty (docs-only; not in `scaffold/`, so it doesn't affect
  the Vercel build).

---

## 8. Kickoff (paste to start the next session)

```
Read memory.md (dated tail) + CLAUDE.md + ULTRACODE_M9_PD2.md, then the COM-82 issue in full. PD1 is merged to
frosty (prod, HEAD 1d53353) and all 5 issues are Done. Start PD2 with COM-82 (the state spine: add optional
caseOverride/targetExit to the Advisor type + reconcile defaults in scaffold/src/engine.ts ONLY — additive, re-prove
22/22; add transient pinnedIds to the Store; delScenario cascade; setAdvisorCase/setAdvisorTargetExit reducers), in
Plan Mode before any edit. Then 81 → 85 → 83 → 84 → 86, one PR each (Fixes COM-NNN), ≤450 LOC, single linear stack,
engine money-logic frozen 22/22, verify on :4173, STOP at the merge gate — I merge. Do NOT build COM-87 (deferred).
Apply the §6 decisions when you reach the adopt cluster.
```

— Authored 2026-06-09 after merging the PD1 stack (#9–#13) to `frosty` and flipping COM-73/77/74/75/76 Done; grounded
in a post-merge verification sweep (frosty `1d53353`, engine 22/22, build 0) and a 7-agent PD2 discovery sweep over the
Linear issues. The engine's money core is frozen, COM-82 is the additive state spine, and `memory.md`'s dated tail is
the live status of record.
