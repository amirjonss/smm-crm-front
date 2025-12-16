<template>
  <q-layout view="hHh Lpr lff" class="main-layout">
    <header-component />
    <q-page-container class="page-bg">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import HeaderComponent from 'components/HeaderComponent.vue'
</script>

<style scoped>
.main-layout {
  background: var(--bg-primary);
}

.page-bg {
  background: var(--bg-secondary);
  min-height: calc(100vh - 64px);
}
</style>
