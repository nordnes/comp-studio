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
  A('round-trip: a pre-COM-142 payload seeds the new fields, stamps the CURRENT schema, computes identically',
    seeded.version === ENG.SCHEMA && seeded.plan.constitution.authorised === 50000
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
  // COM-148: the side-by-side set diff (per-advisor net + board totals + founder/pool deltas)
  A('diffSets: working vs a $300m-exit set — per-advisor deltas + cost/founder totals line up',
    (() => {
      const d = ENG.DEFAULT();
      const floorSet = ENG.makeScenarioSet('floor', '$90m floor', d.plan);
      floorSet.scenarios.base.seriesC.post = 300e6; // a cheaper exit in the saved set
      const planWith = { ...d.plan, scenarioSets: [floorSet] };
      const diff = ENG.diffSets(d.advisors, planWith, d.tiers, d.objectives, '', 'floor');
      const c0a = ENG.computeAdvisor(d.advisors[0], planWith, d.tiers, d.objectives);
      const c0b = ENG.computeAdvisor(d.advisors[0], ENG.planWithSet(planWith, 'floor'), d.tiers, d.objectives);
      return diff.rows.length === 4
        && near(diff.rows[0].aTotal, c0a.baseCaseTotal, 1e-6)
        && near(diff.rows[0].bTotal, c0b.baseCaseTotal, 1e-6)
        && near(diff.rows[0].delta, c0b.baseCaseTotal - c0a.baseCaseTotal, 1e-6)
        // a cheaper exit with the SAME raise dilutes harder: cost falls AND founder % falls
        && diff.deltas.cost < 0 && diff.b.founderPct < diff.a.founderPct;
    })());
  // COM-147: the workbook's auto-callouts, engine-generated (A.3 headline observations)
  A('headlineObservations: founder walk 77.72% → 65.63% (−12.09pp) + the ESOP-driver line (10% vs 5.6%)',
    (() => {
      const obs = ENG.headlineObservations(ENG.DEFAULT().plan);
      return obs.length === 2 && obs[0].text.includes('77.72%') && obs[0].text.includes('65.63%')
        && obs[0].text.includes('12.09pp') && obs[1].id === 'esop-driver'
        && obs[1].text.includes('10%') && obs[1].text.includes('5.6%');
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
  A('GRANT_LIFECYCLES and DOC_STATUSES are the two SEPARATE status vocabularies (RFC §3; COM-155 extends docs)',
    ENG.GRANT_LIFECYCLES.join(',') === 'draft,loi,granted,exercised,lapsed'
    && ENG.DOC_STATUSES.join(',') === 'in-draft,sent,in-review,signed,cancelled,loi,promised');
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
  // (Tightened at COM-171: D3's derive-don't-materialise governed UNTIL the v6 bump — junk
  // still never survives as junk, and the migration replaces it with derived-flagged rows
  // that keep the advisor on the parametric path.)
  A('round-trip: non-array grants junk → replaced by the v6 derived snapshot (parametric path keeps computing)',
    Array.isArray(rr.advisors[1].grants) && rr.advisors[1].grants.every(g => g.derived === true)
    && ENG.hasExplicitGrants(rr.advisors[1]) === false
    && Array.isArray(rr.advisors[2].grants) && rr.advisors[2].grants.every(g => g.derived === true));
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

// ---- T12: exercise mechanics (COM-151 — live-bound) ----
// Clause 3.6 backstop dates, Board-window membership, the cash-free-route flags, and the
// Part 10 #7 carve-out explainer (display truth — no adjustment math may exist).
console.log('\nT12 · Exercise windows & the Clause 3.6 backstop (COM-151):');
{
  const g = { id: 'x', instrument: 'option', round: 'bridge', quantity: 100, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted' };
  const w1 = { id: 'w1', openISO: '2030-01-01', closeISO: '2030-03-31', label: 'Series C secondary' };
  A('EXERCISE_MECHANICS: four statements (windows · 3.6 backstop · net exercise 4.5 · sell-to-cover 7.4(a))',
    ENG.EXERCISE_MECHANICS.length === 4
    && ENG.EXERCISE_MECHANICS[1].text.includes('90 days') && ENG.EXERCISE_MECHANICS[1].text.includes("30 days' written notice")
    && ENG.EXERCISE_MECHANICS[2].rule.includes('4.5') && ENG.EXERCISE_MECHANICS[3].rule.includes('7.4'));
  A('FUNDING_ROUND_CARVEOUT explains Rules 11.2/11.3 — and the engine exports NO adjustment math for it',
    ENG.FUNDING_ROUND_CARVEOUT.includes('no compensatory adjustment') && ENG.FUNDING_ROUND_CARVEOUT.includes('11.3'));
  A('window membership: inside a Board window → inWindow true; outside → false',
    ENG.exerciseCheck(g, '2030-02-15', [w1]).inWindow === true
    && ENG.exerciseCheck(g, '2030-04-01', [w1]).inWindow === false);
  A('backstop dates: 9th anniversary 2035-06-01 · last close 2036-05-31 (day before the 10th)',
    (() => { const b = ENG.exerciseCheck(g, '2030-01-01').backstop; return b.anniversary9ISO === '2035-06-01' && b.lastCloseISO === '2036-05-31' && b.minWindowDays === 90 && b.noticeDays === 30; })());
  A('backstop.required flips at the 9th anniversary (premise: no Exit Event)',
    ENG.exerciseCheck(g, '2035-05-31').backstop.required === false
    && ENG.exerciseCheck(g, '2035-06-01').backstop.required === true);
  A('cash-free routes ride as flags: net exercise = board discretion on request · sell-to-cover = holder-elected',
    (() => { const c = ENG.exerciseCheck(g, '2030-01-01'); return c.netExercise.route.includes('board-discretion') && c.sellToCover.route === 'holder-elected'; })());
  A('rta/cash/lapsed/exercised grants are never exercisable (no window, no backstop requirement)',
    ENG.exerciseCheck({ ...g, instrument: 'rta' }, '2035-07-01', [w1]).exercisable === false
    && ENG.exerciseCheck({ ...g, lifecycle: 'exercised' }, '2035-07-01').backstop.required === false
    && ENG.exerciseCheck({ ...g, lifecycle: 'lapsed' }, '2030-02-15', [w1]).inWindow === false);
  A('date helpers are TZ-free and junk-safe (leap-day folds; junk passes through unchanged)',
    ENG.addYearsISO('2028-02-29', 1) === '2029-03-01' && ENG.dayBeforeISO('2036-03-01') === '2036-02-29'
    && ENG.addYearsISO('junk', 9) === 'junk');
}

// ---- T13: pre-TGE liquidity fallback (COM-152 — live-bound) ----
// A liquidity event before TGE converts token awards 1:1 into equity, net of the same walk.
console.log('\nT13 · Token→equity 1:1 pre-TGE fallback (COM-152):');
{
  const dflt = ENG.DEFAULT();
  const plan = JSON.parse(JSON.stringify(dflt.plan));
  plan.scenarios.base.preTgeLiquidity = true;
  const w = ENG.walkScenario(plan, 'base');
  const retention = w.byId.bridge.N / w.exit.N;
  A('toggle ON: tokenValueFor re-states tkPct × retention × exitVal (no strike); OFF keeps tkPct × FDV',
    near(ENG.tokenValueFor(plan, 'base', w, 0.003, 'bridge'), 0.003 * retention * 500e6, 1)
    && near(ENG.tokenValueFor(dflt.plan, 'base', ENG.walkScenario(dflt.plan, 'base'), 0.003, 'bridge'), 0.003 * 600e6, 1));
  A('v1 advisor path: the toggled scenario re-states; other scenarios untouched; flag rides the row',
    (() => {
      const c = ENG.computeAdvisor(dflt.advisors[0], plan, dflt.tiers, dflt.objectives);
      const sBase = c.scen.find(s => s.key === 'base'), sCons = c.scen.find(s => s.key === 'conservative');
      return near(sBase.token, c.tkPct * retention * 500e6, 1) && sBase.tokenAsEquity === true
        && near(sCons.token, sCons.fdv * c.tkPct, 1) && sCons.tokenAsEquity === false;
    })());
  A('board totals follow the toggle (base-case cost shifts between ON and OFF)',
    (() => {
      const on = ENG.computeBoard(dflt.advisors, plan, dflt.tiers, dflt.objectives).cost.base;
      const off = ENG.computeBoard(dflt.advisors, dflt.plan, dflt.tiers, dflt.objectives).cost.base;
      return Math.abs(on - off) > 1000;
    })());
  A('grant-advisor rta row re-states under the toggle (tokens/supply of walk value, flagged)',
    (() => {
      const g = { id: 't', instrument: 'rta', round: 'bridge', quantity: 1e6, curve: 'rta', vestStartISO: '2026-06-01', lifecycle: 'granted' };
      const rOn = ENG.computeGrant(g, plan, 'base');
      const rOff = ENG.computeGrant(g, dflt.plan, 'base');
      return near(rOn.value, (1e6 / 10e9) * retention * 500e6, 1) && rOn.tokenAsEquity === true
        && near(rOff.value, 1e6 * 0.06, 1) && rOff.tokenAsEquity === false;
    })());
  A('round-trip: the toggle survives reconcile on the active map AND inside saved sets',
    (() => {
      const rt = JSON.parse(JSON.stringify(dflt));
      rt.plan.scenarios.base.preTgeLiquidity = true;
      rt.plan.scenarioSets = [{ id: 's', scenarios: { x: { label: 'X', tgeMult: 2, preTgeLiquidity: true, seriesA: { post: 1e8, raise: 1e6, esop: 0.1 } } }, baseScenario: 'x' }];
      const r = ENG.reconcile(rt);
      return r.plan.scenarios.base.preTgeLiquidity === true
        && r.plan.scenarioSets[0].scenarios.x.preTgeLiquidity === true;
    })());
}

// ---- T14: capital introductions + board rollup (COM-146 — live-bound) ----
// Targeted → gated → earned: EARNED drives the uplift; the pipeline feeds only the ceiling.
// The live instance: Kerim's XTX introduction ("they could do the whole 10 million") against
// the bridge $5m target — $10M earned at $1M-per-10% caps at the schedule's 100%.
console.log('\nT14 · Capital introductions & the board rollup (COM-146):');
{
  const dflt = ENG.DEFAULT();
  const plan = dflt.plan;
  const mkA = (intros) => ({ ...dflt.advisors[2], id: 'kerim-x', introductions: intros });
  A('INTRO_STATUSES: targeted → gated → earned', ENG.INTRO_STATUSES.join(',') === 'targeted,gated,earned');
  const xtx = mkA([{ id: 'xtx', amountUSD: 10e6, round: 'bridge', status: 'earned', note: 'XTX — could do the whole 10 million' }]);
  const cX = ENG.computeAdvisor(xtx, plan, dflt.tiers, dflt.objectives);
  A('Kerim/XTX earned $10M → uplift caps at 100% (the schedule cap), gate reached at bridge',
    near(cX.capEarned, 1.0, 1e-9) && cX.introEarned === 10e6
    && near(cX.eqPct, cX.baseEq * (1 + cX.earnedUplift), 1e-12));
  A('targeted/gated feed ONLY the ceiling: $10M targeted → earned uplift 0, ceiling includes it',
    (() => {
      const t = ENG.computeAdvisor(mkA([{ id: 'x', amountUSD: 10e6, round: 'bridge', status: 'targeted' }]), plan, dflt.tiers, dflt.objectives);
      return t.capEarned === 0 && t.introPipeline === 10e6 && t.ceilUplift > t.earnedUplift;
    })());
  A('explicit introductions REPLACE the v1 perf capital (perf numbers ignored when intros[] present)',
    (() => {
      const both = mkA([{ id: 'x', amountUSD: 2e6, round: 'bridge', status: 'earned' }]);
      both.performance = { ...both.performance, capitalEquity: 9e6, capitalToken: 0, achieved: [], targeted: [] };
      const c = ENG.computeAdvisor(both, plan, dflt.tiers, dflt.objectives);
      return c.capTotal === 2e6 && near(c.capEarned, clamp(2e6 / 1e6 * 0.1, 0, 1), 1e-9);
    })());
  A('v1 advisors (no introductions[]) keep the v1 capital path byte-identically',
    (() => {
      const v1 = ENG.computeAdvisor(dflt.advisors[2], plan, dflt.tiers, dflt.objectives);
      return v1.introEarned === 0 && v1.introPipeline === 0 && v1.capTotal === (dflt.advisors[2].performance.capitalEquity || 0) + (dflt.advisors[2].performance.capitalToken || 0);
    })());
  // the rollup
  const board = [xtx, mkA([{ id: 'g1', amountUSD: 3e6, round: 'seriesA', status: 'gated' }, { id: 't1', amountUSD: 2e6, round: 'seriesA', status: 'targeted' }])];
  board[1].id = 'adv2';
  const roll = ENG.capitalRollup(board, plan, dflt.tiers, dflt.objectives);
  A('rollup totals: targeted $2M · gated $3M · earned $10M · total $15M',
    roll.totals.targeted === 2e6 && roll.totals.gated === 3e6 && roll.totals.earned === 10e6 && roll.totals.total === 15e6);
  A('rollup owed-out: earned-uplift value = capEarned × baseCaseBase per advisor (engine-derived)',
    (() => {
      const r0 = roll.rows.find(r => r.advisorId === 'kerim-x');
      return near(r0.earnedUpliftValue, cX.capEarned * cX.baseCaseBase, 0.01) && r0.potentialUpliftValue >= r0.earnedUpliftValue;
    })());
  A('rollup schedule echoes the Configure capital schedule + gate state',
    roll.schedule.per === 1e6 && roll.schedule.pct === 0.1 && roll.schedule.cap === 1 && roll.schedule.gateReached === true);
  A('round-trip: introductions survive; junk amount → 0; unknown status heals fail-CLOSED to targeted; non-array deletes',
    (() => {
      const rt = JSON.parse(JSON.stringify(dflt));
      rt.advisors[0].introductions = [
        { id: 'k', amountUSD: 5e6, round: 'bridge', status: 'earned' },
        { id: 'j', amountUSD: 'lots', round: 7, status: 'crystallised' },
        'junk',
      ];
      rt.advisors[1].introductions = 'nope';
      const r = ENG.reconcile(rt);
      const ii = r.advisors[0].introductions;
      return ii.length === 2 && ii[0].amountUSD === 5e6 && ii[0].status === 'earned'
        && ii[1].amountUSD === 0 && ii[1].status === 'targeted' && ii[1].round === 'bridge'
        && r.advisors[1].introductions == null;
    })());
  // Review-panel pins (2026-06-10 — pendingUplift semantics, grants×intros, dedupe, negatives,
  // gate-not-reached, v1 rollup bucket, owed-vs-actual fidelity):
  A('pendingUplift means EARNED-but-gated only: a $10M targeted intro pends 0 (it ceilings, like targeted objectives)',
    (() => {
      const t = ENG.computeAdvisor(mkA([{ id: 'x', amountUSD: 10e6, round: 'bridge', status: 'targeted' }]), plan, dflt.tiers, dflt.objectives);
      return t.pendingUplift === 0 && t.ceilUplift >= 1.0;
    })());
  A('duplicate intro ids never survive reconcile (a doubled $5M must not crystallise 100%)',
    (() => {
      const rt = JSON.parse(JSON.stringify(dflt));
      rt.advisors[0].introductions = [
        { id: 'dup', amountUSD: 5e6, round: 'bridge', status: 'earned' },
        { id: 'dup', amountUSD: 5e6, round: 'bridge', status: 'earned' },
      ];
      const r = ENG.reconcile(rt);
      const c = ENG.computeAdvisor(r.advisors[0], plan, dflt.tiers, dflt.objectives);
      return r.advisors[0].introductions.length === 1 && near(c.capEarned, 0.5, 1e-9);
    })());
  A('duplicate grant ids never survive reconcile (the fold must not double-count)',
    (() => {
      const rt = JSON.parse(JSON.stringify(dflt));
      rt.advisors[0].grants = [
        { id: 'g1', instrument: 'option', round: 'bridge', quantity: 100, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted' },
        { id: 'g1', instrument: 'option', round: 'bridge', quantity: 100, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted' },
      ];
      return ENG.reconcile(rt).advisors[0].grants.length === 1;
    })());
  A('negative amounts never subtract (live state bypasses reconcile): earned $10M + targeted −$8M → ceiling ≥ earned',
    (() => {
      const c = ENG.computeAdvisor(mkA([
        { id: 'a', amountUSD: 10e6, round: 'bridge', status: 'earned' },
        { id: 'b', amountUSD: -8e6, round: 'bridge', status: 'targeted' },
      ]), plan, dflt.tiers, dflt.objectives);
      return c.introPipeline === 0 && c.ceilUplift >= c.earnedUplift && c.pendingUplift >= 0;
    })());
  A('gate NOT reached: an earned intro upstream of the gate pends, never crystallises (capEarned 0, pending > 0)',
    (() => {
      const pGate = JSON.parse(JSON.stringify(plan));
      pGate.capitalUplift = { ...pGate.capitalUplift, gate: 'seriesA' };
      const c = ENG.computeAdvisor(mkA([{ id: 'x', amountUSD: 10e6, round: 'bridge', status: 'earned' }]), pGate, dflt.tiers, dflt.objectives);
      const roll = ENG.capitalRollup([mkA([{ id: 'x', amountUSD: 10e6, round: 'bridge', status: 'earned' }])], pGate, dflt.tiers, dflt.objectives);
      return c.capEarned === 0 && c.pendingUplift >= 1.0 && roll.schedule.gateReached === false
        && roll.rows[0].earnedUpliftValue === 0;
    })());
  A('owed-out fidelity: earnedUpliftValue ≡ the ACTUAL package delta (baseCaseTotal − baseCaseBase) for a capital-only advisor',
    (() => {
      const r0 = roll.rows.find(r => r.advisorId === 'kerim-x');
      return near(r0.earnedUpliftValue, cX.baseCaseTotal - cX.baseCaseBase, 0.01);
    })());
  A('rollup buckets a v1 advisor\'s perf capital as earned (no introductions[])',
    (() => {
      const v1a = { ...dflt.advisors[2], id: 'v1cap' };
      v1a.performance = { ...v1a.performance, capitalEquity: 3e6, capitalToken: 0, achieved: [], targeted: [] };
      const r = ENG.capitalRollup([v1a], plan, dflt.tiers, dflt.objectives);
      return r.rows[0].earned === 3e6 && r.rows[0].targeted === 0 && near(r.rows[0].earnedUpliftFrac, 0.3, 1e-9);
    })());
  A('grants×intros: capital-in reported, uplift 0/0 with upliftViaGrants (top-up grants carry the reward; no phantom potential)',
    (() => {
      const ga = { ...dflt.advisors[2], id: 'gx', grants: [{ id: 'g', instrument: 'option', round: 'bridge', quantity: 100, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted' }], introductions: [{ id: 'x', amountUSD: 10e6, round: 'bridge', status: 'earned' }] };
      const c = ENG.computeAdvisor(ga, plan, dflt.tiers, dflt.objectives);
      const r = ENG.capitalRollup([ga], plan, dflt.tiers, dflt.objectives);
      return c.introEarned === 10e6 && c.upliftViaGrants === true && c.capEarned === 0
        && r.rows[0].earned === 10e6 && r.rows[0].potentialUpliftValue === 0 && r.rows[0].upliftViaGrants === true;
    })());
}

// ---- T15: cash-floor trade + affordability (COM-154 — live-bound) ----
// Certainty bought from the instrument legs at a configured rate; DEFAULT DISALLOWED
// (open decision #3); affordability guards total cash commitments against burn (~$430K/mo).
console.log('\nT15 · Cash-floor trade & affordability (COM-154):');
{
  const dflt = ENG.DEFAULT();
  const planOn = JSON.parse(JSON.stringify(dflt.plan));
  planOn.cashFloor = { enabled: true, exchangeRate: 2, monthlyBurnUSD: 430000, maxPctOfBurn: 0.10 };
  const advF = { ...dflt.advisors[0], cashFloorAnnualUSD: 50000 };
  A('CASH_FLOOR_DEFAULT: DISABLED · rate 2× · burn $430K/mo · cap 10% (open decision #3 configurable)',
    ENG.CASH_FLOOR_DEFAULT.enabled === false && ENG.CASH_FLOOR_DEFAULT.exchangeRate === 2
    && ENG.CASH_FLOOR_DEFAULT.monthlyBurnUSD === 430000 && ENG.CASH_FLOOR_DEFAULT.maxPctOfBurn === 0.10);
  A('policy DISABLED → an elected floor is a byte-level no-op (default disallowed)',
    (() => {
      const off = ENG.computeAdvisor(advF, dflt.plan, dflt.tiers, dflt.objectives);
      const ref = ENG.computeAdvisor(dflt.advisors[0], dflt.plan, dflt.tiers, dflt.objectives);
      return off.cashFloorAnnual === 0 && near(off.baseCaseTotal, ref.baseCaseTotal, 1e-6) && off.cash === ref.cash;
    })());
  const on = ENG.computeAdvisor(advF, planOn, dflt.tiers, dflt.objectives);
  const ref = ENG.computeAdvisor(dflt.advisors[0], planOn, dflt.tiers, dflt.objectives);
  A('trade: $50K/yr floor over 4 years at 2× surrenders $400K of instrument value; both legs + ceilings scale',
    (() => {
      const instrRef = ref.baseCaseTotal;
      return near(on.cashFloorTraded, 400000, 1) && near(on.cashFloorFrac, 400000 / instrRef, 1e-9)
        && near(on.baseCaseTotal, instrRef - 400000, 1)
        && near(on.eqPctCeil / ref.eqPctCeil, 1 - on.cashFloorFrac, 1e-9);
    })());
  A('the floor pays as cash: cash +$50K/yr, cashTotal +$200K over the engagement',
    on.cash === ref.cash + 50000 && near(on.cashTotal, (ref.cash + 50000) * 4, 1e-6));
  A('an unfundable floor clamps at 100% and flags (never negative instrument value)',
    (() => {
      const big = ENG.computeAdvisor({ ...dflt.advisors[0], cashFloorAnnualUSD: 5e7 }, planOn, dflt.tiers, dflt.objectives);
      return big.cashFloorFrac === 1 && big.cashFloorUnfunded === true && big.baseCaseTotal >= -1e-6;
    })());
  A('affordability: total cash commitments past the cap fire the Board warning; below it, silent',
    (() => {
      const boardHot = dflt.advisors.map(a => ({ ...a, cashFloorAnnualUSD: 200000 }));
      const hot = ENG.computeBoard(boardHot, planOn, dflt.tiers, dflt.objectives);
      const cold = ENG.computeBoard([advF], planOn, dflt.tiers, dflt.objectives);
      return hot.warnings.some(w => w.includes('burn')) && !cold.warnings.some(w => w.includes('burn'))
        && near(hot.monthlyCash, (4 * 200000) / 12, 1);
    })());
  A('COM-152 residual fixed: baseCaseTotal ≡ sb.total under the pre-TGE fallback',
    (() => {
      const pT = JSON.parse(JSON.stringify(dflt.plan));
      pT.scenarios.base.preTgeLiquidity = true;
      const c = ENG.computeAdvisor(dflt.advisors[0], pT, dflt.tiers, dflt.objectives);
      return near(c.baseCaseTotal, c.base.total, 1e-6);
    })());
  A('round-trip: policy heals per-field (junk enabled → DISABLED — fails closed); elected floors numeric-guarded',
    (() => {
      const rt = JSON.parse(JSON.stringify(dflt));
      rt.plan.cashFloor = { enabled: 'yes', exchangeRate: -1, monthlyBurnUSD: 'lots', maxPctOfBurn: 0 };
      rt.advisors[0].cashFloorAnnualUSD = -5;
      rt.advisors[1].cashFloorAnnualUSD = 60000;
      const r = ENG.reconcile(rt);
      return r.plan.cashFloor.enabled === false && r.plan.cashFloor.exchangeRate === 2
        && r.plan.cashFloor.monthlyBurnUSD === 430000 && r.plan.cashFloor.maxPctOfBurn === 0.10
        && r.advisors[0].cashFloorAnnualUSD == null && r.advisors[1].cashFloorAnnualUSD === 60000;
    })());
  A('round-trip: a pre-COM-154 payload seeds the disabled policy and computes identically',
    (() => {
      const pre = JSON.parse(JSON.stringify(dflt)); delete pre.plan.cashFloor;
      const r = ENG.reconcile(pre);
      return r.plan.cashFloor.enabled === false && near(ENG.walkScenario(r.plan, 'base').exit.N, 118707, 1);
    })());
}

// ---- T16: the single SCHEMA-6 bump (COM-171 — live-bound) ----
// v5 → v6: materialise grants[] (derived-flagged, refreshed on load), delete the inert
// cocAccelPct, stamp version 6 — and every v5 payload LOADS AND COMPUTES IDENTICALLY
// (localStorage-map member AND the #s= raw-State hash form take the same reconcile path).
console.log('\nT16 · SCHEMA v6 migration (COM-171):');
{
  const dflt = ENG.DEFAULT();
  A('SCHEMA is 6 — the one and only bump of the wave', ENG.SCHEMA === 6);
  A('cocAccelPct is gone from DEFAULT() and deleted from migrated payloads',
    (() => {
      const v5 = JSON.parse(JSON.stringify(dflt)); v5.version = 5; v5.plan.cocAccelPct = 0.25;
      const r = ENG.reconcile(v5);
      return !('cocAccelPct' in dflt.plan) && !('cocAccelPct' in r.plan) && r.version === 6;
    })());
  // the core guarantee: a v5 advisor (parametric, no grants) computes IDENTICALLY post-migration
  const mkV5 = () => {
    const v5 = JSON.parse(JSON.stringify(dflt)); v5.version = 5; v5.plan.cocAccelPct = 0;
    v5.advisors.forEach(a => { delete a.grants; });
    return v5;
  };
  A('migration materialises derived-flagged grants for parametric advisors (option + rta rows)',
    (() => {
      const r = ENG.reconcile(mkV5());
      return r.advisors.every(a => Array.isArray(a.grants) && a.grants.length >= 2
        && a.grants.every(g => g.derived === true));
    })());
  A('LOADS AND COMPUTES IDENTICALLY: every money field equal pre/post migration (incl. the CEILINGS)',
    (() => {
      const v5 = mkV5();
      const pre = v5.advisors.map(a => ENG.computeAdvisor(a, dflt.plan, dflt.tiers, dflt.objectives));
      const r = ENG.reconcile(v5);
      const post = r.advisors.map(a => ENG.computeAdvisor(a, r.plan, r.tiers, r.objectives));
      return pre.every((c, i) => near(c.baseCaseTotal, post[i].baseCaseTotal, 1e-9)
        && near(c.baseCaseCeil, post[i].baseCaseCeil, 1e-9)
        && near(c.eqPctCeil, post[i].eqPctCeil, 1e-12)
        && near(c.pendingUplift, post[i].pendingUplift, 1e-12)
        && near(c.cashTotal, post[i].cashTotal, 1e-9));
    })());
  A('the #s= hash form (raw State) migrates through the same path',
    (() => {
      // store.ts: decodeHash(JSON) → reconcile — emulate the decode product directly.
      const hashState = mkV5();
      const r = ENG.reconcile(hashState);
      return r.version === 6 && !('cocAccelPct' in r.plan)
        && near(ENG.computeBoard(r.advisors, r.plan, r.tiers, r.objectives).cost.base,
                ENG.computeBoard(dflt.advisors, dflt.plan, dflt.tiers, dflt.objectives).cost.base, 1e-6);
    })());
  A('idempotent: reconcile(reconcile(v5)) — derived rows refresh, never duplicate',
    (() => {
      const r1 = ENG.reconcile(mkV5());
      const r2 = ENG.reconcile(JSON.parse(JSON.stringify(r1)));
      return r2.advisors.every((a, i) => a.grants.length === r1.advisors[i].grants.length
        && a.grants.every(g => g.derived === true));
    })());
  A('derived rows REFRESH from the parametric fields (a plan edit re-derives on next load — no stale snapshots)',
    (() => {
      const r1 = ENG.reconcile(mkV5());
      const edited = JSON.parse(JSON.stringify(r1));
      edited.plan.baseGrant.equityPct = 0.01; // doubled
      const r2 = ENG.reconcile(edited);
      const q1 = r1.advisors[0].grants.find(g => g.instrument === 'option').quantity;
      const q2 = r2.advisors[0].grants.find(g => g.instrument === 'option').quantity;
      return q2 > q1 * 1.5;
    })());
  A('explicit grants are untouched by the migration; [] stays explicit-zero',
    (() => {
      const v5 = mkV5();
      v5.advisors[0].grants = [{ id: 'real', instrument: 'option', round: 'bridge', quantity: 42, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted' }];
      v5.advisors[1].grants = [];
      const r = ENG.reconcile(v5);
      return r.advisors[0].grants.length === 1 && r.advisors[0].grants[0].quantity === 42
        && !r.advisors[0].grants[0].derived && Array.isArray(r.advisors[1].grants)
        && r.advisors[1].grants.length === 0
        && ENG.computeAdvisor(r.advisors[1], r.plan, r.tiers, r.objectives).baseCaseTotal === 0;
    })());
  A('claim-on-first-edit: stripping the derived flags flips the advisor to the fold (the store contract)',
    (() => {
      const r = ENG.reconcile(mkV5());
      const claimed = { ...r.advisors[0], grants: r.advisors[0].grants.map(g => { const { derived, ...rest } = g; return rest; }) };
      const c = ENG.computeAdvisor(claimed, r.plan, r.tiers, r.objectives);
      return ENG.hasExplicitGrants(claimed) && c.ceilUplift === 0
        && near(c.baseCaseTotal, ENG.computeAdvisor(r.advisors[0], r.plan, r.tiers, r.objectives).baseCaseTotal, 0.01);
    })());
  A('junk derived values heal to absent (only boolean true survives the sanitizer)',
    (() => {
      const v5 = mkV5();
      v5.advisors[0].grants = [{ id: 'g', instrument: 'option', round: 'bridge', quantity: 10, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted', derived: 'yes' }];
      const r = ENG.reconcile(v5);
      return r.advisors[0].grants[0].derived == null && ENG.hasExplicitGrants(r.advisors[0]);
    })());
  A('a cash-floor advisor migrates with the floor row in the snapshot (policy on)',
    (() => {
      const v5 = mkV5();
      v5.plan.cashFloor = { enabled: true, exchangeRate: 2, monthlyBurnUSD: 430000, maxPctOfBurn: 0.10 };
      v5.advisors[0].cashFloorAnnualUSD = 50000;
      const r = ENG.reconcile(v5);
      const floorRow = r.advisors[0].grants.find(g => g.id.endsWith('-implicit-floor'));
      return floorRow && floorRow.instrument === 'cash' && floorRow.valueUSD === 200000 && floorRow.derived === true;
    })());
  // Review-panel pins (2026-06-10 — every one mutation-tested: the suite stayed green under
  // planted regressions until these landed):
  A('a DORMANT floor election (policy OFF) materialises NO floor row and a departure retains no floor cash',
    (() => {
      const v5 = mkV5();
      v5.advisors[0].cashFloorAnnualUSD = 50000; // policy stays disabled (the default)
      const r = ENG.reconcile(v5);
      const hasFloorRow = r.advisors[0].grants.some(g => g.id.endsWith('-implicit-floor'));
      const dep = ENG.modelDeparture(r.advisors[0], 'good', '2030-06-01', r.plan, r.tiers, r.objectives);
      return !hasFloorRow && r.advisors[0].cashFloorAnnualUSD === 50000 && dep.cashRetained === 0;
    })());
  A('MIXED arrays are EXPLICIT: an appended top-up beside derived rows survives reconcile and counts in the fold',
    (() => {
      const r1 = ENG.reconcile(mkV5());
      const mixed = JSON.parse(JSON.stringify(r1));
      mixed.advisors[0].grants.push({ id: 'top', instrument: 'option', round: 'seriesA', quantity: 500, curve: 'cert-v3', vestStartISO: '2027-06-01', lifecycle: 'granted' });
      const r2 = ENG.reconcile(mixed);
      const top = r2.advisors[0].grants.find(g => g.id === 'top');
      const c = ENG.computeAdvisor(r2.advisors[0], r2.plan, r2.tiers, r2.objectives);
      return ENG.hasExplicitGrants(r2.advisors[0]) && top && top.quantity === 500
        && c.equityShares > 500;
    })());
  A('ZERO-derivation advisors stay PARAMETRIC: the migration never writes [] (a TBD placeholder must recover)',
    (() => {
      const v5 = mkV5();
      v5.advisors[0].mode = 'value'; v5.advisors[0].annualValue = 0; // a parked placeholder
      const r1 = ENG.reconcile(v5);
      const parked = r1.advisors[0];
      const stillParametric = !Array.isArray(parked.grants);
      const revived = JSON.parse(JSON.stringify(r1));
      revived.advisors[0].annualValue = 75000;
      const r2 = ENG.reconcile(revived);
      const c = ENG.computeAdvisor(r2.advisors[0], r2.plan, r2.tiers, r2.objectives);
      return stillParametric && c.baseCaseTotal > 100000;
    })());
  A('a zeroed baseGrant round-trip never freezes the board: restore + reload recovers full value',
    (() => {
      const v5 = mkV5();
      v5.plan.baseGrant = { equityPct: 0, tokenPct: 0 };
      const r1 = ENG.reconcile(v5);
      const restored = JSON.parse(JSON.stringify(r1));
      restored.plan.baseGrant = { equityPct: 0.005, tokenPct: 0.003 };
      const r2 = ENG.reconcile(restored);
      const total = r2.advisors.reduce((s, a) => s + ENG.computeAdvisor(a, r2.plan, r2.tiers, r2.objectives).baseCaseTotal, 0);
      return total > 1e6;
    })());
  A('claiming the FRESH derivation preserves the on-screen value after a plan edit (the stale-snapshot trap)',
    (() => {
      const r1 = ENG.reconcile(mkV5());
      const edited = JSON.parse(JSON.stringify(r1));
      edited.plan.baseGrant.equityPct = 0.01; // doubled in-session; snapshot rows now stale
      // the store claims effectiveGrants FRESH on the parametric fields (never the snapshot):
      const a = edited.advisors[0];
      const { grants: _snap, ...parametric } = a;
      const claimed = { ...a, grants: ENG.effectiveGrants(parametric, edited.plan, edited.tiers, edited.objectives).map(g => { const { derived, ...rest } = g; return rest; }) };
      const cParam = ENG.computeAdvisor(parametric, edited.plan, edited.tiers, edited.objectives);
      const cClaim = ENG.computeAdvisor(claimed, edited.plan, edited.tiers, edited.objectives);
      return near(cClaim.baseCaseTotal, cParam.baseCaseTotal, 0.01) && cClaim.baseCaseTotal > 9e6;
    })());
  A('affordability never fails open after a claim: grant-borne cash keeps counting (cashAnnualEq)',
    (() => {
      const planOn = JSON.parse(JSON.stringify(dflt.plan));
      planOn.cashFloor = { enabled: true, exchangeRate: 2, monthlyBurnUSD: 430000, maxPctOfBurn: 0.10 };
      // four claimed advisors, each with a $200K/yr cash grant (the post-claim shape)
      const board = dflt.advisors.map(a => ({ ...a, grants: [{ id: a.id + '-c', instrument: 'cash', round: 'bridge', valueUSD: 800000, curve: 'cert-v3', vestStartISO: '2026-06-01', lifecycle: 'granted' }] }));
      const b = ENG.computeBoard(board, planOn, dflt.tiers, dflt.objectives);
      return b.warnings.some(w => w.includes('burn')) && near(b.monthlyCash, (4 * 200000) / 12, 1);
    })());
}

// ---- T17: the lifecycle/domain spine (COM-155 — live-bound) ----
// Person fields · the Review entity (the growth-over-time primitive) · the extended doc-status
// vocabulary. Additive within SCHEMA 6 (only COM-171 bumps — the §4 ruling).
console.log('\nT17 · Lifecycle spine: person fields, reviews, doc statuses (COM-155):');
{
  const dflt = ENG.DEFAULT();
  A('DOC_STATUSES gains loi + promised (the Konrad/Saikat open-promise pattern; SCHEMA stays 6)',
    ENG.DOC_STATUSES.includes('loi') && ENG.DOC_STATUSES.includes('promised')
    && ENG.DOC_STATUSES.includes('signed') && ENG.SCHEMA === 6);
  A('CHECK_STATUSES / CONTRACTING_STRUCTURES / REVIEW_OUTCOMES are the named vocabularies',
    ENG.CHECK_STATUSES.join(',') === 'none,requested,clear,flagged'
    && ENG.CONTRACTING_STRUCTURES.join(',') === 'individual,entity'
    && ENG.REVIEW_OUTCOMES.join(',') === 'no-change,top-up,band-change,roll-off');
  A('round-trip: person fields survive; junk heals by DELETION (an unknown check never reads clear)',
    (() => {
      const rt = JSON.parse(JSON.stringify(dflt));
      rt.advisors[0].refereeName = 'Jane Doe'; rt.advisors[0].checkStatus = 'clear';
      rt.advisors[0].contracting = 'entity'; rt.advisors[0].contractEntity = 'Keller GmbH';
      rt.advisors[0].supervisor = 'Robin';
      rt.advisors[1].checkStatus = 'verified-ish'; rt.advisors[1].contracting = 42; rt.advisors[1].refereeName = '';
      const r = ENG.reconcile(rt);
      return r.advisors[0].refereeName === 'Jane Doe' && r.advisors[0].checkStatus === 'clear'
        && r.advisors[0].contracting === 'entity' && r.advisors[0].contractEntity === 'Keller GmbH'
        && r.advisors[0].supervisor === 'Robin'
        && r.advisors[1].checkStatus == null && r.advisors[1].contracting == null && r.advisors[1].refereeName == null;
    })());
  A('round-trip: reviews survive (trigger heals, outcome enum-guarded, duplicate ids dedupe, junk drops)',
    (() => {
      const rt = JSON.parse(JSON.stringify(dflt));
      rt.advisors[0].reviews = [
        { id: 'r1', scheduledISO: '2026-12-01', trigger: 'scheduled', inputs: 'objectives earned', outcome: 'top-up', approver: 'Robin', completedISO: '2026-12-05' },
        { id: 'r2', scheduledISO: '2027-06-01', trigger: 'sideways', outcome: 'promoted' },
        { id: 'r2', scheduledISO: '2027-06-02', trigger: 'event' },
        { id: 'junk' }, 'junk',
      ];
      rt.advisors[1].reviews = 'nope';
      const r = ENG.reconcile(rt);
      const rv = r.advisors[0].reviews;
      return rv.length === 2 && rv[0].outcome === 'top-up' && rv[0].completedISO === '2026-12-05'
        && rv[1].trigger === 'scheduled' && rv[1].outcome == null
        && r.advisors[1].reviews == null;
    })());
  A('plan.reviewCadenceMonths: default 12; junk/zero heals to 12; a custom cadence survives',
    (() => {
      const rt = JSON.parse(JSON.stringify(dflt));
      rt.plan.reviewCadenceMonths = 6;
      const r6 = ENG.reconcile(rt);
      rt.plan.reviewCadenceMonths = -3;
      const rBad = ENG.reconcile(rt);
      return dflt.plan.reviewCadenceMonths === 12 && r6.plan.reviewCadenceMonths === 6
        && rBad.plan.reviewCadenceMonths === 12;
    })());
  A('nextReviewDue: an OPEN review is due as scheduled (overdue when past)',
    (() => {
      const a = { ...dflt.advisors[0], reviews: [{ id: 'r', scheduledISO: '2026-01-15', trigger: 'scheduled' }] };
      const d = ENG.nextReviewDue(a, dflt.plan, '2026-06-10');
      return d.dueISO === '2026-01-15' && d.overdue === true && d.source === 'scheduled';
    })());
  A('nextReviewDue: the cadence runs from the LATEST completed review, else the engagement start',
    (() => {
      const a1 = { ...dflt.advisors[0], startDate: '2026-06-01', reviews: [] };
      const d1 = ENG.nextReviewDue(a1, dflt.plan, '2026-06-10');
      const a2 = { ...a1, reviews: [{ id: 'r', scheduledISO: '2026-12-01', trigger: 'scheduled', outcome: 'no-change', completedISO: '2026-12-05' }] };
      const d2 = ENG.nextReviewDue(a2, dflt.plan, '2026-12-10');
      const p6 = { ...dflt.plan, reviewCadenceMonths: 6 };
      const d3 = ENG.nextReviewDue(a1, p6, '2026-06-10');
      return d1.dueISO === '2027-06-01' && d1.source === 'cadence' && d1.overdue === false
        && d2.dueISO === '2027-12-05' && d3.dueISO === '2026-12-01';
    })());
  A('addMonthsUTC is TZ-free and junk-safe (month overflow folds; junk passes through)',
    ENG.addMonthsUTC('2026-01-31', 1) === '2026-03-03' || ENG.addMonthsUTC('2026-01-31', 1) === '2026-03-02'
      ? ENG.addMonthsUTC('junk', 6) === 'junk' && ENG.addMonthsUTC('2026-06-15', 12) === '2027-06-15'
      : false);
}

// ---- T18: the offer pipeline (COM-159 — live-bound) ----
console.log('\nT18 · Offer pipeline: stages + history (COM-159):');
{
  const dflt = ENG.DEFAULT();
  A('ADVISOR_STAGES is the F19 pipeline in order; advisorStage defaults ABSENT/junk to modeled',
    ENG.ADVISOR_STAGES.join(',') === 'modeled,proposed,iterating,referenced,offer-issued,signed,active,rolled-off'
    && ENG.advisorStage(dflt.advisors[0]) === 'modeled'
    && ENG.advisorStage({ ...dflt.advisors[0], stage: 'vibing' }) === 'modeled'
    && ENG.advisorStage({ ...dflt.advisors[0], stage: 'signed' }) === 'signed');
  A('round-trip: stage + history survive; junk stages/entries heal by deletion; docUrl http(s)-guarded',
    (() => {
      const rt = JSON.parse(JSON.stringify(dflt));
      rt.advisors[0].stage = 'offer-issued';
      rt.advisors[0].stageHistory = [
        { stage: 'proposed', atISO: '2026-06-01', note: 'straw-man via Iraj' },
        { stage: 'offer-issued', atISO: '2026-06-09', docUrl: 'https://docs.example/offer.pdf' },
        { stage: 'teleported', atISO: '2026-06-10' },
        { stage: 'signed', atISO: '2026-06-10', docUrl: 'javascript:alert(1)' },
        'junk', { atISO: '2026-06-11' },
      ];
      rt.advisors[1].stage = 'imaginary';
      const r = ENG.reconcile(rt);
      const h = r.advisors[0].stageHistory;
      return r.advisors[0].stage === 'offer-issued' && h.length === 3
        && h[0].note === 'straw-man via Iraj' && h[1].docUrl === 'https://docs.example/offer.pdf'
        && h[2].stage === 'signed' && h[2].docUrl == null
        && r.advisors[1].stage == null && ENG.advisorStage(r.advisors[1]) === 'modeled';
    })());
  A('the stage is PRESENTATION-ONLY: no money field moves when an advisor walks the pipeline',
    (() => {
      const a = dflt.advisors[0];
      const before = ENG.computeAdvisor(a, dflt.plan, dflt.tiers, dflt.objectives);
      const after = ENG.computeAdvisor({ ...a, stage: 'active', stageHistory: [{ stage: 'active', atISO: '2026-06-10' }] }, dflt.plan, dflt.tiers, dflt.objectives);
      return near(before.baseCaseTotal, after.baseCaseTotal, 1e-9) && near(before.cashAnnualEq ?? 0, after.cashAnnualEq ?? 0, 1e-9)
        && near(before.baseCaseCeil, after.baseCaseCeil, 1e-9);
    })());
}

// ---- T19: the seeded roster (COM-160 — live-bound) ----
console.log('\nT19 · Seeded roster: the Δ9 register as the fresh-board state (COM-160):');
{
  const dflt = ENG.DEFAULT();
  const seed = ENG.seedBoard();
  A('DEFAULT() is UNCHANGED — the v1 reference fixture stays the suite/anchor board (§7 cond. 1)',
    dflt.advisors.length === 4 && dflt.advisors[0].id === 'iraj'
    && dflt.advisors.every(a => a.stage == null)
    && dflt.advisors.map(a => a.id).join(',') === 'iraj,mk,kd,rr');
  A('seedBoard(): the Δ9 register — 3 CONFIRMED proposed · Iraj iterating · Carl/Rajesh modeled',
    (() => {
      const by = Object.fromEntries(seed.advisors.map(a => [a.id, a]));
      return seed.advisors.length === 6
        && by.iraj.stage === 'iterating'
        && by.rr.stage === 'proposed' && by.mk.stage === 'proposed' && by.kd.stage === 'proposed'
        && by.cb.stage === 'modeled' && by.rm.stage === 'modeled'
        && by.rr.name === 'Robert Reoch' && by.cb.name === 'Carl Bang' && by.rm.name === 'Rajesh Mehta';
    })());
  A('no cash for the three incoming; residency/check placeholders set; the XTX intro rides Kerim (targeted, $5M, bridge)',
    (() => {
      const by = Object.fromEntries(seed.advisors.map(a => [a.id, a]));
      const xtx = (by.kd.introductions || [])[0];
      return [by.rr, by.mk, by.kd].every(a => a.hasCash === false && a.checkStatus === 'none')
        && by.rr.taxResidency === 'UK' && by.mk.taxResidency === 'Other' && by.kd.taxResidency === 'UK'
        && xtx && xtx.id === 'xtx' && xtx.amountUSD === 5e6 && xtx.round === 'bridge' && xtx.status === 'targeted';
    })());
  A('the seed is reconciled v6 state: every advisor carries derived grants and computes finite money',
    seed.version === ENG.SCHEMA
    && seed.advisors.every(a => Array.isArray(a.grants) && a.grants.length && a.grants.every(g => g.derived === true))
    && seed.advisors.every(a => {
      const c = ENG.computeAdvisor(a, seed.plan, seed.tiers, seed.objectives);
      return Number.isFinite(c.baseCaseTotal) && c.baseCaseTotal > 0;
    }));
  A('the entity facts stand (A.1): ASEL t/a Raiku · Cayman · BL-411368',
    ENG.ENTITY.legalName === 'Ackermann Systems Engineering Ltd' && ENG.ENTITY.tradingAs === 'Raiku'
    && ENG.ENTITY.jurisdiction === 'Cayman Islands' && ENG.ENTITY.regNo === 'BL-411368');
}

// ---- T20: the Trajectory surface (COM-157 — live-bound) ----
console.log('\nT20 · Trajectory: the value band + dated events (COM-157):');
{
  const dflt = ENG.DEFAULT();
  const a0 = dflt.advisors[0];
  A('trajectoryBand: starts at zero · floor ≤ base ≤ ceil every month · monotone non-decreasing',
    (() => {
      const b = ENG.trajectoryBand(a0, dflt.plan, dflt.tiers, dflt.objectives);
      const startsZero = b[0].floor === 0 && b[0].base === 0 && b[0].ceil === 0;
      const ordered = b.every(p => p.floor <= p.base + 1e-9 && p.base <= p.ceil + 1e-9);
      const monotone = b.every((p, i) => i === 0 || (p.base >= b[i - 1].base - 1e-9 && p.ceil >= b[i - 1].ceil - 1e-9));
      return b.length === 49 && startsZero && ordered && monotone;
    })());
  A('trajectoryBand: the terminal month reconciles with computeAdvisor (base ≈ vested-complete package value)',
    (() => {
      const c = ENG.computeAdvisor(a0, dflt.plan, dflt.tiers, dflt.objectives);
      const b = ENG.trajectoryBand(a0, dflt.plan, dflt.tiers, dflt.objectives);
      const end = b[b.length - 1];
      // base at M48 = equity net (earned) + token leg + accrued cash — the base-case total's parts
      const expect = c.base.netEqAt(c.eqPct, c.base.exitVal)
        + (c.base.tokenAsEquity ? c.tkPct * c.base.retention * c.base.exitVal : c.tkPct * c.base.fdv)
        + (c.cashAnnualEq ?? 0) * c.years;
      return near(end.base, expect, 1);
    })());
  A('trajectoryBand: the token leg is GATED — at month 23 the band carries no token value yet (rta distributable 0)',
    (() => {
      const b = ENG.trajectoryBand(a0, dflt.plan, dflt.tiers, dflt.objectives);
      const c = ENG.computeAdvisor(a0, dflt.plan, dflt.tiers, dflt.objectives);
      const eq23 = ENG.vestedFrac(23, dflt.plan.equityVestYears, dflt.plan.equityCliff) * c.base.netEqAt(c.eqPct, c.base.exitVal);
      const cash23 = (c.cashAnnualEq ?? 0) * (23 / 12);
      return near(b[23].base, eq23 + cash23, 1);
    })());
  A('trajectoryEvents: start/cliff/qualifying/tranches/TGE/backstop all dated; sorted by month; backstop ≈ M108',
    (() => {
      const evs = ENG.trajectoryEvents(a0, dflt.plan, dflt.tiers, dflt.objectives, '2026-06-10');
      const kinds = evs.map(e => e.kind);
      const sorted = evs.every((e, i) => i === 0 || e.m >= evs[i - 1].m);
      const backstop = evs.find(e => e.kind === 'backstop');
      const cliff = evs.find(e => e.kind === 'cliff');
      const tranches = evs.filter(e => e.kind === 'tranche').length;
      // POSITION, not just presence — equityCliff is MONTHS (12), and the first render shipped
      // the cliff at m144 because a presence-only assertion let `cliff*12` through.
      return kinds.includes('start') && cliff && cliff.m === 12 && kinds.includes('qualifying')
        && kinds.includes('tge') && sorted && tranches === 3
        && backstop && backstop.m >= 107 && backstop.m <= 109;
    })());
  A('trajectoryEvents: an open review renders as scheduled; with none, the cadence projects review-due',
    (() => {
      const withReview = { ...a0, reviews: [{ id: 'r1', scheduledISO: '2027-01-15', trigger: 'scheduled' }] };
      const e1 = ENG.trajectoryEvents(withReview, dflt.plan, dflt.tiers, dflt.objectives, '2026-06-10');
      const e2 = ENG.trajectoryEvents(a0, dflt.plan, dflt.tiers, dflt.objectives, '2026-06-10');
      return e1.some(e => e.kind === 'review' && e.dateISO === '2027-01-15')
        && !e1.some(e => e.kind === 'review-due')
        && e2.some(e => e.kind === 'review-due');
    })());
}

// ---- T21: fundraising-event triggers (COM-162 — live-bound) ----
console.log('\nT21 · Round close: crystallise + re-price + trajectory events (COM-162):');
{
  const dflt = ENG.DEFAULT();
  A('crystalliseIntroductions: ONLY gated intros on the CLOSED round flip to earned; others untouched; pure',
    (() => {
      const advisors = JSON.parse(JSON.stringify(dflt.advisors));
      advisors[0].introductions = [
        { id: 'a', amountUSD: 5e6, round: 'seriesA', status: 'gated' },
        { id: 'b', amountUSD: 2e6, round: 'seriesB', status: 'gated' },
        { id: 'c', amountUSD: 1e6, round: 'seriesA', status: 'targeted' },
      ];
      const before = JSON.stringify(advisors);
      const { advisors: out, flipped } = ENG.crystalliseIntroductions(advisors, 'seriesA');
      const i = Object.fromEntries(out[0].introductions.map(x => [x.id, x.status]));
      return flipped === 1 && i.a === 'earned' && i.b === 'gated' && i.c === 'targeted'
        && JSON.stringify(advisors) === before; // purity — the input is untouched
    })());
  A('crystallisation MOVES MONEY: an earned intro raises the uplift that a gated one withheld',
    (() => {
      const planGate = JSON.parse(JSON.stringify(dflt.plan));
      const a = JSON.parse(JSON.stringify(dflt.advisors[0]));
      a.introductions = [{ id: 'x', amountUSD: 5e6, round: 'seriesA', status: 'gated' }];
      const cBefore = ENG.computeAdvisor(a, planGate, dflt.tiers, dflt.objectives);
      const { advisors: [a2] } = ENG.crystalliseIntroductions([a], 'seriesA');
      const cAfter = ENG.computeAdvisor(a2, planGate, dflt.tiers, dflt.objectives);
      return cAfter.baseCaseTotal > cBefore.baseCaseTotal && cAfter.capEarned > cBefore.capEarned;
    })());
  A('round-trip: closedISO survives reconcile; junk close dates heal by DELETION (never closed-at-junk)',
    (() => {
      const rt = JSON.parse(JSON.stringify(dflt));
      rt.plan.rounds = rt.plan.rounds.map(r => ({ ...r }));
      rt.plan.rounds[0].closedISO = '2026-06-10';
      rt.plan.rounds[1].closedISO = 'not-a-date';
      rt.plan.rounds[2].closedISO = 42;
      const r = ENG.reconcile(rt);
      return r.plan.rounds[0].closedISO === '2026-06-10'
        && r.plan.rounds[1].closedISO == null && r.plan.rounds[2].closedISO == null;
    })());
  A('trajectoryEvents: a CLOSED round is a dated event; open rounds never render',
    (() => {
      const plan = JSON.parse(JSON.stringify(dflt.plan));
      plan.rounds = plan.rounds.map(r => ({ ...r }));
      plan.rounds.find(r => r.id === 'seriesA').closedISO = '2027-06-01';
      const evs = ENG.trajectoryEvents({ ...dflt.advisors[0], startDate: '2026-06-01' }, plan, dflt.tiers, dflt.objectives, '2026-06-10');
      const closed = evs.find(e => e.id === 'round-seriesA');
      const openOnes = evs.filter(e => e.kind === 'round').length;
      return closed && closed.m === 12 && closed.label.includes('closed') && openOnes === 1;
    })());
  A('re-pricing is the stage lens: currentStage=seriesA prices a new grant at the Series A walk step',
    (() => {
      const plan = JSON.parse(JSON.stringify(dflt.plan));
      plan.currentStage = 'seriesA';
      const w = ENG.walkScenario(plan, ENG.baseScenKey(plan));
      const step = ENG.currentRoundStep(plan, w);
      return step.id === 'seriesA' && step.post === 120e6;
    })());
}

// ---- T22: proposition versioning (COM-164/Δ12 — live-bound) ----
console.log('\nT22 · Proposition versions: the straw-man trail (COM-164):');
{
  const dflt = ENG.DEFAULT();
  const a0 = dflt.advisors[0];
  A('makeProposition: figures match computeAdvisor at snapshot time; the package inputs are captured',
    (() => {
      const c = ENG.computeAdvisor(a0, dflt.plan, dflt.tiers, dflt.objectives);
      const v = ENG.makeProposition(a0, dflt.plan, dflt.tiers, dflt.objectives, 'pv1', 1, '2026-06-10', 'straw-man via Iraj');
      return v.version === 1 && v.scenKey === 'base' && v.note === 'straw-man via Iraj'
        && near(v.figures.baseCaseTotal, c.baseCaseTotal, 1e-9)
        && near(v.figures.baseCaseCeil, c.baseCaseCeil, 1e-9)
        && near(v.figures.strikePps, c.strikePps, 1e-9)
        && v.package.years === a0.years && v.package.splitOptions === a0.splitOptions;
    })());
  A('figures are FROZEN: a plan change moves the live compute but never the stored version',
    (() => {
      const v = ENG.makeProposition(a0, dflt.plan, dflt.tiers, dflt.objectives, 'pv1', 1, '2026-06-10');
      const cheaper = JSON.parse(JSON.stringify(dflt.plan));
      cheaper.scenarios.base.seriesC.post = 300e6;
      const cAfter = ENG.computeAdvisor(a0, cheaper, dflt.tiers, dflt.objectives);
      return Math.abs(cAfter.baseCaseTotal - v.figures.baseCaseTotal) > 1e5
        && near(v.figures.baseCaseTotal, 7665019.86, 1);
    })());
  A('round-trip: versions survive; junk versions drop; figures re-default numerically; sorted by version',
    (() => {
      const rt = JSON.parse(JSON.stringify(dflt));
      rt.advisors[0].propositions = [
        { id: 'b', version: 2, atISO: '2026-06-09', figures: { baseCaseTotal: 'NaN-ish' }, package: {} },
        { id: 'a', version: 1, atISO: '2026-06-01', scenKey: 'base', figures: { baseCaseTotal: 5e6 }, package: { years: 4 } },
        { id: 'junk', version: -1, atISO: '2026-06-02' },
        { id: 'a', version: 9, atISO: 'dup-id-drops' },
        'garbage', { version: 3 },
      ];
      rt.advisors[1].propositions = 'nope';
      const r = ENG.reconcile(rt);
      const pv = r.advisors[0].propositions;
      return pv.length === 2 && pv[0].version === 1 && pv[1].version === 2
        && pv[0].figures.baseCaseTotal === 5e6 && pv[1].figures.baseCaseTotal === 0
        && r.advisors[1].propositions == null;
    })());
}

console.log(`\n${pass} passed, ${fail} failed, ${pending} pending(v2).`);
process.exit(fail ? 1 : 0);
