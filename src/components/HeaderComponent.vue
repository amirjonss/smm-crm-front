<template>
  <q-header class="app-header">
    <q-toolbar class="header-toolbar">
      <div class="header-container">
        <!-- Logo/Brand -->
        <router-link to="/" class="header-brand">
          <img src="~assets/logo.svg" alt="KH Agency" class="header-logo" />
        </router-link>

        <q-space />

        <!-- Settings menu -->
        <q-btn
          flat
          round
          icon="settings"
          class="settings-btn"
        >
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
                  <q-item-label class="text-weight-bold user-name-label">{{ shortName }}</q-item-label>
                  <q-item-label caption class="user-email-label">{{ userStore.getUser.email }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

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
          <q-tooltip>Настройки</q-tooltip>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { useUserStore } from 'stores/user.js'
import { useAuthStore } from 'stores/auth.js'
import { useThemeStore } from 'stores/theme.js'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const authStore = useAuthStore()
const userStore = useUserStore()
const themeStore = useThemeStore()
const router = useRouter()

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
.app-header {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 20px rgba(0, 0, 0, 0.05) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.body--dark .app-header {
  background: rgba(30, 41, 59, 0.7) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 20px rgba(0, 0, 0, 0.2) !important;
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
  text-decoration: none;
}

.header-logo {
  height: 32px;
  width: auto;
  display: block;
  
  @media (max-width: 599px) {
    height: 28px;
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
  @media (max-width: 599px) {
    min-height: 40px;
    font-size: 13px;
    
    :deep(.q-item__section--avatar) {
      min-width: 40px;
    }
  }
}

.hide-mobile {
  @media (max-width: 599px) {
    display: none;
  }
}
</style>
