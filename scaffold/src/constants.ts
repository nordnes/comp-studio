// UI constants ported from reference/advisor-comp-studio.tsx (category + tier palettes). These are
// presentation data, NOT engine logic (the engine stays frozen).
//
// COM-56: the chart / category / scenario / tier palette is ONE source of truth — semantic CSS custom
// properties declared in style.css (:root; light-only since COM-110 deleted the dead dark branch).
// Custom-SVG and DOM fills reference var(--chart-*) directly; frappe-charts takes concrete color
// values, so resolve tokens to hex with chartHex() (light-literal fallback below). SCEN_COLORS was
// moved OUT of the frozen engine.ts to here (engine logic unchanged).
const v = (token: string) => `var(${token})`;

// COM-126: the confidentiality eyebrow — ONE canonical casing, reused on screen, in the clipboard, and in
// the print running mark, so a recipient comparing copy / screen / print never sees it drift. The locked
// legal sentence ("…discussion draft, not a binding offer") is separate and stays verbatim.
export const CONFIDENTIAL_EYEBROW = "Confidential · Discussion draft";

export const CAT: Record<string, { label: string; color: string }> = {
  capital: { label: "Capital", color: v("--chart-capital") },
  customer: { label: "Customer", color: v("--chart-customer") },
  partnership: { label: "Partnership", color: v("--chart-partnership") },
  governance: { label: "Governance", color: v("--chart-governance") },
};
export const CAT_OPTIONS = Object.entries(CAT).map(([value, val]) => ({ label: val.label, value }));
export const TIER_COLOR = [
  v("--chart-partnership"),
  v("--chart-customer"),
  v("--chart-capital"),
  v("--chart-governance"),
];

// Scenario series palette (moved out of the frozen engine). Token names; resolve with chartHex().
export const SCEN_TOKENS = [
  "--chart-partnership",
  "--chart-capital",
  "--chart-uplift",
  "--chart-customer",
  "--chart-governance",
  "--chart-alt",
];

// Light-mode literals = the verified v1 hexes. Fallback when getComputedStyle is unavailable
// (e.g. pre-paint), so frappe-charts never loses its colors.
const CHART_HEX: Record<string, string> = {
  "--chart-capital": "#9C4A0C",
  "--chart-customer": "#C46A1F",
  "--chart-partnership": "#3E5C76",
  "--chart-governance": "#6B7F6E",
  "--chart-uplift": "#2F6E63",
  "--chart-alt": "#8C6A4A",
  "--chart-tint": "#E7C99B",
  "--chart-cash": "#87807A",
  "--chart-warning": "#8C3A2B",
  "--chart-median": "#6E7A8A",
};

// Resolve a --chart-* token to a concrete hex for libraries that take color values (frappe-charts).
// COM-136: chart-label shortener — first name, plus a last initial when two advisors share it;
// mononyms keep their single name and an empty name guards to "—". Presentation only.
export function shortName(name: string, all: string[]): string {
  const firstOf = (n: string) => (n || "").trim().split(/\s+/)[0] || "—";
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const f = firstOf(name);
  const dup = all.filter((n) => firstOf(n) === f).length > 1;
  return dup && parts.length > 1 ? `${f} ${parts[parts.length - 1][0]}.` : f;
}

export function chartHex(token: string): string {
  const name = token.startsWith("--") ? token : `--${token}`;
  if (typeof window !== "undefined" && typeof getComputedStyle === "function") {
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (resolved) return resolved;
  }
  return CHART_HEX[name] ?? "#9C4A0C";
}

// COM-52: glossary for load-bearing finance jargon, surfaced via the <Term> tooltip component.
// Presentation copy (NOT the legal corpus, which stays verbatim) — plain-language definitions
// for council members who won't know every term cold.
export const GLOSSARY = {
  netOfStrike: {
    term: "net of strike",
    text: "Value after subtracting the cost to exercise the options (the strike price) — what an advisor actually nets, before tax.",
  },
  tgeFdv: {
    term: "TGE FDV",
    text: "Token Generation Event fully-diluted valuation — the implied value of the whole token supply at launch. Here it is a multiple of the anchor round's post-money.",
  },
  tierMultiplier: {
    term: "tier multiplier",
    text: "A per-advisor multiplier applied to the uniform base grant, set by the advisor's tier.",
  },
  headroom: {
    term: "headroom",
    text: "Remaining upside to the ceiling case — value still unearned, gated behind future performance milestones.",
  },
  awaitingGate: {
    term: "awaiting gate",
    text: "Earned, but its milestone gate hasn't been reached yet — so the uplift doesn't count toward the package's current value until the company hits that milestone.",
  },
  // COM-129: explanatory entries for the Overview benchmark terms (the benchmark citation strings
  // themselves stay byte-identical — only the tooltip trigger wraps the term token).
  fast: {
    term: "FAST",
    text: "The Founder Institute's Founder/Advisor Standard Template — the market-standard grid for advisor equity by engagement level; the per-head benchmark used here.",
  },
  advisoryPool: {
    term: "advisory pool",
    text: "The total equity a company sets aside for all advisors combined — benchmarked at roughly 5% of fully-diluted supply.",
  },
} as const;
