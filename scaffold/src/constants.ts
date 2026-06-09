// UI constants ported from reference/advisor-comp-studio.tsx (category + tier palettes). These are
// presentation data, NOT engine logic (the engine stays frozen). SCEN_COLORS lives in the engine.
export const CAT: Record<string, { label: string; color: string }> = {
  capital: { label: "Capital", color: "#9C4A0C" },
  customer: { label: "Customer", color: "#C46A1F" },
  partnership: { label: "Partnership", color: "#3E5C76" },
  governance: { label: "Governance", color: "#6B7F6E" },
};
export const CAT_OPTIONS = Object.entries(CAT).map(([value, v]) => ({ label: v.label, value }));
export const TIER_COLOR = ["#3E5C76", "#C46A1F", "#9C4A0C", "#6B7F6E"];

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
    text: "Earned but awaiting its milestone gate — it doesn't count toward vested value until the gate is reached.",
  },
} as const;
