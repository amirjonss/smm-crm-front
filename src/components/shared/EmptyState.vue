<template>
  <div class="empty-state">
    <q-icon :name="icon" class="empty-state-icon" />
    <p class="empty-state-text">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'inbox' },
  message: { type: String, required: true },
})
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-state-icon {
  font-size: 3rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state-text {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}
</style>
