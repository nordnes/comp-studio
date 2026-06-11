# EXECUTION_PLAN — competitor-research uplift → Linear filing

**Date:** 2026-06-11 · **Source plan:** `research/IMPROVEMENT_PLAN.md` (7 epics / 24 items) reconciled
against the live COM backlog (199 issues read 2026-06-11) and `scaffold/src/` code. **Robin's calls
(2026-06-11):** file all three waves · merge/drop the three direct collisions (B5→COM-180 note,
D1→COM-177 edit, F2 dropped) · C1 view-issue now + engine sliver parked · D6 filed narrowed.

**Filing conventions:** labels `research-uplift` + `epic:<A–G>` + `wave:<1|2|3>` · priority P1→High,
P2→Medium, P3→Low · estimate S=1 M=2 L=3 · state Backlog · milestone **M14 · Research uplift —
competitor patterns** · no assignee. Every issue carries the verbatim template (Why/What/Where/Design
notes/AC/Dependencies), ≤450 LOC, view-layer only (engine untouched; C1's engine sliver is parked, not filed).

## Final issue table (FILED 2026-06-11 — COM-200…COM-224)

| # | Title | Wave | Pri | Eff | Dependencies | Evidence | Linear |
|---|-------|------|-----|-----|--------------|----------|--------|
| A1 | A1 · Band sparkline column in roster rows + full-width band on Advisors | 1 | P1 | M | Extends COM-179; blocks A2 | opencomp.md, complete.md, comprehensive.md, HANDS-ON-NOTES | **COM-200** |
| A2 | A2 · Before/after guardrail markers in the package editor | 1 | P1 | S | blockedBy COM-200 | comprehensive.md (Compa Ratio Before/After) | **COM-201** |
| A4 | A4 · In-policy ✓ grammar + justification travels to Governance | 1 | P1 | M | Extends COM-176, COM-195 | compa.md, comprehensive.md | **COM-202** |
| B1 | B1 · Labeled detents + milestone annotations on the exit sliders | 1 | P1 | M | absorbs COM-199 slider item | pave.md, ledgy.md | **COM-203** |
| B2 | B2 · Scenario state (case/stage/exit) in the URL | 1 | P1 | S | Extends COM-198 | aeqium.md | **COM-204** |
| D2 | D2 · Per-figure footnote schema binding the legal corpus to figures | 1 | P1 | M | relates COM-172 | Carta setup-guide research, compa.md | **COM-205** |
| D3 | D3 · "Preview as advisor" mode on the Proposition | 1 | P1 | S | — | complete.md, ledgy.md | **COM-206** |
| E1 | E1 · n-of-m consent progress + embedded evidence on checklist items | 1 | P1 | M | Extends COM-141/COM-166 | Carta board-consents research, pequity.md | **COM-207** |
| F1 | F1 · "About this figure" card slot per chart + Adjust-inputs deep link | 1 | P1 | M | supersedes COM-199 §1.12 item | FORGD_DEEP_DIVE | **COM-208** |
| A3 | A3 · Below/in/above distribution chip-bar as roster filter | 2 | P2 | S | relates COM-224 (G3) | opencomp.md | **COM-209** |
| A5 | A5 · Pool/budget KPI status strip on Board | 2 | P2 | S | Extends COM-198 | FORGD_DEEP_DIVE, HANDS-ON-NOTES (Comprehensive chips) | **COM-210** |
| B3 | B3 · Three-value scenario rows in Configure | 2 | P2 | M | Extends COM-147 | ledgy.md | **COM-211** |
| B4 | B4 · Comparable-anchored assumption inputs (Part 17 decision support) | 2 | P2 | M | Extends COM-182 | FORGD_DEEP_DIVE, coinbase-token-manager.md, FAST/Carta synthesis | **COM-212** |
| D4 | D4 · Confidentiality dial in the Share flow | 2 | P2 | M | **blockedBy COM-34** | ledgy.md, FORGD_DEEP_DIVE, levels-fyi.md | **COM-213** |
| D5 | D5 · "At signing vs at milestones" twin panel | 2 | P2 | M | relates COM-157 | FORGD_DEEP_DIVE (Perceived vs Actual) | **COM-214** |
| D6 | D6 · Released proposition versions become immutable snapshots | 2 | P2 | S | Extends COM-174 | comprehensive.md, pequity.md | **COM-215** |
| E2 | E2 · All-Activity feed per object + CSV export | 2 | P2 | M | Extends COM-170; absorbs COM-199 audit item | pequity.md, capboard.md | **COM-216** |
| E4 | E4 · "Next blocking item" card on Overview | 2 | P2 | S | relates COM-141 | FORGD_DEEP_DIVE | **COM-217** |
| G1 | G1 · One-button full-model XLSX export | 2 | P2 | M | bundle-budget check in AC | FORGD_DEEP_DIVE, opencomp.md criticisms | **COM-218** |
| C1 | C1 · Twin vested vs distributable token tracks + "Today" cursor (view) | 3 | P1* | L | Extends COM-149; engine sliver PARKED | coinbase-token-manager.md, hedgey.md, FORGD_DEEP_DIVE | **COM-219** |
| C2 | C2 · Fiat-first token framing audit | 3 | P3 | S | relates COM-172 | levels-fyi.md (inverted), prior magna research | **COM-220** |
| E3 | E3 · Access log alongside the change log | 3 | P3 | S | **blockedBy COM-34** | capboard.md, levels-fyi.md | **COM-221** |
| F3 | F3 · Percentile ramp bars for scenario ranges | 3 | P3 | S | — | levels-fyi.md, HANDS-ON-NOTES | **COM-222** |
| G2 | G2 · Persona fork at entry (post-auth) | 3 | P3 | S | **blockedBy COM-34** | hedgey.md, capboard.md | **COM-223** |
| G3 | G3 · Roster filter-chip strip | 3 | P3 | S | relates COM-209 (A3) | complete.md, HANDS-ON-NOTES | **COM-224** |

\* C1 was P1 in the source plan (filed priority High); it lands in Wave 3 because the unlocked-vs-vested
distinction is only fully honest once a real lockup schedule exists — the view ships against
`vestedFrac`/`vestedFracRTA`/`distributableFrac` (verified engine exports) and names the distributable
(service-gate) curve, not market lockup.

**Plus two non-issue actions (done):** (1) **COM-177 edited** — D1's collapsible education-card treatment
merged into its scope (labels `research-uplift`/`epic:D`, related to COM-205/206). (2) **COM-180
commented** — B5's Carta three-view decomposition (Breakpoints / Sensitivity / Point payout tabs) added
as a design note. (3) **COM-199 commented** — absorption map (slider→COM-203, methodology
popover→COM-208, audit tab/filter→COM-216, version chip row→COM-215).

## Sequencing rationale

- **Wave 1 (COM-200…208)** = highest leverage, pure view-layer, zero engine contact, all inside the
  DESIGN_SYSTEM grammar; lands the category-standard guardrail visuals (A1/A2/A4), bounded scenario
  controls (B1/B2), and the Proposition trust upgrades (D2/D3) the negotiation flow needs first.
- **Wave 2 (COM-209…218)** = P2 conveniences and governance depth; D4 filed but inert behind COM-34
  (BLOCKED-EXTERNAL, Supabase invoices — human action).
- **Wave 3 (COM-219…224)** = P3 + auth-blocked + the C1 view issue (largest single item, L).
- Internal order inside Wave 1: A1 (COM-200) before A2 (COM-201) — Linear blocking relation set. F1
  before any new chart work that would otherwise re-add per-view methodology footers.
- Coordination with the open UXS tail (COM-199): B1 absorbs its slider item, F1 supersedes its
  methodology-popover item, E2 absorbs its audit-log tab/filter item, D6 takes the version chip row —
  absorption comment posted on COM-199.

## Not filed, parked

| Item | Why parked | Revisit when |
|------|-----------|--------------|
| B5 · Exit explorer three-view tabs | Double-books COM-180 (open) — IA folded into COM-180 as a design note | COM-180 implementation |
| D1 · Education blocks | Same feature as COM-177 (open) — scope merged into COM-177 | — (lives in COM-177) |
| F2 · Benchmark provenance chips | Shipped as COM-182 (source + as-of + staleness at point of use) | only if B4/COM-212 surfaces gaps |
| C1b · Market lockup/unlock engine schedule | No real TGE lockup terms yet (RFC flags token supply unvalidated); RFC-§7 sliver when terms exist | token workbook lands real supply/lockup numbers |
| Do-NOT-copy list | Standing guard: no color-only multi-series charts, no gross-value headlines, no unbounded sliders, no manual completion state | never |

## Filing record (2026-06-11)

- 25 issues created: **COM-200…COM-224**, all state Backlog, unassigned, milestone
  **M14 · Research uplift — competitor patterns** (created), labels `research-uplift` + `epic:*` + `wave:*`
  (11 team labels created).
- Relations set in Linear: COM-201 blockedBy COM-200 · COM-213/221/223 blockedBy COM-34 ·
  relatedTo links to COM-141/147/149/157/166/170/172/174/176/179/182/195/198/199/209.
- Verification: see the dated memory.md entry — re-listed from Linear and diffed against this table.
