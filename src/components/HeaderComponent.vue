<template>
  <q-header elevated>
    <q-toolbar class="bg-grey-14 text-right">
      <q-toolbar-title class="title">{{
        userStore.getUser?.familyName?.slice(0, 1) + ' ' + userStore.getUser.givenName
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

const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()
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
