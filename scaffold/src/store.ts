// Reactive client-side store wrapping the pure engine. localStorage + URL share.
// Claude Code: extend the mutations to mirror every reducer action in
// reference/advisor-comp-studio.tsx (ADD_ROUND/DEL_ROUND/ADD_SCENARIO/DEL_SCENARIO/
// ADD_TIER/DEL_TIER/ADD_MS/DEL_MS/ADD_ADV/DEL_ADV/ADD_OBJ/DEL_OBJ/SET_ROADMAP).
import { reactive, computed } from 'vue';
import { DEFAULT, reconcile, computeBoard, computeAdvisor, type State } from './engine';

const KEY = 'raiku-advisor-comp-v5';

function bootstrap(): State {
  try { const v = localStorage.getItem(KEY); if (v) return reconcile(JSON.parse(v)); } catch { /* ignore */ }
  try { const m = location.hash.match(/s=([^&]+)/); if (m) return reconcile(JSON.parse(decodeURIComponent(escape(atob(m[1]))))); } catch { /* ignore */ }
  return DEFAULT();
}

const state = reactive<{ S: State; selId: string }>({ S: bootstrap(), selId: '' });
if (!state.selId && state.S.advisors[0]) state.selId = state.S.advisors[0].id;

function persist() { try { localStorage.setItem(KEY, JSON.stringify(state.S)); } catch { /* ignore */ } }

export function useStudio() {
  const board = computed(() => computeBoard(state.S.advisors, state.S.plan, state.S.tiers, state.S.objectives));
  const selected = computed(() => {
    const a = state.S.advisors.find(x => x.id === state.selId) || state.S.advisors[0];
    return a ? { a, c: computeAdvisor(a, state.S.plan, state.S.tiers, state.S.objectives) } : null;
  });

  function setPath(path: (string | number)[], value: any) {
    let o: any = state.S;
    for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
    o[path[path.length - 1]] = value; persist();
  }
  function loadState(next: any) {
    state.S = reconcile(next);
    if (!state.S.advisors.find(a => a.id === state.selId)) state.selId = state.S.advisors[0]?.id || '';
    persist();
  }
  function reset() { state.S = DEFAULT(); state.selId = state.S.advisors[0]?.id || ''; persist(); }
  function select(id: string) { state.selId = id; }
  function addAdvisor() {
    const id = 'a' + Date.now();
    state.S.advisors.push({ id, name: 'New advisor', sector: 'Infrastructure', mode: 'tier', tier: 0, years: 4, splitOptions: 0.65, annualValue: 75000, hasCash: false, cashAnnual: 0, startDate: new Date().toISOString().slice(0, 10), upliftStartMonth: 6, grantRound: 'bridge', taxResidency: 'Other', notes: '', performance: { capitalEquity: 0, capitalToken: 0, achieved: [], targeted: [] } } as any);
    state.selId = id; persist();
  }
  function delAdvisor(id: string) { state.S.advisors = state.S.advisors.filter(a => a.id !== id); persist(); }
  function shareUrl() { try { return location.origin + location.pathname + '#s=' + btoa(unescape(encodeURIComponent(JSON.stringify(state.S)))); } catch { return ''; } }

  return { state, board, selected, setPath, loadState, reset, select, addAdvisor, delAdvisor, persist, shareUrl };
}
