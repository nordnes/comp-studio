// Raiku Advisory Comp Studio — pure engine (framework-agnostic, no React/Vue).
// This is the canonical maths: cap-table walk, net-of-strike valuation, scenario
// dilution, TGE-FDV multiplier, gating, channel capital, pools, roadmap CSV.
// Ported verbatim from the verified React artifact. Keep engine.test.mjs green.
// SPDX: internal — Raiku Labs (Ackermann Systems Engineering Ltd).

// ===== types =====
export interface RoundDef { id: string; label: string }
export interface RoundVals { post: number; raise: number; esop: number }
export interface Scenario { label: string; tgeMult: number; [roundId: string]: any }
export interface Tier { name: string; mult: number; days?: number }
export interface Milestone { id: string; label: string }
export interface Objective { id: string; category: 'capital' | 'customer' | 'partnership' | 'governance'; label: string; trigger: string; uplift: number; gate: string }
export interface Performance { capitalEquity?: number; capitalToken?: number; capitalIntroduced?: number; achieved: string[]; targeted: string[] }
// v2 (COM-144): the award unit — v1's implicit single grant becomes explicit and repeatable.
// `lifecycle` (COM-144/F19) and `docStatus` (the A.4 workbook "Status of docs" column) are TWO
// distinct status dimensions, never one enum (RFC §3, verified delta vs the issue text).
export type Instrument = 'option' | 'rta' | 'cash';
export const GRANT_LIFECYCLES = ['draft', 'loi', 'granted', 'exercised', 'lapsed'] as const;
export type GrantLifecycle = (typeof GRANT_LIFECYCLES)[number];
export const DOC_STATUSES = ['in-draft', 'sent', 'in-review', 'signed', 'cancelled'] as const;
export type DocStatus = (typeof DOC_STATUSES)[number];
export interface Grant {
  id: string;
  instrument: Instrument;
  round: string;                  // grant round id → prices strike/FMV off the walk
  valueUSD?: number;              // dollar-denominated entry (Δ1); quantity derivation = COM-150
  quantity?: number;              // options or tokens
  strikePps?: number;             // options: explicit strike; absent → the grant round's price
  curve: 'cert-v3' | 'rta';       // vesting curve (COM-145 wires the RTA monthly curve)
  vestStartISO: string;
  lifecycle: GrantLifecycle;
  docStatus?: DocStatus;
  docUrl?: string;                // the RTA/certificate link column from the workbook
}
export interface Advisor {
  id: string; name: string; sector: string; mode: 'tier' | 'value'; tier: number;
  years: number; splitOptions: number; annualValue: number; hasCash: boolean; cashAnnual: number;
  startDate: string; upliftStartMonth: number; grantRound: string; taxResidency: 'UK' | 'US' | 'Other';
  notes: string; performance: Performance;
  // PD2 (COM-82): optional per-advisor projection state — additive only, reconcile-normalised, no money path.
  caseOverride?: string; targetExit?: number;
  // v2 (COM-144): explicit grants. ABSENT → v1 implicit-package behaviour (the §5 shim);
  // reconcile() never materialises this (derive-don't-materialise, RFC D3).
  grants?: Grant[];
}
export interface Plan {
  fdPreESOP: number; tokenSupply: number;
  bridge: RoundVals; esopStart: number; esopCap: number;
  scenarios: Record<string, Scenario>; rounds: RoundDef[]; baseScenario: string;
  tgeAnchor: string; tgeDate: string; exitMultiple: number;
  baseGrant: { equityPct: number; tokenPct: number };
  advisorTokenPoolPct: number; committedAdvisorTokenPct: number; boardTokenBucketPct: number;
  capitalUplift: { per: number; pct: number; cap: number; gate: string };
  currentStage: string; cocAccelPct: number;
  equityVestYears: number; equityCliff: number; tokenVestYears: number; tokenCliff: number;
  milestones: Milestone[]; showBenchmarks: boolean;
  // v2 (COM-142): constitutional baseline — additive, SCHEMA stays 5; reconcile() defaults them.
  constitution?: Constitution; tokenPools?: TokenPool[]; advisorPoolShares?: number;
  // v2 (COM-143): saved scenario-set bundles; plan.scenarios stays the ACTIVE set (RFC §3).
  scenarioSets?: ScenarioSet[];
}

// A named bundle of per-round assumptions — the dilution workbook generalised (COM-143).
export interface ScenarioSet {
  id: string; label: string; starred?: boolean; note?: string;
  scenarios: Record<string, Scenario>; baseScenario: string;
}
export interface State { version: number; name: string; plan: Plan; tiers: Tier[]; objectives: Objective[]; advisors: Advisor[] }

// ===== guards & formatters =====
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const safeDiv = (a: number, b: number, fb = 0) => (b && isFinite(b) && isFinite(a) ? a / b : fb);
export const ok = (n: any): n is number => typeof n === 'number' && isFinite(n);
export const fUSD = (n: number, c = true): string => {
  if (!ok(n)) return '—'; if (Math.round(n) === 0) return '$0';
  const a = Math.abs(n);
  if (c) { if (a >= 1e9) return `$${(n / 1e9).toFixed(2)}B`; if (a >= 1e6) return `$${(n / 1e6).toFixed(a >= 1e7 ? 1 : 2)}M`; if (a >= 1e3) return `$${(n / 1e3).toFixed(0)}K`; return `$${Math.round(n)}`; }
  return `$${Math.round(n).toLocaleString('en-US')}`;
};
export const fPct = (n: number, d = 2) => (ok(n) ? `${(n * 100).toFixed(d)}%` : '—');
export const fNum = (n: number) => (ok(n) ? Math.round(n).toLocaleString('en-US') : '—');
export const fMult = (n: number) => (ok(n) ? `${(Math.round(n * 100) / 100).toString()}×` : '—');
export const fTok = (n: number) => { if (!ok(n)) return '—'; const a = Math.abs(n); if (a >= 1e9) return `${(n / 1e9).toFixed(2)}B`; if (a >= 1e6) return `${(n / 1e6).toFixed(1)}M`; if (a >= 1e3) return `${(n / 1e3).toFixed(0)}K`; return `${Math.round(n)}`; };
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const monthsBetween = (aISO: string, bISO: string) => { const a = new Date(aISO), b = new Date(bISO); if (isNaN(+a) || isNaN(+b)) return 0; return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()); };
export const addMonthsISO = (iso: string, n: number) => { const d = new Date(iso); if (isNaN(+d)) return iso; d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10); };
export const fDate = (iso: string) => { const d = new Date(iso); if (isNaN(+d)) return '—'; return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); };

// ===== dynamic round/scenario helpers =====
export const roundList = (plan: Plan) => ['bridge', ...(((plan && plan.rounds) || []).map(r => r.id))];
export const roundLabel = (plan: Plan, id: string) => id === 'bridge' ? 'Bridge' : ((((plan && plan.rounds) || []).find(r => r.id === id) || ({} as RoundDef)).label || id);
export const scenKeys = (plan: Plan) => Object.keys((plan && plan.scenarios) || {});
export const baseScenKey = (plan: Plan) => (plan && plan.baseScenario && plan.scenarios[plan.baseScenario]) ? plan.baseScenario : scenKeys(plan)[0];
// SCEN_COLORS moved OUT to constants.ts (presentation palette) per COM-56 — engine stays money-only.

// ===== industry benchmarks (researched, 2025 medians) =====
export const BENCH = {
  postMoney: { bridge: 24e6, seriesA: 79e6, seriesB: 150e6, seriesC: 300e6 } as Record<string, number>,
  postMoneySrc: 'Carta State of Pre-Seed 2025 · ValueAdd VC 2025 round benchmarks',
  fdvCaution: 1e9,
  fdvSrc: 'Memento Research / The Defiant; MEXC — 2025 TGE performance',
  advisorEquity: {
    standard: { lo: 0.0015, hi: 0.0025, label: 'Standard · ~5 hrs/mo' },
    strategic: { lo: 0.0030, hi: 0.0050, label: 'Strategic · ~10 hrs/mo' },
    expert: { lo: 0.0060, hi: 0.0100, label: 'Expert · ~20 hrs/mo' },
  } as Record<string, { lo: number; hi: number; label: string }>,
  advisorPool: 0.05,
  advisorSrc: 'Founder Institute FAST matrix; ~5% advisory-pool norm (2025)',
};
export const benchLevelForTier = (ti: number) => (ti >= 2 ? 'expert' : ti === 1 ? 'strategic' : 'standard');

export const SCHEMA = 5;

// ===== v2: constitutional baseline (COM-142 — spec v2 Δ8 · Part 10 #8 · Appendix A.1/A.2/A.4) =====
// Entity facts (A.1) — constants, not state; Configure surfaces them read-only.
export const ENTITY = {
  legalName: 'Ackermann Systems Engineering Ltd', tradingAs: 'Raiku',
  jurisdiction: 'Cayman Islands', regNo: 'BL-411368',
} as const;

export interface Constitution { authorised: number; issued: number; poolAvailable: number }
export interface TokenPool { id: string; label: string; poolPct: number; allocatedPct: number; note?: string }

// Authorised 50,000 · issued 37,550 (Robin sole holder) · 12,450 cancelled-and-available
// (Rousseau repurchase, 30 Apr 2026, art. 48).
export const CONSTITUTION_DEFAULT: Constitution = { authorised: 50000, issued: 37550, poolAvailable: 12450 };

// Live FD with SAFEs as-converted (A.2) — the composition behind fdPreESOP's 48,316.78 default.
export const FD_COMPOSITION = [
  { id: 'robin', label: 'Robin A. Nordnes (sole holder)', shares: 37550 },
  { id: 'preseed', label: 'Pre-seed SAFEs @ $25m cap (share-equivalents)', shares: 4519 },
  { id: 'pantera', label: 'Pantera SAFE @ $90m', shares: 4444.44 },
  { id: 'seed', label: 'Other seed SAFEs', shares: 1803.34 },
] as const;

// Token pools seeded from the live allocation state (A.4). Advisors headroom 1.82552% is the
// binding constraint on new advisor token awards (open decision #5 — sourcing stays open).
export const TOKEN_POOLS_DEFAULT: TokenPool[] = [
  { id: 'team', label: 'Team', poolPct: 0.20, allocatedPct: 0.127316 },
  { id: 'advisors', label: 'Advisors', poolPct: 0.05, allocatedPct: 0.0317448, note: 'Headroom is the binding constraint on new advisor token awards (open decision #5)' },
  { id: 'investors', label: 'Investors', poolPct: 0.20, allocatedPct: 0.177189 },
  { id: 'cex', label: 'CEX', poolPct: 0.20, allocatedPct: 0, note: "The 10% figure is Coinbase's screening quote, not an allocation" },
];
export const tokenPoolHeadroom = (p: TokenPool) => Math.max(0, p.poolPct - p.allocatedPct);

// Pool-sizing presets (open decision #1 stays open — BOTH selectable; D2 printed-figure-wins).
// printed = the workbook cell; the 15% cell prints ~3.5 shares short of its own arithmetic
// (0.15/0.85 × 48,316.78 = 8,526.49) — display the printed figure with the recomputed footnote (RFC §9).
export const POOL_PRESETS = [
  { id: 'pool10', label: '10% of post-pool FD', pct: 0.10, printed: 5368 },
  { id: 'pool15', label: '15% of post-pool FD', pct: 0.15, printed: 8523 },
] as const;
export const poolSharesExact = (plan: Plan, pct: number) => safeDiv(pct * plan.fdPreESOP, 1 - pct);

// Rule 13.10 Constitutional Limit guardrail: the advisor option pool must stay within the
// cancelled-and-available headroom AND authorised − issued. Warn at ≥90% of the cap
// (prompt-set default threshold); hard-warn at breach per 13.10(b). A compliance guardrail
// fails CLOSED: a non-finite cap (corrupt constitution) grades as breach, never 'ok'.
export function poolGuardrail(plan: Plan) {
  const c = plan.constitution || CONSTITUTION_DEFAULT;
  const poolShares = Math.max(0, ok(plan.advisorPoolShares) ? plan.advisorPoolShares : POOL_PRESETS[0].printed);
  const cap = Math.min(c.poolAvailable, Math.max(0, c.authorised - c.issued));
  const level: 'ok' | 'near' | 'breach' = !isFinite(cap) ? 'breach'
    : poolShares > cap + 1e-9 ? 'breach'
    : (cap > 1e-9 && poolShares >= 0.9 * cap - 1e-9) ? 'near' : 'ok';
  const msg = level === 'breach'
    ? `Pool ${fNum(poolShares)} exceeds the Constitutional Limit of ${fNum(cap)} available shares (Rule 13.10(b))`
    : level === 'near'
      ? `Pool ${fNum(poolShares)} is within 10% of the Constitutional Limit (${fNum(cap)} available — Rule 13.10)`
      : '';
  return { level, poolShares, cap, headroom: cap - poolShares, msg };
}
export const SECTORS = [
  'Asset Management — Hedge Funds & Family Offices', 'Asset Management — Sovereign Wealth & Endowments',
  'Technology & FinTech', 'Capital Markets — Credit, Structured & Digital',
  'Payments & FX — Transaction Banking', 'Infrastructure', 'Legal & Governance',
];

// ===== default state (reconciles to the Raiku dilution model) =====
export const DEFAULT = (): State => ({
  version: SCHEMA, name: 'Advisory board — working draft',
  plan: {
    fdPreESOP: 48316.78, tokenSupply: 10e9,
    bridge: { post: 90e6, raise: 5e6, esop: 0.10 }, esopStart: 0.10, esopCap: 0.20,
    scenarios: {
      conservative: { label: 'Conservative', seriesA: { post: 100e6, raise: 20e6, esop: 0.10 }, seriesB: { post: 150e6, raise: 40e6, esop: 0.15 }, seriesC: { post: 300e6, raise: 80e6, esop: 0.20 }, tgeMult: 2 },
      base: { label: 'Base', seriesA: { post: 120e6, raise: 20e6, esop: 0.15 }, seriesB: { post: 300e6, raise: 40e6, esop: 0.15 }, seriesC: { post: 500e6, raise: 80e6, esop: 0.20 }, tgeMult: 5 },
      aggressive: { label: 'Aggressive', seriesA: { post: 150e6, raise: 20e6, esop: 0.15 }, seriesB: { post: 500e6, raise: 40e6, esop: 0.20 }, seriesC: { post: 750e6, raise: 80e6, esop: 0.20 }, tgeMult: 12 },
    },
    rounds: [{ id: 'seriesA', label: 'Series A' }, { id: 'seriesB', label: 'Series B' }, { id: 'seriesC', label: 'Series C' }],
    baseScenario: 'base', tgeAnchor: 'seriesA', tgeDate: '2027-06-30', exitMultiple: 2,
    baseGrant: { equityPct: 0.005, tokenPct: 0.003 },
    advisorTokenPoolPct: 0.05, committedAdvisorTokenPct: 0.0317, boardTokenBucketPct: 0.045,
    capitalUplift: { per: 1e6, pct: 0.10, cap: 1.0, gate: 'bridge' },
    currentStage: 'bridge', cocAccelPct: 0,
    equityVestYears: 4, equityCliff: 12, tokenVestYears: 3, tokenCliff: 12,
    milestones: [
      { id: 'bridge', label: 'Bridge close' }, { id: 'mainnet', label: 'Public mainnet' },
      { id: 'seriesA', label: 'Series A close' }, { id: 'tge', label: 'TGE' },
    ],
    showBenchmarks: true,
    constitution: { ...CONSTITUTION_DEFAULT },
    tokenPools: TOKEN_POOLS_DEFAULT.map(p => ({ ...p })),
    advisorPoolShares: POOL_PRESETS[0].printed,
    scenarioSets: [],
  },
  tiers: [{ name: 'Base', mult: 1, days: 1 }, { name: 'Strategic', mult: 2, days: 2 }, { name: 'Anchor', mult: 3, days: 3 }],
  objectives: [
    { id: 'cap-anchor', category: 'capital', label: 'Anchor ticket', trigger: 'Personal or family-office ticket ≥$1M into the round (≈20% of bridge)', uplift: 0.50, gate: 'bridge' },
    { id: 'cap-intro', category: 'capital', label: 'Capital introduction', trigger: 'Introduction closing ≥$5M (a full bridge / ~25% of Series A)', uplift: 0.40, gate: 'bridge' },
    { id: 'cust-partner', category: 'customer', label: 'Design partner', trigger: '≥$250K ARR or a Tier-1 institutional design partner', uplift: 0.30, gate: 'mainnet' },
    { id: 'part-mandate', category: 'partnership', label: 'Strategic mandate', trigger: 'Sovereign / family-office mandate, MM LP, or stablecoin distribution', uplift: 0.30, gate: 'mainnet' },
    { id: 'gov-engaged', category: 'governance', label: 'Sustained governance', trigger: '12-month engagement in a named working group', uplift: 0.20, gate: 'seriesA' },
  ],
  advisors: [
    { id: 'iraj', name: 'Iraj Ispahani', sector: SECTORS[0], mode: 'tier', tier: 2, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: '2026-06-01', upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'UK', notes: 'Board chair · CEO Ispahani Advisory; ex-JP Morgan (Global COO, FIG) & Korn/Ferry. Family-office / wealth-owner network + governance. (Confirm tier & any cash.)', performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ['cap-anchor', 'gov-engaged'] } },
    { id: 'mk', name: 'Martin Keller', sector: SECTORS[0], mode: 'tier', tier: 1, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: '2026-06-01', upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'Other', notes: 'Family-office distribution; hedge-fund credibility.', performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ['cap-intro'] } },
    { id: 'kd', name: 'Kerim Derhalli', sector: SECTORS[2], mode: 'tier', tier: 1, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: '2026-06-01', upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'Other', notes: 'Fintech product & Tether/Turing network.', performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ['cust-partner'] } },
    { id: 'rr', name: 'Robert Reoch', sector: SECTORS[3], mode: 'tier', tier: 1, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: '2026-06-01', upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'Other', notes: 'Credit, structured & digital markets; bank intros (UBS).', performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ['part-mandate'] } },
  ],
});

export function reconcile(l: any): State {
  const d = DEFAULT();
  if (!l || typeof l !== 'object') return d;
  const p = l.plan || {};
  const srcScn = p.scenarios && Object.keys(p.scenarios).length ? p.scenarios : d.plan.scenarios;
  const scn: Record<string, Scenario> = {};
  Object.keys(srcScn).forEach(k => { scn[k] = { label: k, tgeMult: 1, ...(d.plan.scenarios[k] || {}), ...(srcScn[k] || {}) }; });
  const rounds = Array.isArray(p.rounds) && p.rounds.length ? p.rounds : d.plan.rounds;
  const baseScenario = (p.baseScenario && scn[p.baseScenario]) ? p.baseScenario : (scn.base ? 'base' : Object.keys(scn)[0]);
  let tiers = Array.isArray(l.tiers) && l.tiers.length ? l.tiers : d.tiers;
  tiers = tiers.map((t: any, i: number) => ({ name: t.name ?? `Tier ${i + 1}`, mult: t.mult ?? (i + 1), days: t.days ?? 1 }));
  return {
    ...d, ...l, version: SCHEMA,
    plan: {
      ...d.plan, ...p,
      bridge: { ...d.plan.bridge, ...(p.bridge || {}) },
      baseGrant: { ...d.plan.baseGrant, ...(p.baseGrant || {}) },
      capitalUplift: { ...d.plan.capitalUplift, ...(p.capitalUplift || {}) },
      milestones: p.milestones || d.plan.milestones,
      scenarios: scn, rounds, baseScenario,
      // v2 (COM-142): id-keyed deep-defaults — saved edits survive, new defaults auto-appear.
      // numOr sanitizes every numeric at this trust boundary (the guardrail consumes these;
      // junk/negative persisted values must re-default, never reach Rule 13.10 arithmetic).
      ...(() => {
        const numOr = (v: any, fb: number) => (ok(v) && v >= 0 ? v : fb);
        const sc: any = (p.constitution && typeof p.constitution === 'object') ? p.constitution : {};
        const saved: any[] = Array.isArray(p.tokenPools) ? p.tokenPools : [];
        const byId = Object.fromEntries(saved.filter(t => t && typeof t === 'object' && t.id).map(t => [t.id, t]));
        const tokenPools = TOKEN_POOLS_DEFAULT.map(t => {
          const s = byId[t.id] || {};
          return { ...t, ...s, poolPct: numOr(s.poolPct, t.poolPct), allocatedPct: numOr(s.allocatedPct, t.allocatedPct) };
        });
        const known = new Set(tokenPools.map(t => t.id));
        saved.forEach(t => { if (t && typeof t === 'object' && t.id && !known.has(t.id)) tokenPools.push({ ...t, label: t.label ?? t.id, poolPct: numOr(t.poolPct, 0), allocatedPct: numOr(t.allocatedPct, 0) }); });
        // COM-143: saved sets — drop malformed entries; sanitize every cell numeric at this trust
        // boundary (sets get ACTIVATED into the money walk via planWithSet, so junk here is junk
        // in the walk); keep unknown fields (...s) so newer payloads round-trip loss-free;
        // baseScenario must name an OWN scenario of its set (prototype keys don't count).
        const scenarioSets = (Array.isArray(p.scenarioSets) ? p.scenarioSets : [])
          .filter((s: any) => s && typeof s === 'object' && s.id && s.scenarios
            && typeof s.scenarios === 'object' && !Array.isArray(s.scenarios))
          .map((s: any) => {
            const sScn: Record<string, Scenario> = {};
            Object.keys(s.scenarios).forEach(k => {
              const src = s.scenarios[k];
              if (!src || typeof src !== 'object' || Array.isArray(src)) return;
              const cell: any = { ...src, label: typeof src.label === 'string' && src.label ? src.label : k, tgeMult: numOr(src.tgeMult, 1) };
              Object.keys(cell).forEach(rk => {
                const rc = cell[rk];
                if (rc && typeof rc === 'object' && !Array.isArray(rc) && ('post' in rc || 'raise' in rc || 'esop' in rc)) {
                  cell[rk] = { ...rc, post: numOr(rc.post, 0), raise: numOr(rc.raise, 0), esop: clamp(numOr(rc.esop, 0), 0, 1) };
                }
              });
              sScn[k] = cell;
            });
            if (!Object.keys(sScn).length) return null;
            const out: any = {
              ...s, id: String(s.id),
              label: typeof s.label === 'string' && s.label ? s.label : String(s.id),
              starred: !!s.starred, scenarios: sScn,
              baseScenario: (typeof s.baseScenario === 'string' && Object.prototype.hasOwnProperty.call(sScn, s.baseScenario)) ? s.baseScenario : Object.keys(sScn)[0],
            };
            if (typeof out.note !== 'string' || !out.note) delete out.note;
            return out;
          })
          .filter(Boolean);
        return {
          constitution: {
            authorised: numOr(sc.authorised, CONSTITUTION_DEFAULT.authorised),
            issued: numOr(sc.issued, CONSTITUTION_DEFAULT.issued),
            poolAvailable: numOr(sc.poolAvailable, CONSTITUTION_DEFAULT.poolAvailable),
          },
          tokenPools,
          advisorPoolShares: numOr(p.advisorPoolShares, d.plan.advisorPoolShares as number),
          scenarioSets,
        };
      })(),
    },
    tiers,
    objectives: Array.isArray(l.objectives) ? l.objectives : d.objectives,
    advisors: Array.isArray(l.advisors) ? l.advisors.map((a: any) => {
      const pf: Performance = { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: [], ...(a.performance || {}) };
      if (a.performance && a.performance.capitalIntroduced != null && a.performance.capitalEquity == null && a.performance.capitalToken == null) pf.capitalEquity = a.performance.capitalIntroduced;
      const adv = { name: 'Advisor', sector: SECTORS[0], mode: 'tier', tier: 0, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: todayISO(), upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'Other', notes: '', ...a, performance: pf };
      if (adv.caseOverride != null && !scn[adv.caseOverride]) delete adv.caseOverride;
      if (adv.targetExit != null && !ok(adv.targetExit)) delete adv.targetExit;
      // v2 (COM-144): sanitize EXPLICIT grants when present; never materialise them (RFC D3).
      // Trust boundary: numerics re-default via ok(), enums heal, docUrl must be http(s).
      if (Array.isArray(a.grants)) {
        adv.grants = a.grants
          .filter((g: any) => g && typeof g === 'object' && g.id && ['option', 'rta', 'cash'].includes(g.instrument))
          .map((g: any) => {
            const out: any = {
              ...g, id: String(g.id), instrument: g.instrument,
              round: typeof g.round === 'string' && g.round ? g.round : 'bridge',
              curve: g.curve === 'rta' || (g.curve == null && g.instrument === 'rta') ? 'rta' : 'cert-v3',
              vestStartISO: typeof g.vestStartISO === 'string' && g.vestStartISO ? g.vestStartISO : adv.startDate,
              // Money-bearing enum heals fail-CLOSED: an ABSENT lifecycle defaults to 'draft'
              // (modeling intent), but a present-yet-unknown value (e.g. the docStatus
              // 'cancelled' confusion) heals to 'lapsed' — never silently back into the totals.
              lifecycle: (GRANT_LIFECYCLES as readonly string[]).includes(g.lifecycle) ? g.lifecycle
                : (g.lifecycle == null ? 'draft' : 'lapsed'),
            };
            if (!(ok(g.valueUSD) && g.valueUSD >= 0)) delete out.valueUSD;
            if (!(ok(g.quantity) && g.quantity >= 0)) delete out.quantity;
            // strikePps 0 is a legitimate nil-cost option — the sanitizer must accept what
            // computeGrant prices, or a save/reload silently re-prices the grant (review finding).
            if (!(ok(g.strikePps) && g.strikePps >= 0)) delete out.strikePps;
            if (!(DOC_STATUSES as readonly string[]).includes(g.docStatus)) delete out.docStatus;
            if (!(typeof g.docUrl === 'string' && /^https?:\/\//i.test(g.docUrl))) delete out.docUrl;
            return out;
          });
      } else if ('grants' in adv) {
        delete adv.grants;
      }
      return adv;
    }) : d.advisors,
  };
}

// ===== roadmap CSV (import/export) =====
// Columns: scope,round,postMoney,raise,esopPct,tgeMult ; scope=bridge|scenario ; round=bridge|roundId
export function parseRoadmapCSV(text: string, plan: Plan) {
  const out: any = { scenarios: {} };
  const num = (s: any) => { const v = parseFloat(String(s).replace(/[^0-9.\-]/g, '')); return isNaN(v) ? null : v; };
  const pct = (s: any) => { const v = num(s); return v == null ? null : (v > 1 ? v / 100 : v); };
  const norm = (s: any) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const scenByNorm: Record<string, string> = {}, roundByNorm: Record<string, string> = {};
  scenKeys(plan).forEach(k => { scenByNorm[norm(k)] = k; scenByNorm[norm(plan.scenarios[k].label)] = k; });
  (plan.rounds || []).forEach(rd => { roundByNorm[norm(rd.id)] = rd.id; roundByNorm[norm(rd.label)] = rd.id; });
  String(text).split(/\r?\n/).map(l => l.split(',').map(c => c.trim())).forEach(r => {
    const scopeRaw = norm(r[0]); if (!scopeRaw || scopeRaw === 'scope') return;
    const post = num(r[2]), raise = num(r[3]), esop = pct(r[4]), tge = num(r[5]);
    if (scopeRaw === 'bridge') { out.bridge = out.bridge || {}; if (post != null) out.bridge.post = post; if (raise != null) out.bridge.raise = raise; if (esop != null) out.esopStart = esop; return; }
    const sk = scenByNorm[scopeRaw]; if (!sk) return;
    out.scenarios[sk] = out.scenarios[sk] || {};
    const rid = roundByNorm[norm(r[1])];
    if (rid) { out.scenarios[sk][rid] = {}; if (post != null) out.scenarios[sk][rid].post = post; if (raise != null) out.scenarios[sk][rid].raise = raise; if (esop != null) out.scenarios[sk][rid].esop = esop; }
    if (tge != null) out.scenarios[sk].tgeMult = tge;
  });
  return out;
}
export function roadmapToCSV(plan: Plan) {
  const rows: any[][] = [['scope', 'round', 'postMoney', 'raise', 'esopPct', 'tgeMult']];
  rows.push(['bridge', 'bridge', plan.bridge.post, plan.bridge.raise, plan.esopStart, '']);
  Object.keys(plan.scenarios).forEach(k => (plan.rounds || []).forEach((rd, ri) => { const r = plan.scenarios[k][rd.id]; if (!r) return; rows.push([k, rd.id, r.post, r.raise, r.esop, ri === 0 ? plan.scenarios[k].tgeMult : '']); }));
  return rows.map(r => r.join(',')).join('\n');
}

// ===== v2: scenario sets (COM-143 — spec v2 Part 6 · Δ3 · Appendix A.3) =====
// The A.3 methodology notes, engine-canonical and VERBATIM into any UI that walks the cap table.
export const METHOD_NOTES = [
  'Pre-money pool shuffle at every round — ESOP creation and new money both dilute pre-money holders.',
  'ESOP top-up sized to hit the target % post-money; no top-up if already above.',
  'Bridge modeled as converted preferred at the bridge post-money cap.',
  'Pantera as a discrete row, converted in line with the cap.',
  "Robin's share count is fixed across all scenarios — only the percentage declines.",
  'Anti-dilution, warrants, secondary and MFN are not modeled — real outcomes will differ.',
] as const;

export const setList = (plan: Plan): ScenarioSet[] => (plan && plan.scenarioSets) || [];
const hasOwn = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
// Non-mutating: the plan with a saved set made ACTIVE. The set's scenarios are DEEP-COPIED in —
// in-place edits to the active map must never rewrite the saved bundle (capture is also a deep
// copy; activation has to be symmetric or the snapshot guarantee is one-way only).
export function planWithSet(plan: Plan, setId: string): Plan {
  const s = setList(plan).find(x => x.id === setId);
  if (!s) return plan;
  const scenarios = JSON.parse(JSON.stringify(s.scenarios));
  const baseScenario = hasOwn(scenarios, s.baseScenario) ? s.baseScenario : Object.keys(scenarios)[0];
  return { ...plan, scenarios, baseScenario };
}
// Capture the ACTIVE scenarios as a saved set (deep copy — later edits don't leak in).
export const makeScenarioSet = (id: string, label: string, plan: Plan): ScenarioSet => ({
  id, label, scenarios: JSON.parse(JSON.stringify(plan.scenarios)), baseScenario: baseScenKey(plan),
});

// ===== cap-table walk =====
// Fixed bridge for all scenarios; scenarios diverge from the first round.
// N_k = (N_{k-1} − ESOP_{k-1}) / (1 − raise_k/post_k − esop_k); ESOP_k = esop_k × N_k.
export function walkScenario(plan: Plan, scenKey: string) {
  const s = plan.scenarios[scenKey];
  const bridgeEsop = plan.esopStart ?? plan.bridge.esop ?? 0.10;
  const steps: any[] = [];
  const bPost = plan.bridge.post, bRaise = plan.bridge.raise;
  const N1 = plan.fdPreESOP / (1 - safeDiv(bRaise, bPost) - bridgeEsop);
  let prevN = N1, prevEsop = bridgeEsop * N1;
  steps.push({ id: 'bridge', label: 'Bridge', post: bPost, esopPct: bridgeEsop, N: N1, esopShares: prevEsop, price: bPost / N1 });
  (plan.rounds || []).forEach(rd => {
    const r = s[rd.id]; if (!r) return;
    const N = (prevN - prevEsop) / (1 - safeDiv(r.raise, r.post) - r.esop);
    const esopSh = r.esop * N;
    steps.push({ id: rd.id, label: rd.label, post: r.post, esopPct: r.esop, N, esopShares: esopSh, price: r.post / N });
    prevN = N; prevEsop = esopSh;
  });
  const byId = Object.fromEntries(steps.map(st => [st.id, st]));
  return { steps, byId, exit: steps[steps.length - 1] };
}

// COM-143: the composed walk — the workbook's "base prior" column. Each round may take its cell
// from a DIFFERENT scenario (cellOverrides[roundId] = scenKey), so any walk can re-base on any
// prior cell. Implements the A.3 notes verbatim, including note 2's no-top-up branch: when the
// carried pool already meets the round's target % post-money, no new ESOP shares are created
// (v1 walkScenario stays byte-identical — T1 pins it; on an all-top-up path the two walks agree).
export function walkComposed(plan: Plan, scenKey: string, cellOverrides: Record<string, string> = {}) {
  const bridgeEsop = plan.esopStart ?? plan.bridge.esop ?? 0.10;
  const steps: any[] = [];
  const N1 = plan.fdPreESOP / (1 - safeDiv(plan.bridge.raise, plan.bridge.post) - bridgeEsop);
  let prevN = N1, prevEsop = bridgeEsop * N1;
  steps.push({ id: 'bridge', label: 'Bridge', post: plan.bridge.post, esopPct: bridgeEsop, N: N1, esopShares: prevEsop, price: plan.bridge.post / N1, cellFrom: 'bridge', topUp: true });
  (plan.rounds || []).forEach(rd => {
    // Resolve the effective cell source ONCE: an override only applies when that scenario exists
    // AND carries this round's cell; otherwise fall back to scenKey's cell. cellFrom reports what
    // was actually used — provenance must never name a cell the maths didn't take.
    const ovKey = cellOverrides[rd.id];
    const ovHasCell = !!(ovKey && hasOwn(plan.scenarios, ovKey) && (plan.scenarios[ovKey] as any)[rd.id]);
    const from = ovHasCell ? ovKey : scenKey;
    const r = (plan.scenarios[from] || ({} as Scenario))[rd.id]; if (!r) return;
    const noTopUpN = safeDiv(prevN, 1 - safeDiv(r.raise, r.post));
    const topUp = safeDiv(prevEsop, noTopUpN) < r.esop - 1e-12;
    const N = topUp ? (prevN - prevEsop) / (1 - safeDiv(r.raise, r.post) - r.esop) : noTopUpN;
    const esopSh = topUp ? r.esop * N : prevEsop;
    steps.push({ id: rd.id, label: rd.label, post: r.post, esopPct: safeDiv(esopSh, N), N, esopShares: esopSh, price: safeDiv(r.post, N), cellFrom: from, topUp });
    prevN = N; prevEsop = esopSh;
  });
  const byId = Object.fromEntries(steps.map(st => [st.id, st]));
  return { steps, byId, exit: steps[steps.length - 1] };
}

// ===== engine =====
export const stageIdx = (plan: Plan, id: string) => { const i = (plan.milestones || []).findIndex(m => m.id === id); return i < 0 ? 0 : i; };
export const stageReached = (plan: Plan, gateId: string) => stageIdx(plan, gateId) <= stageIdx(plan, plan.currentStage);

export function tgeFdvFor(plan: Plan, scenKey: string, walk: any) {
  const s = plan.scenarios[scenKey];
  const anchor = walk.byId[plan.tgeAnchor] || walk.exit;
  return (s.tgeMult || 1) * (anchor?.post || 0);
}

// v2 (COM-144): plan.currentStage is a MILESTONE id ('mainnet'/'tge' are not rounds) — a raw
// walk.byId[currentStage] lookup silently regresses to bridge past Series A. The most-recent
// ROUND at the current stage = the last walk step whose id is a milestone at/before currentStage.
export function currentRoundStep(plan: Plan, walk: any) {
  const curIdx = stageIdx(plan, plan.currentStage);
  let step = walk.byId.bridge || walk.steps[0];
  for (const st of walk.steps) {
    const mi = (plan.milestones || []).findIndex(m => m.id === st.id);
    if (mi >= 0 && mi <= curIdx) step = st;
  }
  return step;
}

// v2 (COM-144): per-grant pricing off the grant's round. Strike = the round's price/share unless
// the grant carries an explicit strikePps. FMV per Cert v3 cl. 4.5(c): exit consideration at an
// Exit Event (exit price/share), else the most-recent-grant methodology — the price at the plan's
// current stage in this scenario's walk. Net of strike, always. Quantity derivation from
// valueUSD is COM-150; until then an option/rta grant prices its explicit quantity (absent → 0).
export function computeGrant(grant: Grant, plan: Plan, scenKey: string) {
  const w = walkScenario(plan, scenKey);
  const round = w.byId[grant.round] || w.byId.bridge;
  const exit = w.exit;
  const lapsed = grant.lifecycle === 'lapsed';
  if (grant.instrument === 'cash') {
    const value = lapsed ? 0 : (ok(grant.valueUSD) ? grant.valueUSD : 0);
    return { id: grant.id, instrument: 'cash' as Instrument, round: grant.round, roundLabel: roundLabel(plan, grant.round), quantity: null, strikePps: null, fmvPps: null, exitPps: null, exerciseCost: 0, stepUp: null, value, netAtExit: value, underwater: false, lapsed };
  }
  if (grant.instrument === 'rta') {
    const qty = lapsed ? 0 : (ok(grant.quantity) ? grant.quantity : 0);
    const tokenPps = safeDiv(tgeFdvFor(plan, scenKey, w), plan.tokenSupply);
    const value = qty * tokenPps;
    return { id: grant.id, instrument: 'rta' as Instrument, round: grant.round, roundLabel: roundLabel(plan, grant.round), quantity: qty, strikePps: null, fmvPps: tokenPps, exitPps: null, exerciseCost: 0, stepUp: null, tokenPps, value, netAtExit: value, underwater: false, lapsed };
  }
  const strikePps = ok(grant.strikePps) ? grant.strikePps : round.price;
  const qty = lapsed ? 0 : (ok(grant.quantity) ? grant.quantity : 0);
  const exitPps = safeDiv(exit.post, exit.N);
  const fmvPps = currentRoundStep(plan, w).price;
  const netAtExit = Math.max(0, qty * (exitPps - strikePps));
  return { id: grant.id, instrument: 'option' as Instrument, round: grant.round, roundLabel: roundLabel(plan, grant.round), quantity: qty, strikePps, fmvPps, exitPps, exerciseCost: qty * strikePps, stepUp: fmvPps - strikePps, value: netAtExit, netAtExit, underwater: exitPps < strikePps, lapsed };
}

export function computeAdvisor(a: Advisor, plan: Plan, tiers: Tier[], objectives: Objective[]) {
  // v2 (COM-144): an advisor WITH a grants array computes as a fold over it — including EMPTY
  // ([] = explicitly granted nothing → $0; the implicit package must never resurrect when the
  // last grant is deleted or a corrupt import drops every row — fail toward understatement).
  // The v1 implicit path below stays byte-equivalent for grant-less advisors (22/22 pins it).
  if (Array.isArray(a.grants)) return computeAdvisorFromGrants(a, plan);
  const years = a.years || 4;
  const bg = plan.baseGrant;
  const grantRound = a.grantRound || 'bridge';
  let baseEq: number, baseTk: number, tierMult = 1;
  if (a.mode === 'value') {
    const tot = (a.annualValue || 0) * years;
    const split = clamp(a.splitOptions ?? 0.65, 0, 1);
    const baseWalk = walkScenario(plan, baseScenKey(plan));
    baseEq = safeDiv(tot * split, (baseWalk.byId[grantRound] || baseWalk.byId.bridge).post);
    const baseFdv = tgeFdvFor(plan, baseScenKey(plan), baseWalk);
    baseTk = safeDiv(tot * (1 - split), baseFdv);
  } else {
    const t = tiers[a.tier || 0] || tiers[0];
    tierMult = t.mult ?? 1;
    baseEq = bg.equityPct * tierMult; baseTk = bg.tokenPct * tierMult;
  }
  const perf = a.performance || { achieved: [], targeted: [] } as Performance;
  const cu = plan.capitalUplift;
  const capEquity = perf.capitalEquity || 0, capToken = perf.capitalToken || 0;
  const capTotal = (perf.capitalEquity != null || perf.capitalToken != null) ? (capEquity + capToken) : (perf.capitalIntroduced || 0);
  const capRaw = clamp(safeDiv(capTotal, cu.per) * cu.pct, 0, cu.cap);
  const capActive = stageReached(plan, cu.gate) ? capRaw : 0;
  const oMap: Record<string, Objective> = Object.fromEntries((objectives || []).map(o => [o.id, o]));
  const ach = perf.achieved || [], tgt = perf.targeted || [];
  const earnedObj = ach.filter(id => oMap[id] && stageReached(plan, oMap[id].gate)).reduce((s, id) => s + oMap[id].uplift, 0);
  const pendObj = ach.filter(id => oMap[id] && !stageReached(plan, oMap[id].gate)).reduce((s, id) => s + oMap[id].uplift, 0);
  const ceilObj = [...new Set([...ach, ...tgt])].reduce((s, id) => s + (oMap[id]?.uplift || 0), 0);
  const earnedUplift = capActive + earnedObj;
  const ceilUplift = capRaw + ceilObj;
  const pendingUplift = (capRaw - capActive) + pendObj;

  const eqPct = baseEq * (1 + earnedUplift), tkPct = baseTk * (1 + earnedUplift);
  const eqPctCeil = baseEq * (1 + ceilUplift), tkPctCeil = baseTk * (1 + ceilUplift);

  const scen = Object.keys(plan.scenarios).map(k => {
    const w = walkScenario(plan, k);
    const grant = w.byId[grantRound] || w.byId.bridge, exit = w.exit;
    const retention = safeDiv(grant.N, exit.N);
    const strikeBasis = grant.post;
    const exitVal = exit.post;
    const fdv = tgeFdvFor(plan, k, w);
    const netEqAt = (pct: number, V: number) => Math.max(0, pct * (retention * V - strikeBasis));
    const equity = netEqAt(eqPct, exitVal), token = tkPct * fdv;
    return { key: k, label: plan.scenarios[k].label, retention, strikeBasis, exitVal, fdv, grantN: grant.N, exitN: exit.N, grantPrice: grant.price, netEqAt, equity, token, total: equity + token, underwater: retention * exitVal < strikeBasis };
  });
  const sb = scen.find(x => x.key === baseScenKey(plan)) || scen[0];

  const cash = a.hasCash ? (a.cashAnnual || 0) : 0;
  const equityShares = eqPct * sb.grantN;
  const strikePps = sb.grantPrice;
  const exerciseCost = eqPct * sb.strikeBasis;
  return {
    years, tierMult, baseEq, baseTk, grantRound, capEquity, capToken, capTotal,
    earnedUplift, ceilUplift, pendingUplift, capEarned: capActive, capRaw,
    eqPct, tkPct, eqPctCeil, tkPctCeil,
    scen, base: sb, retentionBase: sb.retention,
    equityShares, strikePps, exerciseCost, tokenCount: tkPct * plan.tokenSupply,
    cash, cashTotal: cash * years,
    baseCaseBase: sb.netEqAt(baseEq, sb.exitVal) + baseTk * sb.fdv,
    baseCaseTotal: sb.netEqAt(eqPct, sb.exitVal) + tkPct * sb.fdv,
    baseCaseCeil: sb.netEqAt(eqPctCeil, sb.exitVal) + tkPctCeil * sb.fdv,
    baseEqNet: sb.netEqAt(eqPct, sb.exitVal), baseBaseEqNet: sb.netEqAt(baseEq, sb.exitVal),
    bestCaseTotal: scen.reduce((m, x) => Math.max(m, x.total), 0),
  };
}

// v2 (COM-144): the grants fold. Returns the v1 SUPERSET shape so views migrate incrementally.
// Conventions (flagged in the PR, proceed-unless-vetoed): lapsed grants are excluded from money;
// explicit grants are PRICED, not uplift-multiplied (performance uplifts express as top-up grants
// from COM-157/158 on), so ceiling == earned for grant-advisors; eqPct restates total option
// shares as a % of the CURRENT-stage FD in the base scenario (the Board pool comparison's basis).
function computeAdvisorFromGrants(a: Advisor, plan: Plan) {
  const years = a.years || 4;
  const live = (a.grants || []).filter(g => g.lifecycle !== 'lapsed');
  const baseKey = baseScenKey(plan);
  const baseWalk = walkScenario(plan, baseKey);
  const grantRound = a.grantRound || 'bridge';

  // Shares/eqPct are scenario-independent (quantities are grant data); compute them first so
  // every scenario's netEqAt can scale off the same eqPct reference.
  const equityShares = live.reduce((s, g) => s + (g.instrument === 'option' && ok(g.quantity) ? g.quantity : 0), 0);
  const tokenCount = live.reduce((s, g) => s + (g.instrument === 'rta' && ok(g.quantity) ? g.quantity : 0), 0);
  const tkPct = safeDiv(tokenCount, plan.tokenSupply);
  const curN = currentRoundStep(plan, baseWalk).N;
  const eqPct = safeDiv(equityShares, curN);

  const scen = Object.keys(plan.scenarios).map(k => {
    const w = walkScenario(plan, k);
    const rows = live.map(g => computeGrant(g, plan, k));
    const equity = rows.reduce((s, r) => s + (r.instrument === 'option' ? r.netAtExit : 0), 0);
    const token = rows.reduce((s, r) => s + (r.instrument === 'rta' ? r.value : 0), 0);
    const grant = w.byId[grantRound] || w.byId.bridge, exit = w.exit;
    const retention = safeDiv(grant.N, exit.N);
    // Fold-consistent netEqAt: price the GRANTS at valuation V (per-share V/exitN against each
    // grant's own strike), scaled by pct relative to eqPct so ceiling-style calls stay
    // proportional. The v1 single-round closure contradicted the fold for explicit strikes and
    // non-bridge rounds (review finding 2026-06-10) — scen.equity === netEqAt(eqPct, exitVal).
    const netEqAt = (pct: number, V: number) => {
      const pps = safeDiv(V, exit.N);
      const raw = rows.reduce((s, r) => s + (r.instrument === 'option' ? (r.quantity || 0) * Math.max(0, pps - (r.strikePps as number)) : 0), 0);
      return raw * safeDiv(pct, eqPct, 0);
    };
    return {
      key: k, label: plan.scenarios[k].label, retention, strikeBasis: grant.post, exitVal: exit.post,
      fdv: tgeFdvFor(plan, k, w), grantN: grant.N, exitN: exit.N, grantPrice: grant.price, netEqAt,
      equity, token, total: equity + token, underwater: equityShares > 0 && equity === 0, rows,
    };
  });
  const sb = scen.find(x => x.key === baseKey) || scen[0];

  const baseRows = sb.rows;
  const exerciseCost = baseRows.reduce((s, r) => s + (r.instrument === 'option' ? r.exerciseCost : 0), 0);
  const strikePps = safeDiv(exerciseCost, equityShares, baseRows.find(r => r.instrument === 'option')?.strikePps ?? sb.grantPrice);
  const grantCash = baseRows.reduce((s, r) => s + (r.instrument === 'cash' ? r.value : 0), 0);
  const cash = a.hasCash ? (a.cashAnnual || 0) : 0;

  return {
    years, tierMult: 1, baseEq: eqPct, baseTk: tkPct, grantRound,
    capEquity: 0, capToken: 0, capTotal: 0,
    earnedUplift: 0, ceilUplift: 0, pendingUplift: 0, capEarned: 0, capRaw: 0,
    eqPct, tkPct, eqPctCeil: eqPct, tkPctCeil: tkPct,
    scen, base: sb, retentionBase: sb.retention,
    equityShares, strikePps, exerciseCost, tokenCount,
    cash, cashTotal: cash * years + grantCash,
    baseCaseBase: sb.total, baseCaseTotal: sb.total, baseCaseCeil: sb.total,
    baseEqNet: sb.equity, baseBaseEqNet: sb.equity,
    bestCaseTotal: scen.reduce((m, x) => Math.max(m, x.total), 0),
    grants: baseRows,
  };
}

// v2 (COM-144): the §5 derivation shim, for UIs that render grant rows uniformly — explicit
// grants when the array exists (even empty — [] is explicit-zero, never re-derive), else the v1
// implicit package expressed as Grant entries. NOT persisted; reconcile never materialises these.
// A flow that DOES persist them (materialise-on-first-edit) MUST clear hasCash/cashAnnual or drop
// the implicit-cash row — the fold sums advisor-level cash AND cash grants (review 2026-06-10).
export function effectiveGrants(a: Advisor, plan: Plan, tiers: Tier[], objectives: Objective[]): Grant[] {
  if (Array.isArray(a.grants)) return a.grants;
  const c = computeAdvisor(a, plan, tiers, objectives);
  const out: Grant[] = [];
  if (c.equityShares > 0) out.push({ id: `${a.id}-implicit-eq`, instrument: 'option', round: c.grantRound, quantity: c.equityShares, strikePps: c.strikePps, curve: 'cert-v3', vestStartISO: a.startDate, lifecycle: 'granted' });
  if (c.tokenCount > 0) out.push({ id: `${a.id}-implicit-rta`, instrument: 'rta', round: c.grantRound, quantity: c.tokenCount, curve: 'rta', vestStartISO: a.startDate, lifecycle: 'granted' });
  if (a.hasCash && a.cashAnnual) out.push({ id: `${a.id}-implicit-cash`, instrument: 'cash', round: c.grantRound, valueUSD: (a.cashAnnual || 0) * (a.years || 4), curve: 'cert-v3', vestStartISO: a.startDate, lifecycle: 'granted' });
  return out;
}

export function computeBoard(advisors: Advisor[], plan: Plan, tiers: Tier[], objectives: Objective[]) {
  const rows = advisors.map(a => ({ a, c: computeAdvisor(a, plan, tiers, objectives) }));
  const sumEq = rows.reduce((s, r) => s + r.c.eqPct, 0);
  const sumEqCeil = rows.reduce((s, r) => s + r.c.eqPctCeil, 0);
  const sumTk = rows.reduce((s, r) => s + r.c.tkPct, 0);
  const sumTkCeil = rows.reduce((s, r) => s + r.c.tkPctCeil, 0);
  const sumCash = rows.reduce((s, r) => s + r.c.cash, 0);
  const sumCapital = rows.reduce((s, r) => s + (r.a.performance?.capitalIntroduced || 0), 0);
  const cost: Record<string, number> = {};
  Object.keys(plan.scenarios).forEach(k => { cost[k] = rows.reduce((s, r) => s + (r.c.scen.find((x: any) => x.key === k)?.total || 0), 0); });
  const baseWalk = walkScenario(plan, baseScenKey(plan));
  const esopNow = (baseWalk.byId[plan.currentStage] || baseWalk.byId.bridge).esopPct;
  const warnings: string[] = [];
  if (sumEqCeil > esopNow + 1e-9) warnings.push(`At ceiling, board equity ${fPct(sumEqCeil, 2)} exceeds the ${fPct(esopNow, 0)} ESOP pool`);
  const boardBucket = plan.boardTokenBucketPct ?? (plan.advisorTokenPoolPct - plan.committedAdvisorTokenPct);
  if (sumTkCeil > boardBucket + 1e-9) warnings.push(`At ceiling, board tokens ${fPct(sumTkCeil, 2)} exceed the board token bucket ${fPct(boardBucket, 2)}`);
  const cap = plan.esopCap ?? 0.20;
  const overCap: string[] = [];
  Object.keys(plan.scenarios).forEach(k => { (plan.rounds || []).forEach(rd => { const e = plan.scenarios[k][rd.id]?.esop; if (e > cap + 1e-9) overCap.push(`${plan.scenarios[k].label} ${rd.label} ${fPct(e, 0)}`); }); });
  if ((plan.esopStart ?? plan.bridge.esop) > cap + 1e-9) overCap.push(`Bridge ${fPct(plan.esopStart, 0)}`);
  if (overCap.length) warnings.push(`ESOP exceeds the ${fPct(cap, 0)} cap: ${overCap[0]}${overCap.length > 1 ? ` (+${overCap.length - 1})` : ''}`);
  return { rows, sumEq, sumEqCeil, sumTk, sumTkCeil, sumCash, sumCapital, cost, warnings, esopNow, boardBucket };
}

export function vestedFrac(m: number, years: number, cliff: number) { if (m < cliff) return 0; return clamp((1 / years) * (Math.floor((m - cliff) / 12) + 1), 0, 1); }
