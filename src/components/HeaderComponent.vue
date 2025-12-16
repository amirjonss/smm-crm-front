<template>
  <q-header class="app-header">
    <q-toolbar class="header-toolbar">
      <!-- Logo/Brand -->
      <div class="header-brand">
        <div class="brand-icon-sm">
          <q-icon name="dashboard" size="1.25rem" color="white" />
        </div>
        <span class="brand-name hide-mobile">CRM</span>
      </div>

      <q-space />

      <!-- User info -->
      <div class="header-user" v-if="userStore.getUser">
        <q-avatar size="36px" color="primary" text-color="white" class="user-avatar">
          {{ userInitial }}
        </q-avatar>
        <span class="user-name hide-mobile">{{ shortName }}</span>
      </div>

      <!-- Theme toggle -->
      <theme-toggle />

      <!-- Logout button -->
      <q-btn
        flat
        round
        icon="logout"
        @click="logout"
        class="logout-btn"
      >
        <q-tooltip>Выход</q-tooltip>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { useUserStore } from 'stores/user.js'
import { useAuthStore } from 'stores/auth.js'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import ThemeToggle from 'components/ThemeToggle.vue'

const authStore = useAuthStore()
const userStore = useUserStore()
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
  padding: 0 1.5rem;

  @media (max-width: 599px) {
    padding: 0 0.75rem;
    height: 56px;
    gap: 0.5rem;
  }
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 599px) {
    gap: 0.5rem;
  }
}

.brand-icon-sm {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 599px) {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  
  @media (max-width: 599px) {
    font-size: 1rem;
  }
}

.header-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-right: 0.5rem;
  
  @media (max-width: 599px) {
    gap: 0.5rem;
    margin-right: 0.25rem;
  }
}

.user-avatar {
  font-weight: 600;
  font-size: 0.875rem;
  
  @media (max-width: 599px) {
    width: 32px !important;
    height: 32px !important;
    font-size: 0.75rem;
  }
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  
  @media (max-width: 599px) {
    font-size: 0.8125rem;
  }
}

.logout-btn {
  color: var(--text-secondary);

  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
}

.hide-mobile {
  @media (max-width: 599px) {
    display: none;
  }
}
</style>
