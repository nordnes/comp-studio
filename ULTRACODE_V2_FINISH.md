# ULTRACODE_V2_FINISH v2 — finish EVERYTHING, then perfect it (goal-loop run-prompt · Fable 5)

> **What this is.** A complete, self-contained **goal-loop** prompt for the next session(s), written
> for the **Claude Fable 5** model, redesigned around the loop recipe in Lance Martin's "Designing
> loops with Fable 5" (Anthropic, 2026-06): *don't steer the model — give it a goal/rubric as
> environment feedback, let it run, self-correct, and proceed until the rubric is satisfied; grade
> with an INDEPENDENT verifier sub-agent in a fresh context window, because self-critique on your own
> outputs underperforms.* The goal here is total: **every open implementation ticket Done** (M10 ·
> Engine v2 — the unfreeze is SIGNED OFF — M10 UI, all of M11, the remaining M12, legacy triage, M6
> hardening) **and then self-perfection loops on UI/UX, functionality, testing and robustness until
> `RUBRIC_V2_FINISH.md` grades green end-to-end.**
>
> **THE GOAL IS THE RUBRIC.** `RUBRIC_V2_FINISH.md` (repo root) is the checkable-criteria file. The
> run may not stop while any criterion FAILS un-waived — "queue empty" is the midpoint, not the end.
> If your Claude Code build has the **`/goal`** primitive, register the rubric with it at kickoff so
> the harness holds you to it; if not, §2's grader loop enforces the same contract manually.
>
> **Authorization (quote it when you act on it):** Robin, 2026-06-10 — *"finish all of the work (all
> remaining tickets which is implementation work). Nothing is blocked."* That sentence (a) signed off
> COM-140 → **the engine unfreeze is OPEN** under `engine/ENGINE_V2_RFC.md` §7; (b) **lifted the
> COM-139 hold** → merge PR #68; (c) extends merge-on-green to every green PR in this prompt, engine
> PRs included when they satisfy §7. Same day, Robin commissioned the perfection loop: *"self-
> perfection on UI/UX and functionalities, testing, etc."* Excluded by Robin: **COM-36** ("later").
>
> **First five actions, every session:** (1) read `memory.md`'s dated tail — and CONSULT its
> distilled rules before re-deriving anything (the outer memory loop: fail → investigate → verify →
> distill → consult); (2) read `CLAUDE.md` + `DESIGN_SYSTEM.md`; (3) read `engine/ENGINE_V2_RFC.md`
> IN FULL — the engine-wave contract; (4) read `RUBRIC_V2_FINISH.md` IN FULL — the goal; (5) read
> the next COM issue in full on Linear before building it (this prompt distills, the issue is
> canonical; where the RFC and an issue disagree, the RFC's reconciled position wins — §4 records
> the verified deltas).

---

## 0. State at handoff (2026-06-10, post-M9-gate session)
- **frosty (`claude/frosty-pasteur-8cf1db`) = deploy branch.** M9 GATED (44 issues, PRs #26–#69).
  `main` synced (93d6073). **PR #68 (COM-139) OPEN and now UNBLOCKED** — merge it first. **PR #70
  (COM-140) MERGED**: `engine/ENGINE_V2_RFC.md` + `engine/engine.v2.test.mjs` (**37 passed / 0
  failed / 6 pending(v2)**). COM-140 is Done on Linear (Robin's sign-off recorded on the issue).
- **Open queue (39 buildable):** M10 engine COM-142→154 + **COM-171** (the single SCHEMA-6 bump) +
  COM-87 (tombstone) · M10 UI COM-147/148/149 · M11 COM-155–165 · M12 COM-166–170 · legacy
  COM-28/21/31/61 · M6 COM-34/35 · epics COM-5/COM-7 (close-with-evidence) — plus COM-139 in Wave 0.
  **Human-only (comment status, never build):** COM-33 (Vercel Deployment Protection) · COM-36
  (Robin: later) · COM-71 (Vercel re-auth).
- **Linear blocking relations encode the RFC §8 order** — an issue is takeable when its blockers
  are Done. **The suites:** `node engine/engine.test.mjs` (22, v1 contract — MAY need
  `dangerouslyDisableSandbox:true`, harness-dependent; try sandboxed first) ·
  `node scaffold/engine.test.mjs` (22) · `node engine/engine.v2.test.mjs` (T1–T4 stay 0 failed;
  each T5 PENDING binding flips to a LIVE assertion in the PR that ships its export) · plus the
  store round-trip suite once R5.2 creates it (wire it into the documented QA gate — an unwired
  suite rots invisibly).

## 1. Non-negotiables (keep in working memory)
- **THE ENGINE IS GATED, NOT FROZEN.** Engine edits happen in **`scaffold/src/engine.ts`** (the live
  engine; root `engine/engine.ts` is the v1 historical reference, sandbox-READ-DENIED — never touch
  or fight it). An engine PR lands ONLY under the **five-condition unfreeze rule (RFC §7)**: both
  22-vector suites green & unmodified (self-contained v1-semantics contracts — v2 KEEPS v1's
  walk/net-of-strike/gating anchors: bridge 57,217 → C 118,707 · strike $1,572.95 · TGE FDV $600M) ·
  `engine.v2.test.mjs` 0 failed with the PR's PENDING bindings flipped live (mirror engine changes
  into the spec-file per its header convention — it is a copy, not an import; un-mirrored edits are
  the #1 silent-rot risk) · one issue per PR ≤450 LOC · presentation in its own issue · **only
  COM-171 may touch `SCHEMA`**.
- **Pins:** frappe-ui **0.1.278 exact** (components-only, NEVER `app.use(FrappeUI)`, no data layer) ·
  frappe-charts **1.6.2** · vue ^3.5 · tailwind ^3.4. frappe-ui Skill for component work; verify a
  component EXISTS in 0.1.278 before designing around it.
- **Internal & CONFIDENTIAL · net of strike · "discussion draft, not a binding offer."** Legal
  corpus VERBATIM from the governing documents; after PR #68 merges, **Plan v9 / spec Appendix C is
  the source of truth on the CoC line, not the reference TSX**.
- **≤450 LOC per issue · one issue = one PR (`Fixes COM-NNN`) · QA gate green · dated memory.md
  entry per issue** (`docs(memory):` commit on the same branch). Commit footer:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- **DESIGN_SYSTEM.md governs all visuals.** New surfaces: WCAG 2.1 AA at birth. **Views never
  compute money** — every new number crosses the engine boundary as an export.

## 2. Loop architecture (three nested loops + the memory outer loop)

**INNER — per issue** (as before, unchanged):
```
next issue per §3 (Linear blockedBy Done) → In Progress → read IN FULL → branch off origin/frosty
→ implement ≤450 LOC (§1 rules) → QA gate: (cd scaffold && vp check) [NEVER --fix] → ALL suites
→ build exit 0 → preview-verify on :4173 (BUILT dist — rebuild first) → /code-review the diff
(security-review for engine/money/legal/auth/persistence) → revert generated churn → commit →
memory.md entry → push → PR `Fixes COM-NN` → gh pr merge --merge → flip Linear Done (manual)
```

**MID — wave boundary** (every §3 wave, and every ~5 merges inside a wave):
re-verify frosty (fetch → build 0 → all suites) **and run a scoped grader**: spawn ONE fresh
sub-agent with only `RUBRIC_V2_FINISH.md` + the criteria the wave claims to satisfy → it tries to
FAIL them on the live repo/preview → fix every FAIL before the next wave; its verdicts commit to
`docs/rubric-grades/`. At each milestone-completing boundary, also verify production: frosty
auto-deploys, so fetch `comp-studio-one.vercel.app` and confirm it serves the new tip's bundle
(the R8.5 method) — three milestones must not pile up unverified in prod. *Graders are sub-agents,
never yourself in-context — self-critique on your own outputs underperforms (the article's core
finding; an independent context window has no memory of your intentions, only the evidence).*

**OUTER — the perfection loop** (starts when the §3 queue is empty; this is §3 Wave 7):
```
repeat:
  1. GRADE: ultracode Workflow — a grader PANEL over the FULL rubric, one fresh-context grader per
     rubric section (R1–R8), each prompted to FAIL criteria, returning per-criterion verdicts +
     evidence. Graders get ONLY the rubric's defined inputs (see its protocol block); every
     panel's verdicts COMMIT to `docs/rubric-grades/<NNN>-<date>.md` — self-reported grades
     don't exist (R8.4 checks the trail).
  2. FIX: turn every FAIL into a work item. Prefer STRUCTURAL fixes over scalar nudges (Fable 5's
     verified strength — bet on the architecture-level change and push through regressions, don't
     tweak constants at the margin). Bundle micro-fixes ≤450 LOC as `fix(rubric): R4.3 …` PRs;
     anything issue-shaped gets a real Linear issue first.
  3. DISTILL: each FAIL that cost a debug loop becomes a general rule in memory.md
     (failure → verified diagnosis → rule), not an incident note.
until two consecutive panels return ZERO FAILs — new OR repeat (loop-until-dry; "no new fails"
with a standing repeat-FAIL is NOT an exit). Rubric criteria may be TIGHTENED mid-run via docs:
PRs; never loosened to pass (R8.4 audits the rubric's git history).
```

**MEMORY — the cross-session outer loop:** consult memory.md's rules before deriving; document every
failure when it happens; verify diagnoses into checked facts before writing them down; distill into
general rules; the next session consults instead of re-deriving. This is what makes a multi-session
run converge instead of thrash.

**Stop conditions** (the ONLY ways the run ends): every rubric criterion PASS or Robin-waived →
final gate (§3 Wave 8) · a §4-unlisted product decision that changes money semantics · a
legal-corpus question outside Δ4 · data-loss risk in COM-171/COM-35 migrations you cannot
round-trip-test. "Context is long" and "tests are green" are NOT stop conditions.

## 3. Wave order (dependency-encoded on Linear; sizes from the issues)

**WAVE 0 — unblock & sync (first 30 minutes):**
1. **Merge PR #68** (COM-139 — hold lifted by Robin 2026-06-10) → flip COM-139 Done. If Charlie
   later amends the wording, that's a new `fix(copy)` issue — do not reopen.
2. **Commit the goal artifacts** if not already on frosty: `RUBRIC_V2_FINISH.md` + this file
   (graders must receive a VERSIONED rubric — R8.4 audits its history from that commit). Resolve
   the untracked `OBJECTIVES_AND_FLOWS.md`: delete it in the same `docs:` PR (it's a pre-spec-v2
   draft whose "frozen engine"/"no backend" claims are now false — superseded by
   `COMP_STUDIO_SPEC_v2.md`; Robin can veto on the PR).
3. Re-verify frosty: fetch → build 0 → all suites green. Register `RUBRIC_V2_FINISH.md` with
   `/goal` if the primitive exists in this CLI build.

**WAVE 1 — M10 engine (STRICT order; every PR under RFC §7):**
3. **COM-142** (M) constitutional baseline + 13.10 pool guardrail; BOTH pool presets; printed 8,523
   carries the recomputed footnote (8,526.49 exact — RFC §9 caveat).
4. **COM-143** (L — SPLIT engine/UI PRs) scenario sets + walk-forward; A.3 notes 1–6 verbatim;
   parity vectors into the v2 suite. *On land: fold any residual per-advisor-roadmap requirement
   into the COM-143 spec per COM-87's tombstone, then close COM-87 as duplicate.*
5. **COM-144** (M) `Grant[]` + per-grant strike/FMV; derive-don't-materialise shim (SCHEMA stays 5);
   `lifecycle` AND `docStatus` are SEPARATE fields (RFC §3, verified delta vs the issue text).
6. **COM-145** (M) dual vesting curves: equity = the existing annual-step `vestedFrac` (T2 pins it);
   NEW `vestedFracRTA` (75%/36 — RFC D1) + `distributableFrac` (24-month gate).
7. **COM-150** (M) value→quantity + dollar bands. Anchors = open decision #2 → ship the issue's
   Configure-editable defaults ($50K/$100K/$150K) flagged "pending Robin + Carl review";
   tier-multiplier mode survives as a migration alias.
8. **COM-153** (M) leaver engine — export is **`modelDeparture(advisor, leaverType, date)`** (per
   the issue; RFC conformed); plan-disqualification warnings surface, never compute.
9. **COM-151** (M) exercise windows + Clause 3.6 backstop + net-exercise/sell-to-cover; ALSO the
   Part 10 #7 carve-out explainer line (scope comment on the issue, 2026-06-10).
10. **COM-152** (S) token→equity 1:1 pre-TGE fallback toggle.
11. **COM-146** (M) capital-introduction schedule + board rollup (powers COM-161).
12. **COM-154** (S) cash-floor trade + affordability vs burn — configurable, default disallowed
    (open decision #3), flag in the PR body.
13. **COM-171** (S–M) the single SCHEMA-6 bump — LAST engine PR; loss-free v5→v6 round-trip vectors
    (localStorage map AND `#s=` hash) in the same PR; deletes `cocAccelPct` (needs #68 — wave 0).

**WAVE 2 — M10 UI:** 14. **COM-149** (S) VestingTimeline dual curves · 15. **COM-147** (M)
scenario-set editor + headline callouts · 16. **COM-148** (M) global set switcher + diff + A/B.

**WAVE 3 — M11 (data-dependency order):** 17. **COM-155** (M) lifecycle/domain spine (additive
reconcile-safe state, NO SCHEMA bump) · 18. **COM-159** (M) offer pipeline F19 · 19. **COM-160** (S)
seed the confirmed roster (Rob Reoch · Martin Keller · Kerim Derhalli — facts VERBATIM from the
spec) · 20. **COM-157** (M–L) Trajectory view F15 · 21. **COM-158** (M) review workflow F16 ·
22. **COM-162** (M) fundraising-event triggers F17 · 23. **COM-163** (M) departure UI F18 over
`modelDeparture` · 24. **COM-161** (M) board capital panel F20/O15 · 25. **COM-164** (M) proposition
versioning · 26. **COM-156** (M) benchmarks & generosity guardrails · 27. **COM-165** (S) Ispahani
9-step wizard (B.3 verbatim).

**WAVE 4 — M12 (over the COM-141 surface):** 28. **COM-166** (M) consent matrix as data (A.6
verbatim) · 29. **COM-167** (M) blocking semantics + Proposition watermark (success criterion #6) ·
30. **COM-168** (S) SAV/409A valuation record F22 · 31. **COM-169** (M) exercise runbook F23 over
151/153/168 · 32. **COM-170** (M) append-only audit log.

**WAVE 5 — legacy triage (verify-then-close-or-fix; NEVER close dirty):**
33. **COM-28 · COM-21 · COM-31 · COM-61**: read the issue, audit the live repo against EVERY scope
    line (M7/M9 shipped most of it), then EITHER close Done with an evidence comment (what shipped,
    where, which PR) OR implement the residual gap (≤450) and close. Then epics **COM-5 + COM-7**
    the same way (children must all be resolved first).

**WAVE 6 — M6 hardening (security-review MANDATORY on both):**
34. **COM-34** (L) authentication — default provider Supabase Auth (same vendor as COM-35; flag if
    the issue names another). Gate every route; the engine stays client-side; pre-auth, no
    confidential figure may render (DOM-level check, not redirect-level).
35. **COM-35** (L) server-side persistence — Supabase Postgres (named in the issue; the MCP is
    connected). **RLS row isolation from the first migration**; localStorage → server migration
    with a loss-free round-trip test + a local-only dev fallback; `#s=` links become
    access-controlled. Split schema / auth-wiring / migration PRs if >450 each. The §2 stop
    condition applies to any migration you cannot round-trip-test.
   *(COM-33/71/36: comment current status, leave open.)*

**WAVE 7 — THE PERFECTION LOOP** (§2 OUTER): grade the full rubric with a fresh grader panel →
fix every FAIL (structural over scalar) → distill → repeat until two consecutive clean panels.
Expected first-pass FAILs worth anticipating: R3 flows that no issue owned end-to-end · R4.3 mobile
on the new M11 surfaces · R5.2 round-trip coverage for the M11 slices · R6.1 bundle budget after
three milestones of code (the structural fix is route-level code-splitting, not tree-shake nudges).

**WAVE 8 — FINAL GATE:** the rubric's R8 section IS the gate: re-sync `main` (or the COM-36-ready
comment) · Linear milestone sweep + project status update WITH the final panel's grade summary ·
memory.md gate entry + distilled rules · CLAUDE.md pointer to whatever comes next · auto-memory
index updated · production check (R8.5).

**WAVE 8.5 — THE CLOSING GRADER (the gate may not certify itself):** after every Wave-8 action,
spawn ONE last fresh-context grader over R1.5 + R7 + R8 (all cheap checks — the criteria that only
come into existence during the gate). Its verdicts commit to `docs/rubric-grades/` like every
panel's. **The run stops ONLY on its all-PASS**; any FAIL → fix → re-run the closing grader.

## 4. Pre-made decisions (DO NOT re-ask; cite source + date)
- **Robin 2026-06-10:** the header authorization block — COM-140 signed off · COM-139 hold lifted ·
  merge-on-green incl. engine PRs under §7 · the perfection loop commissioned · COM-36 later.
- **RFC (merged PR #70, adversarially verified):** D1 RTA rate = 75%/36 · D2 printed-figure-wins
  (±1 share/±$0.01) · D3 derive-don't-materialise until COM-171 · `lifecycle` vs `docStatus` split ·
  `modelDeparture` name · COM-151 carries the carve-out note · 15% pool cell footnote (8,526.49).
- **THIS PROMPT (flag in PR bodies, proceed unless vetoed):** COM-150 band anchors = the issue's
  $50K/$100K/$150K Configure-editable defaults · COM-154 cash-floor default disallowed, rate
  configurable · COM-34 provider = Supabase Auth · M11/M12 slices = additive reconcile-safe defaults
  (only COM-171 bumps SCHEMA; a slice that truly needs the persisted shape folds into COM-171 or
  sequences after it) · R6.1's structural fix = route-level code-splitting · rubric criteria may be
  tightened mid-run, never loosened.
- **Open decisions that stay open** (ship configurable, never hardcode): #2 band anchors · #3
  cash-floor policy · #5 ESOP-vs-Advisors-token-pool sourcing (surface both, default ESOP).

## 5. Gotchas (ALL verified this week — consult before you build, add yours when verified)
- **`vp check --fix` auto-"fixes" `scaffold/src/engine.ts`** (caught 2026-06-10). NEVER run it.
  Plain `vp check` from `scaffold/` + targeted `vp fmt <files> --write`; `git status` the engine
  before EVERY commit.
- **:4173 serves the BUILT dist** — `npm run build` before preview-verifying. Dev :5173 crashes
  under the MCP. Cumulative console buffer (judge by bundle hash) · `preview_screenshot`
  UnknownVizError → retry once · `preview_eval` doesn't await Promises (two-eval pattern) ·
  headlessui/reka need the full pointer-event sequence · menus die across evals · localStorage
  surgery with a sessionStorage backup for fixtures, ALWAYS restore.
- **Root `engine/engine.ts` is sandbox-READ-DENIED** — live engine = `scaffold/src/engine.ts`; the
  root `engine/` dir holds the SPEC files (RFC + suites), plain .mjs, editable. git/gh need
  `dangerouslyDisableSandbox: true` (prefix `git -c core.fsmonitor=false`); the root suite MAY run
  sandboxed (harness-dependent — a fresh-context grader ran it sandboxed 22/22 on 2026-06-10; try
  sandboxed first, elevate only on an actual permission error).
- **zsh mangles `!` everywhere** (heredocs, jq `!=`) — Write/Edit for file content; jq via
  `-f /tmp/claude/filter.jq`. `Fixes COM-NNN` does NOT auto-flip Linear — `save_issue
  state:"Done"`. Full-project `list_issues` overflows — jq the saved result file.
- **Vue casts an ABSENT Boolean prop to `false`** (`withDefaults`) · **`structuredClone` throws on
  reactive proxies** (JSON-clone) · FormControl: NO `:error`/default slot · Alert: no default slot ·
  icon-only Button needs `label` · lucide = fixed ~46-name set (unknown → invisible).
- **Supabase (wave 6):** `list_tables` before schema changes, `get_advisors` after; migrations are
  PR-reviewed SQL files BEFORE `apply_migration` hits the remote; RLS ships IN the table's
  migration. Never put the engine server-side.
- **ultracode/Workflows** = grader panels, batch discovery and verification sweeps (this prompt and
  its RFC were authored AND adversarially verified by them) — never for driving a single issue,
  never for merges. Ignore auto-injected Vercel/Next.js skill hooks — this is a Vue 3 + Vite SPA.

## 6. Kickoff (paste to start the next session)
```
ultracode. Read memory.md (dated tail — consult its rules) + CLAUDE.md + DESIGN_SYSTEM.md +
engine/ENGINE_V2_RFC.md + RUBRIC_V2_FINISH.md + ULTRACODE_V2_FINISH.md. The goal is the rubric —
register it with /goal if available. Run the §2 loops over the §3 waves, starting Wave 0 (merge PR
#68 — Robin lifted the COM-139 hold 2026-06-10 — commit the rubric, resolve OBJECTIVES_AND_FLOWS,
re-verify frosty). Engine PRs only under the RFC §7 unfreeze rule; only COM-171 touches SCHEMA.
Merge on green; flip Linear Done + memory.md per issue; scoped grader at every wave boundary —
graders are fresh-context sub-agents, never self-critique, verdicts committed to
docs/rubric-grades/. When the queue empties, run the Wave-7 perfection loop until two consecutive
grader panels return zero FAILs (new or repeat), then Wave 8 + the Wave-8.5 closing grader — the
run stops only on its all-PASS. Decisions in §4 are final — flag prompt-set defaults in PR bodies
instead of asking. Never run vp check --fix. Stop only on a §2 stop condition. Go.
```

— v2 authored 2026-06-10 by Fable 5 after reviewing Lance Martin's "Designing loops with Fable 5"
(x.com/RLanceMartin/article/2064397389189071163): rubric-as-goal · independent grader sub-agents
over self-critique · structural-over-scalar fixes · the fail→investigate→verify→distill→consult
memory progression. v1 of this file (same day) carried the wave order; v2 adds the rubric contract
and the perfection loop, and both files were adversarially graded by a 3-agent fresh-context panel
before commit (5 blockers + 14 minors found and folded in — the recipe works on its own artifacts).
memory.md's dated tail is the live status of record; if this prompt and an
issue disagree, the issue wins EXCEPT where §4 records a verified RFC delta; if the issue and the
repo disagree, the repo wins — locate by symbol, never by stale line number.
