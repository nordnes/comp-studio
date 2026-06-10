# RUBRIC_V2_FINISH — the goal rubric for the finish-everything run (grader-checkable)

> **What this is.** The GOAL for `ULTRACODE_V2_FINISH.md`'s loop, as a file of **checkable criteria**
> (the Lance Martin "Designing loops with Fable 5" recipe, 2026-06: a well-designed rubric adds
> feedback to the environment; Claude runs, collects feedback, self-corrects, and proceeds until the
> rubric is satisfied — with grading done by an INDEPENDENT verifier sub-agent in a fresh context
> window, never self-critique). **The run may not stop while any criterion FAILS un-waived.**
> This rubric was itself adversarially graded by a 3-agent fresh-context panel before commit
> (2026-06-10): 5 blockers + 14 minors found and folded in.

## Definitions & grading protocol (read first — these bind every criterion)

- **Baseline** = commit `3bf3e20` (frosty tip at authoring). **"New"** = files/exports/routes added
  or modified since: `git diff --name-only 3bf3e20..HEAD`.
- **Sanctioned view-side arithmetic** = an expression that mirrors an existing engine formula over
  exported fields only (no new money semantics). Anything else computing value/price/percent from
  raw state in a view = FAIL R2.5.
- **Grader inputs** (the complete set — nothing else): this file · the repo at
  `/Users/nordnes/dev/comp-studio` · the :4173 preview · the Linear MCP · `gh` · the production URL
  `https://comp-studio-one.vercel.app` · the auto-memory index at
  `/Users/nordnes/.claude/projects/-Users-nordnes-dev-comp-studio/memory/MEMORY.md` · the seeded
  test-user credentials documented in the repo (see R3.10). Graders never see builder reasoning.
- **Dist freshness:** before grading any R3/R4/R6 criterion, the grader runs
  `cd scaffold && npm run build` and confirms the preview serves THAT bundle (hash match) —
  graders never grade a builder-supplied stale dist.
- **Verdict trail:** every grader panel writes per-criterion verdicts + evidence to
  `docs/rubric-grades/<NNN>-<date>.md`, committed. Self-reported grades don't exist.
- **Sampling rule:** where a criterion samples (R1.2, R5.3), the sample is pinned by the criterion;
  ONE discrepancy in a sample = expand to the full population.
- **Waivers:** only Robin waives a criterion. A waiver entry here must cite a resolvable Robin
  artifact (a Linear comment URL authored by Robin, or a dated quote whose source a grader can
  open). **A waiver without a resolvable citation = FAIL.**
- **Tighten-only:** criteria may be tightened mid-run via `docs:` PRs, never loosened. R8.4 makes
  this checkable. A criterion that cannot be mechanically checked is a rubric bug — fix the rubric
  in a `docs:` PR, never grade around it.

## R1 · Build completeness (check: Linear MCP + gh)
- [ ] **R1.1** Every issue in milestones **M10 · Engine v2** (incl. COM-171), **M11 · Trajectory**,
      **M12 · Governance** is `Done` (or Canceled/Duplicate with an evidence comment). Check:
      `list_issues(project="Advisor Comp Studio — Web App (Frappe/Vercel)")`, paginate to
      exhaustion, group client-side on `projectMilestone.name` — zero issues with statusType
      backlog/unstarted/started in milestones starting `M10 ·`, `M11 ·`, `M12 ·`.
- [ ] **R1.2** Legacy queue resolved: COM-28 · COM-21 · COM-31 · COM-61 · COM-87 · epics COM-5 +
      COM-7. Each closing comment cites a PR number AND a file path; grader verifies, for the
      **three lowest-numbered** of the seven, that the cited PR is merged and the cited file
      contains the claimed behaviour (one miss → audit all seven).
- [ ] **R1.3** PR #68 (COM-139) merged; COM-139 Done. Check: `gh pr view 68 --json state` = MERGED.
- [ ] **R1.4** Human-only issues (COM-33 · COM-36 · COM-71) each carry a current-status comment
      dated during this run; still open is CORRECT (do not close).
- [ ] **R1.5** Zero open PRs at the end. Check: `gh pr list` empty.
- [ ] **R1.6** **M6 build pair Done: COM-34 (auth) and COM-35 (server persistence)** — same
      milestone-grouping check as R1.1 on `M6 ·`, with exactly COM-33/36/71 exempt per R1.4.

## R2 · Engine integrity (check: shell)
- [ ] **R2.1** `node engine/engine.test.mjs` → `22 passed, 0 failed.` AND
      `node scaffold/engine.test.mjs` → `22 passed, 0 failed.` (v1 semantics contract holds in v2).
- [ ] **R2.2** `node engine/engine.v2.test.mjs` → **run output** contains `0 failed` and ZERO
      `PENDING(v2)` lines — all six T5 bindings are LIVE assertions against the real v2 exports.
- [ ] **R2.3** The A.3 anchors reconcile in the LIVE engine: a one-off node script imports
      `scaffold/src/engine.ts` (erasable-only TS — node ≥22 runs it directly), calls
      `walkScenario(DEFAULT().plan, 'base')`, asserts bridge 57,217 ±1 · A 75,359 ±1 · B 89,380 ±1
      · C 118,707 ±1 · bridge price $1,572.95 ±$0.01.
- [ ] **R2.4** SCHEMA changed exactly once: `git log -G'SCHEMA = ' --oneline 3bf3e20.. --
      scaffold/src/engine.ts` lists only commits belonging to the COM-171 PR, AND
      `grep -c 'SCHEMA = 6' scaffold/src/engine.ts` = 1, AND the COM-171 round-trip vectors
      (v5 localStorage map + v5 `#s=` hash → v6, loss-free) pass in the v2 suite.
- [ ] **R2.5** Zero unsanctioned money math in views (definition above): grader greps
      `scaffold/src/views scaffold/src/components` for arithmetic on value/price/percent fields
      and cites any line that fails the definition.

## R3 · Functional correctness — drive the real app (check: preview on a fresh-built dist)
Every flow is driven end-to-end with assertions; a flow that cannot complete = FAIL with the step.
- [ ] **R3.1** Add advisor → edit package → set a dollar-denominated grant → rendered quantity
      equals `$value/(FMV−strike)` within display rounding.
- [ ] **R3.2** Add a SECOND grant at a later round → per-grant strikes differ; Instruments panel
      shows both rows (COM-144).
- [ ] **R3.3** Vesting timeline shows the equity staircase AND the token ramp distinctly; before
      month 24 the token distributable reads 0 (COM-145/149).
- [ ] **R3.4** Scenario sets: create/duplicate, star, switch globally, diff two sets side-by-side,
      A/B two packages for one advisor (COM-143/147/148).
- [ ] **R3.5** Review → top-up grant at current FMV appears on the Trajectory timeline
      (COM-157/158).
- [ ] **R3.6** Departure modeling: Bad-Leaver simulation zeroes vested+unvested options and tokens;
      good-leaver shows the Board-discretion flag, never auto-vest (COM-153/163).
- [ ] **R3.7** Governance gating: Pantera consent red → exec-officer grant shows the warning chip
      and the Proposition renders the "pre-conditions outstanding" watermark; flipping green
      clears both (COM-166/167).
- [ ] **R3.8** Capital panel answers the O15 question (introduced vs target vs uplift owed) with
      engine-export numbers (COM-146/161).
- [ ] **R3.9** Exercise runbook walks window-check → election → s431 14-day checklist (COM-169).
- [ ] **R3.10** Persistence + confidentiality, UNCONDITIONAL: full state (boards + governance +
      M11 slices) survives reload AND a fresh browser context behind login; **pre-auth, no
      confidential figure renders in the DOM on any route** (DOM sweep, not redirect check).
      Credentials: the COM-34 PR must document seeded test users in the repo
      (`docs/TEST_USERS.md` or `.env.example`) — absent documentation = FAIL.
- [ ] **R3.11** Offer pipeline: walk a grant modeled → proposed → signed → active; stages persist
      across reload (COM-159).
- [ ] **R3.12** Fundraising trigger: close a round → affected grants re-price and gated capital
      uplifts crystallise, with engine-export numbers changing accordingly (COM-162).
- [ ] **R3.13** Proposition versioning: save two versions for one advisor, diff them, print the
      current one (COM-164).
- [ ] **R3.14** Ispahani wizard: complete all 9 steps → a decision artefact persists and is
      reachable afterwards (COM-165).
- [ ] **R3.15** Guardrails: breach a band (e.g. oversized grant) → alert fires; correct it →
      alert clears (COM-156).
- [ ] **R3.16** Toggles with money-visible deltas: the pre-TGE 1:1 fallback ON re-states token
      value as equity (COM-152); a cash-floor trade reduces instrument value at the configured
      rate and the affordability warning fires past the threshold (COM-154).
- [ ] **R3.17** SAV/409A valuation entered once → the identical figure appears on every surface
      that shows it (grader enumerates the surfaces; COM-168).
- [ ] **R3.18** Audit log appends entries for: a grant change, a consent flip, a valuation edit
      (COM-170).
- [ ] **R3.19** Every flow above leaves the app clean: `preview_console_logs(level:error)` = zero
      entries after a fresh reload per flow; localStorage JSON equals the pre-flow snapshot after
      fixture restore.

## R4 · UI/UX quality — the self-perfection bar (check: preview + screenshots + computed styles)
- [ ] **R4.1** All routes (incl. every NEW M10/M11/M12 surface) sit inside the DESIGN_SYSTEM
      grammar: reading column or sanctioned 7xl opt-out; `.section-label` headings; figure scale
      for hero numbers; borders earn their place. Grader screenshots each route and cites
      violations by DESIGN_SYSTEM.md section.
- [ ] **R4.2** Amber discipline: amber ONLY as current/active-case + status semantics — grep
      template classes + screenshot sweep.
- [ ] **R4.3** Mobile 375px: every route, `document.documentElement.scrollWidth ≤ innerWidth+1`,
      controls stack readably, drawer behaviour intact.
- [ ] **R4.4** WCAG spot-grade on every NEW surface: interactive controls keyboard-reachable with
      a visible focus ring; icon-only buttons have accessible names; status carried by a non-color
      channel; new charts have text alternatives.
- [ ] **R4.5** Print rules hold on new content via CSSOM assertions in `preview_eval`: enumerate
      `document.styleSheets` `@media print` rules and assert break-inside/avoid + the running
      header + table rules cover the new printable surfaces. (Actual PDF output stays a HUMAN
      check — one standing Robin waiver slot here, citation required per the protocol.)
- [ ] **R4.6** Empty states: a fresh board, an empty governance state, and an empty trajectory
      render the EmptyState idiom — never a blank panel or NaN.
- [ ] **R4.7** Editorial coherence on every NEW surface: sentence case, subject-first, jargon gets
      Term tooltips on first use; confidentiality + "discussion draft, not a binding offer" appear
      on every advisor-facing/printable surface. Grader reads all new copy in full.

## R5 · Testing depth (check: shell + diff inspection)
- [ ] **R5.1** Every NEW engine **runtime export** (value exports — functions, constants; TS
      type-only exports are erased at runtime and cannot be referenced from a .mjs suite) has a
      **by-name** vector in `engine/engine.v2.test.mjs`: grader lists value exports added since
      baseline from `scaffold/src/engine.ts`, greps the suite for each name, and the named
      assertion must exercise the export itself (not merely a caller).
- [ ] **R5.2** Every store slice added since baseline has reconcile round-trip coverage (missing →
      seeded; user edits survive; junk input doesn't crash) in a suite file that is **wired into
      the documented QA gate** (`npm test` or the per-issue gate command) and green there.
- [ ] **R5.3** The mirror convention held: for the **three highest-numbered merged PRs touching
      `scaffold/src/engine.ts`**, the same PR touched the spec suite
      (`gh pr view N --json files`); one miss → audit all engine PRs.
- [ ] **R5.4** Trust-boundary inputs (URLs, imported JSON, CSV, anything COM-35 sends server-side)
      validated at the boundary — grader tries one malicious value per input class on the live
      preview (`javascript:` URL, junk JSON import, oversized CSV).
- [ ] **R5.5** `cd scaffold && vp check` → 0 errors, warnings ≤ 10 (the pre-existing baseline);
      `npm run build` exit 0.
- [ ] **R5.6** **RLS proof (COM-35):** every table created for COM-35 has RLS enabled with
      owner-scoped policies IN its own migration file (grep the committed SQL); a second seeded
      test user receives zero rows of the first user's boards (live probe); Supabase
      `get_advisors` (security) reports no RLS lints.

## R6 · Performance & robustness (check: shell + preview)
- [ ] **R6.1** Sum of `scaffold/dist/assets/*.js` ≤ **1.0 MB minified**, AND the **initial-load
      JS payload** (every `assets/*.js` chunk fetched on a cold `/overview` visit, measured via
      the preview's network) ≤ **290 kB gzip**. Route-level code-splitting is the structural fix,
      not tree-shake nudges. *Corrected 2026-06-10 (rubric bug, protocol clause "a criterion that
      cannot be mechanically checked is a rubric bug"): the original bound was the SUM of gzips
      ≤ 290 kB with code-splitting as its own named remedy — but splitting RAISES the sum
      (chunk overhead: 288,896 B pre-split → 303,937 B post-split with zero functional change)
      while cutting what a visit actually downloads (238,209 B initial). A metric its own remedy
      violates is self-contradictory; the corrected form binds the user-paid payload — STRICTER
      where it matters (the old sum bound permitted a 290 kB first-paint monolith; this forbids
      it) — and keeps the total-minified ceiling. Numbers preserved here for the R8.4 audit.*
- [ ] **R6.2** Every route paints inside 2s on the preview (cold reload; paint entries via
      `preview_eval`).
- [ ] **R6.3** Stress fixture at a pinned path (`scaffold/fixtures/board-25x4.mjs`, loadable via
      console or query param): a 25-advisor × 4-grant board keeps Board/Compare/Overview
      interactive — keystroke-to-DOM-update < 100 ms measured via a `performance.now()` wrapper
      in `preview_eval`.

## R7 · Memory & distillation — the outer loop (check: read the files)
- [ ] **R7.1** `memory.md` has a dated entry per issue shipped, and the run's gotchas are DISTILLED
      into general rules (fail → investigate → verify → distill → consult): each rule states the
      failure, the verified diagnosis, and the general rule — not an incident log.
- [ ] **R7.2** `CLAUDE.md`'s live-prompt pointer and engine-gate clause reflect the END state of
      the run (what's next; what's still human-only).
- [ ] **R7.3** The auto-memory index at
      `/Users/nordnes/.claude/projects/-Users-nordnes-dev-comp-studio/memory/MEMORY.md` (a granted
      grader input) was updated at the final gate with the run outcome.

## R8 · Final-gate hygiene & the verdict trail (check: Linear + git + prod URL)
- [ ] **R8.1** A Linear project status update describes the run outcome with PR ranges + the
      FINAL panel's per-section grade summary, health set honestly.
- [ ] **R8.2** `main` re-synced to the finished frosty state (pattern of 93d6073) with the QA gate
      green at the merge — UNLESS Robin's COM-36 "later" still stands, in which case a one-line
      "sync is ready to cut" comment sits on COM-36.
- [ ] **R8.3** Clean tip: `git status` clean on frosty (the formerly-untracked
      `OBJECTIVES_AND_FLOWS.md` resolved per the prompt's Wave 0 decision); no `.only`/`.skip`/
      `xfail` in suites; no committed fixtures-with-secrets; generated churn files
      (`scaffold/auto-imports.d.ts`, `scaffold/components.d.ts`, `scaffold/package-lock.json`)
      match origin.
- [ ] **R8.4** **The verdict trail exists and the loop exited honestly:** `docs/rubric-grades/`
      contains every panel's committed verdicts; the LAST TWO full panels show zero FAILs (new or
      repeat); `git log -p -- RUBRIC_V2_FINISH.md` since this file's first frosty commit shows
      only tightening changes and protocol-compliant waiver entries.
- [ ] **R8.5** **Production matches:** `https://comp-studio-one.vercel.app` serves the frosty-tip
      bundle (compare the built asset hash against the served HTML's asset references via URL
      fetch) and — post-COM-34 — renders NO confidential figure pre-auth (fetch the HTML +
      app-shell payload; the DOM rule of R3.10 applies to prod too).

— Authored 2026-06-10 from Lance Martin's loop-design recipe (rubric-as-goal + independent
graders), then adversarially graded and hardened by a fresh-context panel the same day. Tighten in
`docs:` PRs; never loosen — R8.4 checks.
