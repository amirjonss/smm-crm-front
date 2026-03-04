<template>
  <div class="add-list-wrapper">
    <div v-if="!isExpanded" class="add-list-trigger" @click="expand">
      <q-icon name="add" size="20px" />
      <span>Добавить список</span>
    </div>

    <div v-else class="add-list-form">
      <q-input
        ref="inputRef"
        v-model="listName"
        outlined
        dense
        placeholder="Название списка..."
        class="list-name-input"
        @keydown.enter.prevent="submit"
        @keydown.escape="collapse"
      />

      <div class="add-list-actions">
        <q-btn
          unelevated
          dense
          label="Добавить"
          no-caps
          :disable="!listName.trim()"
          class="btn-add"
          @click="submit"
        />
        <q-btn flat dense round icon="close" size="sm" class="btn-close" @click="collapse" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const emit = defineEmits(['add'])

const isExpanded = ref(false)
const listName = ref('')
const inputRef = ref(null)

function expand() {
  isExpanded.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function collapse() {
  isExpanded.value = false
  listName.value = ''
}

function submit() {
  if (!listName.value.trim()) return
  emit('add', { name: listName.value.trim() })
  listName.value = ''
  nextTick(() => {
    inputRef.value?.focus()
  })
}
</script>

<style scoped lang="scss">
.add-list-wrapper {
  flex-shrink: 0;
  width: 280px;
  min-width: 280px;
  height: 100%;
}

.add-list-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: rgba(139, 92, 246, 0.5);
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.08);
  }
}

.add-list-form {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 0.75rem;
}

.list-name-input {
  margin-bottom: 0.5rem;

  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  :deep(.q-field__native) {
    color: #fff;
  }
}

.add-list-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.btn-add {
  font-size: 0.8125rem;
  padding: 0.25rem 0.75rem;
  background: rgba(139, 92, 246, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #fff;

  &:hover {
    background: rgba(139, 92, 246, 0.45);
  }
}

.btn-close {
  color: rgba(255, 255, 255, 0.4);
}
</style>
