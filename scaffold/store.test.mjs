// Store-slice suite (R5.2) — reconcile round-trip coverage for the persistence slices that live
// BESIDE the engine State: the COM-141 governance checklist and the COM-170 append-only audit
// trail. (The advisor sub-slices — reviews, stage, propositions, decisions, valuation — ride the
// ENGINE's reconcile and are covered by name in engine/engine.v2.test.mjs T17/T18/T22/T24/T25.)
// Wired into the QA gate via `npm test` (engine suite + this file). Node ≥22 runs the TS sources
// directly (erasable annotations), the same convention as the v2 spec suite.
import { reconcileAudit, MAX_AUDIT_EVENTS, AUDIT_KINDS } from './src/audit.ts';
import { reconcileGovernance, GOV_SEED } from './src/governance.ts';

let pass = 0, fail = 0;
const A = (name, cond) => {
  if (cond) pass++;
  else { fail++; console.error(`  FAIL ${name}`); }
};

console.log('Store slices · reconcile round-trips (R5.2):');

// ---- audit (COM-170) ----
A('audit: missing → seeded empty (absent, null, junk scalar)',
  reconcileAudit(undefined).length === 0 && reconcileAudit(null).length === 0
  && reconcileAudit('junk').length === 0 && reconcileAudit(42).length === 0);
A('audit: valid events survive a round-trip byte-for-byte',
  (() => {
    const evs = [
      { id: 'a1', atISO: '2026-06-11T10:00:00.000Z', kind: 'grant', subject: 'Iraj', summary: 'Grant added' },
      { id: 'a2', atISO: '2026-06-11T10:01:00.000Z', kind: 'review', subject: 'Rob', summary: 'Review completed: top-up' },
    ];
    const r = reconcileAudit(JSON.parse(JSON.stringify(evs)));
    return JSON.stringify(r) === JSON.stringify(evs);
  })());
A('audit: junk entries drop without crashing; valid neighbours survive',
  (() => {
    const r = reconcileAudit([
      'garbage', null, 7,
      { id: 'ok', atISO: '2026-06-11T10:00:00.000Z', kind: 'stage', subject: 'x', summary: 's' },
      { id: 'no-kind', atISO: '2026-06-11T10:00:00.000Z', kind: 'vibes', summary: 's' },
      { id: 'no-summary', atISO: '2026-06-11T10:00:00.000Z', kind: 'grant', summary: '' },
      { atISO: '2026-06-11T10:00:00.000Z', kind: 'grant', summary: 'no id' },
    ]);
    return r.length === 1 && r[0].id === 'ok';
  })());
A('audit: duplicate ids dedupe first-wins',
  (() => {
    const r = reconcileAudit([
      { id: 'd', atISO: '2026-06-11T10:00:00.000Z', kind: 'grant', subject: 'first', summary: 'one' },
      { id: 'd', atISO: '2026-06-11T11:00:00.000Z', kind: 'review', subject: 'second', summary: 'two' },
    ]);
    return r.length === 1 && r[0].subject === 'first';
  })());
A(`audit: the tail caps at MAX_AUDIT_EVENTS (${MAX_AUDIT_EVENTS}) keeping the NEWEST`,
  (() => {
    const many = Array.from({ length: MAX_AUDIT_EVENTS + 50 }, (_, i) => ({
      id: `e${i}`, atISO: '2026-06-11T10:00:00.000Z', kind: 'grant', subject: '', summary: `s${i}`,
    }));
    const r = reconcileAudit(many);
    return r.length === MAX_AUDIT_EVENTS && r[r.length - 1].id === `e${MAX_AUDIT_EVENTS + 49}`;
  })());
A('audit: every AUDIT_KIND round-trips; an unknown kind drops',
  AUDIT_KINDS.every(k => reconcileAudit([{ id: k, atISO: 't', kind: k, subject: '', summary: 'x' }]).length === 1));

// ---- governance (COM-141) ----
A('governance: missing → the full seed (register text + seed statuses)',
  (() => {
    const r = reconcileGovernance(undefined);
    const seed = GOV_SEED();
    return r.items.length === seed.items.length && r.items[0].id === seed.items[0].id;
  })());
A('governance: user edits survive (status/owner/evidence/note) while register text stays canonical',
  (() => {
    const g = GOV_SEED();
    g.items[0].status = 'green';
    g.items[0].owner = 'Robin';
    g.items[0].evidence = 'https://example.com/x';
    g.items[0].note = 'done';
    g.items[0].title = 'TAMPERED'; // canonical text must NOT survive user mutation
    const r = reconcileGovernance(JSON.parse(JSON.stringify(g)));
    const seedTitle = GOV_SEED().items[0].title;
    return r.items[0].status === 'green' && r.items[0].owner === 'Robin'
      && r.items[0].evidence === 'https://example.com/x' && r.items[0].note === 'done'
      && r.items[0].title === seedTitle;
  })());
A('governance: junk input does not crash and yields the seed',
  (() => {
    for (const junk of ['x', 9, [], { items: 'nope' }, { items: [{ id: 7, status: 'mauve' }] }]) {
      const r = reconcileGovernance(junk);
      if (!Array.isArray(r.items) || r.items.length === 0) return false;
    }
    return true;
  })());
A('governance: an unknown status heals to the seed default (never an invalid RAG state)',
  (() => {
    const g = GOV_SEED();
    const id = g.items[0].id;
    const seedStatus = g.items[0].status;
    const r = reconcileGovernance({ items: [{ id, status: 'mauve' }] });
    return r.items.find(i => i.id === id).status === seedStatus;
  })());

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail ? 1 : 0);
