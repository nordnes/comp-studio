import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Overview from './views/Overview.vue';
import Advisors from './views/Advisors.vue';
import Configure from './views/Configure.vue';
import Board from './views/Board.vue';
import Compare from './views/Compare.vue';
import Proposition from './views/Proposition.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/overview' },
  { path: '/overview', component: Overview, meta: { title: 'Overview' } },
  { path: '/advisors', component: Advisors, meta: { title: 'Advisors' } },
  { path: '/board', component: Board, meta: { title: 'Board' } },
  { path: '/compare', component: Compare, meta: { title: 'Compare' } },
  { path: '/proposition', component: Proposition, meta: { title: 'Proposition' } },
  { path: '/configure', component: Configure, meta: { title: 'Configure' } },
];

export default createRouter({ history: createWebHistory(), routes });
