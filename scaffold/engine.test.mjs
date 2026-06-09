// Raiku Advisory Comp Studio — engine regression tests
// Run:  node advisor-comp-engine.test.mjs
// This mirrors the pure engine in advisor-comp-studio.tsx (cap-table walk, net-of-strike,
// scenario dilution, TGE multiplier, gating, channel capital, pool warnings, roadmap CSV).
// If the artifact engine changes, update this file to match (it is a spec, not an import).

// ---- helpers (copied from the artifact) ----
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const safeDiv = (a, b, fb = 0) => (b && isFinite(b) && isFinite(a) ? a / b : fb);
const ROUND_LABEL = {
  bridge: "Bridge",
  seriesA: "Series A",
  seriesB: "Series B",
  seriesC: "Series C",
};
const fPct = (n, d = 2) => `${(n * 100).toFixed(d)}%`;

// ---- minimal DEFAULT (matches the artifact defaults + confirmed roster) ----
const SECTORS = [
  "Asset Management — HF & Family Offices",
  "Asset Management — SWF & Endowments",
  "Technology & FinTech",
  "Capital Markets",
  "Payments & FX",
  "Infrastructure",
  "Legal & Governance",
];
function DEFAULT() {
  return {
    plan: {
      fdPreESOP: 48316.78,
      tokenSupply: 10e9,
      bridge: { post: 90e6, raise: 5e6, esop: 0.1 },
      esopStart: 0.1,
      esopCap: 0.2,
      scenarios: {
        conservative: {
          label: "Conservative",
          seriesA: { post: 100e6, raise: 20e6, esop: 0.1 },
          seriesB: { post: 150e6, raise: 40e6, esop: 0.15 },
          seriesC: { post: 300e6, raise: 80e6, esop: 0.2 },
          tgeMult: 2,
        },
        base: {
          label: "Base",
          seriesA: { post: 120e6, raise: 20e6, esop: 0.15 },
          seriesB: { post: 300e6, raise: 40e6, esop: 0.15 },
          seriesC: { post: 500e6, raise: 80e6, esop: 0.2 },
          tgeMult: 5,
        },
        aggressive: {
          label: "Aggressive",
          seriesA: { post: 150e6, raise: 20e6, esop: 0.15 },
          seriesB: { post: 500e6, raise: 40e6, esop: 0.2 },
          seriesC: { post: 750e6, raise: 80e6, esop: 0.2 },
          tgeMult: 12,
        },
      },
      tgeAnchor: "seriesA",
      baseGrant: { equityPct: 0.005, tokenPct: 0.003 },
      advisorTokenPoolPct: 0.05,
      committedAdvisorTokenPct: 0.0317,
      boardTokenBucketPct: 0.045,
      capitalUplift: { per: 1e6, pct: 0.1, cap: 1.0, gate: "bridge" },
      currentStage: "bridge",
      cocAccelPct: 0,
      milestones: [{ id: "bridge" }, { id: "mainnet" }, { id: "seriesA" }, { id: "tge" }],
    },
    tiers: [
      { name: "Base", mult: 1 },
      { name: "Strategic", mult: 2 },
      { name: "Anchor", mult: 3 },
    ],
    objectives: [
      { id: "cap-anchor", uplift: 0.5, gate: "bridge" },
      { id: "cap-intro", uplift: 0.4, gate: "bridge" },
      { id: "cust-partner", uplift: 0.3, gate: "mainnet" },
      { id: "part-mandate", uplift: 0.3, gate: "mainnet" },
      { id: "gov-engaged", uplift: 0.2, gate: "seriesA" },
    ],
    advisors: [
      {
        id: "iraj",
        name: "Iraj Ispahani",
        mode: "tier",
        tier: 2,
        grantRound: "bridge",
        performance: {
          capitalEquity: 0,
          capitalToken: 0,
          achieved: [],
          targeted: ["cap-anchor", "gov-engaged"],
        },
      },
      {
        id: "mk",
        name: "Martin Keller",
        mode: "tier",
        tier: 1,
        grantRound: "bridge",
        performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: ["cap-intro"] },
      },
      {
        id: "kd",
        name: "Kerim Derhalli",
        mode: "tier",
        tier: 1,
        grantRound: "bridge",
        performance: {
          capitalEquity: 0,
          capitalToken: 0,
          achieved: [],
          targeted: ["cust-partner"],
        },
      },
      {
        id: "rr",
        name: "Robert Reoch",
        mode: "tier",
        tier: 1,
        grantRound: "bridge",
        performance: {
          capitalEquity: 0,
          capitalToken: 0,
          achieved: [],
          targeted: ["part-mandate"],
        },
      },
    ],
  };
}

// ---- engine (copied) ----
function walkScenario(plan, scenKey) {
  const s = plan.scenarios[scenKey];
  const bridgeEsop = plan.esopStart ?? plan.bridge.esop ?? 0.1;
  const steps = [];
  const N1 = plan.fdPreESOP / (1 - safeDiv(plan.bridge.raise, plan.bridge.post) - bridgeEsop);
  let prevN = N1,
    prevEsop = bridgeEsop * N1;
  steps.push({ id: "bridge", post: plan.bridge.post, N: N1, price: plan.bridge.post / N1 });
  ["seriesA", "seriesB", "seriesC"].forEach((rid) => {
    const r = s[rid];
    if (!r) return;
    const N = (prevN - prevEsop) / (1 - safeDiv(r.raise, r.post) - r.esop);
    steps.push({ id: rid, post: r.post, N, price: r.post / N });
    prevN = N;
    prevEsop = r.esop * N;
  });
  const byId = Object.fromEntries(steps.map((s) => [s.id, s]));
  return { steps, byId, exit: steps[steps.length - 1] };
}
const stageIdx = (plan, id) => {
  const i = plan.milestones.findIndex((m) => m.id === id);
  return i < 0 ? 0 : i;
};
const stageReached = (plan, g) => stageIdx(plan, g) <= stageIdx(plan, plan.currentStage);
function tgeFdvFor(plan, k, w) {
  const a = w.byId[plan.tgeAnchor] || w.byId.seriesA || w.exit;
  return (plan.scenarios[k].tgeMult || 1) * (a?.post || 0);
}
function computeAdvisor(a, plan, tiers, objectives) {
  const bg = plan.baseGrant,
    grantRound = a.grantRound || "bridge";
  const t = tiers[a.tier || 0] || tiers[0];
  const tierMult = t.mult ?? 1;
  const baseEq = bg.equityPct * tierMult,
    baseTk = bg.tokenPct * tierMult;
  const perf = a.performance || {};
  const cu = plan.capitalUplift;
  const capTotal =
    perf.capitalEquity != null || perf.capitalToken != null
      ? (perf.capitalEquity || 0) + (perf.capitalToken || 0)
      : perf.capitalIntroduced || 0;
  const capRaw = clamp(safeDiv(capTotal, cu.per) * cu.pct, 0, cu.cap);
  const capActive = stageReached(plan, cu.gate) ? capRaw : 0;
  const oMap = Object.fromEntries(objectives.map((o) => [o.id, o]));
  const ach = perf.achieved || [],
    tgt = perf.targeted || [];
  const earnedObj = ach
    .filter((id) => oMap[id] && stageReached(plan, oMap[id].gate))
    .reduce((s, id) => s + oMap[id].uplift, 0);
  const ceilObj = [...new Set([...ach, ...tgt])].reduce((s, id) => s + (oMap[id]?.uplift || 0), 0);
  const earnedUplift = capActive + earnedObj,
    ceilUplift = capRaw + ceilObj;
  const eqPct = baseEq * (1 + earnedUplift),
    tkPct = baseTk * (1 + earnedUplift);
  const eqPctCeil = baseEq * (1 + ceilUplift),
    tkPctCeil = baseTk * (1 + ceilUplift);
  const scen = Object.keys(plan.scenarios).map((k) => {
    const w = walkScenario(plan, k);
    const grant = w.byId[grantRound] || w.byId.bridge,
      exit = w.exit;
    const retention = safeDiv(grant.N, exit.N),
      strikeBasis = grant.post,
      fdv = tgeFdvFor(plan, k, w);
    const netEqAt = (pct, V) => Math.max(0, pct * (retention * V - strikeBasis));
    const equity = netEqAt(eqPct, exit.post),
      token = tkPct * fdv;
    return {
      key: k,
      retention,
      strikeBasis,
      exitVal: exit.post,
      fdv,
      grantPrice: grant.price,
      netEqAt,
      equity,
      token,
      total: equity + token,
      underwater: retention * exit.post < strikeBasis,
    };
  });
  const sb = scen.find((x) => x.key === "base");
  return {
    tierMult,
    baseEq,
    baseTk,
    earnedUplift,
    ceilUplift,
    capRaw,
    eqPct,
    tkPct,
    eqPctCeil,
    tkPctCeil,
    scen,
    base: sb,
    strikePps: sb.grantPrice,
    baseEqNet: sb.netEqAt(eqPct, sb.exitVal),
    baseCaseTotal: sb.netEqAt(eqPct, sb.exitVal) + tkPct * sb.fdv,
  };
}
function computeBoard(advisors, plan, tiers, objectives) {
  const rows = advisors.map((a) => ({ a, c: computeAdvisor(a, plan, tiers, objectives) }));
  const sumEqCeil = rows.reduce((s, r) => s + r.c.eqPctCeil, 0),
    sumTkCeil = rows.reduce((s, r) => s + r.c.tkPctCeil, 0);
  const cost = {};
  Object.keys(plan.scenarios).forEach(
    (k) =>
      (cost[k] = rows.reduce((s, r) => s + (r.c.scen.find((x) => x.key === k)?.total || 0), 0)),
  );
  const baseWalk = walkScenario(plan, "base");
  const esopNow = baseWalk.byId[plan.currentStage] || baseWalk.byId.bridge;
  const esopNowPct =
    plan.currentStage === "seriesA" ? plan.scenarios.base.seriesA.esop : plan.esopStart;
  const warnings = [];
  const boardBucket = plan.boardTokenBucketPct;
  if (sumEqCeil > esopNowPct + 1e-9)
    warnings.push(`equity ceiling ${fPct(sumEqCeil)} exceeds ESOP`);
  if (sumTkCeil > boardBucket + 1e-9)
    warnings.push(`token ceiling ${fPct(sumTkCeil)} exceeds board bucket`);
  const cap = plan.esopCap;
  const over = [];
  Object.keys(plan.scenarios).forEach((k) =>
    ["seriesA", "seriesB", "seriesC"].forEach((rid) => {
      if (plan.scenarios[k][rid].esop > cap + 1e-9) over.push(`${k} ${rid}`);
    }),
  );
  if (plan.esopStart > cap + 1e-9) over.push("bridge");
  if (over.length) warnings.push(`ESOP exceeds cap: ${over[0]}`);
  return { rows, sumEqCeil, sumTkCeil, cost, warnings, boardBucket };
}

// ---- roadmap CSV (copied) ----
function parseRoadmapCSV(text) {
  const out = { scenarios: {} };
  const num = (s) => {
    const v = parseFloat(String(s).replace(/[^0-9.-]/g, ""));
    return isNaN(v) ? null : v;
  };
  const pct = (s) => {
    const v = num(s);
    return v == null ? null : v > 1 ? v / 100 : v;
  };
  String(text)
    .split(/\r?\n/)
    .map((l) => l.split(",").map((c) => c.trim()))
    .forEach((r) => {
      const scope = (r[0] || "").toLowerCase(),
        round = (r[1] || "").toLowerCase();
      if (!["bridge", "conservative", "base", "aggressive"].includes(scope)) return;
      const post = num(r[2]),
        raise = num(r[3]),
        esop = pct(r[4]),
        tge = num(r[5]);
      if (scope === "bridge") {
        out.bridge = out.bridge || {};
        if (post != null) out.bridge.post = post;
        if (raise != null) out.bridge.raise = raise;
        if (esop != null) out.esopStart = esop;
        return;
      }
      out.scenarios[scope] = out.scenarios[scope] || {};
      const rid =
        round === "seriesa"
          ? "seriesA"
          : round === "seriesb"
            ? "seriesB"
            : round === "seriesc"
              ? "seriesC"
              : null;
      if (rid) {
        out.scenarios[scope][rid] = {};
        if (post != null) out.scenarios[scope][rid].post = post;
        if (raise != null) out.scenarios[scope][rid].raise = raise;
        if (esop != null) out.scenarios[scope][rid].esop = esop;
      }
      if (tge != null) out.scenarios[scope].tgeMult = tge;
    });
  return out;
}

// ---- test runner ----
let pass = 0,
  fail = 0;
const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
const A = (name, cond) => {
  if (cond) {
    pass++;
    console.log("  PASS " + name);
  } else {
    fail++;
    console.log("  FAIL " + name);
  }
};

const S = DEFAULT();
const w = walkScenario(S.plan, "base");

console.log("\nCap-table walk (Base path):");
A("bridge FD = 57,217", near(Math.round(w.byId.bridge.N), 57217, 3));
A("series A FD ≈ 75,359", near(Math.round(w.byId.seriesA.N), 75359, 90));
A("series B FD ≈ 89,380", near(Math.round(w.byId.seriesB.N), 89380, 130));
A("series C FD ≈ 118,708", near(Math.round(w.byId.seriesC.N), 118708, 160));
A("bridge strike ≈ $1,572.95", near(w.byId.bridge.price, 1572.95, 3));

console.log("\nTGE FDV (multiplier × Series A):");
A("base 5× $120M = $600M", near(tgeFdvFor(S.plan, "base", w), 600e6, 1e6));
A(
  "conservative 2× $100M = $200M",
  near(tgeFdvFor(S.plan, "conservative", walkScenario(S.plan, "conservative")), 200e6, 1e6),
);
A(
  "aggressive 12× $150M = $1.8B",
  near(tgeFdvFor(S.plan, "aggressive", walkScenario(S.plan, "aggressive")), 1.8e9, 1e6),
);

console.log("\nAdvisor maths (Iraj, Anchor / chair):");
const iraj = computeAdvisor(S.advisors[0], S.plan, S.tiers, S.objectives);
A("Anchor base equity = 1.5%", near(iraj.baseEq, 0.015));
A("ceiling uplift = anchor 50% + gov 20% = 70%", near(iraj.ceilUplift, 0.7));
A("no earned uplift at bridge stage", near(iraj.earnedUplift, 0));
const ret = w.byId.bridge.N / w.exit.N;
A(
  "net base equity = max(0, eqPct·(ret·exit − strike))",
  near(iraj.baseEqNet, Math.max(0, 0.015 * (ret * 500e6 - 90e6)), 2000),
);
A(
  "scenario ordering conservative ≤ base ≤ aggressive",
  iraj.scen.find((x) => x.key === "conservative").total <=
    iraj.scen.find((x) => x.key === "base").total + 1 &&
    iraj.scen.find((x) => x.key === "base").total <=
      iraj.scen.find((x) => x.key === "aggressive").total + 1,
);

console.log("\nGating + channels + grant round:");
const cbTest = {
  id: "t",
  mode: "tier",
  tier: 1,
  grantRound: "bridge",
  performance: { capitalEquity: 3e6, capitalToken: 2e6, achieved: [], targeted: [] },
};
A(
  "channel capital sums ($3M+$2M → +50%)",
  near(computeAdvisor(cbTest, S.plan, S.tiers, S.objectives).capRaw, 0.5),
);
const atA = computeAdvisor({ ...cbTest, grantRound: "seriesA" }, S.plan, S.tiers, S.objectives);
const atB = computeAdvisor({ ...cbTest, grantRound: "bridge" }, S.plan, S.tiers, S.objectives);
A(
  "grant at Series A retains more than at bridge",
  atA.scen.find((x) => x.key === "base").retention >
    atB.scen.find((x) => x.key === "base").retention,
);
const gated = computeAdvisor(
  {
    id: "g",
    mode: "tier",
    tier: 0,
    grantRound: "bridge",
    performance: { achieved: ["cust-partner"], targeted: [] },
  },
  S.plan,
  S.tiers,
  S.objectives,
);
A("earned-but-gated objective does not count at bridge stage", near(gated.earnedUplift, 0));

console.log("\nBoard / pool guards:");
const b = computeBoard(S.advisors, S.plan, S.tiers, S.objectives);
A("clean default load (no warnings)", b.warnings.length === 0);
A(
  "company cost ordering cons ≤ base ≤ aggr",
  b.cost.conservative <= b.cost.base + 1 && b.cost.base <= b.cost.aggressive + 1,
);
const S2 = DEFAULT();
S2.plan.scenarios.base.seriesB.esop = 0.25;
A(
  "ESOP-cap warning fires when a round > 20%",
  computeBoard(S2.advisors, S2.plan, S2.tiers, S2.objectives).warnings.some((x) =>
    /ESOP exceeds cap/.test(x),
  ),
);
const S3 = DEFAULT();
S3.plan.boardTokenBucketPct = 0.001;
A(
  "token-bucket warning fires when ceiling > bucket",
  computeBoard(S3.advisors, S3.plan, S3.tiers, S3.objectives).warnings.some((x) =>
    /board bucket/.test(x),
  ),
);

console.log("\nRoadmap CSV:");
const parsed = parseRoadmapCSV(
  "scope,round,postMoney,raise,esopPct,tgeMult\nbase,seriesB,350000000,40000000,15,5",
);
A("parses post-money", near(parsed.scenarios.base.seriesB.post, 350e6, 1));
A("percent esop 15 → 0.15", near(parsed.scenarios.base.seriesB.esop, 0.15));

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail ? 1 : 0);
