import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/breath', component: () => import('../views/BreathView.vue') },
    { path: '/timer', component: () => import('../views/TimerView.vue') },
    { path: '/journal', component: () => import('../views/JournalView.vue') },
    {
      path: '/countdown',
      component: () => import('../views/CountdownView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  },
});

export default router;
