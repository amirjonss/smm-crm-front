<template>
  <div>
    <q-layout view="hHh Lpr lff" class="shadow-2">
      <dashboard-header-component v-model:drawer="drawer"/>
<!--      <sidebar-component v-model="drawer"/>-->

      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DashboardHeaderComponent from 'components/dashboard/DashboardHeaderComponent.vue'
// import SidebarComponent from 'components/dashboard/SidebarComponent.vue'

const drawer = ref(true)
</script>
