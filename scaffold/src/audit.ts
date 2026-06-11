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
] as const;
export type AuditKind = (typeof AUDIT_KINDS)[number];

export interface AuditEvent {
  id: string;
  atISO: string; // full ISO timestamp — order within a day matters for an audit trail
  kind: AuditKind;
  subject: string; // who/what it concerns (advisor name, round label, "board")
  summary: string; // the one-line record, written by the acting code path
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
    }))
    .filter(
      (e: AuditEvent, i: number, arr: AuditEvent[]) => arr.findIndex((x) => x.id === e.id) === i,
    )
    .slice(-MAX_AUDIT_EVENTS);
}
