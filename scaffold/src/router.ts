import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { NAV } from "./nav";

// COM-93: route order + titles come from the shared nav model; only the component map lives here.
// R6.1 (rubric): route-level code-splitting — each view loads as its own chunk so the total
// JS payload stays inside the budget (≤1.0 MB minified / ≤290 kB gzip); the heavy views
// (charts included) download only when their route is visited. Dynamic import() is the
// structural fix the rubric names — never tree-shake nudges.
const views: Record<string, () => Promise<unknown>> = {
  "/overview": () => import("./views/Overview.vue"),
  "/board": () => import("./views/Board.vue"),
  "/compare": () => import("./views/Compare.vue"),
  "/governance": () => import("./views/Governance.vue"),
  "/advisors": () => import("./views/Advisors.vue"),
  "/proposition": () => import("./views/Proposition.vue"),
  "/configure": () => import("./views/Configure.vue"),
};

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/overview" },
  ...NAV.map((n) => ({
    // UXS-N (UXP 1.1): the per-advisor routes take an optional :id — opening Iraj is a URL now
    // (refresh/share keeps the selection; App.vue syncs the param <-> store.selId both ways).
    path: n.to === "/advisors" || n.to === "/proposition" ? `${n.to}/:id?` : n.to,
    component: views[n.to],
    meta: { title: n.label },
  })),
];

export default createRouter({
  history: createWebHistory(),
  routes,
  // UXS-N (UXP 1.3): navigating used to KEEP the scroll position — Advisors → Board landed
  // mid-page in the guardrails. Back/forward keeps the saved position; everything else tops.
  scrollBehavior(_to, _from, saved) {
    return saved || { top: 0 };
  },
});
