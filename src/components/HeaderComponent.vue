<template>
  <q-header elevated>
    <q-toolbar class="bg-grey-14 text-right">
      <q-toolbar-title class="title">{{
          shortName
      }}</q-toolbar-title>

      <q-btn flat round dense icon="logout" @click="logout">
        <q-tooltip
          transition-show="flip-right"
          transition-hide="flip-left"
        >
          Выход
        </q-tooltip>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { useUserStore } from 'stores/user.js'
import { useAuthStore } from 'stores/auth.js'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()

const shortName = computed(() => {
  const user = userStore.getUser
  if (!user) return ''

  const f = user.familyName ? user.familyName.slice(0, 1) : ''
  const g = user.givenName || ''

  return `${f} ${g}`.trim()
})
function logout() {
  authStore.clearTokens()
  router.push('/login')
}
</script>

<style scoped>
.title {
  font-size: 16px;
}
</style>
