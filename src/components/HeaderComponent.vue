<template>
  <q-header elevated :class="$q.dark.isActive ? 'bg-secondary' : 'bg-black'">
    <q-toolbar class="bg-blue text-white shadow-2">
      <q-btn flat label="Homepage" @click="tab=''"/>

      <q-tabs v-model="tab" shrink >
        <q-tab name="tab1" label="Tab 1" />
        <q-tab name="tab2" label="Tab 2" />
        <q-tab name="tab3" label="Tab 3" />
      </q-tabs>
    </q-toolbar>
  </q-header>
</template>

<script>
import { ref } from 'vue'

export default {
  setup () {
    return {
      tab: ref('')
    }
  }
}
</script>

<style scoped>

</style>
