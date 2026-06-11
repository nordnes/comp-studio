// Store-slice suite (R5.2) — reconcile round-trip coverage for the persistence slices that live
// BESIDE the engine State: the COM-141 governance checklist and the COM-170 append-only audit
// trail. (The advisor sub-slices — reviews, stage, propositions, decisions, valuation — ride the
// ENGINE's reconcile and are covered by name in engine/engine.v2.test.mjs T17/T18/T22/T24/T25.)
// Wired into the QA gate via `npm test` (engine suite + this file). Node ≥22 runs the TS sources
// directly (erasable annotations), the same convention as the v2 spec suite.
import {
  reconcileAudit,
  reconcileJustifications,
  MAX_AUDIT_EVENTS,
  AUDIT_KINDS,
} from "./src/audit.ts";
import { reconcileGovernance, GOV_SEED } from "./src/governance.ts";

let pass = 0,
  fail = 0;
const A = (name, cond) => {
  if (cond) pass++;
  else {
    fail++;
    console.error(`  FAIL ${name}`);
  }
};

console.log("Store slices · reconcile round-trips (R5.2):");

// ---- audit (COM-170) ----
A(
  "audit: missing → seeded empty (absent, null, junk scalar)",
  reconcileAudit(undefined).length === 0 &&
    reconcileAudit(null).length === 0 &&
    reconcileAudit("junk").length === 0 &&
    reconcileAudit(42).length === 0,
);
A(
  "audit: valid events survive a round-trip byte-for-byte",
  (() => {
    const evs = [
      {
        id: "a1",
        atISO: "2026-06-11T10:00:00.000Z",
        kind: "grant",
        subject: "Iraj",
        summary: "Grant added",
      },
      {
        id: "a2",
        atISO: "2026-06-11T10:01:00.000Z",
        kind: "review",
        subject: "Rob",
        summary: "Review completed: top-up",
      },
    ];
    const r = reconcileAudit(JSON.parse(JSON.stringify(evs)));
    return JSON.stringify(r) === JSON.stringify(evs);
  })(),
);
A(
  "audit: junk entries drop without crashing; valid neighbours survive",
  (() => {
    const r = reconcileAudit([
      "garbage",
      null,
      7,
      { id: "ok", atISO: "2026-06-11T10:00:00.000Z", kind: "stage", subject: "x", summary: "s" },
      { id: "no-kind", atISO: "2026-06-11T10:00:00.000Z", kind: "vibes", summary: "s" },
      { id: "no-summary", atISO: "2026-06-11T10:00:00.000Z", kind: "grant", summary: "" },
      { atISO: "2026-06-11T10:00:00.000Z", kind: "grant", summary: "no id" },
    ]);
    return r.length === 1 && r[0].id === "ok";
  })(),
);
A(
  "audit: duplicate ids dedupe first-wins",
  (() => {
    const r = reconcileAudit([
      {
        id: "d",
        atISO: "2026-06-11T10:00:00.000Z",
        kind: "grant",
        subject: "first",
        summary: "one",
      },
      {
        id: "d",
        atISO: "2026-06-11T11:00:00.000Z",
        kind: "review",
        subject: "second",
        summary: "two",
      },
    ]);
    return r.length === 1 && r[0].subject === "first";
  })(),
);
A(
  `audit: the tail caps at MAX_AUDIT_EVENTS (${MAX_AUDIT_EVENTS}) keeping the NEWEST`,
  (() => {
    const many = Array.from({ length: MAX_AUDIT_EVENTS + 50 }, (_, i) => ({
      id: `e${i}`,
      atISO: "2026-06-11T10:00:00.000Z",
      kind: "grant",
      subject: "",
      summary: `s${i}`,
    }));
    const r = reconcileAudit(many);
    return r.length === MAX_AUDIT_EVENTS && r[r.length - 1].id === `e${MAX_AUDIT_EVENTS + 49}`;
  })(),
);
A(
  "audit: every AUDIT_KIND round-trips; an unknown kind drops",
  AUDIT_KINDS.every(
    (k) => reconcileAudit([{ id: k, atISO: "t", kind: k, subject: "", summary: "x" }]).length === 1,
  ),
);

// ---- governance (COM-141) ----
A(
  "governance: missing → the full seed (register text + seed statuses)",
  (() => {
    const r = reconcileGovernance(undefined);
    const seed = GOV_SEED();
    return r.items.length === seed.items.length && r.items[0].id === seed.items[0].id;
  })(),
);
A(
  "governance: user edits survive (status/owner/evidence/note) while register text stays canonical",
  (() => {
    const g = GOV_SEED();
    g.items[0].status = "green";
    g.items[0].owner = "Robin";
    g.items[0].evidence = "https://example.com/x";
    g.items[0].note = "done";
    g.items[0].title = "TAMPERED"; // canonical text must NOT survive user mutation
    const r = reconcileGovernance(JSON.parse(JSON.stringify(g)));
    const seedTitle = GOV_SEED().items[0].title;
    return (
      r.items[0].status === "green" &&
      r.items[0].owner === "Robin" &&
      r.items[0].evidence === "https://example.com/x" &&
      r.items[0].note === "done" &&
      r.items[0].title === seedTitle
    );
  })(),
);
A(
  "governance: junk input does not crash and yields the seed",
  (() => {
    for (const junk of ["x", 9, [], { items: "nope" }, { items: [{ id: 7, status: "mauve" }] }]) {
      const r = reconcileGovernance(junk);
      if (!Array.isArray(r.items) || r.items.length === 0) return false;
    }
    return true;
  })(),
);
A(
  "governance: an unknown status heals to the seed default (never an invalid RAG state)",
  (() => {
    const g = GOV_SEED();
    const id = g.items[0].id;
    const seedStatus = g.items[0].status;
    const r = reconcileGovernance({ items: [{ id, status: "mauve" }] });
    return r.items.find((i) => i.id === id).status === seedStatus;
  })(),
);

// ---- justifications + why-notes (COM-176) ----
console.log("\nJustifications · explain-or-close round-trips (COM-176):");
A(
  "audit: a why-note survives the round-trip; junk/empty why is dropped, the event kept",
  (() => {
    const ev = (why) => ({
      id: "w1",
      atISO: "2026-06-11T10:00:00.000Z",
      kind: "justification",
      subject: "Iraj",
      summary: "Guardrail acknowledged: Band breach",
      ...(why !== undefined ? { why } : {}),
    });
    const good = reconcileAudit([ev("strategic anchor — Carl signed off 11 Jun")]);
    const junk = reconcileAudit([ev(42)]);
    const empty = reconcileAudit([ev("")]);
    return (
      good.length === 1 &&
      good[0].why === "strategic anchor — Carl signed off 11 Jun" &&
      junk.length === 1 &&
      !("why" in junk[0]) &&
      empty.length === 1 &&
      !("why" in empty[0])
    );
  })(),
);
A(
  "audit: the justification kind is vocabulary (enum-guarded like every other kind)",
  AUDIT_KINDS.includes("justification") &&
    reconcileAudit([
      {
        id: "x",
        atISO: "2026-06-11T10:00:00.000Z",
        kind: "not-a-kind",
        subject: "",
        summary: "junk",
      },
    ]).length === 0,
);
A(
  "justifications: missing/junk → {}; valid entries survive byte-for-byte; junk entries drop",
  (() => {
    const j = {
      "iraj::band-breach": { note: "anchor tier is deliberate", atISO: "2026-06-11" },
      "bad::1": { note: "", atISO: "2026-06-11" },
      "bad::2": { note: "x" },
      "bad::3": "junk",
    };
    const r = reconcileJustifications(j);
    return (
      reconcileJustifications(undefined) !== null &&
      Object.keys(reconcileJustifications(undefined)).length === 0 &&
      Object.keys(reconcileJustifications("junk")).length === 0 &&
      Object.keys(reconcileJustifications([1, 2])).length === 0 &&
      Object.keys(r).length === 1 &&
      r["iraj::band-breach"].note === "anchor tier is deliberate" &&
      r["iraj::band-breach"].atISO === "2026-06-11"
    );
  })(),
);

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail ? 1 : 0);
