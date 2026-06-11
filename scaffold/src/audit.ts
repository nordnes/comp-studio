// COM-170 (M12): the APPEND-ONLY audit log — grant, review, consent/stage, valuation, round and
// decision changes, on the record ("defensible in a board conversation"; the precursor to M6
// auth + server persistence, where integrity gets enforced server-side). Client truths: the
// store exposes NO remove/edit API for events; reconcile never drops valid history (it only
// heals junk and caps the tail). A sibling of governance.ts — one slice per storage key, shared
// across saved boards, outside State and the #s= hash.
export const AUDIT_KINDS = [
  "grant",
  "review",
  "stage",
  "round",
  "valuation",
  "proposition",
  "decision",
  "introduction",
  "consent", // panel 008 (R3.18): governance/consent register flips — the header promised it
  "justification", // COM-176: a guardrail flag acknowledged with a one-line why
] as const;
export type AuditKind = (typeof AUDIT_KINDS)[number];

export interface AuditEvent {
  id: string;
  atISO: string; // full ISO timestamp — order within a day matters for an audit trail
  kind: AuditKind;
  subject: string; // who/what it concerns (advisor name, round label, "board")
  summary: string; // the one-line record, written by the acting code path
  why?: string; // COM-176: the optional one-line rationale — WHAT is the summary, this is WHY
}

// Storage bound: the newest MAX_EVENTS survive a reconcile — an audit tail, not a database.
// The cap is generous (years of single-user activity) and stated in the UI.
export const MAX_AUDIT_EVENTS = 1000;

export function reconcileAudit(raw: any): AuditEvent[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (e: any) =>
        e &&
        typeof e === "object" &&
        e.id &&
        typeof e.atISO === "string" &&
        e.atISO &&
        (AUDIT_KINDS as readonly string[]).includes(e.kind) &&
        typeof e.summary === "string" &&
        e.summary,
    )
    .map((e: any) => ({
      id: String(e.id),
      atISO: e.atISO,
      kind: e.kind as AuditKind,
      subject: typeof e.subject === "string" ? e.subject : "",
      summary: e.summary,
      ...(typeof e.why === "string" && e.why ? { why: e.why } : {}),
    }))
    .filter(
      (e: AuditEvent, i: number, arr: AuditEvent[]) => arr.findIndex((x) => x.id === e.id) === i,
    )
    .slice(-MAX_AUDIT_EVENTS);
}

// ===== COM-176: the justification slice — explain-or-close rationale, keyed by flag identity =====
// (advisorId::kind from the engine's justificationKey). Lives BESIDE gov/audit (one slice per
// storage key, shared across saved boards). A justified flag stays visible but acknowledged; if
// the package changes so the flag stops firing, the entry orphans harmlessly and the flag has
// cleared naturally.
export interface Justification {
  note: string;
  atISO: string;
}

export function reconcileJustifications(raw: any): Record<string, Justification> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, Justification> = {};
  for (const [k, v] of Object.entries(raw)) {
    const j: any = v;
    if (
      j &&
      typeof j === "object" &&
      typeof j.note === "string" &&
      j.note &&
      typeof j.atISO === "string" &&
      j.atISO
    )
      out[k] = { note: j.note, atISO: j.atISO };
  }
  return out;
}
