<template>
  <div class="stat-card">
    <div class="stat-icon" :class="`stat-icon-${color}`">
      <q-icon :name="icon" size="1.5rem" />
    </div>
    <div class="stat-content">
      <span class="stat-value">{{ value }}</span>
      <span class="stat-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  value: { type: [Number, String], required: true },
  label: { type: String, required: true },
  color: { type: String, default: 'blue' },
})
</script>

<style scoped lang="scss">
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;

  &.stat-icon-blue {
    background: rgba(33, 150, 243, 0.15);
    color: #2196f3;
  }

  &.stat-icon-green {
    background: rgba(76, 175, 80, 0.15);
    color: #4caf50;
  }

  &.stat-icon-orange {
    background: rgba(255, 152, 0, 0.15);
    color: #ff9800;
  }

  &.stat-icon-purple {
    background: rgba(156, 39, 176, 0.15);
    color: #9c27b0;
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
