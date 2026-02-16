<template>
  <q-card class="patterns-dialog">
    <div class="patterns-header">
      <div class="patterns-title">Шаблоны карточек</div>
      <q-btn flat round dense icon="close" class="header-close" @click="$emit('close')" />
    </div>

    <div class="patterns-body">
      <div v-if="loading" class="patterns-loading">
        <q-spinner-dots size="30px" color="primary" />
      </div>

      <template v-else>
        <div v-if="patterns.length === 0" class="patterns-empty">Нет доступных шаблонов</div>

        <div v-else class="patterns-list">
          <button
            v-for="pattern in patterns"
            :key="pattern.id"
            class="pattern-item"
            :disabled="submitting"
            @click="$emit('usePattern', pattern)"
          >
            <div class="pattern-name">{{ pattern.name }}</div>
            <div class="pattern-badge">
              <q-icon name="content_copy" size="12px" />
              Шаблон
            </div>
          </button>
        </div>

        <button
          v-if="!isCreating"
          class="create-trigger"
          :disabled="submitting"
          @click="isCreating = true"
        >
          + Создать новый шаблон
        </button>

        <div v-else class="create-section">
          <q-input
            ref="nameInputRef"
            v-model="newPatternName"
            dense
            outlined
            dark
            placeholder="Название шаблона"
            class="name-input"
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
              :disable="!newPatternName.trim()"
              @click="onCreate"
            />
            <q-btn
              flat
              round
              dense
              icon="close"
              class="btn-cancel"
              :disable="submitting"
              @click="cancelCreate"
            />
          </div>
        </div>
      </template>
    </div>

    <div class="patterns-footer">
      <q-btn flat no-caps disable label="Изменить шаблоны" class="btn-edit" />
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
.patterns-dialog {
  width: 340px;
  max-width: 94vw;
  background: rgba(34, 38, 47, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.9);
}

.patterns-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.9rem 0.65rem;
}

.patterns-title {
  font-size: 1rem;
  font-weight: 600;
}

.header-close {
  color: rgba(255, 255, 255, 0.55);
}

.patterns-body {
  padding: 0 0.75rem 0.65rem;
}

.patterns-loading,
.patterns-empty {
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.85rem;
}

.patterns-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pattern-item {
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.65rem 0.7rem;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover:not(:disabled) {
    border-color: rgba(96, 165, 250, 0.5);
    background: rgba(59, 130, 246, 0.12);
  }
}

.pattern-name {
  font-size: 0.85rem;
  line-height: 1.4;
}

.pattern-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.45rem;
  font-size: 0.72rem;
  color: #60a5fa;
  background: rgba(37, 99, 235, 0.2);
  padding: 0.15rem 0.38rem;
  border-radius: 999px;
}

.create-trigger {
  margin-top: 0.6rem;
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.3rem 0.15rem;
  font-size: 0.82rem;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: #fff;
  }
}

.create-section {
  margin-top: 0.6rem;
}

.name-input {
  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 8px;
  }
}

.create-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.btn-add {
  background: #60a5fa;
  color: #0f172a;
  font-weight: 600;
}

.btn-cancel {
  color: rgba(255, 255, 255, 0.55);
}

.patterns-footer {
  padding: 0 0.75rem 0.75rem;
}

.btn-edit {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}
</style>
