import { useAuthStore } from 'stores/auth.js'

function isAuthorised() {
  if (!useAuthStore().isAuthorized) {
    return { path: '/login' }
  }
}

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
    beforeEnter: [isAuthorised],
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
