<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="dialog-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ board ? 'Редактировать доску' : 'Создать доску' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit.prevent="save">
          <div class="form-group q-mb-lg">
            <label class="form-label">Название доски</label>
            <q-input
              v-model="form.name"
              outlined
              placeholder="Введите название"
              autofocus
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Заполните поле']"
              class="modern-input"
            />
          </div>

          <div class="form-actions row justify-end q-gutter-sm">
            <q-btn flat label="Отмена" color="grey-7" v-close-popup class="btn-cancel" />
            <q-btn
              type="submit"
              :label="board ? 'Сохранить' : 'Создать'"
              unelevated
              color="primary"
              class="btn-primary-action"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  board: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'save'])

const form = ref({ name: '' })

watch(
  () => props.board,
  (val) => {
    form.value.name = val?.name || ''
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  (open) => {
    if (open && !props.board) {
      form.value.name = ''
    }
  },
)

function save() {
  emit('save', { ...form.value })
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.dialog-card {
  width: 450px;
  max-width: 95vw;
  border-radius: 20px;
  background: rgba(20, 18, 50, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  color: #fff;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}

.modern-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.modern-input :deep(.q-field__native) {
  color: #fff;
}

.btn-primary-action {
  background: rgba(139, 92, 246, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: white;
  font-weight: 500;
  padding: 0.625rem 1.5rem;

  &:hover {
    background: rgba(139, 92, 246, 0.45);
  }
}

.btn-cancel {
  color: rgba(255, 255, 255, 0.5);
}
</style>
