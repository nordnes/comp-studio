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
