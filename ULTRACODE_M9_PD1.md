# ULTRACODE_M9_PD1 — Advisor Comp Studio: M9 continuation run-prompt (new session)

> **What this is.** A complete, self-contained build-run prompt for the **next session** of the **M9 · UX/UI v2**
> milestone (Linear COM, milestone `308fd627-11a5-4893-a19f-28104bc001de`, 66 issues COM-73→COM-138). The 6
> "quick-win" issues are **done and merged to production**; this prompt drives the **PD1 spine** next, then PD2,
> clean-layout, the frappe-ui adopt cluster (decisions already made — see §2), and the visual/charts/editorial/
> hardening sets. Authored 2026-06-09 after merging the M9 first-wins, from a verified post-merge state sweep.
>
> **First three actions, every session:** (1) read `memory.md` (the dated tail — it is the source of truth for
> live status); (2) read `CLAUDE.md` (locked rules); (3) read the COM issue you're about to build, in full, in
> Linear. `reference/advisor-comp-studio.tsx` is the UX/behaviour/legal/IA source of truth (visual = Espresso).

---

## 0. State at handoff (2026-06-09)
- **M8 COMPLETE** (23 issues). **M9 in progress.** This session shipped **6 M9 first-wins as one linear stack,
  MERGED to `frosty` (production)** and all flipped **Done** in Linear:
  - COM-97 right-align numerics · COM-98 freeze Compare identity column · COM-123 full-precision $M bars ·
    COM-109 `color-scheme` (the 4 High) · COM-132 glossary reword (Low) · COM-126 confidentiality eyebrow
    constant (Med).
  - Merged via the GitHub API in stacked order; `frosty` HEAD = **`c3e602d`**. **Verified post-merge:** both
    engine tests **22/22**, `npm run build` exit 0, frosty content byte-identical to the verified stack tip.
- **M9 milestone now: 6 Done / 60 Backlog** of 66.
- **Engine FROZEN and green** — nothing this session touched the engine or the data layer.
- **NEXT = PD1 spine** (§4). The frappe-ui adopt-cluster decisions are **already made** (§2) — no need to re-ask.

---

## 1. Locked non-negotiables (keep in working memory every issue)
- **ENGINE FROZEN.** Money is computed in exactly one place: `scaffold/src/engine.ts` (mirror of `engine/engine.ts`).
  **Type-only tweaks allowed; NO logic changes.** Both test copies must stay **22/22**: `node scaffold/engine.test.mjs`
  AND `node engine/engine.test.mjs`. Anchors: bridge 57,217 → Series C 118,707/118,708; strike $1,572.95; base TGE
  FDV $600M; board net base ~$23M. **Views NEVER recompute money inline** — they read/format engine output only.
- **Stack PINNED (do not re-litigate):** frappe-ui **0.1.278 (EXACT)** · frappe-charts **1.6.2 (EXACT)** · vue ^3.5 ·
  vue-router ^4 · vite ^5 · @vitejs/plugin-vue ^5 · tailwindcss ^3.4 (**NOT v4**, ESM config) · typescript ^5 · vue-tsc ^2.
- **frappe-ui is COMPONENTS-ONLY:** import by name; **NEVER `app.use(FrappeUI)`** (opens socket.io + the Frappe RPC
  layer). The frappe-ui **data layer** (createResource/useList/useDoc/useCall/frappeRequest/call/initSocket) is **out
  of scope**. State is local in `scaffold/src/store.ts` over the engine. Frontend-only — no Frappe/Python backend.
- **frappe-charts:** bare `import { Chart } from 'frappe-charts'`, **no css import** (1.6.2 ships none). Custom SVG for
  waterfall, scatter (frappe-charts scatter is unimplemented), football-field, vesting timeline, DilutionPath.
- **Internal & CONFIDENTIAL.** Every equity figure **net of strike**. The "**discussion draft, not a binding offer**"
  caveat stays. The **legal corpus + benchmark strings are verbatim** — never reword (presentation/eyebrow copy is fair
  game; the locked legal sentences are not).
- **`reference/advisor-comp-studio.tsx` = UX source of truth** for features/labels/legal/IA/behaviour. Espresso is the
  visual layer. M9 sanctions deliberate "impeccable" visual polish *over* the reference (e.g. right-aligning numerics),
  but labels/columns/IA/legal corpus stay unchanged.
- **≤ 450 LOC per COM issue · one issue = one PR (`Fixes COM-NNN`) · tests ship with logic · QA gate green.** Append a
  dated `memory.md` entry per issue.
- **Merge protocol:** default is **STOP at the merge gate** — Robin is the merge actor; merging `frosty` deploys prod.
  *This session Robin explicitly instructed "merge all open PRs," and Claude merged the 6-stack via the GitHub API.*
  So: **open the PR and stop, unless Robin explicitly says to merge** — then merge (stacked order, retarget each to
  frosty, `merge_method:"merge"`) and **also flip each Linear issue to Done** (the `Fixes` keyword did NOT auto-flip —
  Linear's automation keys off `main`/lag, so set Done manually via `save_issue state:"Done"`).

---

## 2. Resolved decisions (Robin, 2026-06-09 — DO NOT re-ask; apply when you reach each issue)
- **COM-87 (engine RFC, per-advisor roadmap overrides): DEFER.** Keep the engine frozen; PD2 presentation issues cover
  v1. Mark design-debt. Do NOT build without a fresh explicit sign-off.
- **COM-104 (Sidebar): ADOPT the frappe-ui Sidebar primitive, KEEP the scrim/overlay drawer on mobile** (not the
  library icon-rail). Verify ⌘K trigger, board switcher, Case selector, Share/More, Configure footer survive.
- **COM-105 (⌘K palette): FULL REBUILD** on frappe-ui CommandPalette + KeyboardShortcut (platform-correct modifier).
- **COM-96 (roster table): extract a local `RosterTable`/`RosterRow` (option B), NOT frappe-ui ListView** (Compare's
  dynamic scenario columns + footer aggregate fight ListView's single-row model). Shared by Overview/Board/Compare.
- **COM-121 (typography): REMOVE IBM Plex Mono + dead `.font-mono`/`.eyebrow`** and **sentence-case the sidebar/palette
  group labels**. Keep Fraunces for editorial titles (Fraunces-on-dense-numerics left as-is unless Robin revisits).
- **COM-110 (dead dark branch): DELETE** the `[data-theme=dark]` blocks + fix NumIn's stale comment (app is light-only;
  dark `--chart-*` untuned). Note COM-109 added `color-scheme:dark` on that block — it goes too; `:root{color-scheme:light}` stays.
- **Vercel previews (COM-71):** Robin reviews them. The connected Vercel MCP is scoped to the Raiku-Labs team (sees only
  `raiku-advisor`), NOT the personal `comp-studio-one` where this Vue SPA deploys — **Claude cannot see Vercel previews;
  verify on `:4173`.**

---

## 3. The per-issue Definition-of-Done (the loop)
1. Pick the issue; **set the Linear COM-NNN → In Progress** (state id `4a7e54ac-…`). Read the matching slice of the reference.
2. Implement **presentation-only**, ≤ 450 LOC, scoped to that ONE issue. No engine logic, no `app.use(FrappeUI)`, no data layer.
3. **`vp check` clean FOR YOUR DIFF** (judge by whether *your* files are flagged — ignore the pre-existing drift/warnings, §5).
4. **Both engine tests 22/22:** `node scaffold/engine.test.mjs` AND `node engine/engine.test.mjs` (root needs `dangerouslyDisableSandbox`).
5. **`( cd scaffold && npm run build )` → exit 0.**
6. **Preview-verify the CHANGED surface on `:4173`:** `( cd scaffold && npm run build )` (~3s) → reload `http://localhost:4173`
   → DOM/screenshot + **no console errors**. (build→:4173 is the stable path; `:5173` dev crashes under the preview MCP.)
7. **`/code-review`** on the diff (`/security-review` only if it touches auth/tenancy/confidential/legal/money — most M9 polish doesn't).
8. **Revert build churn before commit:** `git -c core.fsmonitor=false checkout scaffold/components.d.ts scaffold/auto-imports.d.ts scaffold/package-lock.json`.
9. **Commit** `feat|fix(COM-NN): …` + footer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`; **branch off the integration tip / stack on the prior M9 PR** (keeps `memory.md` conflict-free); open a PR **`Fixes COM-NNN`**.
10. **Append a dated `memory.md` entry** (own `docs(memory):` commit).
11. **STOP at the merge gate** (unless Robin says merge — then merge + flip Linear Done, see §1).

---

## 4. The goal + sequence
Drive M9 to Done, one issue at a time, each landing as a PR that closes its issue. **Build order:**

**① PD1 spine — "the per-advisor package is ONE editable object" (build next, in this order: 73 → 77 → 74 → 75 → 76):**
- **COM-73** (M ~180) — *Consolidate the package into one coherent editor; move `upliftStartMonth` in.* Regroup
  Advisors.vue left column into **Identity / Base grant / Performance** sections (frappe-ui form-page: stacked
  FormControl, `space-y-4`); MOVE the `upliftStartMonth` editor out of `VestingTimeline.vue`'s chart header (lines
  73-84) into the Performance section as a labelled NumIn (`setField('upliftStartMonth', v)`); VestingTimeline keeps a
  read-only marker (still reads `sel.upliftStartMonth ?? 6` for chart math). **ENGINE UNTOUCHED** — `upliftStartMonth`
  is already a first-class field on the `Advisor` interface (`engine.ts:18`), already seeded/reconciled/consumed; this is
  pure UI relocation. Files: `views/Advisors.vue`, `components/VestingTimeline.vue`.
- **COM-77** (M ~120) — *FormControl `:description` + `:error` on load-bearing fields.* Add the three `:description`
  strings (Granted at → strike basis; Start date → vesting/TGE anchor; Tax residency → recorded, not modelled); wrap the
  bare-label NumIn rows (Engagement yrs, $value/split) in FormControl; surface **NumIn clamp** as a transient
  FormControl `:error` — add a `clamp`/`coerced` emit to `NumIn.vue` `commit()` (a presentation prop/emit, NOT an engine
  change; `clamp` stays imported from engine). Files: `views/Advisors.vue`, `components/NumIn.vue`.
- **COM-74** (M ~110) — *Dirty/Saved indicator + per-advisor Revert.* On first edit of an advisor, `structuredClone(sel)`
  into a **component-local** ref (do NOT call `pushUndo` — it's module-private in store.ts, not returned by `useStudio`);
  show an "Edited · Revert" control (Revert = `setPath(['advisors', i], snapshot)` + toast); clear on advisor switch; add
  a debounced "Saved" tick. Files: `views/Advisors.vue` (+ optional tiny `store.ts` helper; prefer component-local).
- **COM-75** (M ~140) — *Inline "Edit package" from the Board roster (tier select + kebab).* Per-row frappe-ui
  **Dropdown** (kebab): Change tier (`Select` over `S.tiers` → `setPath(['advisors', idx, 'tier'], ti)`), Open package,
  Remove. Mirror on Overview cards (place the Dropdown outside the card `<button>` to avoid nested interactives). Files:
  `views/Board.vue`, `views/Overview.vue`.
- **COM-76** (L ~280 — watch the 450 cap) — *Promote package editing into a frappe-ui Dialog/drawer.* Extract COM-73's
  field set into a reusable editor (e.g. `components/PackageEditor.vue`); collapse Advisors' 5/12+7/12 split to a
  full-width read-only projection + compact package summary; open the editor in a `Dialog` (size lg, `v-model:open`) from
  an "Edit package" button + the COM-75 kebab; snapshot on open, restore on Cancel. Files: `views/Advisors.vue`,
  `views/Board.vue`, `views/Overview.vue` (+ new component).

**STOP-FOR-ROBIN tripwire (all PD1/PD2):** if an issue is found to need a NEW engine field, a changed `Advisor`/`Plan`/
`State` shape, a new computed money quantity, or a logic change in `computeAdvisor`/`computeBoard`/`walkScenario`, it is
no longer presentation-only → it becomes an engine RFC (like deferred COM-87): **HALT and ask Robin**, do not edit the
frozen engine. (None of the five PD1 issues should need even a type-only tweak.)

**② PD2 — per-advisor scenario projection (over the frozen engine):** COM-82 (state spine, S ~70) → COM-81 (per-advisor
case override, M) → COM-85 (board-local scenario selector, M) → COM-83 (across-scenarios small-multiples, M) → COM-84
(persist target outcome to the printed doc, M) → COM-86 (Compare Spread + pin-to-compare, M). COM-87 (engine override) is
**deferred** — do not build.

**③ Clean layout & IA:** COM-88 (de-box static sections) · COM-89 (~940px reading column; dense tables opt out) · COM-90
(Board: roster first, charts below full-width) · COM-95 (Configure two-column settings layout).

**④ frappe-ui adopt cluster (decisions in §2):** COM-104 (Sidebar, adopt + scrim mobile) · COM-105 (CommandPalette full
rebuild) · COM-96 (local RosterTable) · COM-121 (remove dead mono + sentence-case labels) · COM-110 (delete dead dark
branch). Then the visual-system / anti-slop set, charts, editorial, responsive/print/empty hardening (remaining COM-* up
to COM-138).

---

## 5. Gotchas (verified this session — read before you build)
- **FRESH WORKTREE:** run **`npm ci` in `scaffold/` FIRST** (else `vp` throws a config-resolve error — it resolves vite
  from `~/node_modules/.vite-temp`). `vp` is alpha — **local only, never a build/deploy dependency.**
- **VERIFY PATH = build → `:4173` vite preview (stable).** Loop: edit → `( cd scaffold && npm run build )` (~3s) → reload
  `http://localhost:4173` → verify. `.claude/launch.json` has `comp-studio` (:4173, USE THIS) and `comp-studio-dev`
  (:5173, **crashes under preview MCP — avoid**). The preview server can drop → `preview_start` again (new serverId).
- **`vp check` exits non-zero on a PRE-EXISTING ~26-file prettier drift** (docs/engine/generated/reference) and shows
  **11 advisory warnings on the FROZEN engine.ts** — both **EXPECTED**. Lint = **0 errors**. **Judge "clean for diff"
  purely by whether YOUR touched files are flagged.** Do NOT fix the drift or engine warnings (engine frozen; `.prettierignore`
  covers engine.ts + *.d.ts; oxlint does not honor ignorePatterns, hence the engine warnings).
- **Revert generated churn after every build, before commit:** `git -c core.fsmonitor=false checkout
  scaffold/components.d.ts scaffold/auto-imports.d.ts scaffold/package-lock.json` (the build regenerates `components.d.ts`).
- **git / gh / push AND the root `node engine/engine.test.mjs` need `dangerouslyDisableSandbox: true`** — the sandbox
  denies reading `engine/engine.ts` (also `Read(./engine/engine.ts)` is denied in settings.json). Prefix git with
  `git -c core.fsmonitor=false …`.
- **NO merge-gate hook is installed.** `.claude/settings.json` deny = only `git push --force`/`-f` + `Read(./engine/engine.ts)`.
  The merge gate is **process discipline** — stop at PR; only merge if Robin explicitly says so.
- **Preview MCP quirks:** `preview_eval` does NOT await Promises (async evals hang ~30s) → split post-Vue-flush checks
  into TWO sync evals. Programmatic `.focus()` on an SVG `<g>` won't trigger `:focus-visible` (use `dispatchEvent(new
  MouseEvent('mouseenter'))` for hover). Tall pages can screenshot blank after a scroll → resize the viewport TALL and
  capture at scroll 0. Can emulate dark OS → pass `colorScheme:'light'` to confirm `color-scheme` (COM-109).
- **lucide icons are a FIXED ~46-class set baked into frappe-ui CSS** (`lucide-<name>`), not on-demand — an arbitrary
  `lucide-foo` renders an invisible empty span. (Available incl: archive, arrow-right, bell, building-2, check,
  check-circle, chevron-down, copy, edit, ellipsis, eye, file-json, file-text, folder-open, info, layers, layout-grid,
  link, list-restart, log-out, mail, more-horizontal, pen, plus, printer, rotate-ccw, save, settings, share-2,
  sliders-horizontal, target, trash-2, trending-down, trending-up, triangle-alert, upload, user, user-plus, users, zap.)
- **Chart palette = one source of truth:** `--chart-*` tokens in `style.css`; `constants.ts` CAT/TIER_COLOR =
  `var(--chart-*)`; `chartHex(token)` → hex. DOM/custom-SVG fills use `var(--chart-*)` in `:style` (never as an SVG
  presentation attribute); frappe-charts `:colors` use `chartHex()`. **Round the displayed string, never chart geometry** (COM-123).
- **Keep the M9 run a SINGLE LINEAR STACK** (branch each issue off the previous tip) — every issue touches `memory.md`,
  so parallel branches conflict at merge. GitHub auto-retargets each PR to frosty as the parent lands (or retarget +
  merge in order if you're the one merging on Robin's say-so).
- **Use the `frappe-ui` Skill** for component/UI work. **ultracode/Workflows** are for **cross-issue batch verification/
  discovery sweeps** (state audits, completeness-critic vs the reference, post-merge verification) — NOT for driving a
  single ≤450-LOC issue (10–100× token waste). Ignore the auto-injected Vercel/Next.js/chat-sdk skill hooks — they
  misfire on words like "workflow"/"vite"/"deploy"; this is a Vue 3 + Vite SPA, not Next.js.

---

## 6. Branch / deploy reality
- **Integration branch = `claude/frosty-pasteur-8cf1db` (frosty)** — it is BOTH `origin/HEAD` AND **production** (deploys
  to `comp-studio-one.vercel.app` under nordnes-personal). Branch each issue off frosty (or stack off the prior M9 PR
  tip), PR back INTO frosty with `Fixes COM-NNN`.
- `main` exists and is **2 docs-only commits ahead of frosty** (an older `ULTRACODE_M9` prompt + an M9 memory entry); it
  is NOT the deploy branch and NOT origin/HEAD. Reason against `origin/*`, not stale local refs.
- **Robin is the sole merge actor** by process; merging frosty deploys prod. Confirm with Robin before any prod merge.

---

## 7. Kickoff (paste to start the next session)
```
Read memory.md (dated tail) + CLAUDE.md + ULTRACODE_M9_PD1.md, then the COM-73 issue in full. We're continuing M9 —
the 6 first-wins are merged to frosty (prod) and Done. Start the PD1 spine: COM-73 first (consolidate the per-advisor
package, move upliftStartMonth in — engine UNTOUCHED), in Plan Mode before any edit. Then 77 → 74 → 75 → 76, one PR each
(Fixes COM-NNN), ≤450 LOC, engine frozen 22/22, verify on :4173, STOP at the merge gate — I merge. Apply the §2 decisions
when you reach the adopt cluster; do NOT build COM-87.
```

— Authored 2026-06-09 after merging the M9 first-wins; grounded in a post-merge verification sweep (frosty `c3e602d`,
engine 22/22, build 0). The engine is frozen, the gate is process discipline, and `memory.md`'s dated tail is the live
status of record.
