<template>
  <q-drawer
    show-if-above
    :width="200"
    :breakpoint="500"
    bordered
    :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
  >
    <q-scroll-area class="fit">
      <q-list>
        <template v-for="(menuItem, index) in menuList" :key="index">
          <q-item
            clickable
            @click="currentPage = menuItem.label"
            :to="menuItem.to"
            :active="menuItem.label === currentPage"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon :name="menuItem.icon" />
            </q-item-section>
            <q-item-section>
              {{ menuItem.label }}
            </q-item-section>
          </q-item>
          <q-separator :key="'sep' + index" v-if="menuItem.separator" />
        </template>
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup>
import { ref } from 'vue'

const menuList = [
  {
    icon: 'home',
    label: 'Главная',
    separator: false,
    to: '/dashboard'
  },
  {
    icon: 'logout',
    label: 'Выйти',
    separator: false,
    to: '/login',
    position: 'bottom'
  }
]
const currentPage = ref('')
</script>

<style scoped></style>
