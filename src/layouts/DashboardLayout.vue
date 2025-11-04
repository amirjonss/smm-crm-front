<template>
  <div>
    <q-layout view="hHh Lpr lff" class="shadow-2">
      <header-component v-model:drawer="drawer"/>
      <sidebar-component v-model="drawer"/>

      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HeaderComponent from 'components/dashboard/HeaderComponent.vue'
import SidebarComponent from 'components/dashboard/SidebarComponent.vue'

const drawer = ref(false)
</script>
