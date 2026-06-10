// Raiku Advisory Comp Studio — pure engine (framework-agnostic, no React/Vue).
// This is the canonical maths: cap-table walk, net-of-strike valuation, scenario
// dilution, TGE-FDV multiplier, gating, channel capital, pools, roadmap CSV.
// Ported verbatim from the verified React artifact. Keep engine.test.mjs green.
// SPDX: internal — Raiku Labs (Ackermann Systems Engineering Ltd).

// ===== types =====
// v2 (COM-162): closedISO marks a round CLOSED — a first-class trajectory event (F17). New
// grants then price at this round (currentRoundStep advances via the milestone), gated capital
// uplifts crystallise, and the close date renders on the Trajectory.
export interface RoundDef { id: string; label: string; closedISO?: string }
export interface RoundVals { post: number; raise: number; esop: number }
// v2 (COM-152): preTgeLiquidity — a liquidity event before TGE converts token awards 1:1 into
// equity ("until we launch a token, all protocol value goes into equity", all-hands 16 Apr).
export interface Scenario { label: string; tgeMult: number; preTgeLiquidity?: boolean; [roundId: string]: any }
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
// v2 (COM-155): the token-workbook vocabulary + 'loi' (a token grant that cancels into options
// when the ESOP is live) + 'promised' (the Konrad 0.7–0.8% / Saikat 0.3–0.6% pattern — open
// promises tracked, never lost).
export const DOC_STATUSES = ['in-draft', 'sent', 'in-review', 'signed', 'cancelled', 'loi', 'promised'] as const;
export type DocStatus = (typeof DOC_STATUSES)[number];

// v2 (COM-155): person-lifecycle vocabularies. checkStatus covers DBS (UK) and the Swiss
// self-requested certificate of suitability; contracting drives the s431 routing in F23.
export const CHECK_STATUSES = ['none', 'requested', 'clear', 'flagged'] as const;
export type CheckStatus = (typeof CHECK_STATUSES)[number];
export const CONTRACTING_STRUCTURES = ['individual', 'entity'] as const;
export type ContractingStructure = (typeof CONTRACTING_STRUCTURES)[number];

// v2 (COM-155): the Review entity — the growth-over-time primitive. Scheduled (the plan cadence,
// open decision #4 — configurable, default 12 months) or event-triggered (e.g. a Series A close).
export const REVIEW_OUTCOMES = ['no-change', 'top-up', 'band-change', 'roll-off'] as const;
export type ReviewOutcome = (typeof REVIEW_OUTCOMES)[number];
export interface Review {
  id: string;
  scheduledISO: string;
  trigger: 'scheduled' | 'event';
  eventNote?: string;             // e.g. "Series A close"
  inputs?: string;                // engagement, objectives earned, board view
  outcome?: ReviewOutcome;        // absent until completed
  approver?: string;
  completedISO?: string;
  note?: string;
}
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
  // v2 (COM-150): the value must be defensible against equivalent professional-services time.
  timeCommitment?: string;        // e.g. "~10 hrs/mo"
  // v2 (COM-171): true on rows the v6 migration MATERIALISED from the v1 implicit package.
  // Derived rows are a refreshed-on-load snapshot for v2-native readers; the PARAMETRIC fields
  // (mode/tier/annualValue/splitOptions/grantRound) stay authoritative for computation until
  // the first explicit edit claims the package (the store strips the flags then).
  derived?: boolean;
}

// v2 (COM-150 / Δ1): tiers become VALUE BANDS — packages denominate in dollars, deliver in
// instruments; percent-of-company is an OUTPUT, never the negotiation unit. Anchor numbers are
// open decision #2 (pending Robin + Carl Sjöström review) and Configure-editable; the v1
// tier-multiplier mode survives untouched as the migration alias.
export interface ValueBand { id: string; label: string; annualUSD: number }
export const VALUE_BANDS_DEFAULT: ValueBand[] = [
  { id: 'base', label: 'Base', annualUSD: 50000 },
  { id: 'strategic', label: 'Strategic', annualUSD: 100000 },
  { id: 'anchor', label: 'Anchor', annualUSD: 150000 },
];
export interface Advisor {
  id: string; name: string; sector: string; mode: 'tier' | 'value'; tier: number;
  years: number; splitOptions: number; annualValue: number; hasCash: boolean; cashAnnual: number;
  startDate: string; upliftStartMonth: number; grantRound: string; taxResidency: 'UK' | 'US' | 'Other';
  notes: string; performance: Performance;
  // PD2 (COM-82): optional per-advisor projection state — additive only, reconcile-normalised, no money path.
  caseOverride?: string; targetExit?: number;
  // v2 (COM-144→171): explicit grants. From v6 the migration MATERIALISES this for legacy
  // advisors as derived-flagged rows (a refreshed-on-load snapshot); computation dispatches on
  // hasExplicitGrants — the parametric v1 package stays authoritative until a real edit.
  grants?: Grant[];
  // v2 (COM-146): first-class capital introductions. ABSENT → the v1 performance.capital*
  // fields drive the uplift; PRESENT → earned introductions drive it (the pipeline feeds the
  // ceiling). Additive — SCHEMA stays 5.
  introductions?: CapitalIntroduction[];
  // v2 (COM-154): the advisor's elected cash floor (annual $) — active only while the plan's
  // cash-floor policy is enabled. Grant-path advisors express floors AS cash grants instead.
  cashFloorAnnualUSD?: number;
  // v2 (COM-155): person-lifecycle fields — additive within SCHEMA 6 (only COM-171 bumps; the
  // issue's bump line predates the §4 ruling). All optional; reconcile heals.
  refereeName?: string;
  checkStatus?: CheckStatus;          // DBS (UK) / Swiss certificate of suitability
  contracting?: ContractingStructure; // individual vs PSC/Contracted Entity — F23 s431 routing
  contractEntity?: string;            // the PSC / Contracted Entity name, when contracting=entity
  supervisor?: string;
  reviews?: Review[];                 // the growth-over-time checkpoints (COM-158 builds the UI)
  // v2 (COM-159): the offer pipeline (F19). ABSENT stage reads 'modeled'; every transition
  // appends to stageHistory (date + optional note/doc link). Departures hand off to F18.
  stage?: AdvisorStage;
  stageHistory?: StageEvent[];
  // v2 (COM-164/Δ12): versioned propositions — the straw-man artefacts as SENT (via Iraj).
  // Each version snapshots the package INPUTS and the COMPUTED figures at send time, because
  // the plan keeps moving under a live negotiation: "what we sent" must stay reproducible even
  // after scenarios/rounds change.
  propositions?: PropositionVersion[];
}

// v2 (COM-164): the version record. figures are FROZEN AT SNAPSHOT (computed then, stored) —
// historical record, never recomputed.
export interface PropositionVersion {
  id: string;
  version: number;
  atISO: string;
  note?: string;
  scenKey: string;
  package: { mode?: string; tier?: number; annualValue?: number; years?: number; splitOptions?: number; grantRound?: string; hasCash?: boolean; cashAnnual?: number };
  figures: { baseCaseTotal: number; baseCaseCeil: number; eqPct: number; tkPct: number; equityShares: number; strikePps: number; cashTotal: number };
}

// v2 (COM-159): the offer-pipeline stages — modeled → proposed (straw-man via Iraj) →
// iterating → referenced & cleared (references + DBS/Swiss sub-states ride checkStatus) →
// offer letter issued (Charlie) → signed → active → rolled-off. Reviews/top-ups are REVIEW
// outcomes (COM-155), not pipeline stages; the LoI mechanic is a GRANT state (lifecycle/doc
// 'loi'), not a special case here.
export const ADVISOR_STAGES = ['modeled', 'proposed', 'iterating', 'referenced', 'offer-issued', 'signed', 'active', 'rolled-off'] as const;
export type AdvisorStage = (typeof ADVISOR_STAGES)[number];
export interface StageEvent { stage: AdvisorStage; atISO: string; note?: string; docUrl?: string }
export const advisorStage = (a: Advisor): AdvisorStage =>
  (ADVISOR_STAGES as readonly string[]).includes(a.stage as string) ? (a.stage as AdvisorStage) : 'modeled';

// v2 (COM-154): the cash-floor policy — certainty bought from the instrument legs at a
// configured exchange rate. DEFAULT DISALLOWED (open decision #3 stays open; configurable,
// never hardcoded). Affordability guards against burn (~$430K/mo).
export interface CashFloorPolicy { enabled: boolean; exchangeRate: number; monthlyBurnUSD: number; maxPctOfBurn: number }
export const CASH_FLOOR_DEFAULT: CashFloorPolicy = { enabled: false, exchangeRate: 2, monthlyBurnUSD: 430000, maxPctOfBurn: 0.10 };

// v2 (COM-146): the capital-introduction entity (RFC §3). status: targeted (in conversation) →
// gated (committed, awaiting the round close) → earned (round closed; the uplift crystallises).
export const INTRO_STATUSES = ['targeted', 'gated', 'earned'] as const;
export type IntroStatus = (typeof INTRO_STATUSES)[number];
export interface CapitalIntroduction { id: string; amountUSD: number; round: string; status: IntroStatus; note?: string }
export interface Plan {
  fdPreESOP: number; tokenSupply: number;
  bridge: RoundVals; esopStart: number; esopCap: number;
  scenarios: Record<string, Scenario>; rounds: RoundDef[]; baseScenario: string;
  tgeAnchor: string; tgeDate: string; exitMultiple: number;
  baseGrant: { equityPct: number; tokenPct: number };
  advisorTokenPoolPct: number; committedAdvisorTokenPct: number; boardTokenBucketPct: number;
  capitalUplift: { per: number; pct: number; cap: number; gate: string };
  // cocAccelPct DELETED at v6 (COM-171): Plan rules v9 removed Rule 9.2; the field was inert
  // (no engine math ever read it) and its Configure control went with COM-139/PR #68.
  currentStage: string;
  equityVestYears: number; equityCliff: number; tokenVestYears: number; tokenCliff: number;
  milestones: Milestone[]; showBenchmarks: boolean;
  // v2 (COM-142): constitutional baseline — additive, SCHEMA stays 5; reconcile() defaults them.
  constitution?: Constitution; tokenPools?: TokenPool[]; advisorPoolShares?: number;
  // v2 (COM-143): saved scenario-set bundles; plan.scenarios stays the ACTIVE set (RFC §3).
  scenarioSets?: ScenarioSet[];
  // v2 (COM-150): dollar value bands (open decision #2 — Configure-editable defaults).
  valueBands?: ValueBand[];
  // v2 (COM-154): the cash-floor policy (default disallowed — open decision #3).
  cashFloor?: CashFloorPolicy;
  // v2 (COM-155): the review cadence (months) — open decision #4 ships CONFIGURABLE, default 12.
  reviewCadenceMonths?: number;
  // v2 (COM-168/F22): the agreed SAV/409A valuation. ABSENT → strike/FMV stay round-derived
  // (the v1 path and every anchor). PRESENT → grants WITHOUT an explicit strike price at the
  // agreed PPS and FMV displays read it — one valuation, everywhere consistent.
  valuation?: ValuationRecord;
}
export interface ValuationRecord { ppsUSD: number; basis: 'SAV' | '409A' | 'SAV/409A'; dateISO: string; note?: string }
export const VALUATION_BASES = ['SAV', '409A', 'SAV/409A'] as const;

// A named bundle of per-round assumptions — the dilution workbook generalised (COM-143).
export interface ScenarioSet {
  id: string; label: string; starred?: boolean; note?: string;
  scenarios: Record<string, Scenario>; baseScenario: string;
}
export interface State { version: number; name: string; plan: Plan; tiers: Tier[]; objectives: Objective[]; advisors: Advisor[]; decisions?: GrantDecision[] }

// v2 (COM-165): the Ispahani 9-step grant-decision process (B.3, VERBATIM) as a guided flow —
// each run leaves an ARTEFACT ("the strongest possible answer to 'defend it in a board
// conversation'"). Steps are the fixed verbatim sequence; answers are the operator's record.
export const ISPAHANI_STEPS = [
  'Determine what performance/returns make each level of dilution and cost acceptable',
  'Set total dilution + employment cost acceptable per year over the foreseeable future given strategy/financial position/investor expectations, and obtain approvals',
  'Set eligibility criteria for employees, consultants, directors',
  'Assess the "franchise situation" — how critical and how replaceable is the individual',
  'Build the total compensation picture per participant: base, bonus opportunity, benefits, token allocation, options',
  'Compare each total to market',
  'Compare totals and elements to existing and anticipated internal comparators',
  "Allocate the year's share of awards, keeping a reserve for future hires",
  'Iterate for sustainability',
] as const;
export interface GrantDecision { id: string; atISO: string; advisorId?: string; subject: string; answers: string[]; decidedBy?: string }

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

export const SCHEMA = 6;

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
    currentStage: 'bridge',
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
    valueBands: VALUE_BANDS_DEFAULT.map(b => ({ ...b })),
    cashFloor: { ...CASH_FLOOR_DEFAULT },
    reviewCadenceMonths: 12,
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

// v2 (COM-160): the REAL roster state (Δ9, 27 May & 5 Jun sessions — internal & confidential)
// as the fresh-board seed. DEFAULT() stays the v1 reference fixture (both suites and the A.3
// anchors assume its 4-advisor board — §7 condition 1 forbids moving it); the STORE seeds new
// boards and resets from here instead. Robin chairs (no package row); Luke Ellis is
// friend-of-firm OUTSIDE the AB construct (no row); Iraj is the chair-adjacent orchestrator
// whose own package is the live one being designed (E.3 — the COM-165 wizard models it).
export function seedBoard(): State {
  const s = DEFAULT();
  const base = s.advisors.find(a => a.id === 'iraj') as any; // shared v1 package shape
  const mk = (over: any) => ({ ...JSON.parse(JSON.stringify(base)), ...over });
  s.advisors = [
    mk({ id: 'iraj', name: 'Iraj Ispahani', sector: SECTORS[0], tier: 2, taxResidency: 'UK', stage: 'iterating',
      notes: 'Chair-adjacent orchestrator · CEO Ispahani Advisory; ex-JP Morgan (Global COO, FIG) & Korn/Ferry. Presents the straw-men; Robin stays out of direct negotiation. His own package is the live design (27 May session).',
      performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ['cap-anchor', 'gov-engaged'] } }),
    mk({ id: 'rr', name: 'Robert Reoch', sector: SECTORS[3], tier: 1, taxResidency: 'UK', stage: 'proposed', checkStatus: 'none',
      notes: 'CONFIRMED & enthusiastic (5 Jun). Money-markets/credit/bank-underwriter base — what banks care about in risk parameters; network curious about AI/stablecoins/digital assets. No cash expected. DBS check lane (UK).',
      performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ['part-mandate'] } }),
    mk({ id: 'mk', name: 'Martin Keller', sector: SECTORS[0], tier: 1, taxResidency: 'Other', stage: 'proposed', checkStatus: 'none',
      notes: 'CONFIRMED & enthusiastic (5 Jun). Zurich — Swiss/crypto networks (named Swiss crypto funds); Falcon crisis-CEO history reframed as crisis-experience asset. No cash expected. Swiss self-requested certificate-of-suitability lane.',
      performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ['cap-intro'] } }),
    mk({ id: 'kd', name: 'Kerim Derhalli', sector: SECTORS[2], tier: 1, taxResidency: 'UK', stage: 'proposed', checkStatus: 'none',
      notes: 'CONFIRMED & enthusiastic (5 Jun). AI-finance overlap; hands-on, startup-literate, business builder. No cash expected.',
      performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ['cust-partner'] },
      introductions: [{ id: 'xtx', amountUSD: 5e6, round: 'bridge', status: 'targeted', note: 'XTX Markets — the live capital-introduction instance' }] }),
    mk({ id: 'cb', name: 'Carl Bang', sector: SECTORS[4], tier: 0, stage: 'modeled', taxResidency: 'Other',
      notes: 'COURTING — medium/long-term, keep warm. Send the bridge deck and judge by his questions; Spain visit possibility.',
      performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: [] } }),
    mk({ id: 'rm', name: 'Rajesh Mehta', sector: SECTORS[4], tier: 0, stage: 'modeled', taxResidency: 'UK',
      notes: 'EVALUATING — payments lane under question ("calling friends at a market maker is a very different sale than a payment processor"). ~40 yrs Citi payments, BCG senior advisor; prices himself off his DAY RATE — the cash-floor candidate profile (open decision #3).',
      performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: [] } }),
  ] as any;
  return reconcile(s);
}

export function reconcile(l: any): State {
  const d = DEFAULT();
  if (!l || typeof l !== 'object') return d;
  const p = l.plan || {};
  const srcScn = p.scenarios && Object.keys(p.scenarios).length ? p.scenarios : d.plan.scenarios;
  const scn: Record<string, Scenario> = {};
  Object.keys(srcScn).forEach(k => { scn[k] = { label: k, tgeMult: 1, ...(d.plan.scenarios[k] || {}), ...(srcScn[k] || {}) }; });
  // v2 (COM-162): closedISO heals — a YYYY-MM-DD string survives, anything else deletes
  // (a junk close date must read as "still open", never as closed-at-Invalid-Date).
  const rounds = (Array.isArray(p.rounds) && p.rounds.length ? p.rounds : d.plan.rounds)
    .map((r: any) => {
      const out: any = { ...r };
      if (!(typeof out.closedISO === 'string' && /^\d{4}-\d{2}-\d{2}/.test(out.closedISO))) delete out.closedISO;
      return out;
    });
  const baseScenario = (p.baseScenario && scn[p.baseScenario]) ? p.baseScenario : (scn.base ? 'base' : Object.keys(scn)[0]);
  let tiers = Array.isArray(l.tiers) && l.tiers.length ? l.tiers : d.tiers;
  tiers = tiers.map((t: any, i: number) => ({ name: t.name ?? `Tier ${i + 1}`, mult: t.mult ?? (i + 1), days: t.days ?? 1 }));
  const out: State = {
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
        saved.forEach(t => { if (t && typeof t === 'object' && t.id && !known.has(t.id)) { known.add(t.id); tokenPools.push({ ...t, label: t.label ?? t.id, poolPct: numOr(t.poolPct, 0), allocatedPct: numOr(t.allocatedPct, 0) }); } });
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
          .filter(Boolean)
          // duplicate set ids: first wins — an id-keyed list must stay id-unique (review finding)
          .filter((s: any, i: number, arr: any[]) => arr.findIndex(x => x.id === s.id) === i);
        // COM-150: value bands — id-keyed merge so edited anchors survive and new defaults
        // auto-appear; unknown bands are kept (user-defined); numerics sanitized.
        const savedBands: any[] = Array.isArray(p.valueBands) ? p.valueBands : [];
        const bandById = Object.fromEntries(savedBands.filter(b => b && typeof b === 'object' && b.id).map(b => [b.id, b]));
        const valueBands = VALUE_BANDS_DEFAULT.map(b => {
          const s = bandById[b.id] || {};
          return { ...b, ...s, annualUSD: numOr(s.annualUSD, b.annualUSD), label: typeof s.label === 'string' && s.label ? s.label : b.label };
        });
        const knownBands = new Set(valueBands.map(b => b.id));
        savedBands.forEach(b => { if (b && typeof b === 'object' && b.id && !knownBands.has(b.id)) { knownBands.add(b.id); valueBands.push({ ...b, label: typeof b.label === 'string' && b.label ? b.label : String(b.id), annualUSD: numOr(b.annualUSD, 0) }); } });
        return {
          constitution: {
            authorised: numOr(sc.authorised, CONSTITUTION_DEFAULT.authorised),
            issued: numOr(sc.issued, CONSTITUTION_DEFAULT.issued),
            poolAvailable: numOr(sc.poolAvailable, CONSTITUTION_DEFAULT.poolAvailable),
          },
          tokenPools,
          advisorPoolShares: numOr(p.advisorPoolShares, d.plan.advisorPoolShares as number),
          scenarioSets,
          valueBands,
          // COM-154: the policy heals per-field; enabled is a strict boolean (junk → disabled —
          // a cash-floor policy fails CLOSED).
          cashFloor: (() => {
            const s: any = (p.cashFloor && typeof p.cashFloor === 'object') ? p.cashFloor : {};
            return {
              enabled: s.enabled === true,
              exchangeRate: ok(s.exchangeRate) && s.exchangeRate > 0 ? s.exchangeRate : CASH_FLOOR_DEFAULT.exchangeRate,
              monthlyBurnUSD: numOr(s.monthlyBurnUSD, CASH_FLOOR_DEFAULT.monthlyBurnUSD),
              maxPctOfBurn: ok(s.maxPctOfBurn) && s.maxPctOfBurn > 0 ? s.maxPctOfBurn : CASH_FLOOR_DEFAULT.maxPctOfBurn,
            };
          })(),
          // COM-155: review cadence — positive months only (decision #4 stays configurable).
          reviewCadenceMonths: ok(p.reviewCadenceMonths) && p.reviewCadenceMonths > 0 ? p.reviewCadenceMonths : 12,
          // COM-168: the valuation record heals as a UNIT — a junk pps or date deletes the whole
          // record (strike must fail toward round-derived, never toward a half-valid valuation).
          ...(() => {
            const v: any = p.valuation;
            if (v && typeof v === 'object' && ok(v.ppsUSD) && v.ppsUSD > 0
              && typeof v.dateISO === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v.dateISO)) {
              return { valuation: {
                ppsUSD: v.ppsUSD,
                basis: (VALUATION_BASES as readonly string[]).includes(v.basis) ? v.basis : 'SAV/409A',
                dateISO: v.dateISO,
                ...(typeof v.note === 'string' && v.note ? { note: v.note } : {}),
              } };
            }
            return {};
          })(),
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
            if (!(typeof g.timeCommitment === 'string' && g.timeCommitment)) delete out.timeCommitment;
            if (g.derived !== true) delete out.derived; // strictly boolean-true (COM-171)
            return out;
          })
          // id-keyed money list: duplicate grant ids double-count the fold — first wins.
          .filter((g: any, i: number, arr: any[]) => arr.findIndex(y => y.id === g.id) === i);
      } else if ('grants' in adv) {
        delete adv.grants;
      }
      // v2 (COM-146): introductions — numeric re-defaults; status heals fail-CLOSED to
      // 'targeted' (an unknown status must never crystallise an earned uplift).
      if (Array.isArray(a.introductions)) {
        adv.introductions = a.introductions
          .filter((x: any) => x && typeof x === 'object' && x.id)
          .map((x: any) => ({
            ...x, id: String(x.id),
            amountUSD: ok(x.amountUSD) && x.amountUSD >= 0 ? x.amountUSD : 0,
            round: typeof x.round === 'string' && x.round ? x.round : 'bridge',
            status: (INTRO_STATUSES as readonly string[]).includes(x.status) ? x.status : 'targeted',
          }))
          // id-keyed money list: duplicates double-count earned uplift — first wins.
          .filter((x: any, i: number, arr: any[]) => arr.findIndex(y => y.id === x.id) === i);
      } else if ('introductions' in adv) {
        delete adv.introductions;
      }
      // v2 (COM-154): the elected floor must be a positive finite number, else it goes.
      if (!(ok(adv.cashFloorAnnualUSD) && adv.cashFloorAnnualUSD > 0)) delete adv.cashFloorAnnualUSD;
      // v2 (COM-155): person-lifecycle fields — strings string-guarded, enums heal by deletion
      // (an unknown check status must read as unset, never as 'clear').
      for (const k of ['refereeName', 'contractEntity', 'supervisor'] as const) {
        if (!(typeof adv[k] === 'string' && adv[k])) delete adv[k];
      }
      if (!(CHECK_STATUSES as readonly string[]).includes(adv.checkStatus)) delete adv.checkStatus;
      if (!(CONTRACTING_STRUCTURES as readonly string[]).includes(adv.contracting)) delete adv.contracting;
      if (Array.isArray(a.reviews)) {
        adv.reviews = a.reviews
          .filter((r: any) => r && typeof r === 'object' && r.id && typeof r.scheduledISO === 'string' && r.scheduledISO)
          .map((r: any) => {
            const out: any = {
              ...r, id: String(r.id),
              trigger: r.trigger === 'event' ? 'event' : 'scheduled',
            };
            for (const k of ['eventNote', 'inputs', 'approver', 'completedISO', 'note']) {
              if (!(typeof out[k] === 'string' && out[k])) delete out[k];
            }
            if (!(REVIEW_OUTCOMES as readonly string[]).includes(out.outcome)) delete out.outcome;
            return out;
          })
          .filter((r: any, i: number, arr: any[]) => arr.findIndex(x => x.id === r.id) === i);
      } else if ('reviews' in adv) {
        delete adv.reviews;
      }
      // v2 (COM-164): propositions — historical record; versions need id + a positive version
      // number + a date; figures re-default numerically (a junk figure must never render as a
      // sent number); duplicate ids dedupe first-wins; sorted by version.
      if (Array.isArray(a.propositions)) {
        adv.propositions = a.propositions
          .filter((v: any) => v && typeof v === 'object' && v.id && ok(v.version) && v.version > 0 && typeof v.atISO === 'string' && v.atISO)
          .map((v: any) => ({
            ...v, id: String(v.id), version: Math.round(v.version),
            scenKey: typeof v.scenKey === 'string' && v.scenKey ? v.scenKey : 'base',
            package: (v.package && typeof v.package === 'object') ? v.package : {},
            figures: (() => {
              const f: any = (v.figures && typeof v.figures === 'object') ? v.figures : {};
              const out: any = {};
              for (const k of ['baseCaseTotal', 'baseCaseCeil', 'eqPct', 'tkPct', 'equityShares', 'strikePps', 'cashTotal']) out[k] = ok(f[k]) ? f[k] : 0;
              return out;
            })(),
          }))
          .filter((v: any, i: number, arr: any[]) => arr.findIndex(x => x.id === v.id) === i)
          .sort((x: any, y: any) => x.version - y.version);
      } else if ('propositions' in adv) {
        delete adv.propositions;
      }
      // v2 (COM-159): the pipeline stage heals by deletion (unknown reads 'modeled'); history
      // entries need a valid stage + date string; docUrl is http(s)-guarded like grants'.
      if (!(ADVISOR_STAGES as readonly string[]).includes(adv.stage)) delete adv.stage;
      if (Array.isArray(a.stageHistory)) {
        adv.stageHistory = a.stageHistory
          .filter((e: any) => e && typeof e === 'object'
            && (ADVISOR_STAGES as readonly string[]).includes(e.stage)
            && typeof e.atISO === 'string' && e.atISO)
          .map((e: any) => {
            const out: any = { ...e };
            if (!(typeof out.note === 'string' && out.note)) delete out.note;
            if (!(typeof out.docUrl === 'string' && /^https?:\/\//i.test(out.docUrl))) delete out.docUrl;
            return out;
          });
      } else if ('stageHistory' in adv) {
        delete adv.stageHistory;
      }
      return adv;
    }) : d.advisors,
  };
  // v2 (COM-165): decision artefacts — id + date + the answers array (strings, padded/truncated
  // to the 9 steps); junk entries drop; id-dedupe first-wins.
  if (Array.isArray(l.decisions)) {
    out.decisions = l.decisions
      .filter((x: any) => x && typeof x === 'object' && x.id && typeof x.atISO === 'string' && x.atISO)
      .map((x: any) => ({
        id: String(x.id), atISO: x.atISO,
        ...(typeof x.advisorId === 'string' && x.advisorId ? { advisorId: x.advisorId } : {}),
        subject: typeof x.subject === 'string' && x.subject ? x.subject : 'Grant decision',
        answers: Array.from({ length: ISPAHANI_STEPS.length }, (_, i) =>
          (Array.isArray(x.answers) && typeof x.answers[i] === 'string') ? x.answers[i] : ''),
        ...(typeof x.decidedBy === 'string' && x.decidedBy ? { decidedBy: x.decidedBy } : {}),
      }))
      .filter((x: any, i: number, arr: any[]) => arr.findIndex(y => y.id === x.id) === i);
  } else if ('decisions' in out) {
    delete (out as any).decisions;
  }
  // v2 (COM-171): the v5→v6 migration. (1) cocAccelPct is DELETED (inert — Plan v9 removed Rule
  // 9.2; the ...p spread above may have carried it in). (2) grants[] MATERIALISE for parametric
  // advisors as derived-flagged rows — refreshed on every load so the snapshot can't go stale;
  // computation still dispatches to the parametric v1 path for them (hasExplicitGrants), which
  // is what makes "loads and computes identically" literally true. Explicit grants untouched.
  delete (out.plan as any).cocAccelPct;
  // COM-168: the ...p spread above can carry a JUNK valuation past the healed unit — strip it
  // (the healed IIFE only writes a key when the record is whole; this removes the spread's copy).
  {
    const v: any = (out.plan as any).valuation;
    if (!(v && typeof v === 'object' && ok(v.ppsUSD) && v.ppsUSD > 0
      && typeof v.dateISO === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v.dateISO))) {
      delete (out.plan as any).valuation;
    }
  }
  out.advisors = out.advisors.map(a => {
    if (hasExplicitGrants(a)) return a;
    const stripped = { ...a } as any;
    delete stripped.grants; // re-derive from the parametric fields, never from stale snapshots
    const derivedRows = effectiveGrants(stripped, out.plan, out.tiers, out.objectives).map(g => ({ ...g, derived: true }));
    // A zero-value package derives NO rows — leave grants ABSENT, never []: [] is the
    // explicit-zero pin, and writing it would permanently freeze a parametric advisor at $0
    // (review finding: a TBD placeholder or a temporarily-zeroed baseGrant must stay editable).
    return derivedRows.length ? { ...a, grants: derivedRows } : stripped;
  });
  return out;
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

// v2 (COM-157): the Trajectory surface (F15) — pure engine reads for the per-advisor timeline.
// trajectoryBand: cumulative VESTED net value per month as a band — floor (the base grant, no
// uplift) → base (earned uplift) → ceiling — under the selected scenario. Equity rides the
// Cert v3 annual staircase; tokens ride the RTA ramp gated by the 24-month qualifying service
// (distributableFrac); grant-borne/parametric cash accrues linearly over the engagement.
export interface TrajectoryPoint { m: number; floor: number; base: number; ceil: number }
export function trajectoryBand(a: Advisor, plan: Plan, tiers: Tier[], objectives: Objective[], scenKey?: string): TrajectoryPoint[] {
  const c: any = computeAdvisor(a, plan, tiers, objectives, scenKey);
  const sbv = c.base, Vb = sbv.exitVal;
  const eqFloor = sbv.netEqAt(c.baseEq, Vb);
  const eqBase = sbv.netEqAt(c.eqPct, Vb);
  const eqCeil = sbv.netEqAt(c.eqPctCeil, Vb);
  const tokOf = (pct: number) => (sbv.tokenAsEquity ? pct * sbv.retention * Vb : pct * sbv.fdv);
  const cash = c.cashAnnualEq ?? c.cash ?? 0;
  const months = Math.max(12, Math.round((c.years || 4) * 12));
  const grants = effectiveGrants(a, plan, tiers, objectives);
  const rta = grants.find(g => g.instrument === 'rta') || null;
  const out: TrajectoryPoint[] = [];
  for (let m = 0; m <= months; m++) {
    const ev = vestedFrac(m, plan.equityVestYears, plan.equityCliff);
    const tv = rta ? distributableFrac(rta, m, m) : vestedFrac(m, plan.tokenVestYears, plan.tokenCliff);
    const cashAcc = cash * Math.min(m / 12, c.years || 4);
    out.push({
      m,
      floor: ev * eqFloor + tv * tokOf(c.baseTk) + cashAcc,
      base: ev * eqBase + tv * tokOf(c.tkPct) + cashAcc,
      ceil: ev * eqCeil + tv * tokOf(c.tkPctCeil) + cashAcc,
    });
  }
  return out;
}

// v2 (COM-157): the dated events on an advisor's trajectory. Only REAL dates render — rounds
// are undated in the plan (COM-162 wires fundraising triggers); the Clause 3.6 backstop is
// returned even when it falls beyond the window (the caller clamps/captions). The Series-A
// structural review (Δ2 "trainer wheels" formalisation) renders caller-side off the seriesA
// milestone.
export interface TrajectoryEvent { id: string; kind: 'start' | 'cliff' | 'tranche' | 'qualifying' | 'review' | 'review-due' | 'tge' | 'today' | 'backstop' | 'round'; m: number; label: string; dateISO: string }
export function trajectoryEvents(a: Advisor, plan: Plan, tiers: Tier[], objectives: Objective[], todayIso = todayISO()): TrajectoryEvent[] {
  const start = a.startDate || todayIso;
  const months = Math.max(12, Math.round((a.years || 4) * 12));
  const mOf = (iso: string) => monthsBetween(start, iso);
  const out: TrajectoryEvent[] = [
    { id: 'start', kind: 'start', m: 0, label: 'Start', dateISO: start },
    // equityCliff is already MONTHS in this model (12), not years
    { id: 'cliff', kind: 'cliff', m: Math.round(plan.equityCliff), label: 'Cliff', dateISO: addMonthsUTC(start, Math.round(plan.equityCliff)) },
    { id: 'qualifying', kind: 'qualifying', m: 24, label: 'Qualifying · Bad-Leaver', dateISO: addMonthsUTC(start, 24) },
  ];
  for (let y = 2; y <= Math.min(plan.equityVestYears, a.years || plan.equityVestYears); y++) {
    out.push({ id: `tranche-${y}`, kind: 'tranche', m: y * 12, label: `Year ${y} tranche`, dateISO: addMonthsUTC(start, y * 12) });
  }
  (Array.isArray(a.reviews) ? a.reviews : []).forEach(r => {
    out.push({ id: r.id, kind: 'review', m: mOf(r.scheduledISO), label: r.completedISO ? `Review · ${r.outcome || 'completed'}` : 'Review (open)', dateISO: r.scheduledISO });
  });
  const due = nextReviewDue(a, plan, todayIso);
  if (!due.review) out.push({ id: 'review-due', kind: 'review-due', m: mOf(due.dueISO), label: 'Next review due', dateISO: due.dueISO });
  if (plan.tgeDate) out.push({ id: 'tge', kind: 'tge', m: mOf(plan.tgeDate), label: 'TGE', dateISO: plan.tgeDate });
  // v2 (COM-162): CLOSED rounds are dated trajectory events (open rounds stay on the dilution path)
  (plan.rounds || []).forEach(r => {
    if (r.closedISO) out.push({ id: `round-${r.id}`, kind: 'round', m: mOf(r.closedISO), label: `${r.label} closed`, dateISO: r.closedISO });
  });
  const tm = mOf(todayIso);
  if (tm > 0 && tm < months) out.push({ id: 'today', kind: 'today', m: tm, label: 'Today', dateISO: todayIso });
  const firstOpt = effectiveGrants(a, plan, tiers, objectives).find(g => g.instrument === 'option');
  if (firstOpt) {
    const b = exerciseCheck(firstOpt, todayIso).backstop;
    out.push({ id: 'backstop', kind: 'backstop', m: mOf(b.anniversary9ISO), label: 'Exercise backstop (3.6)', dateISO: b.anniversary9ISO });
  }
  return out.sort((x, y) => x.m - y.m);
}

// v2 (COM-148): the side-by-side set diff — per-advisor net + board totals + pool/founder
// deltas, both sides evaluated through planWithSet (an unknown/'' id evaluates the WORKING
// scenarios, so "current vs a saved set" diffs come free). Pure reads; the UI renders rows.
export function diffSets(advisors: Advisor[], plan: Plan, tiers: Tier[], objectives: Objective[], idA: string, idB: string) {
  const evalUnder = (setId: string) => {
    const p = planWithSet(plan, setId);
    const b = computeBoard(advisors, p, tiers, objectives);
    const w = walkScenario(p, baseScenKey(p));
    const issued = p.constitution?.issued ?? CONSTITUTION_DEFAULT.issued;
    return { plan: p, board: b, founderPct: safeDiv(issued, w.exit.N), cost: b.cost[baseScenKey(p)] ?? 0 };
  };
  const A = evalUnder(idA), B = evalUnder(idB);
  const rows = advisors.map(a => {
    const ca = computeAdvisor(a, A.plan, tiers, objectives);
    const cb = computeAdvisor(a, B.plan, tiers, objectives);
    return { id: a.id, name: a.name, aTotal: ca.baseCaseTotal, bTotal: cb.baseCaseTotal, delta: cb.baseCaseTotal - ca.baseCaseTotal };
  });
  return {
    a: { cost: A.cost, founderPct: A.founderPct, sumEq: A.board.sumEq, esopNow: A.board.esopNow },
    b: { cost: B.cost, founderPct: B.founderPct, sumEq: B.board.sumEq, esopNow: B.board.esopNow },
    rows,
    deltas: { cost: B.cost - A.cost, founderPct: B.founderPct - A.founderPct, sumEq: B.board.sumEq - A.board.sumEq },
  };
}

// v2 (COM-147): the workbook's "Headline observations", auto-generated from a plan's own numbers
// (the founder walk and the bridge dilution decomposition — A.3's two named callouts). Pure
// engine reads; the UI renders the strings. founder share count = constitution.issued (A.3
// note 5: fixed across all scenarios — only the percentage declines).
export function headlineObservations(plan: Plan) {
  const issued = plan.constitution?.issued ?? CONSTITUTION_DEFAULT.issued;
  const w = walkScenario(plan, baseScenKey(plan));
  const pre = safeDiv(issued, plan.fdPreESOP);
  const post = safeDiv(issued, w.byId.bridge.N);
  const exitPct = safeDiv(issued, w.exit.N);
  const esop = plan.esopStart ?? plan.bridge.esop ?? 0;
  const newMoney = safeDiv(plan.bridge.raise, plan.bridge.post);
  const pp = (v: number) => (v * 100).toFixed(2);
  const out = [
    { id: 'founder-walk', text: `${fUSD(plan.bridge.post)} bridge / ${fPct(esop, 0)} ESOP → founder ${fPct(pre, 2)} → ${fPct(post, 2)} (−${pp(pre - post)}pp), ${fPct(exitPct, 2)} at ${roundLabel(plan, w.exit.id)}.` },
  ];
  if (esop > newMoney) {
    out.push({ id: 'esop-driver', text: `ESOP creation is the larger dilution driver at the bridge (${fPct(esop, 0)}) vs new money (${fPct(newMoney, 1)}).` });
  } else {
    out.push({ id: 'money-driver', text: `New money is the larger dilution driver at the bridge (${fPct(newMoney, 1)}) vs ESOP creation (${fPct(esop, 0)}).` });
  }
  return out;
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

// v2 (COM-152): the pre-TGE liquidity fallback — token awards re-state 1:1 as EQUITY, net of
// the same dilution walk (a token-% point becomes an equity-% point; RTAs carry no strike, so
// the restatement is pct × retention × exit value). The toggle is per SCENARIO.
export const preTgeLiquidity = (plan: Plan, scenKey: string) => !!plan.scenarios[scenKey]?.preTgeLiquidity;
export function tokenValueFor(plan: Plan, scenKey: string, walk: any, tkPct: number, grantRound = 'bridge') {
  if (!preTgeLiquidity(plan, scenKey)) return tkPct * tgeFdvFor(plan, scenKey, walk);
  const grant = walk.byId[grantRound] || walk.byId.bridge;
  const retention = safeDiv(grant.N, walk.exit.N);
  return tkPct * retention * walk.exit.post;
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

// v2 (COM-150 / Δ1): value→quantity — denominate in dollars, deliver in instruments. Options:
// $ ÷ (FMV − strike); NULL when FMV ≤ strike (underwater flag, never Infinity). Tokens:
// $ ÷ (TGE FDV ÷ supply). Cash has no quantity. Restated per scenario by the caller (computeGrant
// passes that scenario's FMV/FDV). Percent-of-company is an OUTPUT, never the negotiation unit.
export function valueToQuantity(
  valueUSD: number, instrument: Instrument,
  ctx: { fmvPps?: number; strikePps?: number; tgeFdv?: number; tokenSupply?: number },
): number | null {
  if (!ok(valueUSD) || valueUSD < 0) return null;
  if (instrument === 'option') {
    if (!ok(ctx.fmvPps) || !ok(ctx.strikePps) || ctx.fmvPps <= ctx.strikePps) return null;
    return valueUSD / (ctx.fmvPps - ctx.strikePps);
  }
  if (instrument === 'rta') {
    const pps = safeDiv(ctx.tgeFdv as number, ctx.tokenSupply as number);
    return pps > 0 ? valueUSD / pps : null;
  }
  return null;
}

// v2 (COM-144): per-grant pricing off the grant's round. Strike = the round's price/share unless
// the grant carries an explicit strikePps. FMV per Cert v3 cl. 4.5(c): exit consideration at an
// Exit Event (exit price/share), else the most-recent-grant methodology — the price at the plan's
// current stage in this scenario's walk. Net of strike, always. An explicit quantity wins; a
// value-denominated grant (COM-150) derives its quantity per scenario via valueToQuantity.
export function computeGrant(grant: Grant, plan: Plan, scenKey: string) {
  const w = walkScenario(plan, scenKey);
  const round = w.byId[grant.round] || w.byId.bridge;
  const exit = w.exit;
  const lapsed = grant.lifecycle === 'lapsed';
  if (grant.instrument === 'cash') {
    const value = lapsed ? 0 : (ok(grant.valueUSD) ? grant.valueUSD : 0);
    return { id: grant.id, instrument: 'cash' as Instrument, round: grant.round, roundLabel: roundLabel(plan, grant.round), quantity: null, derived: false, strikePps: null, fmvPps: null, exitPps: null, exerciseCost: 0, stepUp: null, value, netAtExit: value, underwater: false, lapsed };
  }
  if (grant.instrument === 'rta') {
    const tokenPps = safeDiv(tgeFdvFor(plan, scenKey, w), plan.tokenSupply);
    const wantsDerive = !lapsed && !ok(grant.quantity) && ok(grant.valueUSD);
    const derivedTk = wantsDerive
      ? valueToQuantity(grant.valueUSD as number, 'rta', { tgeFdv: tgeFdvFor(plan, scenKey, w), tokenSupply: plan.tokenSupply })
      : null;
    const qty = lapsed ? 0 : (ok(grant.quantity) ? grant.quantity : (derivedTk ?? 0));
    // COM-152: under this scenario's pre-TGE fallback the award re-states 1:1 as equity —
    // qty/supply of company value, net of the same dilution walk, no strike (RTAs carry none).
    const asEquity = preTgeLiquidity(plan, scenKey);
    const value = asEquity
      ? tokenValueFor(plan, scenKey, w, safeDiv(qty, plan.tokenSupply), grant.round)
      : qty * tokenPps;
    // A failed token derivation (FDV/supply degenerate) flags like the option path — the UI must
    // distinguish "derivation failed" from "granted nothing" (review finding; a lapsed row flags
    // nothing — its zero is the lifecycle, not the maths).
    return { id: grant.id, instrument: 'rta' as Instrument, round: grant.round, roundLabel: roundLabel(plan, grant.round), quantity: qty, derived: derivedTk != null, strikePps: null, fmvPps: tokenPps, exitPps: null, exerciseCost: 0, stepUp: null, tokenPps, value, netAtExit: value, underwater: wantsDerive && derivedTk == null, lapsed, tokenAsEquity: asEquity };
  }
  // v2 (COM-168/F22): a recorded SAV/409A valuation prices un-overridden strikes and IS the FMV
  // print until superseded ("strike subject to an agreed HMRC SAV / 409A valuation before first
  // grant" — the Proposition's own fine print). Explicit strikePps always wins; absent valuation
  // keeps the round-derived path (every anchor).
  const vPps = ok(plan.valuation?.ppsUSD) && (plan.valuation as ValuationRecord).ppsUSD > 0 ? (plan.valuation as ValuationRecord).ppsUSD : null;
  const strikePps = ok(grant.strikePps) ? grant.strikePps : (vPps ?? round.price);
  const exitPps = safeDiv(exit.post, exit.N);
  const fmvPps = vPps ?? currentRoundStep(plan, w).price;
  const wantsDerive = !lapsed && !ok(grant.quantity) && ok(grant.valueUSD);
  const derivedOpt = wantsDerive ? valueToQuantity(grant.valueUSD as number, 'option', { fmvPps, strikePps }) : null;
  const qty = lapsed ? 0 : (ok(grant.quantity) ? grant.quantity : (derivedOpt ?? 0));
  const netAtExit = Math.max(0, qty * (exitPps - strikePps));
  // underwater: the exit consideration below strike OR a failed value derivation (non-positive
  // FMV spread — no count exists at this scenario's FMV). Lapsed rows flag nothing.
  const underwater = !lapsed && (exitPps < strikePps || (wantsDerive && derivedOpt == null));
  return { id: grant.id, instrument: 'option' as Instrument, round: grant.round, roundLabel: roundLabel(plan, grant.round), quantity: qty, derived: derivedOpt != null, strikePps, fmvPps, exitPps, exerciseCost: qty * strikePps, stepUp: fmvPps - strikePps, value: netAtExit, netAtExit, underwater, lapsed };
}

// v2 (COM-171): the dispatch predicate. EXPLICIT = a grants array that is empty ([] = granted
// nothing, COM-144's pin) or carries at least one non-derived row. ALL-derived rows are the v6
// migration's snapshot — the parametric v1 package still computes (that is what makes the
// migration's "computes identically" guarantee literally true; ceilings/uplifts keep their v1
// semantics until a real edit claims the package).
export const hasExplicitGrants = (a: Advisor) =>
  Array.isArray(a.grants) && (a.grants.length === 0 || a.grants.some(g => !g.derived));

export function computeAdvisor(a: Advisor, plan: Plan, tiers: Tier[], objectives: Objective[]) {
  // v2 (COM-144): an advisor with EXPLICIT grants computes as a fold over them — including EMPTY
  // ([] = explicitly granted nothing → $0; the implicit package must never resurrect when the
  // last grant is deleted or a corrupt import drops every row — fail toward understatement).
  // The v1 implicit path below stays byte-equivalent for parametric advisors (22/22 pins it).
  if (hasExplicitGrants(a)) return computeAdvisorFromGrants(a, plan);
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
  // v2 (COM-146): explicit introductions, when present, REPLACE the v1 perf.capital* numbers as
  // the capital source — EARNED ones drive the uplift; targeted/gated feed only the ceiling.
  // Advisors without introductions[] keep the v1 path byte-identically (22/22 pins it).
  const intros = Array.isArray(a.introductions) ? a.introductions : null;
  // amounts clamp ≥ 0 here too — reconcile heals on load, but setPath writes live state
  // unsanitised; a negative entry must never SUBTRACT earned capital (review finding).
  const introEarned = intros ? intros.reduce((s, i) => s + (i.status === 'earned' && ok(i.amountUSD) && i.amountUSD > 0 ? i.amountUSD : 0), 0) : 0;
  const introPipeline = intros ? intros.reduce((s, i) => s + (i.status !== 'earned' && ok(i.amountUSD) && i.amountUSD > 0 ? i.amountUSD : 0), 0) : 0;
  const capEquity = intros ? introEarned : (perf.capitalEquity || 0);
  const capToken = intros ? 0 : (perf.capitalToken || 0);
  const capTotal = intros ? introEarned
    : (perf.capitalEquity != null || perf.capitalToken != null) ? (capEquity + capToken) : (perf.capitalIntroduced || 0);
  const capRaw = clamp(safeDiv(capTotal, cu.per) * cu.pct, 0, cu.cap);
  const capActive = stageReached(plan, cu.gate) ? capRaw : 0;
  // the ceiling includes the introduction pipeline (targeted + gated) — v1 ceilings unchanged.
  const capPotential = intros ? clamp(safeDiv(introEarned + introPipeline, cu.per) * cu.pct, 0, cu.cap) : capRaw;
  const oMap: Record<string, Objective> = Object.fromEntries((objectives || []).map(o => [o.id, o]));
  const ach = perf.achieved || [], tgt = perf.targeted || [];
  const earnedObj = ach.filter(id => oMap[id] && stageReached(plan, oMap[id].gate)).reduce((s, id) => s + oMap[id].uplift, 0);
  const pendObj = ach.filter(id => oMap[id] && !stageReached(plan, oMap[id].gate)).reduce((s, id) => s + oMap[id].uplift, 0);
  const ceilObj = [...new Set([...ach, ...tgt])].reduce((s, id) => s + (oMap[id]?.uplift || 0), 0);
  const earnedUplift = capActive + earnedObj;
  const ceilUplift = capPotential + ceilObj;
  // pendingUplift = EARNED-but-gate-blocked only (capRaw, never the pipeline) — a targeted
  // intro is a prospect, not pending money; the pipeline lives ONLY in the ceiling, exactly
  // like targeted objectives (review finding: the awaitingGate tooltip promises "earned").
  const pendingUplift = (capRaw - capActive) + pendObj;

  let eqPct = baseEq * (1 + earnedUplift), tkPct = baseTk * (1 + earnedUplift);
  let eqPctCeil = baseEq * (1 + ceilUplift), tkPctCeil = baseTk * (1 + ceilUplift);

  // v2 (COM-154): the cash-floor trade — the advisor's elected floor is BOUGHT from the
  // instrument legs at the policy's exchange rate (value surrendered = floor total × rate,
  // priced at the base case). Both legs and both ceilings scale by the same traded fraction;
  // a floor the package can't fund clamps at 100% and flags. Disabled policy = byte-level no-op.
  const cfp = plan.cashFloor;
  const floorAnnual = (cfp?.enabled && ok(a.cashFloorAnnualUSD) && a.cashFloorAnnualUSD > 0) ? a.cashFloorAnnualUSD : 0;
  let floorTradedValue = 0, floorTradedFrac = 0, floorUnfunded = false;
  if (floorAnnual > 0) {
    const rate = ok(cfp.exchangeRate) && cfp.exchangeRate > 0 ? cfp.exchangeRate : CASH_FLOOR_DEFAULT.exchangeRate;
    const wB = walkScenario(plan, baseScenKey(plan));
    const gB = wB.byId[grantRound] || wB.byId.bridge;
    const instrumentValue = Math.max(0, eqPct * (safeDiv(gB.N, wB.exit.N) * wB.exit.post - gB.post))
      + tokenValueFor(plan, baseScenKey(plan), wB, tkPct, grantRound);
    const wanted = floorAnnual * years * rate;
    floorTradedFrac = instrumentValue > 0 ? clamp(wanted / instrumentValue, 0, 1) : 1;
    floorUnfunded = instrumentValue <= 0 || wanted > instrumentValue;
    floorTradedValue = floorTradedFrac * instrumentValue;
    eqPct *= 1 - floorTradedFrac; tkPct *= 1 - floorTradedFrac;
    eqPctCeil *= 1 - floorTradedFrac; tkPctCeil *= 1 - floorTradedFrac;
  }

  const scen = Object.keys(plan.scenarios).map(k => {
    const w = walkScenario(plan, k);
    const grant = w.byId[grantRound] || w.byId.bridge, exit = w.exit;
    const retention = safeDiv(grant.N, exit.N);
    const strikeBasis = grant.post;
    const exitVal = exit.post;
    const fdv = tgeFdvFor(plan, k, w);
    const netEqAt = (pct: number, V: number) => Math.max(0, pct * (retention * V - strikeBasis));
    // COM-152: under the pre-TGE fallback the token leg re-states 1:1 as equity (no strike).
    const equity = netEqAt(eqPct, exitVal), token = tokenValueFor(plan, k, w, tkPct, grantRound);
    return { key: k, label: plan.scenarios[k].label, retention, strikeBasis, exitVal, fdv, grantN: grant.N, exitN: exit.N, grantPrice: grant.price, netEqAt, equity, token, total: equity + token, underwater: retention * exitVal < strikeBasis, tokenAsEquity: preTgeLiquidity(plan, k) };
  });
  const sb = scen.find(x => x.key === baseScenKey(plan)) || scen[0];

  const cash = (a.hasCash ? (a.cashAnnual || 0) : 0) + floorAnnual;
  const equityShares = eqPct * sb.grantN;
  const strikePps = sb.grantPrice;
  const exerciseCost = eqPct * sb.strikeBasis;
  return {
    years, tierMult, baseEq, baseTk, grantRound, capEquity, capToken, capTotal,
    introEarned, introPipeline, capPotential,
    cashFloorAnnual: floorAnnual, cashFloorTraded: floorTradedValue, cashFloorFrac: floorTradedFrac, cashFloorUnfunded: floorUnfunded,
    earnedUplift, ceilUplift, pendingUplift, capEarned: capActive, capRaw,
    eqPct, tkPct, eqPctCeil, tkPctCeil,
    scen, base: sb, retentionBase: sb.retention,
    equityShares, strikePps, exerciseCost, tokenCount: tkPct * plan.tokenSupply,
    cash, cashTotal: cash * years, cashAnnualEq: cash,
    // token legs follow the COM-152 fallback (mirrors tokenValueFor over the sb row fields —
    // baseCaseTotal must equal sb.total under the toggle; the T13 review missed these three).
    baseCaseBase: sb.netEqAt(baseEq, sb.exitVal) + (sb.tokenAsEquity ? baseTk * sb.retention * sb.exitVal : baseTk * sb.fdv),
    baseCaseTotal: sb.netEqAt(eqPct, sb.exitVal) + (sb.tokenAsEquity ? tkPct * sb.retention * sb.exitVal : tkPct * sb.fdv),
    baseCaseCeil: sb.netEqAt(eqPctCeil, sb.exitVal) + (sb.tokenAsEquity ? tkPctCeil * sb.retention * sb.exitVal : tkPctCeil * sb.fdv),
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

  // Shares/eqPct come from the BASE-scenario rows (COM-150: value-denominated grants derive
  // their quantity per scenario, so headline counts are the base derivation) — computed first
  // so every scenario's netEqAt can scale off the same eqPct reference.
  const headRows = live.map(g => computeGrant(g, plan, baseKey));
  const equityShares = headRows.reduce((s, r) => s + (r.instrument === 'option' ? (r.quantity || 0) : 0), 0);
  const tokenCount = headRows.reduce((s, r) => s + (r.instrument === 'rta' ? (r.quantity || 0) : 0), 0);
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
    // proportional. pct === eqPct (the standard call) scales 1 EVEN when eqPct is 0 — a base
    // scenario whose value-derivation nulls must not zero every other scenario's netEqAt
    // (review finding 2026-06-10) — invariant: scen.equity === netEqAt(eqPct, exitVal).
    const netEqAt = (pct: number, V: number) => {
      const pps = safeDiv(V, exit.N);
      const raw = rows.reduce((s, r) => s + (r.instrument === 'option' ? (r.quantity || 0) * Math.max(0, pps - (r.strikePps as number)) : 0), 0);
      return raw * (pct === eqPct ? 1 : safeDiv(pct, eqPct, 0));
    };
    return {
      key: k, label: plan.scenarios[k].label, retention, strikeBasis: grant.post, exitVal: exit.post,
      fdv: tgeFdvFor(plan, k, w), grantN: grant.N, exitN: exit.N, grantPrice: grant.price, netEqAt,
      equity, token, total: equity + token,
      // per-scenario flag off THIS scenario's rows (a base-keyed count misses the scenario
      // where the grant actually is underwater — review finding)
      underwater: rows.some(r => r.instrument === 'option' && r.underwater), rows,
      tokenAsEquity: preTgeLiquidity(plan, k),
    };
  });
  const sb = scen.find(x => x.key === baseKey) || scen[0];

  const baseRows = sb.rows;
  const exerciseCost = baseRows.reduce((s, r) => s + (r.instrument === 'option' ? r.exerciseCost : 0), 0);
  const strikePps = safeDiv(exerciseCost, equityShares, baseRows.find(r => r.instrument === 'option')?.strikePps ?? sb.grantPrice);
  const grantCash = baseRows.reduce((s, r) => s + (r.instrument === 'cash' ? r.value : 0), 0);
  const cash = a.hasCash ? (a.cashAnnual || 0) : 0;

  // Intro capital is still REPORTED for grant-advisors (capital-in is a fact), but it buys no
  // uplift multiplier on this path — explicit grants are PRICED; capital rewards express as
  // top-up grants (the COM-144 convention). upliftViaGrants tells consumers why every uplift
  // field is zero (review finding: the F20 panel must not read zero-owed as a contradiction).
  const intros2 = Array.isArray(a.introductions) ? a.introductions : null;
  const introSum = (st: 'earned' | 'rest') => (intros2 || []).reduce((s, i) => s + ((st === 'earned' ? i.status === 'earned' : i.status !== 'earned') && ok(i.amountUSD) && i.amountUSD > 0 ? i.amountUSD : 0), 0);
  return {
    years, tierMult: 1, baseEq: eqPct, baseTk: tkPct, grantRound,
    capEquity: 0, capToken: 0, capTotal: 0,
    introEarned: introSum('earned'), introPipeline: introSum('rest'), capPotential: 0,
    upliftViaGrants: true,
    earnedUplift: 0, ceilUplift: 0, pendingUplift: 0, capEarned: 0, capRaw: 0,
    eqPct, tkPct, eqPctCeil: eqPct, tkPctCeil: tkPct,
    scen, base: sb, retentionBase: sb.retention,
    equityShares, strikePps, exerciseCost, tokenCount,
    // cashAnnualEq: the advisor's TOTAL annual cash commitment incl. grant-borne cash — the
    // affordability check must never fail open after a claim re-homes a retainer/floor into a
    // cash grant row (review finding: claimed boards silently stopped warning).
    cash, cashTotal: cash * years + grantCash, cashAnnualEq: cash + safeDiv(grantCash, years),
    baseCaseBase: sb.total, baseCaseTotal: sb.total, baseCaseCeil: sb.total,
    baseEqNet: sb.equity, baseBaseEqNet: sb.equity,
    bestCaseTotal: scen.reduce((m, x) => Math.max(m, x.total), 0),
    grants: baseRows,
  };
}

// v2 (COM-144→171): the §5 derivation shim, for UIs that render grant rows uniformly — EXPLICIT
// grants verbatim (even empty — [] is explicit-zero, never re-derive); parametric advisors get
// the v1 implicit package expressed as Grant entries, derived FRESH every call (the v6 persisted
// derived rows are a snapshot for external readers; live consumers always see current numbers).
// A flow that PERSISTS the derivation as explicit (claim-on-first-edit) MUST clear
// hasCash/cashAnnual — the fold sums advisor-level cash AND cash grants (review 2026-06-10).
export function effectiveGrants(a: Advisor, plan: Plan, tiers: Tier[], objectives: Objective[]): Grant[] {
  if (hasExplicitGrants(a)) return a.grants as Grant[];
  const c = computeAdvisor(a, plan, tiers, objectives);
  const out: Grant[] = [];
  if (c.equityShares > 0) out.push({ id: `${a.id}-implicit-eq`, instrument: 'option', round: c.grantRound, quantity: c.equityShares, strikePps: c.strikePps, curve: 'cert-v3', vestStartISO: a.startDate, lifecycle: 'granted' });
  if (c.tokenCount > 0) out.push({ id: `${a.id}-implicit-rta`, instrument: 'rta', round: c.grantRound, quantity: c.tokenCount, curve: 'rta', vestStartISO: a.startDate, lifecycle: 'granted' });
  if (a.hasCash && a.cashAnnual) out.push({ id: `${a.id}-implicit-cash`, instrument: 'cash', round: c.grantRound, valueUSD: (a.cashAnnual || 0) * (a.years || 4), curve: 'cert-v3', vestStartISO: a.startDate, lifecycle: 'granted' });
  if ((a.cashFloorAnnualUSD ?? 0) > 0 && plan.cashFloor?.enabled) out.push({ id: `${a.id}-implicit-floor`, instrument: 'cash', round: c.grantRound, valueUSD: (a.cashFloorAnnualUSD as number) * (a.years || 4), curve: 'cert-v3', vestStartISO: a.startDate, lifecycle: 'granted' });
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
  // v2 (COM-154): affordability vs burn — annual cash commitments (retainers + elected floors)
  // against the policy's burn threshold. Only when the policy is enabled.
  const cfp = plan.cashFloor;
  // grant-borne cash counts too (cashAnnualEq) — the check must not fail open after a claim.
  const monthlyCash = safeDiv(rows.reduce((s, r) => s + ((r.c as any).cashAnnualEq ?? r.c.cash), 0), 12);
  if (cfp?.enabled) {
    const burn = ok(cfp.monthlyBurnUSD) && cfp.monthlyBurnUSD > 0 ? cfp.monthlyBurnUSD : CASH_FLOOR_DEFAULT.monthlyBurnUSD;
    const maxPct = ok(cfp.maxPctOfBurn) && cfp.maxPctOfBurn > 0 ? cfp.maxPctOfBurn : CASH_FLOOR_DEFAULT.maxPctOfBurn;
    if (monthlyCash > burn * maxPct + 1e-9)
      warnings.push(`Cash commitments ${fUSD(monthlyCash)}/mo exceed ${fPct(maxPct, 0)} of burn (${fUSD(burn)}/mo)`);
  }
  return { rows, sumEq, sumEqCeil, sumTk, sumTkCeil, sumCash, sumCapital, cost, warnings, esopNow, boardBucket, monthlyCash };
}

// v2 (COM-146): the board capital rollup — total expected capital in vs the uplift owed out
// (O15: the board as a fundraising instrument, quantified). Powers the F20 panel (COM-161).
// Uplift-owed values are LINEAR reads of the base-case package (netEqAt is linear in pct above
// water), so owedValue = upliftFraction × baseCaseBase — engine-derived, no new semantics.
// Advisors without introductions[] contribute their v1 perf capital as 'earned' (one bucket).
// v2 (COM-156): generosity guardrails — Carl Sjöström's standing challenge ("this is too
// generous") as software. Per-advisor: the compa-ratio grammar (annual package value at base
// vs the US private-company advisory median ~$50K/yr — ▲ above / ◆ in line / ▼ below), the
// FAST output-% sanity check (the negotiation unit is DOLLARS; the % is a sanity band), and
// the day-rate reality test over the tier's stated days/month. Board: pool-consumption +
// reserve-depletion (Ispahani step 8) and totality-vs-peers. Pure reads; the UI renders.
export const ADVISORY_MEDIAN_USD = 50000;   // Carl Sjöström's anchor (E.3)
export const BENCH_DAY_RATE_USD = 10000;    // magic-circle/Big-4 equivalent day (E.3 reality test)
export function generosityCheck(advisors: Advisor[], plan: Plan, tiers: Tier[], objectives: Objective[]) {
  const rows = advisors.map(a => {
    const c: any = computeAdvisor(a, plan, tiers, objectives);
    const annual = safeDiv(c.baseCaseTotal, Math.max(a.years || 4, 1e-9));
    const compa = safeDiv(annual, ADVISORY_MEDIAN_USD);
    const status: 'above' | 'inline' | 'below' = compa > 1.2 ? 'above' : compa < 0.8 ? 'below' : 'inline';
    const flags: string[] = [];
    const expert = BENCH.advisorEquity.expert;
    if (c.eqPct > expert.hi) flags.push(`Band breach: ${fPct(c.eqPct, 2)} base equity exceeds the FAST Expert ceiling (${fPct(expert.hi, 2)}).`);
    const days = tiers[a.tier]?.days;
    if (a.mode !== 'value' && days && days > 0) {
      const impliedDayRate = safeDiv(annual, days * 12);
      if (impliedDayRate > BENCH_DAY_RATE_USD * 2) flags.push(`Day-rate reality: ~${fUSD(impliedDayRate)}/day implied — over 2× the magic-circle/Big-4 equivalent (${fUSD(BENCH_DAY_RATE_USD)}).`);
    }
    return { advisorId: a.id, name: a.name, annual, compa, status, flags, baseCaseTotal: c.baseCaseTotal };
  });
  const board: string[] = [];
  // totality vs peers: one person far above the rest of the board
  const totals = rows.map(r => r.baseCaseTotal).sort((x, y) => x - y);
  const median = totals.length ? totals[Math.floor(totals.length / 2)] : 0;
  rows.forEach(r => {
    if (totals.length >= 3 && median > 0 && r.baseCaseTotal > 2 * median)
      r.flags.push(`Totality: ${fUSD(r.baseCaseTotal)} is over 2× the board median (${fUSD(median)}) — token + option + cash for one person vs peers.`);
  });
  // pool consumption / reserve depletion (Ispahani step 8: keep reserve for future hires)
  const b = computeBoard(advisors, plan, tiers, objectives);
  const consumption = safeDiv(b.sumEq, plan.esopStart || 1);
  if (consumption >= 0.5) board.push(`Pool consumption: the board's base equity (${fPct(b.sumEq, 2)}) consumes ${fPct(consumption, 0)} of the ESOP at adoption (${fPct(plan.esopStart, 0)}) — keep reserve for future hires (Ispahani step 8).`);
  const anyAbove = rows.some(r => r.status === 'above');
  if (anyAbove) board.push(`Anchor check: packages above ~${fUSD(ADVISORY_MEDIAN_USD)}/yr (the US private-company advisory median) must justify themselves — "$50K won't get these people out of bed; $100K maybe — but you must afford it annually."`);
  return { rows, board, median, anchorUSD: ADVISORY_MEDIAN_USD };
}

// v2 (COM-164): build the next proposition version from the LIVE package + plan (pure; the
// store appends it and owns the numbering).
export function makeProposition(a: Advisor, plan: Plan, tiers: Tier[], objectives: Objective[], id: string, version: number, atISO: string, note?: string): PropositionVersion {
  const c: any = computeAdvisor(a, plan, tiers, objectives);
  return {
    id, version, atISO, ...(note ? { note } : {}),
    scenKey: baseScenKey(plan),
    package: {
      mode: a.mode, tier: a.tier, annualValue: a.annualValue, years: a.years,
      splitOptions: a.splitOptions, grantRound: a.grantRound, hasCash: a.hasCash, cashAnnual: a.cashAnnual,
    },
    figures: {
      baseCaseTotal: c.baseCaseTotal, baseCaseCeil: c.baseCaseCeil,
      eqPct: c.eqPct, tkPct: c.tkPct, equityShares: c.equityShares,
      strikePps: c.strikePps, cashTotal: c.cashTotal,
    },
  };
}

// v2 (COM-162): a round close CRYSTALLISES gated capital-introduction uplifts — every intro
// gated on the closed round flips to earned. Pure: returns NEW advisor objects + the count
// (the store wraps it in Undo and persists). Intros gated on OTHER rounds are untouched.
export function crystalliseIntroductions(advisors: Advisor[], roundId: string): { advisors: Advisor[]; flipped: number } {
  let flipped = 0;
  const out = advisors.map(a => {
    if (!Array.isArray(a.introductions)) return a;
    let touched = false;
    const introductions = a.introductions.map(i => {
      if (i.status === 'gated' && i.round === roundId) { flipped++; touched = true; return { ...i, status: 'earned' as IntroStatus }; }
      return i;
    });
    return touched ? { ...a, introductions } : a;
  });
  return { advisors: out, flipped };
}

export function capitalRollup(advisors: Advisor[], plan: Plan, tiers: Tier[], objectives: Objective[]) {
  const cu = plan.capitalUplift;
  const rows = advisors.map(a => {
    const c: any = computeAdvisor(a, plan, tiers, objectives);
    const intros = Array.isArray(a.introductions) ? a.introductions : null;
    const sumBy = (st: IntroStatus) => (intros || []).reduce((s, i) => s + (i.status === st && ok(i.amountUSD) && i.amountUSD > 0 ? i.amountUSD : 0), 0);
    const earned = intros ? sumBy('earned') : c.capTotal;
    const gated = sumBy('gated');
    const targeted = sumBy('targeted');
    // Uplift fractions come from the ENGINE'S OWN compute — one source of truth. Grant-path
    // advisors report 0/0 with upliftViaGrants set (capital rewards express as top-up grants
    // there; the rollup must never print a potential the engine will not pay — review finding).
    const earnedUpliftFrac = c.capEarned;
    const potentialUpliftFrac = c.upliftViaGrants ? 0 : (ok(c.capPotential) ? c.capPotential : c.capRaw);
    return {
      advisorId: a.id, name: a.name,
      targeted, gated, earned, total: targeted + gated + earned,
      earnedUpliftFrac, potentialUpliftFrac,
      earnedUpliftValue: earnedUpliftFrac * c.baseCaseBase,
      potentialUpliftValue: potentialUpliftFrac * c.baseCaseBase,
      upliftViaGrants: !!c.upliftViaGrants,
      introductions: intros || [],
    };
  });
  const t = (f: (r: any) => number) => rows.reduce((s, r) => s + f(r), 0);
  // v2 (COM-161/panel 006): the raise-coverage ratio is MONEY MATH and belongs here — the O15
  // measure is (earned + gated) against the live raise target (the bridge raise, "bridge $5m+").
  const raiseTargetUSD = plan.bridge?.raise ?? 0;
  const earnedPlusGated = t(r => r.earned) + t(r => r.gated);
  return {
    rows,
    totals: {
      targeted: t(r => r.targeted), gated: t(r => r.gated), earned: t(r => r.earned),
      total: t(r => r.total),
      earnedUpliftValue: t(r => r.earnedUpliftValue),
      potentialUpliftValue: t(r => r.potentialUpliftValue),
    },
    raiseTargetUSD,
    coverage: safeDiv(earnedPlusGated, raiseTargetUSD),
    schedule: { per: cu.per, pct: cu.pct, cap: cu.cap, gate: cu.gate, gateReached: stageReached(plan, cu.gate) },
  };
}

export function vestedFrac(m: number, years: number, cliff: number) { if (m < cliff) return 0; return clamp((1 / years) * (Math.floor((m - cliff) / 12) + 1), 0, 1); }

// ===== v2: dual vesting curves (COM-145 — spec v2 Δ5 · C.3 cl. 3.2(b) · Appendix D) =====
// Equity keeps v1 vestedFrac above — it is ALREADY the Cert v3 annual staircase (T2 pins it).
// RTA: 25% at the month-12 Cliff Date, then 75%/36 per month (displayed "2.08%/mo") so the curve
// closes at EXACTLY 100% at month 48 — RFC decision D1 (literal 2.08% × 36 strands 0.12%).
export function vestedFracRTA(m: number) {
  if (!ok(m) || m < 12) return 0;
  // Discrete monthly tranches, never interpolation — a fractional month has not vested its
  // tranche yet (review finding: 23.7 must price as month 23, not 1.46pp above it).
  const mm = Math.floor(Math.min(m, 48));
  return clamp(0.25 + (mm - 12) * (0.75 / 36), 0, 1);
}
// Vested-to-date per instrument — consumed by the VestingTimeline render (COM-149), the leaver
// engine (COM-153) and the Trajectory view (M11). Equity tranche shape is plan-parameterised
// (equityVestYears/equityCliff, default 4/12); the RTA curve is contractual; CASH accrues
// linearly from month 0 (a retainer earns by service, it has no cliff — prompt-set default,
// flagged in the PR). Junk months fail closed to 0 on EVERY branch.
export function vestedAtMonths(grant: Grant, m: number, years = 4, cliff = 12) {
  if (!ok(m)) return 0;
  if (grant.instrument === 'cash') return clamp(m / (years * 12), 0, 1);
  return grant.curve === 'rta' ? vestedFracRTA(m) : vestedFrac(m, years, cliff);
}
// Day-aware, timezone-free complete-months counter for LEGAL date arithmetic (cliff/tranche
// anniversaries). v1 monthsBetween is a calendar-month delta that ignores day-of-month (fine for
// display offsets, but it credits a cliff up to ~30 days early and is TZ-dependent at month
// boundaries) — never use it for vesting. Short-month anniversaries grade conservatively: the
// anniversary DAY must be reached (Jan 31 starts vest → Feb 28 has not completed the month).
export function fullMonthsBetween(aISO: string, bISO: string) {
  const pa = String(aISO).slice(0, 10).split('-').map(Number);
  const pb = String(bISO).slice(0, 10).split('-').map(Number);
  if (pa.length < 3 || pb.length < 3 || pa.some(n => !ok(n)) || pb.some(n => !ok(n))) return 0;
  let m = (pb[0] - pa[0]) * 12 + (pb[1] - pa[1]);
  if (pb[2] < pa[2]) m -= 1;
  return m;
}
export function vestedAtDate(grant: Grant, atISO: string, years = 4, cliff = 12) {
  return vestedAtMonths(grant, fullMonthsBetween(grant.vestStartISO, atISO), years, cliff);
}
// The RTA 24-month minimum Continuous Service is a DISTRIBUTION gate, not a curve change: below
// 24 months of service nothing is distributable ("to receive any token at all you must stay 24
// months; those months count inside the 4-year vest"). Capacity changes and intra-group
// transfers do NOT break Continuous Service (RTA semantics) — serviceMonths is the caller's to
// compute from the unbroken service start. The gate is a term of the RTA INSTRUMENT (the token
// award agreement), so it keys on instrument — never on the curve shape, which reconcile
// deliberately allows to mismatch (review finding: an rta/cert-v3 grant must still be gated).
export function distributableFrac(grant: Grant, m: number, serviceMonths: number, years = 4, cliff = 12) {
  if (grant.instrument === 'rta' && !(ok(serviceMonths) && serviceMonths >= 24)) return 0;
  return vestedAtMonths(grant, m, years, cliff);
}

// ===== v2: exercise mechanics (COM-151 — spec v2 Δ6 · Part 10 #4/#7 · C.2/C.3 · E.1) =====
// The mechanics, stated for the Instruments panel and the Proposition corpus. Display truth —
// the engine never simulates Board discretion; it states the rules and computes the dates.
export const EXERCISE_MECHANICS = [
  { id: 'windows', rule: 'Exercise policy', text: 'Exercise is available during Board-determined liquidity windows only — any time you like, as long as it is during a liquidity event.' },
  { id: 'backstop', rule: 'Option Certificate 3.6', text: "If no Exit Event occurs before the 9th anniversary of grant, the Company shall open an Exercise Period of at least 90 days, on at least 30 days' written notice, ending no later than the day before the 10th anniversary." },
  { id: 'net-exercise', rule: 'Plan Rule 4.5', text: "Net exercise is available at Board discretion on the holder's written request; FMV is the exit consideration at an Exit Event, otherwise the most-recent-grant methodology (Rule 4.5(c))." },
  { id: 'sell-to-cover', rule: 'Plan Rule 7.4(a)', text: 'Sell-to-cover is holder-elected: sale via a third party, the Company, or any shareholder, with surplus proceeds accounted to the holder.' },
] as const;
// Part 10 #7 (the RFC scope comment on this issue): the funding-round carve-out is an EXPLAINER —
// no adjustment math exists or may be added.
export const FUNDING_ROUND_CARVEOUT = 'Primary financings at or above nominal value trigger no compensatory adjustment to options (Rule 11.2); special distributions are at Board discretion (Rule 11.3).';

export interface ExerciseWindow { id: string; openISO: string; closeISO: string; label?: string }
// TZ-free ISO date helpers (UTC arithmetic — calendar overflow folds per Date.UTC semantics).
export const addYearsISO = (iso: string, n: number) => {
  const p = String(iso).slice(0, 10).split('-').map(Number);
  if (p.length < 3 || p.some(x => !ok(x))) return iso;
  return new Date(Date.UTC(p[0] + n, p[1] - 1, p[2])).toISOString().slice(0, 10);
};
export const dayBeforeISO = (iso: string) => {
  const p = String(iso).slice(0, 10).split('-').map(Number);
  if (p.length < 3 || p.some(x => !ok(x))) return iso;
  return new Date(Date.UTC(p[0], p[1] - 1, p[2]) - 86400000).toISOString().slice(0, 10);
};
export const addMonthsUTC = (iso: string, n: number) => {
  const p = String(iso).slice(0, 10).split('-').map(Number);
  if (p.length < 3 || p.some(x => !ok(x))) return iso;
  return new Date(Date.UTC(p[0], p[1] - 1 + n, p[2])).toISOString().slice(0, 10);
};

// v2 (COM-155): the next review checkpoint for an advisor — the growth-over-time clock that the
// Trajectory view (COM-157) and the review workflow (COM-158) read. An OPEN review (scheduled,
// not completed) is due as scheduled; otherwise the cadence runs from the latest completed
// review, else from the engagement start.
export function nextReviewDue(advisor: Advisor, plan: Plan, todayIso = todayISO()) {
  const cadence = ok(plan.reviewCadenceMonths) && plan.reviewCadenceMonths! > 0 ? plan.reviewCadenceMonths! : 12;
  const reviews = Array.isArray(advisor.reviews) ? advisor.reviews : [];
  const open = reviews.filter(r => !r.completedISO).sort((a, b) => a.scheduledISO.localeCompare(b.scheduledISO));
  if (open.length) {
    const r = open[0];
    return { dueISO: r.scheduledISO, overdue: r.scheduledISO < todayIso, source: 'scheduled' as const, review: r };
  }
  const completed = reviews.filter(r => r.completedISO).sort((a, b) => (b.completedISO as string).localeCompare(a.completedISO as string));
  const anchor = completed.length ? (completed[0].completedISO as string) : (advisor.startDate || todayIso);
  const dueISO = addMonthsUTC(anchor, cadence);
  return { dueISO, overdue: dueISO < todayIso, source: 'cadence' as const, review: null };
}

// exerciseCheck(grant, atISO, windows) — RFC §4. Board-window membership + the Clause 3.6
// backstop computed off the grant date (= vestStartISO; an advisor's VCD is the grant date).
// `backstop.required` means the company's SHALL has triggered — "no Exit Event by the 9th
// anniversary" is the caller's premise (exit events are scenario data, never engine state).
// Net-exercise and sell-to-cover ride as flags; cash/rta grants are never exercisable.
export function exerciseCheck(grant: Grant, atISO: string, windows: ExerciseWindow[] = []) {
  const exercisable = grant.instrument === 'option' && grant.lifecycle !== 'lapsed' && grant.lifecycle !== 'exercised';
  const at = String(atISO).slice(0, 10);
  const win = (windows || []).find(w => w && w.openISO && w.closeISO && String(w.openISO).slice(0, 10) <= at && at <= String(w.closeISO).slice(0, 10)) || null;
  const anniversary9 = addYearsISO(grant.vestStartISO, 9);
  const lastClose = dayBeforeISO(addYearsISO(grant.vestStartISO, 10));
  const backstopRequired = exercisable && at >= anniversary9;
  return {
    exercisable,
    inWindow: exercisable && !!win,
    window: win,
    backstop: { anniversary9ISO: anniversary9, lastCloseISO: lastClose, minWindowDays: 90, noticeDays: 30, required: backstopRequired },
    netExercise: { route: 'board-discretion-on-written-request', rule: '4.5' },
    sellToCover: { route: 'holder-elected', rule: '7.4(a)' },
  };
}

// ===== v2 (COM-169/F23): the exercise runbook — every exercise compliant by construction =====
// Composes COM-151's window/backstop check, COM-168's valuation-aware pricing (via computeGrant),
// and the jurisdictional checklist (B.6 PSC routing: the s431 election attaches to the
// UNDERLYING INDIVIDUAL — shares issued to the Service Provider personally → election available,
// signed by the individual; shares issued to the entity → NOT available; flagged at every
// Contracted-Entity exercise). Pure modeling + checklist (v1 of the feature); the pack is the
// return value — document generation comes later.
export type RunbookStatus = 'ok' | 'action' | 'blocked';
export function exerciseRunbook(
  advisor: Advisor, grant: Grant, qty: number, atISO: string,
  plan: Plan, windows: ExerciseWindow[] = [],
) {
  const check = exerciseCheck(grant, atISO, windows);
  const r: any = computeGrant(grant, plan, baseScenKey(plan));
  const n = ok(qty) && qty > 0 ? Math.min(qty, r.quantity || 0) : 0;
  const strike = r.strikePps ?? 0;
  const fmv = r.fmvPps ?? 0;
  const costs = {
    qty: n,
    exerciseCost: n * strike,
    fmvValue: n * fmv,
    intrinsic: Math.max(0, n * (fmv - strike)),
    underwater: fmv < strike,
    strikePps: strike, fmvPps: fmv,
    valuationBasis: plan.valuation ? `${plan.valuation.basis} ${plan.valuation.dateISO}` : 'round-derived',
  };
  const items: { id: string; label: string; status: RunbookStatus }[] = [];
  const windowOk = check.inWindow || check.backstop.required;
  items.push({
    id: 'window',
    label: check.inWindow
      ? `Inside the Board-determined window (${check.window!.openISO} → ${check.window!.closeISO}).`
      : check.backstop.required
        ? `The Clause 3.6 backstop applies — a ≥${check.backstop.minWindowDays}-day window must be open (≥${check.backstop.noticeDays} days' notice), closing by ${check.backstop.lastCloseISO}.`
        : `No open exercise window at ${atISO} — exercise is restricted to Board-determined liquidity windows (next backstop ${check.backstop.anniversary9ISO}).`,
    status: windowOk ? 'ok' : 'blocked',
  });
  if (advisor.taxResidency === 'UK') {
    const viaEntity = advisor.contracting === 'entity';
    items.push(viaEntity
      ? {
          id: 's431-psc',
          label: `Contracted-Entity exercise (${advisor.contractEntity || 'PSC'}): the s431 election attaches to the underlying individual — AVAILABLE only if shares are issued to the Service Provider personally (signed by the individual + the engaging entity, within 14 days); shares issued to the entity → NO election (ERSM20220). Confirm the issuance route BEFORE exercising.`,
          status: 'action',
        }
      : {
          id: 's431',
          label: 'UK grantee: file the s431 election within 14 days of exercise (restricted securities).',
          status: 'action',
        });
  }
  if (advisor.taxResidency === 'US') {
    items.push({ id: '409a', label: 'US grantee: s83(b)/409A treatment applies — confirm the 409A position against the agreed valuation before exercise.', status: 'action' });
  }
  items.push({ id: 'deed', label: 'Deed of adherence executed before first exercise (drag-along, transfer restrictions, power of attorney — the sole contractual layer; no SHA exists).', status: 'action' });
  items.push({ id: 'election', label: `Cash-free routes: net exercise at Board discretion on written request (Rule ${check.netExercise.rule}); sell-to-cover holder-elected with surplus accounted (Rule ${check.sellToCover.rule}).`, status: 'ok' });
  const blocked = items.some(i => i.status === 'blocked') || !check.exercisable || n <= 0;
  return { check, costs, items, blocked, exercisable: check.exercisable };
}

// ===== v2: leaver engine (COM-153 — Plan v9 Rule 5.8 · the RTA · Appendix F) =====
// Bad Leaver (RTA-aligned): any cessation other than death PLUS any of the six limbs.
export const BAD_LEAVER_LIMBS = [
  { limb: 1, label: 'Resignation within the first 2 years of the Vesting Commencement Date' },
  { limb: 2, label: 'Serious breach of directorship or fiduciary duties' },
  { limb: 3, label: 'Unauthorised disclosure of confidential information or IP' },
  { limb: 4, label: 'Solicitation in breach of the agreement' },
  { limb: 5, label: 'Competing via a Developed Protocol function (the enumerated (a)–(g) list; Developed Protocol = Solana or any protocol the Company actively develops on)' },
  { limb: 6, label: 'Material breach, or dismissal for cause' },
] as const;
export type LeaverType = 'bad' | 'good' | 'death';

// The classification rule, executable (suite-pinnable): Bad Leaver = any cessation OTHER THAN
// DEATH plus at least one limb. Death with limbs ticked is still NOT a Bad Leaver — the
// definition's carve-out. UIs classify through this, never ad hoc.
export const classifyLeaver = (death: boolean, limbs: number[]): LeaverType =>
  death ? 'death' : (limbs && limbs.length ? 'bad' : 'good');

// The Andersen don't-do list (Appendix F): discretion exercised these ways risks disqualifying a
// tax-approved plan. The engine SURFACES the warnings — it never computes an accelerated outcome.
export const PLAN_DISQUALIFICATION_WARNINGS = [
  'Vesting acceleration by discretion is a plan-disqualification risk — never accelerate; vested-to-date is the ceiling.',
  'Discretionary cash substitution for lapsed awards can disqualify the plan — model cash separately, never as a swap.',
  'Retesting or re-pricing awards for a leaver outside the plan rules risks disqualification — only the written rules apply.',
] as const;

// modelDeparture(advisor, leaverType, date) — per the issue (RFC-conformed name/signature).
// Bad Leaver → vested AND unvested options lapse on cessation (Rule 5.8); tokens forfeit.
// Death is never a Bad Leaver (the definition's carve-out) — treated like Board-discretion.
// Non-Bad Leaver → Board-discretion outcome carried as a FLAG over vested-to-date positions
// (good leavers MAY keep vested awards — the Quantnight/Mios precedent); never auto-vested.
// The RTA 24-month qualifying rule binds token vested-to-date (service = advisor start → date).
// Quantities come from the base-scenario rows (value-denominated grants derive there — COM-150).
export function modelDeparture(advisor: Advisor, leaverType: LeaverType, dateISO: string, plan: Plan, tiers: Tier[], objectives: Objective[]) {
  const grants = effectiveGrants(advisor, plan, tiers, objectives);
  const baseKey = baseScenKey(plan);
  const bad = leaverType === 'bad';
  const rows = grants.map(g => {
    const r = computeGrant(g, plan, baseKey);
    const zeroRow = { grant: g, instrument: g.instrument, qty: 0, vestedQty: 0, unvestedQty: 0, retainedQty: 0, lapsedQty: 0, forfeitedValue: 0, retainedValue: 0, forfeitedValueToday: 0, retainedValueToday: 0, boardDiscretion: false, pricePerUnit: 0, fmvPerUnit: 0, basis: 'none', underwater: false, derived: false };
    if (g.lifecycle === 'lapsed') return zeroRow;
    // An EXERCISED option is issued shares — it cannot lapse (Rule 5.8 lapses OPTIONS) and its
    // shares never re-enter the available pool headroom (review finding). It rides through a
    // departure fully retained, outside discretion and outside the pool delta.
    const qty = g.instrument === 'cash' ? (r.value || 0) : (r.quantity || 0);
    const pricePerUnit = g.instrument === 'option'
      ? Math.max(0, (r.exitPps ?? 0) - (r.strikePps ?? 0))
      : g.instrument === 'rta' ? (r.tokenPps ?? 0) : 1;
    // fmvPerUnit: the TODAY basis (current-stage FMV net of strike per Cert v3 4.5(c)); tokens
    // have no today print besides the TGE-derived price; cash is already today-dollars. Every
    // value field comes in BOTH bases, labelled — a departure decided today must never show
    // exit-dollars as the only stake (review finding: mixed bases misstate a Board decision).
    const fmvPerUnit = g.instrument === 'option'
      ? Math.max(0, (r.fmvPps ?? 0) - (r.strikePps ?? 0))
      : g.instrument === 'rta' ? (r.tokenPps ?? 0) : 1;
    const basis = g.instrument === 'option' ? 'exit-vs-fmv' : g.instrument === 'rta' ? 'tge-fdv' : 'today';
    if (g.instrument === 'option' && g.lifecycle === 'exercised') {
      return { ...zeroRow, qty, vestedQty: qty, retainedQty: qty, retainedValue: qty * pricePerUnit, retainedValueToday: qty * fmvPerUnit, pricePerUnit, fmvPerUnit, basis, exercised: true };
    }
    const m = fullMonthsBetween(g.vestStartISO, dateISO);
    // serviceMonths: unbroken Continuous Service from the advisor's engagement start (capacity
    // changes and intra-group transfers don't break it — prompt-set anchoring, pinned by vector:
    // a top-up grant's gate keys on SERVICE while its curve keys on the grant's own VCD).
    const serviceMonths = fullMonthsBetween(advisor.startDate || g.vestStartISO, dateISO);
    // Cash accrues over the term its dollar total was denominated in — the advisor's engagement
    // (cashAnnual × years), NEVER the plan's equity vest period (review finding: a 2-year
    // retainer fully served at month 24 must retain 100%, not 24/48ths).
    const cashYears = Math.max(advisor.years || 4, 1e-9);
    const vestedFracAt = g.instrument === 'cash'
      ? clamp(m / (cashYears * 12), 0, 1)
      : distributableFrac(g, m, serviceMonths, plan.equityVestYears ?? 4, plan.equityCliff ?? 12);
    const vestedQty = qty * vestedFracAt;
    const unvestedQty = qty - vestedQty;
    const flags = { underwater: !!r.underwater, derived: !!r.derived };
    if (bad) {
      // Rule 5.8: vested and unvested LAPSE; tokens forfeit; accrued cash is not clawed back.
      const retainedQty = g.instrument === 'cash' ? vestedQty : 0;
      const lapsedQty = qty - retainedQty;
      return { grant: g, instrument: g.instrument, qty, vestedQty, unvestedQty, retainedQty, lapsedQty, forfeitedValue: lapsedQty * pricePerUnit, retainedValue: retainedQty * pricePerUnit, forfeitedValueToday: lapsedQty * fmvPerUnit, retainedValueToday: retainedQty * fmvPerUnit, boardDiscretion: false, pricePerUnit, fmvPerUnit, basis, ...flags };
    }
    // Good leaver / death: unvested lapses; vested-to-date is RETAINED subject to Board
    // discretion (flagged) — never auto-vested beyond the curve (the Appendix F guardrail).
    return { grant: g, instrument: g.instrument, qty, vestedQty, unvestedQty, retainedQty: vestedQty, lapsedQty: unvestedQty, forfeitedValue: unvestedQty * pricePerUnit, retainedValue: vestedQty * pricePerUnit, forfeitedValueToday: unvestedQty * fmvPerUnit, retainedValueToday: vestedQty * fmvPerUnit, boardDiscretion: g.instrument !== 'cash', pricePerUnit, fmvPerUnit, basis, ...flags };
  });
  const sum = (f: (r: any) => number) => rows.reduce((s, r) => s + f(r), 0);
  const optionsLapsed = sum(r => (r.instrument === 'option' ? r.lapsedQty : 0));
  const anyDiscretion = !bad && rows.some(r => r.boardDiscretion);
  // A value-denominated grant whose derivation failed must never read as "nothing at stake" —
  // the rows carry the flags and the result says it out loud (review finding).
  const failedDerivation = rows.some(r => r.underwater && r.qty === 0);
  const warnings: string[] = [];
  // Andersen warnings surface where discretion EXISTS to exercise — a pure-cash departure has
  // no award to accelerate, so the legal banner stays off (pinned both ways).
  if (anyDiscretion) warnings.push(...PLAN_DISQUALIFICATION_WARNINGS);
  if (failedDerivation) warnings.push('A value-denominated grant could not derive a count at the current FMV (spread ≤ 0) — the zero at-stake figures are a derivation failure, not an empty award.');
  return {
    leaverType, dateISO, rows,
    optionsRetained: sum(r => (r.instrument === 'option' ? r.retainedQty : 0)),
    optionsLapsed,
    tokensForfeited: sum(r => (r.instrument === 'rta' ? r.lapsedQty : 0)),
    tokensRetained: sum(r => (r.instrument === 'rta' ? r.retainedQty : 0)),
    cashRetained: sum(r => (r.instrument === 'cash' ? r.retainedQty : 0)),
    forfeitedValue: sum(r => r.forfeitedValue),
    retainedValue: sum(r => r.retainedValue),
    forfeitedValueToday: sum(r => r.forfeitedValueToday),
    retainedValueToday: sum(r => r.retainedValueToday),
    // pool/cap-table delta: lapsed option shares return to the pool's available headroom
    // (exercised shares are issued — they never re-enter the pool).
    poolReturned: optionsLapsed,
    boardDiscretion: anyDiscretion,
    failedDerivation,
    warnings,
  };
}
