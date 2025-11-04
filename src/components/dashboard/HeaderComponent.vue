<template>
  <q-header elevated :class="$q.dark.isActive ? 'bg-secondary' : 'bg-grey-14'">
    <q-toolbar>
      <q-btn flat @click="emit('update:drawer', !props.drawer)" round dense icon="menu" />
      <q-toolbar-title>Kh system</q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>

<script setup>
const props = defineProps({
  drawer: Boolean
})
const emit = defineEmits(['update:drawer'])
</script>

<style scoped></style>
