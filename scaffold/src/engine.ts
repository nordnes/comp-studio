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
export interface Advisor {
  id: string; name: string; sector: string; mode: 'tier' | 'value'; tier: number;
  years: number; splitOptions: number; annualValue: number; hasCash: boolean; cashAnnual: number;
  startDate: string; upliftStartMonth: number; grantRound: string; taxResidency: 'UK' | 'US' | 'Other';
  notes: string; performance: Performance;
  // PD2 (COM-82): optional per-advisor projection state — additive only, reconcile-normalised, no money path.
  caseOverride?: string; targetExit?: number;
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
    },
    tiers,
    objectives: Array.isArray(l.objectives) ? l.objectives : d.objectives,
    advisors: Array.isArray(l.advisors) ? l.advisors.map((a: any) => {
      const pf: Performance = { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: [], ...(a.performance || {}) };
      if (a.performance && a.performance.capitalIntroduced != null && a.performance.capitalEquity == null && a.performance.capitalToken == null) pf.capitalEquity = a.performance.capitalIntroduced;
      const adv = { name: 'Advisor', sector: SECTORS[0], mode: 'tier', tier: 0, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: todayISO(), upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'Other', notes: '', ...a, performance: pf };
      if (adv.caseOverride != null && !scn[adv.caseOverride]) delete adv.caseOverride;
      if (adv.targetExit != null && !ok(adv.targetExit)) delete adv.targetExit;
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

// ===== engine =====
export const stageIdx = (plan: Plan, id: string) => { const i = (plan.milestones || []).findIndex(m => m.id === id); return i < 0 ? 0 : i; };
export const stageReached = (plan: Plan, gateId: string) => stageIdx(plan, gateId) <= stageIdx(plan, plan.currentStage);

export function tgeFdvFor(plan: Plan, scenKey: string, walk: any) {
  const s = plan.scenarios[scenKey];
  const anchor = walk.byId[plan.tgeAnchor] || walk.exit;
  return (s.tgeMult || 1) * (anchor?.post || 0);
}

export function computeAdvisor(a: Advisor, plan: Plan, tiers: Tier[], objectives: Objective[]) {
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
