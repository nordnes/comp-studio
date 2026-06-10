# Engine v2 RFC — value grants, scenario sets, legal mechanics

**Status: PROPOSED — awaiting Robin's sign-off (COM-140, the M10 gate).**
*Internal & confidential · every equity figure net of strike · output is a discussion draft, not a
binding offer. Sources: spec v2 Part 10 · Part 14 · Part 17 #7 · Appendix A.2/A.3 · C.2/C.3 · D.*

This RFC + `engine.v2.test.mjs` (the reconciliation suite, green at authoring: **37 passed, 0
failed, 6 pending(v2)**) resolve spec v2 open decision **#7** (engine-unfreeze gate scope). No
other M10 issue may start engine edits before this issue merges **and Robin signs off**.

---

## 1. Why v2, and what stays true

The shipped v1 engine is a single-grant, fully-vested, percent-denominated model: **one implicit
grant per advisor**, priced off that advisor's `grantRound` (strike = the round's price; the
$1,572.95 bridge cell is the default, not a hardcoded constant), one vesting helper the money
path never calls, tier-multiplied percent grants. It is *correct for what v1 claims* — the
22-vector suite stays its contract. v2 makes the engine match the signed legal reality (Plan v9, Option
Certificate v3, the RTA) and the negotiation reality (dollar-denominated awards delivered in
instruments) — the 12 mechanics of spec Part 10.

Invariants that survive v2 unchanged:

- **Money is computed only in the engine.** Views never recompute (CLAUDE.md non-negotiable).
- **The walk-forward maths** `N_k = (N_{k-1} − ESOP_{k-1}) / (1 − raise_k/post_k − esop_k)` —
  reconciled to the dilution workbook to the share (suite T1). The A.3 methodology notes 1–6 are
  engine-canonical (pre-money pool shuffle; top-up to target post-money %; bridge as converted
  preferred; Pantera in line with cap; Robin's count fixed; anti-dilution/warrants/secondary/MFN
  not modeled — the "real outcomes will differ" caveat survives into the UI).
- **Net of strike, always**: `netEq = max(0, pct·(retention·exitPost − grantPost))` generalises
  per-grant but keeps its shape.
- **No CoC acceleration** (Rule 9.2 deleted in v9) — v2 deletes the inert `cocAccelPct` field at
  the same moment the SCHEMA bumps (§5); no acceleration math may be added. The field's Configure
  control is removed by COM-139 (PR #68, held for GC sign-off) — the v6 PR requires #68 merged
  first, else it pairs with that control's removal.

## 2. Scope (Part 10 → engine work items)

| # | Part 10 mechanic | Lands in |
|---|---|---|
| 1 | Per-grant strike/FMV from grant round | COM-144 |
| 2 | Dual vesting curves (Cert v3 annual · RTA monthly + 24-mo qualifying) | COM-145 |
| 3 | Value→quantity conversion ($ ÷ (FMV − strike) options; $ ÷ (FDV ÷ supply) tokens) | COM-150 |
| 4 | Exercise windows · Clause 3.6 backstop · net exercise · sell-to-cover | COM-151 |
| 5 | Leaver engine (Bad Leaver six-limb; Rule 5.8) | COM-153 |
| 6 | No CoC acceleration (v9) — guard, not feature | every PR (review rule) |
| 7 | Funding-round carve-out (11.2/11.3) — display/explainer truth, no adjustment math | COM-151 (doc note — **not yet in that issue's text**; scope comment posted on Linear) |
| 8 | Constitutional Limit (13.10) pool guardrail (10% ≈ 5,368 / 15% ≈ 8,523 within 12,450) | COM-142 |
| 9 | Token↔equity 1:1 conversion fallback (pre-TGE liquidity toggle) | COM-152 |
| 10 | Pre-money pool shuffle + walk-forward priors (scenario sets) | COM-143 |
| 11 | Capital-introduction schedule + board rollup | COM-146 |
| 12 | Cash-floor trade + affordability vs burn (~$430K/mo) | COM-154 |

Non-goals (Part 16): no cap-table system of record, no tax engine, no anti-dilution/warrant/MFN
modeling, no document generation. UI adoption of v2 output (COM-147/148/149) is out of this RFC's
engine scope and not gated by it beyond depending on the engine issues named above.

## 3. Target domain model

Additive over the v1 `State` — existing fields keep their meaning; views keep working mid-flight.

```ts
// The award unit. v1's implicit single grant becomes explicit and repeatable per advisor.
interface Grant {
  id: string;
  instrument: 'option' | 'rta' | 'cash';
  round: string;                  // grant round id → prices strike/FMV off the walk
  valueUSD?: number;              // dollar-denominated entry (Δ1); quantity derived
  quantity?: number;              // options or tokens; derived via valueToQuantity, overridable
  strikePps?: number;             // options: per-grant strike = round price at grant (COM-144)
  curve: 'cert-v3' | 'rta';       // which vesting curve applies (COM-145)
  vestStartISO: string;
  // Two distinct status dimensions — COM-144's lifecycle and A.4's document vocabulary are NOT
  // the same enum (the verify pass caught them conflated):
  lifecycle: 'draft' | 'loi' | 'granted' | 'exercised' | 'lapsed';          // COM-144 / F19
  docStatus?: 'in-draft' | 'sent' | 'in-review' | 'signed' | 'cancelled';  // A.4 workbook column
  docUrl?: string;                // the RTA/certificate link column from the workbook
}

// A named bundle of per-round assumptions — the dilution workbook generalised (COM-143).
interface ScenarioSet {
  id: string; label: string; starred?: boolean; note?: string;  // "$90m floor per strategy memo"
  scenarios: Record<string, Scenario>;   // v1 Scenario shape, unchanged
  baseScenario: string;
}

interface LeaverEvent { advisorId: string; atISO: string; badLeaver: boolean; limb?: 1|2|3|4|5|6 }
interface CapitalIntroduction { advisorId: string; amountUSD: number; round: string;
  status: 'targeted' | 'gated' | 'earned' }
interface CashFloor { annualUSD: number; exchangeRate: number }  // value traded per $ of certainty
```

`Advisor` gains `grants?: Grant[]` (absent → v1 behaviour, a single implicit tier/value grant —
the migration shim in §5). `Plan` gains `scenarioSets?: ScenarioSet[]` with the v1 `scenarios`
map remaining the active set. Constitutional baseline (COM-142): `authorised: 50_000`,
`issued: 37_550`, `poolAvailable: 12_450`, `fdPreESOP: 48_316.78` move from magic defaults to
named, Configure-editable fields with the 13.10 guardrail warning.

## 4. Engine API additions (pure functions; same export style as v1)

- `walkScenario(plan, scenKey)` — **unchanged**; T1 re-asserts it against v2 to the dollar.
- `vestedFrac(m, years, cliff)` — **unchanged** (it is already the Cert v3 annual-step shape;
  T2 pins it: 0 before month 12, 25%/50%/75%/100% at anniversaries 1–4).
- `vestedFracRTA(m)` — NEW: 25% at the month-12 cliff, then **75%/36 per month** (displayed
  "2.08%/mo"), exactly 100% at month 48 (decision D1). T3 pins it.
- `distributableFrac(grant, m, serviceMonths)` — NEW: the RTA 24-month minimum Continuous
  Service gate — below 24 months of service, distributable = 0 regardless of the curve. T3 pins.
- `valueToQuantity(valueUSD, instrument, ctx)` — NEW: `$ ÷ (FMV − strike)` for options (null
  when FMV ≤ strike — underwater flag, never Infinity), `$ ÷ (TGE FDV ÷ supply)` for tokens,
  restated per scenario. T4 pins.
- `computeGrant(grant, plan, scenKey)` — NEW: per-grant pricing off the grant's round (strike =
  round price, FMV per 4.5(c): exit consideration at Exit Event, else most-recent-grant
  methodology), per-curve vesting, net-of-strike value.
- `computeAdvisor` — becomes a fold over `grants[]` (or the v1 implicit grant when absent);
  signature and the returned shape stay supersets of v1 so views migrate incrementally.
- `modelDeparture(advisor, leaverType, date)` — NEW (name and signature per COM-153, which
  COM-163's UI consumes): Bad Leaver → vested **and** unvested options lapse, tokens forfeit;
  non-Bad-Leaver → Board-discretion outcome carried as a flag, never auto-vested (Rule 5.8).
  Tax-plan guardrail note: acceleration via discretion is a plan-disqualification risk —
  surface, don't compute.
- `exerciseCheck(grant, atISO, windows)` — NEW: Board-window membership + the Clause 3.6
  backstop (no Exit Event by the 9th anniversary → a ≥90-day window on ≥30 days' notice, closing
  before the 10th anniversary); net-exercise and sell-to-cover as flags on the result.

## 5. SCHEMA & migration strategy

The shipped persisted shape is `raiku-advisor-comp-v5` = `{ scenarios: {name: State}, last,
governance }` with `SCHEMA = 5`; `reconcile()` is a deep-default merge that stamps the version.

- **Additive phases (COM-142/143/144/145/146) keep `SCHEMA = 5`.** New optional fields default
  in `reconcile()` exactly like PD2's `caseOverride` did. An old payload loads, gets defaults,
  computes identically — every additive PR ships a reconcile round-trip vector.
- **The grant migration shim (COM-144)**: an advisor without `grants[]` computes as v1 (one
  implicit grant from `mode/tier/annualValue/splitOptions/grantRound`). `reconcile()` does NOT
  materialise `grants[]` on load — derivation stays in the compute path so the persisted shape
  is untouched until the user makes a multi-grant edit.
- **`SCHEMA = 6` happens at most once**, at the end of the engine wave (after COM-150), bundling:
  materialised `grants[]`, `scenarioSets`, deletion of the inert `cocAccelPct`. The v6
  `reconcile()` must load every v5 payload (and the `#s=` hash form) loss-free — gated by
  round-trip vectors added to this suite in that PR. Nothing before that PR may bump the version.

## 6. The reconciliation suite — `engine/engine.v2.test.mjs`

Same convention as the v1 suite: **a spec, not an import** (self-contained reference maths; when
the engine changes, the PR mirrors the change into the spec file). Green at authoring, runnable
today:

- **T1 — workbook parity (13 vectors)**: FD 48,316.78 → bridge $90m/10% = **57,217** (±1 share)
  → A $120m/15% = **75,359** → B $300m/15% = **89,380** → C $500m/20% = **118,707**; strike
  **$1,572.95** (±$0.01); Robin 65.63% / 49.83% / 42.01% / 31.63% (±0.01pp); the three A.3
  headline cells ($60m/15% → 59.58%; $150m/10% → 67.35%) and the 3.3–8.3% new-money range.
- **T2 — Cert v3 equity curve (10 vectors)**: the v1 `vestedFrac` annual staircase pinned at
  months 0/11/12/23/24/35/36/47/48/60.
- **T3 — RTA token curve + qualifying gate (11 vectors)**: 25% cliff, monthly ramp, **exactly
  100% at month 48**, and the 24-month service gate (23 months service → 0 distributable).
- **T4 — value→quantity (3 vectors)**: $50,000 at FMV $2,000/strike $1,572.95 → 117.08 options;
  underwater → null; $10,000 at $600M FDV/10B supply → 166,666.67 tokens.
- **T5 — six PENDING bindings**: the v2 exports each tier re-asserts against once the engine
  unfreezes. PENDING prints, never fails; flipping each to a live assertion is part of the PR
  that ships the export.

The **existing 22 vectors in `engine.test.mjs` are untouched** and must stay 22/22 through every
M10 PR (both copies: `engine/` and `scaffold/`).

## 7. The unfreeze rule (normative)

An M10 PR may modify `engine.ts` (either copy) **only if all of**:

1. `node engine/engine.test.mjs` → **22/22**, file unmodified except mirroring per its header
   convention, and `node scaffold/engine.test.mjs` → 22/22;
2. `node engine/engine.v2.test.mjs` → **0 failed**, with the PENDING bindings the PR's exports
   cover flipped to live assertions in the same PR;
3. one Linear issue per PR, **≤450 LOC**, presentation untouched (UI adoption is its own issue);
4. no PR bumps `SCHEMA` except the single designated v6 PR (§5);
5. this RFC is merged and **Robin has signed off on COM-140**.

CLAUDE.md's "engine FROZEN" clause is superseded *only* for PRs satisfying all five — update the
clause to point here when COM-140 closes.

## 8. Landing order (issue-by-issue)

Engine wave — the RFC's **proposed** order (on Linear each issue is blockedBy COM-140 only; the
inter-issue sequencing below is this document's recommendation, to be encoded as Linear blocking
relations at sign-off):

1. **COM-142** constitutional baseline + 13.10 pool guardrail (named fields over magic numbers)
2. **COM-143** scenario sets + walk-forward composition (L — split engine/UI PRs)
3. **COM-144** `Grant[]` per person + per-grant strike/FMV (the migration shim, §5)
4. **COM-145** dual vesting curves (`vestedFracRTA`, `distributableFrac`)
5. **COM-150** value→quantity + dollar value bands (needs 144)
6. **COM-153** leaver engine (needs 144 + 145)
7. **COM-151** exercise windows + backstop + cash-free routes (needs 144)
8. **COM-152** token↔equity 1:1 fallback (needs 143; S)
9. **COM-146** capital-introduction schedule + rollup (independent after 144)
10. **COM-154** cash-floor trade + affordability (needs 150; S)
11. **SCHEMA v6 PR** (§5) — the only version bump, after 150 at the earliest

UI wave (not engine-gated beyond its named dependency): **COM-147** scenario-set editor and
**COM-148** global set switcher/diff (after 143), **COM-149** dual-curve VestingTimeline (after
145). **COM-87**: per its own tombstone text, when COM-143 lands either close it as a duplicate
or first fold any residual per-advisor-roadmap requirement into COM-143's spec — check before
closing.

## 9. Decisions taken here (objections → sign-off) & open inputs

- **D1 — RTA monthly rate**: canonical **75%/36 ≈ 2.0833%/mo** so the curve closes at exactly
  100% at month 48; "2.08%" is display text. (Literal 2.08%×36 = 99.88% strands 0.12%.)
- **D2 — printed-figure-wins**: where the workbook prints a rounded figure (57,217; 118,707;
  $1,572.95), the suite asserts within ±1 share / ±$0.01 rather than re-deriving "more exact"
  values. The workbook is the reconciliation target, not a recomputation exercise.
- **D3 — derive, don't materialise** (§5): persisted shape changes once, at v6 — minimises the
  migration surface while COM-139-style holds and M11/M12 land around the engine wave.
- **Open inputs that parameterise v2 but don't block it** (Part 17): #1 pool blanks (10% ≈ 5,368
  vs 15% ≈ 8,523 — COM-142 ships both as presets; **caveat: the printed 15% cell is ~3.5 shares
  short of its own arithmetic** — 0.15/0.85 × 48,316.78 = 8,526.49, i.e. 8,523 yields 14.995%
  post-pool, while the 10% cell is exact — COM-142 should display the printed figure with a
  recomputed-value footnote), #3 cash-floor exchange rate (COM-154 ships it configurable),
  #5 ESOP-vs-Advisors-token-pool sourcing (COM-146/142 surface both pools).

## 10. Risks

- **Spec-file divergence** (inherited convention): the suite tests a copy, so an engine edit
  without the mirror step passes stale tests. Mitigation: the unfreeze rule makes mirroring a
  review item; the per-issue DoD greps the PR for paired changes.
- **TGE FDV/supply are engine defaults, not spec numbers** ($600M = 5× the $120m Series A
  anchor; supply 10e9): Appendix A denominates tokens in % only. T4's token vector therefore
  pins the *engine's* documented default, flagged "unvalidated" in the UI — revisit when the
  token workbook lands real supply numbers.
- **Robin-% drift**: A.3 prints percentages to 2dp; ±0.01pp tolerance absorbs print rounding
  without letting real regressions through (a one-share error moves bridge Robin-% by ~0.001pp).
