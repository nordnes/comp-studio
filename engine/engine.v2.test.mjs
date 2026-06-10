// Raiku Advisory Comp Studio — ENGINE V2 RECONCILIATION SUITE (COM-140, the M10 gate)
// Run:  node engine/engine.v2.test.mjs
//
// This file is the EXECUTABLE ACCEPTANCE BAR for the engine unfreeze (ENGINE_V2_RFC.md §7):
// an M10 engine PR may land only with engine.test.mjs (the 22 v1 vectors, untouched) AND this
// file green. Like engine.test.mjs it is a SPEC, not an import — reference implementations are
// copied/defined here; when engine v2 lands, mirror the changed engine into this file per the
// same convention and bind the PENDING tier to the real exports.
//
// Tiers:
//   T1  Dilution-workbook parity (spec v2 Appendix A.3) — runs NOW against the v1 walk maths,
//       to the dollar/share (±1 share, ±$0.01 strike, ±0.01pp on Robin %).
//   T2  Cert v3 equity curve (Appendix C.3 cl. 3.2(b)) — v1 vestedFrac already has this shape.
//   T3  RTA token curve + 24-month qualifying gate (Appendix D) — NORMATIVE reference, new in v2.
//   T4  Value→quantity conversion (Part 10 #3) — NORMATIVE reference, new in v2.
//   T5  v2 API bindings — PENDING until the unfreeze; listed so the target surface is explicit.

// ---- helpers (same harness as engine.test.mjs) ----
const safeDiv = (a, b, fb = 0) => (b && isFinite(b) && isFinite(a) ? a / b : fb);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
let pass = 0, fail = 0, pending = 0;
const near = (a, b, t) => Math.abs(a - b) <= t;
const A = (name, cond) => { if (cond) { pass++; console.log('  PASS ' + name); } else { fail++; console.log('  FAIL ' + name); } };
const P = (name) => { pending++; console.log('  PENDING(v2) ' + name); };

// ---- canonical constants (spec v2 Appendix A.2/A.3 — the workbook truth) ----
const FD_CURRENT = 48316.78;          // live FD, SAFEs as-converted (A.2)
const ROBIN = 37550;                  // fixed share count across all scenarios (A.3 note 5)
const BASE_PATH = [                   // bold cells of the A.3 grids + default raises
  { id: 'bridge',  post: 90e6,  raise: 5e6,  esop: 0.10, fd: 57217,  robinPct: 0.6563 },
  { id: 'seriesA', post: 120e6, raise: 20e6, esop: 0.15, fd: 75359,  robinPct: 0.4983 },
  { id: 'seriesB', post: 300e6, raise: 40e6, esop: 0.15, fd: 89380,  robinPct: 0.4201 },
  { id: 'seriesC', post: 500e6, raise: 80e6, esop: 0.20, fd: 118707, robinPct: 0.3163 },
];
const STRIKE = 1572.95;               // implied $/share at the base bridge cell (A.3)

// ---- T1: walk-forward (v1 maths, copied from engine.ts walkScenario — N_k = (N_{k-1} − ESOP_{k-1}) / (1 − raise/post − esop)) ----
function walkFD(path, fdStart) {
  let prevN = 0, prevEsop = 0;
  return path.map((r, i) => {
    const N = i === 0
      ? fdStart / (1 - safeDiv(r.raise, r.post) - r.esop)
      : (prevN - prevEsop) / (1 - safeDiv(r.raise, r.post) - r.esop);
    prevN = N; prevEsop = r.esop * N;
    return { id: r.id, N, price: r.post / N };
  });
}

console.log('\nT1 · Dilution-workbook parity (A.3 walk-forward, to the dollar):');
const walk = walkFD(BASE_PATH, FD_CURRENT);
BASE_PATH.forEach((r, i) => {
  A(`${r.id} FD = ${r.fd.toLocaleString('en-US')} (±1 share)`, near(walk[i].N, r.fd, 1));
  A(`${r.id} Robin % = ${(r.robinPct * 100).toFixed(2)}% (±0.01pp)`, near(ROBIN / walk[i].N, r.robinPct, 0.0001));
});
A('bridge strike = $1,572.95 (±$0.01)', near(walk[0].price, STRIKE, 0.01));
// Headline cells preserved as auto-callout anchors (A.3):
const oneRound = (post, esop) => FD_CURRENT / (1 - safeDiv(5e6, post) - esop);
A('$90m flat / 10% → Robin 65.63%', near(ROBIN / oneRound(90e6, 0.10), 0.6563, 0.0001));
A('$60m down / 15% → Robin 59.58% (below the $90m strategy-memo floor)', near(ROBIN / oneRound(60e6, 0.15), 0.5958, 0.0001));
A('$150m / 10% → Robin 67.35% (founder-friendly extreme)', near(ROBIN / oneRound(150e6, 0.10), 0.6735, 0.0001));
A('new-money dilution range at bridge = 3.3–8.3% across the grid', near(5e6 / 150e6, 0.0333, 0.0005) && near(5e6 / 60e6, 0.0833, 0.0005));

// ---- T2: Cert v3 equity curve (copied v1 vestedFrac — annual tranches; cliff tranche = 1/years) ----
function vestedFrac(m, years, cliff) { if (m < cliff) return 0; return clamp((1 / years) * (Math.floor((m - cliff) / 12) + 1), 0, 1); }

console.log('\nT2 · Cert v3 equity vesting (25% one-year cliff + 25% annual tranches, anniversaries 2–4):');
const certV3 = (m) => vestedFrac(m, 4, 12);
[[0, 0], [11, 0], [12, 0.25], [23, 0.25], [24, 0.50], [35, 0.50], [36, 0.75], [47, 0.75], [48, 1.0], [60, 1.0]]
  .forEach(([m, f]) => A(`equity month ${m} → ${(f * 100).toFixed(0)}%`, near(certV3(m), f, 1e-9)));

// ---- T3: RTA token curve (Appendix D — NORMATIVE reference for v2; v1 has no monthly curve) ----
// Canonical rate is 75%/36 per month (displayed "2.08%/mo") so the curve closes at exactly 100%
// at the 4th anniversary — RFC decision D1. The 24-month minimum Continuous Service is a
// DISTRIBUTION gate, not a curve change: below 24 months of service nothing is distributable.
const rtaFrac = (m) => (m < 12 ? 0 : clamp(0.25 + (Math.min(m, 48) - 12) * (0.75 / 36), 0, 1));
const rtaDistributable = (m, serviceMonths) => (serviceMonths >= 24 ? rtaFrac(m) : 0);

console.log('\nT3 · RTA token vesting (25% cliff + monthly to year 4, 24-month qualifying service):');
[[11, 0], [12, 0.25], [13, 0.270833], [24, 0.50], [36, 0.75], [47, 0.979167], [48, 1.0], [60, 1.0]]
  .forEach(([m, f]) => A(`token month ${m} → ${(f * 100).toFixed(2)}%`, near(rtaFrac(m), f, 1e-4)));
A('curve closes at EXACTLY 100% at month 48 (D1: 75%/36, not literal 2.08%)', rtaFrac(48) === 1);
A('qualifying gate: 23 months service → 0 distributable (curve says 47.92%)', rtaDistributable(23, 23) === 0);
A('qualifying gate: 36 months service → 75% distributable', near(rtaDistributable(36, 36), 0.75, 1e-9));

// ---- T4: value→quantity conversion (Part 10 #3 — NORMATIVE reference for v2) ----
const optionCount = (valueUSD, fmvPps, strikePps) =>
  fmvPps > strikePps ? valueUSD / (fmvPps - strikePps) : null; // null = underwater, no count
const tokenCount = (valueUSD, tgeFdv, supply) => valueUSD / (tgeFdv / supply);

console.log('\nT4 · Value→quantity ($ in, instruments out):');
A('$50,000 at FMV $2,000 / strike $1,572.95 → 117.08 options', near(optionCount(50000, 2000, STRIKE), 117.08, 0.01));
A('underwater (FMV ≤ strike) → no option count (flag, not Infinity)', optionCount(50000, 1500, STRIKE) === null);
A('$10,000 at TGE FDV $600M / supply 10B ($0.06/token) → 166,666.67 tokens', near(tokenCount(10000, 600e6, 10e9), 166666.67, 0.01));

// ---- live engine import (the unfreeze wiring, COM-142 PR onward) ----
// Node ≥22 runs erasable-only TS directly; the live engine is scaffold/src/engine.ts.
// T1–T4 stay SPEC COPIES (reference maths, mirrored per the header convention); T5/T6 bind
// the spec to the REAL exports so divergence fails here instead of rotting silently.
const ENG = await import(new URL('../scaffold/src/engine.ts', import.meta.url).href);

// ---- T5: v2 API bindings (each flips live in the PR that ships its export) ----
console.log('\nT5 · v2 API parity (binds when the engine unfreezes — ENGINE_V2_RFC.md §4):');
{
  const ew = ENG.walkScenario(ENG.DEFAULT().plan, 'base');
  const liveById = Object.fromEntries(ew.steps.map(st => [st.id, st]));
  A('walkScenario() FD counts equal T1 to the dollar (live engine vs the A.3 cells)',
    BASE_PATH.every(r => near(liveById[r.id].N, r.fd, 1)) && near(liveById.bridge.price, STRIKE, 0.01));
}
P('vestedFracRTA(m) equals the T3 reference across months 0–60');
P('distributableFrac(grant, m, serviceMonths) applies the 24-month qualifying gate');
P('valueToQuantity(grant, scenario) equals the T4 reference, restated per scenario');
P('computeGrant() prices strike per GRANT (COM-144 multi-grant) — v1 prices one implicit grant per advisor');
P('modelDeparture(): Bad Leaver → vested+unvested options lapse, tokens forfeit (COM-153)');

// ---- T6: constitutional baseline + 13.10 pool guardrail (COM-142 — live-bound) ----
// Spec truth: authorised 50,000 · issued 37,550 · 12,450 cancelled-and-available (A.1);
// FD composition A.2 sums to the live FD; pool cells 5,368 / 8,523 selectable (open decision #1),
// the printed 15% cell ~3.5 shares short of its own arithmetic (8,526.49 exact — RFC §9 footnote);
// token pools A.4 with Advisors headroom 1.82552% the binding constraint (open decision #5).
console.log('\nT6 · Constitutional baseline & Rule 13.10 guardrail (COM-142):');
{
  const dflt = ENG.DEFAULT();
  const c = dflt.plan.constitution;
  A('constitution defaults: authorised 50,000 · issued 37,550 · poolAvailable 12,450',
    c && c.authorised === 50000 && c.issued === 37550 && c.poolAvailable === 12450);
  const fdSum = ENG.FD_COMPOSITION.reduce((s, r) => s + r.shares, 0);
  A('FD composition (A.2) sums to 48,316.78 and equals the fdPreESOP default (±0.01)',
    near(fdSum, 48316.78, 0.01) && near(fdSum, dflt.plan.fdPreESOP, 0.01));
  A('pool presets print the workbook cells: 10% → 5,368 · 15% → 8,523 (D2 printed-figure-wins)',
    ENG.POOL_PRESETS[0].printed === 5368 && ENG.POOL_PRESETS[1].printed === 8523);
  A('poolSharesExact(15%) = 8,526.49 (±0.01) — the RFC §9 recomputed footnote value',
    near(ENG.poolSharesExact(dflt.plan, 0.15), 8526.49, 0.01));
  const pools = Object.fromEntries(dflt.plan.tokenPools.map(t => [t.id, t]));
  A('token pools (A.4): Team 20%/12.7316% · Advisors 5%/3.17448% · Investors 20%/17.7189% · CEX 20%/0',
    near(pools.team.allocatedPct, 0.127316, 1e-9) && near(pools.advisors.allocatedPct, 0.0317448, 1e-9)
    && near(pools.investors.allocatedPct, 0.177189, 1e-9) && pools.cex.allocatedPct === 0
    && [pools.team, pools.investors, pools.cex].every(t => t.poolPct === 0.20) && pools.advisors.poolPct === 0.05);
  A('Advisors token headroom = 1.82552% (the binding constraint, open decision #5)',
    near(ENG.tokenPoolHeadroom(pools.advisors), 0.0182552, 1e-9));
  A('guardrail: default pool (5,368 of 12,450) → ok', ENG.poolGuardrail(dflt.plan).level === 'ok');
  A('guardrail: 11,500 of 12,450 (≥90%) → near (approach warning, Rule 13.10)',
    ENG.poolGuardrail({ ...dflt.plan, advisorPoolShares: 11500 }).level === 'near');
  A('guardrail: 12,600 of 12,450 → breach (hard warn, Rule 13.10(b))',
    ENG.poolGuardrail({ ...dflt.plan, advisorPoolShares: 12600 }).level === 'breach');
  // Reconcile round-trips (RFC §5 — additive, SCHEMA stays 5):
  const pre142 = JSON.parse(JSON.stringify(dflt));
  delete pre142.plan.constitution; delete pre142.plan.tokenPools; delete pre142.plan.advisorPoolShares;
  const seeded = ENG.reconcile(pre142);
  A('round-trip: a pre-COM-142 v5 payload seeds the new fields and computes identically',
    seeded.version === 5 && seeded.plan.constitution.authorised === 50000
    && seeded.plan.tokenPools.length === 4 && seeded.plan.advisorPoolShares === 5368
    && near(ENG.walkScenario(seeded.plan, 'base').exit.N, 118707, 1));
  const edited = JSON.parse(JSON.stringify(dflt));
  edited.plan.constitution.poolAvailable = 9000; edited.plan.advisorPoolShares = 8523;
  edited.plan.tokenPools.find(t => t.id === 'advisors').allocatedPct = 0.04;
  const kept = ENG.reconcile(edited);
  A('round-trip: user edits survive reconcile (poolAvailable 9,000 · pool 8,523 · advisors 4%)',
    kept.plan.constitution.poolAvailable === 9000 && kept.plan.advisorPoolShares === 8523
    && near(kept.plan.tokenPools.find(t => t.id === 'advisors').allocatedPct, 0.04, 1e-12)
    && kept.plan.tokenPools.length === 4);
  const junk = JSON.parse(JSON.stringify(dflt));
  junk.plan.advisorPoolShares = 'lots'; junk.plan.tokenPools = 'nope'; junk.plan.constitution = null;
  const fixed = ENG.reconcile(junk);
  A('round-trip: junk input does not crash — defaults reassert',
    fixed.plan.advisorPoolShares === 5368 && fixed.plan.tokenPools.length === 4
    && fixed.plan.constitution.authorised === 50000);
  // Per-field junk at the trust boundary (review findings 2026-06-10): junk/negative numerics
  // inside otherwise-valid objects must re-default — they feed Rule 13.10 arithmetic.
  const fieldJunk = JSON.parse(JSON.stringify(dflt));
  fieldJunk.plan.constitution = { authorised: 'fifty thousand', issued: 37550, poolAvailable: null };
  fieldJunk.plan.tokenPools = [{ id: 'advisors', allocatedPct: '3.17%' }, { id: 'team', poolPct: -2 }];
  fieldJunk.plan.advisorPoolShares = -500;
  const fj = ENG.reconcile(fieldJunk);
  A('round-trip: per-field junk re-defaults (string authorised · null poolAvailable · string pct · negative pool)',
    fj.plan.constitution.authorised === 50000 && fj.plan.constitution.poolAvailable === 12450
    && near(fj.plan.tokenPools.find(t => t.id === 'advisors').allocatedPct, 0.0317448, 1e-9)
    && fj.plan.tokenPools.find(t => t.id === 'team').poolPct === 0.20
    && fj.plan.advisorPoolShares === 5368);
  A('guardrail fails CLOSED: non-finite cap (corrupt constitution bypassing reconcile) → breach, never ok',
    ENG.poolGuardrail({ ...dflt.plan, constitution: { authorised: NaN, issued: 37550, poolAvailable: 12450 } }).level === 'breach');
  A('guardrail cap-0 edge: fully-issued company with a zero pool → ok (no spurious 13.10 warning)',
    ENG.poolGuardrail({ ...dflt.plan, constitution: { authorised: 37550, issued: 37550, poolAvailable: 0 }, advisorPoolShares: 0 }).level === 'ok'
    && ENG.poolGuardrail({ ...dflt.plan, constitution: { authorised: 37550, issued: 37550, poolAvailable: 0 }, advisorPoolShares: 1 }).level === 'breach');
}

// ---- T7: scenario sets + walk-forward composition (COM-143 — live-bound) ----
// A.3 generalised: ScenarioSet bundles, the composed walk's "base prior" column, the verbatim
// methodology notes, and the workbook parity cells (bridge price range $952–$2,691; Robin
// pre-bridge 77.72% → 65.63%, −12.09pp at the $90m/10% cell).
console.log('\nT7 · Scenario sets & composed walk (COM-143):');
{
  const dflt = ENG.DEFAULT();
  const plan = dflt.plan;
  // notes verbatim + the caveat survives
  A('METHOD_NOTES carries all six A.3 notes incl. the not-modeled caveat',
    ENG.METHOD_NOTES.length === 6
    && ENG.METHOD_NOTES[1].includes('no top-up if already above')
    && ENG.METHOD_NOTES[5].includes('real outcomes will differ'));
  // composed-walk parity: all-top-up path equals walkScenario step for step
  const w1 = ENG.walkScenario(plan, 'base'), w2 = ENG.walkComposed(plan, 'base');
  A('walkComposed(base) ≡ walkScenario(base) on the all-top-up A.3 path (±1e-6 per step)',
    w1.steps.length === w2.steps.length
    && w1.steps.every((st, i) => near(st.N, w2.steps[i].N, 1e-6) && near(st.esopShares, w2.steps[i].esopShares, 1e-6)));
  // re-base: conservative walk with its Series A cell taken from base
  const rb = ENG.walkComposed(plan, 'conservative', { seriesA: 'base' });
  A('re-base: conservative walk over the base Series A cell → A = 75,359 (±1)', near(rb.byId.seriesA.N, 75359, 1));
  {
    // reference maths for the next step (conservative B post 150m/raise 40m/esop 15% off base-A):
    const prevN = rb.byId.seriesA.N, prevEsop = rb.byId.seriesA.esopShares;
    const refB = (prevN - prevEsop) / (1 - 40e6 / 150e6 - 0.15);
    A('re-base: the following round walks off the re-based prior (B ref ±1)', near(rb.byId.seriesB.N, refB, 1));
  }
  // note 2's no-top-up branch: carried pool above the round's target → pool shares preserved
  const noTop = JSON.parse(JSON.stringify(plan));
  noTop.scenarios.base.seriesB = { post: 300e6, raise: 40e6, esop: 0.05 };
  const wn = ENG.walkComposed(noTop, 'base');
  {
    const prevN = wn.byId.seriesA.N, prevEsop = wn.byId.seriesA.esopShares;
    const refN = prevN / (1 - 40e6 / 300e6);
    A('no-top-up: 13% carried vs 5% target → N = prevN/(1−raise/post), pool shares preserved',
      wn.byId.seriesB.topUp === false && near(wn.byId.seriesB.N, refN, 1e-6)
      && near(wn.byId.seriesB.esopShares, prevEsop, 1e-6));
  }
  // workbook parity cells
  const cellPrice = (post, esop) => post / (FD_CURRENT / (1 - safeDiv(5e6, post) - esop));
  A('bridge price/share range $952–$2,691 across the A.3 grid (±$1)',
    near(cellPrice(60e6, 0.15), 952, 1) && near(cellPrice(150e6, 0.10), 2691, 1));
  A('headline: Robin pre-bridge 77.72% → 65.63% at $90m/10% (−12.09pp, ±0.01pp)',
    near(ROBIN / FD_CURRENT, 0.7772, 0.0001) && near(ROBIN / walk[0].N, 0.6563, 0.0001)
    && near(ROBIN / FD_CURRENT - ROBIN / walk[0].N, 0.1209, 0.0001));
  // scenario-set machinery
  const set = ENG.makeScenarioSet('floor90', '$90m floor per strategy memo', plan);
  A('makeScenarioSet captures a DEEP copy (later live edits do not leak in)',
    (() => { const before = set.scenarios.base.seriesA.post; plan.scenarios.base.seriesA.post = 1; const okSet = set.scenarios.base.seriesA.post === before; plan.scenarios.base.seriesA.post = 120e6; return okSet; })());
  const withSet = { ...plan, scenarioSets: [set] };
  const swapped = ENG.planWithSet({ ...withSet, scenarios: { only: { label: 'Only', tgeMult: 1 } }, baseScenario: 'only' }, 'floor90');
  A('planWithSet swaps the active scenarios non-mutating; unknown id is a no-op',
    swapped.scenarios.base && swapped.baseScenario === 'base'
    && ENG.planWithSet(plan, 'nope') === plan);
  // round-trips
  const pre143 = JSON.parse(JSON.stringify(dflt));
  delete pre143.plan.scenarioSets;
  A('round-trip: a pre-COM-143 payload seeds scenarioSets [] and walks identically',
    (() => { const r = ENG.reconcile(pre143); return Array.isArray(r.plan.scenarioSets) && r.plan.scenarioSets.length === 0 && near(ENG.walkScenario(r.plan, 'base').exit.N, 118707, 1); })());
  const savedSets = JSON.parse(JSON.stringify(dflt));
  savedSets.plan.scenarioSets = [
    { id: 'a', label: 'Memo floor', starred: true, note: '$90m floor', scenarios: { base: { label: 'Base', tgeMult: 5, seriesA: { post: 120e6, raise: 20e6, esop: 0.15 } } }, baseScenario: 'base' },
    { id: 'b', scenarios: { x: { seriesA: { post: 1e6, raise: 1, esop: 0 } } }, baseScenario: 'missing' },
    'junk', { id: 'c' }, { id: 'd', scenarios: {} },
  ];
  A('round-trip: saved sets survive (starred/note kept, label defaults, baseScenario healed, junk dropped)',
    (() => {
      const r = ENG.reconcile(savedSets); const ss = r.plan.scenarioSets;
      return ss.length === 2 && ss[0].starred === true && ss[0].note === '$90m floor'
        && ss[1].label === 'b' && ss[1].baseScenario === 'x' && ss[1].scenarios.x.label === 'x'
        && ss[1].scenarios.x.tgeMult === 1;
    })());
  // Review findings 2026-06-10 (one panel-confirmed + six self-verified by node probe) — pinned:
  A('activation isolation: planWithSet deep-copies — editing the active map never rewrites the set',
    (() => {
      const s2 = ENG.makeScenarioSet('s2', 'S2', plan);
      const act = ENG.planWithSet({ ...plan, scenarioSets: [s2] }, 's2');
      act.scenarios.base.seriesA.post = 1;
      return s2.scenarios.base.seriesA.post !== 1;
    })());
  A('trust boundary: junk cell numerics in saved sets re-default (string post · negative raise · string esop)',
    (() => {
      const j = JSON.parse(JSON.stringify(dflt));
      j.plan.scenarioSets = [{ id: 'a', scenarios: { base: { seriesA: { post: '120m', raise: -5e6, esop: '15%' } } }, baseScenario: 'base' }];
      const cell = ENG.reconcile(j).plan.scenarioSets[0].scenarios.base.seriesA;
      return cell.post === 0 && cell.raise === 0 && cell.esop === 0;
    })());
  A('forward-compat: unknown ScenarioSet fields (createdAt) round-trip loss-free',
    (() => {
      const f = JSON.parse(JSON.stringify(dflt));
      f.plan.scenarioSets = [{ id: 'f', createdAt: '2026-06-10', scenarios: { b: { seriesA: { post: 1e8, raise: 1e6, esop: 0.1 } } }, baseScenario: 'b' }];
      return ENG.reconcile(f).plan.scenarioSets[0].createdAt === '2026-06-10';
    })());
  A('cellFrom honesty: an unknown override key reports the FALLBACK source, not the lie',
    ENG.walkComposed(plan, 'base', { seriesA: 'agressive' }).byId.seriesA.cellFrom === 'base');
  A('override lacking the round cell falls back to scenKey (4 steps, honest provenance, base maths)',
    (() => {
      const px = JSON.parse(JSON.stringify(plan)); delete px.scenarios.conservative.seriesB;
      const wf = ENG.walkComposed(px, 'base', { seriesB: 'conservative' });
      return wf.steps.length === 4 && wf.byId.seriesB.cellFrom === 'base'
        && near(wf.byId.seriesB.N, ENG.walkScenario(px, 'base').byId.seriesB.N, 1e-6);
    })());
  A('prototype keys are not scenario names: baseScenario "constructor" heals to the first own key',
    (() => {
      const pj = JSON.parse(JSON.stringify(dflt));
      pj.plan.scenarioSets = [{ id: 'p', scenarios: { real: { seriesA: { post: 1e8, raise: 1e6, esop: 0.1 } } }, baseScenario: 'constructor' }];
      return ENG.reconcile(pj).plan.scenarioSets[0].baseScenario === 'real';
    })());
  A('degenerate cell (raise = post) never emits a non-finite N from the composed walk',
    (() => {
      const pi = JSON.parse(JSON.stringify(plan)); pi.scenarios.base.seriesB = { post: 40e6, raise: 40e6, esop: 0 };
      return ENG.walkComposed(pi, 'base').steps.every(st => Number.isFinite(st.N));
    })());
}

console.log(`\n${pass} passed, ${fail} failed, ${pending} pending(v2).`);
process.exit(fail ? 1 : 0);
