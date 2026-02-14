<template>
  <div class="add-card-wrapper">
    <div v-if="!isExpanded" class="add-card-trigger" @click="expand">
      <q-icon name="add" size="18px" />
      <span>Добавить карточку</span>
    </div>

    <div v-else class="add-card-form">
      <q-input
        ref="inputRef"
        v-model="cardName"
        outlined
        dense
        autogrow
        placeholder="Введите название карточки..."
        class="card-name-input"
        @keydown.enter.prevent="submit"
        @keydown.escape="collapse"
      />
      <div class="add-card-actions">
        <q-btn
          unelevated
          dense
          label="Добавить"
          no-caps
          :disable="!cardName.trim()"
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
const cardName = ref('')
const inputRef = ref(null)

function expand() {
  isExpanded.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function collapse() {
  isExpanded.value = false
  cardName.value = ''
}

function submit() {
  if (!cardName.value.trim()) return
  emit('add', cardName.value.trim())
  cardName.value = ''
  nextTick(() => {
    inputRef.value?.focus()
  })
}
</script>

<style scoped lang="scss">
.add-card-trigger {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8125rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
  }
}

.add-card-form {
  padding: 0.5rem;
}

.card-name-input {
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

.add-card-actions {
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
