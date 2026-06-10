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
A('vestedFracRTA(m) equals the T3 reference across months 0–60 (live engine)',
  Array.from({ length: 61 }, (_, m) => m).every(m => near(ENG.vestedFracRTA(m), rtaFrac(m), 1e-9)));
{
  const rtaG = { id: 'r', instrument: 'rta', round: 'bridge', quantity: 1, curve: 'rta', vestStartISO: '2026-06-01', lifecycle: 'granted' };
  A('distributableFrac(grant, m, serviceMonths) applies the 24-month qualifying gate (live engine)',
    ENG.distributableFrac(rtaG, 23, 23) === 0 && near(ENG.distributableFrac(rtaG, 36, 36), 0.75, 1e-9));
}
A('valueToQuantity equals the T4 reference (117.08 options · null underwater · 166,666.67 tokens)',
  near(ENG.valueToQuantity(50000, 'option', { fmvPps: 2000, strikePps: STRIKE }), 117.08, 0.01)
  && ENG.valueToQuantity(50000, 'option', { fmvPps: 1500, strikePps: STRIKE }) === null
  && near(ENG.valueToQuantity(10000, 'rta', { tgeFdv: 600e6, tokenSupply: 10e9 }), 166666.67, 0.01));
{
  const plan = ENG.DEFAULT().plan;
  const mk = (over) => ({ id: 'g', instrument: 'option', round: 'bridge', quantity: 100, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted', ...over });
  const gBridge = ENG.computeGrant(mk({}), plan, 'base');
  const gA = ENG.computeGrant(mk({ round: 'seriesA' }), plan, 'base');
  A('computeGrant() prices strike per GRANT (bridge $1,572.95 vs Series A $1,592.37 ±$0.01)',
    near(gBridge.strikePps, 1572.95, 0.01) && near(gA.strikePps, 120e6 / 75359.215, 0.05) && gA.strikePps > gBridge.strikePps);
}
{
  const d5 = ENG.DEFAULT();
  const adv = { ...d5.advisors[0], startDate: '2026-06-01', grants: [
    { id: 'e', instrument: 'option', round: 'bridge', quantity: 100, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted' },
    { id: 't', instrument: 'rta', round: 'bridge', quantity: 1e6, curve: 'rta', vestStartISO: '2026-06-01', lifecycle: 'granted' },
  ] };
  const dep = ENG.modelDeparture(adv, 'bad', '2029-06-01', d5.plan, d5.tiers, d5.objectives);
  A('modelDeparture(): Bad Leaver → vested+unvested options lapse, tokens forfeit (live engine)',
    dep.optionsRetained === 0 && dep.optionsLapsed === 100 && dep.tokensForfeited === 1e6
    && dep.tokensRetained === 0 && dep.boardDiscretion === false);
}

// ---- T6: constitutional baseline + 13.10 pool guardrail (COM-142 — live-bound) ----
// Spec truth: authorised 50,000 · issued 37,550 · 12,450 cancelled-and-available (A.1);
// FD composition A.2 sums to the live FD; pool cells 5,368 / 8,523 selectable (open decision #1),
// the printed 15% cell ~3.5 shares short of its own arithmetic (8,526.49 exact — RFC §9 footnote);
// token pools A.4 with Advisors headroom 1.82552% the binding constraint (open decision #5).
console.log('\nT6 · Constitutional baseline & Rule 13.10 guardrail (COM-142):');
{
  const dflt = ENG.DEFAULT();
  const c = dflt.plan.constitution;
  // By-name export coverage (R5.1): every runtime export carries at least one named assertion.
  A('ENTITY: ASEL t/a Raiku · Cayman Islands · BL-411368',
    ENG.ENTITY.legalName === 'Ackermann Systems Engineering Ltd' && ENG.ENTITY.tradingAs === 'Raiku'
    && ENG.ENTITY.jurisdiction === 'Cayman Islands' && ENG.ENTITY.regNo === 'BL-411368');
  A('CONSTITUTION_DEFAULT and TOKEN_POOLS_DEFAULT are the named seed constants',
    ENG.CONSTITUTION_DEFAULT.authorised === 50000 && ENG.CONSTITUTION_DEFAULT.issued === 37550
    && ENG.CONSTITUTION_DEFAULT.poolAvailable === 12450 && ENG.TOKEN_POOLS_DEFAULT.length === 4
    && ENG.TOKEN_POOLS_DEFAULT.map(t => t.id).join(',') === 'team,advisors,investors,cex');
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
  A('setList: [] on the default plan; returns the saved bundles when present',
    ENG.setList(plan).length === 0
    && ENG.setList({ ...plan, scenarioSets: [{ id: 'x', label: 'X', scenarios: {}, baseScenario: '' }] }).length === 1);
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

// ---- T8: multi-grant fold + per-grant pricing (COM-144 — live-bound) ----
// Part 5.3: later top-up grants price at later valuations; earlier grants enjoy the step-up.
// The fold returns the v1 SUPERSET shape; the v1 implicit path stays byte-equivalent (22/22 pin).
console.log('\nT8 · Grant[] fold & per-grant strike/FMV (COM-144):');
{
  const dflt = ENG.DEFAULT();
  const plan = dflt.plan;
  const mk = (over) => ({ id: 'g' + Math.abs(JSON.stringify(over).length), instrument: 'option', round: 'bridge', quantity: 100, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted', ...over });
  const w = ENG.walkScenario(plan, 'base');
  const exitPps = w.exit.post / w.exit.N;
  // pricing references
  const g1 = ENG.computeGrant(mk({ id: 'g1' }), plan, 'base');
  A('option net at exit = q·(exitPps − strike), net of strike always',
    near(g1.netAtExit, 100 * (exitPps - w.byId.bridge.price), 0.01));
  A('explicit strikePps overrides the round price', ENG.computeGrant(mk({ strikePps: 2000 }), plan, 'base').strikePps === 2000);
  A('underwater: strike above exit consideration → net 0 + flag, never negative',
    (() => { const g = ENG.computeGrant(mk({ strikePps: 5000 }), plan, 'base'); return g.netAtExit === 0 && g.underwater === true; })());
  A('FMV methodology: current stage (bridge) → fmvPps = bridge price; exitPps carried separately',
    near(g1.fmvPps, w.byId.bridge.price, 0.01) && near(g1.exitPps, exitPps, 0.01));
  A('rta grant: value = quantity × (TGE FDV ÷ supply), restated per scenario',
    (() => { const g = ENG.computeGrant(mk({ instrument: 'rta', quantity: 1e6, curve: 'rta' }), plan, 'base'); return near(g.value, 1e6 * (600e6 / 10e9), 0.01); })());
  A('cash grant: value = valueUSD', ENG.computeGrant(mk({ instrument: 'cash', valueUSD: 50000 }), plan, 'base').value === 50000);
  A('lapsed grant prices to zero (quantity zeroed, value 0, flagged)',
    (() => { const g = ENG.computeGrant(mk({ lifecycle: 'lapsed' }), plan, 'base'); return g.value === 0 && g.quantity === 0 && g.lapsed === true; })());
  A('unknown grant round falls back to the bridge cell', near(ENG.computeGrant(mk({ round: 'ghost' }), plan, 'base').strikePps, 1572.95, 0.01));
  A('GRANT_LIFECYCLES and DOC_STATUSES are the two SEPARATE status vocabularies (RFC §3)',
    ENG.GRANT_LIFECYCLES.join(',') === 'draft,loi,granted,exercised,lapsed'
    && ENG.DOC_STATUSES.join(',') === 'in-draft,sent,in-review,signed,cancelled');
  A('currentRoundStep: milestone→most-recent-round (bridge at "mainnet"; Series A at "tge")',
    ENG.currentRoundStep({ ...plan, currentStage: 'mainnet' }, w).id === 'bridge'
    && ENG.currentRoundStep({ ...plan, currentStage: 'tge' }, w).id === 'seriesA');
  // the fold
  const adv = { ...dflt.advisors[0], id: 'multi', grants: [
    mk({ id: 'e1' }), mk({ id: 'e2', round: 'seriesA' }),
    mk({ id: 't1', instrument: 'rta', quantity: 1e6, curve: 'rta' }),
    mk({ id: 'c1', instrument: 'cash', valueUSD: 50000 }),
    mk({ id: 'dead', lifecycle: 'lapsed', quantity: 999999 }),
  ] };
  const c = ENG.computeAdvisor(adv, plan, dflt.tiers, dflt.objectives);
  const aPrice = 120e6 / ENG.walkScenario(plan, 'base').byId.seriesA.N;
  A('fold: equityShares = Σ live option quantities (lapsed excluded)', c.equityShares === 200);
  A('fold: exerciseCost = Σ q·strike; strikePps = the weighted average',
    near(c.exerciseCost, 100 * 1572.95 + 100 * aPrice, 0.5) && near(c.strikePps, c.exerciseCost / 200, 1e-9));
  A('fold: base equity = Σ per-grant net-of-strike; tokens restate per scenario',
    near(c.base.equity, 100 * (exitPps - 1572.95) + 100 * (exitPps - aPrice), 0.5)
    && near(c.base.token, 1e6 * 0.06, 0.01) && near(c.baseCaseTotal, c.base.equity + c.base.token, 1e-6));
  A('fold: cash grants land in cashTotal once (not annualised)', c.cashTotal === 50000);
  A('fold: the v1 superset shape survives (scen/base/netEqAt/bestCaseTotal present)',
    Array.isArray(c.scen) && typeof c.base.netEqAt === 'function' && c.bestCaseTotal >= c.baseCaseTotal);
  // v1 parity + the derivation shim
  const v1c = ENG.computeAdvisor(dflt.advisors[0], plan, dflt.tiers, dflt.objectives);
  A('v1 advisors (no grants[]) keep the implicit path: equityShares ≡ eqPct·grantN',
    near(v1c.equityShares, v1c.eqPct * v1c.base.grantN, 1e-6));
  const eff = ENG.effectiveGrants(dflt.advisors[0], plan, dflt.tiers, dflt.objectives);
  A('effectiveGrants derives the implicit package (option + rta rows, lifecycle granted)',
    eff.length === 2 && eff[0].instrument === 'option' && eff[1].instrument === 'rta'
    && eff.every(g => g.lifecycle === 'granted'));
  A('shim consistency: the derived option row re-prices to the v1 base net (±$0.01)',
    near(ENG.computeGrant(eff[0], plan, 'base').netAtExit, v1c.baseEqNet, 0.01));
  A('effectiveGrants returns explicit grants verbatim when present',
    ENG.effectiveGrants(adv, plan, dflt.tiers, dflt.objectives) === adv.grants);
  // round-trips (derive-don't-materialise + trust boundary)
  const rt = JSON.parse(JSON.stringify(dflt));
  rt.advisors[0].grants = [
    { id: 'k1', instrument: 'option', round: 'seriesA', quantity: 50, strikePps: 1600, curve: 'cert-v3', vestStartISO: '2026-07-01', lifecycle: 'granted', docStatus: 'signed', docUrl: 'https://docs.example/cert.pdf' },
    { id: 'k2', instrument: 'rta', quantity: -5, lifecycle: 'loi', docUrl: 'javascript:alert(1)' },
    { id: 'bad', instrument: 'warrant' }, 'junk', { instrument: 'option' },
  ];
  rt.advisors[1].grants = 'nope';
  const rr = ENG.reconcile(rt);
  A('round-trip: valid grants survive verbatim (strike, docStatus, https docUrl kept)',
    (() => { const g = rr.advisors[0].grants[0]; return g.strikePps === 1600 && g.docStatus === 'signed' && g.docUrl === 'https://docs.example/cert.pdf'; })());
  A('round-trip: junk heals — negative qty deleted, javascript: docUrl stripped, bad instrument/shape dropped, curve defaults by instrument',
    (() => { const gs = rr.advisors[0].grants; const g2 = gs.find(g => g.id === 'k2'); return gs.length === 2 && g2.quantity == null && g2.docUrl == null && g2.curve === 'rta' && g2.lifecycle === 'loi'; })());
  A('round-trip: non-array grants junk → key deleted; v1 advisors stay grantless (derive-don\'t-materialise)',
    rr.advisors[1].grants == null && rr.advisors[2].grants == null
    && Object.prototype.hasOwnProperty.call(rr.advisors[1], 'grants') === false);
  // Review-panel pins (2026-06-10 — 9 confirmed findings, all fixed):
  A('stage mapping: currentStage "tge" (a milestone, not a round) prices FMV at Series A, not bridge',
    (() => {
      const p2 = { ...plan, currentStage: 'tge' };
      const g = ENG.computeGrant(mk({ id: 's1' }), p2, 'base');
      return near(g.fmvPps, 120e6 / 75359.215, 0.05) && g.stepUp > 19;
    })());
  A('stage mapping: eqPct denominates in the CURRENT round FD (Series A 75,359 at tge)',
    (() => {
      const p2 = { ...plan, currentStage: 'tge' };
      const c2 = ENG.computeAdvisor({ ...dflt.advisors[0], grants: [mk({ id: 'q1' })] }, p2, dflt.tiers, dflt.objectives);
      return near(c2.eqPct, 100 / 75359.215, 1e-7);
    })());
  A('nil-cost option: strikePps 0 prices at q·exitPps AND survives the reconcile round-trip',
    (() => {
      const g0 = ENG.computeGrant(mk({ strikePps: 0 }), plan, 'base');
      const rt0 = JSON.parse(JSON.stringify(dflt));
      rt0.advisors[0].grants = [mk({ id: 'nil', strikePps: 0 })];
      const kept = ENG.reconcile(rt0).advisors[0].grants[0];
      return near(g0.netAtExit, 100 * exitPps, 0.01) && kept.strikePps === 0;
    })());
  A('grants [] is EXPLICIT ZERO: the implicit package never resurrects (delete-last-grant and corrupt-import-drops-all both → $0)',
    (() => {
      const empty = ENG.computeAdvisor({ ...dflt.advisors[0], grants: [] }, plan, dflt.tiers, dflt.objectives);
      const rtE = JSON.parse(JSON.stringify(dflt));
      rtE.advisors[0].grants = [{ id: 'w1', instrument: 'warrant', quantity: 100 }];
      const dropped = ENG.reconcile(rtE).advisors[0];
      const droppedC = ENG.computeAdvisor(dropped, plan, dflt.tiers, dflt.objectives);
      return empty.baseCaseTotal === 0 && Array.isArray(dropped.grants) && dropped.grants.length === 0
        && droppedC.baseCaseTotal === 0
        && ENG.effectiveGrants({ ...dflt.advisors[0], grants: [] }, plan, dflt.tiers, dflt.objectives).length === 0;
    })());
  A('netEqAt is fold-consistent: scen.equity === netEqAt(eqPct, exitVal) for explicit strikes and multi-round grants',
    (() => {
      const c2 = ENG.computeAdvisor({ ...dflt.advisors[0], grants: [mk({ id: 'x1', strikePps: 2500 }), mk({ id: 'x2', round: 'seriesA' })] }, plan, dflt.tiers, dflt.objectives);
      return c2.scen.every(s => near(s.equity, s.netEqAt(c2.eqPct, s.exitVal), 0.01));
    })());
  A('lifecycle heals fail-CLOSED: unknown value ("cancelled") → lapsed ($0); absent → draft (counts)',
    (() => {
      const rtL = JSON.parse(JSON.stringify(dflt));
      rtL.advisors[0].grants = [{ id: 'l1', instrument: 'option', round: 'bridge', quantity: 100, lifecycle: 'cancelled' }, { id: 'l2', instrument: 'option', round: 'bridge', quantity: 100 }];
      const gs = ENG.reconcile(rtL).advisors[0].grants;
      return gs[0].lifecycle === 'lapsed' && gs[1].lifecycle === 'draft';
    })());
}

// ---- T9: dual vesting curves (COM-145 — live-bound) ----
// Equity = the Cert v3 annual staircase (v1 vestedFrac, T2); token = the RTA monthly curve with
// the 24-month qualifying DISTRIBUTION gate. The month-23 vs month-25 discontinuity is the spec's
// named acceptance case.
console.log('\nT9 · Dual vesting curves & the qualifying gate (COM-145):');
{
  const mkg = (curve) => ({ id: 'v', instrument: curve === 'rta' ? 'rta' : 'option', round: 'bridge', quantity: 1, curve, vestStartISO: '2026-06-01', lifecycle: 'granted' });
  A('vestedAtMonths dispatches by curve: month 23 → equity 25% (staircase) vs token 47.92% (monthly)',
    near(ENG.vestedAtMonths(mkg('cert-v3'), 23), 0.25, 1e-9) && near(ENG.vestedAtMonths(mkg('rta'), 23), 0.25 + 11 * (0.75 / 36), 1e-9));
  A('vestedAtDate prices any date from vestStartISO (24 months → equity 50% · token 50%)',
    near(ENG.vestedAtDate(mkg('cert-v3'), '2028-06-01'), 0.50, 1e-9) && near(ENG.vestedAtDate(mkg('rta'), '2028-06-01'), 0.50, 1e-9));
  A('vestedAtMonths honours plan-parameterised equity shape (3yr/6mo cliff → month 7 = 1/3)',
    near(ENG.vestedAtMonths(mkg('cert-v3'), 7, 3, 6), 1 / 3, 1e-9));
  A('the month-23 vs month-25 token discontinuity: distributable 0 → 52.08% across the gate',
    ENG.distributableFrac(mkg('rta'), 23, 23) === 0
    && near(ENG.distributableFrac(mkg('rta'), 25, 25), 0.25 + 13 * (0.75 / 36), 1e-9));
  A('at exactly 24 months service the gate opens (50% distributable)',
    near(ENG.distributableFrac(mkg('rta'), 24, 24), 0.50, 1e-9));
  A('the gate binds RTA only: an option grant distributes per its curve regardless of service',
    near(ENG.distributableFrac(mkg('cert-v3'), 24, 0), 0.50, 1e-9));
  A('long service does not lift the curve: m=36 svc=60 → 75% (gate is a gate, not a boost)',
    near(ENG.distributableFrac(mkg('rta'), 36, 60), 0.75, 1e-9));
  A('junk months → 0, never NaN (trust boundary)',
    ENG.vestedFracRTA(NaN) === 0 && ENG.vestedFracRTA(undefined) === 0
    && ENG.distributableFrac(mkg('rta'), 30, NaN) === 0);
  // Review-panel pins (2026-06-10 — gate key, NaN branch, day-aware dates, cash accrual):
  A('NaN months fail closed on EVERY branch (the equity dispatch too)',
    ENG.vestedAtMonths(mkg('cert-v3'), NaN) === 0 && ENG.distributableFrac(mkg('cert-v3'), NaN, 36) === 0);
  A('the gate keys on the INSTRUMENT: an rta/cert-v3 mismatch is still gated; option/rta is not',
    ENG.distributableFrac({ ...mkg('cert-v3'), instrument: 'rta' }, 12, 12) === 0
    && near(ENG.distributableFrac({ ...mkg('rta'), instrument: 'option' }, 24, 0), 0.50, 1e-9));
  A('distributableFrac forwards the plan-parameterised equity shape (3yr/6mo → month 7 = 1/3)',
    near(ENG.distributableFrac(mkg('cert-v3'), 7, 99, 3, 6), 1 / 3, 1e-9));
  A('cash accrues linearly from month 0, never the option staircase, never gated',
    ENG.vestedAtMonths({ ...mkg('cert-v3'), instrument: 'cash' }, 11) > 0
    && near(ENG.vestedAtMonths({ ...mkg('cert-v3'), instrument: 'cash' }, 24), 0.50, 1e-9)
    && near(ENG.distributableFrac({ ...mkg('cert-v3'), instrument: 'cash' }, 24, 0), 0.50, 1e-9));
  A('fractional months price as their completed tranche (23.7 ≡ 23, no interpolation)',
    ENG.vestedFracRTA(23.7) === ENG.vestedFracRTA(23));
  A('fullMonthsBetween is day-aware and TZ-free (2026-06-30 → 2027-06-01 = 11 · → 2027-06-30 = 12)',
    ENG.fullMonthsBetween('2026-06-30', '2027-06-01') === 11
    && ENG.fullMonthsBetween('2026-06-30', '2027-06-30') === 12
    && ENG.fullMonthsBetween('junk', '2027-06-30') === 0);
  A('vestedAtDate honours the legal anniversary: the cliff does NOT credit 29 days early',
    ENG.vestedAtDate({ ...mkg('rta'), vestStartISO: '2026-06-30' }, '2027-06-01') === 0
    && near(ENG.vestedAtDate({ ...mkg('rta'), vestStartISO: '2026-06-30' }, '2027-06-30'), 0.25, 1e-9));
}

// ---- T10: value-denominated grants + dollar bands (COM-150 / Δ1 — live-bound) ----
// Denominate in $, deliver in instruments, restate per scenario; percent is an OUTPUT.
console.log('\nT10 · Value→quantity in the money path & value bands (COM-150):');
{
  const dflt = ENG.DEFAULT();
  const plan = dflt.plan;
  const mkv = (over) => ({ id: 'v' + JSON.stringify(over).length, instrument: 'option', round: 'bridge', valueUSD: 50000, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted', ...over });
  // a value-denominated bridge option at currentStage 'tge' (FMV = Series A price > strike)
  const pTge = { ...plan, currentStage: 'tge' };
  const w = ENG.walkScenario(pTge, 'base');
  const fmv = 120e6 / w.byId.seriesA.N, strike = w.byId.bridge.price;
  const g = ENG.computeGrant(mkv({}), pTge, 'base');
  A('option count derives per scenario: $50K ÷ (FMV − strike) at the live walk prices',
    g.derived === true && near(g.quantity, 50000 / (fmv - strike), 0.01));
  A('zero FMV spread (currentStage = grant round) → underwater flag, zero count, never Infinity',
    (() => { const z = ENG.computeGrant(mkv({}), plan, 'base'); return z.quantity === 0 && z.underwater === true && Number.isFinite(z.value); })());
  A('explicit quantity OVERRIDES the value derivation',
    ENG.computeGrant(mkv({ quantity: 42 }), pTge, 'base').quantity === 42);
  A('token grant derives from TGE FDV ÷ supply, restated per scenario (base 0.06 vs aggressive 0.144)',
    (() => {
      const tb = ENG.computeGrant(mkv({ instrument: 'rta', curve: 'rta' }), plan, 'base');
      const ta = ENG.computeGrant(mkv({ instrument: 'rta', curve: 'rta' }), plan, 'aggressive');
      return near(tb.quantity, 50000 / 0.06, 1) && near(ta.quantity, 50000 / ((12 * 150e6) / 10e9), 1)
        && tb.quantity > ta.quantity;
    })());
  A('the fold heads count DERIVED quantities (equityShares from the base-scenario rows)',
    (() => {
      const c = ENG.computeAdvisor({ ...dflt.advisors[0], grants: [mkv({})] }, pTge, dflt.tiers, dflt.objectives);
      return near(c.equityShares, 50000 / (fmv - strike), 0.01) && c.scen.every(s => near(s.equity, s.netEqAt(c.eqPct, s.exitVal), 0.01));
    })());
  A('VALUE_BANDS_DEFAULT: Base $50K · Strategic $100K · Anchor $150K (open decision #2 defaults)',
    ENG.VALUE_BANDS_DEFAULT.map(b => b.annualUSD).join(',') === '50000,100000,150000');
  A('round-trip: edited band anchors survive; junk re-defaults; user bands kept; timeCommitment string-guarded',
    (() => {
      const rt = JSON.parse(JSON.stringify(dflt));
      rt.plan.valueBands = [{ id: 'strategic', annualUSD: 120000 }, { id: 'custom', label: 'Custom', annualUSD: 'lots' }, { id: 'base', annualUSD: -5 }];
      rt.advisors[0].grants = [mkv({ timeCommitment: '~10 hrs/mo' }), mkv({ id: 'tj', timeCommitment: 42 })];
      const r = ENG.reconcile(rt);
      const bands = Object.fromEntries(r.plan.valueBands.map(b => [b.id, b]));
      return bands.strategic.annualUSD === 120000 && bands.base.annualUSD === 50000
        && bands.anchor.annualUSD === 150000 && bands.custom.annualUSD === 0
        && r.advisors[0].grants[0].timeCommitment === '~10 hrs/mo'
        && r.advisors[0].grants[1].timeCommitment == null;
    })());
  A('round-trip: a pre-COM-150 payload seeds the default bands and computes identically',
    (() => {
      const pre = JSON.parse(JSON.stringify(dflt)); delete pre.plan.valueBands;
      const r = ENG.reconcile(pre);
      return r.plan.valueBands.length === 3 && near(ENG.walkScenario(r.plan, 'base').exit.N, 118707, 1);
    })());
  // Review-panel pins (2026-06-10 — base-null fold consistency, duplicate ids, lapsed flags,
  // failed-token-derivation flag):
  A('fold consistency survives a base-null derivation: other scenarios keep netEqAt ≡ equity and flag their own underwater',
    (() => {
      const pCons = { ...pTge, baseScenario: 'conservative' };
      const c = ENG.computeAdvisor({ ...dflt.advisors[0], grants: [mkv({})] }, pCons, dflt.tiers, dflt.objectives);
      const base = c.scen.find(s => s.key === 'base'), cons = c.scen.find(s => s.key === 'conservative');
      return c.eqPct === 0 && base.equity > 0 && near(base.netEqAt(c.eqPct, base.exitVal), base.equity, 0.01)
        && cons.underwater === true && base.underwater === false;
    })());
  A('duplicate ids never survive reconcile (bands, pools, sets: one entry per id)',
    (() => {
      const rt2 = JSON.parse(JSON.stringify(dflt));
      rt2.plan.valueBands = [{ id: 'dup', annualUSD: 1 }, { id: 'dup', annualUSD: 2 }];
      rt2.plan.tokenPools = [{ id: 'extra', poolPct: 0.01, allocatedPct: 0 }, { id: 'extra', poolPct: 0.02, allocatedPct: 0 }];
      rt2.plan.scenarioSets = [
        { id: 's', scenarios: { a: { seriesA: { post: 1e8, raise: 1e6, esop: 0.1 } } }, baseScenario: 'a' },
        { id: 's', scenarios: { b: { seriesA: { post: 2e8, raise: 1e6, esop: 0.1 } } }, baseScenario: 'b' },
      ];
      const r = ENG.reconcile(rt2);
      return r.plan.valueBands.filter(b => b.id === 'dup').length === 1
        && r.plan.tokenPools.filter(t => t.id === 'extra').length === 1
        && r.plan.scenarioSets.filter(s => s.id === 's').length === 1;
    })());
  A('a lapsed value grant flags NOTHING (derived false · underwater false — its zero is the lifecycle)',
    (() => {
      const l1 = ENG.computeGrant(mkv({ lifecycle: 'lapsed' }), pTge, 'base');
      const l2 = ENG.computeGrant(mkv({ lifecycle: 'lapsed' }), plan, 'base');
      return l1.derived === false && l1.underwater === false && l2.derived === false && l2.underwater === false;
    })());
  A('a failed TOKEN derivation flags underwater (degenerate FDV/supply ≠ granted nothing)',
    (() => {
      const pJunk = { ...plan, tokenSupply: 0 };
      const t = ENG.computeGrant(mkv({ instrument: 'rta', curve: 'rta' }), pJunk, 'base');
      return t.quantity === 0 && t.underwater === true;
    })());
}

// ---- T11: leaver engine (COM-153 — live-bound) ----
// Plan v9 Rule 5.8 + RTA: Bad Leaver = total lapse/forfeit; non-Bad = vested retained under
// Board discretion (flag, never auto-vest); 24-month qualifying gate binds token vested-to-date.
console.log('\nT11 · Leaver engine (COM-153):');
{
  const dflt = ENG.DEFAULT();
  const plan = dflt.plan;
  const mkAdv = (start, grants) => ({ ...dflt.advisors[0], startDate: start, grants });
  const eOpt = { id: 'e', instrument: 'option', round: 'bridge', quantity: 100, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted' };
  const tRta = { id: 't', instrument: 'rta', round: 'bridge', quantity: 1e6, curve: 'rta', vestStartISO: '2026-06-01', lifecycle: 'granted' };
  const cCash = { id: 'c', instrument: 'cash', round: 'bridge', valueUSD: 100000, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted' };
  const adv = mkAdv('2026-06-01', [eOpt, tRta, cCash]);
  A('BAD_LEAVER_LIMBS: the six limbs, RTA-aligned (resignation<2yr · fiduciary · disclosure · solicitation · Developed Protocol · cause)',
    ENG.BAD_LEAVER_LIMBS.length === 6 && ENG.BAD_LEAVER_LIMBS[4].label.includes('Developed Protocol')
    && ENG.BAD_LEAVER_LIMBS[0].label.includes('2 years'));
  // good leaver at month 30: equity staircase 50% vested · token curve 62.5% · service 30 ≥ 24
  const good = ENG.modelDeparture(adv, 'good', '2028-12-01', plan, dflt.tiers, dflt.objectives);
  A('good leaver: vested-to-date retained (options 50 · tokens 625,000), unvested lapses',
    near(good.optionsRetained, 50, 1e-9) && near(good.optionsLapsed, 50, 1e-9)
    && near(good.tokensRetained, 625000, 1) && near(good.tokensForfeited, 375000, 1));
  A('good leaver: Board-discretion FLAG set + the Andersen warnings surface (never auto-vest)',
    good.boardDiscretion === true && good.warnings.length === 3
    && good.warnings[0].includes('acceleration'));
  A('cash accrued is retained pro-rata for a good leaver (month 30 of 48 → $62.5K)',
    near(good.cashRetained, 100000 * (30 / 48), 1));
  // bad leaver at the same date: everything lapses except accrued cash
  const bad = ENG.modelDeparture(adv, 'bad', '2028-12-01', plan, dflt.tiers, dflt.objectives);
  A('Bad Leaver (Rule 5.8): VESTED and unvested options lapse; tokens forfeit; no discretion flag; no warnings',
    bad.optionsRetained === 0 && bad.optionsLapsed === 100 && bad.tokensRetained === 0
    && bad.tokensForfeited === 1e6 && bad.boardDiscretion === false && bad.warnings.length === 0);
  A('Bad Leaver: accrued cash is NOT clawed back ($62.5K stands)', near(bad.cashRetained, 100000 * (30 / 48), 1));
  A('pool delta: lapsed option shares return to pool headroom (bad 100 · good 50)',
    bad.poolReturned === 100 && near(good.poolReturned, 50, 1e-9));
  // the 24-month qualifying gate inside the leaver calc: departure at month 23
  const early = ENG.modelDeparture(adv, 'good', '2028-05-01', plan, dflt.tiers, dflt.objectives);
  A('RTA qualifying rule binds vested-to-date: good leaver at month 23 retains ZERO tokens (curve says 47.92%)',
    early.tokensForfeited === 1e6 && early.tokensRetained === 0
    && near(early.optionsRetained, 25, 1e-9));
  // death: never a Bad Leaver (the carve-out) — same retained shape as good, discretion flagged
  const death = ENG.modelDeparture(adv, 'death', '2028-12-01', plan, dflt.tiers, dflt.objectives);
  A('death is never a Bad Leaver: vested retained under discretion (the carve-out)',
    near(death.optionsRetained, 50, 1e-9) && death.boardDiscretion === true);
  // implicit-package advisors work through the shim
  const v1adv = dflt.advisors[0];
  const v1dep = ENG.modelDeparture(v1adv, 'good', '2028-06-01', plan, dflt.tiers, dflt.objectives);
  const v1c = ENG.computeAdvisor(v1adv, plan, dflt.tiers, dflt.objectives);
  A('implicit-package advisor models through the shim (vested 50% of the derived option count at month 24)',
    near(v1dep.optionsRetained, v1c.equityShares * 0.5, 0.01));
  A('PLAN_DISQUALIFICATION_WARNINGS: the Andersen list is engine data (3 entries, acceleration first)',
    ENG.PLAN_DISQUALIFICATION_WARNINGS.length === 3);
  // lapsed grants contribute nothing
  const withLapsed = mkAdv('2026-06-01', [eOpt, { ...tRta, id: 'dead', lifecycle: 'lapsed' }]);
  const dl = ENG.modelDeparture(withLapsed, 'good', '2028-12-01', plan, dflt.tiers, dflt.objectives);
  A('already-lapsed grants contribute nothing to a departure', dl.tokensForfeited === 0 && dl.tokensRetained === 0);
  // Review-panel pins (2026-06-10 — mutation-tested gaps, all closed):
  A('classifyLeaver: death + limbs is NEVER bad (the carve-out, executable); limbs alone → bad; clean → good',
    ENG.classifyLeaver(true, [1, 2]) === 'death' && ENG.classifyLeaver(false, [5]) === 'bad'
    && ENG.classifyLeaver(false, []) === 'good');
  A('death retains TOKENS too: month 30 → 625,000 under discretion; month 18 → 0 (the gate binds estates)',
    (() => {
      const d30 = ENG.modelDeparture(adv, 'death', '2028-12-01', plan, dflt.tiers, dflt.objectives);
      const d18 = ENG.modelDeparture(adv, 'death', '2027-12-01', plan, dflt.tiers, dflt.objectives);
      return near(d30.tokensRetained, 625000, 1) && d30.warnings.length >= 3
        && d18.tokensRetained === 0 && near(d18.optionsRetained, 25, 1e-9);
    })());
  A('pre-cliff good leaver (month 6): options 0/100 lapse, pool 100, cash accrues linearly ($12.5K of $100K)',
    (() => {
      const d6 = ENG.modelDeparture(adv, 'good', '2026-12-01', plan, dflt.tiers, dflt.objectives);
      return d6.optionsRetained === 0 && d6.optionsLapsed === 100 && d6.poolReturned === 100
        && near(d6.cashRetained, 100000 * (6 / 48), 1);
    })());
  A('cash accrues over the ENGAGEMENT term: a 2-year retainer fully served retains 100% (never 24/48ths)',
    (() => {
      const a2 = { ...dflt.advisors[0], startDate: '2026-06-01', years: 2, hasCash: true, cashAnnual: 50000, grants: undefined };
      delete a2.grants;
      const d24 = ENG.modelDeparture(a2, 'bad', '2028-06-01', plan, dflt.tiers, dflt.objectives);
      return near(d24.cashRetained, 100000, 1);
    })());
  A('exercised options are issued shares: never lapse, never re-enter the pool, retained even for a Bad Leaver',
    (() => {
      const ax = mkAdv('2026-06-01', [{ ...eOpt, id: 'ex', lifecycle: 'exercised' }]);
      const dx = ENG.modelDeparture(ax, 'bad', '2028-12-01', plan, dflt.tiers, dflt.objectives);
      return dx.optionsLapsed === 0 && dx.poolReturned === 0 && dx.optionsRetained === 100 && dx.forfeitedValue === 0;
    })());
  A('value-denominated grants derive INSIDE departures: $50K at tge lapses ~2,574.78 derived options for a Bad Leaver',
    (() => {
      const pT = { ...plan, currentStage: 'tge' };
      const av = mkAdv('2026-06-01', [{ id: 'v', instrument: 'option', round: 'bridge', valueUSD: 50000, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted' }]);
      const dv = ENG.modelDeparture(av, 'bad', '2029-06-01', pT, dflt.tiers, dflt.objectives);
      return near(dv.optionsLapsed, 2574.78, 0.01) && dv.poolReturned > 0;
    })());
  A('failed derivation is LOUD in a departure: flags on the row, failedDerivation true, a warning names it',
    (() => {
      const av = mkAdv('2026-06-01', [{ id: 'v', instrument: 'option', round: 'bridge', valueUSD: 50000, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted' }]);
      const dv = ENG.modelDeparture(av, 'bad', '2029-06-01', plan, dflt.tiers, dflt.objectives);
      return dv.failedDerivation === true && dv.rows[0].underwater === true
        && dv.warnings.some(w => w.includes('derivation failure'));
    })());
  A('both value bases reported: exit-basis forfeit ~$132K vs today-FMV $0 at the bridge stage (good leaver m30)',
    (() => {
      const g30 = ENG.modelDeparture(mkAdv('2026-06-01', [eOpt]), 'good', '2028-12-01', plan, dflt.tiers, dflt.objectives);
      return near(g30.forfeitedValue, 50 * (4212.04 - 1572.95), 5) && g30.forfeitedValueToday === 0
        && g30.rows[0].basis === 'exit-vs-fmv';
    })());
  A('cash-only departure: NO discretion flag and NO Andersen banner (nothing to accelerate); mixed keeps both',
    (() => {
      const ac = mkAdv('2026-06-01', [cCash]);
      const dc = ENG.modelDeparture(ac, 'good', '2028-12-01', plan, dflt.tiers, dflt.objectives);
      return dc.boardDiscretion === false && dc.warnings.length === 0
        && good.boardDiscretion === true && good.warnings.length >= 3;
    })());
  A('the 24-month anniversary binds through DATE arithmetic: 2028-06-01 retains 500K · 2028-05-31 retains 0',
    (() => {
      const d24 = ENG.modelDeparture(adv, 'good', '2028-06-01', plan, dflt.tiers, dflt.objectives);
      const d23 = ENG.modelDeparture(adv, 'good', '2028-05-31', plan, dflt.tiers, dflt.objectives);
      return near(d24.tokensRetained, 500000, 1) && d23.tokensRetained === 0;
    })());
  A('day-aware service: started 2026-06-15, departing 2028-06-01 → 23 service months → tokens gated to 0',
    (() => {
      const a15 = mkAdv('2026-06-15', [{ ...tRta, vestStartISO: '2026-06-15' }]);
      return ENG.modelDeparture(a15, 'good', '2028-06-01', plan, dflt.tiers, dflt.objectives).tokensRetained === 0;
    })());
  A('top-up grant anchors: gate on SERVICE (advisor start), curve on the grant VCD (m13 of a 43-month engagement distributes)',
    (() => {
      const at = mkAdv('2026-06-01', [{ ...tRta, id: 'top', vestStartISO: '2028-12-01' }]);
      const dt = ENG.modelDeparture(at, 'good', '2030-01-01', plan, dflt.tiers, dflt.objectives);
      return near(dt.tokensRetained, 1e6 * (0.25 + 1 * (0.75 / 36)), 1);
    })());
  A('plan-parameterised vest threads into departures: 3yr/6mo plan, month-7 good leaver retains 1/3 of options',
    (() => {
      const p36 = { ...plan, equityVestYears: 3, equityCliff: 6 };
      const d7 = ENG.modelDeparture(mkAdv('2026-06-01', [eOpt]), 'good', '2027-01-01', p36, dflt.tiers, dflt.objectives);
      return near(d7.optionsRetained, 100 / 3, 0.01);
    })());
}

console.log(`\n${pass} passed, ${fail} failed, ${pending} pending(v2).`);
process.exit(fail ? 1 : 0);
