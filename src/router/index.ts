import { createRouter, createWebHistory } from 'vue-router'
import ParserView from '../views/ParserView.vue'
import SavedView from '../views/SavedView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'parser', component: ParserView },
    { path: '/saved', name: 'saved', component: SavedView },
  ],
})
