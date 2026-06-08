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
