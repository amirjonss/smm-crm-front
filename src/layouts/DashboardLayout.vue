<template>
  <q-layout view="hHh Lpr lff" class="dashboard-layout">
    <dashboard-header-component />
    <q-page-container class="page-bg">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import DashboardHeaderComponent from 'components/dashboard/DashboardHeaderComponent.vue'
</script>

<style scoped>
.dashboard-layout {
  background: var(--bg-primary);
}

.page-bg {
  background: var(--bg-secondary);
  min-height: calc(100vh - 64px);
}
</style>
