# ULTRACODE_V2_FINISH — Advisor Comp Studio: finish EVERYTHING (goal-loop run-prompt · Fable 5)

> **What this is.** A complete, self-contained **goal-loop** prompt for the next session(s), written for
> the **Claude Fable 5** model. The goal is the FULL remaining build: **every open implementation ticket
> to Done** — M10 · Engine v2 (the unfreeze is SIGNED OFF), M10's UI wave, all of M11 · Trajectory &
> lifecycle, the remaining M12 · Governance issues, the legacy-triage leftovers, and the M6 hardening
> pair. 35 open issues, pre-ordered below. You LOOP: take the next issue in wave order → run the
> per-issue DoD → **merge on green** → flip Linear Done → memory.md → next. No per-issue check-ins.
>
> **Authorization (quote it when you act on it):** Robin, 2026-06-10 — *"finish all of the work (all
> remaining tickets which is implementation work). Nothing is blocked."* That sentence (a) signed off
> COM-140 → **the engine unfreeze is OPEN** under `engine/ENGINE_V2_RFC.md` §7; (b) **lifted the COM-139
> hold** → merge PR #68; (c) extends merge-on-green to every green PR in this prompt, engine PRs included
> when they satisfy §7. Excluded by Robin the same day: **COM-36** ("deal with later").
>
> **First four actions, every session:** (1) read `memory.md`'s dated tail (live status of record);
> (2) read `CLAUDE.md` + `DESIGN_SYSTEM.md`; (3) read `engine/ENGINE_V2_RFC.md` IN FULL — it is the
> engine-wave contract; (4) read the next COM issue in full on Linear before building it (this prompt
> distills, the issue is canonical; where the RFC and an issue disagree, the RFC's reconciled position
> wins — it was adversarially verified against the issues on 2026-06-10 and the deltas are §4 decisions).

---

## 0. State at handoff (2026-06-10, post-M9-gate session)
- **frosty (`claude/frosty-pasteur-8cf1db`) = deploy branch**, tip `3bf3e20`. M9 GATED (44 issues, PRs
  #26–#69). `main` synced to the gated state (93d6073). **PR #68 (COM-139) is OPEN and now UNBLOCKED**
  — merge it first. **PR #70 (COM-140) MERGED**: `engine/ENGINE_V2_RFC.md` + `engine/engine.v2.test.mjs`
  (**37 passed / 0 failed / 6 pending(v2)**). COM-140 is Done on Linear (Robin's sign-off recorded).
- **Open queue (35):** M10 engine COM-142→154 + **COM-171** (the single SCHEMA-6 bump, created from RFC
  §8) + COM-87 (tombstone) · M10 UI COM-147/148/149 · M11 COM-155–165 · M12 COM-166–170 · legacy
  COM-28/21/31/61 · M6 COM-34/35 · epics COM-5/COM-7 (close-with-evidence at the end).
  **Human-only (comment status, never build):** COM-33 (Vercel Deployment Protection — dashboard),
  COM-36 (Robin: later), COM-71 (Vercel personal-scope re-auth).
- **Linear blocking relations now encode the RFC §8 order** — `list_issues`/`get_issue` show blockedBy;
  an issue is takeable when its blockers are Done.
- **The three suites:** `node engine/engine.test.mjs` (22, v1 contract — root run needs
  `dangerouslyDisableSandbox:true`) · `node scaffold/engine.test.mjs` (22, same) ·
  `node engine/engine.v2.test.mjs` (T1–T4 must stay 0 failed; T5's six PENDING bindings flip to LIVE
  assertions in the PR that ships each export — flipping them is part of that PR's DoD).

## 1. Non-negotiables (updated for the unfreeze — keep in working memory)
- **THE ENGINE IS NO LONGER FROZEN — it is GATED.** Engine edits happen in **`scaffold/src/engine.ts`**
  (the live engine; root `engine/engine.ts` is the v1 historical reference, sandbox-READ-DENIED — never
  touch or fight it). An engine PR lands ONLY under the **five-condition unfreeze rule (RFC §7)**:
  both 22-vector suites green & unmodified (they are self-contained v1-semantics contracts — v2 must
  KEEP v1's walk/net-of-strike/gating anchors true: bridge 57,217 → C 118,707 · strike $1,572.95 ·
  TGE FDV $600M) · `engine.v2.test.mjs` 0 failed with the PR's exports' PENDING bindings flipped live
  (mirror engine changes into the spec-file per its header convention — the suite is a copy, not an
  import; un-mirrored edits are the #1 silent-rot risk) · one issue per PR ≤450 LOC · presentation in
  its own issue · **only COM-171 may touch `SCHEMA`**.
- **Pins unchanged:** frappe-ui **0.1.278 exact** (components-only, NEVER `app.use(FrappeUI)`, no data
  layer) · frappe-charts **1.6.2** · vue ^3.5 · tailwind ^3.4. frappe-ui Skill for component work;
  verify a component EXISTS in 0.1.278 before designing around it.
- **Internal & CONFIDENTIAL · net of strike · "discussion draft, not a binding offer."** Legal corpus
  VERBATIM from the governing documents; after PR #68 merges, **Plan v9 / spec Appendix C is the source
  of truth on the CoC line, not the reference TSX**.
- **≤450 LOC per issue · one issue = one PR (`Fixes COM-NNN`) · QA gate green · dated memory.md entry
  per issue** (`docs(memory):` commit on the same branch). Commit footer:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- **DESIGN_SYSTEM.md governs all visuals.** New M11/M12 surfaces: WCAG 2.1 AA at birth (M7 bar), reading
  column, borders earn their place, amber = current/active + status only.
- **Views never compute money** — every new number crosses the engine boundary as an export.

## 2. The goal loop (run until the queue is empty)
```
while (queue has issues) and (no tripwire):
  1. next issue per §3 wave order (Linear blockedBy must be Done) → flip In Progress → read IN FULL
  2. branch off origin/frosty (fetch first; independent branches — each merges immediately)
  3. implement ≤450 LOC inside the §1 rules (engine PRs: RFC §7; UI PRs: DESIGN_SYSTEM.md)
  4. QA gate: (cd scaffold && vp check) — NEVER `vp check --fix` (it auto-"fixes" the engine; caught
     mutating it 2026-06-10; targeted `vp fmt <files> --write` only) → ALL THREE suites green
     (§0; engine PRs also flip their T5 bindings) → (cd scaffold && npm run build) exit 0 →
     preview-verify on :4173 (it serves the BUILT dist — rebuild first; localStorage surgery with a
     sessionStorage backup for fixtures; computed styles for sub-pixel claims)
  5. /code-review the diff · security-review for engine/money/legal/auth/persistence surfaces
  6. revert generated churn (components.d.ts, auto-imports.d.ts, package-lock.json) → commit
     `feat|fix(COM-NN): …` → memory.md entry → push → PR `Fixes COM-NN` → gh pr merge --merge →
     flip Linear Done (save_issue state:"Done" — Fixes does NOT auto-flip)
  7. every ~5 merges OR at each wave boundary: re-verify frosty (fetch → build 0 → three suites green)
stop conditions: a §4-unlisted product decision that changes money semantics · a legal-corpus question
outside Δ4 · data-loss risk in COM-171/COM-35 migrations you cannot round-trip-test · queue empty →
FINAL GATE (§3 wave 7)
```

## 3. Wave order (dependency-encoded on Linear; sizes from the issues)

**WAVE 0 — unblock & sync (first 30 minutes):**
1. **Merge PR #68** (COM-139, Δ4 CoC correction — hold lifted by Robin 2026-06-10) → flip COM-139 Done.
   If Charlie later amends the wording, that's a new `fix(copy)` issue — do not reopen.
2. Re-verify frosty: fetch → build 0 → three suites green. Confirm Linear shows COM-140 Done.

**WAVE 1 — M10 engine (STRICT order; every PR under RFC §7):**
3. **COM-142** (M) constitutional baseline + 13.10 pool guardrail — named fields over magic numbers;
   ship BOTH pool presets; printed 8,523 gets the recomputed-footnote (8,526.49 exact — RFC §9 caveat).
4. **COM-143** (L — SPLIT engine/UI PRs) scenario sets + walk-forward composition; A.3 notes 1–6
   verbatim; parity vectors into the v2 suite. *On land: per COM-87's tombstone, fold any residual
   per-advisor-roadmap requirement into the COM-143 spec, then close COM-87 as duplicate.*
5. **COM-144** (M) `Grant[]` per person + per-grant strike/FMV; the §5-RFC migration shim (derive, don't
   materialise — `SCHEMA` stays 5); `lifecycle` AND `docStatus` are SEPARATE fields (RFC §3, verified
   delta vs the issue text).
6. **COM-145** (M) dual vesting curves: equity = the existing annual-step `vestedFrac` shape (T2 pins
   it); NEW `vestedFracRTA` (75%/36 monthly — RFC D1) + `distributableFrac` (24-month gate).
7. **COM-150** (M) value→quantity + dollar value bands. Band anchors = open decision #2 → ship the
   issue's own Configure-editable defaults (Base $50K · Strategic $100K · Anchor $150K/yr) flagged
   "pending Robin + Carl review" in the PR body; tier-multiplier mode survives as a migration alias.
8. **COM-153** (M) leaver engine — export name is **`modelDeparture(advisor, leaverType, date)`**
   (per the issue; the RFC conformed to it); plan-disqualification warnings surface, never compute.
9. **COM-151** (M) exercise windows + Clause 3.6 backstop + net-exercise/sell-to-cover. ALSO carries
   the Part 10 #7 funding-round-carve-out explainer line (scope comment on the issue, 2026-06-10).
10. **COM-152** (S) token→equity 1:1 pre-TGE fallback toggle.
11. **COM-146** (M) capital-introduction schedule + board rollup (powers COM-161).
12. **COM-154** (S) cash-floor trade + affordability vs burn. Policy = open decision #3 → ship it
    **configurable, default disallowed**, flag in the PR body.
13. **COM-171** (S–M) the single SCHEMA-6 bump — LAST engine PR; v5→v6 loss-free round-trip vectors
    (localStorage map AND `#s=` hash) in the same PR; deletes `cocAccelPct` (needs #68 merged — wave 0).

**WAVE 2 — M10 UI (each over its engine issue):**
14. **COM-149** (S) VestingTimeline dual curves (equity staircase vs token ramp + 24-month marker).
15. **COM-147** (M) Configure scenario-set editor + auto headline callouts.
16. **COM-148** (M) global scenario-set switcher + set diff + same-advisor A/B compare.

**WAVE 3 — M11 trajectory & lifecycle (order by data dependency):**
17. **COM-155** (M) lifecycle/domain spine: Person fields (residency · checks · contracting), Review
    entity, doc-status states — state + reconcile defaults, no SCHEMA bump (additive, like governance).
18. **COM-159** (M) offer pipeline (F19): lifecycle stage chips, modeled → … → signed → active.
19. **COM-160** (S) seed the confirmed roster + entity facts (Rob Reoch · Martin Keller · Kerim
    Derhalli — lifecycle stages per the 5 Jun session; facts VERBATIM from the spec).
20. **COM-157** (M–L) Trajectory view (F15): per-advisor timeline — grants · reviews · milestones ·
    rounds · TGE · backstop + the floor→base→ceiling band. Custom SVG; reading-column document.
21. **COM-158** (M) review workflow (F16): run review → outcome → top-up grant at current FMV.
22. **COM-162** (M) fundraising-event triggers (F17): round close → re-price, crystallise capital
    uplifts, Series-A structural-review flag.
23. **COM-163** (M) departure modeling UI (F18) over `modelDeparture` — six-limb test, vested-to-date
    per instrument, pools recompute.
24. **COM-161** (M) board capital panel (F20/O15) over COM-146's rollup.
25. **COM-164** (M) proposition versioning per advisor (the straw-man artefact through negotiation).
26. **COM-156** (M) benchmarks & generosity guardrails: band-breach, totality, reserve/pool thresholds,
    day-rate test.
27. **COM-165** (S, Low) Ispahani 9-step "New grant decision" wizard (B.3 verbatim sequence).

**WAVE 4 — M12 governance (over the COM-141 surface):**
28. **COM-166** (M) consent matrix as data (A.6 verbatim: Pantera ×3, Lightspeed s.6(a), MFN survivals,
    pro-rata) attached to the grants/rounds they gate.
29. **COM-167** (M) blocking semantics: gated-grant warning chips + the Proposition "pre-conditions
    outstanding" watermark until governance is green (success criterion #6: no exec-officer grant
    "granted" while Pantera consent is red).
30. **COM-168** (S) valuation record (F22): one SAV/409A entry, consistent everywhere.
31. **COM-169** (M) exercise-event runbook (F23) over COM-151/153/168: window check, net-exercise
    election, s431 14-day + countersign, 83(b), PSC routing, deed undertaking.
32. **COM-170** (M) append-only audit log (grant/review/consent/valuation changes; M6 precursor).

**WAVE 5 — legacy triage (verify-then-close-or-fix; NEVER close dirty):**
33. **COM-28** (M3 upside curve) · **COM-21** (M5 colour-blind/a11y/empty states) · **COM-31** (M5
    mobile + print paths) · **COM-61** (M8 progressive disclosure). For each: read the issue, audit the
    live repo against EVERY line of its scope (M7/M9 shipped most of it), then EITHER close Done with
    an evidence comment (what shipped, where, which PR) OR implement the residual gap (≤450) and then
    close. Then close epics **COM-5** and **COM-7** the same way (their children must all be resolved).

**WAVE 6 — M6 hardening (LAST — biggest blast radius; security-review MANDATORY on both):**
34. **COM-34** (L) authentication. Read the issue in full; default provider = Supabase Auth (same
    vendor as COM-35 — flag in the PR body if the issue names another). Gate every route; the engine
    stays client-side; no confidential figure renders pre-auth.
35. **COM-35** (L) server-side persistence — Supabase Postgres (named IN the issue; the Supabase MCP
    is connected). Boards + governance + the new M11 state per user; **RLS row isolation from the first
    migration**; localStorage → server migration with a loss-free round-trip test and a local-only
    fallback for dev; `#s=` share links become access-controlled. Split schema/auth-wiring/migration
    into separate PRs if >450 each. STOP-condition applies if a migration cannot be round-trip-tested.
   *(COM-33/71/36 stay human-only: comment current status on each, leave open.)*

**WAVE 7 — FINAL GATE:** full sweep — build 0 · three suites green with ALL T5 bindings live ·
all-routes preview smoke (incl. /governance + every new M11/M12 surface) mobile + desktop · zero
console errors · print-PDF note for Robin → Linear: every milestone progress check, epics closed,
human-only issues commented, **project status update** → memory.md gate entry → update `CLAUDE.md`'s
live-prompt pointer (next: M6 dashboard items + whatever Robin queues) → flag follow-ups, stop.

## 4. Pre-made decisions (DO NOT re-ask; cite source + date)
- **Robin 2026-06-10:** everything in the header authorization block — COM-140 signed off · COM-139
  hold lifted (merge #68) · merge-on-green for all green PRs incl. engine PRs under §7 · COM-36 later.
- **RFC (merged PR #70, adversarially verified):** D1 RTA rate = 75%/36 · D2 printed-figure-wins
  (±1 share/±$0.01) · D3 derive-don't-materialise until COM-171 · `lifecycle` vs `docStatus` split ·
  `modelDeparture` name · COM-151 carries the carve-out doc note · 15% pool cell footnote (8,526.49).
- **Defaults set BY THIS PROMPT (flag in PR bodies, proceed unless vetoed):** COM-150 band anchors =
  the issue's $50K/$100K/$150K Configure-editable defaults · COM-154 cash-floor default disallowed,
  rate configurable · COM-34 provider = Supabase Auth · M11/M12 state slices = additive reconcile-safe
  defaults (NO SCHEMA bump — only COM-171 bumps; if an M11 slice genuinely needs the persisted shape
  to change, fold it into COM-171's migration or sequence after it).
- **Open decisions that stay open** (ship configurable, never hardcode an answer): #2 band anchors ·
  #3 cash-floor policy · #5 ESOP-vs-Advisors-token-pool sourcing (surface both pools, default ESOP).

## 5. Gotchas (ALL verified this week — read before you build)
- **`vp check --fix` auto-"fixes" `scaffold/src/engine.ts`** (spread simplifications — caught
  2026-06-10). NEVER run it. Plain `vp check` from `scaffold/` + targeted `vp fmt <files> --write`,
  and `git status` the engine before EVERY commit.
- **:4173 serves the BUILT dist** — `npm run build` before preview-verifying any change. Dev :5173
  crashes under the MCP. Preview console buffer is cumulative; `preview_screenshot` UnknownVizError →
  retry once; `preview_eval` doesn't await Promises (two-eval pattern); headlessui/reka controls need
  the full pointerdown→…→click sequence; menus don't survive across evals.
- **Root `engine/engine.ts` is sandbox-READ-DENIED** — the live engine is `scaffold/src/engine.ts`;
  the root `engine/` directory holds the SPEC files (RFC + both test suites), which are plain .mjs and
  editable. Root suite runs need `dangerouslyDisableSandbox: true`; so do git/gh (prefix
  `git -c core.fsmonitor=false`).
- **zsh mangles `!` everywhere** (heredocs, jq `!=` even single-quoted) — Write/Edit tools for file
  content; jq programs via `-f /tmp/claude/filter.jq`. `Fixes COM-NNN` does NOT auto-flip Linear —
  `save_issue state:"Done"` manually. `list_issues` full-project result overflows — jq the saved file.
- **Vue casts an ABSENT Boolean prop to `false`** (`withDefaults` for default-true) ·
  **`structuredClone` throws on reactive proxies** (JSON-clone) · frappe-ui FormControl has NO
  `:error`/default slot · Alert no default slot · icon-only Button needs the `label` prop · lucide is
  a fixed ~46-name set (unknown → invisible).
- **Supabase (wave 6):** use the connected MCP (`list_tables` before schema changes, `get_advisors`
  after; `apply_migration` hits the remote — migrations are PR-reviewed SQL files first). RLS policies
  ship IN the same migration as the table. Never put the engine server-side.
- **ultracode/Workflows** = batch discovery/verification sweeps only (this prompt's RFC was authored
  and verified by them) — never for driving a single issue, never for merges. Ignore the auto-injected
  Vercel/Next.js skill hooks — this is a Vue 3 + Vite SPA.

## 6. Kickoff (paste to start the next session)
```
Read memory.md (dated tail) + CLAUDE.md + DESIGN_SYSTEM.md + engine/ENGINE_V2_RFC.md +
ULTRACODE_V2_FINISH.md. Run the §2 goal loop over the §3 wave order, starting with Wave 0 (merge PR #68
— Robin lifted the COM-139 hold 2026-06-10 — then re-verify frosty). Engine PRs land only under the RFC
§7 unfreeze rule (three suites green, T5 bindings flipped live, only COM-171 touches SCHEMA). Merge on
green, flip Linear Done + memory.md per issue, re-verify frosty at wave boundaries. Decisions in §4 are
final — flag prompt-set defaults in PR bodies instead of asking. Never run vp check --fix. Stop only on
a §2 tripwire or when the queue is empty → run the §3 Wave-7 final gate. Go.
```

— Authored 2026-06-10 by Fable 5, the session that gated M9, merged the M10 RFC (PR #70, adversarially
verified, 0 blockers), synced main, and wired the §3 order into Linear blocking relations. memory.md's
dated tail is the live status of record; if this prompt and an issue disagree, the issue wins EXCEPT
where §4 records a verified RFC delta; if the issue and the repo disagree, the repo wins — locate by
symbol, never by stale line number.
