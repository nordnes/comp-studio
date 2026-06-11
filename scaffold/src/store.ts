// Reactive client-side store wrapping the FROZEN pure engine. No frappe-ui data layer
// (createResource/useList/call/initSocket are out of scope). Mirrors every reducer action in
// reference/advisor-comp-studio.tsx — incl. the delete CASCADES — plus named multi-board
// persistence ({scenarios,last} map, reference parity), clipboard Copy/Paste, #s= URL hash,
// and JSON / board-CSV / roadmap-CSV IO. The engine is the only place money is computed.
import { reactive, computed } from "vue";
import { toast } from "frappe-ui";
import {
  seedBoard,
  reconcile,
  computeBoard,
  computeAdvisor,
  effectiveGrants,
  hasExplicitGrants,
  scenKeys,
  baseScenKey,
  walkScenario,
  currentRoundStep,
  crystalliseIntroductions,
  roadmapToCSV,
  parseRoadmapCSV,
  todayISO,
  SECTORS,
  type State,
  type Scenario,
  fPps,
  makeScenarioSet,
  planWithSet,
  makeProposition,
  type Instrument,
} from "./engine";
import { reconcileGovernance, type ComplianceItem, type Governance } from "./governance";
import { reconcileAudit, MAX_AUDIT_EVENTS, type AuditEvent, type AuditKind } from "./audit";

const KEY = "raiku-advisor-comp-v5";
type SavedMap = Record<string, State>;

// ---- low-level storage (localStorage; the artifact's window.storage backend is dropped) ----
const lsGet = (): any => {
  try {
    const v = localStorage.getItem(KEY);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};
const lsSet = (o: any): boolean => {
  try {
    localStorage.setItem(KEY, JSON.stringify(o));
    return true;
  } catch {
    return false;
  }
};
const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o));
const uid = (p: string) =>
  p + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);

// base64 URL-hash payload (raw State) — unicode-safe, mirrors the scaffold's btoa/atob dance.
const decodeHash = (h: string): any => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(h))));
  } catch {
    return null;
  }
};
const encodeHash = (s: any): string => {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(s))));
  } catch {
    return "";
  }
};

interface Store {
  S: State;
  selId: string;
  saved: SavedMap;
  last: string;
  showMgr: boolean;
  storageOk: boolean;
  // COM-82: transient pin-to-compare selection (COM-86 reads it) — UI-only, NEVER enters
  // State/persist/#s= hash; scrubbed against the live roster in fixSel().
  pinnedIds: string[];
  // COM-141: the Governance Table v4 checklist — company-level fact, so it lives BESIDE the
  // board map (one slice per storage key, shared across saved boards) and outside State/#s=.
  gov: Governance;
  // COM-170: the append-only audit trail — beside the board map like gov, outside State/#s=.
  audit: AuditEvent[];
}

function bootstrap(): Store {
  let S: State | null = null;
  const saved: SavedMap = {};
  let last = "";
  let storageOk = true;
  try {
    storageOk = typeof localStorage !== "undefined" && !!localStorage;
  } catch {
    storageOk = false;
  }

  const persisted = lsGet();
  let migrated = false;
  if (persisted && typeof persisted === "object") {
    if (persisted.scenarios && !persisted.plan) {
      // Named-board map shape (reference parity): { scenarios: {name: State}, last: name }.
      // COM-171: EVERY map member migrates at load (v5 → v6) — not just the active board —
      // and the upgraded map writes straight back so the on-disk shape is v6 immediately.
      Object.keys(persisted.scenarios).forEach((n) => {
        const raw = persisted.scenarios[n];
        saved[n] = reconcile(raw);
        if (raw?.version !== saved[n].version) migrated = true;
      });
      last = persisted.last && saved[persisted.last] ? persisted.last : Object.keys(saved)[0] || "";
      // The working board must NOT alias its saved-map entry (Save-as would then corrupt the
      // original board through the shared object — review finding); clone like loadBoard does.
      if (last && saved[last]) S = clone(saved[last]);
    } else if (persisted.plan || persisted.advisors) {
      // Legacy raw State (old scaffold) under the same key → migrate into the map so reconcile is safe.
      S = reconcile(persisted);
      last = S.name || "Imported board";
      saved[last] = S;
      migrated = true;
    }
  }
  if (migrated && storageOk) {
    lsSet({ scenarios: saved, last, governance: persisted?.governance });
  }
  // A #s= URL hash (raw State) is a one-off shared link — load it over whatever was persisted.
  try {
    const m = location.hash.match(/s=([^&]+)/);
    if (m) {
      const h = decodeHash(m[1]);
      if (h) S = reconcile(h);
    }
  } catch {
    /* ignore */
  }

  // COM-160: a brand-new session seeds the REAL roster (Δ9); DEFAULT() stays the test fixture.
  if (!S) S = seedBoard();
  if (!last) last = S.name;
  if (!saved[last]) saved[last] = S;
  return {
    S,
    selId: S.advisors[0]?.id || "",
    saved,
    last,
    showMgr: false,
    storageOk,
    pinnedIds: [],
    gov: reconcileGovernance(persisted?.governance),
    audit: reconcileAudit(persisted?.audit),
  };
}

const store = reactive<Store>(bootstrap());

// COM-53: action feedback via frappe-ui Toast (rendered by the mounted FrappeUIProvider/ToastProvider),
// replacing the old ephemeral header span. Failures route to an error toast; everything else to success.
function flash(m: string) {
  if (/fail|invalid|blocked|unavailable|exceed/i.test(m)) toast.error(m);
  else toast.success(m);
}
// COM-45: trust-boundary check before applying an imported/pasted board — JSON.parse succeeds on junk
// ({}, arrays, a number), which would feed reconcile garbage. A valid board has a plan object + advisors array.
function validImport(o: any): boolean {
  return (
    !!o &&
    typeof o === "object" &&
    !Array.isArray(o) &&
    !!o.plan &&
    typeof o.plan === "object" &&
    Array.isArray(o.advisors)
  );
}

// The working board auto-saves into saved[S.name] (deviation from the reference's explicit-Save model —
// safer for a live tool). Mgr "Save as" forks a named snapshot.
function persist() {
  store.saved[store.S.name] = store.S;
  store.last = store.S.name;
  if (
    !lsSet({ scenarios: store.saved, last: store.last, governance: store.gov, audit: store.audit })
  )
    store.storageOk = false;
}
function fixSel() {
  if (!store.S.advisors.find((a) => a.id === store.selId))
    store.selId = store.S.advisors[0]?.id || "";
  store.pinnedIds = store.pinnedIds.filter((id) => store.S.advisors.some((a) => a.id === id));
}

// COM-70: lightweight Undo for reversible list deletes. Snapshot the whole working board before the
// mutation, then offer "Undo" on an info toast (frappe-ui toast.create action). restoreUndo() swaps S
// back. Catastrophic actions (Reset, delBoard) keep the confirm dialog instead. Engine untouched.
let undoSnap: State | null = null;
function pushUndo() {
  undoSnap = clone(store.S);
}
function restoreUndo() {
  if (!undoSnap) return;
  store.S = undoSnap;
  undoSnap = null;
  fixSel();
  persist();
  toast.success("Restored");
}
function undoToast(what: string) {
  toast.create({
    message: `Removed ${what}`,
    type: "info",
    action: { label: "Undo", onClick: restoreUndo },
  });
}

// COM-170: the ONLY write path into the audit trail — append, cap the tail, persist with the
// next mutation. No remove/edit API exists by design (append-only; M6 hardens it server-side).
function appendAudit(kind: AuditKind, subject: string, summary: string) {
  store.audit.push({
    id: uid("au"),
    atISO: new Date().toISOString(),
    kind,
    subject,
    summary,
  });
  if (store.audit.length > MAX_AUDIT_EVENTS)
    store.audit.splice(0, store.audit.length - MAX_AUDIT_EVENTS);
}

function download(name: string, text: string, mime: string): boolean {
  try {
    const b = new Blob([text], { type: mime });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u;
    a.download = name;
    a.click();
    URL.revokeObjectURL(u);
    return true;
  } catch {
    return false;
  }
}

// Shared singletons — created once so computeBoard/computeAdvisor don't re-run per component instance.
const board = computed(() =>
  computeBoard(store.S.advisors, store.S.plan, store.S.tiers, store.S.objectives),
);
const selected = computed(() => {
  const a = store.S.advisors.find((x) => x.id === store.selId) || store.S.advisors[0];
  if (!a) return null;
  // COM-81: an advisor's caseOverride re-bases THIS projection via a SHALLOW PLAN CLONE — never a
  // mutation of store.S.plan, so Board/Compare/Overview keep reading the global lens untouched.
  const plan =
    a.caseOverride && store.S.plan.scenarios[a.caseOverride]
      ? { ...store.S.plan, baseScenario: a.caseOverride }
      : store.S.plan;
  return { a, c: computeAdvisor(a, plan, store.S.tiers, store.S.objectives) };
});

export function useStudio() {
  // ---- core mutations (SET / LOAD / select / reset) ----
  function setPath(path: (string | number)[], value: any) {
    // COM-170: the valuation record is an audited fact (F22) — the one setPath-routed write
    // that belongs on the trail (everything else audited has a named action).
    if (path[0] === "plan" && path[1] === "valuation" && path.length === 2) {
      appendAudit(
        "valuation",
        "plan",
        value
          ? `Valuation recorded: ${fPps(value.ppsUSD)}/share (${value.basis}, ${value.dateISO})`
          : "Valuation cleared — strikes fall back to round-derived",
      );
    }
    let o: any = store.S;
    for (let i = 0; i < path.length - 1; i++) {
      if (o[path[i]] == null) o[path[i]] = typeof path[i + 1] === "number" ? [] : {};
      o = o[path[i]];
    }
    o[path[path.length - 1]] = value;
    persist();
  }
  function loadState(next: any) {
    store.S = reconcile(next);
    fixSel();
    persist();
  }
  function reset() {
    pushUndo();
    store.S = seedBoard(); // COM-160: the baseline IS the real roster
    store.selId = store.S.advisors[0]?.id || "";
    fixSel();
    persist();
    toast.create({
      message: "Reset to baseline",
      type: "info",
      action: { label: "Undo", onClick: restoreUndo },
    });
  }
  function select(id: string) {
    store.selId = id;
  }

  // ---- advisors (ADD_ADV / DEL_ADV) ----
  function addAdvisor() {
    const id = uid("a");
    store.S.advisors.push({
      id,
      name: "New advisor",
      sector: SECTORS[0],
      mode: "tier",
      tier: 0,
      years: 4,
      splitOptions: 0.65,
      annualValue: 75000,
      hasCash: false,
      cashAnnual: 0,
      startDate: todayISO(),
      upliftStartMonth: 6,
      grantRound: "bridge",
      taxResidency: "Other",
      notes: "",
      performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: [] },
    } as any);
    store.selId = id;
    persist();
    flash("Advisor added — edit the package"); // COM-107: feedback after the write
  }
  function delAdvisor(id: string) {
    pushUndo();
    store.S.advisors = store.S.advisors.filter((a) => a.id !== id);
    fixSel();
    persist();
    undoToast("advisor");
  }

  // ---- grants (COM-144/171: ADD/UPDATE/DEL — claim-on-first-edit) ----
  // The first explicit edit CLAIMS the package as explicit rows so value is preserved: derived
  // flags strip (the v6 migration's snapshot rows become real), and the parametric cash fields
  // clear because cash rows now carry them (the fold sums advisor cash AND cash grants —
  // keeping both would double-count; same for the elected cash floor).
  function materialiseGrants(a: any) {
    if (hasExplicitGrants(a)) return;
    // ALWAYS derive FRESH — never claim the load-time snapshot: in-session plan/package edits
    // refresh the live derivation but not the persisted snapshot, and claiming stale rows
    // silently re-prices the package against what is on screen (review finding 2026-06-10).
    const { grants: _snapshot, ...parametric } = a;
    const rows = effectiveGrants(parametric, store.S.plan, store.S.tiers, store.S.objectives);
    a.grants = rows.map((g: any) => {
      const { derived: _derived, ...rest } = g;
      return { ...rest };
    });
    if (a.hasCash) {
      a.hasCash = false;
      a.cashAnnual = 0;
    }
    // The floor election clears ONLY when its cash row was actually claimed (policy enabled —
    // the row exists in the fresh derivation). A dormant election under a disabled policy must
    // survive the claim (review finding: one grant edit destroyed a negotiated floor).
    if (a.cashFloorAnnualUSD && store.S.plan.cashFloor?.enabled) delete a.cashFloorAnnualUSD;
  }
  function addGrant(advisorId: string, instrument: Instrument = "option") {
    const a: any = store.S.advisors.find((x) => x.id === advisorId);
    if (!a) return;
    pushUndo(); // the claim is a package conversion — make it undoable
    materialiseGrants(a);
    // Default to the LATEST round — the Part 5.3 top-up story: later grants price at later
    // valuations; the engine derives the strike from the round.
    const lastRound = store.S.plan.rounds[store.S.plan.rounds.length - 1]?.id || "bridge";
    a.grants.push({
      id: uid("g"),
      instrument,
      round: lastRound,
      ...(instrument === "cash" ? { valueUSD: 0 } : { quantity: 0 }),
      curve: instrument === "rta" ? "rta" : "cert-v3",
      vestStartISO: todayISO(),
      lifecycle: "draft",
    });
    appendAudit("grant", a.name, `Grant added: ${instrument} at ${lastRound} (draft)`);
    persist();
    flash(
      instrument === "cash"
        ? "Cash grant added — set the amount"
        : "Grant added — set the quantity",
    );
  }
  function updateGrant(advisorId: string, grantId: string, patch: Record<string, any>) {
    const a: any = store.S.advisors.find((x) => x.id === advisorId);
    if (!a) return;
    materialiseGrants(a);
    const g = a.grants.find((x: any) => x.id === grantId);
    if (!g) return;
    Object.assign(g, patch);
    appendAudit("grant", a.name, `Grant ${g.instrument} updated: ${Object.keys(patch).join(", ")}`);
    persist();
  }
  function removeGrant(advisorId: string, grantId: string) {
    const a: any = store.S.advisors.find((x) => x.id === advisorId);
    if (!a) return;
    pushUndo(); // BEFORE the claim — Undo must restore the pre-claim parametric state
    materialiseGrants(a);
    a.grants = a.grants.filter((x: any) => x.id !== grantId);
    appendAudit("grant", a.name, "Grant removed");
    persist();
    undoToast("grant");
  }

  // ---- objectives (ADD_OBJ / DEL_OBJ — DEL scrubs achieved/targeted across ALL advisors) ----
  function addObjective() {
    store.S.objectives.push({
      id: uid("o"),
      category: "capital",
      label: "New objective",
      trigger: "Define the trigger",
      uplift: 0.2,
      gate: store.S.plan.milestones[0]?.id || "bridge",
    });
    persist();
  }
  function delObjective(id: string) {
    pushUndo();
    store.S.objectives = store.S.objectives.filter((o) => o.id !== id);
    store.S.advisors.forEach((a) => {
      const pf = a.performance || ({} as any);
      pf.achieved = (pf.achieved || []).filter((x: string) => x !== id);
      pf.targeted = (pf.targeted || []).filter((x: string) => x !== id);
      a.performance = pf;
    });
    persist();
    undoToast("objective");
  }

  // ---- tiers (ADD_TIER / DEL_TIER — DEL clamps advisor.tier; min 1) ----
  function addTier() {
    store.S.tiers.push({ name: "New tier", mult: store.S.tiers.length + 1, days: 1 });
    persist();
  }
  function delTier(index: number) {
    if (store.S.tiers.length <= 1) return;
    pushUndo();
    store.S.tiers = store.S.tiers.filter((_, i) => i !== index);
    const max = store.S.tiers.length - 1;
    store.S.advisors.forEach((a) => {
      a.tier = Math.min(a.tier || 0, max);
    });
    persist();
    undoToast("tier");
  }

  // ---- milestones (ADD_MS / DEL_MS — DEL reassigns currentStage, capitalUplift.gate, objective gates) ----
  function addMilestone() {
    store.S.plan.milestones.push({ id: uid("m"), label: "New milestone" });
    persist();
  }
  function delMilestone(id: string) {
    if (store.S.plan.milestones.length <= 1) return;
    pushUndo();
    store.S.plan.milestones = store.S.plan.milestones.filter((m) => m.id !== id);
    const first = store.S.plan.milestones[0]?.id || "bridge";
    if (store.S.plan.currentStage === id) store.S.plan.currentStage = first;
    if (store.S.plan.capitalUplift.gate === id) store.S.plan.capitalUplift.gate = first;
    store.S.objectives.forEach((o) => {
      if (o.gate === id) o.gate = first;
    });
    persist();
    undoToast("milestone");
  }

  // ---- rounds (ADD_ROUND seeds scenarios from last round ×1.5; DEL fixes tgeAnchor + advisor grantRound) ----
  function addRound() {
    const id = uid("r");
    const rounds = store.S.plan.rounds;
    const lastId = rounds.length ? rounds[rounds.length - 1].id : null;
    rounds.push({ id, label: "New round" });
    Object.keys(store.S.plan.scenarios).forEach((k) => {
      const prev = lastId ? store.S.plan.scenarios[k][lastId] : null;
      store.S.plan.scenarios[k][id] = prev
        ? { post: prev.post * 1.5, raise: prev.raise, esop: prev.esop }
        : { post: 100e6, raise: 20e6, esop: 0.15 };
    });
    persist();
  }
  function delRound(id: string) {
    if (store.S.plan.rounds.length <= 1) return;
    pushUndo();
    store.S.plan.rounds = store.S.plan.rounds.filter((r) => r.id !== id);
    Object.keys(store.S.plan.scenarios).forEach((k) => {
      delete store.S.plan.scenarios[k][id];
    });
    if (store.S.plan.tgeAnchor === id)
      store.S.plan.tgeAnchor = store.S.plan.rounds[0]?.id || "bridge";
    store.S.advisors.forEach((a) => {
      if (a.grantRound === id) a.grantRound = "bridge";
    });
    persist();
    undoToast("round");
  }

  // ---- scenarios (ADD_SCENARIO clones base; DEL fixes baseScenario; min 1) ----
  function addScenario() {
    const key = uid("scn");
    const src =
      store.S.plan.scenarios[baseScenKey(store.S.plan)] || Object.values(store.S.plan.scenarios)[0];
    store.S.plan.scenarios[key] = {
      ...(src ? clone(src) : ({ tgeMult: 1 } as any)),
      label: "New scenario",
    } as Scenario;
    persist();
  }
  function delScenario(key: string) {
    if (Object.keys(store.S.plan.scenarios).length <= 1) return;
    pushUndo();
    delete store.S.plan.scenarios[key];
    if (store.S.plan.baseScenario === key)
      store.S.plan.baseScenario = Object.keys(store.S.plan.scenarios)[0];
    // COM-82 cascade parity with delMilestone/delRound: a deleted case must not leave a
    // dangling per-advisor override (reconcile also drops orphans on import/paste).
    store.S.advisors.forEach((a) => {
      if (a.caseOverride === key) delete a.caseOverride;
    });
    persist();
    undoToast("scenario");
  }

  // ---- scenario sets (COM-147: save/duplicate/annotate/star/archive over COM-143's model) ----
  function saveSetAs(label: string) {
    const name = (label || "").trim() || `Set ${(store.S.plan.scenarioSets?.length || 0) + 1}`;
    const set = makeScenarioSet(uid("set"), name, store.S.plan);
    store.S.plan.scenarioSets = [...(store.S.plan.scenarioSets || []), set];
    persist();
    flash(`Saved "${name}"`);
  }
  function duplicateSet(id: string) {
    const sets = store.S.plan.scenarioSets || [];
    const src = sets.find((s) => s.id === id);
    if (!src) return;
    const copy = clone(src);
    copy.id = uid("set");
    copy.label = `${src.label} (copy)`;
    copy.starred = false;
    store.S.plan.scenarioSets = [...sets, copy];
    persist();
    flash(`Duplicated "${src.label}"`);
  }
  function updateSet(id: string, patch: Record<string, any>) {
    const s = (store.S.plan.scenarioSets || []).find((x) => x.id === id);
    if (!s) return;
    // starring is exclusive — one base set (the COM-143 model's "one starred base per set" list)
    if (patch.starred === true)
      (store.S.plan.scenarioSets || []).forEach((x) => {
        x.starred = false;
      });
    Object.assign(s, patch);
    persist();
  }
  function deleteSet(id: string) {
    pushUndo();
    store.S.plan.scenarioSets = (store.S.plan.scenarioSets || []).filter((s) => s.id !== id);
    persist();
    undoToast("scenario set");
  }
  // COM-148: the global set switcher — make a saved set the ACTIVE scenarios (planWithSet
  // deep-copies, so later edits never rewrite the saved bundle). Undo restores the working map.
  function activateSet(id: string) {
    const s = (store.S.plan.scenarioSets || []).find((x) => x.id === id);
    if (!s) return;
    pushUndo();
    const next = planWithSet(store.S.plan, id);
    store.S.plan.scenarios = next.scenarios;
    store.S.plan.baseScenario = next.baseScenario;
    // a swapped map may drop scenarios that advisor overrides referenced — same cascade as delScenario
    store.S.advisors.forEach((a) => {
      if (a.caseOverride && !store.S.plan.scenarios[a.caseOverride]) delete a.caseOverride;
    });
    persist();
    toast.create({
      message: `Switched to "${s.label}"`,
      type: "info",
      action: { label: "Undo", onClick: restoreUndo },
    });
  }
  // COM-159: the offer pipeline — advance an advisor's stage; every transition appends to the
  // history (date + optional note) so the process is auditable end-to-end.
  function setStage(advisorId: string, stage: string, note?: string) {
    const a: any = store.S.advisors.find((x) => x.id === advisorId);
    if (!a) return;
    a.stage = stage;
    a.stageHistory = [
      ...(Array.isArray(a.stageHistory) ? a.stageHistory : []),
      { stage, atISO: todayISO(), ...(note ? { note } : {}) },
    ];
    appendAudit("stage", a.name, `Pipeline → ${stage}${note ? ` (${note})` : ""}`);
    persist();
    flash(`Stage → ${stage}`);
  }

  // COM-162 (F17): mark a round CLOSED — comp and fundraising move together. Re-pricing comes
  // free (currentRoundStep follows plan.currentStage, advanced here when a milestone shares the
  // round's id); gated capital uplifts crystallise via the engine; Series A additionally
  // schedules the STRUCTURAL review for every advisor (Δ2 — "trainer wheels off").
  function closeRound(roundId: string) {
    const i = store.S.plan.rounds.findIndex((r: any) => r.id === roundId);
    if (i < 0 || (store.S.plan.rounds[i] as any).closedISO) return;
    pushUndo();
    const today = todayISO();
    (store.S.plan.rounds[i] as any).closedISO = today;
    // advance the stage lens so NEW grants price at this round (only forward, never back)
    const msIdx = store.S.plan.milestones.findIndex((m) => m.id === roundId);
    const curIdx = store.S.plan.milestones.findIndex((m) => m.id === store.S.plan.currentStage);
    if (msIdx >= 0 && msIdx > curIdx) store.S.plan.currentStage = roundId;
    const { advisors, flipped } = crystalliseIntroductions(store.S.advisors, roundId);
    store.S.advisors = advisors;
    if (roundId === "seriesA") {
      // the structural review: board formalisation + a full package review for EVERY advisor
      store.S.advisors.forEach((a: any) => {
        a.reviews = [
          ...(Array.isArray(a.reviews) ? a.reviews : []),
          {
            id: uid("rv"),
            scheduledISO: today,
            trigger: "event",
            eventNote: "Series A close — structural review (board formalises)",
          },
        ];
      });
    }
    const label = store.S.plan.rounds[i].label;
    appendAudit(
      "round",
      label,
      `Round closed ${today}: ${flipped} capital uplift${flipped === 1 ? "" : "s"} crystallised; new grants price here${roundId === "seriesA" ? "; structural reviews scheduled for every advisor" : ""}`,
    );
    persist();
    toast.create({
      message: `${label} closed — ${flipped ? `${flipped} capital uplift${flipped === 1 ? "" : "s"} crystallised; ` : ""}new grants price here${roundId === "seriesA" ? "; structural reviews scheduled" : ""}`,
      type: "info",
      action: { label: "Undo", onClick: restoreUndo },
    });
  }

  // COM-165 (B.3): record a 9-step grant-decision artefact — "defend it in a board conversation".
  function recordDecision(data: {
    subject: string;
    advisorId?: string;
    answers: string[];
    decidedBy?: string;
  }) {
    const subject = (data.subject || "").trim();
    if (!subject) {
      flash("A decision needs a subject — what grant is this about?");
      return false;
    }
    store.S.decisions = [
      ...(Array.isArray(store.S.decisions) ? store.S.decisions : []),
      {
        id: uid("gd"),
        atISO: todayISO(),
        subject,
        ...(data.advisorId ? { advisorId: data.advisorId } : {}),
        answers: data.answers,
        ...(data.decidedBy ? { decidedBy: data.decidedBy } : {}),
      },
    ];
    appendAudit(
      "decision",
      subject,
      `Grant decision recorded${data.decidedBy ? ` by ${data.decidedBy}` : ""} (${data.answers.filter((x) => x).length}/9 steps answered)`,
    );
    persist();
    flash(`Decision recorded · ${subject}`);
    return true;
  }
  function removeDecision(id: string) {
    if (!Array.isArray(store.S.decisions)) return;
    pushUndo();
    store.S.decisions = store.S.decisions.filter((d) => d.id !== id);
    persist();
    undoToast("decision artefact");
  }

  // COM-164 (Δ12): snapshot the live package as the next proposition version — the straw-man
  // artefact as sent via Iraj. The engine freezes the figures; the store owns the numbering.
  // Snapshotting a proposition usually means it went out — nudge the pipeline to 'proposed'
  // when it is still sitting in a pre-send stage.
  function snapshotProposition(advisorId: string, note?: string) {
    const a: any = store.S.advisors.find((x) => x.id === advisorId);
    if (!a) return;
    const versions = Array.isArray(a.propositions) ? a.propositions : [];
    const next = versions.length ? Math.max(...versions.map((v: any) => v.version)) + 1 : 1;
    const v = makeProposition(
      a,
      store.S.plan,
      store.S.tiers,
      store.S.objectives,
      uid("pv"),
      next,
      todayISO(),
      note,
    );
    a.propositions = [...versions, v];
    if (!a.stage || a.stage === "modeled") {
      a.stage = "proposed";
      a.stageHistory = [
        ...(Array.isArray(a.stageHistory) ? a.stageHistory : []),
        { stage: "proposed", atISO: todayISO(), note: `Proposition v${next} sent` },
      ];
    }
    appendAudit(
      "proposition",
      a.name,
      `Proposition v${next} saved (base ${"$"}${Math.round(v.figures.baseCaseTotal).toLocaleString("en-US")})`,
    );
    persist();
    flash(`Proposition v${next} saved`);
  }
  function removeProposition(advisorId: string, versionId: string) {
    const a: any = store.S.advisors.find((x) => x.id === advisorId);
    if (!a || !Array.isArray(a.propositions)) return;
    pushUndo();
    a.propositions = a.propositions.filter((v: any) => v.id !== versionId);
    persist();
    undoToast("proposition version");
  }

  // COM-161 (F20): first-class capital introductions — the per-intro pipeline that the Board
  // rollup reads. CONVERTING from the v1 aggregate fields seeds EARNED intro rows from
  // capitalEquity/capitalToken so the computed uplift is preserved to the cent (intros-present
  // overrides the v1 fields in the engine — seeding anything else would move money).
  function addIntroduction(advisorId: string) {
    const a: any = store.S.advisors.find((x) => x.id === advisorId);
    if (!a) return;
    if (!Array.isArray(a.introductions)) {
      const seeds: any[] = [];
      const p: any = a.performance || {};
      if (p.capitalEquity > 0)
        seeds.push({
          id: uid("in"),
          amountUSD: p.capitalEquity,
          round: a.grantRound || "bridge",
          status: "earned",
          note: "Equity round (converted from the aggregate field)",
        });
      if (p.capitalToken > 0)
        seeds.push({
          id: uid("in"),
          amountUSD: p.capitalToken,
          round: a.grantRound || "bridge",
          status: "earned",
          note: "Token OTC (converted from the aggregate field)",
        });
      a.introductions = seeds;
    }
    a.introductions.push({
      id: uid("in"),
      amountUSD: 0,
      round: store.S.plan.rounds[0]?.id || "bridge",
      status: "targeted",
    });
    appendAudit("introduction", a.name, "Capital introduction added (targeted)");
    persist();
  }
  function updateIntroduction(advisorId: string, introId: string, patch: Record<string, any>) {
    const a: any = store.S.advisors.find((x) => x.id === advisorId);
    const it = a && (a.introductions || []).find((x: any) => x.id === introId);
    if (!it) return;
    Object.assign(it, patch);
    appendAudit(
      "introduction",
      a.name,
      `Introduction updated: ${Object.keys(patch).join(", ")}${patch.status ? ` → ${patch.status}` : ""}`,
    );
    persist();
  }
  function removeIntroduction(advisorId: string, introId: string) {
    const a: any = store.S.advisors.find((x) => x.id === advisorId);
    if (!a || !Array.isArray(a.introductions)) return;
    pushUndo();
    a.introductions = a.introductions.filter((x: any) => x.id !== introId);
    persist();
    undoToast("introduction");
  }

  // COM-158 (F16): the review workflow — "start everyone the same; review and top up the
  // keepers", ON THE RECORD. Scheduling creates an open Review; completing one records
  // inputs/outcome/approver and applies the outcome: a top-up appends a NEW grant priced at
  // the THEN-CURRENT round (the COM-144 growth story); a roll-off hands to the F18 pipeline.
  function scheduleReview(
    advisorId: string,
    data: { scheduledISO: string; trigger?: string; eventNote?: string },
  ) {
    const a: any = store.S.advisors.find((x) => x.id === advisorId);
    if (!a || !data.scheduledISO) return;
    a.reviews = [
      ...(Array.isArray(a.reviews) ? a.reviews : []),
      {
        id: uid("rv"),
        scheduledISO: data.scheduledISO,
        trigger: data.trigger === "event" ? "event" : "scheduled",
        ...(data.eventNote ? { eventNote: data.eventNote } : {}),
      },
    ];
    appendAudit(
      "review",
      a.name,
      `Review scheduled ${data.scheduledISO} (${data.trigger === "event" ? data.eventNote || "round event" : "calendar"})`,
    );
    persist();
    flash(`Review scheduled · ${data.scheduledISO}`);
  }
  function completeReview(
    advisorId: string,
    reviewId: string,
    data: {
      inputs?: string;
      outcome: string;
      approver: string;
      note?: string;
      topUpQuantity?: number;
      topUpValueUSD?: number;
    },
  ) {
    const a: any = store.S.advisors.find((x) => x.id === advisorId);
    const r = a && (a.reviews || []).find((x: any) => x.id === reviewId && !x.completedISO);
    if (!a || !r) return false;
    // B.1 #5: no one decides their own comp — the approver must be a named OTHER person.
    const approver = (data.approver || "").trim();
    if (!approver || approver.toLowerCase() === (a.name || "").trim().toLowerCase()) {
      flash("Approver required — no one signs off their own comp (B.1 #5)");
      return false;
    }
    pushUndo();
    r.outcome = data.outcome;
    r.approver = approver;
    r.completedISO = todayISO();
    if (data.inputs) r.inputs = data.inputs;
    if (data.note) r.note = data.note;
    if (data.outcome === "top-up" && (data.topUpQuantity || data.topUpValueUSD)) {
      materialiseGrants(a);
      // the then-current round prices the strike — exactly how packages grow with fundraising
      const w = walkScenario(store.S.plan, baseScenKey(store.S.plan));
      const round = currentRoundStep(store.S.plan, w).id || "bridge";
      a.grants.push({
        id: uid("g"),
        instrument: "option",
        round,
        ...(data.topUpValueUSD
          ? { valueUSD: data.topUpValueUSD }
          : { quantity: data.topUpQuantity }),
        curve: "cert-v3",
        vestStartISO: todayISO(),
        lifecycle: "draft",
        docStatus: "in-draft",
      });
    }
    if (data.outcome === "roll-off") {
      a.stage = "rolled-off";
      a.stageHistory = [
        ...(Array.isArray(a.stageHistory) ? a.stageHistory : []),
        { stage: "rolled-off", atISO: todayISO(), note: `Review ${reviewId}: roll-off` },
      ];
    }
    appendAudit(
      "review",
      a.name,
      `Review completed: ${data.outcome}, signed off by ${approver}${data.outcome === "top-up" && (data.topUpValueUSD || data.topUpQuantity) ? ` · top-up ${data.topUpValueUSD ? `$${data.topUpValueUSD}` : `${data.topUpQuantity} options`} at the current round` : ""}`,
    );
    persist();
    undoToast(`review (${data.outcome})`);
    return true;
  }

  // COM-148: same-advisor A/B — fork a candidate package (offer v2) for one person.
  function duplicateAdvisor(id: string) {
    const src: any = store.S.advisors.find((a) => a.id === id);
    if (!src) return;
    const copy = clone(src);
    copy.id = uid("a");
    copy.name = `${src.name} (B)`;
    const at = store.S.advisors.findIndex((a) => a.id === id);
    store.S.advisors.splice(at + 1, 0, copy);
    persist();
    flash(`Forked "${src.name}" as an A/B candidate`);
  }

  // ---- per-advisor projection (PD2 / COM-82): case override + target exit ----
  function setAdvisorCase(id: string, key: string | null) {
    const a = store.S.advisors.find((x) => x.id === id);
    if (!a) return;
    if (key && store.S.plan.scenarios[key]) a.caseOverride = key;
    else delete a.caseOverride;
    persist();
  }
  function setAdvisorTargetExit(id: string, v: number | null) {
    const a = store.S.advisors.find((x) => x.id === id);
    if (!a) return;
    if (v != null && isFinite(v) && v > 0) a.targetExit = v;
    else delete a.targetExit;
    persist();
  }

  // ---- governance checklist (COM-141) — the four user-owned fields; canonical text is seed-only ----
  function setGovItem(
    id: string,
    patch: Partial<Pick<ComplianceItem, "status" | "owner" | "evidence" | "note">>,
  ) {
    const it = store.gov.items.find((i) => i.id === id);
    if (!it) return;
    // panel 008 (R3.18): a STATUS flip is an audited consent/governance event (the gating
    // fact); owner/evidence/note edits are tracking metadata and stay off the trail.
    if (patch.status && patch.status !== it.status) {
      appendAudit("consent", it.ref, `${it.title}: ${it.status} → ${patch.status}`);
    }
    Object.assign(it, patch);
    persist();
  }

  // ---- roadmap CSV (SET_ROADMAP merge) ----
  function setRoadmap(roadmap: any) {
    const r = roadmap || {};
    const p = store.S.plan;
    if (r.bridge) p.bridge = { ...p.bridge, ...r.bridge };
    if (r.esopStart != null) p.esopStart = r.esopStart;
    Object.keys(r.scenarios || {}).forEach((k) => {
      if (!p.scenarios[k]) return;
      const sc = r.scenarios[k];
      Object.keys(sc).forEach((rid) => {
        if (rid === "tgeMult") return;
        if (p.scenarios[k][rid]) p.scenarios[k][rid] = { ...p.scenarios[k][rid], ...sc[rid] };
      });
      if (sc.tgeMult != null) p.scenarios[k].tgeMult = sc.tgeMult;
    });
    persist();
  }
  function importRoadmap(file: File) {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        setRoadmap(parseRoadmapCSV(String(rd.result), store.S.plan));
        flash("Roadmap imported");
      } catch {
        flash("Invalid CSV");
      }
    };
    rd.readAsText(file);
  }
  function downloadRoadmap() {
    flash(
      download("raiku-roadmap.csv", roadmapToCSV(store.S.plan), "text/csv")
        ? "Roadmap downloaded"
        : "Blocked",
    );
  }

  // ---- named multi-board manager (Mgr) ----
  function saveBoard(name?: string) {
    const nm = (name || store.S.name || "Untitled").trim();
    if (nm) store.S.name = nm;
    persist();
    flash(`Saved “${store.S.name}”`);
  }
  function loadBoard(name: string) {
    if (!store.saved[name]) return;
    store.S = reconcile(clone(store.saved[name]));
    store.last = name;
    fixSel();
    persist();
    store.showMgr = false;
    flash(`Loaded “${name}”`);
  }
  function delBoard(name: string) {
    delete store.saved[name];
    if (store.last === name) store.last = Object.keys(store.saved)[0] || "";
    lsSet({ scenarios: store.saved, last: store.last, governance: store.gov, audit: store.audit });
  }
  function toggleMgr(v?: boolean) {
    store.showMgr = v == null ? !store.showMgr : v;
  }

  // ---- share / import / export ----
  function shareUrl() {
    try {
      return location.origin + location.pathname + "#s=" + encodeHash(store.S);
    } catch {
      return "";
    }
  }
  async function copyState() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(store.S));
      flash("State copied — paste to share");
    } catch {
      flash("Clipboard blocked");
    }
  }
  async function pasteState() {
    try {
      const t = await navigator.clipboard.readText();
      const o = JSON.parse(t);
      if (!validImport(o)) {
        flash("Paste failed — clipboard is not a valid board");
        return;
      }
      loadState(o);
      flash(
        `Pasted · ${store.S.advisors.length} advisors, ${Object.keys(store.S.plan.scenarios).length} scenarios`,
      );
    } catch {
      flash("Paste failed — copy a board first, or use Import");
    }
  }
  function exportJSON() {
    flash(
      download(
        `raiku-advisory-${store.S.name.replace(/\s+/g, "-")}.json`,
        JSON.stringify(store.S, null, 2),
        "application/json",
      )
        ? "JSON downloaded"
        : "Blocked",
    );
  }
  function importJSON(file: File) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const o = JSON.parse(String(r.result));
        if (!validImport(o)) {
          flash("Import failed — not a valid board file");
          return;
        }
        loadState(o);
        flash(
          `Imported · ${store.S.advisors.length} advisors, ${Object.keys(store.S.plan.scenarios).length} scenarios`,
        );
      } catch {
        flash("Import failed — invalid JSON");
      }
    };
    r.readAsText(file);
  }

  // Board-summary CSV (roster + company-cost rows) — distinct from the roadmap CSV.
  function exportBoardCSV() {
    const S = store.S;
    const b = board.value;
    const sk = scenKeys(S.plan);
    const rows: any[][] = [
      ["RAIKU ADVISORY BOARD — net of strike", S.name],
      ["Stage", S.plan.milestones.find((m) => m.id === S.plan.currentStage)?.label || ""],
      [],
      [
        "Advisor",
        "Tier",
        "Base eq %",
        "Earned",
        "Pending",
        "Eq % earned",
        "Tk % earned",
        ...sk.map((k) => `Net ${S.plan.scenarios[k].label}`),
        "Cash/yr",
      ],
    ];
    b.rows.forEach(({ a, c }: any) => {
      const g = (k: string) => c.scen.find((x: any) => x.key === k)?.total || 0;
      rows.push([
        a.name,
        S.tiers[a.tier]?.name || a.mode,
        (c.baseEq * 100).toFixed(3) + "%",
        "+" + (c.earnedUplift * 100).toFixed(0) + "%",
        c.pendingUplift > 0 ? "+" + (c.pendingUplift * 100).toFixed(0) + "%" : "0%",
        (c.eqPct * 100).toFixed(3) + "%",
        (c.tkPct * 100).toFixed(3) + "%",
        ...sk.map((k) => Math.round(g(k))),
        c.cash,
      ]);
    });
    rows.push(
      [],
      [
        "Company cost net",
        ...sk.flatMap((k) => [S.plan.scenarios[k].label, Math.round(b.cost[k] || 0)]),
      ],
    );
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    flash(
      download(`raiku-advisory-${S.name.replace(/\s+/g, "-")}.csv`, csv, "text/csv")
        ? "CSV downloaded"
        : "Blocked",
    );
  }

  return {
    store,
    state: store,
    board,
    selected,
    flash,
    setPath,
    loadState,
    reset,
    select,
    addAdvisor,
    delAdvisor,
    addGrant,
    updateGrant,
    removeGrant,
    addObjective,
    delObjective,
    addTier,
    delTier,
    addMilestone,
    delMilestone,
    addRound,
    delRound,
    addScenario,
    delScenario,
    saveSetAs,
    duplicateSet,
    updateSet,
    deleteSet,
    activateSet,
    duplicateAdvisor,
    setStage,
    scheduleReview,
    completeReview,
    closeRound,
    addIntroduction,
    updateIntroduction,
    removeIntroduction,
    snapshotProposition,
    removeProposition,
    recordDecision,
    removeDecision,
    setAdvisorCase,
    setAdvisorTargetExit,
    setGovItem,
    setRoadmap,
    importRoadmap,
    downloadRoadmap,
    saveBoard,
    loadBoard,
    delBoard,
    toggleMgr,
    shareUrl,
    copyState,
    pasteState,
    exportJSON,
    importJSON,
    exportBoardCSV,
  };
}
