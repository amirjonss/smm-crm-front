<template>
  <q-header class="dashboard-header">
    <q-toolbar class="header-toolbar">
      <div class="header-container">
        <!-- Logo/Brand -->
        <router-link to="/dashboard" class="header-brand">
          <img src="~assets/logo.svg" alt="KH Agency" class="header-logo" />
          <span class="brand-badge hide-mobile">Админ</span>
        </router-link>

        <!-- Header Navigation (Desktop) -->
        <div class="header-nav q-ml-md gt-sm">
          <q-btn
            flat
            no-caps
            label="Доски"
            to="/boards"
            class="nav-btn"
            :class="{ 'nav-btn-active': $route.path.startsWith('/boards') }"
          />
          <q-btn
            v-if="userStore.isAdmin || userStore.isSMM"
            flat
            no-caps
            label="Календарь"
            to="/calendar"
            class="nav-btn"
            :class="{ 'nav-btn-active': $route.path === '/calendar' }"
          />
          <q-btn
            v-if="userStore.isAdmin"
            flat
            no-caps
            label="Список проектов"
            to="/dashboard/projects-list"
            class="nav-btn"
            :class="{ 'nav-btn-active': $route.path === '/dashboard/projects-list' }"
          />
        </div>

        <q-space />

        <!-- Settings/Burger menu -->
        <q-btn flat round :icon="$q.screen.lt.md ? 'menu' : 'settings'" class="settings-btn">
          <q-menu auto-close class="settings-menu shadow-10">
            <q-list class="settings-list">
              <!-- User Info Header -->
              <q-item class="user-info-item" v-if="userStore.getUser">
                <q-item-section avatar>
                  <q-avatar size="36px" color="primary" text-color="white" class="user-avatar-menu">
                    {{ userInitial }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold user-name-label">{{
                    shortName
                  }}</q-item-label>
                  <q-item-label caption class="user-email-label">{{
                    userStore.getUser.email
                  }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <!-- Mobile Navigation Links -->
              <template v-if="$q.screen.lt.md">
                <q-item
                  clickable
                  to="/boards"
                  class="menu-item"
                  :class="{ 'menu-item-active': $route.path.startsWith('/boards') }"
                >
                  <q-item-section avatar>
                    <q-icon name="dashboard" size="20px" />
                  </q-item-section>
                  <q-item-section> Доски </q-item-section>
                </q-item>
                <q-item
                  v-if="userStore.isAdmin || userStore.isSMM"
                  clickable
                  to="/calendar"
                  class="menu-item"
                  :class="{ 'menu-item-active': $route.path === '/calendar' }"
                >
                  <q-item-section avatar>
                    <q-icon name="calendar_month" size="20px" />
                  </q-item-section>
                  <q-item-section> Календарь </q-item-section>
                </q-item>
                <q-item
                  v-if="userStore.isAdmin"
                  clickable
                  to="/dashboard/projects-list"
                  class="menu-item"
                  :class="{ 'menu-item-active': $route.path === '/dashboard/projects-list' }"
                >
                  <q-item-section avatar>
                    <q-icon name="list_alt" size="20px" />
                  </q-item-section>
                  <q-item-section> Список проектов </q-item-section>
                </q-item>
                <q-separator />
              </template>

              <q-item clickable @click="themeStore.toggleTheme" class="menu-item">
                <q-item-section avatar>
                  <q-icon :name="themeStore.isDark ? 'light_mode' : 'dark_mode'" size="20px" />
                </q-item-section>
                <q-item-section>
                  {{ themeStore.isDark ? 'Светлая тема' : 'Тёмная тема' }}
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable @click="logout" class="text-negative menu-item">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" size="20px" />
                </q-item-section>
                <q-item-section>Выход</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
          <q-tooltip>{{ $q.screen.lt.md ? 'Меню' : 'Настройки' }}</q-tooltip>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { useUserStore } from 'stores/user.js'
import { useAuthStore } from 'stores/auth.js'
import { useThemeStore } from 'stores/theme.js'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const authStore = useAuthStore()
const router = useRouter()
const $route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()
const $q = useQuasar()

const shortName = computed(() => {
  const user = userStore.getUser
  if (!user) return ''

  const f = user.familyName || ''
  const g = user.givenName || ''

  return `${g} ${f}`.trim()
})

const userInitial = computed(() => {
  const user = userStore.getUser
  if (!user) return ''
  return (user.givenName?.[0] || user.familyName?.[0] || '').toUpperCase()
})

function logout() {
  authStore.clearTokens()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.dashboard-header {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.1),
    0 4px 20px rgba(0, 0, 0, 0.05) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.body--dark .dashboard-header {
  background: rgba(30, 41, 59, 0.7) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.05),
    0 4px 20px rgba(0, 0, 0, 0.2) !important;
}

.header-toolbar {
  height: 64px;
  padding: 0;

  @media (max-width: 599px) {
    height: 56px;
  }
}

.header-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;

  @media (max-width: 599px) {
    padding: 0 1rem;
  }
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.header-logo {
  height: 32px;
  width: auto;
  display: block;
  filter: brightness(0);

  .body--dark & {
    filter: brightness(0) invert(1);
  }

  @media (max-width: 599px) {
    height: 28px;
  }
}

.brand-badge {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  border-radius: 4px;

  @media (max-width: 599px) {
    font-size: 0.5625rem;
    padding: 0.15rem 0.375rem;
  }
}

.nav-btn {
  color: var(--text-secondary);
  font-weight: 500;
  position: relative;
  transition: color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 80%;
    height: 2px;
    background: #8b5cf6;
    transition: transform 0.3s ease;
  }

  &:hover {
    color: var(--text-primary);
  }

  &.q-router-link-active,
  &.q-router-link-exact-active,
  &.nav-btn-active {
    color: #8b5cf6 !important;
    font-weight: 600;

    &::after {
      transform: translateX(-50%) scaleX(1);
    }
  }
}

.settings-btn {
  color: var(--text-secondary);

  &:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }
}

.settings-list {
  min-width: 220px;

  @media (max-width: 599px) {
    min-width: 180px;
  }
}

.user-info-item {
  padding: 12px 16px;

  @media (max-width: 599px) {
    padding: 8px 12px;
  }
}

.user-avatar-menu {
  @media (max-width: 599px) {
    width: 32px !important;
    height: 32px !important;
    font-size: 14px;
  }
}

.user-name-label {
  @media (max-width: 599px) {
    font-size: 13px;
  }
}

.user-email-label {
  @media (max-width: 599px) {
    font-size: 11px;
  }
}

.menu-item {
  position: relative;
  transition: color 0.3s ease;

  @media (max-width: 599px) {
    min-height: 40px;
    font-size: 13px;

    :deep(.q-item__section--avatar) {
      min-width: 40px;
    }
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 3px;
    height: 0;
    background: #8b5cf6 !important;
    transition: height 0.3s ease;
  }

  &.q-router-link-active,
  &.q-router-link-exact-active,
  &.menu-item-active {
    color: #8b5cf6 !important;
    font-weight: 600;

    &::after {
      height: 100%;
      background: #8b5cf6 !important;
    }

    :deep(.q-icon) {
      color: #8b5cf6 !important;
    }

    :deep(.q-item__section) {
      color: #8b5cf6 !important;
    }
  }
}

.hide-mobile {
  @media (max-width: 599px) {
    display: none;
  }
}
</style>
