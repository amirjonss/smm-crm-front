<template>
  <q-layout view="lHh Lpr lFf">
    <header-component />
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import HeaderComponent from 'components/HeaderComponent.vue'
</script>
