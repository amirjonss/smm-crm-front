import { useAuthStore } from 'stores/auth.js'
import { useUserStore } from 'stores/user.js'

function isAuthorised() {
  if (!useAuthStore().isAuthorized) {
    return { path: '/login' }
  }
}
function isAdmin() {
  if(!useUserStore().isAdmin) {
    return { path: '/login' }
  }
}
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/main/IndexPage.vue') }],
    beforeEnter: [isAuthorised],
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [{ path: '', component: () => import('pages/dashboard/DashboardPage.vue') }],
    beforeEnter: [isAuthorised, isAdmin],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
