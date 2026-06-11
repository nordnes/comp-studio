# GAP_FILING_HANDOFF — corpus-sweep + design-prompt §9 issues, ready to file

**Date:** 2026-06-11 · **State:** sweep COMPLETE, nothing filed yet. Robin ran out of session budget;
this file carries everything a fresh session needs. Predecessor: `research/EXECUTION_PLAN.md`
(COM-200…224 filed + verified earlier today).

## Context for a fresh session / different account (self-contained — no prior chat needed)
- **Repo root (this machine):** `/Users/nordnes/dev/comp-studio` — all paths below are relative to it.
  If mounted elsewhere, locate the repo by its `CLAUDE.md` + `COMP_STUDIO_SPEC_v2.md` at root.
- **Key files:** `research/GAP_FILING_HANDOFF.md` (this file) · `research/EXECUTION_PLAN.md` (filed
  M14 table + parked list) · `research/IMPROVEMENT_PLAN.md` (source plan) · `research/competitors/`
  (evidence) · `research/FORGD_DEEP_DIVE.md` · `research/CLAUDE_DESIGN_PROMPT.md` (§9 = the design
  gaps) · `CLAUDE.md` (standing rules — read first) · `memory.md` (append the dated entry there).
- **Linear (Raiku workspace):** team **COM** ("comp-studio", teamId `95768650-2441-48e9-acd4-2ff02c2ff2cf`)
  · project **"Advisor Comp Studio — Web App (Frappe/Vercel)"** (projectId
  `82eba0c2-2a11-4e9d-b822-b9efce3bb2a1`) · milestone **"M14 · Research uplift — competitor patterns"**
  (id `cef64726-a322-44b4-9eaa-47f6e285aeed`) · labels `research-uplift`, `epic:A`…`epic:G`,
  `wave:1`/`2`/`3` all exist as COM team labels. https://linear.app/raiku/team/COM
- **The filing account must have write access to the Raiku Linear workspace.** If Linear access fails,
  stop and report — do not simulate creation (standing rule).
- **Already filed (do not duplicate):** COM-200…224 (M14), COM-177 edited, comments on COM-180/199.
  Open neighbors: COM-33/34/35/36/71 (M6), COM-175/177/178/180/199 (M13).

## Filing conventions (same as the M14 batch)
Team COM · project "Advisor Comp Studio — Web App (Frappe/Vercel)" · milestone **M14 · Research
uplift — competitor patterns** (exists) · state Backlog · unassigned · labels `research-uplift` +
`epic:<X>` + `wave:<n>` (all exist) · priority P2→Medium(3), P3→Low(4) · estimate S=1 M=2 L=3.
Body template: **Why/evidence · What (+OUT of scope) · Where · Design notes (DESIGN_SYSTEM tokens,
borders-earn-their-place, COM-51 non-color channel, tabular-nums, print) · Acceptance criteria
(functional + `vp check` clean + `npm run build` green + both 22-vector engine suites 22/22 +
`node engine/engine.v2.test.mjs` 0 failed + a11y AA/focus/≥32px + print where relevant + ≤450 LOC)
· Dependencies.** Hard rules: verbatim legal corpus, net-of-strike, "discussion draft", engine gated
(RFC §7), do-NOT-copy list. Linear MCP server: the 7cc995ad one (NOT the deprecated 00dad8db).

## A · Design-prompt §9 gap issues (2 — file both, Robin asked for them explicitly)

**H1 · Board-pack print template v2 (multi-page)** — epic:G, wave:2, P2, M.
Why: CLAUDE_DESIGN_PROMPT §9 specifies the multi-page board pack: cover with confidentiality block ·
roster · per-advisor pages · governance register · methodology appendix, with per-page running
confidentiality footers. COM-15 shipped only the basic board print. Where: Board print path,
`.print-area`/`.print-running` discipline (COM-134/59). Out of scope: PDF generation (print CSS only),
new figures. AC adds: page breaks correct, footer + recipient fingerprint on every page, grayscale-safe
charts. Relations: relatedTo COM-15, COM-134.

**H2 · 404 / error / engine-mismatch states** — epic:G, wave:2, P2, S.
Why: CLAUDE_DESIGN_PROMPT §9 — no designed 404, route-error, or engine-mismatch (stored payload vs
SCHEMA/anchor divergence) states exist. What: catch-all route + error boundary view + a mismatch
interrupt that names the divergence and offers export-before-reset (never silent data loss). Where:
`router.ts`, new `ErrorState.vue`, `store.ts` reconcile failure path (presentation only — reconcile()
logic untouched). Relations: relatedTo COM-133 (EmptyState idiom).

## B · Corpus-sweep candidates (verified UNCOVERED vs COM-156/172–199/200–224 + core)

File these 7 (suggested ids/epics/waves):
1. **H3 · Package-mix presets** — same advisor, equity-heavy↔token-heavy alternative compositions side
   by side (Carta offer-letter 3-preset pattern; synthesis Category 4). View-layer: PackageEditor variant
   tabs + Proposition "Option A/B" panel; engine called per config. epic:D wave:2 P2 M. Nearest: COM-148
   compares scenario *sets*, not grant compositions.
2. **H4 · Assumption-change downstream impact flags** — on scenario/pool/valuation change, re-run saved
   offers/drafts and chip the affected ones ("3 drafts affected") on Pipeline/Roster (pave.md #8,
   capboard.md #3). Store watcher + chips; no engine edit. epic:B wave:2 P2 M. Nearest: COM-174 detects
   drift only at signed-binding; COM-182 is benchmark staleness only.
3. **H5 · FAST stage×engagement matrix as tier picker** — render tier selection as the literal FAST grid
   with the proposed grant plotted in-band (synthesis FAST section; levels-fyi ladder). PackageEditor/
   GrantDecisionWizard; reuses A1/COM-200 band data. epic:A wave:2 P2 S/M.
4. **H6 · Evidence embedded inside consent rows** — the artifact being approved (figure/snapshot/valuation
   graph) renders INSIDE the consent row (Carta). Governance view; pairs with COM-207 (n-of-m) — could be
   filed as "Extends COM-207" or folded into it if preferred. epic:E wave:2 P2 S.
5. **H7 · Guardrail severity tiers + aggregate scoping** — warn vs block per rule; color the aggregate
   constraint, not each line (comprehensive.md #1–2, the G2 false-alarm lesson). Render logic over
   COM-156 outputs. epic:A wave:2 P2 S.
6. **H8 · "Cost to floor" KPI** — one number: cost to bring all under-band advisors to tier floor
   (OpenComp Cost-to-Minimum). Aggregation of existing outputs; lands in COM-210's strip or guardrail
   summary ("Extends COM-210"). epic:A wave:3 P3 S.
7. **H9 · Annualized value framing toggle** — per-service-year framing beside 4-year totals on
   Proposition/Trajectory (aeqium.md #7, pave.md frames). Display math only. epic:D wave:3 P3 S.

Optional/judgment (ask Robin or file P3): **H10 · personal note + comp-philosophy preamble** on the
Proposition (complete.md #6/#8 — keep inside discussion-draft tone) S; **H11 · internal precedent panel**
in the editor (opencomp.md #6 — marginal at n≈6 advisors) S; **H12 · data task: evaluate Comprehensive's
Executive Compensation Survey** (500+ VC-backed cos incl. board roles) as a Part 17 #2 anchor source —
add to the COM-182 provenance register (comprehensive.md §8) S, not code.

PARKED (record in EXECUTION_PLAN, do not file): milestone-conditioned grant tranches (Vestd Agile
Partnerships — engine-gated + Part 17 product call) · acknowledgement ledger (needs advisor action →
COM-34/35) · as-of roster scrubber (needs COM-35 history) · outcome feedback loop (meaningless at n≈5).
REJECTED: grant segmenting with split preview (hedgey.md #6 — no product need).

## C · Paste-ready prompt for the next session

> Connect the comp-studio folder + Linear. Read `research/GAP_FILING_HANDOFF.md` and
> `research/EXECUTION_PLAN.md`. File the issues in sections A and B (H1–H9; ask me about H10–H12 via
> AskUserQuestion) into Linear team COM per the conventions in the handoff — full body template per
> issue, milestone M14, labels, relations as noted. Do NOT re-run any research. Then: backfill the new
> COM-NNN ids into a "Gap filing" section of EXECUTION_PLAN.md, append a dated memory.md entry, and
> verify by re-listing the `research-uplift` label (expect 26 + the new count, zero duplicates).

Verification baseline: before this filing, `research-uplift` label = 26 issues (COM-177 + COM-200…224).
