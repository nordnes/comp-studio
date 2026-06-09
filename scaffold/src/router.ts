import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import type { Component } from "vue";
import Overview from "./views/Overview.vue";
import Advisors from "./views/Advisors.vue";
import Configure from "./views/Configure.vue";
import Board from "./views/Board.vue";
import Compare from "./views/Compare.vue";
import Proposition from "./views/Proposition.vue";
import { NAV } from "./nav";

// COM-93: route order + titles come from the shared nav model; only the component map lives here.
const views: Record<string, Component> = {
  "/overview": Overview,
  "/board": Board,
  "/compare": Compare,
  "/advisors": Advisors,
  "/proposition": Proposition,
  "/configure": Configure,
};

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/overview" },
  ...NAV.map((n) => ({ path: n.to, component: views[n.to], meta: { title: n.label } })),
];

export default createRouter({ history: createWebHistory(), routes });
