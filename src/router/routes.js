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
    return { path: '/' }
  }
}

async function isNotAdmin() {
  const user = useUserStore()
  if (!user.loaded) {
    try {
      await user.fetchUser({})
    } catch {
      return { path: '/login' }
    }
  }
  if (user.isAdmin) {
    return { path: '/dashboard' }
  }
}
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/main/IndexPage.vue') }],
    beforeEnter: [isAuthorised, isNotAdmin],
  },
  {
    path: '/dashboard',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [{ path: '', component: () => import('pages/dashboard/HomePage.vue') }],
    beforeEnter: [isAuthorised, isAdmin],
  },
  {
    path: '/projects',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/main/IndexPage.vue') }],
    beforeEnter: [isAuthorised, isNotAdmin],
  },
  {
    path: '/calendar',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/dashboard/CalendarPage.vue') }],
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
