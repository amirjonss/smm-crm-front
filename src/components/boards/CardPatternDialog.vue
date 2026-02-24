<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    maximized
    transition-show="scale"
    transition-hide="scale"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="pattern-dialog-overlay" @click.self="close">
      <div class="pattern-dialog-container">
        <div class="pattern-top-bar">
          <q-space />
          <q-btn flat round dense icon="close" class="top-btn" @click="close" />
        </div>

        <div class="pattern-body">
          <div class="pattern-main">
            <div class="card-title-area">
              <q-input
                v-model="form.name"
                borderless
                autogrow
                class="title-input"
                placeholder="Название шаблона"
              />
            </div>

            <div class="action-chips">
              <q-btn flat dense no-caps class="action-chip">
                <q-icon name="event" size="16px" class="q-mr-xs" />
                Даты

                <q-popup-proxy v-model="showDeadlinePicker" :breakpoint="600">
                  <div class="dl-panel">
                    <div class="dl-header">
                      <span>Даты</span>
                      <q-btn v-close-popup flat round dense icon="close" size="xs" class="dl-close" />
                    </div>

                    <q-date
                      v-model="deadlineDate"
                      mask="YYYY-MM-DD"
                      minimal
                      flat
                      class="dl-calendar"
                    />

                    <div class="dl-body">
                      <div class="dl-label">Срок</div>
                      <div class="dl-row">
                        <q-checkbox v-model="deadlineEnabled" dense size="sm" color="blue" />
                        <div class="dl-date" :class="{ disabled: !deadlineEnabled }">
                          {{ deadlineFormatted }}
                        </div>
                        <input
                          v-model="deadlineTime"
                          type="text"
                          maxlength="5"
                          placeholder="00:00"
                          class="dl-time"
                          :disabled="!deadlineEnabled"
                          @input="onTimeInput"
                        />
                      </div>

                      <q-btn
                        unelevated
                        no-caps
                        label="Сохранить"
                        class="dl-save"
                        @click="saveDeadline"
                      />
                      <q-btn
                        v-if="form.deadline"
                        flat
                        no-caps
                        label="Удалить"
                        class="dl-delete"
                        @click="deleteDeadline"
                      />
                    </div>
                  </div>
                </q-popup-proxy>
              </q-btn>
            </div>

            <div class="card-section">
              <div class="section-header">
                <q-icon name="subject" size="20px" class="section-icon" />
                <span class="section-title">Описание шаблона</span>
              </div>

              <div class="description-editor-wrap">
                <div class="desc-editor-toolbar-row">
                  <div class="editor-toolbar-heading">
                    <heading-dropdown :editor-ref="descEditorRef" />
                  </div>
                  <q-editor
                    ref="descEditorRef"
                    v-model="form.description"
                    :toolbar="descToolbar"
                    flat
                    min-height="220px"
                    content-class="desc-editor-content"
                    toolbar-bg="transparent"
                    class="description-editor"
                    placeholder="Добавьте описание шаблона..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pattern-footer">
          <q-btn flat no-caps label="Отмена" class="cancel-btn" @click="close" />
          <q-btn
            unelevated
            no-caps
            label="Сохранить шаблон"
            class="save-btn"
            :loading="saving"
            :disable="!form.name.trim()"
            @click="save"
          />
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import HeadingDropdown from 'components/boards/HeadingDropdown.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  pattern: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])

const showDeadlinePicker = ref(false)
const deadlineDate = ref('')
const deadlineTime = ref('12:00')
const deadlineEnabled = ref(false)
const descEditorRef = ref(null)

const form = ref({
  name: '',
  description: '',
  deadline: null,
})

const descToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['left', 'center', 'right', 'justify'],
  ['unordered', 'ordered', 'outdent', 'indent'],
  ['link', 'hr', 'removeFormat'],
]

const deadlineFormatted = computed(() => {
  if (!deadlineDate.value) return 'ДД.ММ.ГГГГ'
  const d = new Date(deadlineDate.value + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
})

watch(
  () => props.pattern,
  (pattern) => {
    form.value = {
      name: pattern?.name || '',
      description: pattern?.description || '',
      deadline: pattern?.deadline || null,
    }

    if (pattern?.deadline) {
      deadlineDate.value = pattern.deadline.slice(0, 10)
      deadlineTime.value = pattern.deadline.slice(11, 16) || '12:00'
      deadlineEnabled.value = true
    } else {
      deadlineDate.value = ''
      deadlineTime.value = '12:00'
      deadlineEnabled.value = false
    }
  },
  { immediate: true },
)

watch(deadlineDate, (value) => {
  if (value) {
    deadlineEnabled.value = true
    if (!deadlineTime.value) {
      deadlineTime.value = '12:00'
    }
  }
})

function close() {
  emit('update:modelValue', false)
}

function saveDeadline() {
  if (deadlineEnabled.value && deadlineDate.value) {
    form.value.deadline = deadlineDate.value + 'T' + (deadlineTime.value || '12:00') + ':00+00:00'
  } else {
    form.value.deadline = null
  }
  showDeadlinePicker.value = false
}

function deleteDeadline() {
  form.value.deadline = null
  deadlineEnabled.value = false
  showDeadlinePicker.value = false
}

function save() {
  emit('save', {
    name: form.value.name.trim(),
    description: form.value.description || null,
    deadline: form.value.deadline || null,
  })
}

function onTimeInput(e) {
  let v = e.target.value.replace(/[^\d]/g, '').slice(0, 4)
  if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2)
  deadlineTime.value = v
  e.target.value = v
}
</script>

<style scoped lang="scss">
.pattern-dialog-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.pattern-dialog-container {
  width: 100%;
  max-width: 920px;
  max-height: calc(100vh - 4rem);
  background: rgba(20, 18, 50, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pattern-top-bar {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.top-btn {
  color: rgba(255, 255, 255, 0.6);
}

.pattern-body {
  flex: 1;
  overflow-y: auto;
}

.pattern-main {
  padding: 1.1rem 1.25rem;
}

.card-title-area {
  margin-bottom: 0.8rem;
}

.title-input {
  :deep(.q-field__native) {
    font-size: 2rem;
    line-height: 1.15;
    font-weight: 700;
    color: #fff;
  }
}

.action-chips {
  margin-bottom: 1rem;
}

.action-chip {
  color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  padding: 0.35rem 0.7rem;
}

.dl-panel {
  width: 320px;
  max-width: 94vw;
  border-radius: 14px;
  background: rgba(20, 18, 50, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.65rem;
}

.dl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  margin-bottom: 0.35rem;
}

.dl-body {
  margin-top: 0.45rem;
}

.dl-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.35rem;
}

.dl-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dl-date {
  color: #fff;
  font-size: 0.85rem;

  &.disabled {
    opacity: 0.45;
  }
}

.dl-time {
  width: 74px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  padding: 0 0.45rem;
}

.dl-save {
  margin-top: 0.55rem;
  background: rgba(59, 130, 246, 0.9);
  color: #fff;
}

.dl-delete {
  margin-top: 0.35rem;
  color: #f87171;
}

.card-section {
  margin-top: 0.7rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.5rem;
}

.section-icon,
.section-title {
  color: rgba(255, 255, 255, 0.9);
}

.section-title {
  font-weight: 600;
}

.description-editor-wrap {
  position: relative;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #141233;
}

.desc-editor-toolbar-row {
  padding: 0.4rem;
}

.editor-toolbar-heading {
  position: absolute;
  top: 0.62rem;
  left: 0.55rem;
  z-index: 3;
}

.description-editor {
  background: #141233 !important;

  :deep(.q-editor__toolbars-container) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: #141233 !important;
  }

  :deep(.q-editor__toolbar) {
    background: #141233 !important;
  }

  :deep(.q-editor__toolbar:first-child) {
    padding-left: 2.2rem;
  }

  :deep(.q-editor__content-container) {
    background: #141233 !important;
  }

  :deep(.q-editor__content) {
    color: #fff;
    min-height: 200px;
    background: #141233 !important;
  }
}

.pattern-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.cancel-btn {
  color: rgba(255, 255, 255, 0.7);
}

.save-btn {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: #fff;
  font-weight: 600;
}
</style>
