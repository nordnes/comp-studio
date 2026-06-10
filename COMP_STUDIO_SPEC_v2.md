# Advisor Comp Studio — Comprehensive Product Specification (v2)

*Raiku Labs · Internal & confidential. Every equity figure is shown **net of strike**. Output is a **discussion draft, not a binding offer.***

*This document supersedes and extends "Advisor Comp Studio — Objectives & User Flows" (v1). It defines the complete set of user objectives, goals, personas, surfaces, user flows, features, functions, engine mechanics, and governance requirements for the Compensation Studio — incorporating everything learned from the ESOP legal workstream, the Ispahani Advisory option-plan review, the live cap-table and token-allocation models, the salary survey, the RTA, and the advisory-board compensation design sessions of April–June 2026.*

---

## Part 0 · Provenance — what this spec is grounded in

| Source | What it contributed |
|---|---|
| `Advisor Comp Studio — Objectives & User Flows` (v1) | Baseline mission, O1–O8, six surfaces, F1–F14 |
| Linear project `Advisor Comp Studio Web App (Frappe/Vercel)` M0–M9 | Build state, stack constraints, engine-frozen rule, ≤450 LOC discipline |
| Ispahani Advisory, *Stock Option Plan Commentary* (8 May 2026) | Remuneration principles, 9-step grant-decision process, design-point gaps (caps, clawback, leavers, CoC, dilution limits), EMI/CSOP appendices |
| ESOP workstream pack (Plan rules **v9**, Option Certificate **v3**, Resolution v5, Governance Table v4, s431 analysis) | Definitive legal mechanics the engine must encode; constitutional position; investor consent matrix |
| `Dilution_Scenarios_Bridge_to_SeriesC.xlsx` | The canonical multi-scenario walk-forward model (14 bridge scenarios; Series A/B/C walks; 8 ESOP paths) the Studio's scenario system must generalise |
| `Fully_Diluted_Pro-Forma_Cap_Table_Raiku.xlsx` | The 47-investor live cap table; current FD 48,316.78 (post-Rousseau, SAFEs as-converted) |
| `Management _ Token allo.xlsx` + external copy | The four token pools (Team 20% / Advisors 5% / Investors 20% / CEX 20%), per-person allocations, doc-status tracking |
| `raiku_salary_survey_v21.xlsx` | Benchmark methodology (role-category P25/P50/P75, compa-ratio) to be mirrored for advisors |
| `FINAL NON US RTA Agreement (Reg S FORM)` | Token-side vesting (25% cliff + 2.08%/month), Bad Leaver six-limb definition, 24-month qualifying service, Continuous Service, CiC definition |
| Krisp: **Working session 16 Apr 2026** (Robin, Iraj, Carl Sjöström, in person) | Parallel token+options philosophy; token↔equity 1:1 conversion fallback; milestone-gated awards; liquidity-window exercise + backstop; advisor uniform-entry + discretionary top-up; "value the work in dollars"; reward-principles document; timeline of interdependencies |
| Krisp: **Iraj & Robin + Carl Sjöström + Charlie, 27 May 2026** | The advisor comp design decisions: uniform start, no cash preferred (cash-floor trade allowed), dollar-denominated awards ("dangerous to talk percentages"), fee-for-value framing, time-commitment definition, Series A as the structural review trigger, Iraj negotiates / Robin stays out |
| Krisp: **Iraj & Robin, 5 Jun 2026** | Confirmed roster (Rob Reoch, Martin Keller, Kerim — all in; Robin chairs); Carl Sjöström reviews comp sheet ("too generous" challenge); offer letters via Charlie; references by Robin; advisory board formalises at Series A ("trainer wheels"); kickoff structure; clearinghouse routing |
| Krisp: **Kerim / Robin follow-up, 13 May 2026** | Advisor expectations are deal-literate; comp structure "take your time"; capital-channel behaviour (XTX introduction) — evidence for the capital-introduction uplift mechanic |
| Frappe HR (performance-management), Carta (cap table / Launch), Mooncamp/Craft patterns | UI reference patterns: appraisal templates & cycles, KRA-weighted scoring, scenario modeling, board-consent workflows, stakeholder portals |

> **Krisp note:** no standalone meeting exists under "Robert Reoch" — Rob is discussed inside the Iraj sessions and the Weekly Advisory Board Project series. Carl **Bang**'s intro call (13 Apr) and Martin Keller's intro (1 Apr) and Rajesh Mehta's intro (22 Apr) exist as recordings; their comp-relevant content is reflected in the 27 May compare-and-contrast.

> **Document structure:** Parts 1–17 are the synthesis layer (philosophy → objectives → domain model → flows → build plan). **Appendices A–F** are the complete granular detail register — every number, clause, design note, and session decision from the sources, each tagged to the feature it feeds. Nothing in the sources is dropped; if it isn't in Parts 1–17, it is in the appendices with a traceability tag.

---

## Part 1 · Mission & compensation philosophy

**Mission (unchanged in spirit, widened in scope):** give Raiku one honest, configurable place to **design, defend, and evolve** compensation — advisory board first, executive/employee equity-and-token comp next — net of strike and dilution, benchmark-grounded, governance-aware, and explicitly tied to (a) the value an individual delivers and (b) the rounds the company raises.

The philosophy the tool encodes, now formalised from the Ispahani principles and the May–June design sessions:

1. **Uniform entry, earned growth.** Everyone at the same role starts on the same basis — "everyone talks, and it's not right to start people on a differentiated basis" (Iraj, 27 May). Differentiation happens *after* entry, through reviews and earned uplift, never through bespoke entry haggling.
2. **Value the work in dollars, deliver it in currency.** Advisor packages are denominated as an annual **dollar value of the work** (e.g. $X/yr), then *delivered* in a mix of options / tokens / (optionally) cash. Percent-of-company is an output, never the negotiation unit — "it becomes really dangerous to talk about percentages" as valuation steps up (Carl Sjöström, 27 May). This is a **change from v1**, where tiers derived equity directly.
3. **Performance is earned, gated, capped, and pre-agreed.** Incentives must be capable of paying zero; every opportunity has a defined maximum; measures and milestone levels are set in advance; the Board retains discretion to reduce/delay where outcomes don't reflect business reality (Ispahani principles). Milestone-based earning ("you get this when we achieve platform launch") is preferred over granular metrics for long-horizon awards — never more than ~4–6 measures, kept legible four years out.
4. **Net of strike, always; net of dilution, always.** Strike is real and per-grant-round; equity is shown after exercise cost across every scenario and every round of the walk.
5. **Two parallel instruments, one trajectory.** Tokens (RTA, broad-based) and options (ESOP, selective) run in parallel: tokens are the company-wide baseline; options are the lock-in/recognition instrument for keepers and advisors. If a liquidity event occurs before TGE, token awards convert **1:1 into equity** — the Studio must model that fallback.
6. **Scenario-aware, never a point estimate.** Conservative / base / aggressive paths across valuations, ESOP targets, and TGE multipliers; one designated base case; every package reads floor → base → ceiling.
7. **Decisions follow a process, not a mood.** The Ispahani 9-step grant process (dilution budget → eligibility criteria → franchise situation → total-comp picture → external comparison → internal comparison → allocation with reserve → iterate) is the canonical decision spine; the Studio should make each step a visible artefact.
8. **Governance is part of the package.** No-one decides their own comp; "grandparent" approval minimum; Pantera consent is a hard pre-condition for executive-officer grants; the tool surfaces every consent, valuation, and election the law requires.

---

## Part 2 · What changed since v1 (delta register)

| # | Change | Source | Impact |
|---|---|---|---|
| Δ1 | **Dollar-denominated advisor awards** replace tier-×-multiplier as the primary entry mechanic. Tiers survive as *value bands* (e.g. Base $50K/yr · Strategic $100K/yr · Anchor $150K/yr) that convert to instrument quantities at grant-date valuation. | 27 May session | Configure, Advisors, engine inputs |
| Δ2 | **Comp Trajectory system** (Part 5) — the explicit requirement that packages grow over time with performance, objectives, and fundraising events, via scheduled reviews and discretionary top-ups. | Robin's brief; 27 May & 5 Jun sessions | New surface + engine extension |
| Δ3 | **Scenario sets generalised** to the dilution workbook's structure: valuation grids × ESOP-target paths × raise amounts × TGE multipliers, with named/saved scenario sets and walk-forward composition. | Dilution workbook | Configure, Compare, Board |
| Δ4 | **Plan rules v9 is the legal source of truth** and *deletes* Rule 9.2 (Board discretion to accelerate on CoC) and the UK Tax Schedule from the plan body. ⚠️ The current Proposition footer ("CoC acceleration at board discretion") is **stale** and must be corrected. | ESOP workstream summary | Proposition legal corpus |
| Δ5 | **Equity vesting re-cadenced** (Option Certificate v3): 25% one-year cliff, then **annual 25% tranches** on anniversaries 2–4 — *not* monthly. Token RTA remains 25% cliff + 2.08%/month, **with 24-month minimum qualifying service**. The two instruments now have visibly different curves; VestingTimeline must render both. | Cert v3; RTA | Advisors hero |
| Δ6 | **Exercise restricted to Board-determined liquidity windows** + the Clause 3.6 backstop (≥90-day window opened before the 10th anniversary if no Exit Event by year 9). Net exercise (Rule 4.5) and sell-to-cover (7.4(a)) are the cash-free routes. | Cert v3; Plan v9; 16 Apr session | Proposition, Instruments panel |
| Δ7 | **Governance & consent state is in scope**: pool sizing blanks (10% ≈ 5,368 sh / 15% ≈ 8,523 sh within 12,450 available), Pantera consent for exec grants, SAV/409A valuation before first grant, s431 14-day window at exercise, deed of adherence, ERS Annual Return, DBS/Swiss suitability checks for advisors. | Governance Table v4; s431 session; 27 May | New Governance surface |
| Δ8 | **Constitutional numbers updated**: 50,000 authorised; 37,550 issued (Robin sole holder); 12,450 cancelled-and-available (Rousseau, 30 Apr 2026). Live FD with SAFEs as-converted: **48,316.78**. Bridge at $90m/10% ESOP → **57,217 FD** and strike **$1,572.95** — reconciling the frozen engine. | Resolution v5; dilution workbook | Engine defaults |
| Δ9 | **Advisor roster state**: Rob Reoch, Martin Keller, Kerim Derhalli — confirmed, enthusiastic, Robin chairs. Carl Bang — medium/long-term, courting. Rajesh Mehta — evaluating (payments lane under question). Luke Ellis — friend-of-firm/possible investor, outside the AB construct. Iraj — chair-adjacent orchestrator, Ispahani. No cash expected by the three incoming members. | 27 May & 5 Jun sessions | Seed data, Overview |
| Δ10 | **Total-comp context**: the Studio should eventually read the salary-survey benchmark structure (role category → P25/P50/P75 → compa-ratio) so advisor and (later) employee awards are judged inside the total-compensation picture (Ispahani step 5–7). | Salary survey; Ispahani steps | Benchmarks module |
| Δ11 | **Offer pipeline is live**: Charlie drafts offer letters; Iraj collects referees; Robin takes references; security checks per jurisdiction. The Proposition surface gains a lightweight **status pipeline** (modeled → proposed → referenced/cleared → offered → signed → active). | 5 Jun session | Lifecycle states |
| Δ12 | **Negotiation protocol**: straw-man goes out via Iraj; advisor feedback iterates the package; Robin is kept out of direct negotiation. The Studio's shareable Proposition is the straw-man artefact; versioning of propositions per advisor becomes a feature. | 27 May session | Proposition versions |

---

## Part 3 · Product objectives (O1–O16)

O1–O8 from v1 stand (model honestly net of strike/dilution; visual legibility; reward tied to value; full configurability; benchmark-grounded; shareable proposition; persist/version/share; ship reliably). Added:

**O9 — Model many compensation scenarios, not one.** The user can construct, name, save, duplicate, and compare *scenario sets*: any combination of round ladder, post-money grid, raise amounts, ESOP-target path, token-supply/TGE assumptions, and TGE multipliers — generalising the dilution workbook's 14-bridge-scenario / 8-ESOP-path structure. Every package, board total, and pool number is viewable under any saved scenario, and scenario sets are diffable side-by-side.

**O10 — Encode growth-over-time as a first-class system.** A package is not a static grant: it is an entry grant plus a **trajectory** — scheduled reviews, milestone-gated uplifts, fundraising-event triggers, and discretionary top-ups — rendered as a timeline so an advisor (and the board) can *see* how the package can grow as they perform and as Raiku raises (Part 5).

**O11 — Denominate in value, deliver in instruments.** Entry awards and uplifts are expressed in annual dollar value; the engine converts value → option count (at grant-date FMV/strike) and → token count (at assumed TGE FDV), and re-states delivered value under every scenario.

**O12 — Carry the legal mechanics truthfully.** Vesting curves (equity annual-tranche vs token monthly-with-qualifying-period), exercise windows + backstop, net exercise / sell-to-cover, Bad-Leaver forfeiture, the token→equity conversion fallback, and the v9 deletion of CoC acceleration are all engine-encoded, not footnote-only.

**O13 — Make governance state visible and blocking.** Every grant carries its pre-conditions (pool resolved? SAV valuation done? Pantera consent where required? references/security checks cleared? consent recorded?) as a RED/AMBER/GREEN checklist mirroring Governance Table v4; a Proposition can be printed but is watermarked "pre-conditions outstanding" until green.

**O14 — Track the offer lifecycle.** Each advisor moves through modeled → proposed (straw-man sent) → iterating → referenced & cleared → offer letter issued → signed → active → (reviewed / topped-up / rolled-off), with dates and document links; departures recompute vested-to-date and apply leaver rules.

**O15 — Roll up the board's capital contribution.** Channel-introduced capital is aggregated across the board against the live raise target (bridge $5m+), showing expected capital in vs uplift owed out — the board as a fundraising instrument, quantified.

**O16 — Stay extensible to the whole company.** The same engine (value-denominated grants, dual instruments, milestone gates, reviews, governance checks) must extend to executive and employee comp — the ESOP pool, the Team token pool (20%), and salary-survey benchmarks — without re-architecture. Advisor comp is the wedge; the comp OS is the platform.

---

## Part 4 · Domain model (entities the Studio must represent)

**Company model**
- `Company` — entity facts (ASEL t/a Raiku, Cayman BL-411368), authorised/issued/available shares (50,000 / 37,550 / 12,450), governing documents register.
- `Round` — bridge, Series A/B/C…: raise amount, post-money grid, ESOP target(s), status (planned/term-sheet/closed), date.
- `ScenarioSet` — named bundle: per-round post-money + ESOP target + raise + TGE multiplier; one starred base; supports walk-forward composition (a Series A scenario declares its bridge prior).
- `CapTableSnapshot` — holders, share classes (ordinary voting / ordinary non-voting Option Shares), as-converted SAFEs, derived FD totals & price/share per scenario node.
- `Pool` — equity option pool (count + % FD, Constitutional-Limit-linked) and the four token pools (Team 20%, Advisors 5%, Investors 20%, CEX 20%) with allocated/available, fed by live allocation rows.
- `TokenModel` — supply, TGE date/anchor FDV, multipliers per scenario, conversion-fallback flag.

**People & awards**
- `Person` — advisor / executive / employee; sector, residency (drives s431 vs 409A vs none), referee & check status, supervisor, notes.
- `Grant` — *multiple per person*: instrument (option / RTA / cash), value-denominated entry amount, grant round (→ per-grant strike/FMV), vesting schedule (instrument-specific), qualifying-service rule (RTA 24-month), status (draft/LoI/granted/exercised/lapsed), document links (mirrors the token workbook's "Status of docs" column).
- `Objective` — label, category (capital / customer / partnership / governance / product), trigger, uplift value, gating milestone, state (off / targeted / earned), evidence link.
- `Milestone` — roadmap-importable; date; linked objectives; linked fundraising events.
- `Review` — scheduled checkpoint (6/12-month, or event-triggered e.g. Series A): inputs (engagement, objectives earned, board view), outcome (no change / top-up grant / role change / roll-off), approver, date. **This is the growth-over-time primitive.**
- `CapitalIntroduction` — per-advisor: amount introduced, round, gate status, uplift computed from the capital schedule; rolls up to board level.

**Governance**
- `Consent` — type (Pantera exec-grant; Converting-Securities >$10m; Token Warrant; pro-rata invitations; MFN notifications), counterparty, status, evidence.
- `ComplianceItem` — SAV/409A valuation; s431 election (14-day window per exercise, PSC-structure check); deed of adherence; ERS Annual Return; DBS / Swiss suitability certificate; each with RED/AMBER/GREEN status and owner.
- `AuditLog` — who changed what, when (precursor to M6 auth).

**Benchmarks**
- `BenchmarkBand` — FAST per-advisor bands; US private-company advisory median (~$50K/yr); professional-services day-rate reality test; (later) salary-survey role-category P25/P50/P75 + compa-ratio for employees. Every band carries a source citation.

---

## Part 5 · The growth-over-time system (Comp Trajectory)

This is the headline new requirement. The mechanic, exactly as designed in the April–June sessions:

**5.1 Entry.** Every advisor enters at the **uniform base for their value band** — same basis for all, no entry differentiation. The entry grant is value-denominated (e.g. $X/yr of work), delivered as options + tokens (cash only as a negotiated floor trade: "£10,000 of certainty traded against £100,000 of upside"). Time-commitment expectation is recorded on the grant — the value must be defensible against what the equivalent professional-services time would cost.

**5.2 Earning.** Between reviews, value accrues only through **gated objectives**: each objective (capital, customer, partnership, governance, product) has a pre-agreed uplift and a gating milestone; toggling targeted → earned requires the milestone to be reached and evidence attached. Channel-introduced capital generates live, gated bumps via the capital schedule. The gap between earned and ceiling is always visible — the ceiling is explicit and capped (Ispahani: "a defined maximum above which the value doesn't increase").

**5.3 Reviews.** At each scheduled checkpoint (default 6/12-month) or event trigger, a `Review` is run: engagement + objectives earned + board view → outcome. Outcomes are **top-up grants** (new `Grant` rows at the then-current strike/FMV — which is how the package "grows with fundraising": later grants price at later valuations, earlier grants enjoy the step-up), role/band changes, or roll-off. "Start everyone the same; review and top up the keepers" (Iraj). The advisory board is deliberately fluid — people roll on and off, and good leavers may keep vested awards at Board discretion.

**5.4 Fundraising-event triggers.** Rounds are first-class trajectory events: the bridge close re-prices new grants and crystallises capital-introduction uplifts; **Series A is the structural review** — board formalisation ("trainer wheels off"), composition review, and a full package review for every advisor. The trajectory timeline shows each round as a vertical event with the package's value restated before/after.

**5.5 The Trajectory view.** Per advisor: a horizontal timeline from start date through vesting cliffs, monthly/annual tranches, review checkpoints, milestone gates, fundraising events, TGE, and the exercise backstop — with the package's cumulative net value as a band (floor → base → ceiling per scenario) growing along it. This is the visual answer to "how does my package grow as I perform and as Raiku raises." It complements (does not replace) the GrowthWaterfall and UpsideCurve.

**5.6 Generalisation.** The identical mechanic serves executives/employees later: milestone-gated tranches tied to company strategy ("you get this when we achieve platform launch"), simplifying goal-setting company-wide — comp *replaces* heavyweight OKR machinery rather than duplicating it.

---

## Part 6 · The scenario-modeling system

Generalising `Dilution_Scenarios_Bridge_to_SeriesC.xlsx` into product:

- **Scenario grids per round** — e.g. bridge: 7 post-money values × 2 ESOP targets = 14 cells; each cell yields holder %FD, post-money FD shares, implied price/share, founder-loss-vs-current pp.
- **Walk-forward composition** — a Series A scenario declares its bridge prior; B declares A; C declares B — exactly the workbook's "base prior" column; the Studio lets the user re-base any walk on any prior cell.
- **ESOP paths** — pre-money pool shuffle at every round; top-up sized to hit target % post-money; no top-up if existing pool exceeds target (workbook methodology notes 1–2 verbatim as engine rules).
- **Token dimension** — TGE FDV anchor × scenario multipliers; token-vs-equity decoupling over time; the 1:1 conversion fallback as a scenario toggle ("liquidity event before TGE").
- **Named scenario sets** — save, duplicate, annotate ("$90m floor per strategy memo"), star a base, archive; headline-observation callouts auto-generated per set (mirroring the workbook's "Headline observations").
- **Everything re-states under the selected scenario** — a persistent global scenario switcher in the app shell (already planned in M8) so Overview, Advisors, Board, Compare, and Proposition all answer "under which future?" without navigation.
- **Same-advisor A/B** — two candidate packages for one person (offer v1 vs v2) comparable under the same scenario set; closes the v1 gap.

Engine truth rule unchanged: views never recompute; the engine reconciles to the workbook to the dollar (current FD 48,316.78 → bridge $90m/10% → 57,217 FD, strike $1,572.95 → Series C path → 118,707 FD).

---

## Part 7 · Personas & permissions

| Persona | Goal | Surfaces | Notes |
|---|---|---|---|
| **Founder / modeler (Robin)** | Configure, model, decide, defend | All | Stays *out* of direct negotiation; the tool produces the straw-man Iraj carries |
| **External comp reviewer (Carl Sjöström)** | Sense-check generosity, totality, unintended consequences | Board, Compare, Proposition (read) | His standing challenge — "this is too generous" — argues for explicit benchmark-breach and totality warnings |
| **Orchestrator / chair-adjacent (Iraj)** | Carry propositions, track candidate state, calibrate fairness | Overview, Proposition, lifecycle pipeline | Clearinghouse model: AB interactions routed via Robin+Iraj |
| **GC (Charlie Bourlet)** | Verify legal corpus, drive offers, own governance checklist | Proposition, Governance, Configure (legal) | Owns offer letters, deed of adherence, s431 process, consents |
| **Co-founder / board reviewer** | Totals, pools, cost across scenarios | Overview, Board, Compare | |
| **Advisor (recipient)** | Understand floor/base/ceiling; see trajectory | Proposition (+ optionally a read-only Trajectory) | Sees only the export; never the editing surface |
| **(Later) Executive / employee** | View own grant, vesting, milestones | Carta-style stakeholder portal — M6+ | Requires auth (M6) |

---

## Part 8 · Surfaces

The six v1 surfaces stand; two are added and one is extended.

| Route | Purpose | Status |
|---|---|---|
| **Overview** | Board at a glance: KPIs, roster *with lifecycle stage chips*, pool consumption (equity + token pools), capital-introduction rollup, alerts | Extend |
| **Advisors** | Live-edit hero: controls, GrowthWaterfall, UpsideCurve, **dual-instrument VestingTimeline**, FootballField, MixBreakdown, Instruments (per-grant strike rows, SAV/409A) | Extend (Δ5) |
| **Trajectory** *(new — or a tab within Advisors)* | Per-advisor timeline of grants, reviews, milestones, rounds, TGE, backstop; cumulative value band; review workflow entry point | New |
| **Board** | Roster table, ranges, pools, company cost, valuation staircase, potential scatter, **board capital-in vs uplift-out panel** | Extend |
| **Compare** | Matrix + grouped bar across advisors and **across scenario sets**; same-advisor A/B | Extend |
| **Proposition** | Discussion-draft package + legal corpus (updated to v9: CoC-acceleration line removed; backstop, net exercise, sell-to-cover, s431/409A by residency, Bad Leaver, deed of adherence, confidentiality); **versioned per advisor**; print/copy | Extend (Δ4) |
| **Governance** *(new)* | The Governance Table v4 as software: RED/AMBER/GREEN checklist (pool numbers, Bell Rock confirmation, Pantera consents ×3, pro-rata invitations, MFN drafting check, SAV valuation, deed template, cap-table admin, ERS setup, s431-at-exercise runbook, advisor reference/security checks); each item gates the grants that depend on it | New |
| **Configure** | Everything editable: baseline, rounds, scenario sets, value bands, milestones, objectives, pools (equity + token), capital schedule, benchmarks, legal-corpus text blocks, roadmap CSV | Extend |

Performance budget unchanged: no page mounts more than ~3 charts before interaction.

---

## Part 9 · User-flow catalog

**Group A — Set up the company model (Configure).** F1 baseline · F2 scenarios (→ now scenario *sets* with walk-forward priors, Δ3) · F3 value bands & benchmark bands (→ dollar-denominated, Δ1) · F4 objectives, pools (equity + four token pools), capital schedule · F5 roadmap import — all as v1, updated per the deltas.

**Group B — Model the board.** F6 add/edit advisor (now with residency → tax-regime routing, referee/check fields, lifecycle stage) · F7 model a package and see it (dual vesting curves; per-grant strike) · F8 model performance uplift (unchanged, plus evidence attachment on earn).

**Group C — Review and decide.** F9 Overview scan (plus lifecycle chips, capital rollup, **band-breach alert** when a package exceeds its cited benchmark band — the Carl-Sjöström check, automated) · F10 board review · F11 compare advisors.

**Group D — Produce and share.** F12 proposition (versioned; v9-corrected corpus; watermark until governance green) · F13 persist/save/share/print · F14 export/import JSON.

**Group E — Trajectory & lifecycle (new).**
- **F15 · Plan a trajectory.** Open Trajectory → see entry grant, scheduled reviews, milestone gates, round events → adjust review cadence, ceiling, objective set. Outcome: a defensible growth story per advisor.
- **F16 · Run a review.** Trigger (calendar or round event) → record engagement + earned objectives → choose outcome (none / top-up / band change / roll-off) → approver sign-off → top-up creates a new Grant priced at current FMV. Outcome: the package grows on the record, not in a side-channel.
- **F17 · Process a fundraising event.** Mark a round closed → engine re-prices, crystallises capital uplifts, flags Series-A structural review for every advisor → trajectory timelines update. Outcome: comp and fundraising move together.
- **F18 · Model a departure.** Select advisor → leaver type (Bad Leaver six-limb test / other) → engine computes vested-to-date per instrument (incl. RTA 24-month qualifying rule), lapses/retains per Plan rules and Board discretion → cap table and pools recompute. Outcome: the Rousseau scenario is one click, not a fire drill.
- **F19 · Issue and track an offer.** Proposition v-final → mark "sent via Iraj" → iterate versions on feedback → references/security checks (per jurisdiction: DBS vs Swiss certificate) → Charlie's offer letter → signed → active. Letter-of-intent mechanic supported: a small token grant that cancels into options when the ESOP is live. Outcome: pipeline truth in one place.
- **F20 · Roll up capital introductions.** Board view of per-advisor introduced capital vs the live raise target; gated uplift owed; conversion to earned on close. Outcome: the board-as-capital-channel quantified (O15).

**Group F — Governance (new).**
- **F21 · Work the governance checklist.** Governance surface → each item with owner/status/evidence; items gate dependent grants (e.g. no executive-officer grant until Pantera consent recorded; no exercise processed without s431 election within 14 days for UK-taxable holders; PSC-structure check at every Contracted-Entity exercise). Outcome: legal pre-conditions enforced by software, not memory.
- **F22 · Record a valuation.** Enter SAV/409A agreed value + date → feeds every strike/FMV display and the Instruments panel. Outcome: one valuation, everywhere consistent.
- **F23 · Run an exercise event.** Holder, grant, share count → window check (Board-determined window or 3.6 backstop) → net-exercise / sell-to-cover election → s431/83(b) election checklist → deed of adherence undertaking → output an exercise pack. (Modeling + checklist in v1 of this feature; document generation later.) Outcome: every exercise is compliant by construction.

---

## Part 10 · Compensation mechanics the engine must encode

The frozen engine stays frozen for the shipped v1; these are the **engine v2 requirements** (a new Linear milestone — see Part 14):

1. **Per-grant strike/FMV** derived from grant round (not one global constant). Default today: $1,572.95 (bridge $90m/10% cell).
2. **Dual vesting curves**: ESOP = 25% at year-1 cliff + 25% annual tranches at anniversaries 2–4 (Cert v3); RTA = 25% at year-1 cliff + 2.08%/month to year 4, **gated on 24-month minimum Continuous Service**; Continuous-Service and leave rules per the RTA.
3. **Value→quantity conversion**: $value ÷ (FMV − strike) → option count; $value ÷ (TGE FDV ÷ supply) → token count; restated per scenario.
4. **Exercise windows**: Board-determined liquidity windows only; Clause 3.6 backstop (≥90-day window, ≥30 days' notice, before the 10th anniversary); net exercise (4.5, FMV = exit consideration at Exit Event else most-recent-grant methodology) and sell-to-cover (7.4(a)).
5. **Leaver engine**: Bad Leaver (six limbs, incl. resignation within 24 months of VCD and the Developed-Protocol competition limbs) → vested options lapse on cessation, unvested lapse, token forfeiture; non-Bad-Leaver → Board discretion (Rule 5.8). 
6. **No automatic CoC acceleration** (Rule 9.2 deleted in v9); roll-over by acquirer possible; the Proposition must say exactly this.
7. **Funding-round carve-out** (11.2): primary financings at/above nominal value trigger no compensatory adjustment — anti-dilution arguments closed off; 11.3 Board discretion for special distributions.
8. **Constitutional Limit** (13.10): pool cap cross-refers to constitutional documents; engine reads the pool from Configure, warns at the hard guardrail; pool cells default 10% ≈ 5,368 / 15% ≈ 8,523 within 12,450 available.
9. **Token↔equity conversion fallback**: liquidity event pre-TGE → RTA value converts 1:1 into equity (scenario toggle).
10. **Pre-money pool shuffle** at every round; ESOP top-up to target post-money %; walk-forward priors (Part 6).
11. **Capital-introduction schedule**: per-$ uplift, %, cap, gate; per-advisor and board rollup.
12. **Cash-floor trade**: optional cash component that reduces instrument value at a configurable exchange rate (the "trade £10K of certainty" mechanic), with the annual-affordability check against burn (~$430K/month context).

---

## Part 11 · Governance, legal & compliance features

Software-ised from Governance Table v4 and the s431 workstream:

- **Consent matrix as data** — Pantera (exec-grant consent live until SAFE converts; Converting Securities >$10m; Token Warrants; ss.8–13 survive Series A absent release), Lightspeed s.6(a) anti-termination (critical at Series A), Big Brain / Figment MFN survivals, Reciprocal pro-rata + token MFN. Each consent attaches to the grants/rounds it gates.
- **Compliance runbook items** — SAV/HMRC + 409A valuation before first grant; s431 election within 14 days *of exercise* with company countersignature (hard process check at every exercise event); PSC/Contracted-Entity routing rules (election available only when shares issue to the individual Service Provider); corporate-wallet audit flag on the token side; ERS Annual Return; deed-of-adherence template before first exercise; cap-table admin system decision (the Studio itself vs Carta/Pulley — item 9/10 of the table); DBS (UK) and Swiss suitability certificates for advisors.
- **Blocking semantics** — a grant whose pre-conditions are not green renders with a warning chip everywhere it appears and watermarks its Proposition.
- **Audit trail** — append-only log of grant, review, consent, and valuation changes (precursor to M6 auth and server persistence; required for the "defensible in a board conversation" promise).

---

## Part 12 · Benchmarks & decision support

- **FAST bands** (Standard 0.15–0.25% · Strategic 0.30–0.50% · Expert 0.60–1.00%) retained for sanity-checking the *output* percentage of value-denominated awards — with the explicit caveat that the negotiation unit is dollars.
- **US private-company advisory median ~$50K/yr** (Carl Sjöström's data point) as the value-band anchor; bands above it must justify themselves ("$50K won't get these people out of bed; $100K maybe — but you must afford it annually").
- **Day-rate reality test** — compare the package's annual value against the cost of equivalent magic-circle/Big-4 time for the stated time commitment (Rajesh prices himself this way; the tool should let you).
- **Compa-ratio pattern** — adopt the salary survey's role-category → P25/P50/P75 → compa-ratio → ▲/◆/▼ status display for advisors now and employees later; one consistent benchmark grammar across the comp OS.
- **The Ispahani 9-step process as a guided flow** — a "New grant decision" wizard walking dilution budget → eligibility → franchise situation → total-comp picture → external comparison → internal comparison → allocation-with-reserve → iterate, leaving an artefact per decision. This is the strongest possible answer to "defend it in a board conversation."
- **Generosity guardrails** — automatic alerts for: band breach; pool-consumption thresholds; totality (token + option + cash for one person vs peers); reserve depletion (allocations must keep reserve for future hires — Ispahani step 8).

---

## Part 13 · UI/UX reference patterns (Frappe / Carta / company-OS systems)

| Pattern | Source | Adoption in the Studio |
|---|---|---|
| **Appraisal templates & cycles** — standardised templates, department-wise cycles, automated reminders | Frappe HR Performance | `Review` templates per value band; review cycles with reminders; the trajectory checkpoint system is exactly an "appraisal cycle" for advisors |
| **KRA-weighted goal scoring; formula-based final scores** | Frappe HR | Objective categories ≈ KRAs; uplift weights ≈ KRA weightage; keep the *visual grammar* (goal tree, weighted rollup) while honouring the 4–6-measure ceiling |
| **360°/timeline feedback view** | Frappe HR | Review history timeline per advisor (engagement notes, outcomes) |
| **Tree-view goals with archive** | Frappe HR | Milestone/objective tree in Configure |
| **Scenario modeling from the cap table; round modeling before term sheet; waterfall/exit analysis** | Carta | Part 6 is the in-house, token-aware version; Carta validates the persistent-scenario-switcher pattern |
| **Board-consent and approval workflows; audit trails; version control** | Carta | Governance surface + audit log + proposition versioning |
| **Stakeholder/employee portal (grants, vesting, estimated value)** | Carta | The advisor read-only Proposition/Trajectory now; full portal at M6 (auth) |
| **Single source of truth replacing spreadsheets/email grant workflows** | Carta | The Studio's stated end-state: retire the comp spreadsheet Robin owes Iraj/Carl by making the Studio *be* that spreadsheet |
| **Goal/OKR visual systems (check-ins, progress trees)** | Mooncamp / Craft.io | Light-touch only: milestone progress chips and check-in notes; deliberately *not* a full OKR product (the 16 Apr session's conclusion: milestone-tied comp replaces OKR machinery at this size) |
| **Frappe-ui component idiom** | Frappe Framework | Already milestoned (M8/M9): Toast/Alert/TabButtons/Tooltip/Avatar/Combobox adoption, left-sidebar IA, ⌘K palette, breadcrumb board-switcher |

---

## Part 14 · Build mapping (Linear)

Engine remains **frozen** through M5–M9 as planned. New scope slots in as:

- **M7 (a11y floor)** — unchanged; Governance and Trajectory surfaces must meet the same WCAG 2.1 AA bar at birth.
- **M8 (UX uplift)** — the global scenario switcher and decision aids land here; extend the switcher spec to scenario *sets*.
- **M10 · Engine v2 (proposed)** — Part 10 items: per-grant strike, dual vesting curves, value→quantity, leaver engine, exercise windows/backstop, conversion fallback, capital rollup. Spec-first with a reconciliation suite against the dilution workbook and Cert v3/RTA schedules; engine unfreezes only behind green parity tests. ≤450 LOC per issue discipline retained.
- **M11 · Trajectory & lifecycle (proposed)** — Part 5 + F15–F20; depends on M10.
- **M12 · Governance & compliance (proposed)** — Part 11 + F21–F23; can begin presentation-only (checklist as data) before M10.
- **M6 (auth & server persistence)** — unchanged, but now also the prerequisite for the advisor portal and the audit log's integrity; note the live URL currently exposes confidential comp **publicly** — M6 remains the most urgent risk item.

---

## Part 15 · Success criteria (v2)

v1 criteria stand (defaults reconcile; no view recomputes; end-to-end founder flow; full add/rename/delete with cascades; benchmark-cited figures; floor→base→ceiling legibility). Added — the Studio achieves v2 when:

1. Robin can hand Iraj and Carl Sjöström **a link instead of a spreadsheet**: scenario sets, per-advisor packages, trajectories, and the governance state, all current — closing the 5 June action item permanently.
2. For each of Rob, Martin, and Kerim, a **uniform-entry, dollar-denominated straw-man** can be produced, versioned through negotiation, and tracked to signature — with no number that isn't engine-true and no stale legal line (CoC text corrected to v9).
3. Any package can be shown **under any saved scenario set** in two clicks, and two scenario sets (or two offers for the same person) can be diffed side-by-side.
4. A review can be run, a top-up granted at current FMV, and the advisor's Trajectory timeline visibly grows — performance → reward, on the record.
5. A simulated Bad-Leaver departure recomputes both instruments correctly (including the RTA 24-month rule) in one flow.
6. No executive-officer grant can be marked "granted" while the Pantera consent item is red; no exercise can complete without its s431 checklist; the SAV valuation entered once appears everywhere.
7. The board-level capital panel answers "how much of the bridge is the advisory board expected to introduce, and what uplift does that cost us" in one view.

---

## Part 16 · Non-goals (v2)

- Still not a cap-table system of record, binding-offer generator, or tax engine — it models, drafts, and checklists; Charlie and external counsel execute. (The Governance Table's item 10 — Carta/Pulley for administration — remains a separate decision; the Studio should be able to *coexist* with one.)
- No payroll, leave, attendance, or recruitment (Frappe HR territory) — the comp OS boundary stops at reward design, trajectory, and governance.
- No live market/price feeds; TGE and valuation inputs remain user assumptions, flagged unvalidated.
- Document *generation* (offer letters, exercise packs) is checklist-plus-links in v2; templated generation is a later milestone with Charlie as design authority.
- Full OKR/performance-management product — deliberately out (16 Apr decision); milestones and reviews only.

---

## Part 17 · Open decisions (need owners)

| # | Decision | Owner | Blocking |
|---|---|---|---|
| 1 | Pool share count & percentage (Resolution 4/5 blanks: 10% ≈ 5,368 vs 15% ≈ 8,523) | Board (Robin) | Plan adoption; all option grants |
| 2 | Advisor value bands: anchor numbers per band ($50K? $100K? per year) and the entry band for Rob/Martin/Kerim | Robin + Carl Sjöström review | Straw-man propositions |
| 3 | Cash-floor policy: allowed as a trade? at what exchange rate? (Rajesh-type asks) | Robin/Iraj | Negotiation protocol |
| 4 | Review cadence default (6 vs 12 months) and Series-A structural-review scope | Robin/Iraj | Trajectory config |
| 5 | Whether advisor awards come exclusively from the ESOP pool or partly from the 5% Advisors token pool (currently 1.83% unallocated) | Robin + Charlie | Pool math |
| 6 | Robin's own grant (Pantera consent path; ~5% token draft in Team pool) — sequence standalone, before term sheet | Robin + Charlie | Governance item 3 |
| 7 | Engine-unfreeze gate: reconciliation suite scope for M10 | Robin (eng) | M10 start |
| 8 | Advisor portal timing (M6 auth prerequisite) vs public-URL exposure remediation **now** | Robin (eng) | Security |

---

*Confidential. Discussion draft, not a binding offer. Entity: Ackermann Systems Engineering Limited t/a Raiku, Cayman Islands (BL-411368). TGE multipliers and valuation assumptions unvalidated. Sources: see Part 0.*

---

# DETAIL APPENDICES

*Parts 1–17 are the synthesis. The appendices below are the complete, granular detail register from every source — nothing dropped. Where a detail has product consequence, it is tagged → with the feature or part it feeds.*

---

## Appendix A · Canonical numbers register

### A.1 Constitutional position (definitive — ESOP workstream / Resolution v5)
- Entity: **Ackermann Systems Engineering Limited (ASEL), t/a Raiku**, Cayman exempted company **BL-411368**. Subsidiary: **Raiku Labs Limited** (Cayman) — operations + IP holder.
- Authorised: **50,000** ordinary shares at **USD 1.00 par** (Memorandum).
- Issued and outstanding: **37,550** — Robin Andre Nordnes, sole holder (75.1% of the original 50,000).
- Cancelled: **12,450** — Joel Rousseau, repurchased for **USD 1.00** and cancelled **30 April 2026** under **article 48**; under Cayman Companies Act (2026 Revision) cancellation extinguishes issued shares but does **not** reduce authorised capital — the 12,450 revert to the available unissued pool.
- Articles: **art. 8** — directors' unrestricted authority to allot shares and grant options; **art. 9** — directors may create new share classes and fix rights (incl. voting) by directors' resolution alone; **art. 78** — sole-shareholder written resolution; **art. 111** — board written resolution. **No Articles amendment required.** No shareholders' agreement exists.
- Pool sizing: **10% ≈ 5,368 shares; 15% ≈ 8,523 shares** — both within the 12,450 available. Two blanks remain in Resolutions 4 & 5.
- Pending: **Bell Rock** email confirmation that the Memorandum still records 50,000 authorised post-cancellation.
- New class to be created: **ordinary non-voting "Option Shares"**, US$1.00 par, pari passu on dividends/return of capital, no votes — by directors' resolution under art. 9.
→ Engine defaults; Governance surface items 1–2; Configure baseline.

### A.2 Live cap table (Fully Diluted Pro-Forma, SAFEs as-converted)
- Robin 37,550 = **77.715%** FD. Pre-seed: **31 holders**, $2.26m at **$25m post-money cap**, **$500/share-equivalent**, 4,519 shares-equivalent (9.35%). Pantera: **$8.0m across three entities** at **$90m cap**, **$1,800/share-equivalent**, 4,444.44 (9.20%) — shown as a discrete row "given its size and side-letter sensitivity." Other seed: $3.245m at $90m, 1,803.34 (3.73%). **Total FD current: 48,316.78.**
- Named pre-seed holders include: Figment Master Fund II LP ($725K), Big Brain Holdings ($725K), Reciprocal Ventures II LP ($300K pre-seed + $140K seed), Anagram, Chorus One, Everstake, Kiln, Solforge Superteam Collective, Austin Federa, and ~20 individuals at $4.5–50K. Seed includes Jump Crypto ($900K), Lightspeed Faction ($1.0m), HashKey FinTech Fund III ($250K), Amber Group ($250K), Gate Ventures ($200K), Initial Ventures, Staking Facilities, Blockdaemon (via Konstantin Richter), AYO Capital (Anatoly Yakovenko, $10K), Stake Capital (Julien Bouteloup), Delroy Fong, Dean Khan ($2K), H2O Nodes, Zhenghong Lieu.
- A historical sheet ("Equity Cap Table w ESOP") still shows Joel Rousseau 12,450 / 24.9% — **superseded**; the Studio must treat the post-cancellation table as canonical and the old sheet as archival only.
→ CapTableSnapshot seed data; investor-consent linkage (A.6).

### A.3 Dilution scenario grids (the workbook the engine generalises)
- **Default raises:** Bridge **$5m** · Series A **$20m** · Series B **$40m** · Series C **$80m** (editable on the Tab-7 selector).
- **Post-money grids scanned:** Bridge $60/80/**90**/100/110/130/150m · A $100/**120**/150m · B $150/**300**/500m · C $300/**500**/750m (bold = base-path prior used in the walk-forwards).
- **ESOP targets (post-money):** Bridge 10–15% · A 10–15% · B 15–20% · C 20%. **8 ESOP path combinations** (2×2×2×1).
- **Methodology rules (engine-canonical, notes 1–6):** (1) pre-money pool shuffle at every round — ESOP creation and new money both dilute pre-money holders; (2) ESOP top-up sized to hit target % post-money, no top-up if already above; (3) bridge modeled as converted preferred at bridge post-money cap — actual SAFE conversion at Series A; (4) Pantera discrete row, assumed converted in line with cap; (5) **Robin's share count fixed across all scenarios** — only % declines; (6) **not modeled:** anti-dilution, warrants, secondary, MFN flow-through — "real outcomes will differ" caveat survives into the UI.
- **Headline observations (preserve as auto-callout patterns):** $90m flat / 10% ESOP → Robin 77.72% → **65.63%** (−12.09pp); $60m down / 15% → **59.58%** (excluded by the **$90m floor in the strategy memo**, shown for completeness); $150m / 10% → **67.35%** (founder-friendly extreme); **ESOP creation is the larger dilution driver at the bridge** (10–15%) vs new money (3.3–8.3%).
- **Implied price/share at base bridge cell ($90m/10%): $1,572.95** — the engine's strike. Bridge price/share range across grid: $952–$2,691.
- **Walk-forward base path:** Bridge $90m+10% (57,217 FD) → A $120m+15% (75,359 FD; Robin 49.83%) → B $300m+15% (89,380 FD; Robin 42.01%) → C $500m+20% (**118,707 FD**; Robin 31.63%). Robin cumulative loss vs current at C base: **−46.08pp**. Series B implied $/share $3,122–$6,010 at upper cells; the staircase chart should carry these.
→ Part 6 scenario system; engine reconciliation suite (M10).

### A.4 Token pools (Management _ Token allo — live state)
- Headline: **total pools 65%** of supply; **total allocated 43.62%**; **unallocated 21.38%**; **not pooled 35%**.
- **Team Pool 20%** — allocated **12.7316%**, available **7.2684%** (Robin's 16 Apr correction: effectively ~12% after two contractor terminations). Notable rows: Robin **5.0% (In draft)**; Waleed 0.65% + 0.10% (two signed RTAs); Stanly 0.55%; Saikat 0.5% (*"will be granted between 0.3% and 0.6% after probation"*); Konrad 0.4% + 0.4% (*history: upped 0.25%→0.4% July 2025; a further increase to 0.7% or 0.8% has been verbally communicated by Robin* — an open promise the Studio's lifecycle states must track); Jason Davis 0.4% + 0.4% ("x2"); Sushant 0.3%; Charlie Bourlet 0.5% (In draft); Christian Matt / Svetlana(Lana) Irvina / Mohamed Hamilton / Amy Gleeson / Alexandru Murtaza / Kristoffer Ström / Andrea Simeoni / Luca Provini / Supragya Raj at 0.22% (various Signed/Sent/In draft); Tengiz 0.2055%; Amine 0.2%; Anthony Pieri / Sylvain Druais / Chris Fay 0.1667%; Anders 0.15%; David Holt 0.13%; Arnaud 0.12%; Lucian 0.026%; Cancelled: Kalankhodzhaev, Matheus, Christian Kourtis (*separate advisor RTA planned; might hire FT after Series A/TGE*), Andrew Burger, Elizabeth McFaul, Florian Franzen, Bernhard Schuster, Joshy Orndorff, Clara Cambra (0.22% signed — status per dispute).
- **Advisors' Pool 5%** — allocated **3.17448%**, available **1.82552%**. Rows: Anza 0.9%; Anagram 0.6%; Forgd 0.5% (In review); Middlegame Adventure 0.3%; Delroy Fong 0.289%; RPCI 0.15%; Gate 0.1%; Hype 0.1%; Chen Da 0.10148% (*hour-based, capped at 0.101%* — precedent for **time-metered token comp**); FortyIQ 0.079%; Julien Bouteloup 0.055%.
- **Investor Pool 20%** — allocated 17.7189%, available 2.2811% (derived from the cap table).
- **CEX Pool 20%** — "allocated" 10% = **Coinbase's preliminary screening quote, Nov 2025** — *nothing actually allocated*; available 10%.
- Doc-status vocabulary to adopt as grant states: **Signed / Sent / In review / In draft / Cancelled**, each with an RTA document link column.
→ Pool entities; lifecycle states (F19); per-grant document links; the new-advisor awards must fit within the **1.83% Advisors-pool headroom** or draw from ESOP — open decision #5.

### A.5 Salary survey structure (benchmark grammar to mirror)
- 28 active employees (27 FT, 1 PT), **11 granular role categories**; avg base all-active **$171,982** vs Web3 market P50 **$157,179** (**+9.4% ▲**); FT-only avg $176,130. GBP at **1.27 USD**. Sources: CryptoJobsList · Messari · Levels.fyi (crypto filter) · Developer DAO Salary Survey 2025 · Web3 Career. Peer set: early-stage **<50 FTE Web3/Solana infrastructure**, Europe & North America. **Compa-ratio = actual ÷ P50; target 0.95–1.10 most roles; P75+ for core engineering.** Status glyphs: ▲ above (> +5%) · ◆ at (±5%) · ▼ below (< −5%); amber = part-time; FTE-adjusted note pattern (Niko example).
- Notable data points the totality view will surface: Robin $190,500 (compa 0.89 ▼ — CEO below market); Konrad 0.89 ▼; Saikat $254K (1.18 ▲); Chris Fay 1.60 ▲; Mohamed 1.40 ▲; Charlie $250K (1.14 ▲).
- The employee-data sheet adds per-person: hire date, EOR vs Contractor, supervisor, probation end, nationality/residency, RTA status+allocation — the **person schema** the Studio should import.
→ Part 12 benchmark grammar; O16 extension; Person entity fields.

### A.6 Investor consent matrix (definitive — 47 investors reviewed)
- **Pantera** (3 entities, $8m SAFEs + Side Letter 13 Jun 2025): s.7/Exhibit A consent list **live until SAFE converts**; pool creation does **not** trigger consent; **each executive-officer grant requires written consent** (Robin's grant = immediate item, standalone, before term sheet, not bundled with bridge); consent also required for Converting Securities **> US$10m aggregate** (bridge SAFE) and **further Token Warrants** (bridge); pro-rata live and uncapped; **ss.8–13 survive Series A absent express release**.
- **Big Brain** (pre-seed; waiver 12 Jun 2025): consent + pro-rata extinguished; **MFN s.4.1** and information rights survive. **Figment** (waiver 13 Jun 2025): same; **MFN s.5.1** survives. **Reciprocal**: pro-rata live (seed s.1); **token MFN seed s.4**; no equity consent. **Lightspeed**: pro-rata live (s.1); token MFN (s.2); **anti-termination s.6(a)** — all rights survive any future company document unless Lightspeed expressly consents in writing (**critical at Series A**). All other 40+ investors: standard SAFEs/Token Warrants, no side letters.
- Resolution v5 confirms: **no investor consent is required to adopt the Plan or create the pool**; the cap table must be updated post-pool and shared with Pantera, Big Brain, Figment under information rights.
→ Consent entity seed data; Governance gating semantics (F21).

### A.7 Company-context constants
- Monthly burn: Q1 ≈ **$530K** → reduced to ≈ **$430K** (target ceiling even post-raise); cost cuts: research team terminated (3→2→0), one ops exit; ~**$80–95K/month** saved in the prior six weeks (Kerim call). Bridge target **$5m** ("frankly we need it to boost runway"): ~$1–2m from capped pre-existing investors + ~$3m from market makers already in partnership; **two purposes** — capital *and* friendly investors to set preferential share-class terms pre-Series A. Series A target: **end of 2026 / Q1 2027**. The next priced round sets share-class terms (the "Pantera mistake": next-round investor sets conversion terms; small friendly bridge regains control; *unintended consequence: Pantera then loses its veto rights*). Planned future: new Terminal sub-team (small); trading desk kept quiet ("research exercise" framing). Key-people register (Robin, 16 Apr): **Waleed, Konrad, Jason** + "let's see about two others"; Waleed has pushed for an ESOP **since day one** and is the only person told with specificity.
- Group/tax structure (UK tax note, 2 Apr 2026): Robin UK tax-resident since 2016 (less 9–10 months 2020/21); becomes **long-term UK resident 6 April 2027** — the driver of "I might need to move out of the UK before April 6th 2027" and of Foundation timing; ASEL + Raiku Labs currently **managed and controlled in the UK** via Robin's close control, not yet registered for UK corporation tax; token issuance planned via a **BVI company (BVICo)** for regulatory reasons; **Cayman Foundation** (no members, supervisor model) ready to stand up "within a week, with the push of a button" — not started to avoid running costs; plan to transfer Robin's ASEL shares to the Foundation; tokens = utility tokens (marketplace payment/reward); key product launch 3–5 months from the note.
→ Affordability checks (engine #12); TokenModel context; trajectory round events; risk flags.

---

## Appendix B · Ispahani Advisory register (option-plan commentary, 8 May 2026)

### B.1 Draft remuneration principles (complete)
1. **Purpose**: principles articulate how remuneration supports Raiku's success, the strategy statement's goals, and long-term sustainable value creation for all shareholders; the policy is the framework enabling attraction/development/resourcing/recognition, rewarding performance and teamwork, signalling what Raiku stands for.
2. **Why we pay**: compensation for work and contribution; opportunity to share in collective success; signalling expected actions/behaviours. Total remuneration = non-financial reward + fixed pay + variable (short-term, long-term, **token incentives**) + benefits; framework set but adaptable per market/business situation.
3. **Differentiation**: pay for the role, the contribution, and how the person enables collective success.
4. **Effectiveness**: relies on common understanding among owners/Board/earners; careful clear communication; **favour simple, uncomplicated solutions**.
5. **How decisions are taken**: objective and fair; informed by external market, internal comparators, individual circumstances, company financial position. **Board owns all remuneration**; Board shall appoint an independent **Remuneration Committee**; disciplined framework with due process and compliance. Two governance invariants: **no individual involved in decisions affecting their own remuneration**; **"grandparent" approval minimum — manager proposes, manager's manager approves**.
6. **Fixed remuneration**: repeated, predictable. **Pensions/benefits**: appropriate to local market.
7. **Variable remuneration**: reward a standard of performance consistent with long-term sustainable success; **must be capable of paying below expected value, including zero**; **defined maximum on every incentive, above which value doesn't increase regardless of performance**; measures, required levels and threshold/expected/stretch values **calculated, tested and set in advance**; **Board discretion to reduce or delay** payments not reflecting financial/business reality; LTI/token incentives restricted to **a limited group who can impact strategic direction**.
8. **Performance**: reflect shareholders' goals (return on equity etc.) by actualising potential; **measurable, repeatable, auditable; avoid overlaps**; discretionary measures limited by policy to **a small percentage** of the opportunity. **"Remuneration should not be designed for retention"** — talent is retained by attractive opportunity for interesting, impactful, challenging work.
→ Part 1 philosophy; review-workflow approval rules; uplift caps; the principles document Carl Sjöström owes ("ten principles") slots here as Configure-editable text.

### B.2 Design-point register — every "to note" (Andersen-draft review)
| Design point | Rules as drafted | Ispahani note → product consequence |
|---|---|---|
| Delivery mechanism | Call option over ordinary shares struck **at par** | Consider an **omnibus plan** (✅ adopted — 2025 Omnibus Equity Incentive Plan); consider **alphabet shares** / value-on-minimum-performance → share-class designer is future scope; hurdle/sweet-equity noted in F (16 Apr) |
| Vesting/performance timeframe | Certificate sets earliest exercise dates; Board defines exercise periods; 1-yr cliff 25% + monthly; options expire ≤10 yrs | Exercise periods must be **when the company can afford it** (admin + cash); UK-listed norm is a **3-yr cliff** but tech is frequent vesting; consider **less-frequent vesting to minimise admin** (✅ v3 went annual); consider **no-exit backstop** (✅ Clause 3.6) |
| Frequency of awards | Board discretion | Decide intended cadence: **once / ad hoc / annual / top-ups** → the Studio's Review system *is* this answer (top-ups) |
| Caps | **No value cap defined** | Consider capping pre-exit value → ceiling mechanic (5.2) closes this at package level; plan-level cap still open |
| Thresholds | Only the exercise price | Consider a **minimum performance / financial-position threshold** → milestone gates |
| Value drivers | Share-price growth above strike | Align exercise period with strategy & funding cycles; consider **valuation principles in the certificate** incl. **discount for non-traded stock** → Instruments panel should state valuation methodology |
| Quality check on value | None | Consider performance requirement on vesting or exercise price → gated objectives |
| Participation | Employees eligible; separate non-employee plan | Definitions should **explicitly allow advisory-board members** (✅ Schedule limb (c)); **separate plans risk drift** (✅ resolved by omnibus) |
| Participants' rights | Discretionary, no rights (cl. 8) | Options over ordinary shares ⇒ **voting and dividend rights after acquisition** → resolved by the non-voting Option Shares class |
| Participants' obligations | Holder liable for **employer's NIC + personal tax** (4.3, 7) | Must be **very clearly communicated at award** to protect incentive effect → Proposition obligations section |
| Quantum | No maximum defined | Some companies cap value/shares grantable **without shareholder approval** → Governance threshold alert |
| Financing of awards | New issue or treasury shares | **Grants will likely impact P&L** (IFRS 2 / ASC 718) → future expense view; v8 Rule 13.11 recharge (deleted in v9) referenced the same standards |
| Ownership requirements | None | Consider requiring senior executives to **hold shares post-exercise** for investor alignment → policy toggle, later |
| Manner of exercise | Holder pays exercise price; no post-exercise sale mechanics | Rules should allow **net exercise** (✅ Rule 4.5) and address **whether pre-exit trading** with company/shareholders/participants/third parties is allowed → ties to Robin's 27 May question about advisor option holders selling to an external investor with Board approval — *open design point* |
| Dilution | No limit defined | Consider a **maximum dilution number** for investor assurance (✅ Constitutional Limit 13.10) |
| Clawback | None | Consider clawback **if valuation based on false premises** → open; Ispahani principle 7's reduce/delay discretion partially covers |
| Good leaver | All leavers good except summary dismissal | **Tighten**: enumerate death/disability/redundancy etc.; current wording lets "not-so-good leavers" off → ✅ Bad Leaver six-limb adopted (v8/RTA) |
| Leavers' awards | Unvested lapse on notice unless Board allows; vested lapse after next exercise period; death = 1 yr | Consider vested options lapsing on **unilateral resignation and/or joining a competitor** → ✅ Rule 5.8 (Bad Leaver: vested lapse; otherwise discretion) |
| Disciplinary | Exercise delayed (3.3) | Also **delay vesting** under investigation → ✅ Rule 3.3A suspension of vesting |
| Part-time / leave | No adjustment | Consider reducing unvested options on long-term leave / reduced hours → RTA leave-policy linkage; ESOP open |
| Change of control | Vested exercisable; unvested at Board discretion; acquirer may roll over | Participants may want automatic full vesting (hurts roll-over); **double-trigger** (CoC + termination within ~1 yr) suggested — **explicitly rejected 21 May 2026** (Board-discretion-only v8 Rule 9.2), then **9.2 deleted entirely in v9**; "Control" tightening deliberately not actioned; simple-majority trigger risk noted (funding round could tip scales temporarily); **unclear treatment of subsidiary sale / sale of most assets** → Exit Event definition covers substantial asset sale; Proposition must state the v9 position |
| Major corporate events | Variation of capital → adjust options/price (cl. 11) | One-off dividends/value events may merit adjustment consideration (✅ Rule 11.3 Board discretion, applied uniformly); **stress that funding rounds trigger no automatic or compensatory grants** (✅ Rule 11.2 carve-out) |
| Legal framework | Cayman law; Board owns plan (13); Board final on disputes (13.6) | Allow **country addendums** (UK EMI / CSOP) → ✅ v8 added a UK Tax Schedule, **deleted again in v9** (UK mechanics handled outside plan body) |
| Other definitions | "Business Day" referenced to Cayman | Consider holder locations — a CI trading day ≠ a UK trading day; check all CI references against other applicable legislation, via text or country addendum → ✅ v8 Business Day extended to **London + Cayman** |

### B.3 The 9-step grant-decision process (verbatim sequence)
(1) Determine what performance/returns make each level of dilution and cost acceptable → (2) set total dilution + employment cost acceptable **per year** over the foreseeable future given strategy/financial position/investor expectations, and obtain approvals → (3) set eligibility criteria for employees, consultants, directors → (4) assess the **"franchise situation"** — how critical and how replaceable is the individual → (5) build the **total compensation picture** per participant: base, bonus opportunity, benefits, **token allocation**, options → (6) compare each total to **market** → (7) compare totals and elements to **existing and anticipated internal comparators** → (8) allocate the year's share of awards, **keeping a reserve for future hires** → (9) **iterate for sustainability**.
→ Part 12 guided wizard, step-for-step.

### B.4 EMI note (appendix detail)
UK discretionary plan (Finance Act 2000). Qualifying: independent trading company, **gross assets ≤ £120m**, **≤ 500 FTE**; participant works **≥ 75%** of their time for the company; per-individual cap **£250,000 unrestricted market value at grant** (CSOP value counts toward it). Tax: none at grant/vest; normally no income tax/NI at exercise; **Business Asset Disposal Relief** available if employed within the rules and **≥ 2 years since grant**; CGT base = exercise price; discount-to-market at grant → income tax/NI on the discount. *(Ispahani does not give tax/legal/accounting opinions.)*
→ Studio relevance: Raiku's Cayman omnibus plan is **not** EMI/CSOP; the appendices exist as future country-addendum context and for any UK employing-entity restructure. Display only.

### B.5 CSOP note (appendix detail)
ITEPA 2003 discretionary plan. Any employee/full-time director **unless holding ≥30%**; **£60,000** max value under option at grant (counts toward EMI limit); no company-size/headcount/hours limits; tax relief requires **≥3 years to exercise (≤10)**, plan remains approved, exercise per rules; strike = market value at grant. Early-exercise relief survives for **good leavers** (death, injury, disability, redundancy, retirement, TUPE, qualifying takeovers, transfer-out of employing company) and takeovers under set rules.
→ Same display-only status as B.4.

---

## Appendix C · Legal instrument register (the documents the engine encodes)

### C.1 Plan rules — v8 amendment register (Advisor Summary, 21 May 2026, complete)
1. **Renamed** "Share Option Plan" → **"2025 Omnibus Equity Incentive Plan"** (aligns with the RTA; single omnibus framework).
2. **Rule 1.1 definitions**: new **"Bad Leaver"** (six-limb, aligned with RTA) and **"Exit Event"** (change of Control, listing, or substantial asset sale); **"Business Day"** extended to London + Cayman; **"Shares"** = ordinary **non-voting**, class authorised by directors' resolution under art. 9; Person/tax/UK terms refined for Cayman law.
3. **Rule 3.3A** — **suspension of vesting** while any cl. 3.3 limb (disciplinary, investigation, breach) applies, mirroring suspension of exercise.
4. **Rule 4.5 — net exercise**: Board absolute discretion, at the holder's written request; FMV methodology consistent with the most recent grant; expressly additional to 7.4(a).
5. **Rule 5.8 — vested-option leaver mechanics**: Bad Leaver → vested options lapse on cessation; otherwise Board discretion.
6. **Rule 7.4(a) — sell-to-cover**: adds holder-elected limb alongside company-initiated; sale routes via third party, the Company, or any shareholder; **accounting obligation for surplus net proceeds**.
7. **Rule 9.2** — Board discretion to accelerate on change of Control, with non-exhaustive criteria incl. the involuntary-termination-within-12-months pattern and anti-claim protection (per Robin's 21 May instruction: discretion only, mandatory double-trigger **not** adopted; "Control" tightening deliberately not actioned). *(Deleted in v9 — see C.2.)*
8. **Rules 11.2 / 11.3** — funding-round carve-out (primary financings at/above nominal value = no variation, no compensatory adjustment); Board discretion for special/extraordinary/non-recurring distributions, applied uniformly.
9. **Rule 13.10 — Constitutional Limit** (replaced per 21 May instruction): pool cap cross-refers to the constitutional documents' maximum from time to time; **13.10(b)** hard no-exceed guardrail; **13.10(c)** automatic-tracking limb — avoids plan amendment on every pool uplift.
10. **Rule 13.11** — intercompany cost recharge narrowed to Group-Company **Employees** only, consistent with **IFRS 2 / ASC 718** (transfer-pricing support for Cayman-parent grants to Raiku Labs staff). *(Deleted in v9.)*
11. **Non-employee Scheme Schedule**: Eligible Participant expanded to **(c) advisors / advisory-board members** and **(d) Contracted Entities** (PSCs, LLPs, partnerships, other entities through which an individual provides services, with the named individual identified in the Option Certificate as the **"Service Provider"**); new **Rule 2.4** re-anchoring vesting + Bad-Leaver mechanics on the Service Provider; **2.5** substitution-override; **2.6** Contracted-Entity **dissolution mechanic** (transfer-or-replacement option); **2.7** default-to-leaver fallback.
→ Engine leaver/vesting/exercise mechanics; Person→Grant routing for PSC advisors; Proposition corpus.

### C.2 Plan rules — v9 amendment register (six changes from v8)
(a) **Exit Event definition retained** (used in 4.5(c)); (b) **4.5(c) net-exercise valuation** — exit consideration = FMV at Exit Event, otherwise most-recent-grant methodology; (c) **7.4(a) de-duplication** — duplicate limb deleted, sell-to-cover reinstated; (d) **Rule 9.2 deleted** (no CoC-acceleration discretion in the plan; cross-references updated); (e) **Rule 13.11 deleted**; (f) **United Kingdom Tax Schedule deleted** (UK mechanics — s431 elections, s.222 PAYE alignment, employee-only joint NIC election, Off-Payroll monitoring, IR35 non-characterisation, ERS Annual Return — now handled outside the plan body). Files: Plan_rules_v9_clean + redline.
→ Δ4 correction; Proposition corpus must reflect (d) and (f).

### C.3 Option Certificate v3 register
- Recital (A): plan renamed. **Clause 3.2(b)**: vesting re-cadenced — 25% one-year cliff, then **25% annual instalments on the 2nd, 3rd and 4th anniversaries**; fully vested at year 4 (fixes prior monthly-drafting ambiguity).
- **Clause 3.6 — no-exit backstop**: if no Exit Event before the **9th anniversary** of grant, the Company **shall** open an Exercise Period of **≥ 90 days**, ending no later than the day before the **10th anniversary**, on **≥ 30 days' written notice** (the "3.5A" hard prefix deleted; Word auto-numbers 3.6).
- **Body section 6 (UK tax) removed** — Cayman-law consistency; UK mechanics moved to the (v8) schedule, then out of the plan entirely at v9.
- **Annex 1 — Exercise Notice** (one page, items 1–8): shares exercised; aggregate exercise price (USD); **item 3: net-settlement election** (cross-ref Rule 4.5(a)); Plan + Certificate confirmation; Tax-Liability & withholding acknowledgement; jurisdictional confirmations (**s431 ITEPA for UK; s.83(b) IRC for US**); **deed-of-adherence undertaking**; Rule 3.3 representation; signature block; optional witness paragraph removed (resolves the Lana Dixon comment) — "binds the holder into the cap-table and tax regime at exercise."
- **Annex 2 — Section 431 Election** (signed on exercise). Separate **Section_431_Election_Standalone.docx** exists for non-Plan acquisition events (token side; direct share acquisitions).
→ F23 exercise flow; dual vesting curve; Instruments panel.

### C.4 Resolution v5 register (eight resolutions)
(1) Plan adoption (Exhibit A); (2) Option Certificate form approved (Exhibit B); (3) creation of the **non-voting Option Shares class** by art.-9 directors' resolution, reserved out of the 12,450; (4) pool = **[●] shares ≈ [●]%** FD post-pool — the two blanks; (5) executive-officer consent condition (no exec grant until Pantera written consent); (6) cap-table update + availability to Pantera/Big Brain/Figment per information rights; (7) general authority (incl. instructing Bell Rock); (8) conflict-of-interest declarations. Signature structure: Part A sole-shareholder (art. 78, Robin) + Part B board (art. 111, all directors).
→ Governance items; the two blanks = Open decision #1.

### C.5 Governance Table v4 (all ten rows, statuses verbatim)
A-1 Bell Rock Memorandum confirmation (Charlie/Bell Rock — VERIFY, before resolution signed) · A-2 pool count/% decision (Board — OPEN) · B-3 Pantera consent per exec-officer grant, Robin immediate, **do not bundle with bridge** (REQUIRED, standalone, before term sheet) · C-4 Pantera consent Converting Securities > $10m (REQUIRED, bridge) · C-5 Pantera consent further Token Warrants (REQUIRED, bridge, separate from 3 & 4) · C-6 pro-rata invitations Pantera/Reciprocal/Lightspeed, **document non-participation by reply email** (REQUIRED before term sheet) · C-7 bridge SAFE + Token Warrant **mirror seed terms exactly** to kill MFN flow-through (Big Brain 4.1, Figment 5.1, Pantera 8, Reciprocal seed 4, Lightspeed 2) (drafting check) · C-8 cap table updated with pool, presented as the **pre-money opening position** to bridge investors · D-9 deed-of-adherence template (drag-along, transfer restrictions, **power of attorney**; sole contractual layer — no SHA exists) before first exercise · D-10 cap-table admin system (**Carta / Pulley or equivalent**) + ERS Annual Return process before first grant.
→ The Governance surface is this table as software, one row = one ComplianceItem.

### C.6 Open items 1–12 (workstream master list, complete)
[1] pool numbers into Resolution 4 · [2] Bell Rock email · [3] Pantera consent: Robin exec grant (hard pre-condition) · [4] Pantera consent: Converting Securities > $10m · [5] Pantera consent: Token Warrants · [6] pro-rata invitations before term sheet · [7] MFN notifications at bridge **if bridge deviates from seed terms** · [8] deed-of-adherence template before first exercise · [9] cap-table admin + ERS setup before first grant · [10] **HMRC SAV valuation before first grant** (same valuation feeds 409A for US grantees) · [11] **token-side audit: any contractor whose RTA pays to a corporate wallet** (s431 election unavailable if so) — before next token award cycle · [12] Series A: express Pantera release of ss.8–13; Lightspeed express written consent terminating s.6(a).
→ Governance seed data, verbatim.

### C.7 Section 431 mechanics (complete)
- **Why**: Option Shares carry deed-of-adherence transfer restrictions (Board consent, drag-along, ROFR) → "restricted securities" under **s.423 ITEPA 2003**; without election, HMRC can charge **income tax under Ch. 2 Pt 7** on value uplift when restrictions lift at exit. A **s.431(1) election** fixes the tax base at **unrestricted market value on the exercise date**; subsequent growth is CGT.
- **Operational invariant**: the **14-day window runs from acquisition (exercise), not grant or vesting**; the Exercise Notice requires the holder to attach a signed election; **the Company must countersign within the same window** — hard process check at every exercise event.
- **PSC contractors**: s.431 sits in Ch.2 Pt 7 (employment-related securities); **s.421B(3)** extends to associates; **s.421B(8)** extends "employee" to anyone whose services would constitute employment if under contract; **HMRC ERSM20220** confirms the election attaches to the underlying individual regardless of corporate wrapper. Three scenarios: (1) option to the individual behind a PSC, shares issued to the individual → **election available and necessary** (signed by individual + engaging entity); (2) option to the PSC, shares issued to the PSC → **election NOT available** (a company cannot be a party); (3) Off-Payroll/IR35 → election between individual and **deemed employer**. Schedule routing: Contracted-Entity option with shares issued to the **Service Provider personally** → election available, signed by the individual; shares issued to the entity → not available. **Exercise checklist must flag this at every Contracted-Entity exercise.**
- **Token-side risk**: any contractor who directed their RTA to a **corporate wallet** → election unavailable; audit before the next token award cycle (open item 11).
→ F23 checklist logic; Person.residency + Person.contractingStructure fields.

---

## Appendix D · RTA term register (Restricted Token Award, Reg S non-US form)

- Issuer: **Raiku Labs Ltd** (Cayman) under the **ASEL 2025 Omnibus Token Incentive Plan** (the plan is Exhibit A, incorporated; plan prevails on conflict). Grant block fields: Grantee · Date of Grant · **Percentage of Available Tokens** (the award unit — % of TGE-available supply, exactly how the token workbook rows are denominated) · Vesting Commencement Date.
- **Vesting**: 4 years; nothing before the **one-year Cliff Date**; **25% at cliff**, then **2.08%/month** for 36 months → 100% at the 4th anniversary, subject to **Continuous Service** through each vesting date. *(The 24-month minimum-service qualifying rule — "to receive any token in the first place you must stay 24 months, those months count inside the 4-year vest" — is the operative house rule per the 16 Apr session and "has protected us quite a bit"; encode as a qualifying gate on distribution.)*
- **Bad Leaver** (any cessation other than death, plus any of): (i) **resignation within the first 2 years** of VCD; (ii) serious breach of directorship/fiduciary duties; (iii) unauthorised disclosure of confidential information/IP; (iv) solicitation of clients or key employees in breach; (v) directly/indirectly becoming a shareholder of, providing services to, or taking employment with any business that competes **and** develops/operates a "**Developed Protocol**" function across the enumerated list — (a) blockchain transaction coordination network; (b) block building engine; (c) validator infrastructure optimisation; (d) cross-VM extension architecture; (e) blockspace slot marketplace; (f) block auction system; (g) external execution environment settling on a Developed Protocol — or any of (a)–(g) via another protocol/infrastructure layer settling directly or indirectly on a Developed Protocol, where "Developed Protocol" = **Solana or any protocol the Company actively develops/operates (a)–(g) on**; (vi) material breach of any agreement/policy incl. post-termination restrictions, or dismissal for "cause" (lawful termination without notice/PILON for misconduct or as contractually permitted).
- **Change in Control**: sale of all/substantially all assets; merger where pre-deal holders lose majority of surviving voting power; acquisition of all/majority voting shares in one or related transactions; other business acquisition as Board determines — **expressly excluding** IPO, subsequent public offering or other capital-raising event, **a sale or issuance of Tokens**, and re-domiciliation mergers.
- **Continuous Service**: capacity changes (employee ↔ Board member ↔ advisor ↔ consultant) and intra-group transfers do **not** break service; Board sole discretion on approved leave/transfers; leave counts toward vesting only per leave policy/agreement/law.
- Other defined terms the Studio's glossary should carry: **Affiliate** (control test), **Available Tokens** (aggregate available at TGE), **Insider** (investors, shareholders, employees, officers, directors, convertible holders, advisors/consultants), **Token** (broad — any cryptoasset minted/generated/created by Company or Affiliates), **TGE** (date tokens minted/generated/created and available for public issuance), **Wallet**, **Smart Contract**.
- Operational clauses: tokens issue to **Grantee-identified wallet addresses** (or other Company-determined means); **Grantee solely responsible for wallet security** and private keys. Company option (16 Apr): hold-in-own-wallet vs **company-managed sell cycle via market maker, cash-settled** — Robin's stated preference is **option 2** ("then you can play with the value, Foundation and RL"). The RTA is "structured to be flexible."
→ Engine token mechanics; leaver engine; glossary; the company-managed-sale toggle as a token-distribution policy setting.

---

## Appendix E · Session decision log (every product-relevant detail)

### E.1 Working session — 16 Apr 2026, IAL office (Robin, Iraj, Carl Sjöström, in person)
**Token/equity architecture**: token pools restated (Team 20% 4-yr vest 1-yr cliff; Foundation 20% **available from day one, no vesting**; investors 20% 1-yr cliff + 3-yr vest; 40% remainder for growth programs); token value sits outside equity (foundation-held); equity holders own both sides as investors; **staff could elect token/equity mix** ("half my award in tokens, half in cash") — an election mechanic to consider; **10% of the team-pool tokens could settle equity incentives on vesting** (token-settled options idea); **token↔equity 1:1 conversion** if liquidity event pre-TGE — adopted as the simple all-hands message ("until we launch a token, all protocol value goes into equity"). Token raises keep **equity dilution minimal** → flexibility, incl. Robin's long-term wish to **buy out most equity investors** using cash + tokens.
**Pool discipline**: 20% is generous; **allocation ≠ usage — be very careful with usage**; equity awards create minority shareholders → define **company buy-back rights**: *"I have an option to buy your shares at a valuation always; when I exercise it you get cash and tokens at arm's-length valuation"* → a **call-option-on-leaver-shares** mechanic for the legal backlog; control concern: 20% is a lot when the main executive is the main shareholder; restrict plan entry hard at the start ("you'll get pressure to be included; don't overuse what seems cheap"); recognising people **earlier than expected creates a groundswell of loyalty** vs negotiated entries.
**Vesting/admin**: "every vesting event is an admin headache" → consider 6-monthly/annual cadence first, increase frequency later if recruiting demands; monthly is the global tech standard and is recruiting-safe (easier hiring from Google et al.); vesting grants rights that are hard to take away → longer better for company; UK-listed norm 3-yr cliff noted again.
**Voting/classes**: options must be over **non-voting** shares (✅ resolved); **1–2 key insiders might receive voting shares as recognition** ("control as reward") — future share-class designer scope; golden-share precedent (Nebius/Yandex) noted; **alphabet/sweet-sweat equity** with threshold rate of return (carried-interest derivative) described — value only above hurdle; "on $5m it's not hard to achieve."
**Grant timing/pricing**: cannot grant before the bridge (terms + cancellation cleanup + Pantera rights); granting at low valuation pre-round is attractive — bridge ≈ **+30% uplift** expected, immediate paper gain for early grantees.
**Performance design**: detailed metrics belong to performance management and annual bonus only (**≤ 4–6 measures per individual even there**); LTIs need **general reflections of success** — milestone awards ("you get this when we achieve platform launch… this third when we achieve X") create whole-company focus, investor-legible alignment, and no "did we make it?" arguments; **at this stage if ~4 milestones fail, the company is likely gone — well worth paying for**; replaces OKRs ("waste of time at this size") with **four company goals + departments derive their own paths**; watch **instinctive incentive-gaming** and **cognitive bias** — test how people measure what they drive toward; HR owner must own and evolve a simple framework; agility-as-culture message.
**Advisor mechanics**: advisors won't want cash ("these old people have made some money; they want skin in the game"); must be available **beyond the four meetings**; **uniform entry-level ticket → discretionary top-up within a pre-set range** ("bring people in at the bottom of the range with visible upside"); advisory boards are **fluid — people roll on and off**; departing advisors may **keep options at Board discretion** if friendly (Quantnight/Mios precedent — "he lets them keep the options and they refer things in"); mirror the RTA discretion (leave at month 15 → company discretion); **check tax-approved-plan constraints before exercising leaver discretion** ("ask Andersen for the don't-do list — accelerating vesting especially can disqualify the plan").
**Exercise policy**: restrict to **company-determined liquidity windows** ("you can exercise any time you like, as long as it's during a liquidity event"); never spend raise proceeds on exercises ("the last thing you want is to raise five million quid and spend one of it"; no investor would accept it); **backstop is essential for holder psychology** ("if there's no backstop they'll think he's never going to let us exercise") — Carl suggested ~7 years; the certificate landed at the year-9/90-day/year-10 construct; give-and-take, avoid administration drag.
**Process artefacts agreed**: shared Google Drive folder (ESOP drafts, RTA template, FD cap table, employee/salary/token spreadsheet, Andersen rules); Carl to draft **~10 reward principles** for Robin to react to ("offering rather than reacting"; communicate to direct reports + HR for leadership alignment; merge with the blunt engineering-norms doc); build a **timeline of interdependencies** ("what must happen by when; things that must be in place before Series A; year-end Series A as guideline, could move to Q1"); comp philosophy must be **communicated** ~a month out as the wider population starts asking questions.
**Candidate-pipeline details** (context): Carl Bang seemed not to fully understand the product — send the bridge deck, judge by his questions; Martin Keller "craves the extra knowledge", hungry, Zurich-based, Swiss/crypto networks, Falcon Bank crisis-CEO history reframed by Robin as crisis-experience asset; Kerim furthest along, AI-finance overlap; Luke Ellis — ex-Man Group CEO, wants no visibility, possible investor, "is Robin a horse to back"; John Wheelan — middleman profile, chasing an executive role; Olaf — payments, large character, exits gracefully; the BCG senior advisor (ex-Citi ~39–40 years, payments) wants **a cash floor sized off his day rate** — that profile became Rajesh's lane; cross-domain "collective wisdom" over single-lane experts ("if Carl's the only reward expert, everyone treats his word as gospel — you need challenge"); coaching-as-compensation insight (Waleed now; Konrad/Jason candidates — "Robin wants to double down on me" reads as reward/recognition; Suzanne, Elizabeth Bagger options) — non-financial reward register.
→ Parts 5, 10, 12; legal backlog (buy-back option, voting-share recognition, token/equity election, token-settled options).

### E.2 Kerim follow-up — 13 May 2026
Kerim reviewed both decks ("two of the most sophisticated I've seen"; narrative-contract structure praised); pressed on **how the token accrues value** (Robin: token-economics calculator exists from the terminated research team; revenue streams hard to make token-bearing without routing equity-side streams, e.g. retail terminal payments in token/stablecoin; fee-burn rejected as destabilising; "the longer you wait to launch a token, the better"); pressed on **terminal friction/specificity** — terminal 0.3 prototype ideally by strategic raise, full product by Series A; product-3-is-distribution challenge accepted ("new product offering, not new technical product"); raise timing — "six weeks is optimistic; what matters is confidence in what comes in when"; cost discipline endorsed (research-team call, ops slim-down, burn 530→430, "what does the business need right now"); trading-desk **focus-dilution warning** ("you're an infrastructure play — do it but don't tell people"; frame as research); **comp**: Robin disclosed the ESOP/rewards workstream with Carl and Charlie, no spare cash until funding, "there is equity, there are tokens, structure unclear — take your time" (Kerim relaxed, flat-out on his own 4.5 ventures: AskJunius financial-AI + analytics subscription, personalised-card business, financial-education rebuild $55m→$25K, stablecoin-payments business toward Nasdaq RTO/IPO $200–250m where he'll go executive); **advisory board → board conversion intent stated to Kerim** ("the board is me… the thinking is to convert the advisory board to a board later, informally off the record"); strategic-raise dual purpose restated; **XTX Markets introduction offered** (Alex Gerko; chief-strategy-officer contact; "they could do the whole 10 million") — the live instance of the capital-channel mechanic; Kerim's profile evidence: thought-leadership-over-PPC marketing views, hands-on builder, House of Sol/Amundi event invite.
→ O15 capital rollup; advisor-objective categories; roster context; token-model assumptions register.

### E.3 Comp design session — 27 May 2026 (Iraj, Carl Sjöström, Charlie, Robin)
**The framing**: close on three AB members; no detailed expectation talks yet — better to have a proposal that **elicits a reaction**; starting point **no cash if at all possible** but "we may not end there"; **uniform start for everyone** ("everyone talks; it's not right to start people on a differentiated basis") with review-period top-ups ("after each year or six months… thank you, and here's a bit extra"); both instruments not mandatory per person, but ask **where the real value creation is** — if it's equity, tokens are offered as "skin in the game in what motivates everyone in our business"; Carl: tokens carry **excitement value** in this business even if expected value is lower — don't discount them.
**Valuation communication**: present a **house view** of worth at offer and the potential — "banded scenario we're fairly sure of vs super exciting"; anchors = pre-seed $25m / seed $90m raises ("they all know the $90m; they played no part in creating it"); base/worst/best with comparables to Series A/B; **only a high view needed — no perfect valuation, to the contrary**; "if we get to the next phase, this is the value in these options — if you do your jobs you make it worth more, that's why you're here"; Robin's question **whether option holders may sell to an external investor with Board approval** (exit liquidity) raised — open design point (ties to B.2 pre-exit-trading row).
**Denomination decision**: Robin floated **a five-level framework** and stage-percentages (0.5%/1%/2.5%) and "value the work" ($10m raised → $500K of help → start at $250K baseline); Carl's correction adopted: **set the annual fee value first** ("I want to deliver $50,000 of fees for the year — say $30K options, $10K tokens, $10K cash"), convert to instrument counts, **never negotiate in % of company** ("you are not worth nothing; as you grow exponentially percentages become really dangerous — someone says I want another percent and it's worth ten times as much"); this is **a fee for support and a role, not an entrepreneurial engagement** — different from employee deals; equity/token are simply the **currency**.
**Calibration data**: US privately-held (majority tech) advisory ≈ **$50K/yr**; "not enormous — you'd make more at a large-cap — but with significant equity upside it can be a lot of money"; if members are there for technical expertise wanting a mix, expect **~half cash**; expectations test: "if three of four say $X thousand, you know the thing; if the fourth says $10m, maybe it is — judge against what you can get"; **cash-floor trade** is legitimate ("trade £10,000 of certainty; others walk away with £100,000"); **reality tests**: equivalent PwC/magic-circle time cost (a bit less, since preset/continuing), and **time commitment must be defined first** ("a day a month vs part-time employment are very different matters; if you need them for investor rounds, those are huge commitments"); these people's value = **the one phone call that could be transformational**, plus network/credibility/track record that takes time to demonstrate — hence **think year one, then Series A and beyond** ("between now and Series A is the chance to prove; review then; the board helps with the Series A too"); advisors **don't carry board-member risk**.
**Precedent**: the Mico exercise (Carl) — options ≈ whole-share value at a fluke valuation point, partly under **EMI**; advice then: **turn dollar numbers into equity awards**; "$1,000 to get out of bed once a month — fine; every day — they'll go elsewhere"; "$50K of options in a company that could rocket is exciting; maybe it should be $100K — but you must afford it, on an annual basis"; **Finality precedent**: cash component existed but tied to a more formal board — "not directly applicable"; none of the three incoming members has raised or expects cash.
**Protocol**: Iraj presents the straw-man ("first of all we'd love to have you — please confirm; here are initial thoughts: a combination of options and some tokens; how does that land, what are your expectations, what's your reference point") and **Robin stays out of direct negotiation** (endorsed, not negotiating); feedback iterates the package; Kerim/Rajesh/Rob are scale-up-literate ("they'll know greedy vs reasonable; whatever they come back with will be contextualised").
**Roster calls made**: **Martin Keller — in** ("very interested, short and long-term"; engagement level distinct from Carl Bang; Zurich, alternatives + crypto networks, named Swiss crypto funds; hungry; Falcon context understood); **Carl Bang — medium-to-long-term**, keep warm, inconclusive ("short-term vs long-term?" unanswered; shared the deck onward — possible signal; Robin may visit in Spain); **Luke Ellis — friend-of-firm**, lunch route, no formal AB construct, possible investor; **Olaf — out** (basics-only feedback; charming quirk but "possibly distracting around an advisory table"; keep as problem-solving friend; exit message = "payments is a Stage 2 use case — we must conquer stage one first"); **John Wheelan — gone** (pursuing an executive role; self-recognised middleman); **Rajesh — evaluating** (last man standing on payments; BCG senior advisor, ~40 yrs Citi payments; *uses his day rate to size the cash he needs in scale-ups* — has reference points from other scale-up option packages; Robin's growing scepticism on the payments lane: "calling friends at a market maker is a very different sale than a payment processor"; follow-up call rescheduled; holes don't all need plugging at once — waiting clarifies gaps); **Kerim — in** (hands-on, startup-literate, curious, relevant contacts incl. XTX; short-to-medium horizon; Tether-adjacent payments + crypto asset-management base; "business builder, relentless, generous ego, big mind, likes to be the smartest in the room and often is; will evaluate Raiku's talent — he's built teams; if it works he never gets off the journey"); **Rob Reoch — in** ("big-minded, confident with great humility, patient and kind, doesn't need to be the smartest in the room, can challenge and interrogate anyone's argument"; short/medium and potentially long-term; fintech bucket with Kerim but money-markets/credit/bank-underwriter base — what banks care about in risk parameters, why on-chain money markets would interest them; network curious about AI/stablecoins/digital assets); the four (with Robin) "will work and respect each other."
**Checks**: referees collected by Iraj → references taken **by Robin** (senior network-building) supported by Charlie so outreach is formally from Raiku (Iraj conflicted — he introduced them); **DBS checks (UK)** by Anders as employer-side; **Switzerland: Martin must self-request a certificate of suitability** (GDPR interpretation; criminality + disbarment); Cayman-registration nuance flagged by Robin ("DBS is UK — I'll figure it out"); "all discussions subject to those being in good order — trust but verify."
→ Parts 5, 12; F19; Person check fields; value-band defaults; open decisions #2–4.

### E.4 Iraj & Robin — 5 Jun 2026
**Roster confirmed**: Rob (Reoch), Martin, Kerim **all confirmed and enthusiastic**; Kerim "fantastic" at Robin chairing (dinner two nights prior); "a lot of love in the room."
**Comp artefact**: Robin consolidating **business metrics, strategy, fundraising contacts, timeline, and comp management into a single spreadsheet** — "just put it on a damn spreadsheet so we can close it"; Carl Sjöström reviews; **his typical challenge is "this is too generous"** ("why? this is more than people would expect" — Robin may prefer erring generous, but it's his call; Carl is "a good challenge as a sanitiser"); no deadline pressure — **"perfection should not be the enemy of the good; 80% is enough"**; the deadline-volunteering pattern named (comp program promised "by end of tomorrow", ripple effects on candidates — "if I told them two weeks they'd be cool"); survival-mode/scarcity framing as the driver of artificial urgency. *(Studio consequence: the Studio replaces the spreadsheet and removes the single-author bottleneck — E.4 is the strongest argument for shipping the share-link workflow.)*
**Process locked**: Iraj contacts Charlie same day; **Charlie drafts the offer letters** (already has a simple draft; JD + AB terms-of-reference attach; "the letter is one page maximum — keep it simple"); **Iraj collects referee names + contacts from Rob, Martin and Kerim by end of next week**; Robin takes the reference calls (Charlie-supported); regulatory checks from within Raiku; **kickoff penciled once letters signed + references done**.
**Operating model**: kickoff = **30-minute direct-reports intro** (Konrad, Jason, Waleed, Amy meet the AB; intros around the table; they exit; main session continues on fundraising) — "feel and touch it; the organisation should feel reinforced; you delivered what you said"; **clearinghouse rule** — AB interactions routed via Robin + Iraj, no ad-hoc executive→member requests ("initiatives requiring connectivity are driven from this end"); agenda kept simple, fundraising-centred — the prep question is **what information they review before the meeting**; **Robin's web-dashboard intent stated**: *"the exact reason I wanted this web dashboard in place — they can get the context whenever they want; they can log in and it's real-time"* → the advisor-portal requirement (M6+) in Robin's own words.
**Comp context**: **Finality** answer (Charlie): cash components existed but under a more formal advisory structure — "not really applicable"; **no one has raised cash; no one expects it**; market-data gathering continues (Robin to find + forward the Finality detail to Iraj/Charlie).
**Formalisation**: "we're not over-formalising anything — **the need to become more formal happens with the Series A**; that triggers composition and how it runs; **we've got trainer wheels on**."
**Exits/others**: Olaf exit note from Iraj using Robin's Stage-2 framing; Luke Ellis lunch invitation out; Carl Bang — Spain visit possibility stands.
*(Wellbeing items — health MOT, Suzanne sessions — noted for completeness; out of product scope.)*
→ F19 pipeline; clearinghouse note in the operating model; the advisor portal (M6) justification; Part 15 success criterion 1.

---

## Appendix F · Detail-to-feature traceability (items surfaced only here)

| Detail | Source | Where it lands |
|---|---|---|
| Advisor real-time context dashboard ("log in, it's real-time") | E.4 | M6 advisor portal — pre-read context per board meeting, beyond the Proposition |
| Company call option to repurchase leaver shares at arm's-length valuation (cash + tokens) | E.1 | Legal backlog + leaver-engine setting; pairs with deed-of-adherence drag/ROFR |
| Voting shares for 1–2 key insiders as recognition ("control as reward") | E.1 | Future share-class designer; non-monetary reward register |
| Staff token/equity **election** (mix choice) and token-settled options (10% of team pool settling equity incentives) | E.1 | Engine v2 backlog options; instrument-mix control per grant |
| Company-managed token sell cycle via market maker (cash-settled) vs self-custody wallets | E.1 / RTA | Token-distribution policy toggle on TokenModel |
| Hour-based, capped token comp precedent (Chen Da, capped 0.101%) | A.4 | Grant types: time-metered token grant |
| Letter-of-intent token grant that cancels into options when the ESOP is live | E.1 (16 Apr close) | F19 offer pipeline — "LoI" grant state |
| Verbally-communicated future increases (Konrad 0.7–0.8%; Saikat 0.3–0.6% post-probation) | A.4 | "Promised / communicated" lifecycle state distinct from draft — promises tracked, not lost |
| Pre-exit secondary sales of option shares with Board approval (advisor exit liquidity) | E.3 / B.2 | Open design point — exercise-policy module |
| Grant-expense P&L impact (IFRS 2 / ASC 718) and treasury-vs-new-issue financing | B.2 / C.1 | Future finance view; out of v2 engine scope, registered |
| Ownership (post-exercise holding) requirements for senior executives | B.2 | Policy toggle, later |
| Clawback on false-premise valuations | B.2 | Open legal point — not in v9; register only |
| Quantum cap without shareholder approval | B.2 | Governance threshold alert (configurable) |
| Plan-disqualification guardrails on leaver discretion ("Andersen don't-do list", esp. acceleration) | E.1 | Hard-coded warnings in the leaver flow |
| Bridge ≈ +30% price uplift; grant-before-round timing advantage; cannot grant pre-bridge | E.1 | Trajectory round-event copy; grant-timing warning |
| $90m bridge floor per strategy memo (down-round cells shown for completeness only) | A.3 | Scenario-set annotation default |
| MFN flow-through risk extinguished only if bridge mirrors seed terms exactly | C.5/C.6 | Governance item 7 with drafting-check semantics |
| "Available from day one" Foundation tokens (no vesting) vs vested pools | E.1 | TokenModel pool-level vesting flags |
| Coaching as compensation (Waleed live; Konrad/Jason next; provider register Suzanne/Elizabeth Bagger/Eastern) | E.1 | Non-financial reward register on Person (display-only) |
| Robin's own package below market (compa 0.89) + 5% token draft + Pantera consent path | A.4/A.5/A.6 | Founder-grant workflow (Governance item 3, standalone) |
| BVICo token issuer; Foundation supervisor model; 6 Apr 2027 long-term-residence deadline | A.7 | TokenModel jurisdiction fields; timeline risk marker on TGE planning |

---

*End of appendices. Confidential. Discussion draft, not a binding offer.*
