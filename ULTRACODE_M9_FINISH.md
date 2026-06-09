# ULTRACODE_M9_FINISH — Advisor Comp Studio: finish M9 + start M12 (goal-loop run-prompt · Fable 5)

> **What this is.** A complete, self-contained **goal-loop** prompt for the next session, written for the
> **Claude Fable 5** model. The goal is a BIG batch: **drive M9 · UX/UI v2 from 21/66 Done to 66/66**, plus
> the two unblocked cross-milestone items (**COM-139** built-and-held for GC sign-off, **COM-141** the first
> M12 Governance surface). 45 open issues are pre-distilled below from a 6-agent verified sweep (Linear +
> repo ground truth at frosty tip, 2026-06-09). You LOOP: take the next issue in wave order → run the
> per-issue DoD → **merge on green** → flip Linear Done → memory.md → next. No per-issue check-ins.
>
> **First three actions, every session:** (1) read `memory.md`'s dated tail (live status of record);
> (2) read `CLAUDE.md` + `DESIGN_SYSTEM.md` (the design grammar — build INSIDE it); (3) read the next COM
> issue in full on Linear before building it (this prompt distills, the issue is canonical).
> `reference/advisor-comp-studio.tsx` = behaviour/legal source of truth, EXCEPT the Δ4 CoC line (COM-139);
> `COMP_STUDIO_SPEC_v2.md` = the product spec.

---

## 0. State at handoff (2026-06-09, end of the spec-v2/PD2/design session)
- **frosty (`claude/frosty-pasteur-8cf1db`) = origin/HEAD = PRODUCTION** (comp-studio-one.vercel.app).
  PRs #15–#25 merged: spec-v2 docs · PD2 (COM-82/81/85/83/84/86) · clean-layout (COM-89/90/88/95) ·
  `DESIGN_SYSTEM.md`. **M9 = 21 Done / 45 open. M10–M12 + COM-139–170 exist on Linear.** 0 open PRs.
- **Merge authority:** Robin's standing instruction (2026-06-09): *"merge all the PRs once you are happy
  with them and that they are meeting your QAs."* → **merge-on-green is the default for presentation
  issues.** Confirm in one kickoff line; absent contrary instruction it stands. **HARD EXCEPTIONS that
  always hold at the gate:** COM-139 (Charlie/GC wording sign-off), any legal-corpus or engine-boundary
  touch, SCHEMA changes.
- **Repo ground truth (verified, trust over issue line numbers — most issue cites predate the COM-76/90/95
  restructures; ALWAYS locate by symbol):** App.vue 431 lines (navGroups :25-41 · sidebar band :185-219 ·
  footer :239-271 · header+breadcrumb :277-320 · Mgr Dialog :357-420 · CommandPalette mounts :423,
  PackageEditor :426). CommandPalette.vue 217 · PackageEditor.vue 408 (holds the COM-78/79/80 targets —
  the old "Advisors.vue editor" cites moved THERE) · Configure.vue 705 (now the COM-95 two-column rail) ·
  Board.vue 564 (roster FIRST since COM-90; de-boxed since COM-88) · Compare.vue 337 · Overview.vue 246.
  style.css 132 lines — the TWO dead `[data-theme="dark"]` blocks are :33-36 and :54-65; `:root` light
  tokens :26-32 + :42-53. index.html loads Fraunces + **IBM Plex Mono + IBM Plex Sans (Sans used NOWHERE)**.
  tailwind extend = ink-amber-strong · font display · **max-w-reading (60rem)**.

## 1. Locked non-negotiables (identical to PD2 — keep in working memory)
- **ENGINE FROZEN.** Money only in `scaffold/src/engine.ts` (root `engine/engine.ts` is read-denied &
  untouched). NO logic changes; both tests stay **22/22**: `node scaffold/engine.test.mjs` AND
  `node engine/engine.test.mjs` (root needs `dangerouslyDisableSandbox`). Anchors: bridge 57,217 → C
  118,707; strike $1,572.95; TGE FDV $600M; board base ~$23M. Views never recompute money — read exports;
  the only sanctioned view-side arithmetic mirrors an existing engine formula over exported fields.
- **Pins:** frappe-ui **0.1.278 exact** · frappe-charts **1.6.2 exact** · vue ^3.5 · tailwind ^3.4 (NOT v4).
  frappe-ui COMPONENTS-ONLY (import by name; NEVER `app.use(FrappeUI)`; no data layer). Use the
  **frappe-ui Skill** for component work; verify a component EXISTS in 0.1.278 before designing around it
  (ItemListRow, CommandPalette, KeyboardShortcut, Switch, Breadcrumbs, Tabs are all assumptions to check).
- **Internal & CONFIDENTIAL · net of strike · "discussion draft, not a binding offer."** Legal corpus +
  benchmark strings VERBATIM (presentation copy is fair game) — ONE sanctioned exception: COM-139/Δ4.
- **≤450 LOC per issue · one issue = one PR (`Fixes COM-NNN`) · QA gate green · dated memory.md entry per
  issue** (`docs(memory):` commit on the same branch). Commit footer:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- **DESIGN_SYSTEM.md governs all visuals:** reading column vs 7xl opt-out · borders earn their place ·
  lead with the subject · settings two-column · amber = current/active-case only · figure/section idioms.

## 2. The goal loop (run this until the queue is empty)
```
while (queue has issues) and (no tripwire):
  1. next issue per §4 wave order → Linear In Progress (read the issue IN FULL first)
  2. branch off origin/frosty (fetch first; independent branches — NOT a stack, since each merges
     immediately; EXCEPTION: issues marked "same-region" in §4 stack on each other)
  3. implement ≤450 LOC, presentation/state-only, inside DESIGN_SYSTEM.md
  4. QA gate: `cd scaffold && vp check` (judge YOUR files; ~26-file pre-existing drift + 11 frozen-engine
     warnings are EXPECTED; `vp fmt <files> --write` your files) → BOTH engine tests 22/22 →
     `( cd scaffold && npm run build )` exit 0 → preview-verify the changed surface on :4173
     (build → reload; computed styles for sub-pixel claims; screenshot for layout)
  5. /code-review the diff (security-review only for legal/money/confidential surfaces)
  6. revert generated churn (components.d.ts, auto-imports.d.ts, package-lock.json) → commit
     `feat|fix(COM-NN): …` → memory.md entry → push → PR `Fixes COM-NN` → **gh pr merge --merge**
     (EXCEPT the §5 hold-list) → flip Linear **Done** (save_issue state:"Done" — Fixes does NOT auto-flip)
  7. every ~5 merges OR at each wave boundary: re-verify frosty (fetch → build 0 → 22/22) before continuing
stop conditions: engine/SCHEMA/legal tripwire (HALT, ask Robin) · a decision NOT pre-made in §5 ·
queue empty → gate M9 (final sweep: build, 22/22, all-routes preview smoke, Linear milestone check,
project status update, memory.md gate entry)
```

## 3. Wave order (dependency-verified; sizes from the sweep; ~45 issues)

**WAVE 1 — foundations & safety (do first; they gate everything):**
1. **COM-93** (S ~60) nav single-source: export `{to,label,icon,group}[]` from new `src/nav.ts`; sidebar
   (App.vue navGroups :25-41), palette ROUTES, router consume it. *Gates 104/105.*
2. **COM-135** (HIGH, S ~30) mobile drawer `inert` when closed + focus-trap/Esc when open (App.vue aside
   :179-270, scrim :172-176; isMobile matchMedia ref). Verify by tab-walk at 375px.
3. **COM-116** (M ~60) figure scale: `.figure-sm/md/lg` utilities in style.css (Fraunces 350 tabular-nums);
   migrate ~6 inline `font-weight:350` sites (PotentialStrip, Proposition 2.8rem×3 + clamp override,
   ExitSlider ~:56, Overview/Board font-display figures). NUMERIC figures only. *Gates 113/114/117.*
4. **COM-118** (M ~90) amber = ONE meaning: demote Configure's 10 amber section headers → ink-gray-7;
   re-skin structural amber panels (Performance card, objective cards, "How to read this") neutral; Board
   footer total → gray-1+border-t; ONE amber moment per page (company-cost survives). *Gates 114/115/117.*
5. **COM-110** (S ~30) DELETE both dead `[data-theme=dark]` blocks (style.css :33-36 AND :54-65 — verified
   nothing sets data-theme) + fix NumIn.vue:2-4 stale dark comment; KEEP `:root{color-scheme:light}`.
   **Then comment + cancel COM-124** ("obsolete — dark branch deleted per the COM-110 decision; re-open
   with any future dark-mode milestone").

**WAVE 2 — hardening highs (independent, mostly S/M):**
6. **COM-133** (HIGH, M ~90) shared `<EmptyState>` (extract from Overview :98-118 donor) on Board, Compare,
   Advisors, Proposition when `board.rows.length===0`; suppress charts/zeroed totals.
7. **COM-134** (HIGH, M ~60) print: `.print-area{padding-bottom:10mm}`, Board's four print wrappers get
   `print-area`, `break-inside:avoid` + `thead{display:table-header-group}`. Legal copy untouched.
   Spec-faithful CSS (no real print dialog in preview — note the COM-59 caveat, Robin eyeballs a PDF).
8. **COM-137** (S ~40) storage + budget Alerts become SIBLING v-ifs (App.vue :303-317) + persistent
   "Not saved — export to keep" sidebar badge → **then COM-138** (S ~30) all-warnings disclosure (same
   block — *same-region: stack 138 on 137*).
9. **COM-136** (S ~30) name truncation (`min-w-0` + `truncate` + `:title`) on Board/Compare name cells +
   first-name disambiguation (`split(' ')[0]` call sites Board :72,:130, FootballField label) with
   last-initial fallback + mononym guard.

**WAVE 3 — the frappe-ui ADOPT cluster (decisions pre-made — see §5):**
10. **COM-104** (L ~300) sidebar → frappe-ui Sidebar/SidebarSection/SidebarItem; KEEP the hand-rolled
    scrim+translate drawer on mobile as a wrapper; consume nav.ts; keep wordmark/Internal badge, ⌘K
    trigger, Saved, Case Select, Share/More, Configure footer. Preview at 375px AND ≥1024px.
11. **COM-105** (L ~240) FULL palette rebuild on CommandPalette + CommandPaletteItem (groups/items model,
    parent-managed show/searchQuery); `<KeyboardShortcut combo="mod+k" />` (prop is `combo`); keep the
    hidden Import file input in the parent. Keyboard regression pass (↑↓↵esc now library-owned).
12. **COM-94** (S ~50) palette Actions: Add advisor (addAdvisor → openEditor), New scenario / New objective
    (→ /configure, right rail group, focus the new row). *After 105 — write verbs once in the new shape.*
13. **COM-121** (S ~30) drop IBM Plex Mono AND the unused IBM Plex Sans from index.html (keep ONLY
    Fraunces in the Google css2 URL); delete dead `.font-mono`/`.eyebrow` (grep-verify zero usages);
    sentence-case the sidebar/palette group labels (kill `uppercase tracking-wider`). *After 104+105.*
14. **COM-103** (S ~50) Mgr saved-board list → ItemListRow (verify the export exists; else minimal
    ListView; else keep markup but fix alignment) — App.vue Mgr Dialog :357-420.
15. **COM-102** (M ~80) sidebar "Saved · N" → Dropdown trigger showing `store.S.name` (items = saved
    boards → loadBoard, + "Manage…" → Mgr Dialog); breadcrumb root 'Studio' → board name.
16. **COM-101** (S ~40) breadcrumb → frappe-ui `<Breadcrumbs :items>` fed from the existing computed
    (App.vue :128-135, spans :288-299); root = board name per 102 (*same-region: stack 101 on 102*).
17. **COM-106** (M ~160) Configure bare inputs → TextInput sm (+ FormControl date for TGE date); NumIn
    untouched; setPath wiring unchanged; split into 2 PRs if >450.
18. **COM-96** (L ~320) local `<RosterTable>`/`<RosterRow>` (option B — NOT ListView): owns Avatar+name
    cell, tier Badge (byte-identical in all 3 views), row-open a11y, right-aligned numerics, amber total
    row; consume from Board + Overview first; **Compare adoption may split to a follow-up PR** (its
    sticky-first-col + Spread/Pin extras are the hard part). Values arrive as props — NO math inside.

**WAVE 4 — visual system (order matters):**
19. **COM-108** (M ~120) `<Panel padded>` primitive replacing ~19 `bg-surface-white rounded border…`
    stamps (grep the literal); keep `rounded` (NOT rounded-md); skip the two deliberate exceptions
    (Proposition's outline-gray-2 editorial frame, overflow-only wrappers).
20. **COM-119** (S ~20) FootballField weight inversion: band → gray-3, base tick → ~3px amber. Verify BOTH
    call sites (Advisors hero + Board rows).
21. **COM-120** (S ~30) Board range rows → fixed-width columns (`[name 8rem][bar 1fr][value 7rem]`);
    lighter API option on the shared FootballField (*same files: stack 120 on 119*).
22. **COM-113** (M ~60) Overview KPI band → one hero figure (Net cost · base, `.figure-lg`) + quiet
    supporting dl (Equity/Tokens/Cash); Range as a small adjacent two-ended figure; DELETE the Advisors
    count tile.
23. **COM-115** (M ~60) Board company-cost → range presentation (floor quiet · base bold amber · ceiling
    quiet, FootballField idiom) instead of 3 tiles; keeps the page's one amber moment.
24. **COM-114** (HIGH, M ~90) Proposition hero: ONE Fraunces statement (guaranteed Base) + ONE range
    visual; kill the i/ii/iii roman spans (:164-211 area). In-PR judgment (preview!): compact reference
    table beats a bar if the bar reads like a chart in a letter. LEGAL: layout only — corpus verbatim.
25. **COM-117** (M ~140) `<MetricBand :cells>` + ONE SectionLabel treatment (`text-sm font-medium
    text-ink-gray-7`, sentence case) across ~39 labels. LAST in the wave (absorbs 113/115 shapes; the
    Proposition band stays a documented editorial variant). Split if the label sweep pushes >450.

**WAVE 5 — editorial & package editor (COM-78/79/80 all live in PackageEditor.vue now, NOT Advisors.vue):**
26. **COM-78** (S ~40) denomination switch helper line + resolved eq%/tok% from existing `c.baseEq/baseTk`.
27. **COM-79** (S ~50) tier cards → one aligned segmented/list selector (*same region: stack 79 on 78*).
28. **COM-80** (M ~90) Performance card off amber; objectives → divide-y rows w/ fixed slots (*stack on 79*).
29. **COM-91** (M ~70) detail expander → frappe-ui Tabs (Vesting · Mix · Dilution · Instruments) —
    COM-83 already promoted the hero pieces; only these four remain behind the toggle.
30. **COM-92** (M) co-locate Case + Stage lenses: **default = sidebar** (Stage joins the existing Case
    block — COM-46 precedent; flag the placement in the PR for veto). PLUGGABLE options-source
    (COM-148/scenario-sets lands as a data change). Persisted via existing plan fields — additive only.
31. **COM-127** (S ~60) PageHeader + #app-header actions for Configure (kill the solid Done → ghost
    "Back to overview"), Proposition (Print primary, Copy ghost), and Advisors' hand-rolled action row →
    #actions teleport. Coordinate the header zone WITH 92 (*build 127 right after 92*).
32. **COM-128** (S ~15) confidential/net-of-strike line on the Advisors hero — VERBATIM strings only.
33. **COM-130 + COM-131** (S ~30 + ~20, ONE PR is fine if ≤450 — they edit the same ExitSlider copy):
    caption trims + per-host `tone` register (Proposition = quiet document copy).
34. **COM-129** (S ~25) Term tooltips on Overview (netOfStrike, headroom; add FAST + advisory-pool
    GLOSSARY entries — explanatory copy, benchmark citations stay byte-identical).

**WAVE 6 — small leftovers:** 35. **COM-99** (S) Switch for the 2 boolean toggles (verify Switch export) ·
36. **COM-100** (S) `.range-input` tokens + track-fill (frappe-ui Slider explicitly UNFIT — record why) ·
37. **COM-107** (S) addAdvisor toast + confirmDestroy on Board trash + the 2 widest Configure cascades ·
38. **COM-111** (S) `--overlay` token replaces both `bg-black/30` scrims · 39. **COM-112** (S) tokenize
`.print-running` colors (STRING untouched; verify vars resolve under `@media print`) · 40. **COM-122** (S)
scatter axis titles (rotated y "Headroom to ceiling", x "Current net value", ≥11px) · 41. **COM-125** (S)
adaptive scenario grids (auto-fit minmax) + hide the degenerate single-scenario Range KPI.

**WAVE 7 — cross-milestone finishers:**
42. **COM-139** (HIGH, copy-only) the Δ4 legal fix: replace the stale CoC sentence in Proposition
    fine-print + propText() (+ grep every echo; the line is at Proposition.vue ~:248 area today); bundle
    the CLAUDE.md corpus-rule note. **Open the PR with proposed wording and HOLD — Charlie (GC) signs off
    before merge. Ping Robin in the PR body.** Do not let the hold block the loop — continue to 43.
43. **COM-141** (HIGH, M→L) M12 Governance surface: new `/governance` route + nav.ts entry + persisted
    `governance` store slice (reconcile-safe additive defaults — NO SCHEMA bump) seeding the ten v4 rows +
    C.6 open items VERBATIM from `COMP_STUDIO_SPEC_v2.md` Appendix C.5/C.6; RED/AMBER/GREEN status +
    owner + evidence-link per item; WCAG AA at birth; NO gating semantics (that's COM-167's sibling).
    **Split seed-data vs UI into 2 PRs if >450.**
44. **M9 GATE:** full sweep (build 0 · both 22/22 · all-routes preview smoke incl. mobile + a print-PDF
    note for Robin) → Linear milestone check (66/66 minus any holds) → project status update → memory.md
    gate entry → update `CLAUDE.md`'s live-prompt pointer to whatever comes next (M10 RFC prep).

## 4. Pre-made decisions (Robin — DO NOT re-ask; cite the date 2026-06-09)
- COM-104 = adopt Sidebar, KEEP scrim/overlay drawer on mobile · COM-105 = FULL rebuild · COM-96 = local
  RosterTable (option B) · COM-121 = remove Plex (Mono AND the unused Sans), sentence-case labels, KEEP
  Fraunces · COM-110 = DELETE the dark blocks (→ cancel COM-124 as obsolete) · COM-87 = still DEFERRED
  (superseded by COM-140/143; never build in M9) · COM-71 = Robin reviews Vercel previews; you verify
  on :4173 · merge-on-green per §0 with the §3-42 hold for COM-139.
- Defaults set BY THIS PROMPT (flag in the PR body, proceed unless vetoed): COM-92 placement = sidebar;
  COM-101 root crumb = board name (from 102); COM-114 = whichever variant reads as document-not-dashboard
  in preview; COM-125 = HIDE the degenerate Range KPI.

## 5. Gotchas (ALL verified — read before you build)
- **STALE LINE NUMBERS everywhere:** most issues predate COM-76/90/95. The §0 ground-truth block has
  verified locations. COM-78/79/80's targets are in **PackageEditor.vue** (408 lines), not Advisors.vue.
- **Vue casts an ABSENT Boolean-typed prop to `false`** — default-true booleans need `withDefaults`
  (cost a debug loop in COM-84). **`structuredClone` THROWS on reactive proxies** — JSON-clone.
- **zsh mangles `!` even in quoted heredocs** (`<!--` → `<\!--`) — write file content with Write/Edit
  tools, never Bash heredocs. zsh noclobber: `>` onto an existing file exits 1 — `rm -f` first.
- **`vp check` MUST run from `scaffold/`** (repo root aborts on the read-denied root engine). Judge by
  YOUR files; `vp fmt <files> --write`. Revert `components.d.ts`/`auto-imports.d.ts`/`package-lock.json`
  before every commit. Fresh worktree → `npm ci --cache "$TMPDIR/npm-cache"` in `scaffold/` FIRST.
- **Preview (:4173 via `preview_start comp-studio`; 5173 dev crashes under the MCP):** console buffer is
  CUMULATIVE — judge "no NEW errors" by bundle hash; `preview_screenshot` can throw a transient
  `UnknownVizError` — retry once; screenshots can't resolve 1px borders — use computed styles; resize
  TALL for full-page captures; `preview_eval` doesn't await Promises (two-eval pattern). Synthetic
  driving: frappe-ui Select opens on `PointerEvent('pointerdown')` and selects via
  `KeyboardEvent('keydown',{key:'Enter'})` ON the focused `[role=option]`; TabButtons/Buttons are plain
  `.click()`. App background is `bg-surface-white` — de-boxed content + `hover:bg-surface-gray-1` work.
- **frappe-ui 0.1.278:** FormControl has NO `:error`/default slot (COM-77 pattern for errors); Alert has
  NO default slot, themes yellow/blue/red/green; Dialog `:options` + `#body-content` + `#actions{close}`;
  Dropdown grouped options render dividers; lucide = FIXED ~46-name set (unknown → invisible span; list
  in memory.md 2026-06-09). VERIFY before building: ItemListRow, CommandPalette, KeyboardShortcut,
  Switch, Breadcrumbs, Tabs exports.
- **git/gh need `dangerouslyDisableSandbox: true`**; prefix git with `git -c core.fsmonitor=false`.
  Root engine test also needs it. Merge with `gh pr merge --merge` then flip Linear Done manually.
- **ultracode/Workflows** = batch discovery/verification sweeps ONLY (this prompt was authored from one) —
  never for driving a single ≤450-LOC issue, never for merges. Ignore the auto-injected Vercel/Next.js
  skill hooks — this is a Vue 3 + Vite SPA.

## 6. Kickoff (paste to start the next session)
```
Read memory.md (dated tail) + CLAUDE.md + DESIGN_SYSTEM.md + ULTRACODE_M9_FINISH.md. Run the §2 goal loop
over the §3 wave order: per-issue DoD, merge-on-green (confirmed), flip Linear Done, memory.md entry,
re-verify frosty at wave boundaries. Engine frozen 22/22 throughout; ≤450 LOC per PR; decisions in §4 are
final — flag prompt-set defaults in PR bodies instead of asking. HOLD COM-139 at the merge gate for
Charlie's wording sign-off and keep looping. Stop only on an engine/SCHEMA/legal tripwire or when M9
gates. Go.
```

— Authored 2026-06-09 by Fable 5 after merging #15–#25 to prod, from a 6-agent verified sweep (5 Linear
distillation lanes over the 45 open issues + 1 repo ground-truth lane at frosty tip). memory.md's dated
tail remains the live status of record; if this prompt and Linear disagree, the issue text wins; if the
issue and the repo disagree, the repo wins — locate by symbol, never by stale line number.
