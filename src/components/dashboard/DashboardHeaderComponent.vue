<template>
  <q-header elevated :class="$q.dark.isActive ? 'bg-secondary' : 'bg-grey-14'">
    <q-toolbar>
<!--      <q-btn flat @click="emit('update:drawer', !props.drawer)" round dense icon="menu" />-->
      <q-toolbar-title class="text-left title">Админ панель</q-toolbar-title>
      <q-toolbar-title class="text-right title">{{ shortName }}</q-toolbar-title>
      <q-btn flat round dense icon="logout" @click="logout">
        <q-tooltip transition-show="flip-right" transition-hide="flip-left"> Выход </q-tooltip>
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
const router = useRouter()
const userStore = useUserStore()
// const emit = defineEmits(['update:drawer'])
// const props = defineProps({
//   drawer: Boolean,
// })
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
  font-size: 15px;
}
</style>
