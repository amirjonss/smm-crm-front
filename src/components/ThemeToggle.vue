<template>
  <q-btn
    flat
    round
    :icon="themeStore.isDark ? 'light_mode' : 'dark_mode'"
    @click="themeStore.toggleTheme"
    class="theme-toggle"
  >
    <q-tooltip>
      {{ themeStore.isDark ? 'Светлая тема' : 'Тёмная тема' }}
    </q-tooltip>
  </q-btn>
</template>

<script setup>
import { useThemeStore } from 'stores/theme.js'

const themeStore = useThemeStore()
</script>

<style scoped>
.theme-toggle {
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}
</style>
