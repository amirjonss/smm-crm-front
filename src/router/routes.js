import { useAuthStore } from 'stores/auth.js'
import { useUserStore } from 'stores/user.js'

function isAuthorised() {
  if (!useAuthStore().isAuthorized) {
    return { path: '/login' }
  }
}
async function isAdmin() {
  const user = useUserStore()
  if (!user.loaded) {
    try {
      await user.fetchUser({})
    } catch {
      return { path: '/login' }
    }
  }
  if (!user.isAdmin) {
    return { path: '/login' }
  }
}
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/main/IndexPage.vue') },
      { path: 'calendar', component: () => import('pages/dashboard/CalendarPage.vue') },
    ],
    beforeEnter: [isAuthorised],
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('pages/dashboard/HomePage.vue') },
    ],
    beforeEnter: [isAuthorised, isAdmin],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
