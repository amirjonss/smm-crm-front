<template>
  <q-card class="patterns-popover-card">
    <div class="popover-header">
      <span class="header-title">Шаблоны карточек</span>
      <q-btn flat round dense icon="close" size="xs" class="close-btn" @click="$emit('close')" />
    </div>

    <div class="popover-body">
      <!-- Loading state -->
      <div v-if="loading" class="state-container">
        <q-spinner-dots size="24px" color="grey-5" />
      </div>

      <!-- Empty state -->
      <div v-else-if="patterns.length === 0 && !isCreating" class="state-container empty">
        <span class="empty-text">Нет доступных шаблонов</span>
      </div>

      <!-- Patterns List -->
      <div v-if="patterns.length > 0 && !isCreating" class="patterns-list">
        <div
          v-for="pattern in patterns"
          :key="pattern.id"
          class="pattern-item"
          @click="$emit('usePattern', pattern)"
        >
          <div class="pattern-name">{{ pattern.name }}</div>
          <div class="pattern-meta">
            <div class="pattern-badge">
              <q-icon name="dashboard" size="12px" class="q-mr-xs" />
              <span>Шаблон</span>
            </div>
            <q-icon name="subject" size="14px" class="q-ml-sm text-grey-6" />
          </div>
        </div>
      </div>

      <!-- Create Trigger -->
      <button
        v-if="!isCreating"
        class="create-trigger-btn"
        @click="isCreating = true"
      >
        <q-icon name="add" size="16px" class="q-mr-xs" />
        Создать новый шаблон
      </button>

      <!-- Create Form -->
      <div v-else class="create-form">
        <q-input
          ref="nameInputRef"
          v-model="newPatternName"
          dense
          outlined
          dark
          placeholder="Название шаблона..."
          class="create-input"
          :disable="submitting"
          @keydown.enter.prevent="onCreate"
          @keydown.escape="cancelCreate"
        />
        <div class="create-actions">
          <q-btn
            unelevated
            no-caps
            label="Добавить"
            class="btn-add"
            :loading="submitting"
            @click="onCreate"
          />
          <q-btn flat dense no-caps label="Отмена" class="btn-cancel" @click="cancelCreate" />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const props = defineProps({
  patterns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['usePattern', 'createPattern', 'close'])

const isCreating = ref(false)
const newPatternName = ref('')
const nameInputRef = ref(null)

watch(
  () => props.open,
  (value) => {
    if (!value) {
      isCreating.value = false
      newPatternName.value = ''
    }
  },
)

watch(isCreating, (creating) => {
  if (creating) {
    nextTick(() => nameInputRef.value?.focus())
  }
})

function onCreate() {
  const name = newPatternName.value.trim()
  if (!name) return
  emit('createPattern', name)
}

function cancelCreate() {
  isCreating.value = false
  newPatternName.value = ''
}
</script>

<style scoped lang="scss">
.patterns-popover-card {
  width: 260px;
  background: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  color: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem 0.5rem;
  position: relative;
}

.header-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  width: 100%;
  text-align: center;
}

.close-btn {
  position: absolute;
  right: 0.5rem;
  top: 0.65rem;
  color: rgba(255, 255, 255, 0.4);
  &:hover { color: #fff; }
}

.popover-body {
  padding: 0.5rem 0.75rem;
  max-height: 320px;
  overflow-y: auto;

  /* Slim scrollbar for better look */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
}

.state-container {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0;
}

.empty-text {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.4);
}

.patterns-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.pattern-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 0.75rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.pattern-name {
  font-size: 0.8125rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.pattern-meta {
  display: flex;
  align-items: center;
}

.pattern-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
  font-size: 0.6875rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.create-trigger-btn {
  width: 100%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8125rem;
  padding: 0.5rem 0;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;

  &:hover {
    color: #fff;
  }
}

.create-form {
  padding: 0.25rem 0;
}

.create-input {
  margin-bottom: 0.5rem;
  :deep(.q-field__control) {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
}

.create-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-add {
  background: #2563eb;
  color: #fff;
  font-size: 0.75rem;
}

.btn-cancel {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
}
</style>
