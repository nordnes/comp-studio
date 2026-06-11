# Comp Studio Improvement Plan — issue-ready backlog from competitor research

**Date:** 2026-06-11 · **Evidence base:** 13 deep-dives in `research/competitors/` (12 services + Forgd) +
hands-on notes + the earlier 30-product synthesis. **Objective:** absorb the best product features and
optimal UI/UX from the researched services into Advisor Comp Studio.

**Ground rules baked into every item:** view-layer first — `scaffold/src/engine.ts` is only touched where
flagged **[engine-gated]** (RFC §7 five conditions apply); frappe-ui 0.1.278 components + Espresso tokens +
DESIGN_SYSTEM.md grammar; legal corpus verbatim, net-of-strike framing and "discussion draft" caveats
never weakened — several competitors were criticized precisely for gross-value optimism, our discipline
is a feature; ≤450 LOC per issue, one issue = one PR; every issue lists its evidence so the grader can
trace plan→research. Items already covered by the UXS backlog (dialogs, banner, skeletons, deep links)
are referenced, not duplicated.

Effort: S ≤150 LOC · M ≤300 · L ≤450. Priority: P1 = highest leverage/lowest risk.

---

## Epic A — Guardrails & Board roster (the compa-ratio grammar)

**A1 · Band bar + tick per roster row — P1 · M**
Replace the near-invisible "Scenario range by advisor" bars (UXS 2.6) with the category-standard
guardrail visual: per advisor, a horizontal FAST-band range bar (tier min→max) with a bold tick at the
proposed grant and a numeric compa-ratio label, red/amber/green by position. Sparkline-sized column in
RosterTable + full-width variant on Advisors (upgrade `BandPlacement.vue`). Custom SVG; non-color
channel = tick shape. *Evidence: OpenComp roster grammar, Workleap band bars, Complete avatars-on-band,
Comprehensive numeric labels (opencomp.md, complete.md, comprehensive.md, HANDS-ON-NOTES).*

**A2 · Before/after guardrail markers in the package editor — P1 · S**
While editing a package (PackageEditor), render the A1 band bar with TWO markers — current (gray) and
proposed (colored) — recomputing live, exactly Comprehensive's "Compa Ratio Before/After" column.
Reads engine outputs only. *Evidence: comprehensive.md + hands-on cycle screenshot.*

**A3 · Distribution chip-bar as roster filter — P2 · S**
Board header: "n below · n in · n above band" segmented chip-bar; clicking a segment filters the roster.
*Evidence: OpenComp click-to-filter distribution (opencomp.md).*

**A4 · In-policy ✓ / exception-flag grammar — P1 · M**
Rows inside guardrails get a quiet green check; breaches show ONE aggregated roster-level callout (UXS
1.5) + per-row flag whose `justify` editor (keep it — it's good) now writes a justification that **travels
with the audit record** and renders in Governance. In-policy changes need no ceremony; exceptions are
documented — Compa's auto-approve/exception-flag split. *Evidence: compa.md, comprehensive.md
justification-gated overrides.*

**A5 · Pool/budget status strip — P2 · S**
Replace the permanent red banner's job (UXS 1.4) with a Forgd/Comprehensive-style KPI strip on Board:
"Equity pool: 8.05% of 10% · Tokens: 4.83% / 4.50% ⚠ · Cash: $0/yr" with a green "fully reconciled" /
red "bucket exceeded" validation line. *Evidence: FORGD_DEEP_DIVE (100%-allocated banner + KPI strip),
hands-on "Budget: $0 out of $23,625" chips.*

## Epic B — Scenario UX

**B1 · Labeled detents on every scenario control — P1 · M**
ExitSlider (and the Proposition slider) gets snap detents with milestone annotations: Conservative /
Base / Aggressive anchors + named valuation events (Series C $500M, TGE FDV $600M). Two-tone track +
keyboard steps land on detents (fixes UXS 1.7 alongside). Bounded controls double as expectation
management. *Evidence: pave.md (milestone-annotated slider, admin-configured ticks/range), ledgy.md
(admin-bounded what-if slider).*

**B2 · Scenario state in the URL — P1 · S**
Case/stage/exit-value (+ advisor) serialize to query params on Advisors/Proposition/Compare; extends the
UXS deep-linking work (1.1) so any modeled view is shareable/restorable. *Evidence: aeqium.md
(URL-encoded simulator state).*

**B3 · Three-value scenario rows in Configure — P2 · M**
Present each scenario path as Ledgy does valuation events: a row per event with conservative/probable/
optimistic values side by side, probable required, others optional — presentation only over the existing
three scenario sets. *Evidence: ledgy.md.*

**B4 · Comparable-anchored assumption inputs — P2 · M**
Next to value-band/pool-size inputs in Configure, show inline benchmark chips with source + date:
FAST v2 matrix (0.25/0.20/0.15 · 1.00/0.80/0.60), Carta advisor medians (0.21–0.25% pre-seed), Forgd
template token norms (advisors 2.5–3% supply, 12mo lock + 24mo unlock), Liquifi benchmark (advisors+
partners 1.5% supply). Each chip: value · source · as-of date · "re-verify" staleness hint (the Benchmark
panel idiom already on Overview, generalized). Directly serves spec Part 17 open blanks. *Evidence:
FORGD_DEEP_DIVE comparables pattern, coinbase-token-manager.md benchmarks, prior FAST/Carta research.*

**B5 · Exit explorer three-view tabs — P3 · L**
Board analytics reorganized as Carta's decomposition: Breakpoints (where payouts change) · Sensitivity
(net vs exit value curve — UpsideCurve generalized) · Point payout (one exit's table). Tabs over one
engine call; no new math in views. *Evidence: prior Carta waterfall research (synthesis report §1).*

## Epic C — Tokens (Vested ≠ Unlocked)

**C1 · Twin vested/unlocked tracks + "Today" cursor — P1 · L [engine-gated if unlock schedule isn't yet an engine output]**
VestingTimeline/TrajectoryView split token series into **vested** and **unlocked/liquid** curves (never
collapsed), with a "Today" vertical cursor whose popover decomposes gross → vested → net-of-strike (eq)
/ unlocked (tok). If the engine doesn't already expose the lockup schedule, that sliver lands under RFC §7
(suites green, ≤450 LOC, own issue). *Evidence: coinbase-token-manager.md (Vested/Unlocked categories,
Today-cursor chart), hedgey.md (vesting vs lockup as separate layers), forgd template (12+24 shape).*

**C2 · Fiat-first token framing audit — P3 · S**
Sweep all token figures: dollar value primary, token count secondary ("$5.40M · 9.0M RKU") — the
de-crypto lesson; advisors are not crypto-native. *Evidence: magna/prior research; levels-fyi.md units-first
pattern inverted deliberately (they subordinate dollars for RSUs; we subordinate counts — both are
"lead with the honest number").*

## Epic D — Proposition & advisor-facing experience

**D1 · Education blocks inside the Proposition — P1 · M**
Collapsible cards within the document: "How options net-of-strike work", "What dilution did to these
numbers", "Options vs tokens here" — Complete's dilution/funding education blocks, written against our
verbatim corpus (presentation copy around locked sentences). Replaces some repeated methodology
prose (with UXS 1.12). *Evidence: complete.md, carta offer-letter research (built-in equity FAQ).*

**D2 · Caveats as per-figure footnote schema — P1 · M**
Bind each locked legal sentence to the figures it qualifies: numbered footnote markers on Proposition
figures, corpus rendered as the numbered list, on screen AND in print. Carta's per-equity-type footnote
system is the legal-engineering benchmark. *Evidence: carta setup-guide research; compa.md
("cited and traceable" per-figure provenance).*

**D3 · "Preview as advisor" mode — P1 · S**
Explicit toggle rendering exactly what the advisor sees/prints (watermark state included) before sharing
— Complete's preview-as-employee / Ledgy's view-as-stakeholder. Pairs with the existing print pass.
*Evidence: complete.md, ledgy.md.*

**D4 · Confidentiality dial in the Share flow — P2 · M**
Share dialog gains explicit display-scope options: full detail / net-only (hide share counts & FDV math —
Carta "PPS-only", Ledgy hide-total-shares) + per-recipient watermark fingerprint (already have) + link
state chip (Not Published / Published / Revoked) with preview — Forgd's public-page grammar. Auth gate
itself stays in COM-34. *Evidence: ledgy.md, forgd, levels-fyi.md email-verification gate.*

**D5 · "At signing vs at milestones" twin panel — P2 · M**
Forgd's Perceived-vs-Actual UX panel adapted honestly: what the package is worth at signing (floor)
vs at each gate/review milestone (earned uplift), per scenario — same engine outputs, psychological
vantage made explicit. *Evidence: FORGD_DEEP_DIVE.*

**D6 · Draft/release states for Propositions — P2 · M**
Formalize Save v1/Copy into a state machine: Draft (edits live, watermarked) → Released vN (immutable
snapshot, audit-logged) → Superseded. Edits after release are invisible until re-released — Comprehensive's
award-letter model; pairs with C-governance audit. *Evidence: comprehensive.md, pequity.md
(regenerable data-bound letters).*

## Epic E — Governance & audit

**E1 · n-of-m progress + embedded evidence on checklist items — P1 · M**
Each Governance item shows owner approvals as "2 of 3" progress; the evidence (the figure, document
link, or panel being approved) renders INSIDE the expanded item, not a link away — Carta's consent
pattern on our RAG register. *Evidence: prior Carta board-consents research; pequity.md approval chains.*

**E2 · All-Activity feed + export — P2 · M**
Per-object (advisor, board, proposition) chronological activity feed — package edits, justifications, stage
transitions, releases, consents — with CSV export. Extends audit.ts presentation. *Evidence: pequity.md
(All Activity + exportable change history), capboard.md (track-changes audit).*

**E3 · Access log alongside change log — P3 · S**
When sharing ships (COM-34), record + display who viewed what when next to who changed what —
Capboard's dual audit; Levels.fyi/Qwilr per-viewer analytics. *Evidence: capboard.md, levels-fyi.md.*

**E4 · "Next blocking item" card on Overview — P2 · S**
Forgd's "Next recommended task": Overview card surfacing the highest-priority red governance item /
unconfirmed term / breached guardrail with a deep link. Derived from existing state — no manual
mark-as-complete drift (Forgd's anti-pattern avoided). *Evidence: FORGD_DEEP_DIVE.*

## Epic F — Charts & self-teaching analytics

**F1 · "About this figure" card slot per chart — P1 · M**
Shared component giving every analysis chart Forgd's grammar: collapsible "How to read this" + "What
data feeds it" + **"Adjust inputs" deep-link to the owning Configure section**. Replaces the repeated
per-view methodology footers (supersedes part of UXS 1.12). *Evidence: FORGD_DEEP_DIVE
(explainer/Quick-Adjust), forgd anti-pattern list.*

**F2 · Benchmark provenance chips — P2 · S**
Every benchmark figure (FAST band, advisor medians, token norms) carries source + sample/date chip —
"FAST v2 · fi.co · as-of 2020" / "Carta 2024 · n=…": the sample-size/freshness badge idiom.
*Evidence: comprehensive.md tracker (sample-size chips, "as of Jun 2026"), pave.md confidence badges,
levels-fyi.md freshness stamps.*

**F3 · Percentile ramp for scenario ranges — P3 · S**
Render Conservative→Base→Aggressive range summaries as Levels.fyi-style sequential-ramp bars
(single hue ramp + position labels), AA-safe, replacing plain text ranges on Overview hero. *Evidence:
levels-fyi.md / HANDS-ON-NOTES percentile bars.*

## Epic G — Platform conveniences

**G1 · One-button full-model export — P2 · M**
"Export board (XLSX)": roster, packages, all three scenarios, guardrails, governance register, audit log —
one file, tabs per section (xlsx via SheetJS already feasible; CSV fallback). Counters the category's
"rigid exports" complaint and is Forgd/Capboard table stakes. *Evidence: FORGD_DEEP_DIVE (Export Your
Design), opencomp/ravio export criticisms.*

**G2 · Persona fork at entry (post-auth) — P3 · S**
When COM-34 auth lands: operator → full app; advisor link → straight to their Proposition (Hedgey's
Token Manager / Recipient fork; Capboard stakeholder portal). Routing + landing logic only.
*Evidence: hedgey.md, capboard.md.*

**G3 · Roster filter-chip strip — P3 · S**
Complete-style chips above the roster (Tier · Sector · Pipeline stage · Guardrail status) consistent with
A3. *Evidence: complete.md /leveling filter chips.*

---

## Sequencing

- **Wave 1 (P1, pure view-layer):** A1, A2, A4, B1, B2, D1, D2, D3, E1, F1 — ten issues, each S/M,
  no engine contact, all inside the existing design grammar.
- **Wave 2 (P2):** A3, A5, B3, B4, D4, D5, D6, E2, E4, F2, G1.
- **Wave 3 (P3 + gated):** C1 [engine-gated sliver], B5, C2, E3, F3, G2, G3.
- Coordinate with the open UXS backlog: A5 supersedes the banner fix scope; B1/B2 extend UXS 1.7/1.1;
  F1 supersedes UXS 1.12; nothing here touches the dialog-system fixes (UXS 2.2) — land those first.

## What we deliberately do NOT copy
13-series color-only stacked charts (Forgd — violates COM-51) · gross-value headline framing (category-
wide criticism; net-of-strike stays the headline) · manual mark-as-complete state (Forgd) · single
continuous unbounded sliders (Pave criticism of expectation drift — we snap to detents) · essay-prompt
gating pages (Forgd Token Profile) · wallet-style auth friction (Hedgey) · benchmark black boxes — every
borrowed number ships with provenance (F2).

## Competitive position after Wave 1–2
Comp Studio remains the only product combining per-advisor net-of-strike equity + token scenario
valuation + governance + watermarked propositions (validated across all 13 reports — no service does
this); the plan closes its UI/UX gaps against the best-in-class single-purpose tools while keeping the
discipline (verbatim corpus, net framing, bounded scenarios) that none of them have.
