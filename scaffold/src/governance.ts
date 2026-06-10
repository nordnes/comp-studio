// COM-141 (F21 / O13 / spec Δ7): the Governance Table v4 as data — ten rows (Appendix C.5,
// semantics verbatim) plus the C.6 open items not already covered by a v4 row. One row = one
// ComplianceItem. This slice lives BESIDE the engine State (sibling key in the persisted payload,
// never inside State), so the FROZEN engine and its reconcile() are untouched — governance has its
// own additive reconcile below. Tracking state only; item→grant gating semantics are the follow-on
// issue, not this one.
export type RagStatus = "red" | "amber" | "green";

export interface ComplianceItem {
  id: string; // stable key — reconcile joins on it; never renumber
  ref: string; // the register reference (v4 row or C.6 item number)
  group: string; // workstream heading on the Governance surface
  title: string;
  detail: string; // the register semantics, verbatim
  when: string; // the deadline phrase from the register ("" where the register gives none)
  owner: string; // seeded only where the register names one
  status: RagStatus;
  evidence: string; // link to the artefact that proves it (email, doc, resolution)
  note: string;
}

export interface Governance {
  items: ComplianceItem[];
}

// Seed defaults: RED = a hard pre-condition with nothing evidenced yet; AMBER = a verification,
// drafting check, conditional or later-stage obligation. Presentation defaults only — every
// status is user-editable and survives reconcile.
const item = (
  id: string,
  ref: string,
  group: string,
  title: string,
  detail: string,
  when: string,
  status: RagStatus,
  owner = "",
): ComplianceItem => ({
  id,
  ref,
  group,
  title,
  detail,
  when,
  owner,
  status,
  evidence: "",
  note: "",
});

const GROUP_A = "A · Pool & resolution";
const GROUP_B = "B · Executive grants";
const GROUP_C = "C · Bridge & investor rights";
const GROUP_D = "D · Plan operations";
const GROUP_OPEN = "Open items · workstream list";

export const GOV_SEED = (): Governance => ({
  items: [
    item(
      "a1",
      "A-1",
      GROUP_A,
      "Bell Rock Memorandum confirmation",
      "VERIFY — confirmation from Charlie / Bell Rock before the resolution is signed.",
      "before resolution signed",
      "amber",
      "Charlie / Bell Rock",
    ),
    item(
      "a2",
      "A-2",
      GROUP_A,
      "Pool count / % decision (the Resolution 4/5 blanks)",
      "OPEN — Board decision: 10% ≈ 5,368 shares / 15% ≈ 8,523 shares within the 12,450 available.",
      "",
      "red",
      "Board",
    ),
    item(
      "b3",
      "B-3",
      GROUP_B,
      "Pantera consent — per executive-officer grant",
      "REQUIRED — Robin's grant: standalone, immediate, before the term sheet; do not bundle with the bridge.",
      "before term sheet",
      "red",
    ),
    item(
      "c4",
      "C-4",
      GROUP_C,
      "Pantera consent — Converting Securities > $10m",
      "REQUIRED at the bridge.",
      "bridge",
      "red",
    ),
    item(
      "c5",
      "C-5",
      GROUP_C,
      "Pantera consent — further Token Warrants",
      "REQUIRED at the bridge; separate from consents 3 & 4.",
      "bridge",
      "red",
    ),
    item(
      "c6",
      "C-6",
      GROUP_C,
      "Pro-rata invitations — Pantera / Reciprocal / Lightspeed",
      "REQUIRED before the term sheet; document non-participation by reply email.",
      "before term sheet",
      "red",
    ),
    item(
      "c7",
      "C-7",
      GROUP_C,
      "MFN drafting check — bridge mirrors seed terms exactly",
      "Drafting check: bridge SAFE + Token Warrant mirror seed terms exactly to kill MFN flow-through (Big Brain 4.1, Figment 5.1, Pantera 8, Reciprocal seed 4, Lightspeed 2).",
      "bridge",
      "amber",
    ),
    item(
      "c8",
      "C-8",
      GROUP_C,
      "Cap table as the pre-money opening position",
      "Cap table updated with the pool, presented as the pre-money opening position to bridge investors.",
      "bridge",
      "amber",
    ),
    item(
      "d9",
      "D-9",
      GROUP_D,
      "Deed-of-adherence template",
      "Drag-along, transfer restrictions, power of attorney; the sole contractual layer — no SHA exists.",
      "before first exercise",
      "red",
    ),
    item(
      "d10",
      "D-10",
      GROUP_D,
      "Cap-table admin + ERS Annual Return setup",
      "Cap-table admin system (Carta / Pulley or equivalent) plus the ERS Annual Return process.",
      "before first grant",
      "red",
    ),
    // C.6 open items not covered by a v4 row above. [7] is distinct from C-7: the drafting check
    // kills MFN flow-through; this is the notification duty that fires only if drafting deviates.
    item(
      "open7",
      "C.6 · 7",
      GROUP_OPEN,
      "MFN notifications at bridge — if the bridge deviates from seed terms",
      "Conditional on the C-7 drafting check: MFN notifications are due at the bridge if it deviates from seed terms.",
      "bridge",
      "amber",
    ),
    item(
      "open10",
      "C.6 · 10",
      GROUP_OPEN,
      "HMRC SAV valuation",
      "Before the first grant; the same valuation feeds 409A for US grantees.",
      "before first grant",
      "red",
    ),
    item(
      "open11",
      "C.6 · 11",
      GROUP_OPEN,
      "Corporate-wallet RTA audit",
      "Token-side audit: any contractor whose RTA pays to a corporate wallet — the s431 election is unavailable if so.",
      "before next token cycle",
      "red",
    ),
    item(
      "open12",
      "C.6 · 12",
      GROUP_OPEN,
      "Series-A releases — Pantera & Lightspeed",
      "Series A: express Pantera release of ss.8–13; Lightspeed express written consent terminating s.6(a).",
      "Series A",
      "amber",
    ),
  ],
});

// Additive, id-keyed reconcile: canonical text always comes from the seed (register corrections
// propagate on deploy); the four user-owned fields survive; rows added to the seed later appear
// automatically; unknown ids are dropped. Old persisted payloads without a governance key → seed.
export function reconcileGovernance(g: any): Governance {
  const seed = GOV_SEED();
  const prev = new Map<string, any>(
    g && Array.isArray(g.items)
      ? g.items
          .filter((i: any) => i && typeof i.id === "string")
          .map((i: any) => [i.id, i] as [string, any])
      : [],
  );
  seed.items.forEach((s) => {
    const p = prev.get(s.id);
    if (!p) return;
    if (p.status === "red" || p.status === "amber" || p.status === "green") s.status = p.status;
    if (typeof p.owner === "string") s.owner = p.owner;
    if (typeof p.evidence === "string") s.evidence = p.evidence;
    if (typeof p.note === "string") s.note = p.note;
  });
  return seed;
}
