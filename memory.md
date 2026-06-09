# memory.md — Advisor Comp Studio running log

> Durable, cross-session memory for agents working this repo. **Append a dated entry at the end of each
> issue/milestone** (what you built, decisions, surprises, next step). Newest at the bottom. Keep it honest
> and concise — this is what the next session reads to get oriented. Standing rules live in `CLAUDE.md`.

---

## 2026-06-08 — Phase 0 (plan hardening) + frappe-ui adoption decision

**State: pre-implementation. Scaffold wired + build-green; no feature views built yet.**

- **Research/hardening done.** Empirically verified the stack in a throwaway sandbox; evidence in
  `research/FINDINGS.md` (+ lane files `A`–`D`, `EMPIRICAL.md`, screenshots). Engine is frozen + **22/22**.
- **Decision (Robin, post-gate): ADOPT `frappe-ui` as-is (Espresso/Inter)** for clean, consistent UI/UX via
  Frappe UI templates. This overrides the Phase-0 recommendation to hand-roll (FINDINGS D2/D3 → see D17/D18).
- **Scaffold re-wired for frappe-ui and verified:** `frappe-ui@0.1.278` + `frappe-charts@1.6.2` installed;
  `vite.config.ts` uses `frappeui({frappeProxy:false,jinjaBootData:false,buildConfig:false})` + `vue()` +
  `optimizeDeps:{include:['feather-icons']}`; ESM `tailwind.config.js` with the `frappe-ui/tailwind` preset
  (stale `tailwind.config.cjs` removed); `main.ts` imports `frappe-ui/style.css` and does **NOT**
  `app.use(FrappeUI)`; `style.css` de-duped (no double `@tailwind`). `npm run build` ✓ green; engine 22/22.
- **Charts decision (unchanged):** `frappe-charts` (corrected bare import, no css) + custom SVG for
  waterfall/scatter/football/vesting/DilutionPath. `frappe-charts` scatter is **not implemented** in 1.6.2.
- **Open product decisions (unresolved — for Robin / first implementer):** see `CLAUDE.md` "Open product
  decisions" / `research/FINDINGS.md` §9 — named multi-board `Mgr` ([COM-32]) port-vs-descope, localStorage
  schema, share mechanism, staircase bar-vs-step, section numbering.

**Next step:** start **M0** per `ULTRACODE_PROMPT.md` — COM-8 (verify the wired scaffold green) → COM-10
(engine + spec) → COM-11 (store: reducer parity + delete cascades + persistence/share) → COM-9 (first Vercel
preview). Then M1 (Configure) onward. Build views with frappe-ui components + the `frappe-ui` Skill.

<!-- Append new entries below this line -->

## 2026-06-08 — M0 boot verified + 5 open decisions RESOLVED (Robin)

**M0 COM-8/COM-10 green.** Clean `npm install` (321 pkgs) + `npm run build` ✓ (`dist/`: Inter woff2,
frappe-ui CSS 158 kB, JS 109 kB / 42 kB gz) + engine **22/22** (both `scaffold/engine.test.mjs` and
`engine/engine.test.mjs`). Views are still hand-rolled hex (not yet frappe-ui) — that's the build work.

- **Build gotcha (recorded):** the sandbox denies writes to npm's global cache `~/.npm/_cacache` (only
  `~/.npm/_logs` is allowlisted) → `npm install` dies with `EPERM`. **Fix: `npm install --cache "$TMPDIR/npm-cache"`**
  (stays sandboxed). Also `--prefix scaffold` works for *location*, but a piped `| tail` masks npm's real
  exit code — capture `$?` before piping. Build runs fine: `npm run build --prefix scaffold`.

**Robin's calls on the 5 open decisions (was blocking COM-11):**
1. **Named multi-board `Mgr` → PORT IN FULL** (not descoped). localStorage schema is the reference's
   `{scenarios:{name:State}, last:name}` map under `raiku-advisor-comp-v5`. COM-11 migrates old raw-`State`
   payloads (and `#s=` raw State) into the map shape so `reconcile` never crashes.
2. **Share = clipboard Copy/Paste + `#s=` URL hash (BOTH).**
3. **Valuation staircase = frappe-charts grouped bar** (Raiku vs Median), not custom step-SVG.
4. **Section numbering = frappe-ui best practice / templates** → frappe-ui page-header conventions
   (sentence case, quiet section label by size/weight/colour — NOT uppercase roman-numeral eyebrows),
   nav-consistent ordering (Overview … Configure). Fixes the reference's duplicate "Section I".

**frappe-ui skill loaded** — using COMPONENTS/TOKENS/PATTERNS (Button/Badge/FormControl/Select/Switch/
Dialog/Dropdown/Tooltip/Alert/Tabs, semantic tokens `bg-surface-*`/`text-ink-*`/`border-outline-*`, lucide
CSS-class icons, page-header + body-container patterns). **Ignoring** its SETUP backend wiring
(`app.use(FrappeUI)`, data layer, `optimizeDeps.exclude`) per the build-kit's verified backendless recipe.

**Store deviation (intentional):** working board **auto-persists** into `saved[S.name]` on every mutation
(safer than the reference's explicit-Save-only model); Mgr "Save as" forks a named snapshot. Superset of
reference behaviour.

**Next:** COM-11 store (this turn) → frappe-ui app shell (App.vue) → COM-9 first Vercel preview to gate M0.

## 2026-06-08 — M0 store+shell+Overview built green; DEPLOY PIPELINE GAP found

- **Built & build-green:** `store.ts` (COM-11, full parity), `App.vue` shell, `Overview.vue` on frappe-ui,
  shared `PageHeader.vue` + `PoolAllocation.vue`. Commits `39b97d3`, `ff50175`. `npm run build` ✓.
- **frappe-ui API gotchas (recorded):** `Alert` has NO default slot and themes are `yellow|blue|red|green`
  (NOT orange) → header banners are token `<div>`s, not `<Alert>`. `Badge` DOES support `theme="orange"`
  (amber). `Dialog` uses `:options="{title,size}"` + `#body-content` slot (not `title` prop). `FrappeUIProvider`
  is just `ToastProvider` (socket-safe) — mounted with `<Dialogs/>` for `confirmDialog`/`toast`.
- **Local dev server can't run here:** the sandbox blocks port-bind → `vite dev` exits; `curl`/preview MCP
  blocked. **Visual passes must go via a deployed URL.** Build (`npm run build`) is the local correctness gate.
- **⚠️ DEPLOY BLOCKER (needs Robin):** there is **NO Vercel project for `nordnes/comp-studio`** (checked both
  Raiku Labs + Nordnes Personal teams). The `raiku-advisor` Vercel project is a **different** app
  (repo `nordnes/raiku-advisor`, a Next.js/Turborepo monorepo). The `deploy_to_vercel` connector only prints
  instructions (run `vercel deploy` — CLI not installed — or push to a git-integrated repo). **To deploy,
  Robin must create a Vercel project linked to `nordnes/comp-studio` with Root Directory = `scaffold`,
  framework Vite, build `npm run build`, output `dist`** (SPA rewrite already in `scaffold/vercel.json`).
  Building continues regardless; deploy is the final gate.
- **Decision:** `NumIn` and `DField` consolidated into ONE theme-aware `NumIn.vue` (semantic tokens flip under
  `[data-theme=dark]`), used in both light Advisors and the dark Configure panel.

## 2026-06-08 — ALL 6 VIEWS BUILT on frappe-ui; build-green; pushed. Deploy + visual QA pend Robin.

**Status: feature-complete across all 6 routes; `npm run build` ✓; engine 22/22; pushed to GitHub.**
Commits `39b97d3`→`<m5>` on branch `claude/frosty-pasteur-8cf1db` (pushed to origin). Views:
- **Overview** (KPI band, roster, PoolAllocation, benchmark+source, alerts incl. /confirm/ regex, empty state)
- **Advisors** (profile/base-tier/performance controls, objectives tri-state, PotentialStrip, GrowthWaterfall
  [SVG], UpsideCurve [FC area+line], detail expander: VestingTimeline [SVG], FootballField, MixBreakdown,
  DilutionPath, Instruments+HMRC SAV)
- **Board** (table, per-advisor ranges, PoolAllocation, company cost, ValuationStaircase [FC grouped bar],
  PotentialScatter [SVG])
- **Compare** (matrix + FC grouped bar, SCEN_COLORS)
- **Proposition** (print doc + propText clipboard + full legal corpus verbatim)
- **Configure** (dark [data-theme=dark] panel; all structural lists via store cascade actions)
Shared: PageHeader, PoolAllocation, ContextStrip, StageBadge, AdvisorPicker, FootballField, NumIn, +chart kit.
Store: full reducer parity + cascades + Mgr {scenarios,last} + clipboard/URL/JSON/CSV. App shell: header
(Saved/Mgr dialog + actions dropdown), token nav, banners, footer, FrappeUIProvider+Dialogs. Print CSS done.

**KNOWN SIMPLIFICATIONS (vs reference — for a later pass):** UpsideCurve omits the interactive ChipRow
presets / gross-toggle / breakeven-shading / per-scenario+selected reference markers (shows the two curves +
captions). GrowthWaterfall omits hover-sync with the objectives list. Staircase rebuilds (not smooth-updates)
when showBenchmarks toggles dataset count. confirmDialog not used for structural deletes (immediate = ref parity).

**⚠️ NOT YET DONE — both need Robin / the Vercel project:**
1. **Visual QA:** could NOT render locally — this environment blocks port-bind for `vite dev` (sandbox-on dies;
   sandbox-off also unstable; `curl`/preview-MCP blocked). Build is the only local gate. **Every view is
   UNVERIFIED visually.** First real screenshots must come from the Vercel deploy.
2. **Deploy / live URL:** **no Vercel project exists for `nordnes/comp-studio`.** Robin must create one:
   Vercel → Add New → Import `nordnes/comp-studio` → **Root Directory `scaffold`**, Framework **Vite**,
   Build `npm run build`, Output `dist` (SPA rewrite already in `scaffold/vercel.json`). Then it auto-deploys
   from the pushed branch / `main`. (Can't be done headlessly: no Vercel CLI/token; MCP has no create-project.)

**Next session:** once the Vercel project exists → deploy preview → screenshot all 6 routes → fix visual/
layout drift, dark-mode + colour-blind/a11y pass (COM-21), mobile pass (COM-31) → restore the UpsideCurve/
waterfall interactivity → production deploy (COM-22) + report URL.

## 2026-06-08 — Blind polish round (Robin: "keep polishing without a deploy")

Did everything verifiable without rendering (build + reasoning + typecheck). Commits through `38ed535`, pushed.
- **COM-16 chart contract:** FrappeChart now passes a plain JSON snapshot to Chart/update (reactive proxies
  don't update) + guards undefined return.
- **NumIn:** edits undefined fields from 0 (no "NaN"/"undefined" in the input box).
- **a11y:** nav `aria-current=page`.
- **store:** `board`/`selected` hoisted to shared singletons (no per-component recompute).
- **Compare:** guarded `.find().total` (defensive).
- **TYPECHECK (vue-tsc) — important gotcha + a REAL bug:** `vue-tsc` over the whole graph is NOT a usable
  gate — frappe-ui ships raw TS/Vue source whose `~icons/*` virtual imports + internal types throw hundreds
  of errors (resolved only by its Vite plugin). **Gate stays `vite build`.** Filter to `scaffold/src/**` for
  a real check. Doing so caught a **functional bug: the Mgr Dialog used `v-model:open` but this frappe-ui
  version's v-model is `modelValue` → the Saved-boards dialog never opened.** Fixed to `v-model`. Also typed
  `routes: RouteRecordRaw[]`. **After fixes, scaffold/src is type-clean.** THIRD-PARTY-NOTICES verified accurate.
- **Reached the limit of verifiable blind polish.** Remaining (visual fidelity, UpsideCurve interactivity,
  waterfall hover-sync, colour-blind/mobile/print verification) all need the deployed app to see — gated on
  the Vercel project.

## 2026-06-08 — VISUAL QA DONE via desktop static-preview. All 6 routes verified. Chart fixes.

- **HOW (the unlock):** `vite dev` is killed by the harness here, but **`vite preview` (static, serves built
  dist) STAYS UP** under the Claude Code desktop preview MCP. `.claude/launch.json` now has `comp-studio`
  (preview, port 4173) + `comp-studio-dev` (dev, 5173). Workflow: `npm run build` → `preview_eval(location.reload())`
  → `preview_screenshot` / `preview_click(a[href=…])` to walk routes → `preview_eval` to inspect DOM. Screenshots
  of tall scrolled pages can come back all-black (a CAPTURE artifact, NOT a real bug — verify with `preview_eval`
  reading computed bg / element presence; reload + screenshot near top renders clean).
- **VERIFIED all 6 routes render + numbers reconcile:** Overview (KPI band, roster, pool, benchmark — board
  base **$23.0M**, base path → **TGE FDV $600M** ✓), Advisors (controls + waterfall SVG + UpsideCurve +
  PotentialStrip $7.67M→$13.0M; detail expander vesting/football/mix/dilution/instruments all present),
  Board (staircase grouped bar + scatter SVG), Compare (matrix board row $23.0M + grouped bar), Proposition
  (editorial hero), **Configure dark panel** (data-theme=dark tokens flip correctly).
- **Bugs found + fixed via the preview:**
  1. **frappe-charts first paint** — with `animate:false` it paints a degenerate 0–5 axis / 0-height bars
     until a redraw. Fix: `FrappeChart` builds synchronously then forces a next-frame `draw(true)`. (My earlier
     double-rAF deferred-build made it worse — reverted.)
  2. **No y-axis tick formatter in frappe-charts** → raw-dollar axes read "100000000". Fix: plot staircase /
     compare-bar / upside in **$M** (values /1e6, tooltip `*1e6`, "$M" axis label).
  3. (earlier) Mgr Dialog `v-model:open` → `v-model` (would never have opened).
- **Static preview is the visual-QA path going forward** (no Vercel needed to SEE it locally). Deploy/live URL
  still needs the Vercel project (unchanged).

## 2026-06-08 — 🚀 SHIPPED. Live in production on Vercel, verified.

- **LIVE: https://comp-studio-one.vercel.app/** (deployment `comp-studio-2k82jxx60`, status Ready, public).
  Dashboard: https://vercel.com/nordnes-personal/comp-studio
- **Vercel project (Robin created):** team **Nordnes Personal**, name `comp-studio`, **Root Directory =
  `scaffold`**, preset Vite, build `npm run build`, output `dist`, no env vars. Deployed from branch
  `claude/frosty-pasteur-8cf1db` @ `8b2e286`. **Vercel set the production branch to that feature branch**
  — pushing to `claude/frosty-pasteur-8cf1db` redeploys PROD. (Follow-up: PR/merge to `main` + point Vercel's
  production branch at `main` for hygiene — Robin's call; one big continuous-build PR vs slicing.)
- **Vercel CLI:** installed (`vercel` 54.10.1 at `~/.vite-plus/bin/vercel`), authed as **robin-1211** (existing
  CLI login). Default scope `raiku-labs`; new project is under `nordnes-personal` → use `--scope nordnes-personal`.
- **PRODUCTION VERIFIED (live, Chrome):** Overview, Board (deep-link), Configure (deep-link, dark), Advisors
  (deep-link) all render; **SPA rewrite works for deep links** (vercel.json); all charts paint correctly on
  the production build (staircase $M bars, scatter, waterfall, UpsideCurve area+line); numbers reconcile
  ($23.0M board base, $600M FDV); **zero console errors**. Mobile responsive (375px) verified locally.
- **Acceptance MET:** 6 routes live, Overview default, build green, engine 22/22, net-of-strike + legal corpus
  + benchmark sources present, persistence (localStorage + clipboard + URL hash). Production URL reported.
- **Remaining (minor, optional):** UpsideCurve interactivity (chip presets/markers — simplified), waterfall
  hover-sync, colour-blind/print deep-verification. None block the live tool.

## 2026-06-08 — Linear synced + M6 (auth/DB) build started, blocked on Robin

**Linear (COM):** 28 issues → Done (all M0–M4 leaves + epics COM-1/2/3/4/6 + COM-22 deploy). COM-5/COM-7 →
In Progress (own the open polish COM-21/28/31, still Todo). New **M6 · Auth, persistence & hardening** +
issues: **COM-33** (Vercel Deployment Protection — Todo/Urgent), **COM-34** (per-user login), **COM-35**
(Supabase→**Neon** Postgres persistence), **COM-36** (merge to main). Project status update posted.

**Robin's M6 decisions:** DB+login = **Neon** (Vercel Marketplace, "I drive") · **Neon Auth (Stack Auth) via
its API** · **email allow-list + magic link** · **one shared council workspace**.

**Architecture this implies:** static SPA → SPA **+ Vercel serverless functions** (`scaffold/api/*`, hold the
Neon connection string server-side + verify the Stack Auth session + enforce the email allow-list) → Neon
Postgres. Shared `boards` table (State as JSONB). Note: Stack Auth is React-first; Vue integration is via its
REST API + token verify in the functions.

**Provisioning progress (CLI, authed robin-1211):** linked `comp-studio` → `.vercel/project.json`
(`prj_0UlU7VjepJ2WANYkZcmuYa40CR5w`, org `team_suZ2KN68qyboZLR89WBA28gT`). **Key find:**
`vercel integration add neon -m auth=true` provisions **Postgres + Neon Auth together**. First attempt went to
the wrong scope (raiku-labs, CLI default) → 404 connecting to the nordnes-personal project; cleaned that orphan
(`vercel integration-resource remove neon-coquelicot-crystal --disconnect-all --yes --scope raiku-labs`).

**BLOCKED on Robin (2 actions):**
1. **Accept Neon Marketplace terms** (browser): https://vercel.com/nordnes-personal/~/integrations/accept-terms/neon?source=cli
   — then retry: `vercel --scope nordnes-personal integration add neon -m auth=true --name comp-studio-db`.
2. **Allow-list emails** (who may sign in).
Plus interim: **enable Vercel Deployment Protection** (COM-33) — the live URL is still PUBLIC.

**Next (once unblocked):** re-provision (gets DATABASE_URL + Neon Auth env) → `boards` table migration →
Vercel functions (`/api/boards` auth-gated) → Vue magic-link login gate (Stack Auth REST) → store reads/writes
via the functions (localStorage as cache) → set Vercel env → redeploy → verify login + persistence live.

## 2026-06-08 (pm) — UX/UI audit (dynamic workflow + impeccable) → 32-issue backlog on Linear

**What I did:** Pulled latest Neon env vars (`vercel env pull .env.local --yes --scope nordnes-personal` —
names confirmed, secrets never echoed). Ran a **6-agent dynamic Workflow**: 5 parallel audit/research lanes
(impeccable design critique · impeccable technical audit · frappe-ui under-adoption · Frappe-templates/OSS
research · cap-table-domain UX) → 1 synthesis agent → a structured 32-issue backlog. Then created it all on Linear.

**Design health (verdict):** **NOT AI slop** — top ~10% on the slop axis (real Fraunces/Inter hierarchy,
60-30-10 single-amber accent, gap-px hairline grids, genuine empty states, a Proposition that reads designed).
Scores: Nielsen ~31.5/40 (lanes 34 + 29) · frappe-ui adoption ~14/20 (tokens 9/10 excellent, components 5/10) ·
technical a11y 13/20. **Dominant finding:** the two most-repeated colors both fail WCAG AA — `ink-gray-5`
(#7C7C7C, 4.17:1) on every label/caption, and `ink-amber-3` on `surface-amber-2` (2.93:1) on every accent
eyebrow. Both token-driven → **one theme sweep clears the bulk of the a11y backlog.** Every issue is
presentation-only; **engine stays frozen** (note: SCEN_COLORS must move OUT of engine.ts, not be edited there).

**Linear (COM) created:**
- **11 team-scoped labels** (a11y, ux, ui, forms, charts-dataviz, mobile, ia-nav, copy, design-debt,
  empty-loading, theming). Reused the existing **workspace** `design-system` label — a team-scoped dup is
  disallowed when a workspace label of that name exists. Team UUID `95768650-2441-48e9-acd4-2ff02c2ff2cf`.
- **2 milestones:** **M7 · Accessibility & user-control floor** (target 2026-06-30; id `2600ca12…`) and
  **M8 · UX/UI uplift — frappe-ui, charts, IA, decision aids** (target 2026-07-31; id `d67cd073…`).
- **32 issues COM-37 … COM-68.** M7 = COM-37 (P0, ink-gray-5 sweep) … COM-45 (9 issues: the a11y + safety
  floor — contrast, amber-on-amber, ink-gray-4 chart text, FormControl labels, focus rings/keyboard rows,
  touch targets, chart ARIA, confirm+Undo, import validation). M8 = COM-46 (P1, global scenario toggle —
  **top product lever**) … COM-68 (23 issues: charts legibility, frappe-ui Toast/Alert/TabButtons/Tooltip/
  Avatar/Divider/Combobox adoption, palette→tokens, decision aids = exit slider / breakeven shading /
  scannability / per-recipient print confidentiality mark, IA proposals = sidebar shell / board-switcher /
  ⌘K, editorial polish = Proposition band / ⏳-emoji / More-menu / nav-grouping).
- **Relations:** COM-37 & COM-51 → COM-21 (a11y / colour-blind umbrella); COM-42 & COM-59 → COM-31
  (mobile / print); COM-47 & COM-57 → COM-28 (upside curve); COM-49 → COM-17 (waterfall). The vague
  **COM-21** ("colour-blind+a11y+empty") and **COM-31** ("mobile+print") are now decomposed into specific
  sized issues — Robin may close them as umbrellas.

**Priority spread:** 1×P0 · 8×P1 · 14×P2 · 9×P3. **Recommended sequence:** the two token contrast sweeps
(COM-37/38) first — biggest a11y win for the least code, ships M7's headline — then the rest of M7, then
COM-46 (global scenario toggle) as the standout product lever, then the frappe-ui adoption cluster.

**Decisions still pending (flagged in-issue):** COM-62 (left-sidebar app shell) intersects the open IA
decision in CLAUDE.md §5 → needs a go/no-go before build. M6 auth/DB remains blocked on Robin (accept Neon
Marketplace terms + allow-list emails + enable Deployment Protection).

## 2026-06-08 (pm·2) — Ultracode prompt authored + COM-62 approved + Neon verified

**Robin decisions this turn:** (1) **COM-62 (left-sidebar app shell) APPROVED — build it.** Updated the issue:
P3→**P2**, marked approved, and noted it **absorbs COM-67** (Internal/Share nav grouping → sidebar's two
sections) **and the board-switcher half of COM-63** (→ sidebar header); flagged a 3-PR split (shell → migrate
views off PageHeader onto a teleported app-header → board-switcher) to honor ≤450 LOC. After it lands, COM-63
reduces to the ⌘K palette and COM-67 closes as done-here. (2) **Neon provisioned** — confirmed via
`vercel env ls --scope nordnes-personal` (names only): DB set (`DATABASE_URL`(+`_UNPOOLED`), `POSTGRES_URL*`,
`PG*`) + Neon Auth (`VITE_NEON_AUTH_URL`, `NEON_AUTH_BASE_URL`, `NEON_PROJECT_ID`) on Production/Preview/
Development, created ~49m prior. **M6's Neon-terms/provisioning blocker is CLEARED**; remaining M6 human input =
allow-list emails + enable Deployment Protection (COM-33).

**Deliverable — `ULTRACODE_M7_M8.md`** (repo root, ~29k chars / 3.4k words): the build-run prompt for the next
session, authored via a 5-agent workflow (4 parallel research lanes — repo conventions · build/deploy+visual-QA
mechanics · live Linear backlog · git-PR/Linear-Done mechanics → 1 synthesis). Sections: mission+shipped-v1
state · LOCKED non-negotiables · **§3 the per-issue Definition-of-Done loop (a–g, hard/non-skippable: In
Progress → implement → QA gate → mark Done → PR/merge-or-direct-commit → memory.md; "neither alone counts as
closed")** · §4 branch/deploy strategy · §5 recommended sequence · §6 full M7/M8 backlog tables · §7 commands ·
§8 blocks · §9 kickoff. Patched post-authoring for the two decisions above (COM-62 approved; Neon provisioned).
Facts the workflow verified directly against the repo: **ink-gray-5 = 131 usages across all 17 view/component
files; ink-amber-3 = 37; SCEN_COLORS at `scaffold/src/engine.ts:59`** (frozen → COM-56 must relocate it to
constants.ts, not edit the engine); Linear states **Done `03cc9c60-ac0e-42b7-8e33-6b1964f57816`**, **In Progress
`4a7e54ac-2c8d-4932-b46a-5f83685d2c1b`**; **`main` is 16 commits behind the feature branch and NOT on origin.**

**Ask #1 (every issue → mark Done + PR/merge) made durable two ways:** (a) baked into the prompt as the §3
non-skippable loop; (b) **strengthened CLAUDE.md's standing per-issue DoD** to read "…→ open a PR that closes
the issue (`Fixes COM-NNN`) and merge it, or direct-commit to the deploy branch → mark the Linear issue Done →
append memory.md. Every issue gets BOTH the merge/commit AND the Linear Done flip — neither alone counts as
closed." So any future session inherits it, not just one reading the ultracode prompt.

**ONE open decision for the next session — FLOW-A vs FLOW-B (prod branch).** Prod currently deploys from the
feature branch `claude/frosty-pasteur-8cf1db` (also the GitHub default); `main` is 16 commits behind & not on
origin. FLOW-A (default): direct-commit/push each fix onto the deploy branch → ships live (gate strictly).
FLOW-B (recommended): do **COM-36 early** — `git push -u origin main` (after fast-forwarding it to the feature
tip), `gh repo edit --default-branch main`, repoint Vercel's prod branch to `main` — then one-PR-per-issue into
`main`. Confirm with Robin at kickoff. `ULTRACODE_M7_M8.md`, `CLAUDE.md`, `memory.md` are uncommitted (dirty
tree) — fold deliberately.

**Next session:** paste `ULTRACODE_M7_M8.md` into a fresh Claude Code session → it runs M7 (start COM-37/38
token sweeps) → gate M7 → M8 (start COM-46), building COM-62 after the M7 floor.

## 2026-06-08 — M7 started · COM-37 (ink-gray-5 → ink-gray-6 AA sweep) DONE

**Session/worktree note:** spawned in a fresh isolated worktree (`suspicious-swartz-697371`) at the Phase-0
commit (18 behind v1). Robin: "find the correct worktree and build from there." Re-rooted via `EnterWorktree`
into `.claude/worktrees/frosty-pasteur-8cf1db` (the prod branch). **FLOW-A adopted** (commit → push
`claude/frosty-pasteur-8cf1db` → prod redeploy). The preview MCP stays pinned to the *original* worktree, so
its `.claude/launch.json` was created there pointing (abs path, `sh -c cd`) at the frosty `scaffold` dist.

**COM-37 (P0) — DONE.** `ink-gray-5` appears **only** as `text-ink-gray-5`: **134 occurrences / 17 files**
(audit said 131; actual 134), zero border/bg/fill/SVG uses, zero large/disabled cases to reserve → blanket
`text-ink-gray-5` → `text-ink-gray-6`. Token: `--ink-gray-6 #525252` = **7.81:1** on white (was `#7C7C7C`
4.17:1, failed AA). QA: build exit 0 · engine **22/22** (both copies) · `vp check` no lint/type errors.
Visual (preview MCP, computed contrast/route): **0 `text-ink-gray-5` remain, 0 AA fails** on all 6 routes;
min /overview 7.81 · /advisors,/board,/proposition 7.25 (amber-2/gray-1; was 3.88) · /compare 7.81 ·
**/configure 4.97** (dark panel — `--ink-gray-6` remaps lighter on dark surfaces, stays legible). No console errors.

**Gotchas recorded:** (1) zsh does NOT word-split an unquoted `$(rg -l …)` → first perl sweep no-op'd
("Can't open …"); fixed with `rg -l0 … | xargs -0 perl -i -pe`. (2) BSD sed lacks `\b` → used perl.
(3) zsh `noclobber` made `>` to an existing log return exit 1 ("file exists") — masked a build's real exit;
`rm -f` the log first or use a fresh name.

**FLAGGED to Robin (non-blocking):** `vp check` exits 1 on **pre-existing formatting drift in 34 files**
(incl. files COM-37 never touched). NOT a COM-37 regression (diff is token-only). Did **not** run
`vp check --fix` (would bundle 34-file churn, break atomicity). Proposal: one standalone `chore: vp format`
commit so `vp check` is a reliable green gate for the rest of M7/M8 — **awaiting Robin's nod** before
reformatting on the prod branch. Until then, gate = "no NEW lint/type/format issues from the issue's diff."

**Next:** COM-38 — darken accent eyebrows `ink-amber-3` on `surface-amber-2` (2.93:1 → AA), ~37 usages.

## 2026-06-08 — COM-38 (accent-label amber → AA) DONE

**COM-38 (P1) — DONE.** Darkened the amber accent-LABEL pattern to clear AA; kept bright amber-3 for the hero
+ chart fills. Findings: Espresso's amber INK scale stops at **ink-amber-3 (#DB7706)** — no darker amber token
exists — and amber-3 fails AA as small text (2.93:1 on surface-amber-2 #FFF7D3 · 3.16:1 on white · 3.02:1 on
the frappe-ui Badge's amber-1 #FDFAED). Inside the Configure `[data-theme="dark"]` panel amber-3 remaps to
bright #E79913 on dark and already passed (56/57 amber elements there).
- **New theme-aware token `text-ink-amber-strong`**: tailwind.config.js `colors:{'ink-amber-strong':'var(--ink-amber-strong)'}`
  + style.css `:root{--ink-amber-strong:#8A4B08}` / `[data-theme="dark"]{--ink-amber-strong:#E79913}` (= amber-3
  dark, so the Configure panel is visually unchanged). #8A4B08 = 6.3:1 on amber-2, 6.8:1 on white.
- **Swept 38 source `text-ink-amber-3` → `text-ink-amber-strong`** (13 .vue), KEEPING the 1 hero italic
  (Proposition.vue:80 — large, 3.16:1 ≥ large-AA 3:1, the brand moment) as bright amber-3.
- **frappe-ui orange-subtle Badge** ("Internal" + tier pills) colors its text via the component's own
  `text-ink-amber-3` on amber-1. Fixed with a scoped `.rounded-full.text-ink-amber-3{color:var(--ink-amber-strong)}`
  override in style.css — pills only; the non-pill hero keeps bright amber-3.
- QA: build exit 0 · engine 22/22 · vp check no lint/type errors (same pre-existing 34-file format drift,
  count unchanged → no new format issues from this diff). Visual (preview, computed contrast): 0 real AA fails
  on all 6 routes (min 6.04–6.5; proposition 3.16 = hero/large/pass); Internal badge + eyebrows now rgb(138,75,8),
  hero rgb(219,119,6). No console errors. (1 audit "fail" was a lucide mask-icon artifact: bg=currentColor.)
- Gotcha: zsh mangles `\!` in a perl `(?<\!…)` lookbehind even single-quoted → did a global .vue swap then a
  positive-capture restore of the hero: `s/(italic )text-ink-amber-strong/${1}text-ink-amber-3/`.

**Next:** COM-39 — stop using ink-gray-4 (#999, 2.85:1) for chart axis labels / $M qualifiers / ContextStrip separators.

## 2026-06-08 — COM-39 (ink-gray-4 info-text → AA) DONE

**COM-39 (P1, S) — DONE.** Promoted the 7 info-bearing `text-ink-gray-4` (#999, 2.85:1) → `text-ink-gray-6`
(#525252, 7.81:1): the `· $M` / `· post-money $M` unit qualifiers (Compare:60, Board:76, UpsideCurve:33/38)
and the ContextStrip `·` separators + TGE-detail (ContextStrip:16/18/19). KEPT the 2 SVG dashed MARKER lines
(`stroke-current text-ink-gray-4` — VestingTimeline:65, GrowthWaterfall:46) as graphical guides (the
"decorative glyph" gray-4 is reserved for; out of the text scope). The scatter $ axis (issue cited Board:90-91)
was already `fill-current text-ink-gray-6` from a prior commit — no action (its 9px size belongs to COM-49).
Perl swap used `s/…/…/g unless /stroke-current/` to skip the SVG lines (avoids the zsh `\!`-lookbehind issue).
QA: build 0 · engine 22/22 · preview: 0 stale gray-4 text on board/compare/advisors; qualifiers now rgb(82,82,82).

**Next:** COM-40 — programmatic labels on 15+ bare inputs via frappe-ui FormControl (L).

## 2026-06-08 — COM-40 (programmatic input labels) DONE

**COM-40 (P1, "L") — DONE via the issue's sanctioned aria-label interim** (not full FormControl). Chose
aria-label over FormControl adoption because Configure is a `[data-theme="dark"]` panel with deliberately
minimal underline inputs — swapping in frappe-ui FormControl's boxed fields would be a visual redesign + a
dark-theme risk beyond "presentation-only a11y". aria-labels satisfy WCAG 4.1.2/3.3.2 while preserving the design.
- NumIn (26 uses) + Selects already carry accessible names — the gap was the 11 hand-rolled text/date/range
  inputs. Added context-aware `:aria-label`: Configure round/scenario/TGE-date/objective label+trigger/tier/
  milestone (7, indexed e.g. "Round 1 name", "Scenario base name"); Advisors name/start-date/notes (3); + the
  range slider got `aria-label="Options / tokens split"` and a dynamic `:aria-valuetext` ("65% options, 35% tokens").
  Skipped the 2 `class="hidden"` file inputs (display:none → not in the a11y tree; visible Import/Download buttons carry the label).
- QA: build 0 · engine 22/22 · preview: 0 unnamed visible inputs on /configure (25) + /advisors (4); slider
  aria-label + aria-valuetext confirmed live.
- FormControl adoption intentionally DEFERRED (would change the dark-panel input design) — candidate for a future
  design-system pass if Robin wants the fuller frappe-ui component-adoption score.

**Next:** COM-41 — visible focus rings on hand-rolled buttons/inputs + keyboard-operable clickable table rows (M).

## 2026-06-08 — COM-41 (focus rings + keyboard-operable rows) DONE

**COM-41 (P1, M) — DONE.** Visible keyboard focus + keyboard operability for hand-rolled interactive elements.
- 11 `outline-none` inputs (Configure 7, Advisors 3, NumIn 1) + 3 named hand-rolled buttons (Overview roster
  card, Advisors tier, Configure set-base) → `focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)]`.
- 2 navigating `<tr>` (Board, Compare) + the scatter `<g>` → `tabindex=0 role=button :aria-label @keydown.enter/space`
  (now tab-reachable; **Enter verified navigating to /advisors**). Rows add focus-visible ring-inset + bg fallback;
  scatter uses an SVG outline (style.css `svg g[tabindex]:focus-visible{outline:2px solid var(--ink-gray-9)}` — box-shadow
  rings don't render on SVG <g>).
- **Two token gotchas (recorded for the run):** (1) Espresso's `ringColor` exposes `outline-*` but NOT `ink-*`, so
  `ring-ink-gray-5` SILENTLY did not compile (no error, no ring). (2) `ring-outline-gray-3` (#C7C7C7) ≈ 1.3:1 on white
  — fails WCAG 2.2 §2.4.11 Focus Appearance (≥3:1). Fixed both with a Tailwind ARBITRARY theme-aware value
  `ring-[var(--ink-gray-6)]` (compiles; light #525252 = 7:1, dark #999 ≈ 5:1 on the panel). Deliberate deviation from
  the issue's literal "ring-outline-gray-3 matching frappe-ui" — a VISIBLE ring beats a near-invisible match.
- QA: build 0 · engine 22/22 · no console errors. Note: programmatic `:focus-visible` can't be observed via the
  preview MCP (no keyboard-Tab primitive), but the class is applied + the rule compiles → renders on real Tab.

**Next:** COM-42 — raise icon-only/inline touch targets to >=32-44px (14px bare trash buttons first) (M).

## 2026-06-09 — COM-42 (touch targets) DONE

**COM-42 (P1, M) — DONE.** Fixed the AA-failing touch targets (the issue's "fix these first — only ones failing
AA outright").
- 6 bare trash `<button>`s (Configure rounds/scenarios/objectives/tiers/milestones + Board remove) wrapped a 14px
  icon with no padding (~14px hit area, fails WCAG 2.5.8 AA 24px). → `inline-flex shrink-0 items-center justify-center
  size-8 rounded` = 32×32 (+ hover:bg-surface-gray-2 + a focus-visible ring, closing a COM-41 gap). Verified all 18
  rendered instances are 32×32.
- Nav tabs (App.vue, ~37px) → `inline-flex items-center min-h-[44px]` = 44px touch target (verified).
- **Gotcha:** `size-8` alone left the scenario-delete button at 32×14 — in its tight flex row (next to the long
  exit-summary text) it shrank below the set width; `shrink-0` fixed it.
- Deferred (AAA-comfort, already pass AA 24px): frappe-ui sm→md bump + NumIn dense-table tap area → fold into the
  COM-31 mobile pass.
- QA: build 0 · engine 22/22 · sizes confirmed via getBoundingClientRect (Configure screenshot = known dark-panel
  capture artifact).

**Next:** COM-43 — confirm + Undo on destructive deletes and Reset-to-baseline (M).

## 2026-06-09 — COM-43 (confirm on destructive actions) DONE

**COM-43 (P1, M) — DONE.** Gated all 8 destructive actions behind a frappe-ui confirm dialog (issue minimum was
Reset+delRound/Scenario/Milestone; extended to all for consistency + safety). Added `src/confirm.ts` →
`confirmDestroy(title, message, action)` wrapping frappe-ui `confirmDialog` (rendered by the already-mounted
`<Dialogs/>` — socket-safe). Wrapped at the VIEW layer so the store stays a pure reducer:
- Configure: delRound/delScenario/delObjective/delTier/delMilestone (messages state each real cascade).
- App: Reset-to-baseline + delBoard. Board: delAdvisor (`Remove {name}?`).
- frappe-ui ConfirmDialog API: `confirmDialog({title, message, onConfirm})`; onConfirm receives `{hideDialog}`;
  the dialog has a single "Confirm" button + X-to-cancel.
- Undo-toast (the issue's optional "better") DEFERRED → pairs with COM-53 (toasts); confirm fully covers the
  accidental-destruction safety goal.
- QA: build 0 · engine 22/22 · preview: delete-round click opened the dialog and did NOT delete (gate works);
  Confirm then executed it (3→2 rounds). Cleared localStorage after to restore the default board.

**Next:** COM-44 — text alternatives (role=img + aria-label) on screen-reader-silent charts (M).

## 2026-06-09 — COM-44 (chart text alternatives) DONE

**COM-44 (P1, M) — DONE.** Gave the screen-reader-silent charts text alternatives.
- FrappeChart.vue: added an optional `ariaLabel` prop → `role="img"` + aria-label on its root (frappe-charts
  renders raw <svg> with no ARIA). Passed computed summaries to: Compare grouped bar + UpsideCurve equity & token
  line charts. (Board staircase already covered by its container role=img → left alone to avoid nested role=img.)
- GrowthWaterfall: role=img + aria-label on its <svg> (Current/Ceiling values in the label).
- FootballField: role=img + aria-label on the bar div (range lo–hi + base) — fixes the per-row COMPACT Board bars
  that were fully silent (base was only in a title tooltip).
- DilutionPath / MixBreakdown / PotentialStrip — DELIBERATELY left WITHOUT role=img: already text-accessible
  (per-step %s + summary / labeled legend / labeled metric cells). role=img would HIDE that readable text.
  Principle: a text alternative only where the visual is opaque; never role=img over readable text.
- QA: build 0 · engine 22/22 · preview: /advisors 4 role=img, /board 6 (staircase/scatter + 4 FootballField
  "Scenario range $X to $Y, base $Z"), /compare 1 grouped bar. No console errors.

**Next:** COM-45 — Import/Copy/Paste explicit success+failure feedback with counts + validate imported JSON at the boundary (M). Then GATE M7.

## 2026-06-09 — COM-45 (Import/Paste validation + feedback) DONE — M7 COMPLETE

**COM-45 (P3, M) — DONE.** Hardened the data-IO surfaces.
- Added a trust-boundary `validImport(o)` in store.ts: rejects junk that JSON.parse accepts (non-object, array,
  or missing plan/advisors) BEFORE loadState/reconcile sees it. No zod dep (lightweight shape check).
- importJSON: invalid → "Import failed — not a valid board file" / "...invalid JSON"; valid → "Imported · N
  advisors, M scenarios". pasteState: same validation + "Pasted · N advisors, M scenarios" / clear failures.
- copyState (App) + copyProp (Proposition) already had explicit success/failure flashes — left as-is.
- Used the existing flash()/store.status mechanism; the full Toast swap is COM-53 (M8) per the issue.
- QA: build 0 · engine 22/22 · preview (file-input): junk → "Import failed — not a valid board file";
  a real 4-advisor board → "Imported · 4 advisors, 3 scenarios". Restored default board after (localStorage.clear).

**★ M7 · Accessibility & user-control floor — COMPLETE (9/9: COM-37–45)**, all shipped to prod on
`claude/frosty-pasteur-8cf1db`. The audit's two headline WCAG failures + the a11y/operability floor are cleared:
contrast (gray-5→6, amber labels, gray-4 info text), programmatic input labels, focus rings + keyboard-operable
rows/scatter, ≥32px touch targets, confirm-on-destructive, chart text alternatives, import validation+feedback.
Next: M7 gate → M8 starting at COM-46 (single persistent global scenario toggle — top product lever).

## 2026-06-09 — ★ M7 MILESTONE GATE — GREEN

M7 (COM-37–45, 9/9) gated:
- Build exit 0; both engine copies 22/22; src token sanity: 0 `text-ink-gray-5`, 1 `text-ink-amber-3` (hero only).
- Visual smoke (preview, all 6 routes): all render; role=img counts correct (advisors 4, board 6, compare 1;
  overview/proposition/configure have no charts needing it); Overview shows $23M board base; Confidential/Internal present.
- No console errors. Prod live (comp-studio-one.vercel.app serves "Raiku · Advisory Comp Studio"). All 9 fixes
  pushed to claude/frosty-pasteur-8cf1db (FLOW-A).
- Pending for Robin (non-blocking): (1) one-time `chore: vp format` to make `vp check` green for M8 (pre-existing
  34-file drift, NOT introduced by M7) — awaiting nod; (2) Vercel MCP 403 (re-auth nordnes-personal scope) blocks
  API deploy-status checks (prod itself verified via WebFetch).
Next: M8 (COM-46…68, 23 issues) starting COM-46 (single persistent global scenario toggle — top product lever).

## 2026-06-09 — chore: vp format (Robin: land before M8) + M8 START

Ran `vp check --fix` across scaffold/src. Decisions:
- Formatted 32 tracked files (src .vue/.ts/.css + index.html, package.json, tailwind.config.js, vite.config.ts,
  engine.test.mjs). No logic changes — build 0, both engine copies 22/22.
- **REVERTED scaffold/src/engine.ts**: --fix wanted a 616-line reformat of the FROZEN engine (dense→expanded).
  Logic identical (tests passed) but the engine is a hard non-negotiable → kept byte-frozen (git checkout).
- The 2 generated `.d.ts` (auto-imports/components) are re-emitted UNFORMATTED by the build plugins every build →
  they perpetually appear in `vp check`; build artifacts, not committed drift.
- **M8 vp-check gate interpretation:** `vp check` now flags ONLY engine.ts (frozen) + the 2 generated .d.ts.
  Any NEW src file flagged = real drift to fix. (A vp/oxc ignore for engine.ts+*.d.ts would make it fully green —
  deferred; vp is alpha/local-only, not a build/deploy dep.)

**M8 STARTING** (COM-46…68, 23 issues) autonomously per Robin, prompt order: COM-46 global scenario toggle →
frappe-ui cluster → chart legibility → COM-62 app-shell (3 PRs) → P3 polish.

## 2026-06-09 — COM-46 (global scenario toggle) — ANALYSIS + DESIGN FORK (surfaced to Robin)

In Progress. Engine analysis (scaffold/src/engine.ts computeAdvisor/computeBoard):
- Per scenario, `c.scen[k]` exposes {key,label,retention,strikeBasis,exitVal,fdv,grantN,netEqAt(fn),equity,token,
  **total**,underwater}; `board.cost[k]` and `walkScenario(plan,k)`/`tgeFdvFor` are also per-key. SWITCHABLE.
- BUT floor/current/ceiling (`baseCaseBase/baseCaseTotal/baseCaseCeil`, `baseEqNet`…) are computed ONCE from
  sb=scen.find(baseScenKey) (engine lines 275-278) → BASE-ONLY, not exposed per scenario. The Advisors
  PotentialStrip (Floor/Current/Ceiling), GrowthWaterfall and UpsideCurve read these base-baked scalars.

**FORK:** the issue says add a SEPARATE `activeScenario` (NOT baseScenario), engine untouched. The frozen engine
bakes floor/ceil to baseScenario, so a separate activeScenario can switch only the exposed values (totals/cost/
staircase/FDV/ContextStrip/DilutionPath); floor/ceil breakdowns would stay base-anchored (INCONSISTENT) unless I
recompute them inline in views (forbidden) or change the engine (forbidden). So the issue's approach isn't cleanly
implementable under the locked constraints.
- Option A (reuse plan.baseScenario via the header toggle): EVERY view switches CONSISTENTLY (engine recomputes
  baseCase* for the new base) — zero engine change, zero inline math, persistent. Trade-off: Configure ★ + Compare
  base-highlight + Proposition base-framing follow the toggle (one synced "active case").
- Option B (separate activeScenario, partial): base reference stays fixed; only exposed values switch; floor/ceil
  stay base (mild inconsistency on those specific cells).
SURFACED to Robin (recommend A — the only clean, fully-consistent, rule-respecting option). Awaiting his call.

## 2026-06-09 — COM-46 (global scenario toggle) DONE [M8 #1]

**COM-46 (P1, top product lever) — DONE via Option A (Robin's call: reuse baseScenario).** Persistent global
"Case" selector in App.vue header (frappe-ui Select, styled like Saved) bound to a writable computed
`activeScenario` (get baseScenKey(plan); set setPath(['plan','baseScenario'],k)). Every view already reads
baseScenKey → ALL views switch consistently; ZERO view rewiring, zero engine change, persisted with the board.
Hidden when <2 scenarios.
- frappe-ui Select = a reka-ui button-dropdown (NOT native <select>); synthetic .click() won't open it. Verified
  the switch via the identical setPath(baseScenario) action: Board FDV $600M(5×) → $200M(2×), header trigger
  "Base" → "Conservative". Header reflects the active case.
- QA: build 0 · engine 22/22 · no console errors · screenshot shows "Case [Base ▾]" in the header.

**Next M8:** frappe-ui adoption cluster — COM-53 (Toasts) → COM-54 (Alert) → COM-55 (TabButtons) → COM-52
(Tooltips) → COM-68. Then chart legibility, COM-62 app-shell (3 PRs), P3 polish.

## 2026-06-09 — COM-53 (frappe-ui Toasts) DONE [M8]

**COM-53 (P2, S) — DONE.** Replaced the ephemeral header status span with frappe-ui Toasts. flash() (store.ts)
now calls toast.error (msgs matching /fail|invalid|blocked|unavailable|exceed/) else toast.success — rendered by
the already-mounted FrappeUIProvider → ToastProvider (which renders <Toasts/> + ToastViewport bottom-right; no
extra mount needed). Removed the dead `store.status` field + the header span. All flash() call sites + Proposition
copyProp now toast (success/error styled). QA: build 0 · engine 22/22 · no console errors · verified an invalid
import shows an error toast (bottom-right, icon + close); old span gone.

**Next M8:** COM-54 (Alert for storage/budget banners) → COM-55 (TabButtons) → COM-52 (Tooltips) → COM-68 → chart cluster → COM-62 app-shell → P3.

## 2026-06-09 — COM-54 (frappe-ui Alert) DONE [M8]

**COM-54 (P2, S) — DONE.** Replaced hand-built colored banners/panels with frappe-ui <Alert>.
- Alert API (confirmed installed): title (req); theme 'yellow'|'blue'|'red'|'green' (NO amber — used 'yellow'
  for warnings); variant subtle/outline; description prop + #description/#icon/#footer slots; themed default icon.
- App.vue: storage banner → <Alert theme="yellow" title="Browser storage is unavailable">; budget banner →
  <Alert theme="red" title="Budget warning"> (detail in #description). Contained in max-w-7xl under the header.
- Overview "To confirm / alerts" panel → <Alert :theme="hasBudget?'red':'yellow'" title="To confirm / alerts">
  with the flag list in #description — renders perfectly (themed icon + title + flags + dismiss X).
- QA: build 0 · engine 22/22 · no console errors · Overview Alert verified visually. App banners are conditional
  (rare states) — same Alert pattern, API-correct + build-verified.

**Next M8:** COM-55 (TabButtons) → COM-52 (Tooltips) → COM-68, then chart cluster, COM-62 app-shell, P3.

## 2026-06-09 — COM-55 (TabButtons) DONE [M8]

**COM-55 (P2, S) — DONE.** Converted the 2 hand-rolled Button-array segmented toggles in Advisors to frappe-ui
<TabButtons :buttons :model-value @update:model-value>: base denomination (By tier / By $ value) + per-objective
tri-state (Off / Target / Earned). Gains roving-focus keyboard nav + selected-state ARIA. Trade-off: the tri-state's
earned=green per-segment theme is gone (TabButtons has no per-button theme) — earned is still cued by the green
"+X%" text + dot. Verified: clicking "By $ value" switched to value mode (slider appeared) → TabButtons are
click/keyboard-functional; 15 tri-state segments render. QA: build 0 · engine 22/22 · vp clean · no console errors.

**Next M8:** COM-52 (Tooltips on finance jargon) → COM-68 (Divider/Avatar/Combobox + text-scale), then chart cluster, COM-62 app-shell, P3.

## 2026-06-09 — Session pause (M8: 4/23 done, clean boundary)

Shipped this session (all on prod claude/frosty-pasteur-8cf1db, engine frozen 22/22 throughout):
- **M7 COMPLETE (9/9, gated)** — COM-37…45.
- **chore: vp format** (Robin-requested; engine.ts reverted/frozen).
- **M8: COM-46** (global scenario toggle, top lever) · **COM-53** (Toast) · **COM-54** (Alert) · **COM-55** (TabButtons).

COM-52 (term Tooltips) was reverted to Backlog — NOT started in code (reads only). It's content-heavy: accurate
finance definitions (net of strike, TGE FDV, RTA, deed of adherence, ⏳ gate glyph, tier ×, headroom) across many
views. Tooltip API confirmed: `<Tooltip text="…" placement hoverDelay>` + trigger slot. Suggested approach: a small
`<Term k>` glossary-tooltip component + GLOSSARY map in constants.ts; the ⏳ tooltip pairs with COM-65 (emoji→icon).

**M8 remaining (19):** COM-52 (tooltips) · COM-68 (Divider/Avatar/Combobox + text-scale) · chart cluster
(COM-48,49,50,51,56,57 + decision aids 47,58) · **COM-62** app-shell (L, 3 ≤450-LOC PRs; absorbs COM-67 + COM-63
board-switcher) · P3 (COM-59,60,61,63,64,66,65). Resume at COM-52.

## 2026-06-09 — New session: branch + deploy flow CHANGED (Robin's call) + COM-52 DONE [M8 #5]

**⚠️ FLOW CHANGE for this session (Robin chose via AskUserQuestion):** the harness assigned a NEW dev branch
`claude/comp-studio-m8-continuation-xqi95l` (forked from frosty-pasteur @ b801376) and forbids pushing elsewhere
without permission. Robin's call: **work issue-by-issue on the continuation branch; batch-merge into
`claude/frosty-pasteur-8cf1db` (prod) at MILESTONE GATES only — NOT per issue.** So per-issue pushes no longer
redeploy prod; prod updates at the next M8 gate merge. A draft PR (continuation → frosty) tracks the batch.

**Environment deltas this session (remote, not the original local worktree):**
- `vp` CLI is NOT available remotely (local-only, as documented). Gate = `npm run build` (exit 0, compiles all
  templates incl. new ones) + both engine copies 22/22 + `npx vue-tsc --noEmit` for src-error triage.
- `vue-tsc` here is NOISY: it can't resolve frappe-ui's `~icons/lucide/*` virtual modules (provided by
  unplugin-icons at vite build time, not raw tsc) → ~120 node_modules errors + the pre-existing COM-55
  `Advisors.vue TabButtons TabButtonValue→string` error. Verified via `git stash` that these are ALL pre-existing;
  my changes add ZERO new src errors. **Build is the authoritative gate; vue-tsc is advisory only here.**
- No preview MCP / port-bind blocked (as before) → no live visual pass remotely; visual verify happens on the
  prod URL at the milestone merge.
- `npm install` rewrites package-lock.json cosmetically (strips `libc` fields — npm 10.9.7 churn) and the build
  re-emits `components.d.ts` (adds the new Term registration). Both REVERTED before commit — source-only commits.

**COM-52 (P2, M) — DONE.** Glossary tooltips on load-bearing finance jargon.
- New `src/components/Term.vue`: thin wrapper over frappe-ui `<Tooltip :text :hover-delay>`; trigger is a
  `<span>` with dotted-underline (`border-b border-dotted border-current`, inherits context color), `cursor-help`,
  `tabindex=0` (keyboard-focusable; reka-ui wires aria-describedby on focus). Default slot overrides displayed text.
- New `GLOSSARY` map in constants.ts: netOfStrike · tgeFdv · tierMultiplier · headroom · awaitingGate — plain-
  language definitions (NEW presentation copy; the verbatim legal corpus was NOT touched/fragmented).
- 14 wraps across 7 files: TGE FDV (ContextStrip/Board staircase caption/Overview base-path/UpsideCurve) · net of
  strike (Advisors instruments/Proposition net-value caption/App footer note/UpsideCurve) · tier multiplier
  (Advisors ×tier label + 4 tier-card badges) · headroom (Board scatter caption) · ⏳ awaiting gate (Advisors cap
  + objectives, Board uplift cell).
- **Scope decisions:** (1) kept the ⏳ EMOJI (added tooltip + aria only); the emoji→glyph swap stays COM-65 per
  the plan — avoids double-editing the glyph. (2) RTA / deed-of-adherence live only inside verbatim legal
  paragraphs / generated draft strings → NOT wrapped (would fragment the legal corpus); the issue's "Fix" targets
  labels/captions, which are fully covered. GLOSSARY can gain them later if a standalone caption appears.
- Per-Term TooltipProvider (frappe-ui's built-in) + 0.3s hoverDelay handles flicker — no separate cluster provider.
- QA: build exit 0 · engine 22/22 (both copies) · vue-tsc adds 0 new src errors (stash-verified) · diff source-only
  (~78 insertions). Pushed to continuation branch; NOT yet on prod (milestone-gate merge per the flow change above).

**Next M8:** COM-68 (Divider/Avatar/Combobox + text-scale fixes) → chart cluster (48,49,50,51,56,57 + 47,58) →
COM-62 app-shell (3 PRs) → P3 (59,60,61,63,64,65,66) → COM-70/69/72. Engine frozen throughout.

## 2026-06-09 — COM-68 (Divider/Avatar/Combobox + text scale) DONE [M8 #6]

**COM-68 (P3, S) — DONE.** Adopted the three named frappe-ui primitives; ~47 LOC source-only.
- **Combobox:** AdvisorPicker Select → labeled searchable `<Combobox>`. API (0.1.278): `defineModel<string|null>`
  → clean `:model-value`/`@update:model-value` drop-in; same `{label,value}` options + `select()` handler.
  `inputAttrs` spreads `...rest` onto the ComboboxInput, so `aria-label` forwards (→ "labeled"). `placeholder`
  shows when empty; `trigger='input'` (default) = type-to-search. Avatar/Divider/Combobox all ship in 0.1.278.
- **Avatar** (`:label size="sm"`, renders `label[0]` initial when no image): Overview roster cards, Board table
  name cell (wrapped name+sector in a flex beside the Avatar), Proposition header (justify-end flex). sm = w-5/h-5.
- **Divider** (= `<hr border-t-[1px] border-outline-gray-2 w-full>`, no margin): replaced the 2 NEUTRAL-gray
  in-card `border-t` rules — Advisors cash-retainer break (in a space-y-4 card) + Proposition legal block
  (`<Divider class="my-4" />`). **Kept** the amber-themed accent rules (Advisors:objectives, Board:cost) and the
  App footer boundary: Divider is gray-only, so converting amber rules would DROP the deliberate accent (regression).
- **Text scale:** the audit's line numbers were STALE (e.g. "Advisors:96,110" were not border-t at all — re-found
  the real `border-t` sites via grep). Did the one clear one-line-label fix (Proposition "Advisory Engagement
  Proposition" text-p-sm→text-sm). **Left the broad subjective sweep light** — one-line-vs-multiline can't be judged
  statically and there's NO live preview this session (port-bind blocked, no preview MCP). Flagged for a preview pass.
- QA: build exit 0 · engine 22/22 both · vue-tsc 0 new src errors (only the pre-existing COM-55 TabButtons line).
  Pushed to continuation branch (PR #1 → frosty; Vercel preview deploy went Ready/green on the COM-52 push).

**Verification caveat (this remote session):** no `vp`, no live preview, port-bind blocked. Gate = build +
engine + vue-tsc(advisory). Interaction (Combobox typeahead) and layout/spacing (Avatar rows, Divider gaps) are
build-verified only; final visual confirmation happens on the prod URL at the milestone-gate merge to frosty.

**Next M8:** chart cluster — COM-48 (scatter overlap/gridlines) · 49 (text floor ≥11px) · 50 (visible median) ·
51 (non-color channel) · **56 (move SCEN_COLORS out of engine → constants.ts, re-point Compare import)** · 57
(breakeven shading) · + 47 (exit slider) / 58 (scannability). Then COM-62 app-shell (3 PRs), P3, COM-70/69/72.

## 2026-06-09 — Robin's calls (AskUserQuestion) + COM-56 DONE [M8 #7]

**Two decisions surfaced to Robin this session (no live preview here ⇒ pixel work needs his steer):**
1. **Chart cluster = OBJECTIVE-SPEC ONLY.** Do the ones with an objective target: COM-49 (text ≥11px), 50
   (visible median), 51 (non-color channel), + 56 (colors). **DEFER to a preview-equipped session:** COM-48
   (scatter declutter), 58 (scannability) — and by extension 57 (breakeven shading) / 47 (exit slider), which
   are visual-judgment, not objective. Don't tune pixels blind.
2. **COM-56 = FULL CSS-custom-property + dark.** Build the whole :root + [data-theme=dark] token palette now,
   not just the SCEN_COLORS move.

**COM-56 (P2, M) — DONE (full scope).** One source of truth for the chart/category/scenario/tier palette.
- **style.css:** 9 named tokens (`--chart-capital/customer/partnership/governance/uplift/alt/tint/cash/warning`)
  under `:root` (light = the verified v1 hexes, zero visual change) + `[data-theme="dark"]` (forward-looking
  lightened values; charts are light-only in v1 so these are untuned-but-present).
- **constants.ts:** CAT + TIER_COLOR now emit `var(--chart-*)`; added `SCEN_TOKENS` (the moved scenario palette)
  + `chartHex(token)` — resolves a token to concrete hex via `getComputedStyle(document.documentElement)` with a
  **light-literal fallback** (CHART_HEX) so frappe-charts NEVER loses color even pre-paint. (Renamed the
  CAT_OPTIONS destructure var `v`→`val` to free `v=()=>var(...)` helper.)
- **engine.ts:** SCEN_COLORS export REMOVED (sanctioned COM-56 engine edit — presentation constant, not money;
  both engine tests stay 22/22). Compare re-pointed to SCEN_TOKENS+chartHex.
- **Split by render path:** custom-SVG/DOM fills (Growth/Vesting/Mix/Dilution/EquityBenchmark/Board scatter/
  slider/CAT dots) use `var(--chart-*)` directly in `:style`/`style` (native theme flip — verified every site is
  a CSS style context, never an SVG presentation attribute where var() wouldn't resolve). frappe-charts arrays
  (Board staircase, UpsideCurve eq/tk, Compare scen) use `chartHex()` computeds (lib needs hex values).
- All 22 inline .vue hexes swapped (0 remain). QA: build 0 · engine 22/22 both · vue-tsc 0 new src errors.
- **Verification caveat:** light-mode colors are exact (literals preserved → no regression by construction). The
  runtime `chartHex` resolution + dark-flip are build-verified only (no preview); worst case = light fallback =
  current behavior. Dark values need a tuning pass when dark-chart work starts.

**Next M8 (objective-spec chart subset):** COM-49 (chart text floor ≥11px) → 50 (visible median) → 51 (non-color
channel). Then COM-62 app-shell (3 PRs), P3 (59/60/61/63/64/65/66), COM-70/69/72. DEFERRED for preview: 48,57,58,47.

## 2026-06-09 — COM-49 (SVG chart text floor) DONE [M8 #8]

**COM-49 (P2, S) — DONE.** Raised sub-legible SVG `<text>` to the ~11px floor + value labels to ink-gray-7.
- GrowthWaterfall: value notes ($/%) + Current/Ceiling captions 9→11; notes ink-gray-6→7.
- VestingTimeline: ref labels (cliff/TGE/Bad-Leaver/today) + M0/M48 axis 8→11.
- Board scatter: axis labels 9→11 + ink-gray-7; **bubble names 9→10** (NOT 11 — bumping worsens the scatter
  overlap that COM-48 fixes, which Robin deferred to a preview session; 10 is a legibility nudge that won't
  aggravate it). DilutionPath compact stage labels 8→10 + ink-gray-7 (HTML, non-scaled → kept 10 for fit).
- Left for the preview pass (visual judgment): right-edge waterfall note re-anchoring (crowding), final
  scatter/DilutionPath sizing once COM-48 declutter lands. QA: build 0 · engine 22/22 both · 0 new src errors.
- DilutionPath % labels were already text-xs (12px, ≥ floor). All viewBox SVG text scales with the chart width.

**Next:** COM-50 (visible median on the staircase) → COM-51 (non-color channel). Then COM-62 app-shell, P3.

## 2026-06-09 — COM-50 + COM-51 (chart legibility) DONE [M8 #9, #10]

**COM-50 (P2, S) — DONE.** Staircase 'Median' series was `--chart-tint` (#E7C99B, 1.59:1 vs white = invisible).
Added a dedicated **`--chart-median`** token (light #6e7a8a muted slate ≈4.4:1 / dark #a6b0c0) in style.css +
CHART_HEX fallback; pointed Board `stairColors[1]` at it. Kept `--chart-tint` for the DilutionPath large fills
(out of COM-50's explicit scope — Board.vue:79 only).

**COM-51 (P2, M) — DONE (objective core).** Tier is single-encoded by hue ONLY on the Board scatter (bubble
position = x/y data, not tier). The other listed marks already carry a positional channel + text legend:
VestingTimeline (stack order), MixBreakdown (segment order), Compare (consistent per-group series order). So the
genuine single-encoded gap = the scatter bubbles.
- Added a **radius-guarded tier-initial** inside each bubble (`v-if sr(d.z)>=9`, white 10px, pointer-events none)
  as the redundant non-color channel (colour-blind + print). Guard prevents tiny-bubble overflow without a preview.
- Surfaced the same initial as a bold prefix in the tier legend → explicit bubble↔legend mapping.
- **Deferred to the preview pass (visual judgment):** tier-ramp luminance re-pick (brand colours app-wide) +
  VestingTimeline band hatch/dash. Noted these are the visual half of COM-51.
- QA (both): build 0 · engine 22/22 both · 0 new src errors. Committed together (shared Board.vue regions).

**M8 chart cluster status:** objective-spec subset COMPLETE — 49 (text floor) · 50 (median) · 51 (non-color) ·
56 (palette tokens). DEFERRED for a preview-equipped session: 48 (scatter declutter) · 57 (breakeven shading) ·
58 (scannability) · 47 (exit slider). **Next: COM-62 app-shell (L, 3 PRs) OR P3 polish (59/60/61/63/64/65/66) +
COM-70/69/72.** COM-62 is architecturally significant (left-sidebar shell, migrate 6 views off PageHeader) — needs
a design check-in before starting per the prompt.

## 2026-06-09 — COM-70 (Undo on deletes + Reset) DONE [M8 #11]

**COM-70 (P2, M) — DONE.** COM-43 follow-up, unblocked by the COM-53 Toast.
- store.ts: module-level `undoSnap` + `pushUndo()` (clones the whole working board S before the mutation) +
  `restoreUndo()` (swaps S back, fixSel, persist, "Restored" toast) + `undoToast(what)` →
  `toast.create({message:'Removed {what}', type:'info', action:{label:'Undo', onClick:restoreUndo}})`.
- 6 light list deletes now single-click + Undo (no confirm): delAdvisor/delObjective/delTier/delMilestone/
  delRound/delScenario. pushUndo() goes AFTER each guard (the `length<=1 return` ones) so a blocked delete
  doesn't capture a snapshot. Dropped the confirmDestroy wrappers in Board.vue (advisor) + Configure.vue (5) and
  removed their now-unused confirmDestroy imports. App.vue keeps confirmDestroy for reset + delBoard.
- reset() now fires an Undo toast ALONGSIDE its confirm (snapshot then DEFAULT) — matches the issue title's
  "Reset via a Toast action"; confirm kept (catastrophic). delBoard stays confirm-only (it mutates the saved-board
  MAP, outside the working-board snapshot scope — undo would need a separate saved-map snapshot; out of scope).
- QA: build 0 · engine 22/22 both · 0 new src errors. `toast.create({action})` typechecks. flash() still used by
  the roadmap IO paths (not orphaned).
- **Verification caveat:** the Undo round-trip is build-verified + reasoned (snapshot/restore + documented toast
  action API) but the click-through isn't preview-tested this session → confirm at the gate. Behavior change:
  light deletes lost their confirm dialog (intended — this IS the COM-43→COM-70 evolution, not a regression).

**M8 status: 11/23 done this+prior sessions** (46,53,54,55 prior; 52,68,56,49,50,51,70 this session). Remaining:
COM-62 (app-shell, L, 3 PRs — ARCHITECTURAL, needs design check-in + preview) · P3 polish (59,60,61,63,64,65,66) ·
COM-72 (FormControl — needs dark-panel design call) · COM-69 (vp gate — needs vp, defer to local session) ·
DEFERRED-for-preview chart visuals (47,48,57,58). **Next decision point: COM-62 — pause for Robin's design call.**

## 2026-06-09 — Session PAUSE (Robin's call): M8 11/23, clean boundary, preview-gated remainder

**Robin's routing call (AskUserQuestion):** PAUSE M8 here and resume the remainder in a session with a WORKING
PREVIEW. COM-62 nav grouping (flat vs Internal/Share) = DECIDE LATER (when 62 is actually built w/ preview).

**Shipped this session (7 issues, all on `claude/comp-studio-m8-continuation-xqi95l`, draft PR #1 → frosty):**
COM-52 (glossary tooltips) · COM-68 (Combobox/Avatar/Divider) · COM-56 (CSS-var chart palette + dark; SCEN_COLORS
out of frozen engine) · COM-49 (chart text ≥11px) · COM-50 (visible median token) · COM-51 (scatter tier-initial
non-color channel) · COM-70 (Undo on light deletes + Reset toast). Build 0 · engine 22/22 both · every push
deployed GREEN on the Vercel preview (PR #1 rollup success).

**⚠️ FLOW (unchanged for this run):** work lands on the continuation branch; **NOT yet merged to frosty/prod** —
Robin batch-merges PR #1 at a milestone gate (his call). Prod (`claude/frosty-pasteur-8cf1db`) is still at the
pre-session commit. PR #1 = https://github.com/nordnes/comp-studio/pull/1 (draft).

**M8 remaining = 12, all gated on something THIS remote session lacked (no live preview, no vp, or a design call):**
- **Needs a design call:** COM-62 (L, 3 PRs, left-sidebar app-shell + teleported #app-header; migrates 6 views off
  PageHeader; absorbs COM-67 nav-grouping + COM-63 board-switcher) · COM-72 (FormControl, dark-panel design) ·
  COM-63 (⌘K palette + board-switcher, partly in 62).
- **Needs a live preview (visual judgment):** COM-48 (scatter declutter/gridlines) · 57 (breakeven shading) ·
  58 (scannability) · 47 (exit slider) · 64 (Proposition band differentiation) · 66 (More-menu tidy, partly) ·
  60 (chart-mount flash overlay, partly) · 65 (⏳ emoji→glyph — DOM part is a clean lucide swap, but SVG-waterfall
  notes need a text marker + icon-size eyeball) · 59 (print confidentiality mark — needs print preview).
- **Needs local vp:** COM-69 (lint-gate green — vp/oxc not installed remotely; would also touch frozen engine's
  unused vars → ignore-config is the fix, but unverifiable here).
- **Out of M8 / ops:** COM-71 (Vercel re-auth, human) · COM-36 (merge to main) · M6 COM-34/35 (auth/DB).

**Resume plan (preview session):** verify this session's 7 issues render on the preview; then COM-65 (quick) →
COM-66/60/64/59 → the chart visual cluster (48/57/58/47) → COM-62 app-shell (3 PRs, get the nav-grouping call
first) absorbing 67+63 → COM-72 (dark-panel design) → COM-69 (local vp). Engine frozen throughout.

**Subscription:** this session is watching PR #1 for CI failures + review comments until merge/close. All events
so far were vercel[bot] deploy-status (Building→Ready, all green) — no action. send_later unavailable → no timed
check-in; relying on webhook events.

## 2026-06-09 — New session FULLY EQUIPPED + COM-65 (⏳ → "pending" chip) DONE [M8 #12]

**Resume condition the prior pause waited for is MET:** local `vp` present, **Claude Preview MCP present**
(live visual pass restored), Linear/GitHub/Vercel MCP all connected. The prior "no preview / no vp"
constraints are LIFTED → the whole remaining M8 is executable here. Robin's calls (AskUserQuestion):
**(1) full M8 marathon** — all 12 remaining issue-by-issue, surface COM-62/72 design calls when reached,
then gate M8; **(2) commit ULTRACODE_PROMPT.md to the dev branch** (I deferred the write to session close
so it reflects final state — memory.md is the durable log meanwhile).

**Branch/flow:** fresh worktree branch `claude/relaxed-faraday-a9f377` off frosty (which now has the 11
merged M8 issues via PR #1, merge 9ba086d). New **draft PR #2** (relaxed-faraday → frosty,
https://github.com/nordnes/comp-studio/pull/2) tracks this batch; merge to frosty at the M8 gate ONLY.

**Preview reality (this session):** the HMR dev server (`comp-studio-dev`, port 5173) CRASHES on start
under the preview MCP; **`comp-studio` (vite preview over built dist, port 4173) is rock-solid.** Loop =
**edit → `( cd scaffold && npm run build )` (~3s) → reload 4173 → verify** — aligns with the per-issue
build gate anyway (no HMR needed). `.claude/launch.json` already has both configs. serverId changes per run.

**Icon idiom (IMPORTANT for all future icon work):** lucide icons render via CSS classes `lucide-<name>`
sourced from a **FIXED 46-icon set baked into frappe-ui's bundled style.css** — NOT an on-demand generator
(no @iconify/tailwind, no addDynamicIconSelectors; tailwind `plugins:[]`). An arbitrary `lucide-foo` =
invisible empty span. Available 46: archive, arrow-right, bell, building-2, check, check-circle,
chevron-down, clipboard-paste, copy, edit, ellipsis, eye, file-json, file-text, folder-input, folder-open,
inbox, info, layers, layout-grid, link, list-restart, log-out, mail, message-circle, moon, more-horizontal,
pen, plus, printer, rotate-ccw, save, settings, share-2, sliders-horizontal, smile, target, trash-2,
trending-down, trending-up, triangle-alert, upload, user, user-plus, users, zap. **No clock/hourglass/timer**
→ COM-65's lucide-glyph option was off the table. (A NEW glyph could come via frappe-ui's `~icons/lucide/*`
component-import path, but that's untested in app code — would need verifying first.)

**COM-65 (P3, S) — DONE.** ⏳ emoji → small **"pending" text chip in accessible amber** (`--ink-amber-strong`
= rgb(138,75,8)) — the issue's sanctioned fallback since no clock/hourglass glyph exists.
- DOM (3): Advisors capital channel (new wrapper `<span class="ml-1 text-xs font-sans text-ink-amber-strong">
  <Term k="awaitingGate">pending</Term></span>`), Advisors objective row (`⏳ awaiting gate` → `awaiting gate`
  — words ARE the marker), Board pending-uplift cell (inner `text-xs font-sans` span, amber from existing
  wrapper). Kept `<Term>` tooltip + a11y everywhere.
- SVG (2): GrowthWaterfall note strings `" ⏳"` → `" pending"` (CSS icons can't render in SVG `<text>`).
  Kept gray-7 (chart-annotation language; faded bar + legend already encode pending — amber would clash
  with the multi-colour faded bars). Updated the stale Term.vue comment.
- `text-2xs` is NOT in the preset (only text-p-xs/text-xs) → used text-xs.
- QA: build 0 · scaffold engine 22/22 · **preview-verified** on 4173: no ⏳ on any route; site-2 "awaiting
  gate" = amber rgb(138,75,8) text-xs dotted underline; GrowthWaterfall "+30%/+20% pending" notes fit with
  NEGATIVE overflow (−11…−58px = inside the SVG, no clip); Board "+90% +80 pending" amber. No console errors.
  Committed f2fdf43, pushed to dev branch; Linear Done.

**Next M8:** COM-60 (chart-mount placeholder/flash) → COM-64 (Proposition band) → COM-59 (print mark) →
chart cluster (48/57/58/47) → COM-66 (More-menu) → COM-62 app-shell (3 PRs, **design call first**) → COM-63
(⌘K) → COM-72 (FormControl, **dark-panel design call**) → COM-69 (vp). Then M8 gate.

## 2026-06-09 — COM-60 (chart-mount placeholder, kill the 1-frame flash) DONE [M8 #13]

**COM-60 (P3, S) — DONE.** FrappeChart.vue now covers the degenerate first paint. frappe-charts
(animate:false) paints a degenerate axis / 0-height bars for ~1 frame before the existing rAF `draw(true)`
corrects it. Added a `ready` ref + a neutral `bg-surface-white` overlay (absolute inset-0, in a `relative`
container with `min-height:(height||240)px`) shown while `!ready`, faded out via `<Transition>` (150ms) once
ready.
- **LATCH (the gotcha):** first cut reset `ready=false` at the top of build(). The Board staircase rebuilds
  shortly after mount (chartHex() colours resolve post-paint → colors watch → build()), which BOUNCED ready
  false→true repeatedly and left the white overlay COVERING the chart ~300ms+ (a screenshot caught a blank
  pale staircase). Fix: NEVER reset ready in build() — initial `ref(false)` covers the mount, the first rAF
  latches it true and it stays; post-mount rebuilds no longer re-hide.
- Preview-verified: Board staircase draws solid (brown #9c4a0c Raiku + slate #6e7a8a median) after a gentle
  150ms fade; Compare grouped bar drew (53 svg children); overlay fades+clears; no console errors. (Screenshots
  taken mid-fade show the chart pale — that IS the placeholder working.)
- QA: build 0 · scaffold engine 22/22 · committed 8c116b6, pushed; Linear Done.

**Next M8:** COM-64 (Proposition band) → COM-59 (print mark) → chart cluster (48/57/58/47) → COM-66 (More-menu)
→ COM-62 (app-shell, design call) → COM-63 → COM-72 (design call) → COM-69. Then M8 gate.

## 2026-06-09 — COM-64 (Proposition hero band diverges from dashboards) DONE [M8 #14]

**COM-64 (P3, S) — DONE.** Proposition.vue Base/Current/Ceiling hero band now diverges from the dashboard
KPI bands: dropped the Current cell's `bg-surface-amber-2` FILL → hairline-only (border gray-1); p-8→p-10
(generous); Fraunces 2.2rem→2.8rem; mb-5/mt-5→mb-6/mt-6. Current stays marked by amber INK on its
"ii / Current · earned" label (no fill block). Dashboards (Overview KPI, PotentialStrip, Board) + the scenario
band below (amber base-scenario cell) UNCHANGED per "keep the repetition elsewhere."
- Preview-verified (light, tall viewport): hero band reads calm/letterpress, no amber fill; the scenario band
  below keeps its amber "Base · 48% kept" highlight — nice contrast (bespoke offer vs working tool).
- QA: build 0 · scaffold engine 22/22 · committed 23a55fd, pushed; Linear Done.

**FINDINGS this issue (preview ENV, not my code):**
1. **Preview screenshot + scroll bug:** screenshots after a window scroll capture bare canvas (blank), not the
   scrolled content; scroll-0 captures work. WORKAROUND: resize the viewport TALL (e.g. 1280×1820) so the whole
   page fits at scroll 0, then screenshot. Also the preview can emulate `prefers-color-scheme: dark`
   (matchMedia=true) → a failed/blank capture renders BLACK. Use `preview_resize colorScheme:'light'` for clean
   captures. (serverId this session: 7a81dde5-… , `comp-studio` on :4173.)
2. **App never sets `color-scheme: light`** (root/body colorScheme=normal). On a dark-OS browser the native
   chrome (scrollbars, date inputs, selects) renders dark on the light app. Pre-existing, NOT introduced here;
   out of COM-64 scope. A 1-line `:root{ color-scheme: light }` in style.css would lock it for light-only v1.
   → flagged to Robin; candidate to fold into COM-69 or a quick polish commit.

**Next M8:** COM-59 (print mark) → chart cluster (48/57/58/47) → COM-66 (More-menu) → COM-62 (app-shell, design
call) → COM-63 → COM-72 (design call) → COM-69. Then M8 gate.

## 2026-06-09 — COM-59 (per-recipient print confidentiality mark) DONE [M8 #15]

**COM-59 (P2, S) — DONE.** App-level print-only running footer (App.vue + style.css `.print-running`):
`display:none` on screen; `position:fixed; bottom:0` inside `@media print` → repeats on every printed page.
Left = "Raiku Labs — Confidential · Discussion draft, not a binding offer" (const); right = route-aware via a
`printRecipient` computed — "Prepared for {selected.a.name} · {date}" on /proposition & /advisors, "Internal
board pack · {date}" on /board, else "Internal · {date}". Date = `toLocaleDateString('en-GB',{day,month:short,
year})`. White band + 0.5pt top hairline masks overlap with page-content bottom. No diagonal watermark (per
issue). Verbatim legal corpus untouched; added `selected` to App.vue's useStudio destructure.
- Verified by forcing the print rule visible on screen (temp injected `<style>`, screenshotted, removed):
  correct left/right, "Prepared for Iraj Ispahani · 9 Jun 2026", display:none on screen, no console errors.
- **Caveat:** the preview can't open the real print dialog, so multi-page repetition + exact margin placement
  are spec-faithful (position:fixed-per-page is documented browser behaviour) but UNVERIFIED in an actual
  print/PDF — Robin to confirm at the gate; trivial to tune (bottom offset / @page margin) if needed.
- QA: build 0 · scaffold engine 22/22 · committed c202caa, pushed; Linear Done.

**Progress: M8 15/23 (4 this session: COM-65, 60, 64, 59).** Next: chart cluster — COM-48 (scatter declutter)
→ COM-57 (breakeven shading) → COM-58 (scannability) → COM-47 (exit slider) → COM-66 (More-menu) → COM-62
(app-shell, design call) → COM-63 → COM-72 (design call) → COM-69. Then M8 gate.

## 2026-06-09 — COM-48 (Board scatter declutter + y-gridlines) DONE [M8 #16]

**COM-48 (P2, M) — DONE.** Board.vue potential-scatter (custom SVG). Three Strategic advisors share base
$5.11M so bubbles + name labels overprinted into a smear.
- Label de-collision: `scatterPlaced` computed places each label greedily (prefer above → fall back below →
  stack upward) avoiding collisions within 36px-x/13px-y; white halo (paint-order:stroke 2.5px) keeps names
  legible over gridlines/neighbours → Martin/Kerim above, Robert below.
- y-gridlines: `niceStep()` + `yTicks` → ~3 dashed gray-2 gridlines + left $ ticks (fUSD, 10px gray-5);
  PAD.l 46→52 for tick room.
- Fill opacity 0.7→0.55 (overlaps read). Hover/focus: `hoverId` ref → @mouseenter/@focusin raises the bubble
  to front (keyed reorder, focus-safe) + stroke ring (var(--ink-gray-9)) + opacity 0.9; keyboard keeps COM-41
  :focus-visible outline.
- Preview-verified: de-collision + 3 gridlines; hover path confirmed (Kerim → stroke, opacity 0.9, raised
  last). No console errors.
- **PREVIEW GOTCHAS (reusable):** (1) async/Promise `preview_eval` HANGS → 30s timeout; do post-Vue-flush
  checks as TWO separate sync evals (dispatch in #1, read in #2). (2) programmatic `.focus()` on an SVG `<g>`
  doesn't trigger `:focus-visible` (keyboard-only) and didn't fire `@focusin` in my test — verify keyboard
  paths by reasoning, mouse paths by dispatching `new MouseEvent('mouseenter')`.

**Next M8:** COM-57 (breakeven/underwater shading on UpsideCurve) → COM-58 (scannability) → COM-47 (exit
slider) → COM-66 (More-menu) → COM-62 (app-shell, design call) → COM-63 → COM-72 (design call) → COM-69.

## 2026-06-09 — COM-57 (UpsideCurve breakeven shading) DONE [M8 #17]

**COM-57 (P2, M) — DONE.** Rewrote the UpsideCurve EQUITY chart frappe-charts → custom SVG (token chart stays
frappe-charts) so it can show the breakeven crossover (frappe-charts has no vertical marker/x-region). Added:
faint `--chart-warning` underwater band over x∈[0,breakeven]; dashed labelled "breakeven" vertical at the exit
where strike is covered (`beClamped`=clamp(strikeBasis/retention,0,topEq)); net-equity area (`--chart-capital`,
flat $0 then climbing); x-ticks ($0/topEq÷2/topEq) + y-ticks (eqYMax/$0). Caption gained "tokens still carry
value". From engine values (eqPct/retention/strikeBasis); engine untouched. Removed dead eqChart/eqColors/
areaOpts. Did NOT touch the Proposition "How to read this" (already conveys it verbatim).
- Preview-verified (Iraj): underwater band + "breakeven" at $186.7M exit, area→$5.88M at $1B, ticks render,
  no console errors. build 0 · engine 22/22 · committed 2150671, pushed; Linear Done.

**Next M8:** COM-58 (Compare/Board scannability) → COM-47 (exit slider) → COM-66 (More-menu) → COM-62
(app-shell, design call) → COM-63 → COM-72 (design call) → COM-69. Then M8 gate.

## 2026-06-09 — COM-58 (Compare scannability) DONE [M8 #18]

**COM-58 (P2, S) — DONE.** Compare.vue. (1) hover row-highlight was ALREADY present (skipped). (2) `matrix`
computed appends Δ% vs the base scenario column to each non-base cell — ↑ ink-green-3 / ↓ ink-red-3 (e.g.
conservative ↓76%, aggressive ↑180%). (3) `<thead>` position:sticky top-0 (bg-surface-white z-[1]); container
overflow-x-auto → overflow-auto max-h-[70vh] (sticks within the box → no app-header overlap; no-op for the
short default table). Board summary row left delta-free (aggregate). Engine untouched.
- Preview-verified: deltas correct colors (red rgb(224,54,54)/green rgb(39,143,94)), thead position:sticky,
  no console errors. build 0 · engine 22/22 · committed 29818b0; Linear Done.

**Next M8:** COM-47 (exit-valuation slider) → COM-66 (More-menu) → COM-62 (app-shell, design call) → COM-63
→ COM-72 (design call) → COM-69. Then M8 gate.

## 2026-06-09 — COM-47 (exit-valuation slider, Ledgy pattern) DONE [M8 #19]

**COM-47 (P2, M) — DONE.** New `ExitSlider.vue` (no-print): range slider across the deliberate scenario range +
Conservative/Base/Aggressive ticks + live readout (net total · net at ~$X exit · eq/tok). PRESENTATION-ONLY —
linearly interpolates the engine's per-scenario values (equity/token/total/exitVal from `c.scen`); EXACT at each
tick (aggressive = $21.4M = the Best-case cell). Default thumb = base scenario (`c.base.key` index; no store
dep). Emits `@exit` (lerped exitVal).
- /advisors: above UpsideCurve; `exitMarker` ref ← @exit → `:marker-exit` → UpsideCurve draws a teal
  (`--chart-uplift`) vertical+dot at that exit on the COM-57 equity SVG.
- /proposition: no-print explorer ABOVE the print-area card (not inside) — recipient explores on screen; the
  printed doc keeps its static PCells (COM-64 doc untouched).
- Preview-verified both views: default Base $7.67M/$500M; drag→Aggressive $21.4M/$750M, marker tracks; no console
  errors. build 0 · engine 22/22 · committed 993a30d; Linear Done.

**M8 19/23 (8 this session).** Remaining: COM-66 (More-menu tidy) · COM-62 (app-shell, **DESIGN CALL**) · COM-63
(⌘K) · COM-72 (FormControl, **DESIGN CALL**) · COM-69 (vp lint). Next: COM-66, then surface the 62/72 design calls.

## 2026-06-09 — COM-66 (More-menu tidy + Share button) DONE [M8 #20]

**COM-66 (P3, S) — DONE.** App.vue header. Split the flat 6-item ellipsis menu: (1) new labeled "Share"
Dropdown next to Saved (lucide-share-2) surfacing Copy to clipboard + Export JSON; (2) overflow ⋯ keeps
Paste/Export CSV/Import as a group + destructive "Reset to baseline" ISOLATED in its own frappe-ui Dropdown
group (renders a divider between groups — confirmed). Native `title` tooltips on Share + ellipsis (ellipsis
keeps aria-label). Engine untouched.
- **frappe-ui Dropdown groups (reusable):** `:options="[{group, hideLabel:true, items:[...]}, {...}]"` renders
  a divider between groups (verified on preview — Reset sits below a divider).
- Preview-verified: Share in header, More-menu Reset divided/isolated, no console errors. build 0 · engine
  22/22 · committed d058b21; Linear Done.

**M8 20/23 (9 this session).** Remaining: COM-69 (vp lint) · COM-62 (app-shell, **DESIGN CALL**) · COM-63 (⌘K)
· COM-72 (FormControl, **DESIGN CALL**). Next: try COM-69 (vp), then surface the 62/72 design calls to Robin.

## 2026-06-09 — COM-69 (vp check green gate) DONE [M8 #21]

**COM-69 (P3, S) — DONE.** `vp check` now EXITS 0. The only thing failing it was vp's formatter wanting to
reformat the FROZEN engine.ts (616-line expansion) + the generated *.d.ts. Fix: `scaffold/.prettierignore`
(`src/engine.ts` + `*.d.ts`) — **vp's formatter HONORS .prettierignore** (key finding). Also vp-formatted this
session's touched source (ExitSlider/FrappeChart/UpsideCurve/VestingTimeline/Board — small wrap-only diffs) +
removed 2 unused imports (fUSD/fPct) from store.ts.
- **vp 0.1.24 config findings (REUSABLE):** formatter honors `.prettierignore`; oxlint does NOT honor
  `.oxlintrc.json` ignorePatterns (tried `src/engine.ts` + broader `**/engine.ts` — engine.ts lint warnings
  persisted) → removed the dead .oxlintrc.json. `vp check --no-fmt`/`--no-lint` flags exist; NO per-file
  format-ignore flag (use .prettierignore). vp config hint: `lint.options.typeCheck` (location unconfirmed).
- **Residual:** ~10 ADVISORY warnings (no-unused-vars/no-useless-escape) on the FROZEN engine.ts +
  engine.test.mjs — vp check still EXITS 0 (warnings don't fail). Can't clear (frozen). Documented.
- **PROCESS NOTE:** this session's per-issue gate was build-only (followed the handoff's no-vp assumption) so
  source format-drift accumulated; COM-69 cleaned it. FUTURE local sessions: run `vp check --fix` per issue
  (revert engine.ts + .d.ts after) to avoid drift.
- QA: vp check EXIT=0 · build 0 · engine 22/22 both · committed 4442c58, pushed; Linear Done.

**M8 21/23 (10 this session: 65,60,64,59,48,57,58,47,66,69).** Remaining (ALL gated): COM-62 (app-shell, 3 PRs
— **DESIGN CALL**: sidebar IA / nav grouping; absorbs COM-67 + COM-63 board-switcher) · COM-63 (⌘K palette
remainder) · COM-72 (FormControl — **DESIGN CALL**: dark Configure panel). Surfacing the 62/72 design calls.

## 2026-06-09 — Robin's design calls + COM-62 (left-sidebar app shell) DONE [M8 #22]

**Robin's calls (AskUserQuestion):** COM-62 nav = **workflow groups** (overrides the issue's older Internal/
Share wording); COM-72 = **lighten the Configure dark panel to a light surface** then standard FormControl;
**push on now** (build the remaining 3 this session, not a continuation).

**COM-62 (P2, L) — DONE.** Replaced the 6 top-tabs with the frappe-ui left-sidebar IA. App.vue rewritten:
- **Sidebar** (w-60; `lg:sticky` desktop / mobile off-canvas drawer w/ scrim + CSS hamburger, closes on
  navigate): Raiku Labs + Internal badge; board-switcher (Saved → Mgr) + Case selector; nav grouped
  **Board** [Overview, Board, Compare] / **Advisor** [Advisors, Proposition]; footer = Configure + Share + ⋯.
- **Thin sticky app-header**: "Studio › view › advisor" breadcrumb + `#app-header` teleport target + the
  storage/budget Alerts.
- **PageHeader** keeps title/desc in the body hero + TELEPORTS #actions to #app-header on desktop; a
  module-level `matchMedia("(max-width:1023.98px)")` flag (one listener) disables the teleport <lg so actions
  render in-body (the thin bar crowds on mobile). Auto-migrates Overview/Board/Compare. Advisors/Proposition
  keep their multi-control tool rows in-body.
- **Absorbs COM-67** (grouping = the sidebar sections → COM-67 marked Done) + COM-63's board-switcher (= the
  sidebar Saved button → COM-63 reduces to the ⌘K palette).
- Preview-verified all 6 views render; Board actions app-header(desktop)/in-body(mobile); mobile drawer opens;
  3-level breadcrumb resolves; no console errors. Committed d127d72 (shell) + 00a5dea (teleport). build 0 ·
  engine 22/22. Linear: COM-62 + COM-67 Done.
- **Preview reuse note:** the `comp-studio` (vite preview :4173) server DROPPED mid-session → `preview_start`
  again (new serverId 0a287ac7). Desktop nav via `location.href='/route'` works (vite preview SPA fallback).

**M8 ~22/23 (COM-67 absorbed; reconcile exact count at gate).** Remaining: COM-72 (lighten Configure + FormControl)
· COM-63 (⌘K palette). Next: COM-72, then COM-63, then GATE M8.

## 2026-06-09 — COM-72 (lighten Configure + FormControl) DONE [M8 #23]

**COM-72 (P3, M) — DONE.** (1) **Lighten:** Configure.vue root dropped `data-theme="dark"` + the full-bleed
wrapper (-mx/-my/min-h) → standard LIGHT surface (inputs use semantic tokens → lightens cleanly; now matches the
app). Inner container simplified to `space-y-6` (main already provides max-w-7xl/padding → no double-pad).
(2) **FormControl:** Advisors profile bare inputs/Selects → frappe-ui FormControl — Name(text), Sector/Granted/Tax
(select), Start date(date), Notes(textarea); label association replaces COM-40's aria-labels. NumIn kept for
Engagement. Removed the now-unused Select import.
- Preview-verified: Configure light + all sections render; Advisors profile = labeled FormControl fields with
  correct values; no console errors. build 0 · engine 22/22 · committed 86fc5ef; Linear Done.
- **Scope note:** Configure's many round/scenario/tier/milestone inputs were NOT converted to FormControl (now
  light + mostly NumIn; field-by-field FormControl across Configure is the incremental "fuller adoption").

**Next: COM-63 (⌘K command palette) — the LAST M8 issue. Then GATE M8.**

## 2026-06-09 — COM-63 (⌘K command palette) DONE — ★ M8 COMPLETE

**COM-63 (P3, M) — DONE.** Board-switcher half shipped with COM-62 (sidebar Saved). Remainder = the ⌘K palette:
new `CommandPalette.vue` (mounted globally in App.vue) — Cmd/Ctrl+K, or the sidebar "Search ⌘K" trigger via an
`open-command-palette` window event (mobile/no-keyboard) — opens a searchable grouped list: Go to (routes) ·
Advisors (select+open) · Boards (loadBoard) · Actions (copy / export JSON / export CSV / import / reset-with-
confirm). Substring filter; ↑↓ nav / ↵ run / esc close; Teleport-to-body overlay (z-60); own hidden file input
for Import. Pure UI over the store.
- Preview-verified: opens, full list, filter ("reset"→Reset only), run Compare → navigates + closes, no console
  errors. build 0 · engine 22/22 · committed d3e9e6a; Linear Done.

**★ M8 COMPLETE — all 23 issues Done.** This session shipped **14**: COM-65, 60, 64, 59, 48, 57, 58, 47, 66, 69,
62 (+67 absorbed), 72, 63. All on `claude/relaxed-faraday-a9f377` / PR #2 (draft → frosty). Engine 22/22
throughout; every issue preview-verified on the live `comp-studio` :4173.

**GATE (next):** confirm build 0 + both engine copies 22/22 + `vp check` exit 0 → mark PR #2 ready + request
Copilot review → **Robin reviews the Vercel preview, THEN the merge to frosty deploys prod (NOT auto-merged —
outward-facing, Robin's explicit call).**

## 2026-06-09 — M9 KICKOFF + COM-97 (right-align numerics) DONE [M9 #1]

**M9 kickoff.** New milestone **M9 · UX/UI v2** (66 issues, COM-73→COM-138; all Backlog at start). Ran an
ultracode **readiness sweep** (6 parallel readers) before building: engine **22/22** both copies, pins locked
(frappe-ui 0.1.278 / frappe-charts 1.6.2 exact), M9 backlog ungroomed. **Robin's calls:** (1) track = THIS Vue
SPA is live — the sweep's "no Vercel project for comp-studio" finding is the **COM-71** personal-scope MCP gap
(prod is `comp-studio-one` under nordnes-personal, invisible to the Raiku-Labs-scoped MCP), not a migration to
the separate `raiku-advisor` Next.js monorepo; (2) integration branch = **`claude/frosty-pasteur-8cf1db`** (still
origin/HEAD + prod). Robin = **sole merge actor**. NOTE: this worktree's memory.md is off frosty (5e5e3ec),
behind origin/main's M9 kickoff commit (a4c9780) — pre-existing main↔frosty divergence; not reconciled here.

**COM-97 (P2 High, S ~25 LOC) — DONE.** Right-align every numeric column in the **Board** roster + **Compare**
matrix: added `text-right` to numeric `<th>`/`<td>` and the footer/board-total cells (Base eq, Earned, Ceiling,
each scenario Net + its Δ%, Cash/yr); Advisor/Tier/action cells stay left. `tabular-nums` was already present →
magnitudes now line up down each column and totals sit under the columns they total. **Deliberate impeccable
improvement over the reference** (the reference TSX does NOT right-align — sanctioned by the M9 impeccable lens);
labels / columns / IA / legal corpus unchanged. 2 files, +25/−21 (Board.vue, Compare.vue). No engine, no
`app.use(FrappeUI)`, no data layer.
- **Verified:** `vp check` 0 errors (11 warnings ALL in frozen `engine.ts` = expected; a separate pre-existing
  26-file prettier-drift across docs/engine/generated/reference was left untouched — not COM-97). Both engine
  tests **22/22**. `npm run build` exit **0**. Preview :4173 DOM-verified (computed `text-align: right` on every
  numeric header/cell/total; Advisor/Tier resolve `start`) + screenshots of Board & Compare; **no console
  errors**. Reverted build-regenerated `scaffold/components.d.ts` churn before commit.
- Branch `robinandre/com-97-…` off frosty; PR into frosty (`Fixes COM-97`). **STOPPED at the merge gate — Robin
  reviews the preview + merges.** Linear flips to Done on merge.

**Next (M9 first-wins, all un-gated):** COM-98 (freeze Compare identity col) · COM-123 (full-precision $M bars) ·
COM-109 (`color-scheme`) · COM-132 (glossary fix) · COM-126 (eyebrow constant). Gated calls still pending Robin:
COM-104/105/96 (frappe-ui Sidebar/CommandPalette/ListView adopt), COM-121 (typography), COM-110 (dead dark
branch), COM-87 (engine RFC — recommend defer).

## 2026-06-09 — COM-98 (freeze Compare identity column) DONE [M9 #2]

**COM-98 (P2 High, S ~15 LOC) — DONE.** The Compare matrix is `min-width:760px` in an `overflow-auto` box; M8
made the header sticky vertically but the Advisor column slid off under horizontal scroll, anonymizing every
row. Fix: `sticky left-0 z-[2] bg-surface-white border-r border-outline-gray-1` on the first `<th>`/`<td>` of
each row; the corner header gets **`z-[3]`** (above the sticky thead's `z-[1]` + the frozen column's `z-[2]`);
the Board-total first cell uses `bg-surface-amber-2` to match its amber row. 1 file, +15/−3 (Compare.vue). No
engine, no data layer. **Stacked on COM-97** (branched off its tip; right-align intact).
- **Verified:** engine **22/22** both · `npm run build` exit **0** · `vp check` clean for Compare.vue (the
  pre-existing 26-file format drift untouched; vp caches lint incrementally so the 2nd-run log shows only the
  format phase — no new findings reference my file). Preview :4173 at **560px** (forces overflow): scroll test
  proved it — Advisor header+cell held at `left:13` before & after `scrollLeft`, numeric cell moved `193→-49`
  under them; corner `position:sticky/left:0/z-3`, body cell `sticky/z-2`. Screenshot of the scrolled-right
  state shows the frozen identity column (+ amber Board cell). No console errors. Reverted `components.d.ts`.
- Branch `robinandre/com-98-…` off the COM-97 branch; PR **stacked onto COM-97** (`Fixes COM-98`). **STOPPED at
  the merge gate — Robin merges COM-97 then COM-98 in order.**

**Next first-wins:** COM-123 (full-precision $M bars, ~5 LOC) · COM-109 (`color-scheme`) · COM-132 (glossary) ·
COM-126 (eyebrow constant).

## 2026-06-09 — COM-123 (full-precision $M bars) DONE [M9 #3]

**COM-123 (P2 High, S ~5 LOC) — DONE.** The Compare grouped bar plotted `Math.round(total/1e6)`, so a $400k
advisor rendered as a 0-height (missing) bar and $1.49M looked the same as $1.0M — the chart silently disagreed
with the matrix right above it. Fix: drop `Math.round` on the `values` map (Compare.vue:42-43) → plot exact
`total/1e6`; tooltip already does `fUSD(v*1e6)` and the y-axis auto-scales to decimal $M ticks. 1 file, +4/−3
(Compare.vue). Engine-safe (geometry only). **Stacked on COM-98.** Principle: round the displayed string, never
the geometry.
- **Verified:** engine **22/22** both · build exit **0** · `vp check` clean for Compare.vue. Preview :4173
  /compare (desktop): Iraj's sub-$1M bars (≈0.03 / 0.96 / 2.21) now render distinct instead of 0/1/2; chart
  agrees with the matrix; no console errors. Reverted `components.d.ts`.
- Branch `robinandre/com-123-…` off COM-98; PR **stacked** (`Fixes COM-123`). **STOPPED at the merge gate.**

**Next first-wins:** COM-109 (`color-scheme` on :root) · COM-132 (glossary "awaiting gate" reword) · COM-126
(confidentiality eyebrow constant).

## 2026-06-09 — COM-109 (color-scheme on :root) DONE [M9 #4 — last High first-win]

**COM-109 (P2 High, S ~6 LOC) — DONE.** `color-scheme` was declared nowhere, so a dark-OS UA painted dark
calendar popups / scrollbars / autofill on the light Espresso surface. Fix: `color-scheme: light` on `:root`
+ `color-scheme: dark` on the existing dormant `[data-theme="dark"]` block (style.css) + `<meta
name="color-scheme" content="light">` in index.html (pre-CSS paint). 2 files, +6 (style.css, index.html). The
dark line rides the ALREADY-EXISTING dormant block, so it does NOT pre-empt the gated **COM-110** keep/delete
call. **Stacked on COM-123.**
- **Verified:** engine **22/22** both · build exit **0** · `vp check` clean for the 2 files. Preview :4173
  /configure under **emulated dark OS** (`prefers-color-scheme: dark` true): computed `color-scheme` resolves
  **light** on :root AND body, meta = light → native chrome stays light. No console errors. Reverted
  `components.d.ts`.
- Branch `robinandre/com-109-…` off COM-123; PR **stacked** (`Fixes COM-109`). **STOPPED at the merge gate.**

**★ All 4 HIGH-priority M9 first-wins shipped this session (COM-97, 98, 123, 109) as the stack #3→#4→#5→#6.**
Remaining first-wins (Low/Med, un-gated): COM-132 (glossary reword, constants.ts) · COM-126 (confidentiality
eyebrow constant; constants.ts + Proposition.vue + App.vue). Then the GATED cluster needs Robin's calls:
COM-104/105/96 (frappe-ui Sidebar/CommandPalette/ListView adopt-vs-custom), COM-121 (typography),
COM-110 (dead dark branch keep/delete), COM-87 (engine RFC — recommend defer).

## 2026-06-09 — COM-132 (glossary "awaiting gate" fix) DONE [M9 #5]

**COM-132 (P4 Low, S ~1 LOC) — DONE.** The `awaitingGate` glossary entry defined the term using another
undefined term ("vested value") and conflated milestone GATING with time-based vesting. Reworded
`constants.ts:82` to: "Earned, but its milestone gate hasn't been reached yet — so the uplift doesn't count
toward the package's current value until the company hits that milestone." Presentation glossary copy (NOT the
legal corpus). 1 file, 1 line (constants.ts). **Stacked on COM-109** (kept the whole M9 run a single linear
stack so memory.md never conflicts at merge — I'd briefly branched it off frosty, then re-based onto COM-109).
- **Verified:** engine **22/22** both · build exit **0**. Verified via production-bundle grep (the tooltip
  text doesn't screenshot well): new string present in `dist/assets/*.js`, old "toward vested value" phrasing
  gone. `vp check` clean for constants.ts.
- Branch `robinandre/com-132-…` off COM-109; PR **stacked** (`Fixes COM-132`). **STOPPED at the merge gate.**

**Last first-win:** COM-126 (confidentiality eyebrow constant — constants.ts + Proposition.vue + App.vue).

## 2026-06-09 — COM-126 (confidentiality eyebrow constant) DONE [M9 #6 — ★ all first-wins done]

**COM-126 (P3 Med, S ~10 LOC) — DONE.** The confidentiality eyebrow rendered 3 ways: on-screen Title Case
("Discussion Draft"), clipboard lowercase ("Confidential discussion draft"), print sentence case. Defined ONE
canonical `CONFIDENTIAL_EYEBROW = "Confidential · Discussion draft"` in constants.ts and reused it:
Proposition on-screen eyebrow (was "Discussion Draft") + clipboard `propText` (`${EYEBROW} · ${name}`) + App
`PRINT_CONFIDENTIAL` (template-literal sources the eyebrow; output string byte-identical). **The locked legal
sentence ("A discussion draft, not a binding offer…") was NOT touched** — verified the full diff contains
neither legal sentence (Proposition:50, App:340), and both remain present in bundle + rendered page. 3 files,
+8/−3 (constants.ts, Proposition.vue, App.vue). **Stacked on COM-132.**
- **Verified:** engine **22/22** both · build exit **0** · `vp check` clean. Preview :4173 /proposition runtime
  read: on-screen eyebrow = "Confidential · Discussion draft" ✓; hidden `.print-running` span =
  "Raiku Labs — Confidential · Discussion draft, not a binding offer" ✓ (byte-identical); legal sentence
  present ✓. No console errors. Security/legal: no security surface (a string constant) + legal corpus proven
  intact via full diff → formal /security-review not warranted; targeted review done inline. Reverted
  `components.d.ts`.
- Branch `robinandre/com-126-…` off COM-132; PR **stacked** (`Fixes COM-126`). **STOPPED at the merge gate.**

**★★ ALL 6 M9 FIRST-WINS SHIPPED this session as one linear stack #3→#8 into frosty:** COM-97 · 98 · 123 · 109
(High) · 132 (Low) · 126 (Med). Each: engine 22/22, build 0, preview-verified, ≤450 LOC, no engine/data-layer,
PR opened + STOPPED at merge gate (Robin merges in order; GitHub auto-retargets to frosty as each lands).
**NEXT = the GATED cluster — needs Robin's calls before the L-sized work:** COM-104/105/96 (frappe-ui
Sidebar/CommandPalette/ListView adopt-vs-custom + mobile-drawer behaviour), COM-121 (Fraunces/IBM-Plex
typography), COM-110 (dead [data-theme=dark] branch keep/delete), COM-87 (per-advisor engine RFC — recommend
DEFER, keep engine frozen). Also still open: COM-71 (Vercel MCP personal-scope re-auth) blocks my seeing PR
previews; Robin reviews Vercel previews directly.

## 2026-06-09 — ★ M9 FIRST-WINS MERGED TO PROD + gated decisions resolved + PD1 queued

**Robin lifted the merge gate for this batch and instructed "merge all open PRs."** Merged all 6 first-win PRs
(#3→#8) into `frosty` (prod) via the GitHub API, stacked-retarget order: #3 COM-97 (9af2935) → #4 COM-98
(4ae4d07) → #5 COM-123 (8a36a9b) → #6 COM-109 (57457e1) → #7 COM-132 (14e4297) → #8 COM-126 (c3e602d). frosty
HEAD = **c3e602d**. **Post-merge verified** (ultracode sweep): all 6 merges present, frosty content byte-identical
to the stack tip, `node scaffold/engine.test.mjs` + `node engine/engine.test.mjs` both **22/22**, `npm run build`
exit **0** — prod green. **Note:** the `Fixes COM-NNN` keywords did NOT auto-flip Linear (its automation keys off
`main`/lag), so I set all 6 issues **Done** manually via save_issue. M9 milestone now **6 Done / 60 Backlog**.
NO merge-gate hook was ever installed (settings.json denies only force-push + engine.ts-read) — the gate has been
process discipline all along.

**Gated-cluster decisions (Robin, all = my recommendation) — now recorded here + in ~/.claude memory
[[m9-gated-decisions]]:** COM-87 = **DEFER** (engine frozen) · COM-104 = **adopt frappe-ui Sidebar, keep
scrim-drawer on mobile** · COM-105 = **full rebuild** on CommandPalette + KeyboardShortcut · COM-96 = **local
RosterTable** (option B, not ListView) · COM-121 = **remove dead IBM Plex Mono + sentence-case group labels**
(keep Fraunces) · COM-110 = **delete** the dead [data-theme=dark] block + fix NumIn comment · COM-71 previews =
**Robin reviews** (verify on :4173). Next work = **PD1 spine**.

**Wrote the new-session run-prompt `ULTRACODE_M9_PD1.md`** (complete: post-merge state, the 8 decisions,
non-negotiables, per-issue DoD, the full PD1 detail with files/plans + the engine-boundary tripwire, gotchas,
branch/deploy). Committed with this entry to frosty.

**NEXT (new session): PD1 spine, build order 73 → 77 → 74 → 75 → 76.** COM-73 (consolidate the per-advisor
package; move `upliftStartMonth`'s editor out of VestingTimeline into Advisors) needs **NO engine edit** —
`upliftStartMonth` is already a first-class field on the Advisor interface (engine.ts:18). All PD1 is
presentation/state over the frozen engine via `setPath`; snapshot locally (pushUndo is module-private). Then PD2
(COM-82→81→85→83→84→86), clean-layout (88/89/90/95), the adopt cluster (per decisions above), then
visual/charts/editorial/hardening. STOP at the merge gate unless Robin says merge.

## 2026-06-09 — COM-73 (consolidate the per-advisor package editor; move upliftStartMonth in) DONE [M9 PD1 #1]

**COM-73 (P2 High, ~37 LOC actual) — DONE.** First PD1-spine issue: made the per-advisor package one coherent
editor. Renamed the three left-column section eyebrows to **Identity / Base grant / Performance**
(presentation copy only — Profile→Identity, "Base — denomination"→"Base grant", "Performance uplift"→
"Performance"; legal/benchmark strings untouched). **Moved `upliftStartMonth`** out of the `VestingTimeline`
chart header — previously the ONLY place it was editable, buried in the collapsed "+ Show detail" expander —
into the Performance section as a labelled NumIn beside the capital fields, wired via
`setField('upliftStartMonth', v)` (= existing `setPath(['advisors', i, k], v)`). `VestingTimeline` now shows a
**read-only marker** ("Uplift earned · month N") and drops its now-dead `NumIn` import + `setPath`/`idx`
wiring; chart math unchanged (still reads `clamp(sel.upliftStartMonth ?? 6, 0, 48)`). 2 files, +19/−18
(`Advisors.vue`, `VestingTimeline.vue`). **ENGINE UNTOUCHED** — `upliftStartMonth` is already a first-class
`Advisor` field (engine.ts:18); pure UI relocation over the frozen engine via `setPath`. New field uses the
bare-label idiom so **COM-77** can FormControl-wrap it next.
- **Verified:** both engine tests **22/22** (`node scaffold/engine.test.mjs` + `node engine/engine.test.mjs`)
  · `( cd scaffold && npm run build )` exit **0** · `vp check` **0 errors** for my 2 files (oxfmt-formatted via
  `vp fmt <paths> --write`; the pre-existing ~26-file drift + 12 frozen-engine warnings untouched/expected).
  Preview :4173 /advisors: sections read Identity / Base grant / Performance ✓; relocated NumIn edits live
  (6→12 → Performance field + chart read-only marker + persisted localStorage ALL tracked to 12, then reset to
  6) ✓; expand "+ Show detail" → `VestingTimeline` header is read-only (no input) ✓; no console errors.
  Screenshot captured. Reverted `components.d.ts` build churn before commit.
- /code-review: clean (presentation-only; no auth/tenancy/money/legal surface → no /security-review). Branch
  `robinandre/com-73-…` off **frosty** (first PD1 issue; first-wins already merged to frosty), PR **`Fixes
  COM-73`**. **STOPPED at the merge gate — Robin merges.**

**Next PD1:** COM-77 (FormControl `:description` + clamp `:error` on load-bearing fields) → COM-74 (dirty/Saved
+ per-advisor Revert) → COM-75 (Board roster kebab: tier select + edit) → COM-76 (promote package editing into
a Dialog/drawer; watch the 450 cap). Then PD2 (COM-82→81→85→83→84→86), clean-layout, the adopt cluster.

## 2026-06-09 — COM-77 (FormControl :description + transient clamp :error feedback) DONE [M9 PD1 #2]

**COM-77 (P3 Med, ~37 net LOC) — DONE.** Stacked on COM-73. Teach + validate at the package input boundary.
- **API finding (matters for COM-76):** frappe-ui **FormControl has NO `error` prop/slot and NO default slot
  for a custom control** — it renders its own input by `type`, exposing only `label` + `description` (prop or
  `#description` slot, rendered `text-p-xs text-ink-gray-5`). So COM-77's literal "wrap NumIn in FormControl /
  FormControl `:error`" is NOT achievable; implemented the **intent** instead. `FormLabel` IS exported from
  frappe-ui (renders `<label class="block text-xs text-ink-gray-5">`).
- **`:description`** on the 3 load-bearing FormControls — Granted at → "Sets the strike basis & dilution path";
  Start date → "Anchors vesting & TGE offset"; Tax residency → "Recorded for the offer; not modelled". Native
  FormControl support.
- **NumIn `clamp` emit** added to `commit()` (presentation-only; `clamp` stays imported from the engine): when
  a value is coerced (`c !== v`) it emits a teaching message — "Adjusted to {val} (allowed {min}–{max})", or
  one-sided "(min …)"/"(max …)" for unbounded ends. Refactored `disp()` to share a `fmtVal()` formatter.
- **Transient red helper** `<p role="alert" class="text-p-xs text-ink-red-3">` under the field (Advisors holds
  `clampMsgs` reactive + per-key 4s `clampTimers`). `role="alert"` → screen readers announce the coercion
  (issue's a11y label). The 3 bare-label NumIn rows (Engagement yrs / Annual value / Annual cash) converted to
  a **FormLabel + `space-y-1.5` + error `<p>`** stack so the card reads as one consistent FormControl stack.
  2 files, +49/−12 (`Advisors.vue`, `NumIn.vue`).
- **Verified:** engine **22/22** both · build **0** · `vp check` **0 errors** for my files. :4173 /advisors: 3
  descriptions render ✓; Engagement label now FormLabel (`label.text-ink-gray-5`) ✓; clamp 99→10 → "Adjusted to
  10 (allowed 1–10)", 0→1 → "Adjusted to 1 (allowed 1–10)", `<p role="alert">` ✓ (captured on rAF to beat the
  4s transient timer — the message is correctly short-lived); no console errors. Reverted `components.d.ts`.
- /code-review clean (presentation-only; no auth/tenancy/money/legal → no /security-review). Branch
  `robinandre/com-77-…` **stacked on COM-73**; PR **`Fixes COM-77`** (base = COM-73 branch; GitHub
  auto-retargets to frosty when COM-73 merges). **STOPPED at the merge gate.**

**Carry into COM-76:** when extracting `PackageEditor`, move the FormLabel+description/error stack AND the
`clampMsgs`/`onClamp` helper with it. **Next:** COM-74 (dirty/Saved + per-advisor Revert).
