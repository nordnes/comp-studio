# Claude Code prompt — finish the Advisor Comp Studio UX/UI uplift (M8 continuation, continuous run)

Paste this into a fresh Claude Code session at `/Users/nordnes/dev/comp-studio` (remote
**https://github.com/nordnes/comp-studio**). Run it as **one continuous goal**: work the **remaining M8**
backlog (22 issues) issue-by-issue, closing each one out fully — **In Progress → implement → QA gate green →
mark Done + push to prod → log `memory.md`** — until M8 is complete. **Resume at COM-52.**

> **Stack direction (UNCHANGED, post-gate 2026-06-08):** `frappe-ui` is **ADOPTED as-is** (Espresso/Inter);
> `frappe-charts` is the primary chart engine; `engine/engine.ts` is **FROZEN**. v1 is **SHIPPED + live**;
> **M7 (the a11y floor) is COMPLETE + gated**; **`chore: vp format` has landed**; **M8 is 4/23 done**
> (COM-46/53/54/55). This milestone is a **presentation-only uplift** — no engine logic, no backend, no new
> product surface. The locked stack is **not** re-litigated.

---

## 0. ⚡ Read first — current state (as of 2026-06-09)

- **Live:** https://comp-studio-one.vercel.app/ — Vercel team **Nordnes Personal**, project `comp-studio`,
  Root Directory `scaffold`, framework Vite, build `npm run build`, output `dist`. **Production deploys from
  `claude/frosty-pasteur-8cf1db`** (also the GitHub default branch). `main` is local-only / behind / not on origin.
- **Shipped to prod so far:** v1 (M0–M5) · **M7 COMPLETE** (COM-37…45, milestone 100% + gated) ·
  **`chore: vp format`** · **M8: COM-46** (global scenario toggle, the top lever) / **COM-53** (Toast) /
  **COM-54** (Alert) / **COM-55** (TabButtons).
- **Read `memory.md`** (repo root) FIRST — it is the dated cross-session log with every decision + gotcha from
  the M7/M8 build. Then `CLAUDE.md`, `IMPLEMENTATION_PLAN.md`, `research/D-feature-inventory.md`.
- **Resume at COM-52.** M8 has **22 issues remaining** (the 19 original COM-47…68 minus the 4 done, plus the 3
  new issues COM-69/70/72 filed at the last session's close).

## 1. Worktree & branch (RESOLVED — FLOW-A)

- **Work in the prod-branch worktree:** `/Users/nordnes/dev/comp-studio/.claude/worktrees/frosty-pasteur-8cf1db`
  (branch `claude/frosty-pasteur-8cf1db`). **If the harness spawns you in a different isolated worktree** (a fresh
  `.claude/worktrees/<name>` that may sit at the stale **Phase-0** commit `0115755`, 18 behind v1, with only
  `Overview.vue`/`Stub.vue`/`FrappeChart.vue`), immediately
  **`EnterWorktree({path: "/Users/nordnes/dev/comp-studio/.claude/worktrees/frosty-pasteur-8cf1db"})`** to re-root
  onto the prod branch. (The last two sessions hit exactly this — do not build in the Phase-0 worktree.) Verify:
  6 views + 15 components under `scaffold/src/`, `git rev-parse HEAD` ahead of `0115755`, engine 22/22.
- **FLOW-A (Robin's confirmed call):** commit each finished issue **straight onto `claude/frosty-pasteur-8cf1db`**
  and push → **each push redeploys PRODUCTION.** Gate strictly (build + engine 22/22 + visual) before every push.
  Do NOT do FLOW-B / COM-36 (Robin chose FLOW-A).
- **Git/gh/push REQUIRE `dangerouslyDisableSandbox: true`** (auth/ssh + `~/.config/gh` are sandbox-denied; commits
  also cross the read-denied `engine/engine.ts`). Use `git -c core.fsmonitor=false …` to mute the recurring
  `fsmonitor_ipc__send_query` noise. Commit footer MUST end with:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **Preview MCP wrinkle:** the preview MCP server stays pinned to the session's *original* worktree (not the one
  you `EnterWorktree` into). If `preview_start("comp-studio")` reports no `.claude/launch.json`, create it at the
  path it names with an **absolute** `sh -c` command:
  `{"name":"comp-studio","runtimeExecutable":"sh","runtimeArgs":["-c","cd /Users/nordnes/dev/comp-studio/.claude/worktrees/frosty-pasteur-8cf1db/scaffold && exec npm run preview -- --port 4173 --strictPort"],"port":4173}`.
  Dev (5173) can't bind in this sandbox — **always use preview** (serves `dist`; run `npm run build` before each reload).

## 2. LOCKED non-negotiables (preserve in EVERY issue)

- **Engine frozen.** `engine/engine.ts` (→ `scaffold/src/engine.ts`) is the ONLY place money is computed.
  Type-only tweaks allowed; **NO logic changes**; never reimplement formulas; **views never recompute
  value/dilution/strike/gating inline** — they read engine outputs. `node engine.test.mjs` (from `scaffold/`) AND
  `node engine/engine.test.mjs` (from root) must stay **22/22** (anchors: bridge 57,217 FD → Series C 118,707;
  strike $1,572.95; base TGE FDV $600M; board net base ~$23M). The root `engine/engine.ts` is sandbox read-denied
  (owner root, mode 0) — don't try to read/edit it via shell. **COM-56** must MOVE `SCEN_COLORS` out of
  `scaffold/src/engine.ts` into `constants.ts` (re-point the `Compare.vue` import) — a move-out, not an in-place edit.
- **NEVER `app.use(FrappeUI)`** (opens socket.io + the Frappe RPC layer). Import frappe-ui components **by name**.
  The frappe-ui **data layer is OUT OF SCOPE** (no createResource/useList/call/initSocket/frappeRequest, no
  `/api/method/…`). State stays local: `store.ts` over the frozen engine, persisted to localStorage.
  `FrappeUIProvider` is mounted only as the **ToastProvider** with `<Dialogs/>` (socket-safe — powers
  `confirmDialog`/`toast`) and stays.
- **frappe-charts 1.6.2 — bare import, NO css** (`import { Chart } from 'frappe-charts'`; 1.6.2 ships zero css,
  styles self-inject; importing its css 404s + breaks the build). `scatter` is NOT implemented — scatter is custom
  SVG. Valuation staircase = grouped **bar**.
- **Exact/locked pins — do NOT upgrade:** `frappe-ui 0.1.278` · `frappe-charts 1.6.2` · vue ^3.5 · vue-router ^4 ·
  vite ^5 · @vitejs/plugin-vue ^5 · **tailwindcss ^3.4 (NOT v4; tailwind.config.js stays ESM)** · typescript ^5 ·
  vue-tsc ^2. Do NOT add `@headlessui/vue` (frappe-ui bundles it + `@floating-ui/vue` + `reka-ui` + `vue-sonner`).
- **Confidential + net-of-strike framing.** Internal & confidential; every equity figure **net of strike**;
  output is a **"discussion draft, not a binding offer."** Legal corpus + benchmark strings ported **verbatim** —
  do not alter their wording when restyling. `reference/advisor-comp-studio.tsx` is the UX/behaviour/legal/IA source
  of truth (visual = Espresso; behaviour/labels/caveats/IA match the reference).
- **Wiring guardrails (build-green — don't regress):** `vite.config.ts` = `frappeui({frappeProxy:false,
  jinjaBootData:false,buildConfig:false})` + `vue()`, `build:{outDir:'dist',target:'es2020'}`,
  `optimizeDeps:{include:['feather-icons']}`. ESM `tailwind.config.js` with `frappeUIPreset from 'frappe-ui/tailwind'`
  + content glob incl. `./node_modules/frappe-ui/src/**`. `main.ts` imports `frappe-ui/style.css` **before**
  `./style.css`; **no** `app.use(FrappeUI)`.
- **Tables stay plain token-styled `<table>`** (not frappe-ui ListView — resource/backend bound). **CSV import stays
  `<input type=file>` + FileReader** (not frappe-ui FileUploader — targets Frappe `/api/method/upload_file`).
- **Use the `frappe-ui` Skill** for component/token/pattern selection; **`/impeccable`** for visual passes;
  `design:accessibility-review` for a11y. Default to semantic tokens (`bg-surface-*`, `text-ink-*`,
  `border-outline-*`); never raw `bg-gray-*`. The Skill's generic SETUP.md is Frappe-backend-oriented and WRONG
  here — the backendless recipe in `research/EMPIRICAL.md` / `TECH_BRIEF.md` §2c wins.
- **≤ 450 LOC per COM-* issue** (split into a Linear sub-issue under the same milestone if larger). **One issue =
  one push; engine 22/22 + build green before push; append a dated `memory.md` entry per issue AND per milestone.**

## 3. ★ The per-issue Definition of Done (hard loop — do not skip steps e/f/g)

For each `COM-XX`:
1. **(a) Mark In Progress.** `save_issue({ id: "COM-XX", state: "In Progress" })` (or state id
   `4a7e54ac-2c8d-4932-b46a-5f83685d2c1b`). (Load the Linear tools first via
   `ToolSearch query "select:mcp__5aacd2ff-9725-47a1-a0b3-77e4eae9ed20__save_issue,…__get_issue,…__list_issues"`.)
2. **(b) Work on `claude/frosty-pasteur-8cf1db`** (FLOW-A — you're already on it in the frosty worktree).
3. **(c) Implement** ≤450 LOC, presentation-only, engine untouched. Read the matching part of
   `reference/advisor-comp-studio.tsx` for copy/behaviour parity. Use the frappe-ui Skill.
4. **(d) QA gate (all green before close-out):** (1) **`vp check --fix <your changed files>`** then `vp check`
   shows only the known exemptions (see §4) — NEVER blanket `vp check --fix` (it reformats the FROZEN engine).
   (2) `npm run build` (= `vite build` → `scaffold/dist`) succeeds. (3) Engine **22/22** (`node engine.test.mjs`
   from `scaffold/` + `node engine/engine.test.mjs` from root). (4) **Visual pass via `vite preview` + the preview
   MCP** — build, reload, walk the affected routes, verify computed DOM/values (not just screenshots).
5. **(e) Mark Done.** `save_issue({ id: "COM-XX", state: "Done" })` (or state id
   `03cc9c60-ac0e-42b7-8e33-6b1964f57816`).
6. **(f) Ship (FLOW-A, `dangerouslyDisableSandbox: true`):** `git -c core.fsmonitor=false add <paths>` →
   `commit -m "feat|fix(COM-XX): …" -m "<why>" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"`
   → `push origin claude/frosty-pasteur-8cf1db` (**redeploys prod** — gate first). Commit `memory.md` as its own
   `docs(memory):` commit (keeps the fix diff clean).
7. **(g) Append the `memory.md` note** — what shipped, decisions, surprises, next issue.

## 4. Build-knowledge learned this session (USE THESE — saves hours)

- **`vp check` baseline after `chore: vp format`:** `vp check` exits 1 flagging ONLY `src/engine.ts` (FROZEN —
  intentionally unformatted) + `auto-imports.d.ts`/`components.d.ts` (generated, re-emitted unformatted each
  build). **Per issue: run `vp check --fix <your changed files>` (path-scoped, accepts multiple paths)** to
  vp-clean your diff. **NEVER blanket `vp check --fix`** — it reformats the FROZEN engine (+616/−155); you'd have
  to `git checkout scaffold/src/engine.ts` to revert. **COM-69** will make `vp check` fully green via an oxc
  ignore-config — do it early if you want a clean gate.
- **zsh gotchas (the Bash tool shell is zsh):** (1) an unquoted `$(rg -l …)` does **not** word-split → pipe a
  null list: `rg -l0 'PAT' --glob '*.vue' . | xargs -0 perl -i -pe 's/…/…/g'`. (2) `>` to an existing file fails
  ("file exists", noclobber) → `rm -f "$TMPDIR/x.log"` first, and never trust an exit code captured after a `|`.
  (3) BSD sed lacks `\b` → use perl. (4) `!` in a perl `(?<!…)` lookbehind gets mangled even single-quoted → use
  `s/…/…/g unless /skip/` or a global swap + positive-capture restore.
- **Engine compute shapes (engine-frozen; for scenario/value work):** `computeAdvisor` exposes per-scenario
  `c.scen[k]` = `{key,label,total,fdv,exitVal,netEqAt,retention,strikeBasis,…}`; `computeBoard` exposes
  `board.cost[k]` per scenario; `walkScenario(plan,k)` + `tgeFdvFor(plan,k,w)` take a key. **BUT** Floor/Current/
  Ceiling scalars (`baseCaseBase/baseCaseTotal/baseCaseCeil`, `baseEqNet`) are computed once from `baseScenKey`
  only — NOT exposed per scenario. (This is why COM-46 reused `baseScenario` for the global toggle rather than a
  separate `activeScenario`.)
- **frappe-ui component APIs (installed 0.1.278):**
  - `toast.success/error/warning/info(msg)` + `toast.create({message,type,action:{label,onClick},icon})` —
    rendered by the mounted `FrappeUIProvider → ToastProvider` (which renders `<Toasts/>` + `<ToastViewport/>`
    bottom-right; **no extra mount**). `flash()` in store.ts now routes to toast.
  - `confirmDialog({title,message,onConfirm,onCancel})`; `onConfirm` receives `{hideDialog}`; rendered by
    `<Dialogs/>`. Helper `confirmDestroy(title,message,action)` is in `src/confirm.ts`.
  - `Alert`: theme = `yellow | blue | red | green` (**NO amber** — use `yellow` for warnings); props `title`,
    `description`, slots `#description`/`#icon`/`#footer`, themed default icon, `dismissable`.
  - `TabButtons :buttons="[{label,value}]" :model-value @update:model-value` — segmented control,
    **click/keyboard-functional** (responds to synthetic clicks).
  - `Select` = a **reka-ui button-dropdown, NOT a native `<select>`** → a synthetic `.click()` will NOT open it;
    in the preview, verify state changes via the underlying store action (e.g. the same `setPath` the control
    drives), not by driving the dropdown.
- **Theme-aware tokens:** Espresso ink-* remap under `[data-theme="dark"]` (the Configure panel) — a token can be
  dark on light surfaces and light on dark. `ringColor` exposes `outline-*` but **NOT `ink-*`** → for a focus ring
  use a Tailwind arbitrary value `ring-[var(--ink-gray-6)]` (e.g. `focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)]`).
  There is **no `ink-amber-4/5`** (amber ink-scale stops at 3); COM-38 added `--ink-amber-strong`
  (#8A4B08 light / #E79913 dark) in `style.css` + registered it in `tailwind.config.js`. `outline-gray-3` ≈ #C7C7C7
  (1.3:1 on white — too weak for a focus ring; use ink-gray-6/7).
- **Preview verify pattern:** `npm run build` → `preview_start("comp-studio")` →
  `preview_eval('location.reload()')` as a SEPARATE call (reload kills the eval) → navigate with
  `history.pushState({},'',rt); dispatchEvent(new PopStateEvent('popstate')); await ~650ms` (router-link synthetic
  clicks don't fire vue-router) → `preview_eval` to read computed colors/sizes/values (authoritative). A black
  screenshot of a tall/dark/scrolled page is a **CAPTURE ARTIFACT** — confirm via `preview_eval`. The preview
  server may time out between turns — just `preview_start` again (new serverId). `localStorage.clear()` to restore
  the default board after any state-mutating test.
- **role=img only over OPAQUE visuals.** Add `role="img" + aria-label` to SVG/frappe-charts (opaque to SR), NOT
  over components whose text is already readable (it would HIDE the text). frappe-charts has no ARIA → use the
  `ariaLabel` prop already on `FrappeChart.vue` (sets role=img + label).

## 5. Recommended M8 sequence (work strictly by value)

1. **COM-52** (Tooltips on finance jargon) — RESUME HERE. Suggested: a small `<Term k>` glossary-tooltip component
   + a `GLOSSARY` map in `constants.ts`; wrap KPI labels + key terms; the ⏳ tooltip pairs with COM-65.
2. **frappe-ui adoption finish:** COM-68 (Divider/Avatar/Combobox + fix text-`*`/`text-p-*` scale inversions).
3. **Chart-legibility cluster:** COM-48 (scatter overlap/gridlines) · COM-49 (SVG text floor ≥11px) · COM-50
   (visible median series) · COM-51 (redundant non-color channel) · **COM-56 (move SCEN_COLORS OUT of engine.ts →
   constants.ts)** · COM-57 (breakeven shading) · + decision aids COM-47 (exit-valuation slider) / COM-58
   (scannability aids).
4. **COM-62 — the approved left-sidebar app shell** (P2, L, **split into 3 ≤450-LOC PRs**: shell+sidebar →
   migrate the 6 views off `PageHeader` onto a teleported header → board-switcher + Internal/Share grouping).
   **It absorbs COM-67 and the board-switcher half of COM-63.** Do it AFTER the smaller M8 wins.
5. **P3 polish:** COM-59 (per-recipient confidential mark) · COM-60 (chart-mount placeholder) · COM-61
   (progressive disclosure) · COM-63 (now just the ⌘-K palette) · COM-64 · COM-65 (⏳-emoji → glyph/chip) · COM-66
   (More-menu tidy) · COM-67 (closes with COM-62).
6. **New follow-ups (filed 2026-06-09):** COM-70 (Undo via Toast — now unblocked by COM-53) · COM-69 (vp-check
   green gate) · COM-72 (FormControl adoption — needs a design decision first).

## 6. Remaining M8 backlog — milestone `d67cd073-4387-4122-ae85-0f526386c2b4` · 22 issues

Done already: COM-46, COM-53, COM-54, COM-55. **Remaining:**
COM-47 (exit-valuation slider, P2 M) · COM-48 (scatter overlap + gridlines, P2 M) · COM-49 (SVG text floor, P2 S) ·
COM-50 (visible median series, P2 S) · COM-51 (redundant non-color channel, P2 M) · **COM-52 (Tooltips, P2 M — RESUME)** ·
COM-56 (SCEN_COLORS → tokens, OUT of engine, P2 M) · COM-57 (breakeven shading, P2 M) · COM-58 (scannability aids, P2 S) ·
COM-59 (per-recipient confidential mark, P2 S) · COM-60 (chart-mount placeholder, P3 S) · COM-61 (progressive disclosure, P2 L) ·
**COM-62 (left-sidebar app shell, P2 L — APPROVED, 3 PRs)** · COM-63 (⌘-K palette, P3 M) · COM-64 (Proposition band, P3 S) ·
COM-65 (⏳-emoji → glyph/chip, P3 S) · COM-66 (More-menu tidy, P3 S) · COM-67 (nav internal/share grouping, P3 S — closes w/ COM-62) ·
COM-68 (Divider/Avatar/Combobox + text-scale, P3 S) · **COM-69 (vp-check green gate, P3 S — NEW)** ·
**COM-70 (Undo via Toast, P2 M — NEW)** · **COM-72 (FormControl adoption, P3 M — NEW, needs design call)**.

Linear: COM project · team `95768650-2441-48e9-acd4-2ff02c2ff2cf` · states **Done** `03cc9c60-ac0e-42b7-8e33-6b1964f57816`,
**In Progress** `4a7e54ac-2c8d-4932-b46a-5f83685d2c1b`, **Backlog** `2a8311ca-6fe2-4eb6-9d4c-e32effdef68d`.
Re-pull if needed: `list_issues({ project: "82eba0c2-2a11-4e9d-b822-b9efce3bb2a1", state: "Backlog", limit: 250 })`
(spills to a file if large — `jq '.issues[] | {id,title,priority}'`).

## 7. Commands & environment quick-ref

```
# Build / engine (real CI gates)
( cd <frosty>/scaffold && npm run build )            # -> scaffold/dist
node <frosty>/scaffold/engine.test.mjs                # 22/22
node <frosty>/engine/engine.test.mjs                  # 22/22 (both must stay green)

# vp (LOCAL ONLY, alpha — never a build/deploy dep). Path-scope --fix to your files (NOT the frozen engine):
vp check                                              # baseline: only engine.ts + 2 *.d.ts flagged (see §4)
vp check --fix src/App.vue src/views/Foo.vue          # vp-clean your diff

# Install (sandbox denies npm's global cache):
npm install --cache "$TMPDIR/npm-cache" --prefix <frosty>/scaffold

# Visual QA (preview MCP, launch config "comp-studio" = preview/4173):
npm run build ; preview_start("comp-studio") ; preview_eval('location.reload()') ; preview_screenshot
# navigate in-eval: history.pushState({},'','/board'); dispatchEvent(new PopStateEvent('popstate'))

# Git/GitHub/Linear close-out (commits/push need dangerouslyDisableSandbox:true):
git -c core.fsmonitor=false add <paths>
git -c core.fsmonitor=false commit -m "fix(COM-XX): …" -m "…" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
git -c core.fsmonitor=false push origin claude/frosty-pasteur-8cf1db    # redeploys PROD
```

Repo at kickoff: prod branch `claude/frosty-pasteur-8cf1db`; clean tree except the `engine/engine.ts:
Operation not permitted` line in `git status` (sandbox read-deny noise — NOT a real modification). Ignore the
recurring `fsmonitor_ipc__send_query` line.

## 8. Blocks & open decisions (do NOT invent answers — surface to Robin)

- **COM-71 / Vercel MCP 403:** deploy *status* isn't queryable via API (`nordnes-personal` scope needs re-auth);
  prod verified via WebFetch of the live URL instead. Per-issue, trust the local build + visual gate; verify the
  live URL at milestone gates.
- **COM-62 (left-sidebar app shell)** is **APPROVED** (Robin, 2026-06-08) — build it after the smaller M8 wins;
  3 ≤450-LOC PRs; absorbs COM-67 + the COM-63 board-switcher. It resolves the `CLAUDE.md` §5 IA decision.
- **COM-72 (FormControl)** needs a design decision first (does the dark Configure panel keep its minimal underline
  inputs?). Surface to Robin before adopting on that surface.
- **Stale v1 epics:** COM-5 and COM-7 are still `In Progress` from the v1 build (Robin's call to close as
  umbrellas — they are NOT actionable issues).
- **M6 (Auth/persistence/hardening)** is out of scope for M8 but tracked: COM-33 (enable Vercel Deployment
  Protection — the live URL is still PUBLIC), COM-34 (per-user login), COM-35 (Neon — provisioned), COM-71 (Vercel
  re-auth). Don't start M6 in this run; if an M8 issue is affected by the future auth gate, note it + proceed
  presentation-only.

## 9. Kickoff

**Begin with COM-52:** confirm you're in the frosty-pasteur worktree on `claude/frosty-pasteur-8cf1db` (EnterWorktree
if not), read `memory.md`, mark COM-52 In Progress, build the term-tooltip pass (a `<Term>`/glossary approach), run
the full QA gate green (`vp check --fix` your files → `npm run build` → engine 22/22 → preview visual), mark Done,
push to prod with a `feat(COM-52):` commit, append `memory.md` — then continue the M8 sequence (§5) to completion,
gating at the M8 milestone when done. Engine stays frozen throughout.
