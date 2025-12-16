<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from 'stores/user.js'
import { useThemeStore } from 'stores/theme.js'

const userStore = useUserStore()
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
  userStore.fetchUser()
})
</script>
