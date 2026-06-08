import { createRouter, createWebHistory } from 'vue-router';
import Overview from './views/Overview.vue';
import Stub from './views/Stub.vue';

const routes = [
  { path: '/', redirect: '/overview' },
  { path: '/overview', component: Overview, meta: { title: 'Overview' } },
  { path: '/advisors', component: Stub, meta: { title: 'Advisors' } },
  { path: '/board', component: Stub, meta: { title: 'Board' } },
  { path: '/compare', component: Stub, meta: { title: 'Compare' } },
  { path: '/proposition', component: Stub, meta: { title: 'Proposition' } },
  { path: '/configure', component: Stub, meta: { title: 'Configure' } },
];

export default createRouter({ history: createWebHistory(), routes });
