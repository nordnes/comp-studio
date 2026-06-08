# Claude Code prompt — uplift & ship the Advisor Comp Studio UX/UI (M7 + M8, continuous run)

Paste everything below into a fresh Claude Code session, working in the repo at `/Users/nordnes/dev/comp-studio` (worktree `.claude/worktrees/frosty-pasteur-8cf1db`, remote **https://github.com/nordnes/comp-studio**). Run it as **one continuous goal**: work the 32-issue **M7 + M8** UX/UI uplift backlog (COM-37 … COM-68) issue-by-issue, closing each one out fully — In Progress → implement → QA gate green → **mark Done + PR/merge** → log `memory.md` — until M7 then M8 are complete.

> **Stack direction (POST-GATE, 2026-06-08 — UNCHANGED):** `frappe-ui` is **ADOPTED as-is** (Espresso preset + Inter) as the UI system; `frappe-charts` is the primary chart engine; `engine/engine.ts` is **FROZEN**. v1 is **SHIPPED and live**. This milestone is a **presentation-only uplift** — no engine logic, no backend, no new product surface. The locked stack is **not** re-litigated. The Phase-0 "reject frappe-ui" sections in `research/FINDINGS.md` §1/§7/D2/D3 are the **audit trail**, not current direction.

---

## 1. Mission & current state

**v1 is SHIPPED and live: https://comp-studio-one.vercel.app/** — all 6 routes render, charts paint, numbers reconcile ($23.0M board base, $600M base TGE FDV), zero console errors, persistence works (localStorage + clipboard + URL hash). The Vercel project is **team Nordnes Personal**, name `comp-studio`, Root Directory `scaffold`, framework Vite, build `npm run build`, output `dist`. **Production deploys from the feature branch `claude/frosty-pasteur-8cf1db`** (see §4).

A **6-agent UX/UI audit** (impeccable design critique + impeccable technical audit + frappe-ui under-adoption + Frappe-templates/OSS research + cap-table-domain UX → synthesis) scored the live app:
- **Nielsen heuristics ~31.5/40** (lanes 34 + 29) · **frappe-ui adoption ~14/20** (tokens 9/10 *excellent*, components 5/10 *under-adopted*) · **technical a11y 13/20**.
- **Verdict: NOT AI slop** — top ~10% on the slop axis (real Fraunces/Inter hierarchy, 60-30-10 single-amber accent, gap-px hairline grids, genuine empty states, a Proposition that reads as designed).
- **One dominant finding — two token-level WCAG AA contrast failures, both fixable in a single theme sweep:**
  - `ink-gray-5` **#7C7C7C @ 4.17:1** on every label/caption — **131 usages across all 17 view/component files** (verified). Promote to `ink-gray-6`.
  - `ink-amber-3` on `surface-amber-2` **@ 2.93:1** on every accent eyebrow — **37 usages** (verified). Darken.
  - Because both are **token-driven**, COM-37 + COM-38 clear the bulk of the a11y backlog in the least code.

The audit produced **32 issues, COM-37 … COM-68**, split across **two milestones**: **M7 · Accessibility & user-control floor** (9 issues, target 2026-06-30) and **M8 · UX/UI uplift — frappe-ui, charts, IA, decision aids** (23 issues, target 2026-07-31). The next session (you) implements this backlog. **Every issue is presentation-only; the engine stays frozen throughout.**

The codebase you are uplifting (all under `scaffold/src/`):
- **Views (6):** `views/Overview.vue` · `views/Advisors.vue` · `views/Board.vue` · `views/Compare.vue` · `views/Proposition.vue` · `views/Configure.vue`
- **Shared components (15):** `AdvisorPicker.vue` · `ContextStrip.vue` · `DilutionPath.vue` · `EquityBenchmark.vue` · `FootballField.vue` · `FrappeChart.vue` · `GrowthWaterfall.vue` · `MixBreakdown.vue` · `NumIn.vue` · `PageHeader.vue` · `PoolAllocation.vue` · `PotentialStrip.vue` · `StageBadge.vue` · `UpsideCurve.vue` · `VestingTimeline.vue`
- **State + presentation data:** `store.ts` (reducer + Mgr `{scenarios,last}` + cascades + clipboard/URL/JSON/CSV) · `constants.ts` (presentation palette/copy) · `engine.ts` (**FROZEN** — `SCEN_COLORS` currently lives at `scaffold/src/engine.ts:59`; see §2).

---

## 2. LOCKED non-negotiables (restate from `CLAUDE.md` — preserve in EVERY issue)

- **Engine frozen.** `engine/engine.ts` (→ `scaffold/src/engine.ts`) is the **only place money is computed**. **Type-only tweaks allowed; NO logic changes; never reimplement formulas.** `node engine/engine.test.mjs` (and `node engine.test.mjs` from `scaffold/`) must stay **22/22** (anchors: bridge 57,217 FD → Series C 118,707; strike $1,572.95; base TGE FDV $600M; board net base ~$23M). Views never recompute value/dilution/strike/gating/pools inline — they read engine outputs.
  - **⚠️ `SCEN_COLORS` must MOVE OUT of `engine.ts`, not be edited in place.** It is at `scaffold/src/engine.ts:59` today; `scaffold/src/constants.ts:2` already carries the comment that it "lives in the engine." For COM-56, **relocate `SCEN_COLORS` into `constants.ts`** as a semantic-token palette and update the two importers (`views/Compare.vue` imports it from `'../engine'`). `engine.ts` itself is sandbox **read-denied** (owner root, mode 0) — you cannot edit it via shell, and you must not; the relocation is a move *out*, with imports re-pointed.
- **NEVER `app.use(FrappeUI)`.** It defaults `{resources:true, call:true, socketio:true}` — opens a socket.io connection (`initSocket()`) and installs the Frappe RPC/resource layer (backend-bound). **Import frappe-ui components BY NAME only.**
- **frappe-ui data layer is OUT OF SCOPE.** No `createResource` / `createListResource` / `createDocumentResource` / `useList` / `useDoc` / `useCall` / `frappeRequest` / `call` / `initSocket` / `resourcesPlugin` / `FrappeUIProvider`-as-data-layer. State stays **local** (`store.ts` over the frozen engine, persisted to localStorage). No `/api/method/...` calls anywhere. (`FrappeUIProvider` is currently mounted **only as `ToastProvider`** with `<Dialogs/>` for `confirmDialog`/`toast` — that is socket-safe and stays.)
- **frappe-charts 1.6.2 — bare import, NO css.** `import { Chart } from 'frappe-charts'` with **NO css import** — 1.6.2 ships **zero** css; styles self-inject via `styleInject`. Importing `frappe-charts/dist/frappe-charts.min.css` **404s and BREAKS the Vite build.** `scatter` is **NOT implemented** in 1.6.2 — never pass `type:'scatter'`; scatter is **custom SVG**. The valuation staircase is a grouped **bar** (Robin's call), not SVG.
- **Exact / locked pins — do NOT upgrade:** `frappe-ui 0.1.278` (EXACT) · `frappe-charts 1.6.2` (EXACT) · `vue ^3.5` · `vue-router ^4` (not 5) · `vite ^5` (not 6/7/8) · `@vitejs/plugin-vue ^5` · `tailwindcss ^3.4` (**NOT v4** — the Espresso preset is v3-only; `tailwind.config.js` must stay **ESM**) · `typescript ^5` · `vue-tsc ^2`. **Do NOT add `@headlessui/vue`** — frappe-ui already bundles it (plus `@floating-ui/vue`, `reka-ui`, `vue-sonner`).
- **Confidential + net-of-strike framing.** Internal & confidential tool; **every equity figure net of strike**; output is a **"discussion draft, not a binding offer."** Keep `Confidential · Discussion Draft` running marks. The legal corpus + benchmark source strings are ported **verbatim** — do not alter their wording when restyling.
- **`reference/advisor-comp-studio.tsx` is the UX/behaviour/legal-copy/IA source of truth.** The *visual* design is Espresso/Inter; *features, labels, caveats, IA* match the reference. Parity checklist: `research/D-feature-inventory.md`.
- **Wiring guardrails (all build-green — do NOT regress):** `vite.config.ts` = `frappeui({frappeProxy:false, jinjaBootData:false, buildConfig:false})` then `vue()`, `build:{outDir:'dist', target:'es2020'}`, `optimizeDeps:{include:['feather-icons']}` (without it Vite throws *"feather-icons does not provide an export named 'default'"* and nothing renders). `tailwind.config.js` = ESM importing `frappeUIPreset from 'frappe-ui/tailwind'`, content glob including `./node_modules/frappe-ui/src/**`. `main.ts` imports `frappe-ui/style.css` **before** `./style.css`, **no** `app.use(FrappeUI)`.
- **Use the `frappe-ui` Skill for ALL component/UI work** (component catalog / tokens / patterns / layout templates). Its generic `SETUP.md` is **Frappe-backend-oriented and WRONG for this repo** (prescribes `app.use(FrappeUI)`, `<FrappeUIProvider>`, `optimizeDeps.exclude:['frappe-ui']`) — the verified backendless recipe in `research/EMPIRICAL.md` / `TECH_BRIEF.md` §2c **wins**. Use the Skill for catalog/tokens/patterns only.
- **Use `/impeccable` for visual passes** (and `design:accessibility-review` for the a11y-heavy M7 issues). Default to semantic tokens (`bg-surface-*`, `text-ink-*`, `border-outline-*`), **never raw `bg-gray-*`**. Surfaces compose with `bg-surface-white rounded border border-outline-gray-1 p-4`.
- **Tables stay plain token-styled `<table>`** (Espresso tokens) — do **NOT** use frappe-ui `ListView` (resource-model/backend bound) for the Board/Compare computed tables. **CSV import stays `<input type=file>` + `FileReader`** — do **NOT** use frappe-ui `FileUploader` (targets Frappe `/api/method/upload_file`).
- **≤ 450 LOC per Linear (COM-*) issue** — split the issue if larger (add a Linear sub-issue under the same milestone). **One issue = one PR linking its issue; tests ship with the code; QA gate green before merge.** Pure renames (`git mv`) reviewed as rename-only diffs are exempt from the cap.
- **Append a dated entry to `memory.md`** at the repo root at the end of **every issue AND every milestone** — what you built, decisions made, anything surprising. Not optional.

---

## 3. ★ THE PER-ISSUE DEFINITION OF DONE (hard, numbered, NON-SKIPPABLE loop)

**This is the single most important section. EVERY COM issue is closed out by ALL of these steps, in order. There is no "implement and move on" — an issue is not done until it is marked Done in Linear AND merged/committed to the deploy branch AND logged in `memory.md`.** Do not batch the close-out; do not skip steps (e), (f), (g).

For each issue `COM-XX`:

**(a) Mark the issue In Progress in Linear.** First load the Linear MCP schema (deferred), then transition:
```
ToolSearch query "select:mcp__5aacd2ff-9725-47a1-a0b3-77e4eae9ed20__save_issue,mcp__5aacd2ff-9725-47a1-a0b3-77e4eae9ed20__get_issue"
mcp__5aacd2ff-9725-47a1-a0b3-77e4eae9ed20__save_issue({ id: "COM-XX", state: "In Progress" })
   // unambiguous form: state: "4a7e54ac-2c8d-4932-b46a-5f83685d2c1b"
```

**(b) Create/checkout the issue branch.** Use Linear's suggested branch name (e.g. `robinandre/com-XX-<slug>`) when running **FLOW-B** (per-issue PR into `main`). When running **FLOW-A** (the current default — see §4), commit directly onto the production branch `claude/frosty-pasteur-8cf1db`. Confirm the choice with Robin at kickoff (§4); do not pick autonomously.

**(c) Implement — ≤450 LOC, presentation-only, engine untouched.** Read the matching part of `reference/advisor-comp-studio.tsx` for any copy/behaviour parity. Use the **`frappe-ui` Skill** for component selection/tokens/patterns. No engine logic, no data layer, no new backend surface. If the change exceeds 450 LOC, **split the issue** (add a Linear sub-issue under the same milestone) rather than landing an oversized PR.

**(d) Run the FULL QA gate — must be green before close-out:**
1. **`vp check`** clean (lint + format + typecheck). Typecheck **must be scoped to `scaffold/src/**`** — `vue-tsc` over the whole graph throws hundreds of false errors from frappe-ui's raw `~icons/*` source (resolved only by its Vite plugin). The real type gate is `scaffold/src` only.
2. **`npm run build`** (= `vite build` → `scaffold/dist`) succeeds.
3. **Engine 22/22** — `node engine.test.mjs` from `scaffold/` (or `node engine/engine.test.mjs` from repo root). Keep BOTH copies green.
4. **VISUAL pass via `vite preview` + the preview MCP** (dev server is killed in this harness — sandbox blocks port-bind; **preview stays up**). Loop:
   ```
   npm run build                                  # preview serves built dist — un-built changes won't show
   # launch config "comp-studio" (preview, port 4173, --strictPort)
   preview_eval('location.reload()')              # pick up fresh dist
   preview_screenshot                              # capture affected route(s)
   preview_click('a[href="/board"]')             # walk routes: /overview /advisors /board /compare /proposition /configure
   preview_eval(...)                               # inspect DOM/computed styles/values
   ```
   Compare the affected route(s) to the reference and the live app. **A black screenshot of a tall/scrolled page is a CAPTURE ARTIFACT, not a bug** — confirm the real DOM/values via `preview_eval` before concluding anything regressed. For contrast/a11y issues, verify the *computed* color/contrast via `preview_eval`, not just the screenshot.

**(e) Mark the issue Done in Linear.** Exact call:
```
mcp__5aacd2ff-9725-47a1-a0b3-77e4eae9ed20__save_issue({ id: "COM-XX", state: "Done" })
   // unambiguous form: state: "03cc9c60-ac0e-42b7-8e33-6b1964f57816"
```

**(f) Ship it — PR + merge, OR direct commit to the deploy branch.** Git commit/push and `gh`/github-MCP calls **require `dangerouslyDisableSandbox: true`** here (auth/ssh-agent + `~/.config/gh` are sandbox-denied; any commit that stages/crosses `engine/engine.ts` also needs it). Conventional commit (`fix:` / `feat:`), message footer ends with the Co-Authored-By line.
  - **FLOW-A (default today):** commit straight onto `claude/frosty-pasteur-8cf1db` and push — **this redeploys PRODUCTION** (gate strictly on build + 22/22 first). Then verify https://comp-studio-one.vercel.app/ after the redeploy.
    ```
    git -C <repo> add -A
    git -C <repo> commit -m "fix(COM-XX): <subject>" -m "<why>" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
    git -C <repo> push origin claude/frosty-pasteur-8cf1db
    ```
  - **FLOW-B (after COM-36 setup):** open a PR whose body contains the closing keyword **`Fixes COM-XX`**, then merge to `main`:
    ```
    gh pr create --repo nordnes/comp-studio --base main --head <branch> \
      --title "fix(COM-XX): <subject>" \
      --body $'Fixes COM-XX\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)'
    gh pr merge --repo nordnes/comp-studio --squash --delete-branch <pr-number>
    ```
  - The branch name `claude/frosty-pasteur-8cf1db` does **not** match the `COM-*` convention, so Linear will **not** auto-link/auto-close from the branch — rely on the `Fixes COM-XX` PR keyword (FLOW-B) or the manual `save_issue` → Done in step (e) (both flows).

**(g) Append the `memory.md` note** — what shipped, any decision made, anything surprising (build gotchas, parity mismatches, contrast values), and the next issue. Commit `memory.md` with the issue (or as its own `docs(memory):` commit). **Note the dirty tree** (see §7): `.gitignore` and `memory.md` already carry uncommitted edits — fold them deliberately, don't bundle unrelated changes into a COM-XX commit.

> **You may not read this loop and skip the "mark Done + PR/merge" step.** An issue with code merged but not marked Done, or marked Done but not merged, is **not** closed out. Steps (e) and (f) are mandatory for every single issue.

---

## 4. Branch & deploy strategy (resolve the prod-branch tension at kickoff)

**The tension:** Vercel's **production branch is the feature branch** `claude/frosty-pasteur-8cf1db` (it is also the GitHub default branch). `main` exists **only locally**, is **16 commits behind** the feature branch, and is **NOT on origin**. So **every push to `claude/frosty-pasteur-8cf1db` redeploys the LIVE production tool** — there is no preview-only safety net on that branch today.

- **FLOW-A (immediate-ship) — the working default.** Commit/push each fix onto `claude/frosty-pasteur-8cf1db`; each push goes live. This matches today's actual pipeline. It trades away Robin's standard one-PR-per-issue hygiene, so **gate strictly** (build + engine 22/22 + visual) before every push.
- **FLOW-B (hygiene) — strongly recommended: do COM-36 early.** Restore "one PR per issue into `main`, keep `main` green":
  1. `git push -u origin main` (main is not on origin yet — and must first be fast-forwarded/reset to the feature tip, since it is 16 commits behind).
  2. `gh repo edit nordnes/comp-studio --default-branch main`.
  3. **Repoint Vercel's production branch** from `claude/frosty-pasteur-8cf1db` → `main` (Vercel dashboard or CLI).
  After that, the per-issue loop targets `main` via PRs (FLOW-B in §3(f)).

**Flag this as the ONE thing to confirm with Robin at kickoff.** A naive "PR into main + merge" **without** the COM-36 setup will fail/no-op AND won't ship — `main` isn't on origin, isn't the GitHub default, and Vercel prod still points at the feature branch. Honor "(or direct commit)": if Robin says stay on FLOW-A, direct-commit to the deploy branch per issue. Either way, COM-36 itself is on the M6 board (Backlog) and is Robin's call.

---

## 5. Recommended sequence

Work strictly by priority, headline-first:

1. **COM-37 + COM-38 FIRST** — the two token contrast sweeps. Biggest a11y win for the least code; **ships M7's headline** and clears the bulk of the audit's dominant finding (131 `ink-gray-5` + 37 `ink-amber-3` usages, both token-driven). Do these as a tight theme sweep before anything else.
2. **Rest of M7 (COM-39 … COM-45)** — the a11y + user-control floor: chart-axis text color, FormControl labels, focus rings + keyboard-operable rows, touch targets, confirm + Undo on destructive deletes, chart text alternatives, Import/Copy/Paste feedback. **Gate M7** (milestone gate, §6 below) before starting M8.
3. **COM-46 next** — the **single persistent global scenario toggle**. Flagged the **top product lever**: every view should speak the same scenario case.
4. **frappe-ui adoption cluster** — COM-53 (Toasts) · COM-54 (Alert) · COM-55 (TabButtons) · COM-52 (Tooltips) · COM-68 (Divider/Avatar/Combobox + text-scale fixes). Raises the 5/10 component-adoption score.
5. **Chart-legibility cluster** — COM-48 · COM-49 · COM-50 · COM-51 · COM-56 · COM-57 (and COM-47, COM-58 decision aids).
6. **COM-62 — the approved left-sidebar app shell** (structural; resolves `CLAUDE.md` §5). Do it before the IA polish that folds into it; **split into 3 ≤450-LOC PRs** (shell scaffold + sidebar → migrate the 6 views off `PageHeader` onto the teleported header → board-switcher + Internal/Share grouping). It **absorbs COM-67** and the board-switcher half of **COM-63**.
7. **P3 polish last** — COM-60 · COM-63 (now just the ⌘-K palette) · COM-64 · COM-65 · COM-66, plus COM-61 (progressive disclosure).

> **COM-62 (canonical frappe-ui left-sidebar app shell, replacing the 6 top-tabs) is APPROVED (Robin, 2026-06-08) — build it.** It resolves the open IA decision in `CLAUDE.md` §5. Sequence it **after the M7 a11y floor** (it's structural — do it ahead of the smaller IA polish). It now **absorbs COM-67** (Internal/Share grouping → the sidebar's two sections) **and the board-switcher half of COM-63** (→ sidebar header). **Effort L → split into 3 ≤450-LOC PRs:** (1) shell scaffold + sidebar, (2) migrate the 6 views off `PageHeader` onto the teleported app-header, (3) fold in the board-switcher + Internal/Share grouping. After it lands, COM-63 reduces to just the ⌘-K palette and COM-67 closes as done-here.

---

## 6. The full M7/M8 backlog

**Milestone gate (between M7 and M8, and at the end of each):** `npm run build` + engine **22/22** green → visual smoke of every affected route via `vite preview` + preview MCP → (FLOW-B) confirm the live/`main` deploy is green. **Do NOT start M8 until M7 is shipped and green.** Append the milestone outcome to `memory.md`.

Linear: **COM** project · team UUID `95768650-2441-48e9-acd4-2ff02c2ff2cf` · states **Done** `03cc9c60-ac0e-42b7-8e33-6b1964f57816`, **In Progress** `4a7e54ac-2c8d-4932-b46a-5f83685d2c1b`. All 32 issues are currently in **Backlog** — re-confirm status before bulk-transitioning in case another session moved them.

### M7 · Accessibility & user-control floor — milestone id `2600ca12-705a-4a3d-bb09-cfeb3dd29566` · target 2026-06-30 · 9 issues (1 P0 / 7 P1 / 1 P3)

| ID | Pri | Effort | Scope |
|----|-----|--------|-------|
| **COM-37** | **P0** | M | Promote default label/caption color `ink-gray-5` (#7C7C7C, 4.17:1) → `ink-gray-6` — theme sweep across all 17 files (131 usages); fixes AA app-wide. `[design-debt, ui, a11y]` |
| **COM-38** | P1 | M | Darken accent-label amber on amber panels (`ink-amber-3` → `4`/`gray-9`; 2.93:1 fails AA) — 37 usages on `surface-amber-2` eyebrows. `[design-debt, ui, a11y]` |
| **COM-39** | P1 | S | Stop using `ink-gray-4` (#999999, 2.85:1) for chart axis labels / `$M` qualifiers / ContextStrip separators. `[charts-dataviz, a11y]` |
| **COM-40** | P1 | L | Add programmatic labels to 15+ bare inputs via frappe-ui `FormControl`. `[forms, a11y, design-system]` |
| **COM-41** | P1 | M | Add visible focus rings to hand-rolled buttons/inputs + make clickable table rows keyboard-operable. `[ux, a11y]` |
| **COM-42** | P1 | M | Raise icon-only/inline touch targets to ≥32–44px (fix 14px bare trash buttons first). `[mobile, a11y]` |
| **COM-43** | P1 | M | Add confirm + Undo to destructive deletes and Reset-to-baseline. `[ux, a11y]` |
| **COM-44** | P1 | M | Add text alternatives (`role=img` + `aria-label`) to screen-reader-silent charts. `[charts-dataviz, a11y, design-system]` |
| **COM-45** | P3 | M | Give Import/Copy/Paste explicit success+failure feedback with counts; validate imported JSON at the boundary. `[empty-loading, forms, ux]` |

### M8 · UX/UI uplift — frappe-ui, charts, IA, decision aids — milestone id `d67cd073-4387-4122-ae85-0f526386c2b4` · target 2026-07-31 · 23 issues (1 P1 / 15 P2 / 7 P3)

| ID | Pri | Effort | Scope |
|----|-----|--------|-------|
| **COM-46** | P1 | M | Add a single persistent **global scenario toggle** so every view speaks the same case. **[top product lever]** `[ia-nav, ux]` |
| **COM-47** | P2 | M | Interactive exit-valuation slider on advisor & proposition hero (Ledgy pattern). `[charts-dataviz, ux]` |
| **COM-48** | P2 | M | Fix scatter overlap/label collision + add y-gridlines/ticks (Board `PotentialScatter`). `[charts-dataviz, a11y]` |
| **COM-49** | P2 | S | Raise SVG chart/label text floor 8–9px → ~11px; `ink-gray-7` for value labels. `[charts-dataviz, a11y]` |
| **COM-50** | P2 | S | Replace the invisible `#E7C99B` median benchmark series with a distinguishable mid-weight hue. `[charts-dataviz, ui]` |
| **COM-51** | P2 | M | Add a redundant (non-color) channel to tier/category/series encodings for color-blind & print safety. `[charts-dataviz, a11y]` |
| **COM-52** | P2 | M | Add term-level `Tooltip`s to load-bearing finance jargon. `[copy, ux, design-system]` |
| **COM-53** | P2 | S | Replace the ephemeral status-flash span with frappe-ui `Toast`s. `[copy, ux, design-system]` |
| **COM-54** | P2 | S | Replace hand-built storage/budget banners with frappe-ui `Alert`. `[ui, design-system]` |
| **COM-55** | P2 | S | Convert hand-rolled Button-array segmented toggles to frappe-ui `TabButtons`. `[ux, design-system]` |
| **COM-56** | P2 | M | Centralize the hardcoded chart/category palette + slider accent as semantic tokens — **move `SCEN_COLORS` OUT of `engine.ts`** (`scaffold/src/engine.ts:59` → `constants.ts`; re-point the `Compare.vue` import). `[theming, design-debt, charts-dataviz]` |
| **COM-57** | P2 | M | Add breakeven/underwater shading + a labelled breakeven line to `UpsideCurve`. `[charts-dataviz, ux]` |
| **COM-58** | P2 | S | Add scannability aids to the Compare matrix & Board roster: hover row-ruler, delta-vs-base, sticky header. `[charts-dataviz, ux]` |
| **COM-59** | P2 | S | Add a per-recipient, print-visible confidentiality/draft running mark to Proposition & Board pack. `[copy, ui]` |
| **COM-61** | P2 | L | Add progressive disclosure to the Advisors Profile and the Configure long-scroll. `[ia-nav, forms, ux]` |
| **COM-60** | P3 | S | Add a chart-mount placeholder/overlay to eliminate the 1-frame flash on client-side nav. `[empty-loading, charts-dataviz, design-system]` |
| **COM-62** | **P2** | L | Adopt the canonical frappe-ui left-sidebar app shell + teleported page-header (replace the 6 top-tabs). **[APPROVED 2026-06-08 — build it after M7; absorbs COM-67 + COM-63 board-switcher; split into 3 ≤450-LOC PRs]** `[ia-nav, ux, design-system]` |
| **COM-63** | P3 | M | Surface the loaded board as a breadcrumb board-switcher + add a ⌘-K command palette. `[ia-nav, ux, design-system]` |
| **COM-64** | P3 | S | Differentiate the Proposition metric band from dashboard bands (editorial "offer" vs "tool"). `[ui]` |
| **COM-65** | P3 | S | Replace the hourglass-emoji status signifier with a system glyph or text chip. `[copy, ui, a11y]` |
| **COM-66** | P3 | S | Tidy the header More menu (isolate destructive Reset; surface a labeled Share path). `[copy, ia-nav, ux]` |
| **COM-67** | P3 | S | Group nav by internal-vs-shareable lens and label the boundary. `[copy, ia-nav, ui]` |
| **COM-68** | P3 | S | Adopt frappe-ui `Divider`/`Avatar`/`Combobox` and fix `text-*`/`text-p-*` scale inversions. `[ui, design-system]` |

**Relations (from the audit):** COM-37 & COM-51 → COM-21 (a11y/colour-blind umbrella); COM-42 & COM-59 → COM-31 (mobile/print); COM-47 & COM-57 → COM-28 (upside curve); COM-49 → COM-17 (waterfall). COM-21 and COM-31 are now decomposed — Robin may close them as umbrellas.

---

## 7. Commands & environment quick-reference

**Local dev (Vite+ `vp` — LOCAL ONLY, alpha; NEVER a build/deploy dependency):**
```
vp check        # lint + format + typecheck (scope typecheck to scaffold/src/**)
vp build        # build
vp test         # engine tests
vp preview      # preview
# vp dev is killed here (sandbox blocks port-bind) — use vite preview for visual QA
```

**CI/Vercel scripts (committed package.json stays plain vite/node):**
```
npm run build              # = vite build -> scaffold/dist
npm run test               # = node engine.test.mjs (run from scaffold/)
npm run preview -- --port 4173 --strictPort
```

**Engine gate (must stay 22/22; keep BOTH copies green):**
```
node engine.test.mjs              # from scaffold/
node engine/engine.test.mjs       # from repo root
```

**Install (sandbox denies npm's global cache):**
```
npm install --cache "$TMPDIR/npm-cache" --prefix scaffold    # capture $? before any pipe; | tail masks npm's exit code
```

**Visual QA via preview MCP** (launch config name **`comp-studio`** = preview/4173; `comp-studio-dev` = dev/5173, unusable here):
```
npm run build
preview_eval('location.reload()')
preview_screenshot                 # black tall-page image = capture artifact; verify via preview_eval
preview_click('a[href="/configure"]')   # routes: /overview /advisors /board /compare /proposition /configure
```

**Git / GitHub / Linear close-out:**
```
# Commits/push + gh + github-MCP REQUIRE dangerouslyDisableSandbox: true (auth/ssh + ~/.config/gh denied;
# also any commit staging/crossing engine/engine.ts).
# Commit footer MUST end with:  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>

# Linear (load schema first — tools are deferred):
ToolSearch query "select:mcp__5aacd2ff-9725-47a1-a0b3-77e4eae9ed20__save_issue,mcp__5aacd2ff-9725-47a1-a0b3-77e4eae9ed20__get_issue"
save_issue({ id: "COM-XX", state: "In Progress" })   # or state: "4a7e54ac-2c8d-4932-b46a-5f83685d2c1b"
save_issue({ id: "COM-XX", state: "Done" })          # or state: "03cc9c60-ac0e-42b7-8e33-6b1964f57816"
# re-pull backlog if needed (auto-spilled ~100KB file; parse {issues:[...]} with jq '.issues[]'):
list_issues({ project: "82eba0c2-2a11-4e9d-b822-b9efce3bb2a1", limit: 250 })
```

**Repo state at kickoff:** branch `claude/frosty-pasteur-8cf1db` (= prod deploy branch); **dirty tree** — `.gitignore` (+`.env*`) and `memory.md` (audit appends) are modified & unstaged. `main` is local-only, 16 behind, not on origin. Account for the two dirty files before the first commit so unrelated doc/ignore edits aren't swept into a COM-XX PR. (Ignore the recurring git `fsmonitor_ipc__send_query` noise line.) `engine/engine.ts` is sandbox read-denied (owner root, mode 0).

---

## 8. Blocks & open decisions

- **COM-62 (left-sidebar app shell)** — **RESOLVED: APPROVED by Robin 2026-06-08 — build it** (it settles the open IA decision in `CLAUDE.md` §5). Now P2; sequence after the M7 a11y floor; split into 3 ≤450-LOC PRs; it absorbs COM-67 and the board-switcher half of COM-63.
- **FLOW-A vs FLOW-B prod-branch choice (§4)** — confirm with Robin at kickoff. Default to FLOW-A (each push redeploys prod) unless Robin green-lights COM-36 (push `main` → origin, flip GitHub default, repoint Vercel prod branch). COM-36 sits on M6 (Backlog).
- **M6 · Auth, persistence & hardening** (out of scope for M7/M8 but tracked): **COM-33** (enable Vercel Deployment Protection — the live URL is still PUBLIC; Todo/Urgent), **COM-34** (per-user login), **COM-35** (Neon Postgres persistence). **Neon is now PROVISIONED** (verified 2026-06-08 — DB + Neon Auth env vars present on Production/Preview/Development: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `POSTGRES_URL*`, `PG*`, `VITE_NEON_AUTH_URL`, `NEON_AUTH_BASE_URL`, `NEON_PROJECT_ID`). Remaining human input before the auth gate is wired: **allow-list emails** + enabling **Deployment Protection** (COM-33). Do **not** start M6 work in this run — it is a different milestone. If a UX/UI issue you touch is affected by the (future) auth gate, note it in `memory.md` and proceed presentation-only.
- **Do NOT invent answers to any open decision** — surface it to Robin, get the call, record the resolution in `memory.md`.

---

## 9. Kickoff

**Begin with COM-37: mark it In Progress in Linear, (FLOW-A) work on `claude/frosty-pasteur-8cf1db` or (FLOW-B, if Robin green-lit COM-36) branch from `main`, implement the `ink-gray-5` → `ink-gray-6` theme sweep across all 17 view/component files (131 usages), run the full QA gate green (`vp check` scoped to `scaffold/src` → `npm run build` → engine 22/22 → visual pass via `vite preview` + preview MCP, verifying the computed contrast), mark COM-37 Done in Linear, PR+merge (or direct-commit) to the deploy branch with a `fix(COM-37):` conventional commit, append the `memory.md` note — then immediately do COM-38 (the amber-on-amber sweep) the same way, finish M7, gate M7, then proceed into M8 starting at COM-46.** Confirm the FLOW-A/FLOW-B branch choice with Robin at kickoff before it becomes blocking (COM-62 is already approved — build it after M7).