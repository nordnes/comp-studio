import { createRouter, createWebHistory } from 'vue-router';
import Overview from './views/Overview.vue';
import Configure from './views/Configure.vue';
import Board from './views/Board.vue';
import Stub from './views/Stub.vue';

const routes = [
  { path: '/', redirect: '/overview' },
  { path: '/overview', component: Overview, meta: { title: 'Overview' } },
  { path: '/advisors', component: Stub, meta: { title: 'Advisors' } },
  { path: '/board', component: Board, meta: { title: 'Board' } },
  { path: '/compare', component: Stub, meta: { title: 'Compare' } },
  { path: '/proposition', component: Stub, meta: { title: 'Proposition' } },
  { path: '/configure', component: Configure, meta: { title: 'Configure' } },
];

export default createRouter({ history: createWebHistory(), routes });
