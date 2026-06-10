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

// ---- T5: v2 API bindings (pending until the unfreeze — the target export surface) ----
console.log('\nT5 · v2 API parity (binds when the engine unfreezes — ENGINE_V2_RFC.md §4):');
P('walkScenario() FD counts equal T1 to the dollar (existing export, re-asserted against v2)');
P('vestedFracRTA(m) equals the T3 reference across months 0–60');
P('distributableFrac(grant, m, serviceMonths) applies the 24-month qualifying gate');
P('valueToQuantity(grant, scenario) equals the T4 reference, restated per scenario');
P('computeGrant() prices strike per GRANT (COM-144 multi-grant) — v1 prices one implicit grant per advisor');
P('modelDeparture(): Bad Leaver → vested+unvested options lapse, tokens forfeit (COM-153)');

console.log(`\n${pass} passed, ${fail} failed, ${pending} pending(v2).`);
process.exit(fail ? 1 : 0);
