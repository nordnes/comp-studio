import React, { useState, useMemo, useReducer, useEffect, useRef, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Legend, Cell,
  ScatterChart, Scatter, ZAxis, LabelList
} from 'recharts';
import {
  Plus, Trash2, Save, FolderOpen, RotateCcw, X, Check, FileText, SlidersHorizontal,
  AlertTriangle, Copy, FileJson, ArrowRight, Target, TrendingUp, TrendingDown,
  Layers, Printer, Building2, Calendar, GitCompare, Info, ClipboardPaste, Upload
} from 'lucide-react';

// ===== THEME (editorial paper) =====
const C = {
  bg: '#FBF8F3', bgElevated: '#FFFFFF', bgAmber: '#FCF4E3', bgAmberDeep: '#F8E9C8',
  text: '#1A1815', textSecondary: '#4A4640', textTertiary: '#87807A',
  border: '#E5E0DA', borderStrong: '#C9C2BA',
  accent: '#9C4A0C', accentLight: '#C46A1F', accentBg: '#FBEFD9',
  // Uplift green is teal-shifted so it separates from the amber accents under deuteranopia/protanopia.
  green: '#2F6E63', greenLight: '#5E9A90', red: '#8C3A2B', blue: '#3E5C76',
};
const CAT = {
  capital: { label: 'Capital', color: '#9C4A0C' },
  customer: { label: 'Customer', color: '#C46A1F' },
  partnership: { label: 'Partnership', color: '#3E5C76' },
  governance: { label: 'Governance', color: '#6B7F6E' },
};

// ===== GUARDS & FORMATTERS =====
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const safeDiv = (a, b, fb = 0) => (b && isFinite(b) && isFinite(a) ? a / b : fb);
const ok = (n) => typeof n === 'number' && isFinite(n);
const fUSD = (n, c = true) => {
  if (!ok(n)) return '—'; if (Math.round(n) === 0) return '$0';
  const a = Math.abs(n);
  if (c) { if (a >= 1e9) return `$${(n / 1e9).toFixed(2)}B`; if (a >= 1e6) return `$${(n / 1e6).toFixed(a >= 1e7 ? 1 : 2)}M`; if (a >= 1e3) return `$${(n / 1e3).toFixed(0)}K`; return `$${Math.round(n)}`; }
  return `$${Math.round(n).toLocaleString('en-US')}`;
};
const fPct = (n, d = 2) => (ok(n) ? `${(n * 100).toFixed(d)}%` : '—');
const fNum = (n) => (ok(n) ? Math.round(n).toLocaleString('en-US') : '—');
const fMult = (n) => (ok(n) ? `${(Math.round(n * 100) / 100).toString()}×` : '—');
const fTok = (n) => { if (!ok(n)) return '—'; const a = Math.abs(n); if (a >= 1e9) return `${(n / 1e9).toFixed(2)}B`; if (a >= 1e6) return `${(n / 1e6).toFixed(1)}M`; if (a >= 1e3) return `${(n / 1e3).toFixed(0)}K`; return `${Math.round(n)}`; };
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthsBetween = (aISO, bISO) => { const a = new Date(aISO), b = new Date(bISO); if (isNaN(+a) || isNaN(+b)) return 0; return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()); };
const addMonthsISO = (iso, n) => { const d = new Date(iso); if (isNaN(+d)) return iso; d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10); };
const fDate = (iso) => { const d = new Date(iso); if (isNaN(+d)) return '—'; return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); };

// ===== DEFAULTS — grounded in Raiku cap table + dilution model + token allocation =====
const SCHEMA = 5;
const SECTORS = [
  'Asset Management — Hedge Funds & Family Offices', 'Asset Management — Sovereign Wealth & Endowments',
  'Technology & FinTech', 'Capital Markets — Credit, Structured & Digital',
  'Payments & FX — Transaction Banking', 'Infrastructure', 'Legal & Governance',
];
// Rounds & scenarios are dynamic: plan.rounds defines the priced rounds after the (fixed) bridge.
const roundList = (plan) => ['bridge', ...(((plan && plan.rounds) || []).map(r => r.id))];
const roundLabel = (plan, id) => id === 'bridge' ? 'Bridge' : ((((plan && plan.rounds) || []).find(r => r.id === id) || {}).label || id);
const scenKeys = (plan) => Object.keys((plan && plan.scenarios) || {});
const baseScenKey = (plan) => (plan && plan.baseScenario && plan.scenarios[plan.baseScenario]) ? plan.baseScenario : scenKeys(plan)[0];
const SCEN_COLORS = ['#3E5C76', '#9C4A0C', '#2F6E63', '#C46A1F', '#6B7F6E', '#8C6A4A'];

// Industry benchmarks (researched, 2025 medians) — reference bands only.
const BENCH = {
  postMoney: { bridge: 24e6, seriesA: 79e6, seriesB: 150e6, seriesC: 300e6 },
  postMoneySrc: 'Carta State of Pre-Seed 2025 · ValueAdd VC 2025 round benchmarks',
  fdvCaution: 1e9, // 2025: >$1B TGE-FDV launches ~0% "green"
  fdvSrc: 'Memento Research / The Defiant; MEXC — 2025 TGE performance',
  // FAST advisor-equity matrix (Founder Institute): per-head ranges by involvement.
  advisorEquity: {
    standard: { lo: 0.0015, hi: 0.0025, label: 'Standard · ~5 hrs/mo' },
    strategic: { lo: 0.0030, hi: 0.0050, label: 'Strategic · ~10 hrs/mo' },
    expert: { lo: 0.0060, hi: 0.0100, label: 'Expert · ~20 hrs/mo' },
  },
  advisorPool: 0.05,
  advisorSrc: 'Founder Institute FAST matrix; ~5% advisory-pool norm (2025)',
};
const benchLevelForTier = (ti) => (ti >= 2 ? 'expert' : ti === 1 ? 'strategic' : 'standard');

const DEFAULT = () => ({
  version: SCHEMA, name: 'Advisory board — working draft',
  plan: {
    // Current cap table (post-Rousseau cancellation), pre-ESOP.
    fdPreESOP: 48316.78,
    tokenSupply: 10e9,
    // Bridge is the actual grant event — fixed across scenarios. Scenarios diverge from Series A.
    bridge: { post: 90e6, raise: 5e6, esop: 0.10 },
    esopStart: 0.10, esopCap: 0.20, // 10% or 15% at adoption, growing to 20%
    // The three named valuation paths from the dilution memo (Series A→C + TGE multiplier).
    scenarios: {
      conservative: { label: 'Conservative', seriesA: { post: 100e6, raise: 20e6, esop: 0.10 }, seriesB: { post: 150e6, raise: 40e6, esop: 0.15 }, seriesC: { post: 300e6, raise: 80e6, esop: 0.20 }, tgeMult: 2 },
      base: { label: 'Base', seriesA: { post: 120e6, raise: 20e6, esop: 0.15 }, seriesB: { post: 300e6, raise: 40e6, esop: 0.15 }, seriesC: { post: 500e6, raise: 80e6, esop: 0.20 }, tgeMult: 5 },
      aggressive: { label: 'Aggressive', seriesA: { post: 150e6, raise: 20e6, esop: 0.15 }, seriesB: { post: 500e6, raise: 40e6, esop: 0.20 }, seriesC: { post: 750e6, raise: 80e6, esop: 0.20 }, tgeMult: 12 },
    },
    // Priced rounds after the bridge (add/remove/rename in Configure). Order matters.
    rounds: [{ id: 'seriesA', label: 'Series A' }, { id: 'seriesB', label: 'Series B' }, { id: 'seriesC', label: 'Series C' }],
    baseScenario: 'base', // the canonical scenario used for package maths, staircase, dilution
    tgeAnchor: 'seriesA', // TGE FDV = scenario.tgeMult × post-money of this round
    tgeDate: '2027-06-30',
    exitMultiple: 2, // upside-curve top = last-round post × this
    // Uniform base grant; tier scales it.
    baseGrant: { equityPct: 0.005, tokenPct: 0.003 },
    // Token pools (Foundation side). Advisor pool 5%, ~3.17% already committed to ecosystem advisors.
    advisorTokenPoolPct: 0.05, committedAdvisorTokenPct: 0.0317,
    // Ring-fenced, scalable bucket for the advisory BOARD (separate from the ecosystem pool above).
    boardTokenBucketPct: 0.045,
    capitalUplift: { per: 1e6, pct: 0.10, cap: 1.0, gate: 'bridge' },
    currentStage: 'bridge',
    cocAccelPct: 0, // v9 deleted Rule 9.2 — Board discretion only, not contractual
    equityVestYears: 4, equityCliff: 12, tokenVestYears: 3, tokenCliff: 12,
    milestones: [
      { id: 'bridge', label: 'Bridge close' }, { id: 'mainnet', label: 'Public mainnet' },
      { id: 'seriesA', label: 'Series A close' }, { id: 'tge', label: 'TGE' },
    ],
    showBenchmarks: true,
  },
  tiers: [
    { name: 'Base', mult: 1, days: 1 },
    { name: 'Strategic', mult: 2, days: 2 },
    { name: 'Anchor', mult: 3, days: 3 },
  ],
  objectives: [
    { id: 'cap-anchor', category: 'capital', label: 'Anchor ticket', trigger: 'Personal or family-office ticket ≥$1M into the round (≈20% of bridge)', uplift: 0.50, gate: 'bridge' },
    { id: 'cap-intro', category: 'capital', label: 'Capital introduction', trigger: 'Introduction closing ≥$5M (a full bridge / ~25% of Series A)', uplift: 0.40, gate: 'bridge' },
    { id: 'cust-partner', category: 'customer', label: 'Design partner', trigger: '≥$250K ARR or a Tier-1 institutional design partner', uplift: 0.30, gate: 'mainnet' },
    { id: 'part-mandate', category: 'partnership', label: 'Strategic mandate', trigger: 'Sovereign / family-office mandate, MM LP, or stablecoin distribution', uplift: 0.30, gate: 'mainnet' },
    { id: 'gov-engaged', category: 'governance', label: 'Sustained governance', trigger: '12-month engagement in a named working group', uplift: 0.20, gate: 'seriesA' },
  ],
  // Confirmed founding board: Iraj (chair), Martin, Kerim, Robert. Carl Bang & Rajesh Mehta are pending — re-add later via "Add advisor".
  advisors: [
    { id: 'iraj', name: 'Iraj Ispahani', sector: SECTORS[0], mode: 'tier', tier: 2, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: '2026-06-01', upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'UK', notes: 'Board chair · CEO Ispahani Advisory; ex-JP Morgan (Global COO, FIG) & Korn/Ferry. Family-office / wealth-owner network + governance. (Confirm tier & any cash.)', performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ['cap-anchor', 'gov-engaged'] } },
    { id: 'mk', name: 'Martin Keller', sector: SECTORS[0], mode: 'tier', tier: 1, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: '2026-06-01', upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'Other', notes: 'Family-office distribution; hedge-fund credibility.', performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ['cap-intro'] } },
    { id: 'kd', name: 'Kerim Derhalli', sector: SECTORS[2], mode: 'tier', tier: 1, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: '2026-06-01', upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'Other', notes: 'Fintech product & Tether/Turing network.', performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ['cust-partner'] } },
    { id: 'rr', name: 'Robert Reoch', sector: SECTORS[3], mode: 'tier', tier: 1, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: '2026-06-01', upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'Other', notes: 'Credit, structured & digital markets; bank intros (UBS).', performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ['part-mandate'] } },
  ],
});

function reconcile(l) {
  const d = DEFAULT();
  if (!l || typeof l !== 'object') return d;
  const p = l.plan || {};
  // Scenarios: keep whatever keys the saved plan has (dynamic add/remove), else defaults.
  const srcScn = p.scenarios && Object.keys(p.scenarios).length ? p.scenarios : d.plan.scenarios;
  const scn = {};
  Object.keys(srcScn).forEach(k => { scn[k] = { label: k, tgeMult: 1, ...(d.plan.scenarios[k] || {}), ...(srcScn[k] || {}) }; });
  const rounds = Array.isArray(p.rounds) && p.rounds.length ? p.rounds : d.plan.rounds;
  const baseScenario = (p.baseScenario && scn[p.baseScenario]) ? p.baseScenario : (scn.base ? 'base' : Object.keys(scn)[0]);
  let tiers = Array.isArray(l.tiers) && l.tiers.length ? l.tiers : d.tiers;
  tiers = tiers.map((t, i) => ({ name: t.name ?? `Tier ${i + 1}`, mult: t.mult ?? (i + 1), days: t.days ?? 1 }));
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
    advisors: Array.isArray(l.advisors) ? l.advisors.map(a => {
      const pf = { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: [], ...(a.performance || {}) };
      // Migrate legacy single capitalIntroduced → equity channel.
      if (a.performance && a.performance.capitalIntroduced != null && a.performance.capitalEquity == null && a.performance.capitalToken == null) pf.capitalEquity = a.performance.capitalIntroduced;
      return { mode: 'tier', tier: 0, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: todayISO(), upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'Other', notes: '', ...a, performance: pf };
    }) : d.advisors,
  };
}

// ===== ROADMAP CSV (import/export) =====
// Columns: scope,round,postMoney,raise,esopPct,tgeMult
// scope = bridge or a scenario key/label ; round = bridge or a round id/label
function parseRoadmapCSV(text, plan) {
  const out = { scenarios: {} };
  const num = (s) => { const v = parseFloat(String(s).replace(/[^0-9.\-]/g, '')); return isNaN(v) ? null : v; };
  const pct = (s) => { const v = num(s); return v == null ? null : (v > 1 ? v / 100 : v); };
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // Build lookup maps from the live plan so custom ids/labels resolve.
  const scenByNorm = {}, roundByNorm = {};
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
function roadmapToCSV(plan) {
  const rows = [['scope', 'round', 'postMoney', 'raise', 'esopPct', 'tgeMult']];
  rows.push(['bridge', 'bridge', plan.bridge.post, plan.bridge.raise, plan.esopStart, '']);
  Object.keys(plan.scenarios).forEach(k => (plan.rounds || []).forEach((rd, ri) => { const r = plan.scenarios[k][rd.id]; if (!r) return; rows.push([k, rd.id, r.post, r.raise, r.esop, ri === 0 ? plan.scenarios[k].tgeMult : '']); }));
  return rows.map(r => r.join(',')).join('\n');
}

// ===== CAP-TABLE WALK =====
// Fixed bridge for all scenarios; scenarios diverge from Series A.
// N_k = (N_{k-1} − ESOP_{k-1}) / (1 − raise_k/post_k − esop_k);  ESOP_k = esop_k × N_k.
function walkScenario(plan, scenKey) {
  const s = plan.scenarios[scenKey];
  const bridgeEsop = plan.esopStart ?? plan.bridge.esop ?? 0.10;
  const steps = [];
  // Bridge (fixed grant event)
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
  const byId = Object.fromEntries(steps.map(s => [s.id, s]));
  return { steps, byId, exit: steps[steps.length - 1] };
}

// ===== ENGINE =====
const stageIdx = (plan, id) => { const i = (plan.milestones || []).findIndex(m => m.id === id); return i < 0 ? 0 : i; };
const stageReached = (plan, gateId) => stageIdx(plan, gateId) <= stageIdx(plan, plan.currentStage);

function tgeFdvFor(plan, scenKey, walk) {
  const s = plan.scenarios[scenKey];
  const anchor = walk.byId[plan.tgeAnchor] || walk.exit;
  return (s.tgeMult || 1) * (anchor?.post || 0);
}

function computeAdvisor(a, plan, tiers, objectives) {
  const years = a.years || 4;
  const bg = plan.baseGrant;
  const grantRound = a.grantRound || 'bridge';
  let baseEq, baseTk, tierMult = 1;
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
  // uplift (gated) — capital can come via equity round OR Foundation token OTC
  const perf = a.performance || { achieved: [], targeted: [] };
  const cu = plan.capitalUplift;
  const capEquity = perf.capitalEquity || 0, capToken = perf.capitalToken || 0;
  const capTotal = (perf.capitalEquity != null || perf.capitalToken != null) ? (capEquity + capToken) : (perf.capitalIntroduced || 0);
  const capRaw = clamp(safeDiv(capTotal, cu.per) * cu.pct, 0, cu.cap);
  const capActive = stageReached(plan, cu.gate) ? capRaw : 0;
  const oMap = Object.fromEntries((objectives || []).map(o => [o.id, o]));
  const ach = perf.achieved || [], tgt = perf.targeted || [];
  const earnedObj = ach.filter(id => oMap[id] && stageReached(plan, oMap[id].gate)).reduce((s, id) => s + oMap[id].uplift, 0);
  const pendObj = ach.filter(id => oMap[id] && !stageReached(plan, oMap[id].gate)).reduce((s, id) => s + oMap[id].uplift, 0);
  const ceilObj = [...new Set([...ach, ...tgt])].reduce((s, id) => s + (oMap[id]?.uplift || 0), 0);
  const earnedUplift = capActive + earnedObj;
  const ceilUplift = capRaw + ceilObj;
  const pendingUplift = (capRaw - capActive) + pendObj;

  const eqPct = baseEq * (1 + earnedUplift), tkPct = baseTk * (1 + earnedUplift);
  const eqPctCeil = baseEq * (1 + ceilUplift), tkPctCeil = baseTk * (1 + ceilUplift);

  // per-scenario via the walk
  const scen = Object.keys(plan.scenarios).map(k => {
    const w = walkScenario(plan, k);
    const grant = w.byId[grantRound] || w.byId.bridge, exit = w.exit;
    const retention = safeDiv(grant.N, exit.N);
    const strikeBasis = grant.post; // exercise cost per 1.0 of company = post-money at grant
    const exitVal = exit.post;
    const fdv = tgeFdvFor(plan, k, w);
    const netEqAt = (pct, V) => Math.max(0, pct * (retention * V - strikeBasis));
    return {
      key: k, label: plan.scenarios[k].label, retention, strikeBasis, exitVal, fdv,
      grantN: grant.N, exitN: exit.N, grantPrice: grant.price,
      netEqAt,
      equity: netEqAt(eqPct, exitVal), token: tkPct * fdv,
      get total() { return this.equity + this.token; },
      underwater: retention * exitVal < strikeBasis,
    };
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
function computeBoard(advisors, plan, tiers, objectives) {
  const rows = advisors.map(a => ({ a, c: computeAdvisor(a, plan, tiers, objectives) }));
  const sumEq = rows.reduce((s, r) => s + r.c.eqPct, 0);
  const sumEqCeil = rows.reduce((s, r) => s + r.c.eqPctCeil, 0);
  const sumTk = rows.reduce((s, r) => s + r.c.tkPct, 0);
  const sumTkCeil = rows.reduce((s, r) => s + r.c.tkPctCeil, 0);
  const sumCash = rows.reduce((s, r) => s + r.c.cash, 0);
  const sumCapital = rows.reduce((s, r) => s + (r.a.performance?.capitalIntroduced || 0), 0);
  const cost = {};
  Object.keys(plan.scenarios).forEach(k => { cost[k] = rows.reduce((s, r) => s + (r.c.scen.find(x => x.key === k)?.total || 0), 0); });
  // ESOP context: current ESOP % at the latest stage on the base scenario
  const baseWalk = walkScenario(plan, baseScenKey(plan));
  const esopNow = (baseWalk.byId[plan.currentStage] || baseWalk.byId.bridge).esopPct;
  const warnings = [];
  if (sumEqCeil > esopNow + 1e-9) warnings.push(`At ceiling, board equity ${fPct(sumEqCeil, 2)} exceeds the ${fPct(esopNow, 0)} ESOP pool`);
  const boardBucket = plan.boardTokenBucketPct ?? (plan.advisorTokenPoolPct - plan.committedAdvisorTokenPct);
  if (sumTkCeil > boardBucket + 1e-9) warnings.push(`At ceiling, board tokens ${fPct(sumTkCeil, 2)} exceed the board token bucket ${fPct(boardBucket, 2)}`);
  // ESOP 20%-cap enforcement (across every scenario × round)
  const cap = plan.esopCap ?? 0.20;
  const overCap = [];
  Object.keys(plan.scenarios).forEach(k => { (plan.rounds || []).forEach(rd => { const e = plan.scenarios[k][rd.id]?.esop; if (e > cap + 1e-9) overCap.push(`${plan.scenarios[k].label} ${rd.label} ${fPct(e, 0)}`); }); });
  if ((plan.esopStart ?? plan.bridge.esop) > cap + 1e-9) overCap.push(`Bridge ${fPct(plan.esopStart, 0)}`);
  if (overCap.length) warnings.push(`ESOP exceeds the ${fPct(cap, 0)} cap: ${overCap[0]}${overCap.length > 1 ? ` (+${overCap.length - 1})` : ''}`);
  return { rows, sumEq, sumEqCeil, sumTk, sumTkCeil, sumCash, sumCapital, cost, warnings, esopNow, boardBucket };
}
function vestedFrac(m, years, cliff) { if (m < cliff) return 0; return clamp((1 / years) * (Math.floor((m - cliff) / 12) + 1), 0, 1); }

// ===== STYLE =====
function StyleInjector() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,300..900,0..100&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; box-sizing: border-box; }
      .font-display { font-family:'Fraunces',Georgia,serif; font-variation-settings:"SOFT" 30,"opsz" 144,"WONK" 0; letter-spacing:-.02em; }
      .font-display-italic { font-family:'Fraunces',Georgia,serif; font-style:italic; font-variation-settings:"SOFT" 30,"opsz" 144; }
      .font-body { font-family:'IBM Plex Sans',system-ui,sans-serif; }
      .font-mono { font-family:'IBM Plex Mono',ui-monospace,monospace; }
      .tabular-nums { font-variant-numeric: tabular-nums; }
      .eyebrow { font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.18em; text-transform:uppercase; font-weight:500; }
      input[type=range]{ -webkit-appearance:none; appearance:none; width:100%; height:2px; background:${C.border}; outline:none; cursor:pointer; }
      input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:15px; height:15px; background:${C.accent}; cursor:pointer; border-radius:50%; margin-top:-6.5px; }
      input.cell,select.cell{ background:transparent; border:none; border-bottom:1px solid transparent; font-family:'IBM Plex Mono',monospace; font-size:13px; color:${C.text}; padding:2px 0; outline:none; width:100%; }
      input.cell:focus{ border-bottom:1px solid ${C.accent}; }
      input.dt{ background:transparent; border:none; border-bottom:1px solid ${C.border}; font-family:'IBM Plex Mono',monospace; font-size:13px; color:${C.text}; padding:2px 0; outline:none; }
      .cellbtn{ font-family:'IBM Plex Mono',monospace; font-size:13px; color:${C.text}; cursor:text; border-bottom:1px solid transparent; padding:2px 0; }
      .cellbtn:hover{ border-bottom:1px dashed ${C.borderStrong}; }
      .fade-in{ animation:fadeIn .3s ease-out; } @keyframes fadeIn{ from{opacity:0;transform:translateY(3px);} to{opacity:1;transform:translateY(0);} }
      .grow-val{ transition: all .22s ease-out; }
      ::selection{ background:${C.accentBg}; color:${C.text}; } .hairline{ border-top:.5px solid ${C.borderStrong}; }
      @media (prefers-reduced-motion: reduce){ .fade-in,.grow-val{ animation:none!important; transition:none!important; } }
      @media print { body{background:#fff!important;} .no-print{display:none!important;} .print-area{box-shadow:none!important;border:none!important;} .print-only{display:block!important;} main{padding:0!important;max-width:none!important;} @page{margin:14mm;} }
      .print-only{ display:none; }
    `}</style>
  );
}

// ===== REDUCER =====
function reducer(state, action) {
  switch (action.type) {
    case 'LOAD': return reconcile(action.scenario);
    case 'SET': { const n = structuredClone(state); let o = n; for (let i = 0; i < action.path.length - 1; i++) o = o[action.path[i]]; o[action.path[action.path.length - 1]] = action.value; return n; }
    case 'ADD_ADV': return { ...state, advisors: [...state.advisors, { id: 'a' + Date.now(), name: 'New advisor', sector: SECTORS[0], mode: 'tier', tier: 0, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: todayISO(), upliftStartMonth: 6, notes: '', performance: { capitalIntroduced: 0, achieved: [], targeted: [] } }] };
    case 'DEL_ADV': return { ...state, advisors: state.advisors.filter(a => a.id !== action.id) };
    case 'ADD_OBJ': return { ...state, objectives: [...state.objectives, { id: 'o' + Date.now(), category: 'capital', label: 'New objective', trigger: 'Define the trigger', uplift: 0.2, gate: state.plan.milestones[0]?.id || 'bridge' }] };
    case 'DEL_OBJ': return { ...state, objectives: state.objectives.filter(o => o.id !== action.id), advisors: state.advisors.map(a => ({ ...a, performance: { ...a.performance, achieved: (a.performance?.achieved || []).filter(x => x !== action.id), targeted: (a.performance?.targeted || []).filter(x => x !== action.id) } })) };
    case 'ADD_TIER': return { ...state, tiers: [...state.tiers, { name: 'New tier', mult: state.tiers.length + 1, days: 1 }] };
    case 'DEL_TIER': {
      if (state.tiers.length <= 1) return state;
      const idx = action.index; const tiers = state.tiers.filter((_, i) => i !== idx);
      return { ...state, tiers, advisors: state.advisors.map(a => ({ ...a, tier: Math.min(a.tier || 0, tiers.length - 1) })) };
    }
    case 'ADD_MS': return { ...state, plan: { ...state.plan, milestones: [...state.plan.milestones, { id: 'm' + Date.now(), label: 'New milestone' }] } };
    case 'DEL_MS': {
      if (state.plan.milestones.length <= 1) return state;
      const id = action.id; const ms = state.plan.milestones.filter(m => m.id !== id); const first = ms[0]?.id || 'bridge';
      return {
        ...state,
        plan: { ...state.plan, milestones: ms, currentStage: state.plan.currentStage === id ? first : state.plan.currentStage, capitalUplift: { ...state.plan.capitalUplift, gate: state.plan.capitalUplift.gate === id ? first : state.plan.capitalUplift.gate } },
        objectives: state.objectives.map(o => ({ ...o, gate: o.gate === id ? first : o.gate })),
      };
    }
    case 'ADD_ROUND': {
      const n = structuredClone(state); const id = 'r' + Date.now();
      const lastId = n.plan.rounds.length ? n.plan.rounds[n.plan.rounds.length - 1].id : null;
      n.plan.rounds.push({ id, label: 'New round' });
      Object.keys(n.plan.scenarios).forEach(k => { const prev = lastId ? n.plan.scenarios[k][lastId] : null; n.plan.scenarios[k][id] = prev ? { post: prev.post * 1.5, raise: prev.raise, esop: prev.esop } : { post: 100e6, raise: 20e6, esop: 0.15 }; });
      return n;
    }
    case 'DEL_ROUND': {
      if (state.plan.rounds.length <= 1) return state;
      const n = structuredClone(state); const id = action.id;
      n.plan.rounds = n.plan.rounds.filter(r => r.id !== id);
      Object.keys(n.plan.scenarios).forEach(k => { delete n.plan.scenarios[k][id]; });
      if (n.plan.tgeAnchor === id) n.plan.tgeAnchor = n.plan.rounds[0]?.id || 'bridge';
      n.advisors = n.advisors.map(a => ({ ...a, grantRound: a.grantRound === id ? 'bridge' : a.grantRound }));
      return n;
    }
    case 'ADD_SCENARIO': {
      const n = structuredClone(state); const key = 'scn' + Date.now();
      const src = n.plan.scenarios[baseScenKey(n.plan)] || Object.values(n.plan.scenarios)[0];
      n.plan.scenarios[key] = { ...(src ? structuredClone(src) : { tgeMult: 1 }), label: 'New scenario' };
      return n;
    }
    case 'DEL_SCENARIO': {
      if (Object.keys(state.plan.scenarios).length <= 1) return state;
      const n = structuredClone(state); delete n.plan.scenarios[action.key];
      if (n.plan.baseScenario === action.key) n.plan.baseScenario = Object.keys(n.plan.scenarios)[0];
      return n;
    }
    case 'SET_ROADMAP': {
      const n = structuredClone(state); const r = action.roadmap || {};
      if (r.bridge) n.plan.bridge = { ...n.plan.bridge, ...r.bridge };
      if (r.esopStart != null) n.plan.esopStart = r.esopStart;
      Object.keys(r.scenarios || {}).forEach(k => { if (n.plan.scenarios[k]) { const sc = r.scenarios[k]; Object.keys(sc).forEach(rid => { if (rid === 'tgeMult') return; if (n.plan.scenarios[k][rid]) n.plan.scenarios[k][rid] = { ...n.plan.scenarios[k][rid], ...sc[rid] }; }); if (sc.tgeMult != null) n.plan.scenarios[k].tgeMult = sc.tgeMult; } });
      return n;
    }
    default: return state;
  }
}

// ===== IO (window.storage → localStorage → memory) =====
const HAS_WS = typeof window !== 'undefined' && !!(window.storage && typeof window.storage.get === 'function');
const HAS_LS = (() => { try { return typeof localStorage !== 'undefined' && !!localStorage; } catch { return false; } })();
const STORAGE_OK = HAS_WS || HAS_LS;
const KEY = 'raiku-advisor-comp-v5';
const io = {
  async load() { try { if (HAS_WS) { const r = await window.storage.get(KEY); return r ? JSON.parse(r.value) : null; } if (HAS_LS) { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null; } return null; } catch { return null; } },
  async save(o) { try { const s = JSON.stringify(o); if (HAS_WS) { await window.storage.set(KEY, s); return true; } if (HAS_LS) { localStorage.setItem(KEY, s); return true; } return false; } catch { return false; } },
  download(name, text, mime) { try { const b = new Blob([text], { type: mime }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u); return true; } catch { return false; } },
  async copy(t) { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } },
};

// ===== APP =====
export default function App() {
  const [S, dispatch] = useReducer(reducer, null, DEFAULT);
  const [tab, setTab] = useState('overview');
  const [selId, setSelId] = useState(null);
  const [saved, setSaved] = useState({});
  const [status, setStatus] = useState('');
  const [showMgr, setShowMgr] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { (async () => { const s = await io.load(); if (s?.scenarios) { setSaved(s.scenarios); if (s.last && s.scenarios[s.last]) dispatch({ type: 'LOAD', scenario: s.scenarios[s.last] }); } })(); }, []);
  useEffect(() => { if (!selId && S.advisors[0]) setSelId(S.advisors[0].id); }, [S.advisors, selId]);

  const board = useMemo(() => computeBoard(S.advisors, S.plan, S.tiers, S.objectives), [S]);
  const sel = S.advisors.find(a => a.id === selId) || S.advisors[0];
  const selCalc = useMemo(() => sel ? computeAdvisor(sel, S.plan, S.tiers, S.objectives) : null, [sel, S]);

  const flash = (m) => { setStatus(m); setTimeout(() => setStatus(''), 2800); };
  const persist = useCallback(async (nm) => { const name = nm || S.name || 'Untitled'; const next = { ...saved, [name]: S }; setSaved(next); flash((await io.save({ scenarios: next, last: name })) ? `Saved “${name}”` : 'Save failed — export JSON'); }, [saved, S]);
  const exportJSON = () => flash(io.download(`raiku-advisory-${S.name.replace(/\s+/g, '-')}.json`, JSON.stringify(S, null, 2), 'application/json') ? 'JSON downloaded' : 'Blocked');
  const importJSON = (e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { dispatch({ type: 'LOAD', scenario: JSON.parse(r.result) }); flash('Imported'); } catch { flash('Invalid JSON'); } }; r.readAsText(f); e.target.value = ''; };
  const copyState = async () => flash((await io.copy(JSON.stringify(S))) ? 'State copied — paste to share' : 'Clipboard blocked');
  const pasteState = async () => { try { const t = await navigator.clipboard.readText(); dispatch({ type: 'LOAD', scenario: JSON.parse(t) }); flash('Loaded from clipboard'); } catch { flash('Paste failed — use Import'); } };
  const exportCSV = () => {
    const sk = scenKeys(S.plan);
    const rows = [['RAIKU ADVISORY BOARD — net of strike', S.name], ['Stage', S.plan.milestones.find(m => m.id === S.plan.currentStage)?.label], [], ['Advisor', 'Tier', 'Base eq %', 'Earned', 'Pending', 'Eq % earned', 'Tk % earned', ...sk.map(k => `Net ${S.plan.scenarios[k].label}`), 'Cash/yr']];
    board.rows.forEach(({ a, c }) => { const g = k => c.scen.find(x => x.key === k)?.total || 0; rows.push([a.name, S.tiers[a.tier]?.name || a.mode, (c.baseEq * 100).toFixed(3) + '%', '+' + (c.earnedUplift * 100).toFixed(0) + '%', c.pendingUplift > 0 ? '+' + (c.pendingUplift * 100).toFixed(0) + '%' : '0%', (c.eqPct * 100).toFixed(3) + '%', (c.tkPct * 100).toFixed(3) + '%', ...sk.map(k => Math.round(g(k))), c.cash]); });
    rows.push([], ['Company cost net', ...sk.flatMap(k => [S.plan.scenarios[k].label, Math.round(board.cost[k] || 0)])]);
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    flash(io.download(`raiku-advisory-${S.name.replace(/\s+/g, '-')}.csv`, csv, 'text/csv') ? 'CSV downloaded' : 'Blocked');
  };

  return (
    <div className="min-h-screen font-body" style={{ background: C.bg, color: C.text }}>
      <StyleInjector />
      <input ref={fileRef} type="file" accept="application/json" onChange={importJSON} style={{ display: 'none' }} />

      <header className="no-print" style={{ background: C.bgElevated, borderBottom: `0.5px solid ${C.borderStrong}`, position: 'sticky', top: 0, zIndex: 20 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center gap-3 flex-wrap">
            <div className="flex items-baseline gap-4">
              <div className="font-display text-xl" style={{ fontWeight: 400 }}>Raiku Labs</div>
              <div className="eyebrow hidden sm:block" style={{ color: C.textTertiary }}>Advisory Board · Compensation Studio</div>
              <span className="eyebrow px-1.5 py-0.5" style={{ color: C.accent, background: C.accentBg, border: `0.5px solid ${C.bgAmberDeep}` }} title="Internal &amp; confidential">Internal</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {status && <span className="text-xs font-mono mr-1" style={{ color: C.accent }}>{status}</span>}
              <IconBtn onClick={() => setTab('configure')} icon={SlidersHorizontal} label="Configure" />
              <IconBtn onClick={() => persist()} icon={Save} label="Save" />
              <IconBtn onClick={() => setShowMgr(!showMgr)} icon={FolderOpen} label="Saved" badge={Object.keys(saved).length} />
              <IconBtn onClick={exportCSV} icon={FileText} label="CSV" />
              <IconBtn onClick={exportJSON} icon={FileJson} label="JSON" />
              <IconBtn onClick={() => fileRef.current?.click()} icon={FolderOpen} label="Import" />
              <IconBtn onClick={copyState} icon={Copy} label="Copy" />
              <IconBtn onClick={pasteState} icon={ClipboardPaste} label="Paste" />
              <IconBtn onClick={() => dispatch({ type: 'LOAD', scenario: DEFAULT() })} icon={RotateCcw} label="Reset" />
            </div>
          </div>
        </div>
        {!STORAGE_OK && <Banner color={C.accent} bg="#FCF4E3">Browser storage unavailable — use <b>Export JSON</b> to keep your work.</Banner>}
        {board.warnings.length > 0 && <Banner color={C.red} bg="#FBEAE6"><b>Budget:</b> {board.warnings[0]}{board.warnings.length > 1 ? ` (+${board.warnings.length - 1})` : ''}</Banner>}
        <nav style={{ borderTop: `0.5px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
            {[['overview', 'I', 'Overview'], ['package', 'II', 'Advisors'], ['board', 'III', 'Board'], ['compare', 'IV', 'Compare'], ['proposition', 'V', 'Proposition'], ['configure', 'VI', 'Configure']].map(([id, n, l]) => (
              <button key={id} onClick={() => setTab(id)} className="py-3 px-4 text-sm flex items-baseline gap-2 whitespace-nowrap"
                style={{ color: tab === id ? C.text : C.textTertiary, borderBottom: tab === id ? `1.5px solid ${C.accent}` : '1.5px solid transparent', marginBottom: '-0.5px' }}>
                <span className="font-mono text-xs" style={{ color: tab === id ? C.accent : C.textTertiary }}>{n}</span>
                <span style={{ fontWeight: tab === id ? 500 : 400 }}>{l}</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      {showMgr && <Mgr saved={saved} current={S.name} onLoad={(n) => { dispatch({ type: 'LOAD', scenario: structuredClone(saved[n]) }); setShowMgr(false); }} onDel={async (n) => { const x = { ...saved }; delete x[n]; setSaved(x); await io.save({ scenarios: x, last: null }); }} onSaveAs={(n) => persist(n)} onClose={() => setShowMgr(false)} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="fade-in" key={tab}>
          {tab === 'overview' && <OverviewTab S={S} board={board} dispatch={dispatch} setTab={setTab} setSel={(id) => { setSelId(id); setTab('package'); }} />}
          {tab === 'configure' && <ConfigureTab S={S} dispatch={dispatch} setTab={setTab} />}
          {tab !== 'overview' && tab !== 'configure' && (S.advisors.length === 0 ? <EmptyState dispatch={dispatch} /> : <>
            {tab === 'package' && sel && <PackageTab S={S} dispatch={dispatch} sel={sel} calc={selCalc} selId={selId} setSelId={setSelId} setTab={setTab} board={board} />}
            {tab === 'board' && <BoardTab S={S} dispatch={dispatch} board={board} setSel={(id) => { setSelId(id); setTab('package'); }} />}
            {tab === 'compare' && <CompareTab S={S} board={board} setSel={(id) => { setSelId(id); setTab('package'); }} />}
            {tab === 'proposition' && sel && <PropositionTab S={S} sel={sel} calc={selCalc} selId={selId} setSelId={setSelId} onCopy={async (t) => flash((await io.copy(t)) ? 'Copied' : 'Clipboard blocked')} />}
          </>)}
        </div>
      </main>

      <Footer S={S} />
    </div>
  );
}

// ===== SHARED =====
function Banner({ color, bg, children }) {
  return <div style={{ background: bg, borderTop: `0.5px solid ${color}` }}><div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 text-xs" style={{ color }}><AlertTriangle size={13} /> {children}</div></div>;
}
function IconBtn({ onClick, icon: Icon, label, badge }) {
  return <button onClick={onClick} aria-label={label} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs relative" style={{ border: `0.5px solid ${C.borderStrong}`, color: C.textSecondary, background: C.bgElevated }}><Icon size={13} /><span className="hidden sm:inline">{label}</span>{badge ? <span className="font-mono" style={{ color: C.accent }}>{badge}</span> : null}</button>;
}
function SectionHead({ eyebrow, title, desc, right }) {
  return <div className="flex justify-between items-start gap-6 mb-8 flex-wrap"><div className="max-w-2xl"><div className="eyebrow mb-3" style={{ color: C.accent }}>{eyebrow}</div><h2 className="font-display text-3xl sm:text-4xl" style={{ fontWeight: 350 }}>{title}</h2>{desc && <p className="mt-4 text-sm" style={{ color: C.textSecondary, lineHeight: 1.65 }}>{desc}</p>}</div>{right}</div>;
}
function NumIn({ value, onChange, fmt = 'num', min = -Infinity, max = Infinity, ariaLabel }) {
  const [edit, setEdit] = useState(false);
  const disp = fmt === 'usd' ? fUSD(value) : fmt === 'pct' ? fPct(value, 2) : fmt === 'pps' ? `$${ok(value) ? value.toFixed(2) : '—'}` : fmt === 'mult' ? fMult(value) : fNum(value);
  const commit = (raw) => { let v = parseFloat(String(raw).replace(/[^0-9.\-]/g, '')); if (!isNaN(v)) { if (fmt === 'pct') v /= 100; onChange(clamp(v, min, max)); } setEdit(false); };
  if (edit) return <input autoFocus className="cell" aria-label={ariaLabel} defaultValue={fmt === 'pct' ? +(value * 100).toFixed(4) : value} onBlur={(e) => commit(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEdit(false); }} />;
  return <span className="cellbtn" role="button" tabIndex={0} aria-label={ariaLabel} onClick={() => setEdit(true)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEdit(true); } }}>{disp}</span>;
}
function Field({ label, children }) { return <div><div className="eyebrow mb-1.5" style={{ color: C.textTertiary }}>{label}</div>{children}</div>; }
function AdvisorPicker({ S, selId, setSelId }) {
  return <select value={selId || (S.advisors[0]?.id ?? '')} onChange={(e) => setSelId(e.target.value)} aria-label="Select advisor" className="px-3 py-2 text-sm font-display" style={{ background: C.accentBg, color: C.accent, border: `0.5px solid ${C.bgAmberDeep}` }}>{S.advisors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>;
}
function StageBadge({ S, dispatch }) {
  return <label className="flex items-center gap-2 text-xs px-3 py-1.5" style={{ background: C.accentBg, color: C.accent, border: `0.5px solid ${C.bgAmberDeep}` }}><Target size={12} /> Stage<select value={S.plan.currentStage} onChange={(e) => dispatch({ type: 'SET', path: ['plan', 'currentStage'], value: e.target.value })} className="bg-transparent font-medium" style={{ color: C.accent, outline: 'none' }}>{S.plan.milestones.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select></label>;
}
function ContextStrip({ S }) {
  const w = walkScenario(S.plan, 'base');
  const fdv = tgeFdvFor(S.plan, 'base', w);
  return (
    <div className="no-print flex items-center gap-x-4 gap-y-1 flex-wrap text-xs px-4 py-2 mb-6" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}`, color: C.textTertiary }}>
      <span className="eyebrow" style={{ color: C.accent }}>Base path</span>
      {w.steps.map(s => <span key={s.id} className="tabular-nums">{s.label} {fUSD(s.post)}</span>)}
      <span style={{ color: C.borderStrong }}>·</span>
      <span className="tabular-nums">TGE FDV {fUSD(fdv)} <span style={{ color: C.borderStrong }}>({fMult(S.plan.scenarios[baseScenKey(S.plan)].tgeMult)} × {roundLabel(S.plan, S.plan.tgeAnchor)})</span></span>
      <span style={{ color: C.borderStrong }}>·</span>
      <span className="tabular-nums">ESOP {fPct(S.plan.esopStart, 0)} → {fPct(S.plan.esopCap, 0)}</span>
    </div>
  );
}

// ===== POTENTIAL STRIP =====
function PotentialStrip({ calc }) {
  const cells = [
    { k: 'Floor', v: calc.baseCaseBase, s: 'guaranteed base', accent: false },
    { k: 'Current', v: calc.baseCaseTotal, s: calc.earnedUplift > 0 ? `+${(calc.earnedUplift * 100).toFixed(0)}% earned` : 'no uplift yet', accent: true },
    { k: 'Ceiling', v: calc.baseCaseCeil, s: `+${(calc.ceilUplift * 100).toFixed(0)}% if targets hit`, accent: false },
    { k: 'Best case', v: calc.bestCaseTotal, s: 'aggressive scenario', accent: false },
  ];
  const max = Math.max(1, ...cells.map(c => c.v));
  return (
    <div style={{ background: C.bgElevated, border: `0.5px solid ${C.borderStrong}` }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: C.border }}>
        {cells.map(c => (
          <div key={c.k} className="p-4" style={{ background: c.accent ? C.bgAmber : C.bgElevated }}>
            <div className="eyebrow mb-1" style={{ color: c.accent ? C.accent : C.textTertiary }}>{c.k}</div>
            <div className="font-display tabular-nums grow-val" style={{ fontSize: '1.6rem', fontWeight: 350, lineHeight: 1 }}>{fUSD(c.v)}</div>
            <div className="text-xs mt-1.5" style={{ color: C.textTertiary }}>{c.s}</div>
            <div style={{ height: 3, marginTop: 8, background: C.border }}><div className="grow-val" style={{ height: 3, width: `${clamp(c.v / max, 0, 1) * 100}%`, background: c.accent ? C.accent : C.borderStrong }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== GROWTH WATERFALL =====
function GrowthWaterfall({ S, calc, sel, hoverObj, setHoverObj }) {
  // Build steps in base-case net value terms.
  const sb = calc.base;
  const tgeFdv = sb.fdv;
  const ms = Object.fromEntries(S.plan.milestones.map(m => [m.id, m.label]));
  const perf = sel.performance || { achieved: [], targeted: [] };
  const oMap = Object.fromEntries(S.objectives.map(o => [o.id, o]));
  // value of a grant at given uplift multiplier (equity net + token)
  const valAt = (mult) => sb.netEqAt(calc.baseEq * (1 + mult), sb.exitVal) + (calc.baseTk * (1 + mult)) * tgeFdv;
  const steps = [];
  let cumMult = 0;
  steps.push({ id: 'base', label: 'Base', kind: 'base', from: 0, to: valAt(0), color: C.accent });
  // capital
  if (calc.capRaw > 0) {
    const earned = calc.capEarned > 0;
    const prev = valAt(cumMult); cumMult += calc.capRaw; const next = valAt(cumMult);
    steps.push({ id: 'capital', label: 'Capital', kind: earned ? 'earned' : 'pending', from: prev, to: next, color: CAT.capital.color, note: `+${(calc.capRaw * 100).toFixed(0)}%${earned ? '' : ' ⏳'}` });
  }
  // objectives: achieved (earned or pending), then targeted (available)
  const seen = new Set();
  (perf.achieved || []).forEach(id => {
    const o = oMap[id]; if (!o) return; seen.add(id);
    const reached = stageReached(S.plan, o.gate);
    const prev = valAt(cumMult); cumMult += o.uplift; const next = valAt(cumMult);
    steps.push({ id: o.id, label: o.label, kind: reached ? 'earned' : 'pending', from: prev, to: next, color: CAT[o.category]?.color, note: `+${(o.uplift * 100).toFixed(0)}%${reached ? '' : ' ⏳'}` });
  });
  (perf.targeted || []).forEach(id => {
    const o = oMap[id]; if (!o || seen.has(id)) return;
    const prev = valAt(cumMult); cumMult += o.uplift; const next = valAt(cumMult);
    steps.push({ id: o.id, label: o.label, kind: 'available', from: prev, to: next, color: CAT[o.category]?.color, note: `+${(o.uplift * 100).toFixed(0)}%` });
  });
  const ceiling = valAt(cumMult);
  const data = steps.map(s => ({ name: s.label, base: Math.min(s.from, s.to), delta: Math.abs(s.to - s.from), ...s }));
  const current = valAt(calc.earnedUplift);
  const fillFor = (k) => k === 'available' ? 'transparent' : k === 'pending' ? `url(#hatch)` : 'solid';
  return (
    <div className="p-5" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div className="eyebrow" style={{ color: C.textTertiary }}>How the package grows · base-case net value</div>
        <div className="text-xs" style={{ color: C.textTertiary }}>solid earned · hatched pending gate · outline available</div>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 38 + 40)}>
        <BarChart layout="vertical" data={data} margin={{ top: 6, right: 64, left: 4, bottom: 0 }} barCategoryGap="22%">
          <defs>
            <pattern id="hatch" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)"><rect width="5" height="5" fill={C.bgAmber} /><line x1="0" y1="0" x2="0" y2="5" stroke={C.accentLight} strokeWidth="2" /></pattern>
          </defs>
          <CartesianGrid stroke={C.border} horizontal={false} strokeDasharray="2 3" />
          <XAxis type="number" tick={{ fontSize: 10, fill: C.textTertiary, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => fUSD(v)} />
          <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 11, fill: C.text, fontFamily: 'IBM Plex Sans' }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: C.bgAmber }} contentStyle={{ background: C.bgElevated, border: `0.5px solid ${C.borderStrong}`, fontSize: 11 }} formatter={(v, n, p) => [fUSD(p.payload.to), `${p.payload.note || ''} → ${fUSD(p.payload.to)}`]} labelFormatter={() => ''} />
          <Bar dataKey="base" stackId="a" fill="transparent" />
          <Bar dataKey="delta" stackId="a" radius={[0, 2, 2, 0]} onMouseEnter={(d) => d && setHoverObj && setHoverObj(d.id)} onMouseLeave={() => setHoverObj && setHoverObj(null)} style={{ cursor: 'pointer' }}>
            {data.map((d, i) => <Cell key={i} fill={d.kind === 'available' ? C.bg : d.kind === 'pending' ? 'url(#hatch)' : d.color} fillOpacity={(hoverObj && d.id !== hoverObj) ? 0.22 : (d.kind === 'base' ? 1 : d.kind === 'earned' ? 0.92 : 1)} stroke={(hoverObj && d.id === hoverObj) ? C.text : (d.kind === 'available' ? d.color : 'none')} strokeWidth={(hoverObj && d.id === hoverObj) ? 1.5 : (d.kind === 'available' ? 1 : 0)} strokeDasharray={d.kind === 'available' && !(hoverObj && d.id === hoverObj) ? '3 2' : '0'} />)}
          </Bar>
          <ReferenceLine x={current} stroke={C.green} strokeWidth={1.5} label={{ value: 'Current', position: 'top', fontSize: 9, fill: C.green }} />
          <ReferenceLine x={ceiling} stroke={C.borderStrong} strokeDasharray="2 3" label={{ value: 'Ceiling', position: 'top', fontSize: 9, fill: C.textTertiary }} />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs mt-1" style={{ color: C.textTertiary }}>The band between Current and Ceiling is the remaining potential — earn it by hitting gated objectives.</div>
    </div>
  );
}

function ChipRow({ chips, active, onPick }) {
  return <div className="flex flex-wrap gap-1 mb-2">{chips.map((c, i) => { const on = Math.abs((active || 0) - c.v) < 1; return <button key={i} onClick={() => onPick(c.v)} className="px-2 py-0.5 text-xs" style={{ border: `0.5px solid ${on ? C.accent : C.borderStrong}`, background: on ? C.accentBg : 'transparent', color: on ? C.accent : C.textSecondary }}>{c.label}</button>; })}</div>;
}
// ===== UPSIDE CURVE (equity + token) =====
function UpsideCurve({ S, calc }) {
  const [showGross, setShowGross] = useState(false);
  const [info, setInfo] = useState(false);
  const sb = calc.base;
  const [selV, setSelV] = useState(sb.exitVal);
  const [selFdv, setSelFdv] = useState(sb.fdv);
  useEffect(() => { setSelV(sb.exitVal); setSelFdv(sb.fdv); }, [sb.exitVal, sb.fdv]);
  const netAtV = (V) => Math.max(0, calc.eqPct * (sb.retention * V - sb.strikeBasis));
  const tkAtF = (F) => calc.tkPct * F;
  const walkB = walkScenario(S.plan, 'base');
  const topEq = sb.exitVal * (S.plan.exitMultiple || 2);
  const eqData = useMemo(() => {
    const out = []; const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const V = (topEq / steps) * i;
      out.push({ V, net: Math.max(0, calc.eqPct * (sb.retention * V - sb.strikeBasis)), gross: calc.eqPct * sb.retention * V });
    }
    return out;
  }, [calc, topEq]);
  const breakeven = safeDiv(sb.strikeBasis, sb.retention);
  // token: net token value vs FDV
  const topFdv = Math.max(BENCH.fdvCaution * 1.5, Math.max(sb.fdv, ...calc.scen.map(s => s.fdv)) * 1.2);
  const tkData = useMemo(() => { const out = []; const steps = 36; for (let i = 0; i <= steps; i++) { const F = (topFdv / steps) * i; out.push({ F, val: calc.tkPct * F }); } return out; }, [calc, topFdv]);
  const scenDot = (k) => calc.scen.find(x => x.key === k);

  return (
    <div className="p-5" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="eyebrow" style={{ color: C.textTertiary }}>Upside · what an outcome is worth (net of strike)</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setInfo(!info)} className="flex items-center gap-1 text-xs" style={{ color: C.textTertiary }}><Info size={12} /> gross vs net</button>
          <label className="flex items-center gap-1 text-xs" style={{ color: C.textSecondary }}><input type="checkbox" checked={showGross} onChange={e => setShowGross(e.target.checked)} style={{ accentColor: C.accent }} /> show gross</label>
        </div>
      </div>
      {info && <div className="text-xs mb-3 p-3" style={{ background: C.bgAmber, border: `0.5px solid ${C.borderStrong}`, color: C.textSecondary, lineHeight: 1.5 }}><b>Gross</b> = ownership × company value. <b>Net</b> subtracts the exercise cost you pay to turn options into shares. The strike is the bridge price ({fUSD(sb.strikeBasis)} post-money), so net value is $0 until the company clears that — below {fUSD(breakeven)} exit the options are underwater. The worth is in the upside.</div>}
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <div className="eyebrow mb-2" style={{ color: C.accent }}>Equity · net vs exit company value</div>
          <ChipRow active={selV} onPick={setSelV} chips={[...walkB.steps.map(s => ({ label: s.label, v: s.post })), { label: `Exit ×${S.plan.exitMultiple || 2}`, v: topEq }]} />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={eqData} margin={{ top: 6, right: 10, left: -6, bottom: 0 }}>
              <defs><linearGradient id="eqg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity={0.28} /><stop offset="100%" stopColor={C.accent} stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid stroke={C.border} vertical={false} strokeDasharray="2 3" />
              <XAxis dataKey="V" type="number" domain={[0, topEq]} tick={{ fontSize: 9, fill: C.textTertiary, fontFamily: 'IBM Plex Mono' }} axisLine={{ stroke: C.borderStrong }} tickLine={false} tickFormatter={fUSD} />
              <YAxis tick={{ fontSize: 9, fill: C.textTertiary, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={fUSD} width={42} />
              <Tooltip contentStyle={{ background: C.bgElevated, border: `0.5px solid ${C.borderStrong}`, fontSize: 11 }} labelFormatter={(v) => `Exit ${fUSD(v)}`} formatter={(v, n) => [fUSD(v), n]} />
              {breakeven > 0 && breakeven < topEq && <ReferenceArea x1={0} x2={breakeven} fill={C.red} fillOpacity={0.05} />}
              {breakeven > 0 && breakeven < topEq && <ReferenceLine x={breakeven} stroke={C.red} strokeDasharray="2 3" label={{ value: 'breakeven', position: 'insideTopRight', fontSize: 8, fill: C.red }} />}
              {showGross && <Area type="monotone" dataKey="gross" name="gross" stroke={C.textTertiary} strokeDasharray="4 3" strokeWidth={1} fill="none" dot={false} />}
              <Area type="monotone" dataKey="net" name="net" stroke={C.accent} strokeWidth={1.8} fill="url(#eqg)" dot={false} />
              {scenKeys(S.plan).map(k => { const d = scenDot(k); return d && d.exitVal <= topEq ? <ReferenceLine key={k} x={d.exitVal} stroke={C.borderStrong} strokeDasharray="1 3" label={{ value: d.label[0], position: 'top', fontSize: 8, fill: C.textTertiary }} /> : null; })}
              <ReferenceLine x={selV} stroke={C.green} strokeWidth={1} label={{ value: fUSD(netAtV(selV)), position: 'insideTopLeft', fontSize: 9, fill: C.green }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="text-xs mt-1" style={{ color: C.textTertiary }}>Below {fUSD(breakeven)} exit, equity is underwater (net $0). Base-case {fPct(sb.retention, 0)} retained after dilution.{calc.scen.every(s => s.underwater) && <span style={{ color: C.red }}> All modelled scenarios are underwater — value is tokens + future upside.</span>}</div>
        </div>
        <div>
          <div className="eyebrow mb-2" style={{ color: C.accentLight }}>Tokens · value vs TGE FDV</div>
          <ChipRow active={selFdv} onPick={setSelFdv} chips={scenKeys(S.plan).map(k => ({ label: `${S.plan.scenarios[k].label[0]} ${fMult(S.plan.scenarios[k].tgeMult)}`, v: (calc.scen.find(x => x.key === k) || {}).fdv || 0 }))} />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tkData} margin={{ top: 6, right: 10, left: -6, bottom: 0 }}>
              <CartesianGrid stroke={C.border} vertical={false} strokeDasharray="2 3" />
              <XAxis dataKey="F" type="number" domain={[0, topFdv]} tick={{ fontSize: 9, fill: C.textTertiary, fontFamily: 'IBM Plex Mono' }} axisLine={{ stroke: C.borderStrong }} tickLine={false} tickFormatter={fUSD} />
              <YAxis tick={{ fontSize: 9, fill: C.textTertiary, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={fUSD} width={42} />
              <Tooltip contentStyle={{ background: C.bgElevated, border: `0.5px solid ${C.borderStrong}`, fontSize: 11 }} labelFormatter={(v) => `FDV ${fUSD(v)}`} formatter={(v) => [fUSD(v), 'token value']} />
              {S.plan.showBenchmarks && BENCH.fdvCaution < topFdv && <ReferenceArea x1={BENCH.fdvCaution} x2={topFdv} fill={C.red} fillOpacity={0.05} />}
              {S.plan.showBenchmarks && BENCH.fdvCaution < topFdv && <ReferenceLine x={BENCH.fdvCaution} stroke={C.red} strokeDasharray="2 3" label={{ value: '$1B caution', position: 'top', fontSize: 8, fill: C.red }} />}
              <Line type="monotone" dataKey="val" stroke={C.accentLight} strokeWidth={1.8} dot={false} />
              {scenKeys(S.plan).map(k => { const d = scenDot(k); return d && d.fdv <= topFdv ? <ReferenceLine key={k} x={d.fdv} stroke={C.borderStrong} strokeDasharray="1 3" label={{ value: `${d.label[0]} ${fMult(S.plan.scenarios[k].tgeMult)}`, position: 'top', fontSize: 8, fill: C.textTertiary }} /> : null; })}
              <ReferenceLine x={selFdv} stroke={C.accentLight} strokeWidth={1} label={{ value: fUSD(tkAtF(selFdv)), position: 'insideTopLeft', fontSize: 9, fill: C.accentLight }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-xs mt-1" style={{ color: C.textTertiary }}>TGE FDV = multiple × {roundLabel(S.plan, S.plan.tgeAnchor)} post-money. {S.plan.showBenchmarks && 'Shaded: 2025 launches above $1B FDV mostly traded down.'}</div>
        </div>
      </div>
      <div className="mt-3 pt-3 flex justify-between items-baseline flex-wrap gap-2 text-sm" style={{ borderTop: `0.5px solid ${C.border}` }}>
        <span style={{ color: C.textSecondary }}>Selected outcome · exit {fUSD(selV)} · FDV {fUSD(selFdv)}</span>
        <span className="font-display tabular-nums" style={{ fontSize: '1.1rem' }}>{fUSD(netAtV(selV) + tkAtF(selFdv))} <span className="text-xs" style={{ color: C.textTertiary }}>combined net</span></span>
      </div>
    </div>
  );
}

// ===== SCENARIO FOOTBALL FIELD =====
function FootballField({ calc }) {
  const totals = calc.scen.map(s => s.total);
  const lo = Math.min(...totals), hi = Math.max(...totals);
  const base = calc.baseCaseTotal;
  const max = Math.max(1, hi);
  return (
    <div className="p-5" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
      <div className="eyebrow mb-3" style={{ color: C.textTertiary }}>Scenario range · net value (low → high)</div>
      <div style={{ position: 'relative', height: 30, background: C.bg, border: `0.5px solid ${C.border}` }}>
        <div style={{ position: 'absolute', left: `${(lo / max) * 100}%`, width: `${((hi - lo) / max) * 100}%`, top: 6, height: 18, background: C.bgAmberDeep }} />
        <div title="base" style={{ position: 'absolute', left: `${(base / max) * 100}%`, top: 2, height: 26, width: 2, background: C.accent }} />
      </div>
      <div className="flex justify-between text-xs mt-2 tabular-nums" style={{ color: C.textSecondary }}>
        <span>Low {fUSD(lo)}</span><span style={{ color: C.accent }}>Base {fUSD(base)}</span><span>High {fUSD(hi)}</span>
      </div>
    </div>
  );
}

// ===== DILUTION WATERFALL (mini) =====
function DilutionPath({ S, calc }) {
  const w = walkScenario(S.plan, 'base');
  return (
    <div className="p-5" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
      <div className="flex items-center gap-2 mb-3"><TrendingDown size={13} style={{ color: C.textTertiary }} /><div className="eyebrow" style={{ color: C.textTertiary }}>Equity dilution · base path</div></div>
      <div className="flex items-end gap-1" style={{ height: 80 }}>
        {w.steps.map((s, i) => {
          const pctOfGrant = calc.baseEq * (w.steps[0].N / s.N);
          const h = clamp(pctOfGrant / (calc.baseEq || 1), 0, 1) * 70 + 6;
          return (
            <div key={s.id} className="flex-1 flex flex-col items-center justify-end">
              <div className="text-xs tabular-nums" style={{ color: i === w.steps.length - 1 ? C.accent : C.textTertiary }}>{fPct(pctOfGrant, 2)}</div>
              <div style={{ width: '70%', height: h, background: i === 0 ? C.accent : i === w.steps.length - 1 ? C.accentLight : C.bgAmberDeep }} />
              <div className="eyebrow mt-1" style={{ color: C.textTertiary, fontSize: 8 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
      <div className="text-xs mt-2" style={{ color: C.textTertiary }}>A bridge grant of {fPct(calc.baseEq, 2)} dilutes to {fPct(calc.baseEq * calc.retentionBase, 2)} by Series C ({fPct(calc.retentionBase, 0)} retained). Tokens aren't diluted.</div>
    </div>
  );
}

// ===== TAB I: PACKAGE (hero, live-edit) =====
function PackageTab({ S, dispatch, sel, calc, selId, setSelId, setTab, board }) {
  const i = S.advisors.findIndex(a => a.id === sel.id);
  const setA = (k, v) => dispatch({ type: 'SET', path: ['advisors', i, k], value: v });
  const perf = sel.performance || { capitalIntroduced: 0, achieved: [], targeted: [] };
  const setPerf = (p) => dispatch({ type: 'SET', path: ['advisors', i, 'performance'], value: p });
  const objState = (id) => perf.achieved?.includes(id) ? 'earned' : perf.targeted?.includes(id) ? 'targeted' : 'off';
  const setObjState = (id, st) => { const a = new Set(perf.achieved || []), t = new Set(perf.targeted || []); a.delete(id); t.delete(id); if (st === 'earned') a.add(id); if (st === 'targeted') t.add(id); setPerf({ ...perf, achieved: [...a], targeted: [...t] }); };
  const ms = Object.fromEntries(S.plan.milestones.map(m => [m.id, m.label]));
  const bg = S.plan.baseGrant;
  const [hoverObj, setHoverObj] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-3 no-print">
        <SectionHead eyebrow="Section I · Package" title="Base, then performance." />
        <div className="flex items-center gap-2 flex-wrap"><StageBadge S={S} dispatch={dispatch} /><AdvisorPicker S={S} selId={selId} setSelId={setSelId} /><button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 text-sm" style={{ border: `0.5px solid ${C.borderStrong}`, color: C.textSecondary }}><Printer size={13} /> Print</button></div>
      </div>
      <ContextStrip S={S} />

      <div className="grid lg:grid-cols-12 gap-8">
        {/* CONTROLS LEFT */}
        <div className="lg:col-span-5 space-y-6 no-print">
          <div className="p-5 space-y-4" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
            <div className="eyebrow" style={{ color: C.textTertiary }}>Profile</div>
            <Field label="Name"><input className="cell" value={sel.name} onChange={(e) => setA('name', e.target.value)} /></Field>
            <Field label="Sector"><select className="cell" value={sel.sector} onChange={(e) => setA('sector', e.target.value)}>{SECTORS.map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Engagement (yrs)"><NumIn value={sel.years} onChange={(v) => setA('years', v)} min={1} max={10} ariaLabel="Years" /></Field>
              <Field label="Start date"><input type="date" className="dt" value={sel.startDate || todayISO()} onChange={(e) => setA('startDate', e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Granted at"><select className="cell" value={sel.grantRound || 'bridge'} onChange={(e) => setA('grantRound', e.target.value)}>{roundList(S.plan).map(r => <option key={r} value={r}>{roundLabel(S.plan, r)}</option>)}</select></Field>
              <Field label="Tax residency"><select className="cell" value={sel.taxResidency || 'Other'} onChange={(e) => setA('taxResidency', e.target.value)}>{['UK', 'US', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}</select></Field>
            </div>
            <Field label="Notes"><input className="cell" value={sel.notes} onChange={(e) => setA('notes', e.target.value)} /></Field>
          </div>

          <div className="p-5 space-y-4" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
            <div className="flex items-center justify-between">
              <div className="eyebrow" style={{ color: C.textTertiary }}>Base — denomination</div>
              <div className="flex gap-1">{[['tier', 'By tier'], ['value', 'By $ value']].map(([m, l]) => <button key={m} onClick={() => setA('mode', m)} className="px-3 py-1 text-xs" style={{ background: sel.mode === m ? C.text : 'transparent', color: sel.mode === m ? C.bg : C.textSecondary, border: `0.5px solid ${sel.mode === m ? C.text : C.borderStrong}` }}>{l}</button>)}</div>
            </div>
            {sel.mode === 'tier' ? (
              <>
                <div className="flex items-center gap-2 text-xs px-3 py-2" style={{ background: C.accentBg, color: C.accent }}><Layers size={12} /> Uniform base {fPct(bg.equityPct, 2)} eq · {fPct(bg.tokenPct, 2)} tok, ×tier</div>
                <div className="grid grid-cols-3 gap-2">{S.tiers.map((t, ti) => <button key={ti} onClick={() => setA('tier', ti)} className="p-3 text-left" style={{ background: sel.tier === ti ? C.bgAmber : 'transparent', border: `0.5px solid ${sel.tier === ti ? C.accent : C.borderStrong}` }}><div className="flex items-baseline justify-between"><div className="font-display text-base">{t.name}</div><div className="font-mono text-xs" style={{ color: C.accent }}>{fMult(t.mult)}</div></div><div className="text-xs mt-1 tabular-nums" style={{ color: C.textSecondary }}>{fPct(bg.equityPct * t.mult, 1)} eq · {fPct(bg.tokenPct * t.mult, 1)} tok</div></button>)}</div>
                <EquityBenchmark sel={sel} calc={calc} />
              </>
            ) : (
              <div className="space-y-4">
                <Field label="Annual value (USD)"><NumIn value={sel.annualValue} onChange={(v) => setA('annualValue', v)} fmt="usd" min={0} ariaLabel="Annual value" /></Field>
                <div><div className="flex justify-between text-sm mb-1"><label>Options / tokens split</label><span className="font-mono tabular-nums">{fPct(sel.splitOptions, 0)} / {fPct(1 - sel.splitOptions, 0)}</span></div><input type="range" min={0} max={1} step={0.05} value={sel.splitOptions} onChange={(e) => setA('splitOptions', Number(e.target.value))} aria-label="Split" /></div>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm pt-2" style={{ borderTop: `0.5px solid ${C.border}` }}><input type="checkbox" checked={sel.hasCash} onChange={(e) => setA('hasCash', e.target.checked)} style={{ accentColor: C.accent }} /> Cash retainer (post-Series A)</label>
            {sel.hasCash && <Field label="Annual cash (USD)"><NumIn value={sel.cashAnnual} onChange={(v) => setA('cashAnnual', v)} fmt="usd" min={0} ariaLabel="Cash" /></Field>}
          </div>

          <div className="p-5 space-y-4" style={{ background: C.bgAmber, border: `0.5px solid ${C.borderStrong}` }}>
            <div className="flex items-center gap-2"><TrendingUp size={14} style={{ color: C.accent }} /><div className="eyebrow" style={{ color: C.accent }}>Performance uplift</div></div>
            <div>
              <div className="flex justify-between text-sm mb-1"><label>Capital introduced · by channel</label><span className="font-display tabular-nums" style={{ color: calc.capEarned > 0 ? C.green : C.accentLight }}>+{(calc.capRaw * 100).toFixed(0)}%{calc.capEarned < calc.capRaw ? ' ⏳' : ''}</span></div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Equity round"><NumIn value={perf.capitalEquity || 0} onChange={(v) => setPerf({ ...perf, capitalEquity: v })} fmt="usd" min={0} ariaLabel="Capital — equity round" /></Field>
                <Field label="Token OTC (Foundation)"><NumIn value={perf.capitalToken || 0} onChange={(v) => setPerf({ ...perf, capitalToken: v })} fmt="usd" min={0} ariaLabel="Capital — token OTC" /></Field>
              </div>
              <div className="text-xs mt-1" style={{ color: C.textTertiary }}>{fUSD(S.plan.capitalUplift.per)} introduced → +{(S.plan.capitalUplift.pct * 100).toFixed(0)}% of base, cap +{(S.plan.capitalUplift.cap * 100).toFixed(0)}% · gate {ms[S.plan.capitalUplift.gate]} · counts both channels</div>
            </div>
            <div className="space-y-2 pt-2" style={{ borderTop: `0.5px solid ${C.borderStrong}` }}>
              <div className="eyebrow" style={{ color: C.textTertiary }}>Objectives · off / target / earned</div>
              {S.objectives.map(o => {
                const st = objState(o.id); const gated = st === 'earned' && !stageReached(S.plan, o.gate);
                return (
                  <div key={o.id} className="p-3" onMouseEnter={() => setHoverObj(o.id)} onMouseLeave={() => setHoverObj(null)} style={{ background: hoverObj === o.id ? C.bgAmber : C.bgElevated, border: `0.5px solid ${gated ? C.accentLight : st === 'earned' ? C.green : st === 'targeted' ? C.accent : C.border}`, transition: 'background .15s' }}>
                    <div className="flex items-center gap-2"><span style={{ width: 7, height: 7, background: CAT[o.category]?.color, display: 'inline-block', borderRadius: '50%' }} /><span className="text-sm font-medium">{o.label}</span><span className="text-xs tabular-nums" style={{ color: C.green }}>+{(o.uplift * 100).toFixed(0)}%</span></div>
                    <div className="text-xs mt-1" style={{ color: C.textTertiary, lineHeight: 1.4 }}>{o.trigger} · gate: {ms[o.gate]}{gated && <span style={{ color: C.accentLight }}> · ⏳ awaiting gate</span>}</div>
                    <div className="flex gap-1 mt-2">{[['off', 'Off'], ['targeted', 'Target'], ['earned', 'Earned']].map(([k, l]) => <button key={k} onClick={() => setObjState(o.id, k)} className="px-2.5 py-1 text-xs" style={{ background: st === k ? (k === 'earned' ? C.green : k === 'targeted' ? C.accent : C.textTertiary) : 'transparent', color: st === k ? C.bg : C.textSecondary, border: `0.5px solid ${st === k ? 'transparent' : C.borderStrong}` }}>{l}</button>)}</div>
                  </div>
                );
              })}
              <div className="text-xs pt-1" style={{ color: C.textTertiary }}>Earned: <span style={{ color: C.green }}>+{(calc.earnedUplift * 100).toFixed(0)}%</span>{calc.pendingUplift > 0 && <> · pending gate: <span style={{ color: C.accentLight }}>+{(calc.pendingUplift * 100).toFixed(0)}%</span></>} · ceiling +{(calc.ceilUplift * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>

        {/* LIVE HERO RIGHT */}
        <div className="lg:col-span-7 space-y-6 print-area">
          <PotentialStrip calc={calc} />
          <GrowthWaterfall S={S} calc={calc} sel={sel} hoverObj={hoverObj} setHoverObj={setHoverObj} />
          <UpsideCurve S={S} calc={calc} />
          <button onClick={() => setShowDetail(v => !v)} className="w-full text-sm py-2 no-print" style={{ border: `0.5px solid ${C.borderStrong}`, color: C.textSecondary, background: C.bgElevated }}>{showDetail ? '− Hide detail' : '+ Show detail · vesting, scenario range, mix, instruments'}</button>
          {showDetail && <>
          <VestingTimeline S={S} calc={calc} sel={sel} setA={setA} />
          <FootballField calc={calc} />
          <MixBreakdown calc={calc} />
          <div className="grid sm:grid-cols-2 gap-6">
            <DilutionPath S={S} calc={calc} />
            <div className="p-5" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
              <div className="eyebrow mb-3" style={{ color: C.textTertiary }}>Instruments · net of strike</div>
              <Row k="Options (base case net)" v={fUSD(calc.baseEqNet)} />
              <Row k="Shares @ bridge" v={fNum(calc.equityShares)} />
              <Row k="Strike" v={`$${calc.strikePps.toFixed(2)}`} />
              <Row k="Exercise cost" v={fUSD(calc.exerciseCost)} />
              <Row k="Tokens" v={`${fPct(calc.tkPct, 3)} · ${fTok(calc.tokenCount)}`} />
              <Row k="Token value (base FDV)" v={fUSD(calc.tkPct * calc.base.fdv)} />
              <Row k="Vesting" v={`${S.plan.equityVestYears}yr / ${S.plan.equityCliff}mo`} last />
              <div className="text-xs mt-2" style={{ color: C.textTertiary }}>Strike subject to an HMRC SAV / 409A valuation agreed before first grant.</div>
            </div>
          </div>
          </>}
          <button onClick={() => setTab('proposition')} className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm no-print" style={{ background: C.text, color: C.bg }}>View {sel.name.split(' ')[0]}’s proposition <ArrowRight size={15} /></button>
        </div>
      </div>
    </div>
  );
}
function Row({ k, v, last }) { return <div className="flex justify-between gap-4 py-2 text-sm" style={{ borderBottom: last ? 'none' : `0.5px solid ${C.border}` }}><span style={{ color: C.textSecondary }}>{k}</span><span className="tabular-nums">{v}</span></div>; }

// ===== TAB II: BOARD =====
function BoardTab({ S, dispatch, board, setSel }) {
  const ff = board.rows.map(({ a, c }) => ({ name: a.name.split(' ')[0], lo: Math.min(...c.scen.map(s => s.total)), base: c.baseCaseTotal, hi: Math.max(...c.scen.map(s => s.total)) }));
  const maxFF = Math.max(1, ...ff.map(f => f.hi));
  return (
    <div className="space-y-10">
      <SectionHead eyebrow="Section II · Board" title="The board, and what it costs us."
        desc="Uniform base × tier, grown by gated performance. Equity is net of strike and scenario dilution; tokens are valued at the scenario's TGE FDV."
        right={<div className="flex items-center gap-2 no-print"><StageBadge S={S} dispatch={dispatch} /><button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 text-sm" style={{ border: `0.5px solid ${C.borderStrong}`, color: C.textSecondary }}><Printer size={13} /> Board pack</button><button onClick={() => dispatch({ type: 'ADD_ADV' })} className="flex items-center gap-1.5 px-4 py-2 text-sm" style={{ background: C.text, color: C.bg }}><Plus size={14} /> Add</button></div>} />
      <ContextStrip S={S} />
      <div className="grid lg:grid-cols-2 gap-6">
        <ValuationStaircase S={S} />
        <PotentialScatter S={S} board={board} setSel={setSel} />
      </div>
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div style={{ background: C.bgElevated, border: `0.5px solid ${C.border}`, overflowX: 'auto' }}>
            <table className="w-full text-sm" style={{ minWidth: 640 }}>
              <thead><tr style={{ borderBottom: `0.5px solid ${C.borderStrong}` }}>{['Advisor', 'Tier', 'Base eq', 'Earned', 'Net base-case', ''].map(h => <th key={h} className="text-left px-4 py-3 font-normal eyebrow" style={{ color: C.textTertiary }}>{h}</th>)}</tr></thead>
              <tbody>
                {board.rows.map(({ a, c }) => (
                  <tr key={a.id} style={{ borderBottom: `0.5px solid ${C.border}`, cursor: 'pointer' }} onClick={() => setSel(a.id)}>
                    <td className="px-4 py-3"><div className="font-medium">{a.name}</div><div className="text-xs" style={{ color: C.textTertiary }}>{a.sector.split('—')[0].trim()}</div></td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5" style={{ background: C.accentBg, color: C.accent }}>{a.mode === 'value' ? '$value' : S.tiers[a.tier]?.name}</span></td>
                    <td className="px-4 py-3 tabular-nums">{fPct(c.baseEq, 2)}</td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: c.earnedUplift > 0 ? C.green : C.textTertiary }}>+{(c.earnedUplift * 100).toFixed(0)}%{c.pendingUplift > 0 && <span style={{ color: C.accentLight }}> +{(c.pendingUplift * 100).toFixed(0)}⏳</span>}</td>
                    <td className="px-4 py-3 tabular-nums font-medium">{fUSD(c.baseCaseTotal)}</td>
                    <td className="px-2 py-3 no-print"><button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DEL_ADV', id: a.id }); }} aria-label="Remove" style={{ color: C.textTertiary }}><Trash2 size={13} /></button></td>
                  </tr>
                ))}
                <tr style={{ background: C.bgAmber }}><td className="px-4 py-3 font-medium">Board · {board.rows.length}</td><td /><td className="px-4 py-3 tabular-nums font-medium">{fPct(board.rows.reduce((s, r) => s + r.c.baseEq, 0), 2)}</td><td /><td className="px-4 py-3 tabular-nums font-medium">{fUSD(board.rows.reduce((s, r) => s + r.c.baseCaseTotal, 0))}</td><td /></tr>
              </tbody>
            </table>
          </div>
          <div>
            <div className="eyebrow mb-3" style={{ color: C.textTertiary }}>Scenario range by advisor · net value</div>
            <div className="p-5 space-y-3" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
              {ff.map(f => (
                <div key={f.name}>
                  <div className="flex justify-between text-xs mb-1"><span>{f.name}</span><span className="tabular-nums" style={{ color: C.textTertiary }}>{fUSD(f.lo)} – {fUSD(f.hi)}</span></div>
                  <div style={{ position: 'relative', height: 16, background: C.bg }}>
                    <div style={{ position: 'absolute', left: `${(f.lo / maxFF) * 100}%`, width: `${((f.hi - f.lo) / maxFF) * 100}%`, top: 4, height: 8, background: C.bgAmberDeep }} />
                    <div style={{ position: 'absolute', left: `${(f.base / maxFF) * 100}%`, top: 1, height: 14, width: 2, background: C.accent }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <PoolAllocation S={S} board={board} />
          <div className="p-5 space-y-3" style={{ background: C.bgAmber, border: `0.5px solid ${C.borderStrong}` }}>
            <div className="flex items-center gap-2"><Building2 size={14} style={{ color: C.accent }} /><div className="eyebrow" style={{ color: C.accent }}>Company cost · net to the board</div></div>
            <div className="grid grid-cols-3 gap-px" style={{ background: C.borderStrong }}>
              {Object.keys(S.plan.scenarios).map(k => <div key={k} className="p-3" style={{ background: k === baseScenKey(S.plan) ? C.bgElevated : C.bgAmber }}><div className="eyebrow mb-1" style={{ color: C.textTertiary }}>{S.plan.scenarios[k].label}</div><div className="font-display tabular-nums" style={{ fontSize: '1.05rem' }}>{fUSD(board.cost[k] || 0)}</div></div>)}
            </div>
            <div className="text-xs" style={{ color: C.textSecondary }}>Total net value across the board at each scenario.</div>
            <div className="pt-2 text-sm flex justify-between" style={{ borderTop: `0.5px solid ${C.borderStrong}` }}><span style={{ color: C.textSecondary }}>Annual cash</span><span className="tabular-nums">{fUSD(board.sumCash)}/yr</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
function PoolAllocation({ S, board }) {
  const Seg = ({ label, used, ceil, budget, fmt }) => {
    const over = ceil > budget + 1e-9;
    return (
      <div>
        <div className="flex justify-between text-sm mb-1"><span style={{ color: C.textSecondary }}>{label}</span><span className="tabular-nums" style={{ color: over ? C.red : C.text }}>{fmt(used)} → {fmt(ceil)} / {fmt(budget)}</span></div>
        <div style={{ height: 8, background: C.border, position: 'relative' }}>
          <div style={{ position: 'absolute', height: 8, width: `${clamp(ceil / budget, 0, 1.4) * 100}%`, background: over ? '#E8C9C2' : C.bgAmberDeep }} />
          <div style={{ position: 'absolute', height: 8, width: `${clamp(used / budget, 0, 1.4) * 100}%`, background: C.accent }} />
        </div>
      </div>
    );
  };
  return (
    <div className="p-5 space-y-4" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
      <div className="eyebrow" style={{ color: C.textTertiary }}>Pool allocation</div>
      <Seg label={`Equity (of ${fPct(board.esopNow, 0)} ESOP)`} used={board.sumEq} ceil={board.sumEqCeil} budget={board.esopNow} fmt={(v) => fPct(v, 2)} />
      <Seg label={`Tokens (board bucket ${fPct(board.boardBucket, 2)})`} used={board.sumTk} ceil={board.sumTkCeil} budget={board.boardBucket} fmt={(v) => fPct(v, 2)} />
      <div className="text-xs" style={{ color: C.textTertiary }}>solid = earned · light = ceiling. The board's token bucket is ring-fenced and scalable, separate from the 5% ecosystem advisor pool (~{fPct(S.plan.committedAdvisorTokenPct, 2)} committed there).</div>
    </div>
  );
}

// ===== TAB III: COMPARE =====
function CompareTab({ S, board, setSel }) {
  const cols = Object.keys(S.plan.scenarios);
  return (
    <div className="space-y-8">
      <SectionHead eyebrow="Section III · Compare" title="The board, side by side." desc="Net of strike & scenario dilution. Click a row to open a package." />
      <div style={{ background: C.bgElevated, border: `0.5px solid ${C.border}`, overflowX: 'auto' }}>
        <table className="w-full text-sm" style={{ minWidth: 760 }}>
          <thead><tr style={{ borderBottom: `0.5px solid ${C.borderStrong}` }}>{['Advisor', 'Tier', 'Base eq', 'Earned', 'Ceiling', ...cols.map(k => `Net ${S.plan.scenarios[k].label.toLowerCase()}`), 'Cash/yr'].map(h => <th key={h} className="text-left px-4 py-3 font-normal eyebrow" style={{ color: C.textTertiary }}>{h}</th>)}</tr></thead>
          <tbody>
            {board.rows.map(({ a, c }) => (
              <tr key={a.id} style={{ borderBottom: `0.5px solid ${C.border}`, cursor: 'pointer' }} onClick={() => setSel(a.id)}>
                <td className="px-4 py-3"><div className="font-medium">{a.name}</div></td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5" style={{ background: C.accentBg, color: C.accent }}>{a.mode === 'value' ? '$value' : S.tiers[a.tier]?.name}</span></td>
                <td className="px-4 py-3 tabular-nums">{fPct(c.baseEq, 2)}</td>
                <td className="px-4 py-3 tabular-nums" style={{ color: c.earnedUplift > 0 ? C.green : C.textTertiary }}>+{(c.earnedUplift * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 tabular-nums" style={{ color: C.textTertiary }}>+{(c.ceilUplift * 100).toFixed(0)}%</td>
                {cols.map(k => <td key={k} className="px-4 py-3 tabular-nums" style={{ fontWeight: k === baseScenKey(S.plan) ? 500 : 400 }}>{fUSD(c.scen.find(x => x.key === k).total)}</td>)}
                <td className="px-4 py-3 tabular-nums">{c.cash ? fUSD(c.cash) : '—'}</td>
              </tr>
            ))}
            <tr style={{ background: C.bgAmber }}><td className="px-4 py-3 font-medium">Board</td><td /><td className="px-4 py-3 tabular-nums font-medium">{fPct(board.rows.reduce((s, r) => s + r.c.baseEq, 0), 2)}</td><td /><td />{cols.map(k => <td key={k} className="px-4 py-3 tabular-nums font-medium">{fUSD(board.cost[k] || 0)}</td>)}<td className="px-4 py-3 tabular-nums font-medium">{fUSD(board.sumCash)}</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <div className="eyebrow mb-3" style={{ color: C.textTertiary }}>Net value across scenarios</div>
        <div className="p-6" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={board.rows.map(({ a, c }) => ({ name: a.name.split(' ')[0], ...Object.fromEntries(c.scen.map(s => [s.label, s.total])) }))} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid stroke={C.border} vertical={false} strokeDasharray="2 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textTertiary, fontFamily: 'IBM Plex Mono' }} axisLine={{ stroke: C.borderStrong }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.textTertiary, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={fUSD} width={52} />
              <Tooltip contentStyle={{ background: C.bgElevated, border: `0.5px solid ${C.borderStrong}`, fontSize: 11 }} formatter={fUSD} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {scenKeys(S.plan).map((k, i) => <Bar key={k} dataKey={S.plan.scenarios[k].label} fill={SCEN_COLORS[i % SCEN_COLORS.length]} />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ===== TAB IV: PROPOSITION =====
function PropositionTab({ S, sel, calc, selId, setSelId, onCopy }) {
  const ms = Object.fromEntries(S.plan.milestones.map(m => [m.id, m.label]));
  const perf = sel.performance || { achieved: [], targeted: [] };
  const shown = S.objectives.filter(o => perf.achieved?.includes(o.id) || perf.targeted?.includes(o.id));
  const sb = calc.base;
  const propText = () => [
    `RAIKU LABS — ADVISORY ENGAGEMENT PROPOSITION`, `Confidential discussion draft · ${sel.name}`, sel.sector, '',
    `BASE (guaranteed): ${fUSD(calc.baseCaseBase)} net at base case`,
    `  Equity: ${fPct(calc.baseEq, 3)} — ${fNum(calc.baseEq * sb.grantN)} options at $${calc.strikePps.toFixed(2)} (net of strike), granted at the bridge, ${S.plan.equityVestYears}yr/${S.plan.equityCliff}mo.`,
    `  Tokens: ${fPct(calc.baseTk, 3)} of supply (RTA), valued at TGE FDV (${fMult(S.plan.scenarios[baseScenKey(S.plan)].tgeMult)}× ${roundLabel(S.plan, S.plan.tgeAnchor)} = ${fUSD(sb.fdv)} base).`,
    sel.hasCash ? `  Cash: ${fUSD(sel.cashAnnual)}/yr post-Series A.` : '',
    '', `PERFORMANCE UPLIFT (counts once its gate is reached):`,
    `  Capital: ${fUSD(S.plan.capitalUplift.per)} introduced adds +${(S.plan.capitalUplift.pct * 100).toFixed(0)}% of base.`,
    ...shown.map(o => `  ${o.label}: +${(o.uplift * 100).toFixed(0)}% — ${o.trigger} (gate: ${ms[o.gate]}).`),
    `  Earned: +${(calc.earnedUplift * 100).toFixed(0)}% · ceiling +${(calc.ceilUplift * 100).toFixed(0)}%.`,
    '', `Net value by scenario: ${calc.scen.map(s => `${s.label} ${fUSD(s.total)}`).join(' · ')}.`,
    `Equity is options struck at the bridge price; values net of exercise cost and dilution through future rounds. A discussion draft, not a binding offer.`,
  ].filter(Boolean).join('\n');

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center flex-wrap gap-3 no-print">
        <div className="eyebrow" style={{ color: C.accent }}>Section IV · Proposition</div>
        <div className="flex items-center gap-2"><AdvisorPicker S={S} selId={selId} setSelId={setSelId} /><button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 text-sm" style={{ border: `0.5px solid ${C.borderStrong}`, color: C.textSecondary }}><Printer size={13} /> Print</button><button onClick={() => onCopy(propText())} className="flex items-center gap-1.5 px-3 py-2 text-sm" style={{ border: `0.5px solid ${C.borderStrong}`, color: C.textSecondary }}><Copy size={13} /> Copy</button></div>
      </div>
      <div className="print-area" style={{ background: C.bgElevated, border: `0.5px solid ${C.borderStrong}` }}>
        <div className="px-8 sm:px-12 py-10" style={{ borderBottom: `0.5px solid ${C.border}` }}>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div><div className="eyebrow" style={{ color: C.textTertiary }}>Confidential · Discussion Draft</div><div className="font-display text-2xl mt-2">Raiku Labs</div><div className="text-sm mt-1" style={{ color: C.textSecondary }}>Advisory Engagement Proposition</div></div>
            <div className="text-right"><div className="eyebrow" style={{ color: C.textTertiary }}>Prepared for</div><div className="font-display text-xl mt-2">{sel.name}</div><div className="text-xs mt-1 max-w-xs" style={{ color: C.textTertiary }}>{sel.sector}</div></div>
          </div>
        </div>
        <div className="px-8 sm:px-12 py-12 space-y-14">
          <div className="max-w-3xl">
            <div className="eyebrow mb-6" style={{ color: C.accent }}>An invitation to the founding advisory board</div>
            <h1 className="font-display leading-tight" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 350 }}>A {sel.years}-year engagement,<br /><span className="font-display-italic" style={{ color: C.accent }}>a base that grows</span><br />with what you build.</h1>
            <p className="mt-8 text-base max-w-2xl" style={{ color: C.textSecondary, lineHeight: 1.65 }}>Every founding advisor starts on the same guaranteed base in options and protocol tokens{sel.hasCash ? ', with a cash retainer post-Series A' : ''}. On top of that base, the package grows as you help Raiku hit its objectives — capital, customers, partnerships, governance — reviewed at six and twelve months.</p>
          </div>

          <div className="p-5 text-sm max-w-3xl" style={{ background: C.bgAmber, border: `0.5px solid ${C.borderStrong}`, color: C.textSecondary, lineHeight: 1.6 }}>
            <div className="eyebrow mb-2" style={{ color: C.accent }}>How to read this</div>
            Your options are priced at today's share value, so their <b>net</b> worth is the upside <i>above</i> that price — at a modest exit they can be worth little, which is normal for options; the value is in the climb. Tokens are a fixed share of supply with no exercise cost. Equity dilutes as Raiku raises later rounds (tokens don't). The package <b>grows</b> as you hit objectives — each counts once its milestone is reached. The three scenarios are a deliberately wide range, not a forecast.
          </div>
          <div className="grid md:grid-cols-3" style={{ borderTop: `0.5px solid ${C.borderStrong}`, borderBottom: `0.5px solid ${C.borderStrong}` }}>
            <PCell order="i" eyebrow="Base · net" value={fUSD(calc.baseCaseBase)} foot={`${fPct(calc.baseEq, 2)} equity + ${fPct(calc.baseTk, 3)} tokens`} />
            <PCell order="ii" eyebrow="Current · earned" value={fUSD(calc.baseCaseTotal)} foot={calc.earnedUplift > 0 ? `+${(calc.earnedUplift * 100).toFixed(0)}% earned` : 'no uplift yet'} accent />
            <PCell order="iii" eyebrow="Ceiling" value={fUSD(calc.baseCaseCeil)} foot={`+${(calc.ceilUplift * 100).toFixed(0)}% over base`} />
          </div>
          <div>
            <div className="eyebrow mb-2" style={{ color: C.textTertiary }}>Net value across outcomes · net of strike & dilution</div>
            <div className="grid grid-cols-3 gap-px" style={{ background: C.border }}>
              {calc.scen.map(s => <div key={s.key} className="p-6" style={{ background: s.key === baseScenKey(S.plan) ? C.bgAmber : C.bgElevated }}><div className="eyebrow mb-2" style={{ color: s.key === baseScenKey(S.plan) ? C.accent : C.textTertiary }}>{s.label} · {fPct(s.retention, 0)} kept</div><div className="font-display text-2xl tabular-nums">{fUSD(s.total)}</div><div className="text-xs mt-2" style={{ color: C.textTertiary }}>eq {s.underwater ? 'underwater' : fUSD(s.equity)} · tok {fUSD(s.token)}</div></div>)}
            </div>
          </div>
          <div className="text-xs" style={{ color: C.textTertiary, lineHeight: 1.6, borderTop: `0.5px solid ${C.border}`, paddingTop: 16 }}>
            Ackermann Systems Engineering Ltd (t/a Raiku), Cayman Islands. Options over ordinary non-voting shares (ESOP), strike at the {roundLabel(S.plan, calc.grantRound)} price; net exercise permitted. Tokens via Restricted Token Award. Equity vests {S.plan.equityVestYears}yr/{S.plan.equityCliff}mo annually with a 1-year cliff; exercise binds a deed of adherence. Change-of-control acceleration is at Board discretion (not contractual). {sel.taxResidency === 'UK' ? 'As a UK grantee, a s431 election is required within 14 days of exercise (restricted securities).' : sel.taxResidency === 'US' ? 'As a US grantee, s83(b)/409A treatment applies.' : 'Tax treatment depends on residency.'} Strike subject to an agreed HMRC SAV / 409A valuation before first grant. If no exit by the 9th anniversary, a ≥90-day exercise window opens (Option Certificate 3.6). Subject to required investor consents. Not a binding offer or legal/financial advice.
          </div>
        </div>
      </div>
    </div>
  );
}
function PCell({ order, eyebrow, value, foot, accent }) {
  return <div className="p-8" style={{ background: accent ? C.bgAmber : 'transparent', borderRight: `0.5px solid ${C.border}` }}><div className="flex items-baseline gap-3 mb-5"><span className="font-mono text-xs" style={{ color: accent ? C.accent : C.textTertiary }}>{order}</span><span className="eyebrow" style={{ color: accent ? C.accent : C.textTertiary }}>{eyebrow}</span></div><div className="font-display tabular-nums" style={{ fontSize: '2.4rem', fontWeight: 350, lineHeight: 1 }}>{value}</div><div className="text-xs mt-5 max-w-xs" style={{ color: C.textTertiary, lineHeight: 1.5 }}>{foot}</div></div>;
}

// ===== CONFIGURE PAGE =====
function ConfigureTab({ S, dispatch, setTab }) {
  const setP = (k, v) => dispatch({ type: 'SET', path: ['plan', k], value: v });
  const setBridge = (k, v) => dispatch({ type: 'SET', path: ['plan', 'bridge', k], value: v });
  const setBG = (k, v) => dispatch({ type: 'SET', path: ['plan', 'baseGrant', k], value: v });
  const setScn = (sk, rid, k, v) => dispatch({ type: 'SET', path: ['plan', 'scenarios', sk, rid, k], value: v });
  const setScnMult = (sk, v) => dispatch({ type: 'SET', path: ['plan', 'scenarios', sk, 'tgeMult'], value: v });
  const setObj = (i, k, v) => dispatch({ type: 'SET', path: ['objectives', i, k], value: v });
  const setTier = (i, k, v) => dispatch({ type: 'SET', path: ['tiers', i, k], value: v });
  const setCU = (k, v) => dispatch({ type: 'SET', path: ['plan', 'capitalUplift', k], value: v });
  const ms = S.plan.milestones; const bg = S.plan.baseGrant;
  const csvRef = useRef(null);
  const importRoadmap = (e) => { const f = e.target.files?.[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { dispatch({ type: 'SET_ROADMAP', roadmap: parseRoadmapCSV(rd.result, S.plan) }); } catch { /* ignore */ } }; rd.readAsText(f); e.target.value = ''; };
  const downloadRoadmap = () => io.download('raiku-roadmap.csv', roadmapToCSV(S.plan), 'text/csv');
  return (
    <div style={{ background: C.text, color: C.bg }} className="-mx-4 sm:-mx-6 -my-8 sm:-my-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex justify-between items-center"><div><div className="eyebrow" style={{ color: C.accentLight }}>Section VI · Configure</div><div className="font-display text-2xl mt-1" style={{ color: C.bg }}>Plan basis & controls</div></div><button onClick={() => setTab('overview')} className="flex items-center gap-1.5 px-4 py-2 text-sm" style={{ background: C.accentLight, color: C.text }}><Check size={14} /> Done</button></div>
        <div className="flex items-center gap-2 flex-wrap p-3" style={{ background: '#2A2520', border: `0.5px solid #4A4640` }}>
          <span className="eyebrow" style={{ color: C.accentLight }}>Roadmap CSV</span>
          <input ref={csvRef} type="file" accept=".csv,text/csv" onChange={importRoadmap} style={{ display: 'none' }} />
          <button onClick={() => csvRef.current?.click()} className="flex items-center gap-1 px-2.5 py-1 text-xs" style={{ border: `0.5px solid #4A4640`, color: C.bg }}><Upload size={12} /> Import</button>
          <button onClick={downloadRoadmap} className="flex items-center gap-1 px-2.5 py-1 text-xs" style={{ border: `0.5px solid #4A4640`, color: C.bg }}><FileText size={12} /> Download</button>
          <span className="text-xs" style={{ color: '#A8A29E' }}>columns: scope,round,postMoney,raise,esopPct,tgeMult — ingest cap-table / dilution-model updates</span>
        </div>

        <div className="p-4" style={{ background: '#2A2520', border: `0.5px solid #4A4640` }}>
          <div className="eyebrow mb-3" style={{ color: C.accentLight }}>Bridge (fixed grant event) · {fPct(S.plan.fdPreESOP && 0, 0)}cap table {fNum(S.plan.fdPreESOP)} FD pre-ESOP</div>
          <div className="grid sm:grid-cols-4 gap-4">
            <DField dark label="Bridge post-money" value={S.plan.bridge.post} onChange={v => setBridge('post', v)} fmt="usd" />
            <DField dark label="Bridge raise" value={S.plan.bridge.raise} onChange={v => setBridge('raise', v)} fmt="usd" />
            <div><div className="eyebrow mb-1" style={{ color: '#A8A29E' }}>ESOP at adoption</div><select value={S.plan.esopStart} onChange={e => setP('esopStart', Number(e.target.value))} className="w-full px-2 py-1 text-sm" style={{ background: '#1A1815', border: `0.5px solid #4A4640`, color: C.bg }}><option value={0.10}>10%</option><option value={0.15}>15%</option></select></div>
            <DField dark label="ESOP cap" value={S.plan.esopCap} onChange={v => setP('esopCap', v)} fmt="pct" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3"><div className="eyebrow" style={{ color: C.accentLight }}>Rounds · priced events after the bridge (order matters)</div><button onClick={() => dispatch({ type: 'ADD_ROUND' })} className="flex items-center gap-1 px-2.5 py-1 text-xs" style={{ border: `0.5px solid #4A4640`, color: C.bg }}><Plus size={12} /> Add round</button></div>
          <div className="grid sm:grid-cols-4 gap-2 mb-5">
            {(S.plan.rounds || []).map((rd, i) => (
              <div key={rd.id} className="p-2 flex items-center gap-2" style={{ background: '#2A2520', border: `0.5px solid #4A4640` }}>
                <span className="font-mono text-xs" style={{ color: '#A8A29E' }}>{i + 1}</span>
                <input value={rd.label} onChange={e => dispatch({ type: 'SET', path: ['plan', 'rounds', i, 'label'], value: e.target.value })} className="bg-transparent text-sm flex-1" style={{ color: C.bg, outline: 'none', borderBottom: `1px solid #4A4640` }} />
                {S.plan.rounds.length > 1 && <button onClick={() => dispatch({ type: 'DEL_ROUND', id: rd.id })} aria-label="Delete round" style={{ color: '#A8A29E' }}><Trash2 size={12} /></button>}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3"><div className="eyebrow" style={{ color: C.accentLight }}>Scenario paths · per-round post-money / ESOP & TGE multiple</div><button onClick={() => dispatch({ type: 'ADD_SCENARIO' })} className="flex items-center gap-1 px-2.5 py-1 text-xs" style={{ border: `0.5px solid #4A4640`, color: C.bg }}><Plus size={12} /> Add scenario</button></div>
          <div className="space-y-2">
            {Object.keys(S.plan.scenarios).map(sk => {
              const w = walkScenario(S.plan, sk); const fdv = tgeFdvFor(S.plan, sk, w); const isBase = sk === baseScenKey(S.plan);
              return (
                <div key={sk} className="p-3" style={{ background: '#2A2520', border: `0.5px solid ${isBase ? C.accentLight : '#4A4640'}` }}>
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <input value={S.plan.scenarios[sk].label} onChange={e => dispatch({ type: 'SET', path: ['plan', 'scenarios', sk, 'label'], value: e.target.value })} className="font-display bg-transparent" style={{ color: C.bg, outline: 'none', borderBottom: `1px solid #4A4640`, width: 150 }} />
                      <button onClick={() => setP('baseScenario', sk)} className="text-xs px-2 py-0.5" style={{ border: `0.5px solid ${isBase ? C.accentLight : '#4A4640'}`, color: isBase ? C.accentLight : '#A8A29E' }}>{isBase ? '★ base' : 'set base'}</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs tabular-nums" style={{ color: '#A8A29E' }}>exit {fUSD(w.exit.post)} · {fPct(safeDiv(w.byId.bridge.N, w.exit.N), 0)} kept · FDV {fUSD(fdv)}</span>
                      {Object.keys(S.plan.scenarios).length > 1 && <button onClick={() => dispatch({ type: 'DEL_SCENARIO', key: sk })} aria-label="Delete scenario" style={{ color: '#A8A29E' }}><Trash2 size={13} /></button>}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-4 gap-3">
                    {(S.plan.rounds || []).map(rd => (
                      <div key={rd.id} className="flex gap-2">
                        <div className="flex-1"><DField dark label={`${rd.label} post`} value={S.plan.scenarios[sk][rd.id]?.post} onChange={v => setScn(sk, rd.id, 'post', v)} fmt="usd" /></div>
                        <div style={{ width: 54 }}><DField dark label="ESOP" value={S.plan.scenarios[sk][rd.id]?.esop} onChange={v => setScn(sk, rd.id, 'esop', v)} fmt="pct" /></div>
                      </div>
                    ))}
                    <DField dark label="TGE ×" value={S.plan.scenarios[sk].tgeMult} onChange={v => setScnMult(sk, v)} fmt="mult" />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-3">
            <div><div className="eyebrow mb-1" style={{ color: '#A8A29E' }}>TGE FDV anchor (round before TGE)</div><select value={S.plan.tgeAnchor} onChange={e => setP('tgeAnchor', e.target.value)} className="w-full px-2 py-1 text-sm" style={{ background: '#1A1815', border: `0.5px solid #4A4640`, color: C.bg }}>{roundList(S.plan).map(r => <option key={r} value={r}>{roundLabel(S.plan, r)}</option>)}</select></div>
            <DField dark label="Upside exit multiple" value={S.plan.exitMultiple} onChange={v => setP('exitMultiple', v)} fmt="mult" />
            <label className="flex items-end gap-2 text-xs pb-1" style={{ color: '#C9C2BA' }}><input type="checkbox" checked={S.plan.showBenchmarks} onChange={e => setP('showBenchmarks', e.target.checked)} style={{ accentColor: C.accentLight }} /> Show industry benchmarks ($1B FDV caution)</label>
          </div>
          <div className="text-xs mt-2 flex items-center gap-1" style={{ color: C.accentLight }}><AlertTriangle size={11} /> TGE multipliers are working assumptions — validate against tokenomics before sharing externally.</div>
        </div>

        <div className="p-4" style={{ background: '#2A2520', border: `0.5px solid #4A4640` }}>
          <div className="flex items-center gap-2 mb-3"><Layers size={13} style={{ color: C.accentLight }} /><div className="eyebrow" style={{ color: C.accentLight }}>Uniform base · tokens & pools</div></div>
          <div className="grid sm:grid-cols-4 gap-4">
            <DField dark label="Base equity %" value={bg.equityPct} onChange={v => setBG('equityPct', v)} fmt="pct" />
            <DField dark label="Base token %" value={bg.tokenPct} onChange={v => setBG('tokenPct', v)} fmt="pct" />
            <DField dark label="Advisor token pool" value={S.plan.advisorTokenPoolPct} onChange={v => setP('advisorTokenPoolPct', v)} fmt="pct" />
            <DField dark label="…committed (ecosystem)" value={S.plan.committedAdvisorTokenPct} onChange={v => setP('committedAdvisorTokenPct', v)} fmt="pct" />
            <DField dark label="Board bucket (ring-fenced)" value={S.plan.boardTokenBucketPct} onChange={v => setP('boardTokenBucketPct', v)} fmt="pct" />
            <DField dark label="Token supply" value={S.plan.tokenSupply} onChange={v => setP('tokenSupply', v)} />
            <DField dark label="CoC acceleration" value={S.plan.cocAccelPct} onChange={v => setP('cocAccelPct', v)} fmt="pct" />
            <DField dark label="Equity vest yrs" value={S.plan.equityVestYears} onChange={v => setP('equityVestYears', v)} />
            <div><div className="eyebrow mb-1" style={{ color: '#A8A29E' }}>TGE date</div><input type="date" value={S.plan.tgeDate} onChange={e => setP('tgeDate', e.target.value)} className="w-full px-2 py-1 text-sm" style={{ background: '#1A1815', border: `0.5px solid #4A4640`, color: C.bg }} /></div>
          </div>
        </div>

        <div className="p-4" style={{ background: '#2A2520', border: `0.5px solid #4A4640` }}>
          <div className="eyebrow mb-3" style={{ color: C.accentLight }}>Capital-introduced schedule</div>
          <div className="grid sm:grid-cols-4 gap-4">
            <DField dark label="Per (USD)" value={S.plan.capitalUplift.per} onChange={v => setCU('per', v)} fmt="usd" />
            <DField dark label="Adds %base" value={S.plan.capitalUplift.pct} onChange={v => setCU('pct', v)} fmt="pct" />
            <DField dark label="Cap %base" value={S.plan.capitalUplift.cap} onChange={v => setCU('cap', v)} fmt="pct" />
            <div><div className="eyebrow mb-1" style={{ color: '#A8A29E' }}>Gate</div><select value={S.plan.capitalUplift.gate} onChange={e => setCU('gate', e.target.value)} className="w-full px-2 py-1 text-sm" style={{ background: '#1A1815', border: `0.5px solid #4A4640`, color: C.bg }}>{ms.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3"><div className="eyebrow" style={{ color: C.accentLight }}>Objectives</div><button onClick={() => dispatch({ type: 'ADD_OBJ' })} className="flex items-center gap-1 px-2.5 py-1 text-xs" style={{ border: `0.5px solid #4A4640`, color: C.bg }}><Plus size={12} /> Add</button></div>
          <div className="space-y-2">
            {S.objectives.map((o, i) => (
              <div key={o.id} className="p-3 grid sm:grid-cols-12 gap-3 items-center" style={{ background: '#2A2520', border: `0.5px solid #4A4640` }}>
                <input value={o.label} onChange={e => setObj(i, 'label', e.target.value)} className="sm:col-span-3 px-2 py-1 text-sm" style={{ background: '#1A1815', border: `0.5px solid #4A4640`, color: C.bg }} />
                <select value={o.category} onChange={e => setObj(i, 'category', e.target.value)} className="sm:col-span-2 px-2 py-1 text-sm" style={{ background: '#1A1815', border: `0.5px solid #4A4640`, color: C.bg }}>{Object.entries(CAT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                <input value={o.trigger} onChange={e => setObj(i, 'trigger', e.target.value)} className="sm:col-span-4 px-2 py-1 text-xs" style={{ background: '#1A1815', border: `0.5px solid #4A4640`, color: '#C9C2BA' }} />
                <div className="sm:col-span-1"><DField dark label="Uplift" value={o.uplift} onChange={v => setObj(i, 'uplift', v)} fmt="pct" /></div>
                <select value={o.gate} onChange={e => setObj(i, 'gate', e.target.value)} className="sm:col-span-1 px-2 py-1 text-xs" style={{ background: '#1A1815', border: `0.5px solid #4A4640`, color: C.bg }}>{ms.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
                <button onClick={() => dispatch({ type: 'DEL_OBJ', id: o.id })} aria-label="Delete" className="sm:col-span-1 justify-self-end" style={{ color: '#A8A29E' }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3"><div className="eyebrow" style={{ color: C.accentLight }}>Tiers · multiplier on the uniform base</div><button onClick={() => dispatch({ type: 'ADD_TIER' })} className="flex items-center gap-1 px-2.5 py-1 text-xs" style={{ border: `0.5px solid #4A4640`, color: C.bg }}><Plus size={12} /> Add tier</button></div>
          <div className="grid sm:grid-cols-3 gap-4">
            {S.tiers.map((t, i) => (
              <div key={i} className="p-4" style={{ background: '#2A2520', border: `0.5px solid #4A4640` }}>
                <div className="flex items-center justify-between mb-3 gap-2"><input value={t.name} onChange={e => setTier(i, 'name', e.target.value)} className="font-display text-lg bg-transparent flex-1" style={{ color: C.bg, outline: 'none', borderBottom: `1px solid #4A4640` }} />{S.tiers.length > 1 && <button onClick={() => dispatch({ type: 'DEL_TIER', index: i })} aria-label="Delete tier" style={{ color: '#A8A29E' }}><Trash2 size={13} /></button>}</div>
                <div className="grid grid-cols-2 gap-2"><DField dark label="Multiplier" value={t.mult} onChange={v => setTier(i, 'mult', v)} fmt="mult" /><div><div className="eyebrow mb-1" style={{ color: '#A8A29E' }}>= Equity</div><div className="font-display text-lg tabular-nums" style={{ color: C.bg }}>{fPct(bg.equityPct * (t.mult || 1), 2)}</div></div></div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3"><div className="eyebrow" style={{ color: C.accentLight }}>Milestones · gates for performance uplift (in order)</div><button onClick={() => dispatch({ type: 'ADD_MS' })} className="flex items-center gap-1 px-2.5 py-1 text-xs" style={{ border: `0.5px solid #4A4640`, color: C.bg }}><Plus size={12} /> Add milestone</button></div>
          <div className="grid sm:grid-cols-4 gap-2">
            {S.plan.milestones.map((m, i) => (
              <div key={m.id} className="p-2 flex items-center gap-2" style={{ background: '#2A2520', border: `0.5px solid #4A4640` }}>
                <span className="font-mono text-xs" style={{ color: '#A8A29E' }}>{i + 1}</span>
                <input value={m.label} onChange={e => dispatch({ type: 'SET', path: ['plan', 'milestones', i, 'label'], value: e.target.value })} className="bg-transparent text-sm flex-1" style={{ color: C.bg, outline: 'none', borderBottom: `1px solid #4A4640` }} />
                {S.plan.milestones.length > 1 && <button onClick={() => dispatch({ type: 'DEL_MS', id: m.id })} aria-label="Delete milestone" style={{ color: '#A8A29E' }}><Trash2 size={12} /></button>}
              </div>
            ))}
          </div>
          <div className="text-xs mt-2" style={{ color: '#A8A29E' }}>Order sets gating: an objective counts once the company stage reaches its gate. Deleting a milestone reassigns dependent gates to the first.</div>
        </div>
      </div>
    </div>
  );
}
function DField({ label, value, onChange, fmt = 'num' }) {
  const [edit, setEdit] = useState(false);
  const disp = fmt === 'usd' ? fUSD(value) : fmt === 'pct' ? fPct(value, 2) : fmt === 'mult' ? fMult(value) : fNum(value);
  const commit = (raw) => { let v = parseFloat(String(raw).replace(/[^0-9.\-]/g, '')); if (!isNaN(v)) { if (fmt === 'pct') v /= 100; onChange(v); } setEdit(false); };
  return (
    <div>
      <div className="eyebrow mb-1" style={{ color: '#A8A29E' }}>{label}</div>
      {edit ? <input autoFocus defaultValue={fmt === 'pct' ? +(value * 100).toFixed(4) : value} onBlur={e => commit(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} className="w-full px-2 py-1 font-mono text-sm" style={{ background: '#1A1815', border: `0.5px solid ${C.accentLight}`, color: C.bg }} />
        : <button onClick={() => setEdit(true)} className="font-display text-lg tabular-nums text-left" style={{ color: C.bg }}>{disp}</button>}
    </div>
  );
}

// ===== SAVED MANAGER =====
function Mgr({ saved, current, onLoad, onDel, onSaveAs, onClose }) {
  const [nm, setNm] = useState('');
  const names = Object.keys(saved);
  return (
    <div style={{ background: C.text, color: C.bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex justify-between items-center mb-2"><div className="eyebrow" style={{ color: C.accentLight }}>Saved boards</div><button onClick={onClose} aria-label="Close" style={{ color: C.bg }}><X size={16} /></button></div>
        <div className="text-xs mb-4" style={{ color: '#A8A29E' }}>Saves are local to this browser. To share a board with the council, use <b>Copy</b> (clipboard) or <b>JSON</b> (file) in the header.</div>
        {names.length === 0 && <div className="text-sm mb-4" style={{ color: '#A8A29E' }}>No saved boards yet.</div>}
        <div className="grid sm:grid-cols-3 gap-2 mb-4">{names.map(n => <div key={n} className="flex items-center justify-between px-3 py-2 text-sm" style={{ background: n === current ? '#2A2520' : 'transparent', border: `0.5px solid #4A4640` }}><button onClick={() => onLoad(n)} className="flex items-center gap-2 flex-1 text-left" style={{ color: C.bg }}>{n === current && <Check size={12} style={{ color: C.accentLight }} />} {n}</button><button onClick={() => onDel(n)} aria-label="Delete" style={{ color: '#A8A29E' }}><Trash2 size={13} /></button></div>)}</div>
        <div className="flex items-center gap-2 flex-wrap"><input value={nm} onChange={e => setNm(e.target.value)} placeholder="Save current as…" className="px-3 py-1.5 text-xs" style={{ background: '#2A2520', border: `0.5px solid #4A4640`, color: C.bg, width: 180 }} /><button onClick={() => { if (nm) { onSaveAs(nm); setNm(''); } }} className="px-3 py-1.5 text-xs" style={{ background: C.accentLight, color: C.text }}>Save as</button></div>
      </div>
    </div>
  );
}

// ===== VALUATION STAIRCASE (Wave C) =====
function ValuationStaircase({ S }) {
  const w = walkScenario(S.plan, 'base');
  const data = w.steps.map(s => ({ name: s.label, Raiku: s.post, Median: BENCH.postMoney[s.id] || null }));
  const fdv = tgeFdvFor(S.plan, 'base', w);
  return (
    <div className="p-5" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }} role="img" aria-label={`Valuation path base case: ${w.steps.map(s => `${s.label} ${fUSD(s.post)}`).join(', ')}; TGE FDV ${fUSD(fdv)}.`}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="eyebrow" style={{ color: C.textTertiary }}>Valuation path · base case{S.plan.showBenchmarks ? ' vs market median' : ''}</div>
        <div className="text-xs tabular-nums" style={{ color: C.textTertiary }}>TGE FDV {fUSD(fdv)} · {fMult(S.plan.scenarios[baseScenKey(S.plan)].tgeMult)} × {roundLabel(S.plan, S.plan.tgeAnchor)}</div>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }} barGap={2}>
          <CartesianGrid stroke={C.border} vertical={false} strokeDasharray="2 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.text, fontFamily: 'IBM Plex Mono' }} axisLine={{ stroke: C.borderStrong }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: C.textTertiary, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={fUSD} width={48} />
          <Tooltip cursor={{ fill: C.bgAmber }} contentStyle={{ background: C.bgElevated, border: `0.5px solid ${C.borderStrong}`, fontSize: 11 }} formatter={(v, n) => [v == null ? '—' : fUSD(v), n]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Raiku" fill={C.accent} radius={[2, 2, 0, 0]} />
          {S.plan.showBenchmarks && <Bar dataKey="Median" fill={C.bgAmberDeep} radius={[2, 2, 0, 0]} />}
        </BarChart>
      </ResponsiveContainer>
      {S.plan.showBenchmarks && <div className="text-xs mt-1" style={{ color: C.textTertiary }}>Median = 2025 market post-money by stage. Raiku's plan runs above median — an ambitious path.</div>}
    </div>
  );
}

const TIER_COLOR = ['#3E5C76', '#C46A1F', '#9C4A0C', '#6B7F6E'];
// ===== POTENTIAL SCATTER (Wave C) =====
function PotentialScatter({ S, board, setSel }) {
  const data = board.rows.map(({ a, c }) => ({ name: a.name.split(' ')[0], x: c.baseCaseTotal, y: Math.max(0, c.baseCaseCeil - c.baseCaseTotal), z: Math.max(a.performance?.capitalIntroduced || 0, 1), tier: a.tier || 0, id: a.id }));
  return (
    <div className="p-5" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }} role="img" aria-label="Advisor potential: current net value on x, remaining headroom to ceiling on y, bubble size is capital introduced.">
      <div className="eyebrow mb-3" style={{ color: C.textTertiary }}>Untapped potential · current net value (x) vs headroom to ceiling (y) · bubble = capital introduced</div>
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 12, right: 18, left: 4, bottom: 4 }}>
          <CartesianGrid stroke={C.border} strokeDasharray="2 3" />
          <XAxis type="number" dataKey="x" name="current" tick={{ fontSize: 10, fill: C.textTertiary, fontFamily: 'IBM Plex Mono' }} axisLine={{ stroke: C.borderStrong }} tickLine={false} tickFormatter={fUSD} />
          <YAxis type="number" dataKey="y" name="headroom" tick={{ fontSize: 10, fill: C.textTertiary, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={fUSD} width={48} />
          <ZAxis type="number" dataKey="z" range={[80, 480]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: C.bgElevated, border: `0.5px solid ${C.borderStrong}`, fontSize: 11 }} formatter={(v, n) => [fUSD(v), n]} labelFormatter={() => ''} />
          <Scatter data={data} onClick={(d) => d && d.id && setSel(d.id)} style={{ cursor: 'pointer' }}>
            {data.map((d, i) => <Cell key={i} fill={TIER_COLOR[d.tier] || C.accent} fillOpacity={0.7} />)}
            <LabelList dataKey="name" position="top" style={{ fontSize: 9, fill: C.textSecondary, fontFamily: 'IBM Plex Mono' }} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex gap-3 text-xs mt-1 flex-wrap" style={{ color: C.textTertiary }}>{S.tiers.map((t, i) => <span key={i} className="flex items-center gap-1"><span style={{ width: 8, height: 8, background: TIER_COLOR[i], borderRadius: '50%', display: 'inline-block' }} />{t.name}</span>)}<span className="ml-auto">top-left = most headroom, modest today</span></div>
    </div>
  );
}

// ===== MIX BREAKDOWN (Wave B) =====
function MixBreakdown({ calc }) {
  const eq = calc.baseEqNet, tk = calc.tkPct * calc.base.fdv, cash = calc.cashTotal;
  const total = Math.max(1, eq + tk + cash);
  const seg = [['Options', eq, C.accent], ['Tokens', tk, C.accentLight], ['Cash', cash, C.textTertiary]].filter(s => s[1] > 0);
  return (
    <div className="p-5" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
      <div className="eyebrow mb-3" style={{ color: C.textTertiary }}>Mix · base-case net value</div>
      <div className="flex w-full" style={{ height: 18, background: C.bg }}>
        {seg.map(([l, v, c]) => <div key={l} title={`${l} ${fUSD(v)}`} className="grow-val" style={{ width: `${(v / total) * 100}%`, background: c }} />)}
      </div>
      <div className="flex flex-wrap gap-3 text-xs mt-2" style={{ color: C.textSecondary }}>
        {seg.map(([l, v, c]) => <span key={l} className="flex items-center gap-1"><span style={{ width: 8, height: 8, background: c, display: 'inline-block' }} />{l} {fPct(v / total, 0)} <span style={{ color: C.textTertiary }}>({fUSD(v)})</span></span>)}
      </div>
    </div>
  );
}

// ===== VESTING TIMELINE (restored) =====
function VestingTimeline({ S, calc, sel, setA }) {
  const [showCoc, setShowCoc] = useState(false);
  const sb = calc.base;
  const Vb = sb.exitVal;
  const baseEqNetFull = sb.netEqAt(calc.baseEq, Vb);
  const earnedEqNetFull = sb.netEqAt(calc.eqPct, Vb);
  const upliftEqNetFull = Math.max(0, earnedEqNetFull - baseEqNetFull);
  const tokenFull = calc.tkPct * sb.fdv;
  const startISO = sel.startDate || todayISO();
  const upliftStart = clamp(sel.upliftStartMonth ?? 6, 0, 48);
  const tgeOffset = clamp(monthsBetween(startISO, S.plan.tgeDate), 0, 48);
  const nowOffset = clamp(monthsBetween(startISO, todayISO()), 0, 48);
  const cd = [];
  for (let m = 0; m <= 48; m++) {
    const evB = vestedFrac(m, S.plan.equityVestYears, S.plan.equityCliff);
    const evU = vestedFrac(m - upliftStart, S.plan.equityVestYears, S.plan.equityCliff);
    const tv = m >= tgeOffset ? vestedFrac(m - tgeOffset, S.plan.tokenVestYears, S.plan.tokenCliff) : 0;
    cd.push({ month: m, BaseEquity: evB * baseEqNetFull, Uplift: evU * upliftEqNetFull, Tokens: tv * tokenFull });
  }
  const fullTotal = baseEqNetFull + upliftEqNetFull + tokenFull;
  const vNowRow = cd[clamp(Math.round(nowOffset), 0, 48)] || cd[0];
  const vNow = vNowRow.BaseEquity + vNowRow.Uplift + vNowRow.Tokens;
  const cocAccel = S.plan.cocAccelPct || 0;
  const acceleratedTotal = vNow + cocAccel * (fullTotal - vNow);
  return (
    <div className="p-5" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }} role="img" aria-label={`Vested value over 48 months: base equity, uplift and tokens, net of strike at base case. Cliff at 12 months, Bad-Leaver line at 24 months.`}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="eyebrow" style={{ color: C.textTertiary }}>Vested value over time · base case, net of strike</div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCoc(v => !v)} title="Change of control — Board discretion, not guaranteed" className="text-xs px-2 py-1" style={{ border: `0.5px solid ${showCoc ? C.blue : C.borderStrong}`, color: showCoc ? C.blue : C.textSecondary, background: showCoc ? '#EEF2F5' : 'transparent' }}>CoC {fPct(cocAccel, 0)}</button>
          <Field label="Uplift earned at (month)"><div style={{ width: 56 }}><NumIn value={sel.upliftStartMonth ?? 6} onChange={(v) => setA('upliftStartMonth', v)} min={0} max={48} ariaLabel="Uplift earn month" /></div></Field>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={cd} margin={{ top: 10, right: 12, left: -6, bottom: 0 }}>
          <defs>
            <linearGradient id="vb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity={0.3} /><stop offset="100%" stopColor={C.accent} stopOpacity={0.03} /></linearGradient>
            <linearGradient id="vu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={0.32} /><stop offset="100%" stopColor={C.green} stopOpacity={0.04} /></linearGradient>
            <linearGradient id="vt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accentLight} stopOpacity={0.3} /><stop offset="100%" stopColor={C.accentLight} stopOpacity={0.03} /></linearGradient>
          </defs>
          <CartesianGrid stroke={C.border} vertical={false} strokeDasharray="2 3" />
          <XAxis dataKey="month" tick={{ fontSize: 9, fill: C.textTertiary, fontFamily: 'IBM Plex Mono' }} axisLine={{ stroke: C.borderStrong }} tickLine={false} tickFormatter={(v) => `M${v}`} interval={5} />
          <YAxis tick={{ fontSize: 9, fill: C.textTertiary, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={fUSD} width={44} />
          <Tooltip contentStyle={{ background: C.bgElevated, border: `0.5px solid ${C.borderStrong}`, fontSize: 11 }} labelFormatter={(v) => `Month ${v}`} formatter={(v, n) => [fUSD(v), n]} />
          <ReferenceLine x={12} stroke={C.borderStrong} strokeDasharray="2 4" label={{ value: 'cliff', position: 'top', fontSize: 8, fill: C.textTertiary }} />
          <ReferenceLine x={24} stroke={C.red} strokeDasharray="2 4" label={{ value: 'Bad-Leaver', position: 'top', fontSize: 8, fill: C.red }} />
          {tgeOffset > 0 && tgeOffset < 48 && <ReferenceLine x={tgeOffset} stroke={C.accentLight} strokeDasharray="2 4" label={{ value: 'TGE', position: 'top', fontSize: 8, fill: C.accentLight }} />}
          {nowOffset > 0 && nowOffset < 48 && <ReferenceLine x={nowOffset} stroke={C.text} strokeDasharray="1 2" label={{ value: 'today', position: 'top', fontSize: 8, fill: C.text }} />}
          {showCoc && cocAccel > 0 && <ReferenceLine y={acceleratedTotal} stroke={C.blue} strokeDasharray="4 3" label={{ value: 'CoC accel', position: 'insideTopRight', fontSize: 8, fill: C.blue }} />}
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area type="stepAfter" name="Tokens" dataKey="Tokens" stackId="1" stroke={C.accentLight} fill="url(#vt)" strokeWidth={1.4} isAnimationActive={false} />
          <Area type="stepAfter" name="Base equity" dataKey="BaseEquity" stackId="1" stroke={C.accent} fill="url(#vb)" strokeWidth={1.4} isAnimationActive={false} />
          <Area type="stepAfter" name="Uplift" dataKey="Uplift" stackId="1" stroke={C.green} fill="url(#vu)" strokeWidth={1.4} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="text-xs mt-1" style={{ color: C.textTertiary }}>Equity vests 25%/yr after a 1-year cliff; uplift vests from month {upliftStart}; tokens from TGE. Voluntary exit before the 2-year Bad-Leaver line forfeits even vested options. {showCoc && cocAccel > 0 ? `On a change of control today, ${fPct(cocAccel, 0)} of unvested would accelerate → ~${fUSD(acceleratedTotal)} vested (Board discretion, not guaranteed). ` : ''}No exit by year 9 → a ≥90-day exercise window opens (backstop).</div>
    </div>
  );
}

// ===== EQUITY BENCHMARK (FAST) =====
function EquityBenchmark({ sel, calc }) {
  if (sel.mode === 'value') return null;
  const band = BENCH.advisorEquity[benchLevelForTier(sel.tier || 0)];
  const max = 0.012, eq = calc.baseEq;
  const verdict = eq > band.hi + 1e-9 ? 'above market' : eq < band.lo - 1e-9 ? 'below market' : 'in market range';
  const vcol = verdict === 'above market' ? C.accentLight : verdict === 'below market' ? C.blue : C.green;
  return (
    <div className="pt-1" role="img" aria-label={`Base equity ${fPct(eq, 2)} versus FAST ${band.label} band ${fPct(band.lo, 2)} to ${fPct(band.hi, 2)} — ${verdict}.`}>
      <div className="flex items-center justify-between text-xs mb-1"><span style={{ color: C.textTertiary }}>vs industry benchmark · FAST {band.label}</span><span style={{ color: vcol }}>{fPct(eq, 2)} · {verdict}</span></div>
      <div style={{ position: 'relative', height: 8, background: C.bg, border: `0.5px solid ${C.border}` }}>
        <div title={`FAST band ${fPct(band.lo, 2)}–${fPct(band.hi, 2)}`} style={{ position: 'absolute', left: `${(band.lo / max) * 100}%`, width: `${((band.hi - band.lo) / max) * 100}%`, top: 0, height: 8, background: C.bgAmberDeep }} />
        <div style={{ position: 'absolute', left: `${clamp(eq / max, 0, 1) * 100}%`, top: -2, height: 12, width: 2, background: vcol }} />
      </div>
      <div className="text-xs mt-1" style={{ color: C.textTertiary }}>FAST {fPct(band.lo, 2)}–{fPct(band.hi, 2)} per head · advisory pool ~{fPct(BENCH.advisorPool, 0)}. Source: {BENCH.advisorSrc}.</div>
    </div>
  );
}

// ===== OVERVIEW (light, default landing) =====
function Kpi({ label, value, sub, accent }) {
  return <div className="p-4" style={{ background: accent ? C.bgAmber : C.bgElevated }}><div className="eyebrow mb-1" style={{ color: accent ? C.accent : C.textTertiary }}>{label}</div><div className="font-display tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 350, lineHeight: 1.05 }}>{value}</div>{sub && <div className="text-xs mt-1" style={{ color: C.textTertiary }}>{sub}</div>}</div>;
}
function OverviewTab({ S, board, dispatch, setTab, setSel }) {
  if (!S.advisors.length) return <EmptyState dispatch={dispatch} />;
  const scKeys = Object.keys(S.plan.scenarios);
  const lo = scKeys[0], hi = scKeys[scKeys.length - 1];
  const baseEqSum = board.rows.reduce((s, r) => s + r.c.baseEq, 0);
  const w = walkScenario(S.plan, 'base'); const fdv = tgeFdvFor(S.plan, 'base', w);
  const flags = [];
  board.warnings.forEach(x => flags.push({ t: 'budget', m: x }));
  S.advisors.forEach(a => { if (/confirm/i.test(a.notes || '')) flags.push({ t: 'confirm', m: `${a.name}: confirm terms` }); });
  flags.push({ t: 'note', m: 'TGE multipliers (2×/5×/12×) unvalidated — confirm before sharing externally.' });
  flags.push({ t: 'note', m: `ESOP at adoption ${fPct(S.plan.esopStart, 0)} (10% / 15% switch — board decision open).` });
  return (
    <div className="space-y-10">
      <SectionHead eyebrow="Section I · Overview" title="The advisory board, at a glance."
        desc="A live snapshot against the company plan — net of strike and dilution. Open Configure to edit the baseline; click an advisor to model their package."
        right={<button onClick={() => setTab('configure')} className="flex items-center gap-1.5 px-4 py-2 text-sm" style={{ background: C.text, color: C.bg }}><SlidersHorizontal size={14} /> Configure</button>} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px" style={{ background: C.border, border: `0.5px solid ${C.border}` }}>
        <Kpi label="Advisors" value={fNum(board.rows.length)} />
        <Kpi label="Net cost · base" value={fUSD(board.cost[baseScenKey(S.plan)] || 0)} accent />
        <Kpi label={`Range ${S.plan.scenarios[lo].label}→${S.plan.scenarios[hi].label}`} value={`${fUSD(board.cost[lo] || 0)} – ${fUSD(board.cost[hi] || 0)}`} />
        <Kpi label="Equity of company" value={fPct(baseEqSum, 2)} sub="base, pre-uplift" />
        <Kpi label="Tokens of supply" value={fPct(board.sumTk, 2)} sub="earned" />
        <Kpi label="Annual cash" value={fUSD(board.sumCash)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="eyebrow" style={{ color: C.textTertiary }}>Roster · click to open a package</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {board.rows.map(({ a, c }) => (
              <button key={a.id} onClick={() => setSel(a.id)} className="p-4 text-left" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
                <div className="flex items-center justify-between gap-2"><div className="font-medium">{a.name}</div><span className="text-xs px-2 py-0.5 whitespace-nowrap" style={{ background: C.accentBg, color: C.accent }}>{a.mode === 'value' ? '$value' : (S.tiers[a.tier]?.name || '—')}</span></div>
                <div className="text-xs mt-0.5" style={{ color: C.textTertiary }}>{a.sector.split('—')[0].trim()}</div>
                <div className="flex justify-between items-baseline mt-3"><div className="font-display text-xl tabular-nums">{fUSD(c.baseCaseTotal)}</div><div className="text-xs tabular-nums" style={{ color: C.textTertiary }}>{fPct(c.eqPct, 2)} eq · {fPct(c.tkPct, 2)} tok</div></div>
                {c.ceilUplift > c.earnedUplift && <div className="text-xs mt-1" style={{ color: C.green }}>+{(c.ceilUplift * 100).toFixed(0)}% potential at ceiling</div>}
              </button>
            ))}
          </div>
          <div className="text-xs" style={{ color: C.textTertiary }}>Base path: {w.steps.map(s => `${s.label} ${fUSD(s.post)}`).join(' → ')} · TGE FDV {fUSD(fdv)}.</div>
        </div>
        <div className="space-y-6">
          <PoolAllocation S={S} board={board} />
          <div className="p-5 space-y-2" style={{ background: C.bgElevated, border: `0.5px solid ${C.border}` }}>
            <div className="eyebrow" style={{ color: C.textTertiary }}>Benchmark</div>
            <div className="text-sm" style={{ color: C.textSecondary }}>Board base equity <b>{fPct(baseEqSum, 2)}</b> · FAST per-head 0.30–1.00% · advisory pool ~{fPct(BENCH.advisorPool, 0)}.</div>
            <div className="text-xs" style={{ color: C.textTertiary }}>Source: {BENCH.advisorSrc}.</div>
          </div>
          <div className="p-5 space-y-2" style={{ background: flags.some(f => f.t === 'budget') ? '#FBEAE6' : C.bgAmber, border: `0.5px solid ${C.borderStrong}` }}>
            <div className="eyebrow" style={{ color: C.accent }}>To confirm / alerts</div>
            {flags.map((f, i) => <div key={i} className="text-xs flex items-start gap-1.5" style={{ color: f.t === 'budget' ? C.red : C.textSecondary, lineHeight: 1.5 }}><AlertTriangle size={11} style={{ marginTop: 2, flexShrink: 0 }} />{f.m}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== EMPTY STATE =====
function EmptyState({ dispatch, addVia }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24" style={{ background: C.bgElevated, border: `0.5px dashed ${C.borderStrong}` }}>
      <div className="eyebrow mb-3" style={{ color: C.accent }}>Advisory Board</div>
      <h2 className="font-display text-3xl mb-2" style={{ fontWeight: 350 }}>No advisors yet.</h2>
      <p className="text-sm max-w-md mb-6" style={{ color: C.textSecondary, lineHeight: 1.6 }}>Add your first advisor to model a package — a uniform base that grows with performance, net of strike and dilution against the company plan.</p>
      <button onClick={() => (dispatch ? dispatch({ type: 'ADD_ADV' }) : addVia && addVia())} className="flex items-center gap-1.5 px-5 py-2.5 text-sm" style={{ background: C.text, color: C.bg }}><Plus size={14} /> Add advisor</button>
    </div>
  );
}

function Footer({ S }) {
  return (
    <footer className="no-print" style={{ background: C.bgElevated, borderTop: `0.5px solid ${C.border}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-xs space-y-2" style={{ color: C.textTertiary, lineHeight: 1.7 }}>
        <div className="eyebrow" style={{ color: C.textSecondary }}>Notes · all equity values net of strike</div>
        <p>Every advisor starts on the same uniform base ({fPct(S.plan.baseGrant.equityPct, 2)} equity · {fPct(S.plan.baseGrant.tokenPct, 2)} tokens), scaled by tier ({S.tiers.map(t => `${t.name} ${fMult(t.mult)}`).join(' · ')}). Performance uplift grows the grant once its milestone gate is reached. Equity is options struck at the bridge price; value shown is net of exercise cost and of dilution through the cap-table walk (scenario-specific). Tokens are a fixed % of supply valued at TGE FDV = a multiple of the {roundLabel(S.plan, S.plan.tgeAnchor)} valuation. Benchmarks (2025): above $1B TGE FDV, launches mostly traded down — shown as a caution band. A discussion draft, not a binding offer or legal/financial advice.</p>
      </div>
    </footer>
  );
}
