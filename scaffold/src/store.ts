// Reactive client-side store wrapping the FROZEN pure engine. No frappe-ui data layer
// (createResource/useList/call/initSocket are out of scope). Mirrors every reducer action in
// reference/advisor-comp-studio.tsx — incl. the delete CASCADES — plus named multi-board
// persistence ({scenarios,last} map, reference parity), clipboard Copy/Paste, #s= URL hash,
// and JSON / board-CSV / roadmap-CSV IO. The engine is the only place money is computed.
import { reactive, computed } from 'vue';
import {
  DEFAULT, reconcile, computeBoard, computeAdvisor,
  scenKeys, baseScenKey, roadmapToCSV, parseRoadmapCSV, todayISO,
  fUSD, fPct, SECTORS, type State, type Scenario,
} from './engine';

const KEY = 'raiku-advisor-comp-v5';
type SavedMap = Record<string, State>;

// ---- low-level storage (localStorage; the artifact's window.storage backend is dropped) ----
const lsGet = (): any => { try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null; } catch { return null; } };
const lsSet = (o: any): boolean => { try { localStorage.setItem(KEY, JSON.stringify(o)); return true; } catch { return false; } };
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
const uid = (p: string) => p + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);

// base64 URL-hash payload (raw State) — unicode-safe, mirrors the scaffold's btoa/atob dance.
const decodeHash = (h: string): any => { try { return JSON.parse(decodeURIComponent(escape(atob(h)))); } catch { return null; } };
const encodeHash = (s: any): string => { try { return btoa(unescape(encodeURIComponent(JSON.stringify(s)))); } catch { return ''; } };

interface Store { S: State; selId: string; saved: SavedMap; last: string; status: string; showMgr: boolean; storageOk: boolean; }

function bootstrap(): Store {
  let S: State | null = null;
  const saved: SavedMap = {};
  let last = '';
  let storageOk = true;
  try { storageOk = typeof localStorage !== 'undefined' && !!localStorage; } catch { storageOk = false; }

  const persisted = lsGet();
  if (persisted && typeof persisted === 'object') {
    if (persisted.scenarios && !persisted.plan) {
      // Named-board map shape (reference parity): { scenarios: {name: State}, last: name }.
      Object.keys(persisted.scenarios).forEach(n => { saved[n] = persisted.scenarios[n]; });
      last = persisted.last && saved[persisted.last] ? persisted.last : (Object.keys(saved)[0] || '');
      if (last && saved[last]) S = reconcile(saved[last]);
    } else if (persisted.plan || persisted.advisors) {
      // Legacy raw State (old scaffold) under the same key → migrate into the map so reconcile is safe.
      S = reconcile(persisted);
      last = S.name || 'Imported board';
      saved[last] = S;
    }
  }
  // A #s= URL hash (raw State) is a one-off shared link — load it over whatever was persisted.
  try { const m = location.hash.match(/s=([^&]+)/); if (m) { const h = decodeHash(m[1]); if (h) S = reconcile(h); } } catch { /* ignore */ }

  if (!S) S = DEFAULT();
  if (!last) last = S.name;
  if (!saved[last]) saved[last] = S;
  return { S, selId: S.advisors[0]?.id || '', saved, last, status: '', showMgr: false, storageOk };
}

const store = reactive<Store>(bootstrap());

let flashTimer: ReturnType<typeof setTimeout> | null = null;
function flash(m: string) { store.status = m; if (flashTimer) clearTimeout(flashTimer); flashTimer = setTimeout(() => { store.status = ''; }, 2800); }

// The working board auto-saves into saved[S.name] (deviation from the reference's explicit-Save model —
// safer for a live tool). Mgr "Save as" forks a named snapshot.
function persist() {
  store.saved[store.S.name] = store.S;
  store.last = store.S.name;
  if (!lsSet({ scenarios: store.saved, last: store.last })) store.storageOk = false;
}
function fixSel() { if (!store.S.advisors.find(a => a.id === store.selId)) store.selId = store.S.advisors[0]?.id || ''; }

function download(name: string, text: string, mime: string): boolean {
  try { const b = new Blob([text], { type: mime }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u); return true; } catch { return false; }
}

// Shared singletons — created once so computeBoard/computeAdvisor don't re-run per component instance.
const board = computed(() => computeBoard(store.S.advisors, store.S.plan, store.S.tiers, store.S.objectives));
const selected = computed(() => {
  const a = store.S.advisors.find(x => x.id === store.selId) || store.S.advisors[0];
  return a ? { a, c: computeAdvisor(a, store.S.plan, store.S.tiers, store.S.objectives) } : null;
});

export function useStudio() {
  // ---- core mutations (SET / LOAD / select / reset) ----
  function setPath(path: (string | number)[], value: any) {
    let o: any = store.S;
    for (let i = 0; i < path.length - 1; i++) { if (o[path[i]] == null) o[path[i]] = typeof path[i + 1] === 'number' ? [] : {}; o = o[path[i]]; }
    o[path[path.length - 1]] = value; persist();
  }
  function loadState(next: any) { store.S = reconcile(next); fixSel(); persist(); }
  function reset() { store.S = DEFAULT(); store.selId = store.S.advisors[0]?.id || ''; persist(); flash('Reset to baseline'); }
  function select(id: string) { store.selId = id; }

  // ---- advisors (ADD_ADV / DEL_ADV) ----
  function addAdvisor() {
    const id = uid('a');
    store.S.advisors.push({ id, name: 'New advisor', sector: SECTORS[0], mode: 'tier', tier: 0, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: todayISO(), upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'Other', notes: '', performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: [] } } as any);
    store.selId = id; persist();
  }
  function delAdvisor(id: string) { store.S.advisors = store.S.advisors.filter(a => a.id !== id); fixSel(); persist(); }

  // ---- objectives (ADD_OBJ / DEL_OBJ — DEL scrubs achieved/targeted across ALL advisors) ----
  function addObjective() {
    store.S.objectives.push({ id: uid('o'), category: 'capital', label: 'New objective', trigger: 'Define the trigger', uplift: 0.2, gate: store.S.plan.milestones[0]?.id || 'bridge' });
    persist();
  }
  function delObjective(id: string) {
    store.S.objectives = store.S.objectives.filter(o => o.id !== id);
    store.S.advisors.forEach(a => { const pf = a.performance || ({} as any); pf.achieved = (pf.achieved || []).filter((x: string) => x !== id); pf.targeted = (pf.targeted || []).filter((x: string) => x !== id); a.performance = pf; });
    persist();
  }

  // ---- tiers (ADD_TIER / DEL_TIER — DEL clamps advisor.tier; min 1) ----
  function addTier() { store.S.tiers.push({ name: 'New tier', mult: store.S.tiers.length + 1, days: 1 }); persist(); }
  function delTier(index: number) {
    if (store.S.tiers.length <= 1) return;
    store.S.tiers = store.S.tiers.filter((_, i) => i !== index);
    const max = store.S.tiers.length - 1;
    store.S.advisors.forEach(a => { a.tier = Math.min(a.tier || 0, max); });
    persist();
  }

  // ---- milestones (ADD_MS / DEL_MS — DEL reassigns currentStage, capitalUplift.gate, objective gates) ----
  function addMilestone() { store.S.plan.milestones.push({ id: uid('m'), label: 'New milestone' }); persist(); }
  function delMilestone(id: string) {
    if (store.S.plan.milestones.length <= 1) return;
    store.S.plan.milestones = store.S.plan.milestones.filter(m => m.id !== id);
    const first = store.S.plan.milestones[0]?.id || 'bridge';
    if (store.S.plan.currentStage === id) store.S.plan.currentStage = first;
    if (store.S.plan.capitalUplift.gate === id) store.S.plan.capitalUplift.gate = first;
    store.S.objectives.forEach(o => { if (o.gate === id) o.gate = first; });
    persist();
  }

  // ---- rounds (ADD_ROUND seeds scenarios from last round ×1.5; DEL fixes tgeAnchor + advisor grantRound) ----
  function addRound() {
    const id = uid('r'); const rounds = store.S.plan.rounds;
    const lastId = rounds.length ? rounds[rounds.length - 1].id : null;
    rounds.push({ id, label: 'New round' });
    Object.keys(store.S.plan.scenarios).forEach(k => { const prev = lastId ? store.S.plan.scenarios[k][lastId] : null; store.S.plan.scenarios[k][id] = prev ? { post: prev.post * 1.5, raise: prev.raise, esop: prev.esop } : { post: 100e6, raise: 20e6, esop: 0.15 }; });
    persist();
  }
  function delRound(id: string) {
    if (store.S.plan.rounds.length <= 1) return;
    store.S.plan.rounds = store.S.plan.rounds.filter(r => r.id !== id);
    Object.keys(store.S.plan.scenarios).forEach(k => { delete store.S.plan.scenarios[k][id]; });
    if (store.S.plan.tgeAnchor === id) store.S.plan.tgeAnchor = store.S.plan.rounds[0]?.id || 'bridge';
    store.S.advisors.forEach(a => { if (a.grantRound === id) a.grantRound = 'bridge'; });
    persist();
  }

  // ---- scenarios (ADD_SCENARIO clones base; DEL fixes baseScenario; min 1) ----
  function addScenario() {
    const key = uid('scn');
    const src = store.S.plan.scenarios[baseScenKey(store.S.plan)] || Object.values(store.S.plan.scenarios)[0];
    store.S.plan.scenarios[key] = { ...(src ? clone(src) : ({ tgeMult: 1 } as any)), label: 'New scenario' } as Scenario;
    persist();
  }
  function delScenario(key: string) {
    if (Object.keys(store.S.plan.scenarios).length <= 1) return;
    delete store.S.plan.scenarios[key];
    if (store.S.plan.baseScenario === key) store.S.plan.baseScenario = Object.keys(store.S.plan.scenarios)[0];
    persist();
  }

  // ---- roadmap CSV (SET_ROADMAP merge) ----
  function setRoadmap(roadmap: any) {
    const r = roadmap || {}; const p = store.S.plan;
    if (r.bridge) p.bridge = { ...p.bridge, ...r.bridge };
    if (r.esopStart != null) p.esopStart = r.esopStart;
    Object.keys(r.scenarios || {}).forEach(k => {
      if (!p.scenarios[k]) return; const sc = r.scenarios[k];
      Object.keys(sc).forEach(rid => { if (rid === 'tgeMult') return; if (p.scenarios[k][rid]) p.scenarios[k][rid] = { ...p.scenarios[k][rid], ...sc[rid] }; });
      if (sc.tgeMult != null) p.scenarios[k].tgeMult = sc.tgeMult;
    });
    persist();
  }
  function importRoadmap(file: File) { const rd = new FileReader(); rd.onload = () => { try { setRoadmap(parseRoadmapCSV(String(rd.result), store.S.plan)); flash('Roadmap imported'); } catch { flash('Invalid CSV'); } }; rd.readAsText(file); }
  function downloadRoadmap() { flash(download('raiku-roadmap.csv', roadmapToCSV(store.S.plan), 'text/csv') ? 'Roadmap downloaded' : 'Blocked'); }

  // ---- named multi-board manager (Mgr) ----
  function saveBoard(name?: string) { const nm = (name || store.S.name || 'Untitled').trim(); if (nm) store.S.name = nm; persist(); flash(`Saved “${store.S.name}”`); }
  function loadBoard(name: string) { if (!store.saved[name]) return; store.S = reconcile(clone(store.saved[name])); store.last = name; fixSel(); persist(); store.showMgr = false; flash(`Loaded “${name}”`); }
  function delBoard(name: string) { delete store.saved[name]; if (store.last === name) store.last = Object.keys(store.saved)[0] || ''; lsSet({ scenarios: store.saved, last: store.last }); }
  function toggleMgr(v?: boolean) { store.showMgr = v == null ? !store.showMgr : v; }

  // ---- share / import / export ----
  function shareUrl() { try { return location.origin + location.pathname + '#s=' + encodeHash(store.S); } catch { return ''; } }
  async function copyState() { try { await navigator.clipboard.writeText(JSON.stringify(store.S)); flash('State copied — paste to share'); } catch { flash('Clipboard blocked'); } }
  async function pasteState() { try { const t = await navigator.clipboard.readText(); loadState(JSON.parse(t)); flash('Loaded from clipboard'); } catch { flash('Paste failed — use Import'); } }
  function exportJSON() { flash(download(`raiku-advisory-${store.S.name.replace(/\s+/g, '-')}.json`, JSON.stringify(store.S, null, 2), 'application/json') ? 'JSON downloaded' : 'Blocked'); }
  function importJSON(file: File) { const r = new FileReader(); r.onload = () => { try { loadState(JSON.parse(String(r.result))); flash('Imported'); } catch { flash('Invalid JSON'); } }; r.readAsText(file); }

  // Board-summary CSV (roster + company-cost rows) — distinct from the roadmap CSV.
  function exportBoardCSV() {
    const S = store.S; const b = board.value; const sk = scenKeys(S.plan);
    const rows: any[][] = [
      ['RAIKU ADVISORY BOARD — net of strike', S.name],
      ['Stage', S.plan.milestones.find(m => m.id === S.plan.currentStage)?.label || ''], [],
      ['Advisor', 'Tier', 'Base eq %', 'Earned', 'Pending', 'Eq % earned', 'Tk % earned', ...sk.map(k => `Net ${S.plan.scenarios[k].label}`), 'Cash/yr'],
    ];
    b.rows.forEach(({ a, c }: any) => { const g = (k: string) => c.scen.find((x: any) => x.key === k)?.total || 0; rows.push([a.name, S.tiers[a.tier]?.name || a.mode, (c.baseEq * 100).toFixed(3) + '%', '+' + (c.earnedUplift * 100).toFixed(0) + '%', c.pendingUplift > 0 ? '+' + (c.pendingUplift * 100).toFixed(0) + '%' : '0%', (c.eqPct * 100).toFixed(3) + '%', (c.tkPct * 100).toFixed(3) + '%', ...sk.map(k => Math.round(g(k))), c.cash]); });
    rows.push([], ['Company cost net', ...sk.flatMap(k => [S.plan.scenarios[k].label, Math.round(b.cost[k] || 0)])]);
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    flash(download(`raiku-advisory-${S.name.replace(/\s+/g, '-')}.csv`, csv, 'text/csv') ? 'CSV downloaded' : 'Blocked');
  }

  return {
    store, state: store, board, selected, flash,
    setPath, loadState, reset, select,
    addAdvisor, delAdvisor, addObjective, delObjective, addTier, delTier,
    addMilestone, delMilestone, addRound, delRound, addScenario, delScenario,
    setRoadmap, importRoadmap, downloadRoadmap,
    saveBoard, loadBoard, delBoard, toggleMgr,
    shareUrl, copyState, pasteState, exportJSON, importJSON, exportBoardCSV,
  };
}
