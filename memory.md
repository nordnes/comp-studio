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
