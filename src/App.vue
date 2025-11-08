<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from 'stores/user.js'
const userStore = useUserStore()

onMounted(() => {
  console.log('2')
  userStore.fetchUser()
})
</script>
