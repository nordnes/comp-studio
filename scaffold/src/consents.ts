// COM-166 (M12 / F21 / O13): the investor consent matrix as DATA — Appendix A.6 verbatim
// (definitive — 47 investors reviewed). This module is a sibling of governance.ts: no money, no
// engine import; COM-167 wires the blocking semantics over it. One row = one investor (or the
// residual bucket). Every field is the register's words — fix the SPEC first if a line is wrong.

export type RightStatus = "live" | "extinguished" | "none";

export interface ConsentTrigger {
  id: string; // joins to actions (COM-167 gating) and to the Governance checklist rows
  label: string; // the A.6 wording
}

export interface ConsentEntity {
  id: string;
  name: string;
  context: string; // instrument + date, verbatim
  consent: RightStatus;
  consentTriggers: ConsentTrigger[]; // empty unless consent is live
  proRata: RightStatus | "live-uncapped";
  mfn: string; // clause ref, "" = none
  survival: string; // the survival semantics, verbatim ("" = none stated)
}

export const CONSENT_MATRIX: ConsentEntity[] = [
  {
    id: "pantera",
    name: "Pantera (3 entities)",
    context: "$8m SAFEs + Side Letter 13 Jun 2025",
    consent: "live",
    consentTriggers: [
      {
        id: "executive-officer-grant",
        label:
          "Each executive-officer grant requires written consent (Robin's grant = immediate item, standalone, before term sheet, not bundled with bridge)",
      },
      {
        id: "converting-securities-gt-10m",
        label: "Converting Securities > US$10m aggregate (bridge SAFE)",
      },
      { id: "further-token-warrants", label: "Further Token Warrants (bridge)" },
    ],
    proRata: "live-uncapped",
    mfn: "",
    survival:
      "s.7/Exhibit A consent list live until SAFE converts; pool creation does NOT trigger consent; ss.8–13 survive Series A absent express release",
  },
  {
    id: "big-brain",
    name: "Big Brain",
    context: "pre-seed; waiver 12 Jun 2025",
    consent: "extinguished",
    consentTriggers: [],
    proRata: "extinguished",
    mfn: "MFN s.4.1",
    survival: "MFN s.4.1 and information rights survive",
  },
  {
    id: "figment",
    name: "Figment",
    context: "waiver 13 Jun 2025",
    consent: "extinguished",
    consentTriggers: [],
    proRata: "extinguished",
    mfn: "MFN s.5.1",
    survival: "MFN s.5.1 survives",
  },
  {
    id: "reciprocal",
    name: "Reciprocal",
    context: "seed",
    consent: "none",
    consentTriggers: [],
    proRata: "live",
    mfn: "token MFN seed s.4",
    survival: "pro-rata live (seed s.1); no equity consent",
  },
  {
    id: "lightspeed",
    name: "Lightspeed",
    context: "seed",
    consent: "none",
    consentTriggers: [],
    proRata: "live",
    mfn: "token MFN s.2",
    survival:
      "anti-termination s.6(a) — all rights survive any future company document unless Lightspeed expressly consents in writing (critical at Series A)",
  },
  {
    id: "other-40",
    name: "All other 40+ investors",
    context: "standard SAFEs/Token Warrants",
    consent: "none",
    consentTriggers: [],
    proRata: "none",
    mfn: "",
    survival: "no side letters",
  },
];

// Resolution v5's standing facts — rendered with the matrix, load-bearing for COM-167's gating.
export const CONSENT_FACTS = [
  "Resolution v5 confirms: no investor consent is required to adopt the Plan or create the pool.",
  "The cap table must be updated post-pool and shared with Pantera, Big Brain and Figment under information rights.",
] as const;

// The actions COM-167 gates on — each maps to the live triggers that bite.
export const consentersFor = (actionId: string): ConsentEntity[] =>
  CONSENT_MATRIX.filter(
    (e) => e.consent === "live" && e.consentTriggers.some((t) => t.id === actionId),
  );
